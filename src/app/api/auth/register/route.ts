import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role, phone } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    if (role === 'FARMER') {
      const { farmName, county, subCounty, ward } = body;
      if (!farmName || !county || !subCounty || !ward) {
        return NextResponse.json({ error: 'Missing farm registration details' }, { status: 400 });
      }

      // Create Farmer user, Farm, and Trial Subscription (e.g. basic plan) in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: 'FARMER',
            phone,
            status: 'ACTIVE',
            county,
            subCounty,
          },
        });

        const newFarm = await tx.farm.create({
          data: {
            name: farmName,
            ownerName: name,
            email,
            phone: phone || '',
            county,
            subCounty,
            ward,
            farmerId: newUser.id,
          },
        });

        // Create initial basic active subscription
        const initialSubscription = await tx.subscription.create({
          data: {
            farmerId: newUser.id,
            plan: 'BASIC',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            amountPaid: 0.0,
          },
        });

        return { user: newUser, farm: newFarm, subscription: initialSubscription };
      });

      return NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });

    } else if (role === 'VET') {
      const { licenseNumber, qualification, specialization, county, subCounty } = body;
      if (!licenseNumber || !qualification || !specialization || !county || !subCounty) {
        return NextResponse.json({ error: 'Missing veterinarian details' }, { status: 400 });
      }

      const newVet = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: 'VET',
          phone,
          status: 'PENDING', // Vets require Admin approval
          licenseNumber,
          qualification,
          specialization,
          county,
          subCounty,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Awaiting administrator approval.',
        user: {
          id: newVet.id,
          email: newVet.email,
          name: newVet.name,
          role: newVet.role,
          status: newVet.status,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
