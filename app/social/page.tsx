'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalActivities: number;
  activeActivities: number;
  totalParticipations: number;
  pendingParticipations: number;
  approvedParticipations: number;
  rejectedParticipations: number;
  participationByDepartment: { deptId: string; deptName: string; count: number }[];
  topActivities: {
    id: string;
    title: string;
    department: string;
    category: string;
    participationCount: number;
  }[];
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start gap-4`}>
      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
  icon,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  icon: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {badge} pending
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
          {title}
        </p>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
      </div>
      <span className="text-emerald-600 text-sm font-medium group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

export default function SocialPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/social/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Social Module</h1>
          <p className="text-slate-500 mt-1">
            Manage CSR activities, employee participation, and diversity insights.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          ESG Social Track
        </div>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Activities"
            value={stats?.totalActivities ?? 0}
            sub={`${stats?.activeActivities ?? 0} active`}
            icon="🌿"
            color="bg-emerald-50"
          />
          <StatCard
            label="Total Participations"
            value={stats?.totalParticipations ?? 0}
            sub="all time"
            icon="👥"
            color="bg-blue-50"
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.pendingParticipations ?? 0}
            sub="awaiting review"
            icon="⏳"
            color="bg-amber-50"
          />
          <StatCard
            label="Approved"
            value={stats?.approvedParticipations ?? 0}
            sub={`${stats?.rejectedParticipations ?? 0} rejected`}
            icon="✅"
            color="bg-green-50"
          />
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink
            href="/social/csr-activities"
            title="CSR Activities"
            desc="Create and manage corporate social responsibility activities for departments."
            icon="🌱"
          />
          <QuickLink
            href="/social/participation"
            title="Participation"
            desc="Join activities, submit proof, and review your approval status."
            icon="🙋"
            badge={stats?.pendingParticipations}
          />
          <QuickLink
            href="/social/diversity"
            title="Diversity Dashboard"
            desc="View participation breakdown by department and engagement trends."
            icon="📊"
          />
        </div>
      </div>

      {/* Top Activities */}
      {stats && stats.topActivities.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            🏆 Most Engaged Activities
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Activity</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Department</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-medium">Participants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.topActivities.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{a.title}</td>
                    <td className="px-5 py-3">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{a.department}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">
                      {a.participationCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state when no data yet */}
      {!loading && stats && stats.totalActivities === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🌿</p>
          <p className="font-semibold text-slate-700">No activities yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Start by creating a CSR Activity to get the ball rolling.
          </p>
          <Link
            href="/social/csr-activities"
            className="inline-block mt-4 bg-emerald-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create First Activity
          </Link>
        </div>
      )}
    </div>
  );
}
