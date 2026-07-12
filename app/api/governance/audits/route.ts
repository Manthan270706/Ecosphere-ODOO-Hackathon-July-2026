import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const audits = await prisma.audit.findMany({
      include: {
        department: true,
        auditor: true,
      },
      orderBy: { auditDate: 'desc' },
    });
    return NextResponse.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, departmentId, auditorId, auditDate, findings, status } = body;

    if (!title || !departmentId || !auditorId) {
      return NextResponse.json(
        { error: 'Title, departmentId, and auditorId are required' },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.create({
      data: {
        title,
        departmentId,
        auditorId,
        auditDate: auditDate ? new Date(auditDate) : undefined,
        findings,
        status: status || 'under_review',
      },
      include: {
        department: true,
        auditor: true,
      },
    });
    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
  }
}
