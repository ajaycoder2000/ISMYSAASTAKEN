'use client';

interface ComparisonPair {
  aspect: string;
  theirLabel: string;
  theirText: string;
  theirTag: string;
  ourLabel: string;
  ourText: string;
  ourTag: string;
}

export const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    aspect: 'Market Saturation & Competitor Discovery',
    theirLabel: 'CHATGPT RESPONSE',
    theirText:
      '"There are several competitors in the voice notes space, including Otter.ai, Fireflies, and others. The market is growing but there may be room for differentiation through unique features or pricing strategies..."',
    theirTag: 'VAGUE & UNGROUNDED',
    ourLabel: 'ISMYSASSTAKEN VERDICT',
    ourText:
      '3 active competitors found: Otter.ai ($16.99/mo), Fireflies ($10/mo), Fathom (free/$19/mo). Saturation: LOW. Most players focus on broad meeting notes, leaving a wide gap for direct task creation in tools like Linear.',
    ourTag: 'LIVE DATA & PRICING',
  },
  {
    aspect: 'Output Durability & Shareability',
    theirLabel: 'CHATGPT OUTPUT',
    theirText:
      "A raw text paragraph buried in a transient chat session that you'll lose in your prompt history. No permanent link, no verified competitor pricing, no exportable deck assets.",
    theirTag: 'LOST IN CHAT HISTORY',
    ourLabel: 'ISMYSASSTAKEN OUTPUT',
    ourText:
      'A permanent permalink (/r/slug), dynamic OpenGraph preview card for Twitter/X, interactive 2D competitive scatter matrix, verified competitor links, and 1-click PNG pitch deck export.',
    ourTag: 'PERMANENT FOUNDER ASSET',
  },
];

export default function WhyThisExists() {
  return (
    <section className="w-full py-12 sm:py-16">
      {/* Eyebrow */}
      <div className="text-center mb-3">
        <span className="text-[10.5px] font-bold font-[family-name:var(--font-mono)] tracking-[0.2em] text-[hsl(42,95%,55%)] uppercase">
          SAME QUESTION, DIFFERENT ANSWERS
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] text-center leading-snug mb-2">
        What you get when you ask ChatGPT vs. IsMySaaSTaken
      </h2>

      {/* Subheadline */}
      <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] text-center mb-10 max-w-xl mx-auto">
        General chatbots produce diplomatic paragraphs. We build single-purpose intelligence to help you decide whether to code or pivot.
      </p>

      {/* Comparison Grid */}
      <div className="space-y-6">
        {COMPARISON_PAIRS.map((pair, i) => (
          <div
            key={i}
            className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-6 transition-all"
          >
            <div className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)] mb-4">
              {pair.aspect}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ChatGPT Side */}
              <div className="p-4 rounded-xl bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] border-l-4 border-l-[hsl(0,72%,50%,0.6)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] tracking-wider text-[hsl(40,8%,50%)]">
                      {pair.theirLabel}
                    </span>
                    <span className="text-[9px] font-extrabold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[rgba(255,103,89,0.1)] text-[hsl(0,72%,65%)] border border-[hsl(0,72%,50%,0.3)]">
                      {pair.theirTag}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] leading-relaxed italic">
                    {pair.theirText}
                  </p>
                </div>
              </div>

              {/* IsMySaaSTaken Side */}
              <div className="p-4 rounded-xl bg-[hsl(220,15%,12%)] border border-[hsl(42,95%,55%,0.35)] border-l-4 border-l-[hsl(42,95%,55%)] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] tracking-wider text-[hsl(42,95%,55%)]">
                      {pair.ourLabel}
                    </span>
                    <span className="text-[9px] font-extrabold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)]">
                      {pair.ourTag}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-inter)] leading-relaxed font-medium">
                    {pair.ourText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center mt-8 text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-lg mx-auto">
        Both use AI. One is a{' '}
        <strong className="text-[hsl(40,8%,70%)]">general chatbot</strong>. The other is a{' '}
        <strong className="text-[hsl(42,95%,55%)]">real-time grounded market validation engine</strong>.
      </p>
    </section>
  );
}
