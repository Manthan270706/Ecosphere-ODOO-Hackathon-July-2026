import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head'];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const challenges = await prisma.challenge.findMany({
      include: { category: true },
      orderBy: { deadline: 'asc' },
    });
    return NextResponse.json(challenges);
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
      return NextResponse.json({ error: 'Forbidden: only managers can create challenges' }, { status: 403 });
    }

    const body = await req.json();
    const { title, categoryId, description, xp, difficulty, evidenceRequired, deadline, status } = body;

    if (!title || xp === undefined || !difficulty) {
      return NextResponse.json({ error: 'Title, xp, and difficulty are required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        categoryId: categoryId || null,
        description,
        xp,
        difficulty,
        evidenceRequired: evidenceRequired ?? false,
        deadline: deadline ? new Date(deadline) : undefined,
        status: status || 'active',
      },
      include: { category: true },
    });
    return NextResponse.json(challenge, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
