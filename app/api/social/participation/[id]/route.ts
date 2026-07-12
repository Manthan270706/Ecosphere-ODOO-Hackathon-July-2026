import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head', 'compliance_officer'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const { id } = await params;

    const participation = await prisma.employeeParticipation.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true, email: true } },
        activity: {
          select: {
            id: true,
            title: true,
            evidenceRequired: true,
            status: true,
            category: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!participation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Employees can only view their own record
    if (!MANAGER_ROLES.includes(user.role) && participation.employeeId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(participation);
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

    const { id } = await params;

    const participation = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!participation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only the employee who owns the record (or managers) can update proof URL
    if (!MANAGER_ROLES.includes(user.role) && participation.employeeId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot update proof on an already-decided record
    if (participation.approvalStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot update proof on a record that has already been reviewed' },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { proofUrl } = body;

    const updated = await prisma.employeeParticipation.update({
      where: { id },
      data: { proofUrl },
      include: {
        employee: { select: { id: true, name: true } },
        activity: { select: { id: true, title: true, evidenceRequired: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/social/participation/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
