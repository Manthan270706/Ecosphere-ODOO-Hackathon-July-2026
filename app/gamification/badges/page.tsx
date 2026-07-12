'use client';
import { useState, useEffect } from 'react';

type Badge = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    const res = await fetch('/api/gamification/badges');
    const data = await res.json();
    setBadges(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Badge Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover achievements and badges you can earn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-orange-200 transition-all">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 text-3xl shadow-sm">
              {/* Fallback emoji if no iconUrl */}
              {badge.iconUrl ? <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" /> : '🏆'}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{badge.name}</h3>
            <p className="text-sm text-slate-500">{badge.description || 'Unlock this badge by completing challenges and earning XP.'}</p>
          </div>
        ))}
        {badges.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-3xl mb-2">🏅</p>
            <p className="font-semibold text-slate-700">No badges configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
