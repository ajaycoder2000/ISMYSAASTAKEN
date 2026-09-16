'use client';

import { useState } from 'react';
import ValidationSelfCheck from './ValidationSelfCheck';
import StartupFailureChart, { FailureKey } from './StartupFailureChart';

export function WhyValidationMattersSection() {
  const [topRisk, setTopRisk] = useState<FailureKey | null>(null);

  const handleScrollToScan = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('scan-input') || document.getElementById('scan-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-12 sm:py-20 max-w-3xl mx-auto px-2 sm:px-4">
      {/* Eyebrow */}
      <div className="text-center mb-3">
        <span className="text-[10.5px] font-bold font-[family-name:var(--font-mono)] tracking-[0.2em] text-[hsl(42,95%,55%)] uppercase">
          FOUNDER RISK TELEMETRY
        </span>
      </div>

      {/* 1. Heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] text-center tracking-tight leading-snug mb-3">
        Why idea validation matters
      </h2>

      {/* 2. Subhead */}
      <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] text-center mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
        42% of startups fail for one avoidable reason. Answer 3 questions to see which failure your idea is most exposed to.
      </p>

      {/* 3. The interactive self-check */}
      <div className="mb-8">
        <ValidationSelfCheck
          onComplete={setTopRisk}
          onReset={() => setTopRisk(null)}
        />
      </div>

      {/* 4. The StartupFailureChart responding to topRisk */}
      <div className="mt-8">
        <StartupFailureChart highlightKey={topRisk ?? 'no_market_need'} />
      </div>

      {/* 5. CTA linking to the scanner */}
      <div className="text-center mt-8 sm:mt-10">
        <a
          href="/#scan-form"
          onClick={handleScrollToScan}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-button font-[family-name:var(--font-space-grotesk)] font-bold transition-all shadow-lg shadow-[rgba(245,166,35,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>Run a real scan to check it</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}

export default WhyValidationMattersSection;
