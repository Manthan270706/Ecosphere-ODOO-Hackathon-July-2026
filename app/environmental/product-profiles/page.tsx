"use client";

import { useEffect, useState } from "react";

type Factor = { id: string; activityType: string };
type Profile = { id: string; productName: string; lifecycleNotes: string | null; emissionFactor: { activityType: string } };

export default function ProductProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [form, setForm] = useState({ productName: "", emissionFactorId: "", lifecycleNotes: "" });

  async function loadData() {
    const [pRes, fRes] = await Promise.all([
      fetch("/api/environmental/product-profiles"),
      fetch("/api/environmental/emission-factors"),
    ]);
    setProfiles(await pRes.json());
    setFactors(await fRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/environmental/product-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ productName: "", emissionFactorId: "", lifecycleNotes: "" });
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Product ESG Profiles</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <input
          placeholder="Product Name"
          value={form.productName}
          onChange={(e) => setForm({ ...form, productName: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={form.emissionFactorId}
          onChange={(e) => setForm({ ...form, emissionFactorId: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select Emission Factor</option>
          {factors.map((f) => (
            <option key={f.id} value={f.id}>{f.activityType}</option>
          ))}
        </select>
        <input
          placeholder="Lifecycle Notes (optional)"
          value={form.lifecycleNotes}
          onChange={(e) => setForm({ ...form, lifecycleNotes: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add Profile
        </button>
      </form>
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {profiles.map((p) => (
          <div key={p.id} className="p-4">
            <p className="font-medium text-slate-800">{p.productName}</p>
            <p className="text-xs text-slate-500">Factor: {p.emissionFactor.activityType}</p>
            {p.lifecycleNotes && <p className="text-xs text-slate-500 mt-1">{p.lifecycleNotes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
