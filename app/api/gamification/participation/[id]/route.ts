import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { approvalStatus, progress, proofUrl } = body;

    // Fetch existing participation to check rules
    const existing = await prisma.challengeParticipation.findUnique({
      where: { id },
      include: { challenge: true, employee: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Business Rule: Cannot approve if evidence is required and no proof is provided
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

    // Execute within a transaction if we are approving
    let updatedParticipation;

    if (approvalStatus === 'approved' && existing.approvalStatus !== 'approved') {
      updatedParticipation = await prisma.$transaction(async (tx) => {
        // 1. Update Participation
        const part = await tx.challengeParticipation.update({
          where: { id },
          data: {
            approvalStatus,
            progress: progress ?? existing.progress,
            proofUrl: proofUrl ?? existing.proofUrl,
            xpAwarded: existing.challenge.xp,
          },
        });

        // 2. Award XP to Employee
        const emp = await tx.employee.update({
          where: { id: existing.employeeId },
          data: {
            xpPoints: { increment: existing.challenge.xp },
          },
        });

        // 3. Auto-award Badges
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
      // Just a normal update
      updatedParticipation = await prisma.challengeParticipation.update({
        where: { id },
        data: {
          approvalStatus,
          progress,
          proofUrl,
        },
      });
    }

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Error updating participation:', error);
    return NextResponse.json({ error: 'Failed to update participation' }, { status: 500 });
  }
}
