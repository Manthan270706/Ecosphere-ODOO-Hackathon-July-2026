import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const body = await req.json();
    const { policyId } = body;

    if (!policyId) {
      return NextResponse.json({ error: 'policyId is required' }, { status: 400 });
    }

    // Check if already acknowledged
    const existing = await prisma.policyAcknowledgement.findFirst({
      where: { policyId, employeeId: user.id },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already acknowledged' }, { status: 200 });
    }

    const acknowledgement = await prisma.policyAcknowledgement.create({
      data: { policyId, employeeId: user.id },
    });

    return NextResponse.json(acknowledgement, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to acknowledge policy' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') || user.id;

    const acknowledgements = await prisma.policyAcknowledgement.findMany({
      where: { employeeId },
      include: { policy: true, employee: true },
      orderBy: { acknowledgedAt: 'desc' },
    });

    return NextResponse.json(acknowledgements);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch acknowledgements' }, { status: 500 });
  }
}
