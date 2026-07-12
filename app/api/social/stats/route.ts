import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await verifyToken(token);

    const [
      totalActivities,
      activeActivities,
      totalParticipations,
      pendingParticipations,
      approvedParticipations,
      rejectedParticipations,
      topActivities,
    ] = await Promise.all([
      prisma.cSRActivity.count(),
      prisma.cSRActivity.count({ where: { status: 'active' } }),
      prisma.employeeParticipation.count(),
      prisma.employeeParticipation.count({ where: { approvalStatus: 'pending' } }),
      prisma.employeeParticipation.count({ where: { approvalStatus: 'approved' } }),
      prisma.employeeParticipation.count({ where: { approvalStatus: 'rejected' } }),
      prisma.cSRActivity.findMany({
        include: {
          _count: { select: { participations: true } },
          department: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { participations: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    // Aggregate participation counts grouped by department via employee
    const departmentRaw = await prisma.employeeParticipation.findMany({
      select: {
        employee: {
          select: {
            departmentId: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    const deptMap: Record<string, { deptName: string; count: number }> = {};
    for (const row of departmentRaw) {
      const { departmentId, department } = row.employee;
      if (!deptMap[departmentId]) {
        deptMap[departmentId] = { deptName: department.name, count: 0 };
      }
      deptMap[departmentId].count += 1;
    }

    const participationByDepartment = Object.entries(deptMap)
      .map(([deptId, v]) => ({ deptId, deptName: v.deptName, count: v.count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalActivities,
      activeActivities,
      totalParticipations,
      pendingParticipations,
      approvedParticipations,
      rejectedParticipations,
      participationByDepartment,
      topActivities: topActivities.map((a) => ({
        id: a.id,
        title: a.title,
        department: a.department.name,
        category: a.category.name,
        participationCount: a._count.participations,
      })),
    });
  } catch (err) {
    console.error('GET /api/social/stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
