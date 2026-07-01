import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: List all animals for the farmer's farm
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

    const animals = await prisma.animal.findMany({
      where: { farmId: farm.id },
      orderBy: { createdAt: 'desc' },
      include: {
        healthRecords: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        breedingRecords: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        productionRecords: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, animals });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Register a new animal (with subscription validation)
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
      return NextResponse.json({ error: 'Farm profile not found. Please create one.' }, { status: 404 });
    }

    // 1. Validate subscription limits
    const subscription = await prisma.subscription.findFirst({
      where: { farmerId: user.id },
      orderBy: { endDate: 'desc' },
    });

    const activePlan = subscription && new Date(subscription.endDate) > new Date() && subscription.status === 'ACTIVE' 
      ? subscription.plan 
      : 'BASIC'; // default/fallback to basic

    const animalCount = await prisma.animal.count({
      where: { farmId: farm.id, status: 'ACTIVE' },
    });

    if (activePlan === 'BASIC' && animalCount >= 20) {
      return NextResponse.json(
        { error: 'Basic plan limit reached (20 animals). Please upgrade to Standard or Premium to register more livestock.' },
        { status: 403 }
      );
    }

    if (activePlan === 'STANDARD' && animalCount >= 100) {
      return NextResponse.json(
        { error: 'Standard plan limit reached (100 animals). Please upgrade to Premium to register more livestock.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const {
      tagNumber,
      name,
      type,
      breed,
      gender,
      dob,
      color,
      weight,
      fatherTag,
      motherTag,
      purchaseDate,
      purchaseCost,
      status,
      photo,
    } = body;

    if (!tagNumber || !name || !type || !breed || !gender || !dob || !weight) {
      return NextResponse.json({ error: 'Missing required animal information fields' }, { status: 400 });
    }

    const normalizedTag = String(tagNumber).trim().toUpperCase();
    if (!normalizedTag) {
      return NextResponse.json({ error: 'Tag number is required' }, { status: 400 });
    }

    // Duplicate tag numbers are allowed across farms, but not within the same farm
    const existingAnimal = await prisma.animal.findFirst({
      where: { farmId: farm.id, tagNumber: normalizedTag },
    });
    if (existingAnimal) {
      return NextResponse.json(
        { error: `Tag "${normalizedTag}" is already registered on your farm. Choose a different tag for this animal.` },
        { status: 409 }
      );
    }

    const qrCode = `fms-animal-tag:${farm.id}:${normalizedTag}`;

    // 3. Create the animal record
    const animal = await prisma.animal.create({
      data: {
        tagNumber: normalizedTag,
        name,
        type,
        breed,
        gender,
        dob: new Date(dob),
        color,
        weight: parseFloat(weight),
        fatherTag: fatherTag || null,
        motherTag: motherTag || null,
        status: status || 'ACTIVE',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        qrCode,
        photo: photo || null,
        farmId: farm.id,
      },
    });

    // Create a history log entry for animal registration
    await prisma.healthRecord.create({
      data: {
        animalId: animal.id,
        type: 'TREATMENT',
        title: 'Livestock Registration',
        date: new Date(),
        notes: `Animal successfully registered on the FMS platform. Breed: ${breed}, Weight: ${weight}kg.`,
        cost: 0.0,
      },
    });

    // Trigger notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'New Animal Registered',
        message: `${name} (${normalizedTag}) has been added to your herd list.`,
        type: 'SUBSCRIPTION',
        animalId: animal.id,
      },
    });

    return NextResponse.json({ success: true, animal });

  } catch (error: unknown) {
    console.error('Error registering animal:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'This tag number is already registered on your farm.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
