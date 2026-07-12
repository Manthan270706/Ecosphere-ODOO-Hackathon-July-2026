import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const APPROVER_ROLES = ['admin', 'esg_manager', 'department_head'];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const { id } = await params;
    const body = await req.json();
    const { approvalStatus, progress, proofUrl } = body;

    // Only managers can approve/reject
    if (approvalStatus && !APPROVER_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: only managers can approve participations' }, { status: 403 });
    }

    const existing = await prisma.challengeParticipation.findUnique({
      where: { id },
      include: { challenge: true, employee: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Business Rule: Cannot approve if evidence required but no proof
    if (
      approvalStatus === 'approved' &&
      existing.challenge.evidenceRequired &&
      !existing.proofUrl &&
      !proofUrl
    ) {
      return NextResponse.json(
        { error: 'Proof is required to approve this challenge.' },
        { status: 400 }
      );
    }

    let updatedParticipation;

    if (approvalStatus === 'approved' && existing.approvalStatus !== 'approved') {
      updatedParticipation = await prisma.$transaction(async (tx) => {
        const part = await tx.challengeParticipation.update({
          where: { id },
          data: {
            approvalStatus,
            progress: progress ?? existing.progress,
            proofUrl: proofUrl ?? existing.proofUrl,
            xpAwarded: existing.challenge.xp,
          },
        });

        const emp = await tx.employee.update({
          where: { id: existing.employeeId },
          data: { xpPoints: { increment: existing.challenge.xp } },
        });

        const badges = await tx.badge.findMany();
        const completedCount = await tx.challengeParticipation.count({
          where: { employeeId: emp.id, approvalStatus: 'approved' },
        });

        for (const badge of badges) {
          let shouldAward = false;
          if (badge.unlockRuleType === 'xp_threshold' && emp.xpPoints >= badge.unlockRuleValue) {
            shouldAward = true;
          } else if (badge.unlockRuleType === 'challenge_count' && completedCount >= badge.unlockRuleValue) {
            shouldAward = true;
          }
          if (shouldAward) {
            const hasBadge = await tx.employeeBadge.findFirst({
              where: { employeeId: emp.id, badgeId: badge.id },
            });
            if (!hasBadge) {
              await tx.employeeBadge.create({
                data: { employeeId: emp.id, badgeId: badge.id },
              });
            }
          }
        }

        return part;
      });
    } else {
      updatedParticipation = await prisma.challengeParticipation.update({
        where: { id },
        data: { approvalStatus, progress, proofUrl },
      });
    }

    return NextResponse.json(updatedParticipation);
  } catch {
    return NextResponse.json({ error: 'Failed to update participation' }, { status: 500 });
  }
}
