import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Retrieve appointments or search for available veterinarians
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Action: Get list of veterinarians available
    if (action === 'getVets') {
      const county = searchParams.get('county') || undefined;
      const specialization = searchParams.get('specialization') || undefined;

      const vets = await prisma.user.findMany({
        where: {
          role: 'VET',
          status: 'ACTIVE', // Approved only
          county: county || undefined,
          specialization: specialization ? { contains: specialization } : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          county: true,
          subCounty: true,
          specialization: true,
          qualification: true,
          licenseNumber: true,
        },
      });

      return NextResponse.json({ success: true, vets });
    }

    // Default: Retrieve appointments based on role
    if (user.role === 'FARMER') {
      const appointments = await prisma.appointment.findMany({
        where: { farmerId: user.id },
        include: {
          animal: {
            select: { id: true, name: true, tagNumber: true, type: true },
          },
          veterinarian: {
            select: { id: true, name: true, phone: true, email: true, county: true },
          },
          vetReport: true,
        },
        orderBy: { preferredDate: 'desc' },
      });
      return NextResponse.json({ success: true, appointments });
    }

    if (user.role === 'VET') {
      const appointments = await prisma.appointment.findMany({
        where: { veterinarianId: user.id },
        include: {
          animal: {
            select: { id: true, name: true, tagNumber: true, type: true, breed: true, weight: true },
          },
          farmer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          vetReport: true,
        },
        orderBy: { preferredDate: 'desc' },
      });
      return NextResponse.json({ success: true, appointments });
    }

    if (user.role === 'ADMIN') {
      const appointments = await prisma.appointment.findMany({
        include: {
          animal: {
            select: { id: true, name: true, tagNumber: true },
          },
          farmer: {
            select: { name: true },
          },
          veterinarian: {
            select: { name: true },
          },
        },
        orderBy: { preferredDate: 'desc' },
      });
      return NextResponse.json({ success: true, appointments });
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Book a new veterinary appointment
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { veterinarianId, animalId, preferredDate, urgency, symptoms } = body;

    if (!veterinarianId || !animalId || !preferredDate || !urgency || !symptoms) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // Verify animal ownership
    const farm = await prisma.farm.findFirst({ where: { farmerId: user.id } });
    const animal = await prisma.animal.findUnique({ where: { id: parseInt(animalId) } });

    if (!animal || !farm || animal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    // Get veterinarian details to copy geographical/specialization bounds
    const vet = await prisma.user.findFirst({
      where: { id: parseInt(veterinarianId), role: 'VET', status: 'ACTIVE' },
    });

    if (!vet) {
      return NextResponse.json({ error: 'Selected veterinarian is not active or not found' }, { status: 404 });
    }

    // Check if farmer is subscribed (Standard or Premium required for vet bookings)
    const subscription = await prisma.subscription.findFirst({
      where: { farmerId: user.id },
      orderBy: { endDate: 'desc' },
    });

    const activePlan = subscription && new Date(subscription.endDate) > new Date() && subscription.status === 'ACTIVE'
      ? subscription.plan
      : 'BASIC';

    if (activePlan === 'BASIC') {
      return NextResponse.json(
        { error: 'Veterinarian access requires a Standard or Premium subscription. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        farmerId: user.id,
        veterinarianId: vet.id,
        animalId: animal.id,
        preferredDate: new Date(preferredDate),
        urgency,
        status: 'PENDING',
        symptoms,
        county: vet.county || farm.county,
        subCounty: vet.subCounty || farm.subCounty,
        specialization: vet.specialization || '',
      },
    });

    // Create notifications for the veterinarian
    await prisma.notification.create({
      data: {
        userId: vet.id,
        title: 'New Appointment Booked',
        message: `Farmer ${user.name} has requested an appointment for animal ${animal.name} on ${new Date(preferredDate).toLocaleDateString()}.`,
        type: 'APPOINTMENT',
        animalId: animal.id,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
