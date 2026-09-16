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
      className={`w-full bg-[hsl(220,13%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden ${className}`}
      aria-label="Startup Failure Reasons Chart"
    >
      {/* Background ambient glow behind highlighted chart */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 bg-[hsl(42,95%,55%,0.06)] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-3.5 border-b border-[hsl(220,10%,16%)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
          <span className="text-[11px] font-[family-name:var(--font-mono)] font-bold tracking-wider uppercase text-[hsl(40,8%,50%)]">
            POST-MORTEM TELEMETRY // TOP 4 STARTUP KILLERS
          </span>
        </div>
        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
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
                  ? 'bg-[hsl(220,15%,12%)] border-[hsl(42,95%,55%,0.5)] shadow-[0_0_20px_rgba(245,166,35,0.12)]'
                  : 'bg-[hsl(220,14%,8%)] border-[hsl(220,10%,16%)] opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-[family-name:var(--font-space-grotesk)] text-sm sm:text-base font-bold transition-colors ${
                      isHighlighted ? 'text-[hsl(40,20%,95%)]' : 'text-[hsl(40,8%,70%)]'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isHighlighted && (
                    <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded-full bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)] animate-pulse">
                      YOUR TOP EXPOSURE
                    </span>
                  )}
                </div>
                <span
                  className={`font-[family-name:var(--font-mono)] text-sm sm:text-base font-bold transition-colors ${
                    isHighlighted ? 'text-[hsl(42,95%,55%)]' : 'text-[hsl(40,8%,50%)]'
                  }`}
                >
                  {item.percentage}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2.5 sm:h-3 rounded-full bg-[hsl(220,10%,16%)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-[hsl(42,95%,55%)] to-[hsl(35,95%,50%)] shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                      : 'bg-[hsl(220,10%,26%)]'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Description */}
              <p
                className={`mt-2 text-xs transition-colors leading-relaxed ${
                  isHighlighted ? 'text-[hsl(40,8%,65%)]' : 'text-[hsl(40,8%,45%)]'
                }`}
              >
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Attribution Footnote */}
      <div className="mt-5 pt-3.5 border-t border-[hsl(220,10%,15%)] flex items-center justify-between text-[11px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
        <span>Source: CB Insights Research</span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[hsl(40,8%,40%)]">
          Avoidable with upfront validation
        </span>
      </div>
    </div>
  );
}
