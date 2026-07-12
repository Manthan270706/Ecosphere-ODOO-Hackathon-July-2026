import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const category = await prisma.category.update({ where: { id: params.id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.category.update({ where: { id: params.id }, data: { status: 'inactive' } });
  return NextResponse.json({ success: true });
}