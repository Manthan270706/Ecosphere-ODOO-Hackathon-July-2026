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
    // In a real app, employeeId comes from session. Hardcoding for hackathon test.
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Challenges</h1>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Challenge
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {['Draft', 'Active', 'Under Review', 'Completed', 'Archived'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === 'Active' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.filter(c => c.status === 'active').map((challenge) => (
          <div key={challenge.id} className="bg-[#1e1e1e] border border-orange-500/30 rounded-xl p-6 flex flex-col justify-between hover:border-orange-500 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                <span className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/20">
                  {challenge.xp} XP
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{challenge.description || 'Complete this sustainability challenge to earn points!'}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    challenge.difficulty === 'easy' ? 'bg-green-500' : 
                    challenge.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
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
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Join Challenge
            </button>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border border-gray-800">
            No active challenges right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
