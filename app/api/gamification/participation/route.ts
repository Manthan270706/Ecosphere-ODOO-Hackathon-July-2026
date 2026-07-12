import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const participations = await prisma.challengeParticipation.findMany({
      include: {
        challenge: true,
        employee: { include: { department: true } },
      },
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
    const { challengeId, proofUrl } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    // Use logged-in user's employee ID from token — never trust client-submitted employeeId
    const participation = await prisma.challengeParticipation.create({
      data: {
        challengeId,
        employeeId: user.id,
        proofUrl,
      },
      include: { challenge: true, employee: true },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
