import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const APPROVER_ROLES = ['admin', 'esg_manager', 'department_head'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    if (!APPROVER_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: only admins, ESG managers, and department heads can approve/reject' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await req.json();
    const { action, pointsEarned } = body as {
      action: 'approve' | 'reject';
      pointsEarned?: number;
    };

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Load participation together with the linked activity
    const participation = await prisma.employeeParticipation.findUnique({
      where: { id },
      include: { activity: true },
    });

    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 });
    }

    if (participation.approvalStatus !== 'pending') {
      return NextResponse.json(
        { error: 'This participation has already been reviewed' },
        { status: 409 }
      );
    }

    // ── CORE BUSINESS RULE ─────────────────────────────────────────────────────
    // Block approval when evidenceRequired is true but proofUrl is missing
    if (action === 'approve' && participation.activity.evidenceRequired && !participation.proofUrl) {
      return NextResponse.json(
        {
          error:
            'Cannot approve: this activity requires evidence but the employee has not submitted a proof URL.',
        },
        { status: 400 }
      );
    }
    // ───────────────────────────────────────────────────────────────────────────

    if (action === 'approve') {
      const pts = typeof pointsEarned === 'number' && pointsEarned > 0 ? pointsEarned : 10;

      // Atomic transaction: mark participation approved AND increment employee XP
      const [updatedParticipation] = await prisma.$transaction([
        prisma.employeeParticipation.update({
          where: { id },
          data: { approvalStatus: 'approved', pointsEarned: pts },
          include: {
            employee: { select: { id: true, name: true, xpPoints: true } },
            activity: { select: { id: true, title: true } },
          },
        }),
        prisma.employee.update({
          where: { id: participation.employeeId },
          data: { xpPoints: { increment: pts } },
        }),
      ]);

      return NextResponse.json({
        message: `Participation approved. ${pts} XP awarded to ${updatedParticipation.employee.name}.`,
        participation: updatedParticipation,
      });
    }

    // action === 'reject'
    const updatedParticipation = await prisma.employeeParticipation.update({
      where: { id },
      data: { approvalStatus: 'rejected' },
      include: {
        employee: { select: { id: true, name: true } },
        activity: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      message: 'Participation rejected.',
      participation: updatedParticipation,
    });
  } catch (err) {
    console.error('POST /api/social/participation/[id]/approve error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
