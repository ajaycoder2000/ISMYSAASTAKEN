'use client';

import { useState, useEffect } from 'react';
import { PlanType, CouponEffectType } from '@/types';

interface CouponItem {
  id: string;
  code: string;
  effect_type: CouponEffectType;
  effect_value: {
    plan?: PlanType;
    days?: number;
    bonus_scans?: number;
    [key: string]: any;
  };
  max_uses?: number | null;
  uses_count: number;
  expires_at?: string | null;
  active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [effectType, setEffectType] = useState<CouponEffectType>('set_plan');
  const [targetPlan, setTargetPlan] = useState<PlanType>('sprint_pass');
  const [planDays, setPlanDays] = useState<number>(7);
  const [extendDays, setExtendDays] = useState<number>(7);
  const [bonusScans, setBonusScans] = useState<number>(5);
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy indicator
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.coupons) {
        setCoupons(json.coupons);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const generateRandomCode = () => {
    const prefixes = ['SPRINT', 'FOUNDER', 'SPEED', 'LAUNCH', 'BOOST', 'PERK'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCode(`${prefix}-${num}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);

    let effectValue: any = {};
    if (effectType === 'set_plan') {
      effectValue = {
        plan: targetPlan,
        days: targetPlan === 'founder_pro' && !planDays ? null : planDays,
      };
    } else if (effectType === 'extend_plan') {
      effectValue = {
        days: Number(extendDays || 7),
      };
    } else if (effectType === 'bonus_free_scans') {
      effectValue = {
        bonus_scans: Number(bonusScans || 1),
      };
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          effectType,
          effectValue,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          active: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to create coupon');
      }

      // Reset form
      setCode('');
      setMaxUses('');
      setExpiresAt('');
      setShowCreateModal(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (couponId: string, currentActive: boolean) => {
    try {
      // Optimistic update
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, active: !currentActive } : c))
      );

      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, active: !currentActive }),
      });

      if (!res.ok) {
        fetchCoupons(); // revert on error
      }
    } catch {
      fetchCoupons();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatEffectSummary = (coupon: CouponItem) => {
    if (coupon.effect_type === 'set_plan') {
      const planName =
        coupon.effect_value.plan === 'founder_pro'
          ? 'Founder Pro'
          : coupon.effect_value.plan === 'sprint_pass'
          ? 'Sprint Pass'
          : 'Free Explorer';
      const days = coupon.effect_value.days ? `${coupon.effect_value.days}d` : 'unlimited';
      return `Set ${planName} (${days})`;
    }
    if (coupon.effect_type === 'extend_plan') {
      return `Extend Plan +${coupon.effect_value.days || 7} Days`;
    }
    if (coupon.effect_type === 'bonus_free_scans') {
      return `+${coupon.effect_value.bonus_scans || 1} Free Scans`;
    }
    return 'Custom Benefit';
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight flex items-center gap-2">
            <span>🎟️</span> Coupon & Promo Codes
          </h1>
          <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)] mt-1">
            Create promotional codes, plan grant passes, and bonus scan perks.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormError(null);
            if (!code) generateRandomCode();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(42,95%,55%)] text-[hsl(220,15%,6%)] font-semibold text-xs font-[family-name:var(--font-mono)] rounded-lg hover:bg-[hsl(42,95%,60%)] transition-colors shadow-sm"
        >
          <span>+</span> Create Coupon
        </button>
      </div>

      {/* Coupon List Table */}
      <div className="rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,14%)] overflow-hidden">
        <div className="p-4 border-b border-[hsl(220,10%,14%)] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-mono)] text-[hsl(40,8%,60%)]">
            Active & Historic Coupons ({coupons.length})
          </h2>
          <button
            onClick={fetchCoupons}
            className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] hover:text-[hsl(42,95%,55%)] transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[hsl(40,8%,50%)] flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[hsl(42,95%,55%)] border-t-transparent rounded-full animate-spin" />
            <span>Loading coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[hsl(40,8%,50%)] space-y-2">
            <p className="text-sm font-semibold text-[hsl(40,20%,90%)]">No Coupons Created Yet</p>
            <p>Click &quot;Create Coupon&quot; to generate promotional passes or free scan vouchers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-mono)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,14%)] text-[hsl(40,8%,45%)] bg-[hsl(220,15%,7%)]">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Effect</th>
                  <th className="py-3 px-4 text-center">Redemptions</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,12%)]">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  const isMaxed =
                    coupon.max_uses !== null &&
                    coupon.max_uses !== undefined &&
                    coupon.uses_count >= coupon.max_uses;

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-[hsl(220,10%,11%)] transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-wider text-[hsl(40,20%,95%)] bg-[hsl(220,10%,14%)] px-2 py-0.5 rounded border border-[hsl(220,10%,20%)]">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            title="Copy coupon code"
                            className="text-[hsl(40,8%,50%)] hover:text-[hsl(42,95%,55%)] text-xs transition-colors"
                          >
                            {copiedCode === coupon.code ? '✓' : '📋'}
                          </button>
                        </div>
                      </td>

                      {/* Effect */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            coupon.effect_type === 'set_plan'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : coupon.effect_type === 'extend_plan'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          }`}
                        >
                          {formatEffectSummary(coupon)}
                        </span>
                      </td>

                      {/* Redemptions */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-semibold ${
                            isMaxed ? 'text-red-400' : 'text-[hsl(40,20%,90%)]'
                          }`}
                        >
                          {coupon.uses_count}
                        </span>
                        <span className="text-[hsl(40,8%,50%)]">
                          {' '}
                          / {coupon.max_uses !== null && coupon.max_uses !== undefined ? coupon.max_uses : '∞'}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4 text-[hsl(40,8%,60%)]">
                        {coupon.expires_at ? (
                          <span className={isExpired ? 'text-red-400 line-through' : ''}>
                            {new Date(coupon.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[hsl(40,8%,40%)]">Never</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                            Expired
                          </span>
                        ) : isMaxed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Maxed Out
                          </span>
                        ) : coupon.active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.active)}
                          className={`text-xs px-2.5 py-1 rounded transition-colors ${
                            coupon.active
                              ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          {coupon.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,18%)] rounded-xl shadow-2xl p-6 relative font-[family-name:var(--font-inter)]">
            <div className="flex items-center justify-between pb-4 border-b border-[hsl(220,10%,16%)] mb-5">
              <h3 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] flex items-center gap-2">
                <span>🎟️</span> Create New Coupon
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)] text-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(40,20%,85%)] mb-1 font-[family-name:var(--font-mono)]">
                  COUPON CODE (UNIQUE)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SPRINT-7DAY"
                    className="flex-1 bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded-lg px-3 py-2 text-sm font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)] uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-[hsl(220,10%,14%)] hover:bg-[hsl(220,10%,18%)] text-xs font-mono text-[hsl(40,8%,70%)] rounded-lg border border-[hsl(220,10%,20%)]"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Effect Type */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(40,20%,85%)] mb-1 font-[family-name:var(--font-mono)]">
                  BENEFIT TYPE
                </label>
                <select
                  value={effectType}
                  onChange={(e) => setEffectType(e.target.value as CouponEffectType)}
                  className="w-full bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded-lg px-3 py-2 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                >
                  <option value="set_plan">Set Plan (Upgrade / Trial)</option>
                  <option value="extend_plan">Extend Active Plan (+Days)</option>
                  <option value="bonus_free_scans">Grant Bonus Free Scans</option>
                </select>
              </div>

              {/* Conditional Effect Details */}
              {effectType === 'set_plan' && (
                <div className="p-3.5 bg-[hsl(220,15%,7%)] rounded-lg border border-[hsl(220,10%,14%)] space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                      Target Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['sprint_pass', 'founder_pro', 'free'] as PlanType[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTargetPlan(p)}
                          className={`py-1.5 px-2 rounded text-xs font-mono text-center border transition-all ${
                            targetPlan === p
                              ? 'bg-[hsl(42,95%,55%,0.15)] border-[hsl(42,95%,55%)] text-[hsl(42,95%,55%)] font-bold'
                              : 'bg-[hsl(220,15%,9%)] border-[hsl(220,10%,18%)] text-[hsl(40,8%,60%)] hover:border-[hsl(40,8%,40%)]'
                          }`}
                        >
                          {p === 'sprint_pass'
                            ? 'Sprint Pass'
                            : p === 'founder_pro'
                            ? 'Founder Pro'
                            : 'Free Explorer'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                      Duration in Days (leave 0 or blank for permanent)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        value={planDays || ''}
                        onChange={(e) => setPlanDays(parseInt(e.target.value) || 0)}
                        placeholder="7"
                        className="w-24 bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded px-3 py-1.5 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                      />
                      <span className="text-xs text-[hsl(40,8%,50%)] font-mono">days</span>
                      <button
                        type="button"
                        onClick={() => setPlanDays(7)}
                        className="text-[11px] font-mono px-2 py-1 bg-[hsl(220,10%,14%)] text-[hsl(42,95%,55%)] rounded border border-[hsl(220,10%,20%)]"
                      >
                        +7d default
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {effectType === 'extend_plan' && (
                <div className="p-3.5 bg-[hsl(220,15%,7%)] rounded-lg border border-[hsl(220,10%,14%)]">
                  <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                    Extension Duration
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      required
                      value={extendDays}
                      onChange={(e) => setExtendDays(parseInt(e.target.value) || 1)}
                      className="w-24 bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded px-3 py-1.5 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                    />
                    <span className="text-xs text-[hsl(40,8%,50%)] font-mono">days to add</span>
                  </div>
                </div>
              )}

              {effectType === 'bonus_free_scans' && (
                <div className="p-3.5 bg-[hsl(220,15%,7%)] rounded-lg border border-[hsl(220,10%,14%)]">
                  <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                    Number of Bonus Free Scans
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      required
                      value={bonusScans}
                      onChange={(e) => setBonusScans(parseInt(e.target.value) || 1)}
                      className="w-24 bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded px-3 py-1.5 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                    />
                    <span className="text-xs text-[hsl(40,8%,50%)] font-mono">extra scans granted</span>
                  </div>
                </div>
              )}

              {/* Max Uses & Expiry */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                    Max Redemptions (blank = ∞)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded-lg px-3 py-1.5 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[hsl(40,8%,60%)] mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[hsl(220,15%,6%)] border border-[hsl(220,10%,18%)] rounded-lg px-3 py-1.5 text-xs font-mono text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(220,10%,16%)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-mono text-[hsl(40,8%,60%)] hover:text-[hsl(40,20%,90%)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !code}
                  className="px-4 py-2 bg-[hsl(42,95%,55%)] text-[hsl(220,15%,6%)] font-semibold text-xs font-mono rounded-lg hover:bg-[hsl(42,95%,60%)] disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
