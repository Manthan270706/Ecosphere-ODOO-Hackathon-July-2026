import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, departmentId, auditorId, auditDate, findings, status } = body;

    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: {
        title,
        departmentId,
        auditorId,
        auditDate: auditDate ? new Date(auditDate) : undefined,
        findings,
        status,
      },
      include: {
        department: true,
        auditor: true,
      },
    });

    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error('Error updating audit:', error);
    return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 });
  }
}
