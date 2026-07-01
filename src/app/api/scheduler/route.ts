import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch all schedule events (vaccinations, deworming, etc.) for the farmer's farm
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farm = await prisma.farm.findFirst({
      where: { farmerId: user.id },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm profile not found' }, { status: 404 });
    }

    const scheduleEvents = await prisma.scheduleEvent.findMany({
      where: { farmId: farm.id },
      include: { animal: true },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ success: true, scheduleEvents });
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new schedule event
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farm = await prisma.farm.findFirst({
      where: { farmerId: user.id },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { animalId, type, title, dueDate, notes } = body;

    if (!type || !title || !dueDate) {
      return NextResponse.json({ error: 'Missing type, title, or dueDate' }, { status: 400 });
    }

    const event = await prisma.scheduleEvent.create({
      data: {
        farmId: farm.id,
        animalId: animalId ? parseInt(animalId) : null,
        type,
        title,
        dueDate: new Date(dueDate),
        notes: notes || null,
        completed: false,
      },
    });

    // Create an in-app Notification for this reminder
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Scheduled ${type.toLowerCase()}: ${title}`,
        message: `A new ${type.toLowerCase()} event has been scheduled for ${new Date(dueDate).toLocaleDateString()}.`,
        type: type === 'VACCINATION' ? 'VACCINATION' : (type === 'DEWORMING' ? 'DEWORMING' : 'APPOINTMENT'),
        animalId: animalId ? parseInt(animalId) : null,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error creating schedule event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Mark a schedule event as completed (and automatically sync with animal health records)
export async function PUT(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, completed, notes, cost } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing schedule event ID' }, { status: 400 });
    }

    const eventId = parseInt(id);
    const existingEvent = await prisma.scheduleEvent.findUnique({
      where: { id: eventId },
      include: { animal: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Schedule event not found' }, { status: 404 });
    }

    const updatedEvent = await prisma.scheduleEvent.update({
      where: { id: eventId },
      data: {
        completed: !!completed,
        completedDate: completed ? new Date() : null,
        notes: notes || existingEvent.notes,
      },
    });

    // If marked as completed and has an animal ID, automatically insert into HealthRecord
    if (completed && existingEvent.animalId) {
      await prisma.healthRecord.create({
        data: {
          animalId: existingEvent.animalId,
          type: existingEvent.type === 'VACCINATION' ? 'VACCINATION' : 'TREATMENT',
          title: existingEvent.title,
          notes: notes || `Completed scheduled event. Notes: ${existingEvent.notes || 'none'}`,
          cost: cost ? parseFloat(cost) : 0.0,
        },
      });

      // If there is cost, automatically log it as an expense under Financials
      if (cost && parseFloat(cost) > 0) {
        await prisma.transaction.create({
          data: {
            farmId: existingEvent.farmId,
            type: 'EXPENSE',
            category: 'MEDICATION',
            amount: parseFloat(cost),
            description: `Expense from completing scheduled task: ${existingEvent.title}`,
            date: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error updating schedule event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
