import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head', 'compliance_officer'];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get('activityId');
    const approvalStatus = searchParams.get('approvalStatus') as
      | 'pending'
      | 'approved'
      | 'rejected'
      | null;
    const employeeId = searchParams.get('employeeId');

    const isManager = MANAGER_ROLES.includes(user.role);

    const participations = await prisma.employeeParticipation.findMany({
      where: {
        // Employees only see their own records
        ...(!isManager ? { employeeId: user.id } : {}),
        ...(activityId ? { activityId } : {}),
        ...(approvalStatus ? { approvalStatus } : {}),
        // Managers can filter by a specific employee
        ...(employeeId && isManager ? { employeeId } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
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
      orderBy: { completionDate: 'desc' },
    });

    return NextResponse.json(participations);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const body = await req.json();
    const { activityId, proofUrl } = body;

    if (!activityId) {
      return NextResponse.json({ error: 'activityId is required' }, { status: 400 });
    }

    // Verify activity exists and is active
    const activity = await prisma.cSRActivity.findUnique({ where: { id: activityId } });
    if (!activity) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    if (activity.status === 'inactive') {
      return NextResponse.json({ error: 'Activity is no longer active' }, { status: 400 });
    }

    // Prevent duplicate participation for the same employee + activity
    const existing = await prisma.employeeParticipation.findFirst({
      where: { employeeId: user.id, activityId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already joined this activity' },
        { status: 409 }
      );
    }

    const participation = await prisma.employeeParticipation.create({
      data: {
        employeeId: user.id,
        activityId,
        proofUrl: proofUrl ?? null,
        approvalStatus: 'pending',
        pointsEarned: 0,
        completionDate: new Date(),
      },
      include: {
        employee: { select: { id: true, name: true } },
        activity: { select: { id: true, title: true, evidenceRequired: true } },
      },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (err) {
    console.error('POST /api/social/participation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
