'use client';
import { useState, useEffect } from 'react';

type Participation = {
  id: string;
  challenge: { title: string; xp: number };
  employee: { name: string };
  proofUrl: string | null;
  approvalStatus: string;
};

export default function ParticipationPage() {
  const [participations, setParticipations] = useState<Participation[]>([]);

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    const res = await fetch('/api/gamification/participation');
    const data = await res.json();
    setParticipations(data);
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/gamification/participation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'approved' }),
    });
    fetchParticipations();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/gamification/participation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'rejected' }),
    });
    fetchParticipations();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Participation Approval Queue</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review proofs and award XP to employees.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Activity/Challenge</th>
              <th className="px-6 py-4 font-medium">Proof</th>
              <th className="px-6 py-4 font-medium">Points</th>
              <th className="px-6 py-4 font-medium">Approval</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {participations.map((part) => (
              <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{part.employee?.name || '-'}</td>
                <td className="px-6 py-4">{part.challenge?.title || '-'}</td>
                <td className="px-6 py-4">
                  {part.proofUrl ? (
                    <a href={part.proofUrl} target="_blank" className="text-orange-600 hover:underline font-medium">View Proof</a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{part.challenge?.xp || 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    part.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' : 
                    part.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {part.approvalStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {part.approvalStatus === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(part.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Approve
                      </button>
                      <button onClick={() => handleReject(part.id)} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {participations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No pending participations right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
