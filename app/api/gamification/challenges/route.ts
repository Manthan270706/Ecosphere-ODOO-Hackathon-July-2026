import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
      },
      orderBy: { deadline: 'asc' },
    });
    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, categoryId, description, xp, difficulty, evidenceRequired, deadline, status } = body;

    if (!title || !categoryId || xp === undefined || !difficulty) {
      return NextResponse.json(
        { error: 'Title, categoryId, xp, and difficulty are required' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        categoryId,
        description,
        xp,
        difficulty,
        evidenceRequired: evidenceRequired ?? false,
        deadline: deadline ? new Date(deadline) : undefined,
        status: status || 'draft',
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
