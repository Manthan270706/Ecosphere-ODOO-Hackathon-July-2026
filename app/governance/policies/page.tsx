'use client';
import { useState, useEffect } from 'react';

type Policy = {
  id: string;
  title: string;
  content: string | null;
  version: string | null;
  publishedAt: string;
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', version: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolicies();
    fetchAcknowledged();
  }, []);

  const fetchPolicies = async () => {
    const res = await fetch('/api/governance/policies');
    if (res.ok) {
      const data = await res.json();
      setPolicies(data);
    }
  };

  const fetchAcknowledged = async () => {
    const res = await fetch('/api/governance/acknowledgements');
    if (res.ok) {
      const data = await res.json();
      setAcknowledged(new Set(data.map((a: { policyId: string }) => a.policyId)));
    }
  };

  const handleAcknowledge = async (policyId: string) => {
    const res = await fetch('/api/governance/acknowledgements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyId }),
    });
    if (res.ok) {
      setAcknowledged((prev) => new Set([...prev, policyId]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/governance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', content: '', version: '' });
        fetchPolicies();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to publish policy.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ESG Policies</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage corporate policies and versions across the organization.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-purple-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
        >
          <span>+</span> New Policy
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Version</th>
              <th className="px-6 py-4 font-medium">Published At</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {policies.map((policy) => {
              const isAcknowledged = acknowledged.has(policy.id);
              return (
                <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{policy.title}</td>
                  <td className="px-6 py-4">{policy.version || '-'}</td>
                  <td className="px-6 py-4">{new Date(policy.publishedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {isAcknowledged ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ✓ Acknowledged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!isAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(policy.id)}
                        className="text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {policies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No policies found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create New Policy</h2>
              <button onClick={() => { setIsModalOpen(false); setError(''); }} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  placeholder="e.g., Anti-Corruption Policy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  placeholder="e.g., 1.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none"
                  placeholder="Policy content..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
