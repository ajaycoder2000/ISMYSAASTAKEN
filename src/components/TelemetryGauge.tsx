"use client";

interface TelemetryGaugeProps {
  plan?: "free" | "pro" | "sprint";
  scansUsed: number;
  scansLimit: number;
  daysUntilReset?: number;
  nextBillingDate?: string;
  onUpgrade?: () => void;
  onBilling?: () => void;
}

export default function TelemetryGauge({
  plan = "free",
  scansUsed,
  scansLimit,
  daysUntilReset = 12,
  nextBillingDate = "Next month",
  onUpgrade,
  onBilling,
}: TelemetryGaugeProps) {
  const isPro = plan === "pro";
  const fillPct = isPro ? 100 : Math.min(100, (scansUsed / scansLimit) * 100);
  const remaining = isPro ? Infinity : Math.max(0, scansLimit - scansUsed);

  const fillClass = isPro
    ? "from-[var(--amber-dim,#3d2c0c)] to-[var(--amber-mid,#6b5a2a)]"
    : fillPct > 80
    ? "from-[rgba(255,103,89,0.25)] to-[rgba(255,103,89,0.65)]"
    : fillPct > 50
    ? "from-[var(--amber-dim,#3d2c0c)] to-[var(--amber-mid,#6b5a2a)]"
    : "from-[var(--accent-dim)] to-[var(--accent-mid)]";

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 max-w-[480px] w-full mx-auto shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)]">
          Scan Usage Telemetry
        </p>
        <span
          className={`text-[10px] font-extrabold font-[family-name:var(--font-mono)] tracking-wider px-2.5 py-1 rounded-full border ${
            isPro
              ? "bg-[var(--amber-dim,#3d2c0c)] text-[var(--amber)] border-[var(--amber-mid,#6b5a2a)]"
              : "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-mid)]"
          }`}
        >
          {isPro ? "PRO UNLIMITED" : "FREE TIER"}
        </span>
      </div>

      {/* Battery bar */}
      <div className="bg-[hsl(220,15%,8%)] border border-[var(--border)] rounded-xl h-9 overflow-hidden relative mb-4">
        {/* Fill */}
        <div
          className={`h-full rounded-lg bg-gradient-to-r ${fillClass} relative overflow-hidden transition-all duration-700`}
          style={{ width: `${fillPct}%` }}
        />

        {/* Segment lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-r-[rgba(255,255,255,0.06)] last:border-none" />
          ))}
        </div>

        {/* Label */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--text)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {isPro ? "UNLIMITED" : `${scansUsed} / ${scansLimit}`}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl px-4 py-3">
          <p className={`text-xl font-extrabold font-[family-name:var(--font-space-grotesk)] ${isPro ? "text-[var(--amber)]" : "text-[var(--accent)]"}`}>
            {scansUsed}
          </p>
          <p className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] mt-0.5">
            scans {isPro ? "this month" : "used"}
          </p>
        </div>
        <div className="bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl px-4 py-3">
          <p className="text-xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[var(--text)]">
            {isPro ? "∞" : remaining}
          </p>
          <p className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] mt-0.5">
            scans remaining
          </p>
        </div>
      </div>

      {/* Reset / billing info */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-faint)] px-3.5 py-2.5 bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl mb-4 font-[family-name:var(--font-inter)]">
        <span>↻</span>
        {isPro ? (
          <>Next billing cycle: <span className="text-[var(--text-dim)] font-bold">{nextBillingDate}</span></>
        ) : (
          <>Quota resets in <span className="text-[var(--text-dim)] font-bold">{daysUntilReset} days</span></>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isPro ? (
          <button
            onClick={onBilling}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-grotesk)] bg-[var(--amber-dim,#3d2c0c)] border border-[var(--amber-mid,#6b5a2a)] text-[var(--amber)] hover:brightness-110 transition-all cursor-pointer"
          >
            Manage Subscription →
          </button>
        ) : (
          <button
            onClick={onUpgrade}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-grotesk)] bg-[var(--accent)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] transition-all shadow-md cursor-pointer"
          >
            Upgrade to Pro ($12/mo) →
          </button>
        )}
      </div>
    </div>
  );
}
