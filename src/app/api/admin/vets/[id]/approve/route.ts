import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const vetId = parseInt(id);

    if (isNaN(vetId)) {
      return NextResponse.json({ error: 'Invalid veterinarian ID' }, { status: 400 });
    }

    const { approve } = await req.json();

    const targetStatus = approve ? 'ACTIVE' : 'SUSPENDED';

    const updatedVet = await prisma.user.update({
      where: { id: vetId, role: 'VET' },
      data: { status: targetStatus },
    });

    // Notify the vet via email simulation or status change
    await prisma.notification.create({
      data: {
        userId: vetId,
        title: approve ? 'Account Approved' : 'Account Suspended',
        message: approve 
          ? 'Congratulations! Your veterinarian account has been approved. You are now visible to farmers and can receive appointments.'
          : 'Your veterinarian account status has been updated to suspended. Please contact admin if this was an error.',
        type: 'APPOINTMENT',
      },
    });

    return NextResponse.json({ success: true, user: updatedVet });
  } catch (error) {
    console.error('Error approving vet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
