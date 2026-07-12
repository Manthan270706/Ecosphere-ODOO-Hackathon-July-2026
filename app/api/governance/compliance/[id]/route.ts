import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { severity, description, ownerId, dueDate, status } = body;

    const updatedIssue = await prisma.complianceIssue.update({
      where: { id },
      data: {
        severity,
        description,
        ownerId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      },
      include: {
        department: true,
        owner: true,
        audit: true,
      },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('Error updating compliance issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.complianceIssue.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting compliance issue:', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}
