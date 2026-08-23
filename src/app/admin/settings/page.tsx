'use client';

import { useState, useEffect } from 'react';
import ScanningIndicator from '@/components/ScanningIndicator';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    freeTierMonthlyLimit: 3,
    proMonthlyPrice: 12,
    proYearlyPrice: 99,
    estimatedCostPerScan: 0.02,
    updatedAt: '',
  });

  const fetchSettings = () => {
    setLoading(true);
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setFormData({
            freeTierMonthlyLimit: res.data.freeTierMonthlyLimit,
            proMonthlyPrice: res.data.proMonthlyPrice,
            proYearlyPrice: res.data.proYearlyPrice,
            estimatedCostPerScan: res.data.estimatedCostPerScan,
            updatedAt: res.data.updatedAt,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeTierMonthlyLimit: Number(formData.freeTierMonthlyLimit),
          proMonthlyPrice: Number(formData.proMonthlyPrice),
          proYearlyPrice: Number(formData.proYearlyPrice),
          estimatedCostPerScan: Number(formData.estimatedCostPerScan),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Settings updated successfully! Changes take effect immediately.');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-[hsl(220,10%,14%)]">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
          System & Business Settings
        </h1>
        <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
          Configure runtime business parameters, scan quotas, and cost accounting. Changes apply instantly without rebuilds.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-[hsl(145,60%,45%,0.12)] border border-[hsl(145,60%,45%,0.25)] rounded-xl text-xs text-[hsl(145,60%,60%)] font-medium">
          ✓ {successMsg}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <ScanningIndicator size="lg" className="mb-3" />
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">Loading configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: User Quotas */}
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] pb-2 border-b border-[hsl(220,10%,16%)]">
              Scan Limits & Quotas
            </h2>

            <div>
              <label className="text-xs font-semibold text-[hsl(40,20%,90%)] block mb-1">
                Free Tier Monthly Limit (Scans per month)
              </label>
              <p className="text-[11px] text-[hsl(40,8%,50%)] mb-2">
                Number of market scans allocated per calendar month to registered free users before requiring upgrade.
              </p>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={formData.freeTierMonthlyLimit}
                onChange={(e) => setFormData({ ...formData, freeTierMonthlyLimit: parseInt(e.target.value || '1', 10) })}
                className="w-48 bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
              />
            </div>
          </div>

          {/* Section 2: Pro Pricing Display & Defaults */}
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] pb-2 border-b border-[hsl(220,10%,16%)]">
              Pro Subscription Pricing Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[hsl(40,20%,90%)] block mb-1">
                  Pro Monthly Price ($ USD)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.proMonthlyPrice}
                  onChange={(e) => setFormData({ ...formData, proMonthlyPrice: parseInt(e.target.value || '12', 10) })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[hsl(40,20%,90%)] block mb-1">
                  Pro Yearly Price ($ USD)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.proYearlyPrice}
                  onChange={(e) => setFormData({ ...formData, proYearlyPrice: parseInt(e.target.value || '99', 10) })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)]">
              * Note: Actual Stripe billing uses your configured Stripe Price IDs in environment variables.
            </p>
          </div>

          {/* Section 3: Cost Accounting */}
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] pb-2 border-b border-[hsl(220,10%,16%)]">
              API Cost Telemetry
            </h2>

            <div>
              <label className="text-xs font-semibold text-[hsl(40,20%,90%)] block mb-1">
                Estimated Cost per Scan ($ USD)
              </label>
              <p className="text-[11px] text-[hsl(40,8%,50%)] mb-2">
                Used to compute estimated LLM API spend metrics on the dashboard (LLM tokens + live search grounding).
              </p>
              <input
                type="number"
                step="0.005"
                min="0.001"
                required
                value={formData.estimatedCostPerScan}
                onChange={(e) => setFormData({ ...formData, estimatedCostPerScan: parseFloat(e.target.value || '0.02') })}
                className="w-48 bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs font-[family-name:var(--font-space-grotesk)] rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
