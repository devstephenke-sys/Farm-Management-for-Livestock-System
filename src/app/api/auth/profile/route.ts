import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, hashPassword, comparePassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        county: true,
        subCounty: true,
        licenseNumber: true,
        qualification: true,
        specialization: true,
        farms: {
          select: {
            id: true,
            name: true,
            county: true,
            subCounty: true,
            ward: true,
            phone: true,
          },
        },
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, profile: fullUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, county, subCounty, currentPassword, newPassword } = body;

    const existing = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: {
      name?: string;
      phone?: string;
      county?: string;
      subCounty?: string;
      passwordHash?: string;
    } = {};

    if (name?.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (county !== undefined) updateData.county = county;
    if (subCounty !== undefined) updateData.subCounty = subCounty;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      const valid = await comparePassword(currentPassword, existing.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        county: true,
        subCounty: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
