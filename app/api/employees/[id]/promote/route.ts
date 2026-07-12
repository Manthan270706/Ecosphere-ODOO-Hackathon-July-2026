import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const decoded = await verifyToken(token);
  if (decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Only Admin can assign roles' }, { status: 403 });
  }

  const { role } = await req.json();
  const allowedRoles = ['department_head', 'esg_manager', 'compliance_officer', 'employee'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { id } = await params;

  const updated = await prisma.employee.update({
    where: { id },
    data: { role },
  });

  return NextResponse.json({ id: updated.id, role: updated.role });
}
