import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, createAuditLog } from '@/lib/api';
import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

// GET /api/admin/users?role=FARMER
export const GET = withAuth([UserRole.ADMIN])(async (req) => {
  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get('role');
  
  const role = (roleParam && ['ADMIN', 'FARMER', 'VET'].includes(roleParam)) 
    ? (roleParam as UserRole) 
    : undefined;

  const users = await prisma.user.findMany({
    where: {
      role: role || { in: [UserRole.FARMER, UserRole.VET] },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      phone: true,
      county: true,
      subCounty: true,
      licenseNumber: true,
      specialization: true,
      createdAt: true,
      subscriptions: {
        take: 1,
        orderBy: { endDate: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, users });
});

const updateStatusSchema = z.object({
  userId: z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]),
  status: z.nativeEnum(UserStatus),
});

// PUT /api/admin/users
export const PUT = withAuth([UserRole.ADMIN], updateStatusSchema)(async (req) => {
  const { userId, status } = req.validatedData;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  // Audit Logging
  await createAuditLog(
    req.user.id,
    'USER_STATUS_UPDATED',
    { targetUserId: userId, newStatus: status },
    req
  );

  return NextResponse.json({ success: true, user: updated });
});
