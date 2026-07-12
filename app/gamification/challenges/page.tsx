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

const EMPTY_FORM = { title: '', description: '', xp: 100, difficulty: 'medium', deadline: '', status: 'active' };

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const res = await fetch('/api/gamification/challenges');
    const data = await res.json();
    setChallenges(Array.isArray(data) ? data : []);
  };

  const handleJoin = async (challengeId: string) => {
    try {
      const res = await fetch('/api/gamification/participation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      if (res.ok) {
        alert('Joined challenge successfully!');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to join challenge.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to join challenge. Ensure you are logged in.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          xp: Number(form.xp),
          deadline: form.deadline || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm(EMPTY_FORM);
        fetchChallenges();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create challenge.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
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
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-orange-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
        >
          <span>+</span> New Challenge
        </button>
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
        {challenges.filter(c => c.status === 'active').length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-3xl mb-2">🏆</p>
            <p className="font-semibold text-slate-700">No active challenges right now.</p>
            <p className="text-sm mt-1">Create one using the button above!</p>
          </div>
        )}
      </div>

      {/* New Challenge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">New Challenge</h2>
              <button onClick={() => { setShowModal(false); setError(''); }} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. Reduce office paper waste"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  rows={3}
                  placeholder="Describe the challenge..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">XP Points *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.xp}
                    onChange={e => setForm({ ...form, xp: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
