import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const GOVERNANCE_ROLES = ['admin', 'esg_manager', 'compliance_officer'];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const issues = await prisma.complianceIssue.findMany({
      include: { department: true, owner: true, audit: true },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const issuesWithOverdueFlag = issues.map((issue) => ({
      ...issue,
      isOverdue: issue.status === 'open' && new Date(issue.dueDate) < now,
    }));

    return NextResponse.json(issuesWithOverdueFlag);
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
    const { auditId, departmentId, severity, description, ownerId, dueDate, status } = body;

    if (!ownerId || !dueDate) {
      return NextResponse.json({ error: 'ownerId and dueDate are strictly required' }, { status: 400 });
    }
    if (!departmentId || !severity) {
      return NextResponse.json({ error: 'departmentId and severity are also required' }, { status: 400 });
    }

    const issue = await prisma.complianceIssue.create({
      data: {
        auditId,
        departmentId,
        severity,
        description,
        ownerId,
        dueDate: new Date(dueDate),
        status: status || 'open',
      },
      include: { department: true, owner: true },
    });
    return NextResponse.json(issue, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
