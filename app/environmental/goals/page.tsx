"use client";

import { useEffect, useState } from "react";

type Goal = {
  id: string;
  name: string;
  targetCo2: string;
  currentCo2: string;
  deadline: string | null;
  status: string;
  department: { name: string };
};

export default function EnvironmentalGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ departmentId: "", name: "", targetCo2: "", currentCo2: "0", deadline: "" });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [goalsRes, deptRes] = await Promise.all([
      fetch("/api/environmental/goals"),
      fetch("/api/settings/departments"),
    ]);
    setGoals(await goalsRes.json());
    if (deptRes.ok) setDepartments(await deptRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/environmental/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetCo2: parseFloat(form.targetCo2),
        currentCo2: parseFloat(form.currentCo2),
      }),
    });
    setForm({ departmentId: "", name: "", targetCo2: "", currentCo2: "0", deadline: "" });
    loadData();
  }

  function progressPercent(g: Goal) {
    const target = parseFloat(g.targetCo2);
    const current = parseFloat(g.currentCo2);
    if (target === 0) return 0;
    const pct = Math.max(0, Math.min(100, ((target - current) / target) * 100));
    return Math.round(pct);
  }

  const statusColor: Record<string, string> = {
    active: "bg-slate-200 text-slate-700",
    on_track: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    missed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Environmental Goals</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <h2 className="font-medium text-slate-700">Add Goal</h2>
        <select
          value={form.departmentId}
          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <input
          placeholder="Goal Name (e.g. Reduce Fleet Emissions)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Target CO2 (kg)"
          type="number"
          value={form.targetCo2}
          onChange={(e) => setForm({ ...form, targetCo2: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Current CO2 (kg)"
          type="number"
          value={form.currentCo2}
          onChange={(e) => setForm({ ...form, currentCo2: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add Goal
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {goals.map((g) => (
            <div key={g.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{g.name}</p>
                  <p className="text-xs text-slate-500">{g.department.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[g.status] || ""}`}>
                  {g.status}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${progressPercent(g)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {g.currentCo2} / {g.targetCo2} kg CO2 — {progressPercent(g)}% reduced
                {g.deadline && ` — due ${new Date(g.deadline).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
