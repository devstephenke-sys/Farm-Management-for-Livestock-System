import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, type, title, date, notes, cost } = await req.json();

    if (!animalId || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership of the animal
    const farm = await prisma.farm.findFirst({ where: { farmerId: user.id } });
    const animal = await prisma.animal.findUnique({ where: { id: parseInt(animalId) } });

    if (!animal || !farm || animal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    const record = await prisma.healthRecord.create({
      data: {
        animalId: parseInt(animalId),
        type,
        title,
        date: date ? new Date(date) : new Date(),
        notes,
        cost: cost ? parseFloat(cost) : 0.0,
      },
    });

    // Create notification if vaccination or treatment (deworming) is added
    if (type === 'VACCINATION' || title.toLowerCase().includes('deworm')) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: type === 'VACCINATION' ? 'Vaccination Recorded' : 'Deworming Recorded',
          message: `${title} has been logged for ${animal.name} (${animal.tagNumber}).`,
          type: type === 'VACCINATION' ? 'VACCINATION' : 'DEWORMING',
          animalId: animal.id,
        },
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error logging health record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
