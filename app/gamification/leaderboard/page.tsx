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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🏆 EcoSphere Leaderboard
        </h1>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-orange-500/10 text-orange-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-bold w-20">Rank</th>
              <th className="px-6 py-4 font-bold">Employee</th>
              <th className="px-6 py-4 font-bold">Department</th>
              <th className="px-6 py-4 font-bold text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {entries.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </td>
                <td className="px-6 py-4 font-bold text-white text-base">{entry.name}</td>
                <td className="px-6 py-4">{entry.department?.name || '-'}</td>
                <td className="px-6 py-4 text-right font-bold text-orange-400 text-base">
                  {entry.xpPoints.toLocaleString()}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  The leaderboard is currently empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
