'use client';
import { useState, useEffect } from 'react';

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  xp: number;
  difficulty: string;
  deadline: string | null;
  status: string;
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const res = await fetch('/api/gamification/challenges');
    const data = await res.json();
    setChallenges(data);
  };

  const handleJoin = async (challengeId: string) => {
    const employeeId = 'test-employee-id'; // This would fail foreign key unless seeded properly, handled in participation API.
    try {
      await fetch('/api/gamification/participation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, employeeId }),
      });
      alert('Joined challenge successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to join challenge. Ensure you are logged in.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Challenges</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete tasks to earn XP and climb the leaderboard.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-orange-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors shadow-sm">
          <span>+</span> New Challenge
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['Draft', 'Active', 'Under Review', 'Completed', 'Archived'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'Active' ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.filter(c => c.status === 'active').map((challenge) => (
          <div key={challenge.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-orange-200 transition-all group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{challenge.title}</h3>
                <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  {challenge.xp} XP
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{challenge.description || 'Complete this sustainability challenge to earn points!'}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    challenge.difficulty === 'easy' ? 'bg-green-500' : 
                    challenge.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></span>
                  {challenge.difficulty.toUpperCase()}
                </span>
                {challenge.deadline && (
                  <span>Due: {new Date(challenge.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleJoin(challenge.id)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              Join Challenge
            </button>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-3xl mb-2">🏆</p>
            <p className="font-semibold text-slate-700">No active challenges right now.</p>
            <p className="text-sm mt-1">Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
