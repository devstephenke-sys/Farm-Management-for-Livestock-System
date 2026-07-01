import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const module = searchParams.get('module') || undefined;

    const resources = await prisma.learningResource.findMany({
      where: {
        category: category || undefined,
        module: module || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    const { title, category, module, contentType, contentUrl, contentBody } = await req.json();

    if (!title || !category || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resource = await prisma.learningResource.create({
      data: {
        title,
        category,
        module: module || null,
        contentType,
        contentUrl: contentUrl || null,
        contentBody: contentBody || null,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error('Error creating learning resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
