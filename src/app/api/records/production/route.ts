import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, date, milkYield, eggCount, notes } = await req.json();

    if (!animalId || (milkYield === undefined && eggCount === undefined)) {
      return NextResponse.json({ error: 'Missing animal ID or production yield metrics' }, { status: 400 });
    }

    // Verify ownership
    const farm = await prisma.farm.findFirst({ where: { farmerId: user.id } });
    const animal = await prisma.animal.findUnique({ where: { id: parseInt(animalId) } });

    if (!animal || !farm || animal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    if (animal.gender === 'MALE') {
      return NextResponse.json(
        { error: 'Production logging is not available for male animals. Only female livestock can record milk or egg yields.' },
        { status: 400 }
      );
    }

    const record = await prisma.productionRecord.create({
      data: {
        animalId: parseInt(animalId),
        date: date ? new Date(date) : new Date(),
        milkYield: milkYield ? parseFloat(milkYield) : null,
        eggCount: eggCount ? parseInt(eggCount) : null,
        notes,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error logging production record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
