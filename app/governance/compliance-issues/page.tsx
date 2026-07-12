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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compliance Issues</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and resolve compliance infractions.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-purple-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
          <span>+</span> New Issue
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    issue.severity === 'high' || issue.severity === 'critical' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{issue.department?.name || '-'}</td>
                <td className="px-6 py-4">{issue.owner?.name || '-'}</td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {new Date(issue.dueDate).toLocaleDateString()}
                  {issue.isOverdue && <span className="ml-2 text-red-600 text-xs font-bold">OVERDUE</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    issue.status === 'resolved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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
