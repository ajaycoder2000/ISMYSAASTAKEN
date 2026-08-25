"use client";

interface ScanMeterProps {
  plan?: "free" | "pro" | "sprint";
  scansUsed?: number;
  scansLimit?: number;
  onClick?: () => void;
}

export default function ScanMeter({
  plan = "free",
  scansUsed = 1,
  scansLimit = 3,
  onClick,
}: ScanMeterProps) {
  // Pro badge
  if (plan === "pro") {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--amber-mid,#6b5a2a)] rounded-lg bg-[var(--amber-dim,#3d2c0c)] text-[var(--amber)] text-[10.5px] font-extrabold tracking-[0.5px] cursor-pointer shadow-sm"
      >
        <span>⚡</span> PRO UNLIMITED
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
              i < scansUsed ? segColor : "bg-[hsl(220,10%,20%)]"
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
