import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { policyId, employeeId } = body;

    if (!policyId || !employeeId) {
      return NextResponse.json(
        { error: 'policyId and employeeId are required' },
        { status: 400 }
      );
    }

    const acknowledgement = await prisma.policyAcknowledgement.create({
      data: {
        policyId,
        employeeId,
      },
    });

    return NextResponse.json(acknowledgement, { status: 201 });
  } catch (error) {
    console.error('Error acknowledging policy:', error);
    return NextResponse.json({ error: 'Failed to acknowledge policy' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const whereClause = employeeId ? { employeeId } : {};

    const acknowledgements = await prisma.policyAcknowledgement.findMany({
      where: whereClause,
      include: {
        policy: true,
        employee: true,
      },
      orderBy: { acknowledgedAt: 'desc' },
    });

    return NextResponse.json(acknowledgements);
  } catch (error) {
    console.error('Error fetching acknowledgements:', error);
    return NextResponse.json({ error: 'Failed to fetch acknowledgements' }, { status: 500 });
  }
}
