"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; type: string; status: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", type: "csr_activity" });

  async function loadData() {
    const res = await fetch("/api/settings/categories");
    setCategories(await res.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", type: "csr_activity" });
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <input
          placeholder="Category Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="csr_activity">CSR Activity</option>
          <option value="challenge">Challenge</option>
        </select>
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add Category
        </button>
      </form>
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {categories.map((c) => (
          <div key={c.id} className="p-3 flex justify-between">
            <span>{c.name}</span>
            <span className="text-xs text-slate-500 capitalize">{c.type.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
