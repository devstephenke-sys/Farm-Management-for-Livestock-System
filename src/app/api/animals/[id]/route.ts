import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch a single animal with full health, breeding, production history and lineage
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json({ error: 'Invalid animal ID' }, { status: 400 });
    }

    // Fetch the animal
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        healthRecords: {
          orderBy: { date: 'desc' },
          include: {
            vetReport: {
              select: {
                id: true,
                temperature: true,
                weight: true,
                heartRate: true,
                respiratoryRate: true,
                diagnosis: true,
                treatmentGiven: true,
                medicationName: true,
                recommendations: true,
              }
            }
          }
        },
        breedingRecords: {
          orderBy: { date: 'desc' },
        },
        productionRecords: {
          orderBy: { date: 'desc' },
          take: 30, // Get last 30 entries
        },
        appointments: {
          orderBy: { preferredDate: 'desc' },
          include: {
            veterinarian: {
              select: {
                name: true,
                phone: true,
                email: true,
              }
            }
          }
        }
      },
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Double check ownership
    if (user.role === 'FARMER') {
      const farm = await prisma.farm.findFirst({
        where: { farmerId: user.id },
      });
      if (!farm || animal.farmId !== farm.id) {
        return NextResponse.json({ error: 'Unauthorized to view this animal' }, { status: 403 });
      }
    }

    // Resolve Lineage Parents
    let father = null;
    let mother = null;

    if (animal.fatherTag) {
      father = await prisma.animal.findFirst({
        where: { tagNumber: animal.fatherTag, farmId: animal.farmId },
        select: { id: true, name: true, tagNumber: true, breed: true },
      });
    }

    if (animal.motherTag) {
      mother = await prisma.animal.findFirst({
        where: { tagNumber: animal.motherTag, farmId: animal.farmId },
        select: { id: true, name: true, tagNumber: true, breed: true },
      });
    }

    const offspring = await prisma.animal.findMany({
      where: {
        farmId: animal.farmId,
        OR: [
          { fatherTag: animal.tagNumber },
          { motherTag: animal.tagNumber },
        ],
      },
      select: { id: true, name: true, tagNumber: true, type: true, breed: true, status: true },
    });

    return NextResponse.json({
      success: true,
      animal,
      lineage: {
        father,
        mother,
        offspring,
      },
    });
  } catch (error) {
    console.error('Error fetching animal details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update animal details
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json({ error: 'Invalid animal ID' }, { status: 400 });
    }

    // Verify animal ownership
    const farm = await prisma.farm.findFirst({
      where: { farmerId: user.id },
    });
    const existingAnimal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!existingAnimal || !farm || existingAnimal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      breed,
      gender,
      dob,
      color,
      weight,
      fatherTag,
      motherTag,
      status,
      purchaseDate,
      purchaseCost,
      photo,
    } = body;

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (breed) updateData.breed = breed;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = new Date(dob);
    if (color !== undefined) updateData.color = color;
    if (weight) updateData.weight = parseFloat(weight);
    if (fatherTag !== undefined) updateData.fatherTag = fatherTag || null;
    if (motherTag !== undefined) updateData.motherTag = motherTag || null;
    if (status) updateData.status = status;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    if (purchaseCost !== undefined) updateData.purchaseCost = purchaseCost ? parseFloat(purchaseCost) : null;
    if (photo !== undefined) updateData.photo = photo || null;

    // Track weight change history
    if (weight && parseFloat(weight) !== existingAnimal.weight) {
      await prisma.healthRecord.create({
        data: {
          animalId: animalId,
          type: 'TREATMENT',
          title: 'Weight Measurement Update',
          notes: `Weight updated from ${existingAnimal.weight}kg to ${weight}kg.`,
          cost: 0.0,
        },
      });
    }

    // Track status change history
    if (status && status !== existingAnimal.status) {
      await prisma.healthRecord.create({
        data: {
          animalId: animalId,
          type: 'TREATMENT',
          title: `Status Changed: ${status}`,
          notes: `Animal status updated from ${existingAnimal.status} to ${status}.`,
          cost: 0.0,
        },
      });
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id: animalId },
      data: updateData,
    });

    return NextResponse.json({ success: true, animal: updatedAnimal });
  } catch (error) {
    console.error('Error updating animal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete animal
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const animalId = parseInt(id);

    if (isNaN(animalId)) {
      return NextResponse.json({ error: 'Invalid animal ID' }, { status: 400 });
    }

    const farm = await prisma.farm.findFirst({
      where: { farmerId: user.id },
    });
    const existingAnimal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!existingAnimal || !farm || existingAnimal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    await prisma.animal.delete({
      where: { id: animalId },
    });

    return NextResponse.json({ success: true, message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
