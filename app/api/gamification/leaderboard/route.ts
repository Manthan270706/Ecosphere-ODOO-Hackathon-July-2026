import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leaderboard = await prisma.employee.findMany({
      include: {
        department: true,
      },
      orderBy: {
        xpPoints: 'desc',
      },
      // Limit to top 100 for performance in a real app, but fine for hackathon
      take: 100,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
