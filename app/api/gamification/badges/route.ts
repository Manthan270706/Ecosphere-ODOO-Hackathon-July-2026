import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    // If employeeId is provided, return their earned badges
    if (employeeId) {
      const employeeBadges = await prisma.employeeBadge.findMany({
        where: { employeeId },
        include: { badge: true },
        orderBy: { awardedAt: 'desc' },
      });
      return NextResponse.json(employeeBadges);
    }

    // Otherwise return all available badges
    const badges = await prisma.badge.findMany();
    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}
