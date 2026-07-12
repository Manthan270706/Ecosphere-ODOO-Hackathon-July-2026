import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const goals = await prisma.environmentalGoal.findMany({
    include: { department: true },
    orderBy: { deadline: 'asc' },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const { departmentId, name, targetCo2, currentCo2, deadline } = await req.json();

  if (!departmentId || !name || targetCo2 === undefined) {
    return NextResponse.json({ error: 'departmentId, name, and targetCo2 are required' }, { status: 400 });
  }

  const goal = await prisma.environmentalGoal.create({
    data: {
      departmentId,
      name,
      targetCo2,
      currentCo2: currentCo2 ?? 0,
      deadline: deadline ? new Date(deadline) : null,
      status: 'active',
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
