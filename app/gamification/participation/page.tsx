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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Employee Participation Approval Queue</h1>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#2a2a2a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Activity/Challenge</th>
              <th className="px-6 py-4 font-medium">Proof</th>
              <th className="px-6 py-4 font-medium">Points</th>
              <th className="px-6 py-4 font-medium">Approval</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {participations.map((part) => (
              <tr key={part.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{part.employee?.name || '-'}</td>
                <td className="px-6 py-4">{part.challenge?.title || '-'}</td>
                <td className="px-6 py-4">
                  {part.proofUrl ? (
                    <a href={part.proofUrl} target="_blank" className="text-orange-400 hover:underline">View Proof</a>
                  ) : (
                    <span className="text-gray-500">No proof</span>
                  )}
                </td>
                <td className="px-6 py-4">{part.challenge?.xp || 0}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    part.approvalStatus === 'approved' ? 'bg-green-500/10 text-green-400' : 
                    part.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {part.approvalStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {part.approvalStatus === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(part.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleReject(part.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {participations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No participations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
