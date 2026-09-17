'use client';

interface UsageBarProps {
  used: number;
  limit: number | null; // null = unlimited (pro)
  resetDate?: string;
}

export default function UsageBar({ used, limit, resetDate }: UsageBarProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest text-[var(--text-muted)]">
          Scans this month
        </span>
        <span className={`text-sm font-[family-name:var(--font-mono)] font-bold ${
          isUnlimited ? 'text-[var(--accent-emerald)]' : isNearLimit ? 'text-[var(--red)]' : 'text-[var(--text-primary)]'
        }`}>
          {isUnlimited ? `${used} — ∞ unlimited` : `${used}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isNearLimit ? 'bg-[var(--red)]' : 'bg-[var(--accent-amber)]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {resetDate && (
            <p className="mt-2 text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)]">
              Resets {new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
