'use client';

export type FailureKey = 'no_market_need' | 'ran_out_of_cash' | 'wrong_team' | 'outcompeted';

interface FailureReason {
  key: FailureKey;
  label: string;
  percentage: number;
  description: string;
}

const FAILURE_REASONS: FailureReason[] = [
  {
    key: 'no_market_need',
    label: 'No market need',
    percentage: 42,
    description: 'Tackling problems that lack genuine, paying customer demand',
  },
  {
    key: 'ran_out_of_cash',
    label: 'Ran out of cash',
    percentage: 29,
    description: 'Burned capital before achieving sustainable distribution',
  },
  {
    key: 'wrong_team',
    label: 'Wrong team',
    percentage: 23,
    description: 'Lacking the required technical, domain, or sales execution',
  },
  {
    key: 'outcompeted',
    label: 'Got outcompeted',
    percentage: 19,
    description: 'Blinded by faster incumbents or stealth rivals with stronger moats',
  },
];

interface StartupFailureChartProps {
  highlightKey?: FailureKey | null;
  className?: string;
}

export default function StartupFailureChart({
  highlightKey = 'no_market_need',
  className = '',
}: StartupFailureChartProps) {
  const activeKey = highlightKey || 'no_market_need';

  return (
    <div
      className={`w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden ${className}`}
      aria-label="Startup Failure Reasons Chart"
    >
      {/* Background ambient glow behind highlighted chart */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-3.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)] animate-pulse" />
          <span className="text-[11px] font-[family-name:var(--font-mono)] font-bold tracking-wider uppercase text-[var(--text-muted)]">
            POST-MORTEM TELEMETRY // TOP 4 STARTUP KILLERS
          </span>
        </div>
        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
          N=100+ Startup Post-Mortems
        </span>
      </div>

      {/* Chart Bars */}
      <div className="space-y-4 sm:space-y-5">
        {FAILURE_REASONS.map((item) => {
          const isHighlighted = item.key === activeKey;

          return (
            <div
              key={item.key}
              className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                isHighlighted
                  ? 'bg-[var(--bg-surface-alt)] border-[var(--accent-amber)] shadow-[0_0_20px_rgba(245,166,35,0.12)]'
                  : 'bg-[var(--bg-surface)] border border-[var(--border)] opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-[family-name:var(--font-space-grotesk)] text-sm sm:text-base font-bold transition-colors ${
                      isHighlighted ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isHighlighted && (
                    <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded-full bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 animate-pulse">
                      YOUR TOP EXPOSURE
                    </span>
                  )}
                </div>
                <span
                  className={`font-[family-name:var(--font-mono)] text-sm sm:text-base font-bold transition-colors ${
                    isHighlighted ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.percentage}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2.5 sm:h-3 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-[var(--accent-amber)] to-amber-600 shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                      : 'bg-[var(--text-dim)]/40'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Description */}
              <p
                className={`mt-2 text-xs transition-colors leading-relaxed ${
                  isHighlighted ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'
                }`}
              >
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Attribution Footnote */}
      <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
        <span>Source: CB Insights Research</span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-dim)]">
          Avoidable with upfront validation
        </span>
      </div>
    </div>
  );
}
