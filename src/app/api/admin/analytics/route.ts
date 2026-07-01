import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });
    const totalVets = await prisma.user.count({ where: { role: 'VET' } });
    const pendingVets = await prisma.user.count({ where: { role: 'VET', status: 'PENDING' } });
    const totalAnimals = await prisma.animal.count();

    // Calculate total revenue from successful payments
    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Active subscriptions count
    const now = new Date();
    const activeSubs = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now },
      },
    });

    const basicSubs = await prisma.subscription.count({
      where: { plan: 'BASIC', status: 'ACTIVE', endDate: { gte: now } },
    });
    const standardSubs = await prisma.subscription.count({
      where: { plan: 'STANDARD', status: 'ACTIVE', endDate: { gte: now } },
    });
    const premiumSubs = await prisma.subscription.count({
      where: { plan: 'PREMIUM', status: 'ACTIVE', endDate: { gte: now } },
    });

    // Aggregates of animal distributions
    const animalTypesRaw = await prisma.animal.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });
    const animalTypes = animalTypesRaw.map((a) => ({
      type: a.type,
      count: a._count.id,
    }));

    // List recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalFarmers,
        totalVets,
        pendingVets,
        totalAnimals,
        totalRevenue,
        activeSubs,
        planDistribution: {
          BASIC: basicSubs,
          STANDARD: standardSubs,
          PREMIUM: premiumSubs,
        },
        animalTypes,
        recentPayments,
      },
    });
  } catch (error) {
    console.error('Error compiling admin analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
