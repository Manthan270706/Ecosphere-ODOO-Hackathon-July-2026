import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const categories = await prisma.category.findMany({
    where: type ? { type: type as any } : undefined,
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name, type } = await req.json();

  if (!name || !type) {
    return NextResponse.json({ error: 'name and type are required' }, { status: 400 });
  }
  if (!['csr_activity', 'challenge'].includes(type)) {
    return NextResponse.json({ error: 'type must be csr_activity or challenge' }, { status: 400 });
  }

  const category = await prisma.category.create({ data: { name, type } });
  return NextResponse.json(category, { status: 201 });
}
