'use client';
import { useState, useEffect } from 'react';

type LeaderboardEntry = {
  id: string;
  name: string;
  department: { name: string };
  xpPoints: number;
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const res = await fetch('/api/gamification/leaderboard');
    const data = await res.json();
    setEntries(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🏆 EcoSphere Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Top employees driving sustainability across the organization.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium w-20">Rank</th>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-slate-400 text-sm">#{index + 1}</span>}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">{entry.name}</td>
                <td className="px-6 py-4">{entry.department?.name || '-'}</td>
                <td className="px-6 py-4 text-right font-bold text-orange-600 text-base">
                  {entry.xpPoints.toLocaleString()}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="font-semibold text-slate-700">The leaderboard is currently empty.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
