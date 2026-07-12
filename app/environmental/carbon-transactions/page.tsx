"use client";

import { useEffect, useState } from "react";

type Factor = { id: string; activityType: string; factorValue: string; unit: string };
type Department = { id: string; name: string };
type Transaction = {
  id: string;
  quantity: string;
  co2Calculated: string;
  sourceModule: string;
  transactionDate: string;
  department: { name: string };
  emissionFactor: { activityType: string; unit: string };
};

export default function CarbonTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ departmentId: "", emissionFactorId: "", sourceModule: "manual", quantity: "" });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [txRes, factorRes, deptRes] = await Promise.all([
      fetch("/api/environmental/carbon-transactions"),
      fetch("/api/environmental/emission-factors"),
      fetch("/api/settings/departments"),
    ]);
    setTransactions(await txRes.json());
    setFactors(await factorRes.json());
    if (deptRes.ok) setDepartments(await deptRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/environmental/carbon-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity) }),
    });
    setForm({ departmentId: "", emissionFactorId: "", sourceModule: "manual", quantity: "" });
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Carbon Transactions</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3 max-w-lg">
        <h2 className="font-medium text-slate-700">Log Carbon Data</h2>
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
        <select
          value={form.emissionFactorId}
          onChange={(e) => setForm({ ...form, emissionFactorId: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select Emission Factor</option>
          {factors.map((f) => (
            <option key={f.id} value={f.id}>{f.activityType} ({f.unit})</option>
          ))}
        </select>
        <select
          value={form.sourceModule}
          onChange={(e) => setForm({ ...form, sourceModule: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="manual">Manual</option>
          <option value="purchase">Purchase</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="expense">Expense</option>
          <option value="fleet">Fleet</option>
        </select>
        <input
          placeholder="Quantity"
          type="number"
          step="0.01"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Log Transaction
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow-sm text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Department</th>
              <th className="p-3">Activity</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">CO2 Calculated (kg)</th>
              <th className="p-3">Source</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-3">{t.department.name}</td>
                <td className="p-3">{t.emissionFactor.activityType}</td>
                <td className="p-3">{t.quantity} {t.emissionFactor.unit}</td>
                <td className="p-3 font-medium">{t.co2Calculated}</td>
                <td className="p-3 capitalize">{t.sourceModule}</td>
                <td className="p-3">{new Date(t.transactionDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
