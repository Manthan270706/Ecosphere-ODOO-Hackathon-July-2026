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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Badge Gallery</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-orange-500/50 transition-colors">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 mb-4 text-3xl">
              {/* Fallback emoji if no iconUrl */}
              {badge.iconUrl ? <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" /> : '🏆'}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{badge.name}</h3>
            <p className="text-sm text-gray-400">{badge.description || 'Unlock this badge by completing challenges and earning XP.'}</p>
          </div>
        ))}
        {badges.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-xl border border-gray-800">
            No badges configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
