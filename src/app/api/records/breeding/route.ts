import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { animalId, type, date, details, result, nextActionDate } = await req.json();

    if (!animalId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const farm = await prisma.farm.findFirst({ where: { farmerId: user.id } });
    const animal = await prisma.animal.findUnique({ where: { id: parseInt(animalId) } });

    if (!animal || !farm || animal.farmId !== farm.id) {
      return NextResponse.json({ error: 'Animal not found or unauthorized' }, { status: 403 });
    }

    const record = await prisma.breedingRecord.create({
      data: {
        animalId: parseInt(animalId),
        type,
        date: date ? new Date(date) : new Date(),
        details,
        result,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
      },
    });

    // Create notifications for heat/pregnancy checks
    if (type === 'PREGNANCY_CHECK' && result === 'PREGNANT') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Pregnancy Confirmed',
          message: `${animal.name} (${animal.tagNumber}) is confirmed pregnant. Expected calving/lambing due around ${nextActionDate ? new Date(nextActionDate).toLocaleDateString() : 'TBD'}.`,
          type: 'PREGNANCY_CHECK',
          animalId: animal.id,
        },
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error logging breeding record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
