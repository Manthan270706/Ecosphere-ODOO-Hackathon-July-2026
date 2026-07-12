import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();

  const existing = await prisma.environmentalGoal.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  const currentCo2 = data.currentCo2 ?? existing.currentCo2;
  const targetCo2 = data.targetCo2 ?? existing.targetCo2;
  const deadline = data.deadline ? new Date(data.deadline) : existing.deadline;

  let status = data.status ?? existing.status;
  if (Number(currentCo2) <= Number(targetCo2)) {
    status = 'completed';
  } else if (deadline && new Date() > deadline) {
    status = 'missed';
  } else if (Number(currentCo2) < Number(targetCo2) * 1.1) {
    status = 'on_track';
  }

  const goal = await prisma.environmentalGoal.update({
    where: { id: params.id },
    data: { ...data, status },
  });

  return NextResponse.json(goal);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.environmentalGoal.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
