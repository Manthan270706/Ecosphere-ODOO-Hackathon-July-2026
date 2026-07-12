'use client';

import { useEffect, useState, useCallback } from 'react';

interface DeptStat {
  deptId: string;
  deptName: string;
  count: number;
}

interface TopActivity {
  id: string;
  title: string;
  department: string;
  category: string;
  participationCount: number;
}

interface Stats {
  totalActivities: number;
  activeActivities: number;
  totalParticipations: number;
  pendingParticipations: number;
  approvedParticipations: number;
  rejectedParticipations: number;
  participationByDepartment: DeptStat[];
  topActivities: TopActivity[];
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  rank,
}: {
  label: string;
  value: number;
  max: number;
  rank: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const rankColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-indigo-400',
  ];
  const barColor = rankColors[Math.min(rank, rankColors.length - 1)];

  return (
    <div className="flex items-center gap-4">
      <div className="w-36 text-sm text-slate-600 truncate shrink-0 text-right">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-12 text-right text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function DonutSlice({
  label,
  count,
  total,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600 font-medium">{label}</span>
          <span className="text-slate-800 font-semibold">
            {count}{' '}
            <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
          </span>
        </div>
        <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${bgColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DiversityPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/stats');
      const data = await res.json();
      setStats(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxDeptCount =
    stats && stats.participationByDepartment.length > 0
      ? stats.participationByDepartment[0].count
      : 1;

  const totalReviewed =
    (stats?.approvedParticipations ?? 0) + (stats?.rejectedParticipations ?? 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Diversity Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Social engagement metrics — participation across departments and activity trends.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Participations"
              value={stats?.totalParticipations ?? 0}
              icon="👥"
              color="bg-blue-50"
            />
            <SummaryCard
              label="Approved"
              value={stats?.approvedParticipations ?? 0}
              icon="✅"
              color="bg-green-50"
            />
            <SummaryCard
              label="Pending"
              value={stats?.pendingParticipations ?? 0}
              icon="⏳"
              color="bg-amber-50"
            />
            <SummaryCard
              label="Active Activities"
              value={stats?.activeActivities ?? 0}
              icon="🌿"
              color="bg-emerald-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Participation Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-800 mb-1">Participation by Department</h2>
              <p className="text-xs text-slate-400 mb-5">
                Total participation records per department
              </p>

              {stats && stats.participationByDepartment.length > 0 ? (
                <div className="space-y-3.5">
                  {stats.participationByDepartment.map((d, i) => (
                    <HorizontalBar
                      key={d.deptId}
                      label={d.deptName}
                      value={d.count}
                      max={maxDeptCount}
                      rank={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-sm">
                  No participation data yet
                </div>
              )}
            </div>

            {/* Approval Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-800 mb-1">Approval Status Breakdown</h2>
              <p className="text-xs text-slate-400 mb-5">
                Distribution of all participation records
              </p>

              <div className="space-y-4">
                <DonutSlice
                  label="Approved"
                  count={stats?.approvedParticipations ?? 0}
                  total={stats?.totalParticipations ?? 1}
                  color="bg-emerald-500"
                  bgColor="bg-emerald-400"
                />
                <DonutSlice
                  label="Pending"
                  count={stats?.pendingParticipations ?? 0}
                  total={stats?.totalParticipations ?? 1}
                  color="bg-amber-400"
                  bgColor="bg-amber-400"
                />
                <DonutSlice
                  label="Rejected"
                  count={stats?.rejectedParticipations ?? 0}
                  total={stats?.totalParticipations ?? 1}
                  color="bg-red-400"
                  bgColor="bg-red-400"
                />
              </div>

              {/* Approval rate callout */}
              {totalReviewed > 0 && (
                <div className="mt-6 bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      {Math.round(
                        ((stats?.approvedParticipations ?? 0) / totalReviewed) * 100
                      )}
                      % approval rate
                    </p>
                    <p className="text-xs text-emerald-600">
                      of {totalReviewed} reviewed records
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top 5 Activities */}
          {stats && stats.topActivities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50">
                <h2 className="font-semibold text-slate-800">🏆 Top 5 CSR Activities</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by employee participation count
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-slate-500 font-medium w-10">#</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-medium">Activity</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-medium">Department</th>
                      <th className="text-right px-5 py-3 text-slate-500 font-medium">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.topActivities.map((a, i) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                              i === 0
                                ? 'bg-amber-100 text-amber-700'
                                : i === 1
                                ? 'bg-slate-100 text-slate-600'
                                : i === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-50 text-slate-500'
                            }`}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800">{a.title}</td>
                        <td className="px-5 py-4">
                          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {a.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{a.department}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="bg-emerald-100 rounded-full h-2 w-20"
                              title={`${a.participationCount} participants`}
                            >
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    stats.topActivities[0].participationCount > 0
                                      ? (a.participationCount /
                                          stats.topActivities[0].participationCount) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800 w-6 text-right">
                              {a.participationCount}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {stats && stats.totalParticipations === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-semibold text-slate-700">No data to display yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Once employees start participating in CSR activities, insights will appear here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
