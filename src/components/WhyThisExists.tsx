'use client';

interface ComparisonPair {
  theirLabel: string;
  theirText: string;
  theirTag: string;
  ourLabel: string;
  ourText: string;
  ourTag: string;
}

export const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    theirLabel: 'CHATGPT SAYS',
    theirText:
      '"There are several competitors in the voice notes space, including Otter.ai, Fireflies, and others. The market is growing but there may be room for differentiation through unique features or pricing strategies..."',
    theirTag: 'vague',
    ourLabel: 'THIS TOOL SAYS',
    ourText:
      '3 competitors found: Otter.ai ($16.99/mo), Fireflies ($10/mo), Fathom (free/$19/mo). Saturation: LOW. Most players focus on general meeting transcription, not a direct push into project trackers like Linear. A tight, single-integration tool could win on speed and simplicity.',
    ourTag: 'actionable',
  },
  {
    theirLabel: 'CHATGPT GIVES YOU',
    theirText:
      "A paragraph buried in a chat thread you'll never find again. No links. No pricing. No verdict.",
    theirTag: 'gone',
    ourLabel: 'THIS TOOL GIVES YOU',
    ourText:
      'A permanent shareable URL. An OG image for Twitter. Competitor cards with real links. A landscape chart for your pitch deck. A history you can track over time.',
    ourTag: 'permanent',
  },
];

export default function WhyThisExists() {
  return (
    <section className="w-full max-w-[680px] mx-auto py-12 sm:py-16">
      {/* Eyebrow */}
      <div className="text-center mb-3">
        <span className="text-[10.5px] font-bold font-[family-name:var(--font-mono)] tracking-[0.2em] text-[hsl(42,95%,55%)] uppercase">
          SAME QUESTION, DIFFERENT ANSWERS
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] text-center leading-snug mb-2">
        What you get when you ask ChatGPT vs. what you get here
      </h2>

      {/* Subheadline */}
      <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] text-center mb-8">
        Same idea. Very different output.
      </p>

      {/* Comparison pairs */}
      <div className="flex flex-col gap-4">
        {COMPARISON_PAIRS.map((pair, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {/* Their bubble */}
            <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] tracking-wider text-[hsl(40,8%,50%)] pl-1">
              {pair.theirLabel}
            </span>
            <div className="px-4 py-3.5 rounded-xl bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] border-l-2 border-l-[hsl(0,72%,55%,0.5)] text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] leading-relaxed">
              {pair.theirText}
              <span className="inline-block text-[9px] font-extrabold font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded ml-2 align-middle bg-[rgba(255,103,89,0.1)] text-[var(--red)] border border-[#6b3a33]">
                {pair.theirTag}
              </span>
            </div>

            {/* Our bubble */}
            <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] tracking-wider text-[hsl(42,95%,55%)] pl-1 mt-1">
              {pair.ourLabel}
            </span>
            <div className="px-4 py-3.5 rounded-xl bg-[hsl(220,15%,10%)] border border-[hsl(42,95%,55%,0.3)] border-l-2 border-l-[hsl(42,95%,55%)] text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-inter)] leading-relaxed shadow-sm">
              {pair.ourText}
              <span className="inline-block text-[9px] font-extrabold font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded ml-2 align-middle bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)]">
                {pair.ourTag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center mt-7 text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] leading-relaxed">
        Both use AI. One is a{' '}
        <strong className="text-[hsl(40,8%,70%)]">general chatbot</strong>. The other is a{' '}
        <strong className="text-[hsl(42,95%,55%)]">single-purpose research engine</strong> built
        for this exact founder decision.
      </p>
    </section>
  );
}
