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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Policy Acknowledgements</h1>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#2a2a2a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Policy</th>
              <th className="px-6 py-4 font-medium">Acknowledged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {acks.map((ack) => (
              <tr key={ack.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{ack.employee?.name || '-'}</td>
                <td className="px-6 py-4">{ack.policy?.title || '-'}</td>
                <td className="px-6 py-4 text-purple-400">{new Date(ack.acknowledgedAt).toLocaleString()}</td>
              </tr>
            ))}
            {acks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
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
