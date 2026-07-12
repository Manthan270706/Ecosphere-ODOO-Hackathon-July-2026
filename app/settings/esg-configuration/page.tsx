"use client";

import { useEffect, useState } from "react";

type Config = {
  id: string;
  envWeight: string;
  socialWeight: string;
  governanceWeight: string;
  autoEmissionCalc: boolean;
  requireEvidenceCsr: boolean;
  autoBadgeAward: boolean;
  emailAlertsCompliance: boolean;
};

export default function ESGConfigurationPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function loadConfig() {
    const res = await fetch("/api/settings/esg-configuration");
    setConfig(await res.json());
  }

  useEffect(() => {
    loadConfig();
  }, []);

  async function handleSave() {
    if (!config) return;
    setError("");
    setSaved(false);
    const res = await fetch("/api/settings/esg-configuration", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      setSaved(true);
      loadConfig();
    } else {
      const err = await res.json();
      setError(err.error);
    }
  }

  if (!config) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-800">ESG Configuration</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {saved && <p className="text-emerald-600 text-sm">Saved successfully</p>}

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h2 className="font-medium text-slate-700">Score Weighting (must sum to 1.0)</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500">Environmental</label>
            <input
              type="number" step="0.01" value={config.envWeight}
              onChange={(e) => setConfig({ ...config, envWeight: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Social</label>
            <input
              type="number" step="0.01" value={config.socialWeight}
              onChange={(e) => setConfig({ ...config, socialWeight: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Governance</label>
            <input
              type="number" step="0.01" value={config.governanceWeight}
              onChange={(e) => setConfig({ ...config, governanceWeight: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <h2 className="font-medium text-slate-700 pt-2">Toggles</h2>
        {[
          { key: "autoEmissionCalc", label: "Enable auto emission calculation" },
          { key: "requireEvidenceCsr", label: "Require evidence for all CSR activities" },
          { key: "autoBadgeAward", label: "Auto-award badges on challenge completion" },
          { key: "emailAlertsCompliance", label: "Email alerts for new compliance issues" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={(config as any)[item.key]}
              onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked } as Config)}
            />
            {item.label}
          </label>
        ))}

        <button onClick={handleSave} className="bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
