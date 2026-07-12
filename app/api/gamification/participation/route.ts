import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const participations = await prisma.challengeParticipation.findMany({
      include: {
        challenge: true,
        employee: {
          include: { department: true }
        },
      },
    });
    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json({ error: 'Failed to fetch participations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeId, employeeId, proofUrl } = body;

    if (!challengeId || !employeeId) {
      return NextResponse.json(
        { error: 'challengeId and employeeId are required' },
        { status: 400 }
      );
    }

    const participation = await prisma.challengeParticipation.create({
      data: {
        challengeId,
        employeeId,
        proofUrl,
      },
      include: {
        challenge: true,
        employee: true,
      }
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
