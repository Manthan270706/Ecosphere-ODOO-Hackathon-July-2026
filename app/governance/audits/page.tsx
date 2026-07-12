'use client';
import { useState, useEffect } from 'react';

type Audit = {
  id: string;
  title: string;
  department: { name: string };
  auditor: { name: string };
  auditDate: string | null;
  findings: string | null;
  status: string;
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', departmentId: '', auditorId: '', auditDate: '', findings: '' });

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    const res = await fetch('/api/governance/audits');
    const data = await res.json();
    setAudits(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/governance/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setIsModalOpen(false);
    setFormData({ title: '', departmentId: '', auditorId: '', auditDate: '', findings: '' });
    fetchAudits();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Audits</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Audit
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#2a2a2a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Auditor</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {audits.map((audit) => (
              <tr key={audit.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{audit.title}</td>
                <td className="px-6 py-4">{audit.department?.name || '-'}</td>
                <td className="px-6 py-4">{audit.auditor?.name || '-'}</td>
                <td className="px-6 py-4">{audit.auditDate ? new Date(audit.auditDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${audit.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {audit.status}
                  </span>
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No audits found.
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
              <h2 className="text-xl font-bold text-white">Create New Audit</h2>
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
                />
              </div>
              {/* Need real inputs for department/auditor in production, text for hackathon speed */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department ID</label>
                <input
                  required
                  type="text"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Auditor (Employee ID)</label>
                <input
                  required
                  type="text"
                  value={formData.auditorId}
                  onChange={(e) => setFormData({ ...formData, auditorId: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
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
                  Create Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
