import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const GOVERNANCE_ROLES = ['admin', 'esg_manager', 'compliance_officer'];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const audits = await prisma.audit.findMany({
      include: { department: true, auditor: true },
      orderBy: { auditDate: 'desc' },
    });
    return NextResponse.json(audits);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await verifyToken(token);

    if (!GOVERNANCE_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    const body = await req.json();
    const { title, departmentId, auditorId, auditDate, findings, status } = body;

    if (!title || !departmentId || !auditorId) {
      return NextResponse.json({ error: 'Title, departmentId, and auditorId are required' }, { status: 400 });
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
      include: { department: true, auditor: true },
    });
    return NextResponse.json(audit, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
