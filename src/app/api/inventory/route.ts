import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch all inventory items for the farmer's farm
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

    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { farmId: farm.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, inventoryItems });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add new inventory item or update existing stock levels
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
    const { id, name, category, quantity, unit, expiryDate, lowStockThreshold, supplier, cost, recordExpense } = body;

    if (!name || !category || quantity === undefined || !unit) {
      return NextResponse.json({ error: 'Missing required inventory fields' }, { status: 400 });
    }

    let inventoryItem;

    if (id) {
      // Update existing item
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: parseInt(id) },
        data: {
          name,
          category,
          quantity: parseFloat(quantity),
          unit,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : 0.0,
          supplier: supplier || null,
          cost: cost ? parseFloat(cost) : 0.0,
        },
      });
    } else {
      // Create new item
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          farmId: farm.id,
          name,
          category,
          quantity: parseFloat(quantity),
          unit,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : 0.0,
          supplier: supplier || null,
          cost: cost ? parseFloat(cost) : 0.0,
        },
      });

      // If user checks "recordExpense" (i.e. log as financial transaction automatically)
      if (recordExpense && cost && parseFloat(cost) > 0) {
        await prisma.transaction.create({
          data: {
            farmId: farm.id,
            type: 'EXPENSE',
            category: category === 'FEED' ? 'FEED' : (category === 'VACCINE' || category === 'DRUG' ? 'MEDICATION' : 'OTHER'),
            amount: parseFloat(cost) * parseFloat(quantity),
            description: `Inventory purchase: ${name} (${quantity} ${unit} @ KES ${cost})`,
            date: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, inventoryItem });
  } catch (error) {
    console.error('Error saving inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
