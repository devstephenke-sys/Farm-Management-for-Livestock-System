import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/api';
import { UserRole, UserStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  
  // Farmer details
  farmName: z.string().optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
  ward: z.string().optional(),

  // Vet details
  licenseNumber: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'ValidationError', 
        message: 'Invalid registration data', 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const { email, password, name, role, phone } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    if (role === UserRole.FARMER) {
      const { farmName, county, subCounty, ward } = parsed.data;
      if (!farmName || !county || !subCounty || !ward) {
        return NextResponse.json({ error: 'Missing farm registration details (farmName, county, subCounty, ward)' }, { status: 400 });
      }

      // Create Farmer user, Farm, and Trial Subscription (e.g. basic plan) in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: UserRole.FARMER,
            phone,
            status: UserStatus.ACTIVE,
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
            plan: SubscriptionPlan.BASIC,
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            amountPaid: 0.0,
          },
        });

        return { user: newUser, farm: newFarm, subscription: initialSubscription };
      });

      // Audit Logging
      await createAuditLog(
        result.user.id,
        'USER_REGISTERED',
        { role: result.user.role, email: result.user.email },
        req
      );

      return NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
      });

    } else if (role === UserRole.VET) {
      const { licenseNumber, qualification, specialization, county, subCounty } = parsed.data;
      if (!licenseNumber || !qualification || !specialization || !county || !subCounty) {
        return NextResponse.json({ error: 'Missing veterinarian details (licenseNumber, qualification, specialization, county, subCounty)' }, { status: 400 });
      }

      const newVet = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: UserRole.VET,
          phone,
          status: UserStatus.PENDING, // Vets require Admin approval
          licenseNumber,
          qualification,
          specialization,
          county,
          subCounty,
        },
      });

      // Audit Logging
      await createAuditLog(
        newVet.id,
        'USER_REGISTERED',
        { role: newVet.role, email: newVet.email, status: newVet.status },
        req
      );

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
