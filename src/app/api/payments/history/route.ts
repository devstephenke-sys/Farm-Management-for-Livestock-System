import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/api';
import { UserRole, SubscriptionPlan, PaymentStatus } from '@prisma/client';

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

// GET /api/payments/history?page=1&limit=5&search=
export const GET = withAuth([UserRole.FARMER, UserRole.ADMIN, UserRole.VET])(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  const search = (searchParams.get('search') || '').trim();
  const skip = (page - 1) * limit;

  // Try to parse search as enums
  const searchPlan = ['BASIC', 'STANDARD', 'PREMIUM'].includes(search.toUpperCase())
    ? (search.toUpperCase() as SubscriptionPlan)
    : undefined;
  const searchStatus = ['PENDING', 'SUCCESS', 'FAILED'].includes(search.toUpperCase())
    ? (search.toUpperCase() as PaymentStatus)
    : undefined;

  // Build the dynamic Prisma conditions
  const orConditions: any[] = [
    { mpesaReceiptNumber: { contains: search } }
  ];
  if (searchPlan) orConditions.push({ plan: searchPlan });
  if (searchStatus) orConditions.push({ status: searchStatus });

  const where: any = { userId: req.user.id };
  if (search) {
    where.OR = orConditions;
  }

  const [payments, total, hasPendingPayment] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
    prisma.payment.count({
      where: { userId: req.user.id, status: PaymentStatus.PENDING },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    success: true,
    payments,
    hasPendingPayment: hasPendingPayment > 0,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
