import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const factors = await prisma.emissionFactor.findMany({
    orderBy: { effectiveDate: 'desc' },
  });
  return NextResponse.json(factors);
}

export async function POST(req: NextRequest) {
  const { activityType, factorValue, unit, source, effectiveDate } = await req.json();

  if (!activityType || factorValue === undefined || !unit) {
    return NextResponse.json({ error: 'activityType, factorValue, and unit are required' }, { status: 400 });
  }

  const factor = await prisma.emissionFactor.create({
    data: {
      activityType,
      factorValue,
      unit,
      source,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
    },
  });

  return NextResponse.json(factor, { status: 201 });
}
