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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reward Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">
            Spend your XP on real-world rewards and perks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-orange-200 transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{reward.name}</h3>
                <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  {reward.pointsRequired} XP
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">{reward.description || 'Redeem your hard-earned XP for this amazing reward.'}</p>
              
              <div className="text-xs font-medium mb-6">
                {reward.stock > 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{reward.stock} remaining in stock</span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">Out of stock</span>
                )}
              </div>
            </div>

            <button
              disabled={reward.stock <= 0}
              onClick={() => handleRedeem(reward.id)}
              className={`w-full py-2.5 rounded-xl font-medium transition-colors shadow-sm ${
                reward.stock > 0 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              Redeem Reward
            </button>
          </div>
        ))}
        {rewards.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-3xl mb-2">🎁</p>
            <p className="font-semibold text-slate-700">No rewards available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
