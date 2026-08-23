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
    <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest text-[hsl(40,8%,55%)]">
          Scans this month
        </span>
        <span className={`text-sm font-[family-name:var(--font-mono)] font-bold ${
          isUnlimited ? 'text-[hsl(145,60%,45%)]' : isNearLimit ? 'text-[hsl(0,72%,55%)]' : 'text-[hsl(40,20%,92%)]'
        }`}>
          {isUnlimited ? `${used} — ∞ unlimited` : `${used}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <>
          <div className="w-full h-1.5 bg-[hsl(220,10%,18%)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isNearLimit ? 'bg-[hsl(0,72%,55%)]' : 'bg-[hsl(42,95%,55%)]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {resetDate && (
            <p className="mt-2 text-xs text-[hsl(40,8%,35%)] font-[family-name:var(--font-inter)]">
              Resets {new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
