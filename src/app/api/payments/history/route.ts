import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

// GET /api/payments/history?page=1&limit=5&search=
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const search = (searchParams.get('search') || '').trim();
    const skip = (page - 1) * limit;

    const where: {
      userId: number;
      OR?: Array<
        | { mpesaReceiptNumber: { contains: string } }
        | { plan: { contains: string } }
        | { status: { contains: string } }
      >;
    } = { userId: user.id };

    if (search) {
      where.OR = [
        { mpesaReceiptNumber: { contains: search } },
        { plan: { contains: search.toUpperCase() } },
        { status: { contains: search.toUpperCase() } },
      ];
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
        where: { userId: user.id, status: 'PENDING' },
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
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
