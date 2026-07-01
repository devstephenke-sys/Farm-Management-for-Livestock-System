import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let farm = null;
    let subscription = null;

    if (user.role === 'FARMER') {
      farm = await prisma.farm.findFirst({
        where: { farmerId: user.id },
      });

      subscription = await prisma.subscription.findFirst({
        where: { farmerId: user.id },
        orderBy: { endDate: 'desc' },
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        qualification: user.qualification,
        specialization: user.specialization,
        county: user.county,
        subCounty: user.subCounty,
        farm,
        subscription,
      },
    });
  } catch (error) {
    console.error('Error in session API:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
