"use client";

import { useEffect, useState } from "react";

type EmissionFactor = {
  id: string;
  activityType: string;
  factorValue: string;
  unit: string;
  source: string | null;
  effectiveDate: string;
};

export default function EmissionFactorsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [form, setForm] = useState({ activityType: "", factorValue: "", unit: "", source: "" });
  const [loading, setLoading] = useState(true);

  async function loadFactors() {
    const res = await fetch("/api/environmental/emission-factors");
    const data = await res.json();
    setFactors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadFactors();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/environmental/emission-factors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, factorValue: parseFloat(form.factorValue) }),
    });
    setForm({ activityType: "", factorValue: "", unit: "", source: "" });
    loadFactors();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/environmental/emission-factors/${id}`, { method: "DELETE" });
    loadFactors();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Emission Factors</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <h2 className="font-medium text-slate-700">Add Emission Factor</h2>
        <input
          placeholder="Activity Type (e.g. Diesel Fuel)"
          value={form.activityType}
          onChange={(e) => setForm({ ...form, activityType: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Factor Value (kg CO2e per unit)"
          type="number"
          step="0.0001"
          value={form.factorValue}
          onChange={(e) => setForm({ ...form, factorValue: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Unit (e.g. liter, kWh)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Source (optional, e.g. GHG Protocol 2024)"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add Factor
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow-sm text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Activity Type</th>
              <th className="p-3">Factor Value</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Source</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="p-3">{f.activityType}</td>
                <td className="p-3">{f.factorValue}</td>
                <td className="p-3">{f.unit}</td>
                <td className="p-3">{f.source || "—"}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(f.id)} className="text-red-600 text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
