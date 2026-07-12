import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let config = await prisma.esgConfiguration.findFirst();
  if (!config) {
    config = await prisma.esgConfiguration.create({ data: {} });
  }
  return NextResponse.json(config);
}

export async function PATCH(req: Request) {
  const data = await req.json();
  let config = await prisma.esgConfiguration.findFirst();
  if (!config) {
    config = await prisma.esgConfiguration.create({ data: {} });
  }

  const envWeight = data.envWeight ?? config.envWeight;
  const socialWeight = data.socialWeight ?? config.socialWeight;
  const governanceWeight = data.governanceWeight ?? config.governanceWeight;

  const total = Number(envWeight) + Number(socialWeight) + Number(governanceWeight);
  if (Math.abs(total - 1) > 0.01) {
    return NextResponse.json({ error: `Weights must sum to 1.0, currently sum to ${total.toFixed(2)}` }, { status: 400 });
  }

  const updated = await prisma.esgConfiguration.update({
    where: { id: config.id },
    data,
  });

  return NextResponse.json(updated);
}
