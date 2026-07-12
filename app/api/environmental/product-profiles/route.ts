import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const profiles = await prisma.productESGProfile.findMany({
    include: { emissionFactor: true },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const { productName, emissionFactorId, lifecycleNotes } = await req.json();

  if (!productName || !emissionFactorId) {
    return NextResponse.json({ error: 'productName and emissionFactorId are required' }, { status: 400 });
  }

  const profile = await prisma.productESGProfile.create({
    data: { productName, emissionFactorId, lifecycleNotes },
  });

  return NextResponse.json(profile, { status: 201 });
}
