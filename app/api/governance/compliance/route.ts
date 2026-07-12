import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const issues = await prisma.complianceIssue.findMany({
      include: {
        department: true,
        owner: true,
        audit: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    
    // Enforce business rule: flag overdue issues
    const issuesWithOverdueFlag = issues.map((issue) => {
      const isOverdue = issue.status === 'open' && new Date(issue.dueDate) < now;
      return {
        ...issue,
        isOverdue,
      };
    });

    return NextResponse.json(issuesWithOverdueFlag);
  } catch (error) {
    console.error('Error fetching compliance issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auditId, departmentId, severity, description, ownerId, dueDate, status } = body;

    // Enforce business rule: ownerId and dueDate are mandatory
    if (!ownerId || !dueDate) {
      return NextResponse.json(
        { error: 'ownerId and dueDate are strictly required for Compliance Issues' },
        { status: 400 }
      );
    }
    
    if (!departmentId || !severity) {
      return NextResponse.json(
        { error: 'departmentId and severity are also required' },
        { status: 400 }
      );
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
      include: {
        department: true,
        owner: true,
      },
    });
    
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance issue:', error);
    return NextResponse.json({ error: 'Failed to create compliance issue' }, { status: 500 });
  }
}
