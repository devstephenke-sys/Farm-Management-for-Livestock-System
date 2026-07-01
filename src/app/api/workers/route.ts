import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch all workers and their tasks
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

    const workers = await prisma.worker.findMany({
      where: { farmId: farm.id },
      include: { tasks: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add new worker OR assign a task to an existing worker
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
    const { action, name, role, phone, workerId, taskName, description, dueDate } = body;

    if (action === 'ADD_WORKER') {
      if (!name || !role) {
        return NextResponse.json({ error: 'Missing worker name or role' }, { status: 400 });
      }

      const worker = await prisma.worker.create({
        data: {
          farmId: farm.id,
          name,
          role,
          phone: phone || null,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({ success: true, worker });
    } else if (action === 'UPDATE_WORKER') {
      if (!workerId || !name || !role) {
        return NextResponse.json({ error: 'Missing workerId, name, or role' }, { status: 400 });
      }

      const existing = await prisma.worker.findFirst({
        where: { id: parseInt(workerId), farmId: farm.id },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }

      const worker = await prisma.worker.update({
        where: { id: existing.id },
        data: {
          name,
          role,
          phone: phone || null,
          status: body.status || existing.status,
        },
      });

      return NextResponse.json({ success: true, worker });
    } else if (action === 'ASSIGN_TASK') {
      if (!workerId || !taskName || !dueDate) {
        return NextResponse.json({ error: 'Missing workerId, taskName, or dueDate' }, { status: 400 });
      }

      const task = await prisma.workerTask.create({
        data: {
          farmId: farm.id,
          workerId: parseInt(workerId),
          taskName,
          description: description || null,
          dueDate: new Date(dueDate),
          status: 'PENDING',
        },
      });

      return NextResponse.json({ success: true, task });
    } else {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving worker/task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Mark a task as completed or toggle its status
export async function PUT(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Missing taskId or status' }, { status: 400 });
    }

    const task = await prisma.workerTask.update({
      where: { id: parseInt(taskId) },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error updating worker task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a worker from the farm roster
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 });
    }

    const existing = await prisma.worker.findFirst({
      where: { id: parseInt(workerId), farmId: farm.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    await prisma.worker.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: 'Worker removed from roster.' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
