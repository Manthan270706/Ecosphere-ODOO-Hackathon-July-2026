'use client';
import { useState, useEffect } from 'react';

type Acknowledgement = {
  id: string;
  policy: { title: string };
  employee: { name: string };
  acknowledgedAt: string;
};

export default function PolicyAcknowledgementsPage() {
  const [acks, setAcks] = useState<Acknowledgement[]>([]);

  useEffect(() => {
    fetchAcks();
  }, []);

  const fetchAcks = async () => {
    const res = await fetch('/api/governance/acknowledgements');
    const data = await res.json();
    setAcks(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Policy Acknowledgements</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track employee sign-offs on ESG policies.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Policy</th>
              <th className="px-6 py-4 font-medium">Acknowledged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {acks.map((ack) => (
              <tr key={ack.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{ack.employee?.name || '-'}</td>
                <td className="px-6 py-4">{ack.policy?.title || '-'}</td>
                <td className="px-6 py-4 text-purple-600 font-medium">{new Date(ack.acknowledgedAt).toLocaleString()}</td>
              </tr>
            ))}
            {acks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No acknowledgements recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
