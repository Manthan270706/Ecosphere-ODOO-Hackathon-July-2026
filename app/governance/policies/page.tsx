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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', version: '' });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    const res = await fetch('/api/governance/policies');
    const data = await res.json();
    setPolicies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/governance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setIsModalOpen(false);
    setFormData({ title: '', content: '', version: '' });
    fetchPolicies();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">ESG Policies</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Policy
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#2a2a2a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Version</th>
              <th className="px-6 py-4 font-medium">Published At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {policies.map((policy) => (
              <tr key={policy.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{policy.title}</td>
                <td className="px-6 py-4">{policy.version || '-'}</td>
                <td className="px-6 py-4">{new Date(policy.publishedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No policies found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create New Policy</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Anti-Corruption Policy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 1.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Policy content..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-transparent border border-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
