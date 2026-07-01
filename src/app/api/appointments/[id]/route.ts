import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const appointmentId = parseInt(id);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        animal: { select: { id: true, name: true, tagNumber: true } },
        farmer: { select: { id: true, name: true } },
        veterinarian: { select: { id: true, name: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Verify permission
    if (user.role === 'FARMER' && appointment.farmerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role === 'VET' && appointment.veterinarianId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Notify the farmer if the vet updates status
    if (user.role === 'VET') {
      await prisma.notification.create({
        data: {
          userId: appointment.farmerId,
          title: `Appointment ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: `Dr. ${user.name} has marked your appointment for ${appointment.animal.name} as ${status}.`,
          type: 'APPOINTMENT',
          animalId: appointment.animalId,
        },
      });
    }

    // Notify the vet if the farmer cancels
    if (user.role === 'FARMER' && status === 'CANCELLED') {
      await prisma.notification.create({
        data: {
          userId: appointment.veterinarianId,
          title: 'Appointment Cancelled by Farmer',
          message: `Farmer ${user.name} has cancelled the appointment for ${appointment.animal.name} scheduled on ${new Date(appointment.preferredDate).toLocaleDateString()}.`,
          type: 'APPOINTMENT',
          animalId: appointment.animalId,
        },
      });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
