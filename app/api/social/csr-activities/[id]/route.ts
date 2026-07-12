import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const { id } = await params;

    const activity = await prisma.cSRActivity.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        _count: { select: { participations: true } },
      },
    });

    if (!activity) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });

    return NextResponse.json(activity);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    if (!MANAGER_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.cSRActivity.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });

    const body = await req.json();
    const { title, categoryId, departmentId, description, evidenceRequired, status } = body;

    const updated = await prisma.cSRActivity.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(departmentId !== undefined ? { departmentId } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(evidenceRequired !== undefined ? { evidenceRequired } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/social/csr-activities/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    if (!MANAGER_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.cSRActivity.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });

    // Soft delete — set status to inactive to preserve participation records
    const updated = await prisma.cSRActivity.update({
      where: { id },
      data: { status: 'inactive' },
    });

    return NextResponse.json({ message: 'Activity deactivated', activity: updated });
  } catch (err) {
    console.error('DELETE /api/social/csr-activities/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
