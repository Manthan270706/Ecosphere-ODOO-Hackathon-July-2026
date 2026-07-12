import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head'];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'active' | 'inactive' | null;
    const departmentId = searchParams.get('departmentId');

    const activities = await prisma.cSRActivity.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    if (!MANAGER_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    const body = await req.json();
    const { title, categoryId, departmentId, description, evidenceRequired, status } = body;

    if (!title || !categoryId || !departmentId) {
      return NextResponse.json(
        { error: 'title, categoryId, and departmentId are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.cSRActivity.create({
      data: {
        title,
        categoryId,
        departmentId,
        description: description ?? null,
        evidenceRequired: evidenceRequired ?? false,
        status: status ?? 'active',
      },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error('POST /api/social/csr-activities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
