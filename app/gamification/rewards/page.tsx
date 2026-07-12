'use client';
import { useState, useEffect } from 'react';

type Reward = {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  stock: number;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const res = await fetch('/api/gamification/rewards');
    const data = await res.json();
    setRewards(data);
  };

  const handleRedeem = async (rewardId: string) => {
    const employeeId = 'test-employee-id'; // In real app, from session
    try {
      const res = await fetch('/api/gamification/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, rewardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Reward redeemed successfully!');
      fetchRewards(); // refresh stock
    } catch (e: any) {
      alert(`Failed to redeem: ${e.message}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reward Catalog</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg shadow-orange-500/20">
                  {reward.pointsRequired} XP
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{reward.description || 'Redeem your hard-earned XP for this amazing reward.'}</p>
              
              <div className="text-xs text-gray-500 mb-6 font-medium">
                {reward.stock > 0 ? (
                  <span className="text-green-400">{reward.stock} remaining in stock</span>
                ) : (
                  <span className="text-red-400">Out of stock</span>
                )}
              </div>
            </div>

            <button
              disabled={reward.stock <= 0}
              onClick={() => handleRedeem(reward.id)}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                reward.stock > 0 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Redeem Reward
            </button>
          </div>
        ))}
        {rewards.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border border-gray-800">
            No active rewards available right now.
          </div>
        )}
      </div>
    </div>
  );
}
