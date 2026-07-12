import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { name, email, password, departmentId } = await req.json();

  if (!name || !email || !password || !departmentId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      passwordHash,
      departmentId,
      role: 'employee',
    },
  });

  return NextResponse.json({ id: employee.id, name: employee.name, email: employee.email }, { status: 201 });
}
