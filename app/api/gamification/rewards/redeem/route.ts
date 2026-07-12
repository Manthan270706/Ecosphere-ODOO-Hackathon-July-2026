import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, rewardId } = body;

    if (!employeeId || !rewardId) {
      return NextResponse.json(
        { error: 'employeeId and rewardId are required' },
        { status: 400 }
      );
    }

    const redemption = await prisma.$transaction(async (tx) => {
      // 1. Fetch employee and reward
      const employee = await tx.employee.findUnique({ where: { id: employeeId } });
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!employee) throw new Error('Employee not found');
      if (!reward) throw new Error('Reward not found');

      // 2. Business rule checks
      if (reward.stock <= 0) {
        throw new Error('Reward is out of stock');
      }
      if (employee.xpPoints < reward.pointsRequired) {
        throw new Error('Insufficient XP points');
      }

      // 3. Deduct points and decrement stock
      await tx.employee.update({
        where: { id: employeeId },
        data: { xpPoints: { decrement: reward.pointsRequired } },
      });

      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });

      // 4. Create redemption record
      return await tx.rewardRedemption.create({
        data: {
          employeeId,
          rewardId,
          pointsDeducted: reward.pointsRequired,
        },
        include: {
          reward: true,
        },
      });
    });

    return NextResponse.json(redemption, { status: 201 });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message || 'Failed to redeem reward' }, { status: 400 });
  }
}
