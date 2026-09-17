export default function HowItWorksPipeline() {
  const steps = [
    {
      step: '01',
      title: 'Real-Time Web Crawl',
      badge: 'Google Search Grounded',
      description:
        'We query live search indexes to discover actual production tools, Product Hunt launches, and stealth competitors—not outdated static databases.',
      icon: '🌐',
    },
    {
      step: '02',
      title: 'Density & Pricing Matrix',
      badge: 'Signal Strength Meter',
      description:
        'Our algorithm evaluates competitor pricing, target ICPs, and feature overlap to output an honest saturation level (Low, Medium, or High).',
      icon: '📊',
    },
    {
      step: '03',
      title: 'Moat & Strategic Wedge',
      badge: 'Actionable Takeaway',
      description:
        'Get clear, contrarian positioning suggestions: vertical pivots, open-source alternatives, or micro-features to carve out a profitable moat.',
      icon: '⚡',
    },
  ];

  return (
    <section className="w-full mx-auto py-10 sm:py-16">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[var(--text-muted)] font-bold block mb-2">
          ENGINE ARCHITECTURE
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
          How It Validates Your SaaS in 5 Seconds
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-lg mx-auto">
          No generic filler text. Real market data, real competitors, and actionable differentiation.
        </p>
      </div>

      {/* 3-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-amber)]/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 relative group shadow-sm"
          >
            {/* Step number badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-2 py-0.5 rounded border border-[var(--accent-amber)]/25">
                STEP {item.step}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] transition-colors">
              {item.title}
            </h3>

            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] block mt-0.5 mb-2.5">
              {item.badge}
            </span>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
