import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const departments = await prisma.department.findMany({
    include: { parentDept: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  const { name, code, parentDeptId, headEmployeeId } = await req.json();

  if (!name || !code) {
    return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
  }

  const existing = await prisma.department.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: 'Department code already exists' }, { status: 409 });
  }

  const department = await prisma.department.create({
    data: { name, code, parentDeptId: parentDeptId || null, headEmployeeId: headEmployeeId || null },
  });

  return NextResponse.json(department, { status: 201 });
}
