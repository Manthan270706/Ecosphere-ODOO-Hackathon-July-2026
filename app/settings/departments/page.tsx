"use client";

import { useEffect, useState } from "react";

type Department = {
  id: string;
  name: string;
  code: string;
  status: string;
  employeeCount: number;
  parentDept: { name: string } | null;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const res = await fetch("/api/settings/departments");
    setDepartments(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", code: "" });
      loadData();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  async function handleDeactivate(id: string) {
  const res = await fetch(`/api/settings/departments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    alert(err.error || "Failed to deactivate department");
    return;
  }

  loadData();
}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <input
          placeholder="Department Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Code (e.g. MFG)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add Department
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow-sm text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Employees</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-3">{d.name}</td>
                <td className="p-3">{d.code}</td>
                <td className="p-3">{d.employeeCount}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${d.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="p-3">
                  {d.status === "active" && (
                    <button onClick={() => handleDeactivate(d.id)} className="text-red-600 text-xs">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
