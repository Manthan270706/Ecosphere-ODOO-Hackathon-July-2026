import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid transitions can be enforced here or in frontend. For hackathon speed, we allow any valid enum value update.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, categoryId, description, xp, difficulty, evidenceRequired, deadline, status } = body;

    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: {
        title,
        categoryId,
        description,
        xp,
        difficulty,
        evidenceRequired,
        deadline: deadline ? new Date(deadline) : undefined,
        status,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.challenge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}
