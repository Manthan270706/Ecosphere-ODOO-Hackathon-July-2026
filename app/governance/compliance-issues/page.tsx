'use client';
import { useState, useEffect } from 'react';

type Issue = {
  id: string;
  severity: string;
  department: { name: string };
  owner: { name: string };
  dueDate: string;
  status: string;
  isOverdue?: boolean;
};

export default function ComplianceIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const res = await fetch('/api/governance/compliance');
    const data = await res.json();
    setIssues(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Compliance Issues</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Issue
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#2a2a2a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.severity === 'high' || issue.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{issue.department?.name || '-'}</td>
                <td className="px-6 py-4">{issue.owner?.name || '-'}</td>
                <td className="px-6 py-4 font-medium">
                  {new Date(issue.dueDate).toLocaleDateString()}
                  {issue.isOverdue && <span className="ml-2 text-red-500 text-xs">OVERDUE</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No compliance issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
