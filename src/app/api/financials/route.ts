import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch all financial transactions for the farmer's farm
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

    const transactions = await prisma.transaction.findMany({
      where: { farmId: farm.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new financial transaction
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
    const { type, category, amount, description, date } = body;

    if (!type || !category || !amount) {
      return NextResponse.json({ error: 'Missing type, category, or amount' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        farmId: farm.id,
        type,
        category,
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
