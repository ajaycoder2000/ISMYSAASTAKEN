"use client";

interface ScanMeterProps {
  plan?: string;
  role?: string;
  scansUsed?: number;
  scansLimit?: number;
  onClick?: () => void;
}

export default function ScanMeter({
  plan = "free",
  role = "user",
  scansUsed = 1,
  scansLimit = 3,
  onClick,
}: ScanMeterProps) {
  const isAdmin = role === "admin" || plan === "admin";
  const isFounderPro = isAdmin || plan === "founder_pro" || plan === "pro";
  const isSprintPass = plan === "sprint_pass" || plan === "sprint";

  // Admin / Founder Pro unlimited badge
  if (isFounderPro) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10.5px] font-extrabold font-[family-name:var(--font-mono)] tracking-[0.5px] shadow-sm select-none"
        title={isAdmin ? "Admin Testing Mode: Full Founder Pro Unlimited Access" : "Founder Pro: Unlimited Access Active"}
      >
        <span>⚡</span> {isAdmin ? "ADMIN • FOUNDER PRO" : "FOUNDER PRO UNLIMITED"}
      </div>
    );
  }

  // Sprint pass unlimited badge
  if (isSprintPass) {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/30 rounded-lg bg-amber-500/10 text-amber-400 text-[10.5px] font-extrabold font-[family-name:var(--font-mono)] tracking-[0.5px] shadow-sm select-none"
        title="Sprint Pass Active"
      >
        <span>🏃</span> SPRINT PASS UNLIMITED
      </div>
    );
  }

  const remaining = scansLimit - scansUsed;
  const depleted = remaining <= 0;
  const warning = remaining === 1;

  const segColor = depleted
    ? "bg-[var(--red)] shadow-[0_0_6px_#6b3a33]"
    : warning
    ? "bg-[var(--amber)] shadow-[0_0_6px_var(--amber-mid,#6b5a2a)]"
    : "bg-[var(--accent)] shadow-[0_0_6px_var(--accent-mid)]";

  const borderColor = depleted
    ? "border-[#6b3a33]"
    : warning
    ? "border-[var(--amber-mid,#6b5a2a)]"
    : "border-[var(--border)]";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--panel-raised)] border ${borderColor} hover:border-[var(--accent-mid)] transition-all cursor-pointer`}
      title="Monthly Scans Remaining"
    >
      <span className="text-xs">⚡</span>

      {/* Segment bars */}
      <div className="flex gap-[3px]">
        {Array.from({ length: scansLimit }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-2 rounded-sm transition-all duration-300 ${
              i < scansUsed ? segColor : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] whitespace-nowrap">
        {depleted ? "0 left" : `${scansUsed} / ${scansLimit}`}
      </span>
    </button>
  );
}
