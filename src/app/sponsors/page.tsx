import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sponsor ismysaastaken — Reach SaaS Founders Where They Validate Ideas',
  description: 'Put your dev tool or SaaS infrastructure product in front of founders at the exact moment they\'re evaluating whether to build. One sponsor slot, no clutter.',
};

export default function SponsorsPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] mb-4">
            Sponsorship
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight text-[hsl(40,20%,92%)] leading-[1.15]">
            Reach SaaS founders at the
            <br />
            exact moment they decide to build
          </h1>
          <p className="mt-5 text-base text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-2xl">
            Every person who uses this tool is actively evaluating a SaaS idea. They&apos;re technical, 
            they move fast, and they&apos;re about to commit time and money to a project. Your dev tool 
            or infrastructure product shows up at exactly the right moment — not in a crowded ad feed, 
            but as a single, curated placement inside their research results.
          </p>
        </div>

        {/* What you're buying */}
        <section className="mb-14">
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-6">
            What you&apos;re buying
          </h2>
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-6 sm:p-8">
            {/* Mock sponsor slot */}
            <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)] uppercase tracking-widest mb-4">
              Your placement looks like this:
            </p>
            <div className="bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,20%)] rounded-lg p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[hsl(42,95%,55%,0.1)] border border-[hsl(42,95%,55%,0.2)] flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)]">Y</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)]">
                    Your Product Name
                  </span>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)] uppercase tracking-wider">
                    Sponsor
                  </span>
                </div>
                <p className="mt-1 text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
                  Your one-line pitch goes here. Keep it sharp, keep it relevant.
                </p>
                <span className="inline-block mt-2 text-xs text-[hsl(42,95%,55%)] font-[family-name:var(--font-mono)] hover:underline cursor-pointer">
                  yourproduct.com →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Where it appears */}
        <section className="mb-14">
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-6">
            Where it appears
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-5">
              <h3 className="text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)] mb-2">
                Every scan result
              </h3>
              <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
                Your placement appears at the bottom of every scan result — the moment a founder 
                has just learned about their competitive landscape and is thinking about next steps.
              </p>
            </div>
            <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-5">
              <h3 className="text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)] mb-2">
                Every shared result page
              </h3>
              <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
                When founders share their scan results on Twitter/X, Reddit, or Slack — the primary 
                viral loop — your brand travels with it. Every shared link is a new impression.
              </p>
            </div>
          </div>
        </section>

        {/* Who sees it */}
        <section className="mb-14">
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-6">
            Who sees it
          </h2>
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-5 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)]">100%</p>
                <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-1">
                  SaaS founders actively validating ideas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">Technical</p>
                <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-1">
                  Builders who buy dev tools, infrastructure, and APIs
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">High intent</p>
                <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-1">
                  They&apos;re about to start building — your tool could be what they pick
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="mb-14">
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-6">
            What you get
          </h2>
          <ul className="space-y-3">
            {[
              'One dedicated slot — not a grid of 12 sponsors competing for attention',
              'Your logo, one-line pitch, and link in every scan result',
              'Placement on all shared result pages (the viral loop)',
              'Monthly report: impressions, clicks, and click-through rate',
              'Minimum commitment: 1 month. Cancel anytime.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[hsl(40,20%,82%)] font-[family-name:var(--font-inter)]">
                <svg className="w-4 h-4 text-[hsl(42,95%,55%)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing */}
        <section className="mb-14">
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-6">
            Sponsorship pricing
          </h2>
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(42,95%,55%,0.2)] rounded-xl p-6 sm:p-8">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">$500</span>
              <span className="text-sm text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">/month</span>
            </div>
            <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
              Flat rate. No CPM games, no hidden fees. One slot, one sponsor, full attention.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <a
            href="mailto:sponsor@ismysaastaken.com?subject=Sponsorship%20Inquiry"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-base rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
          >
            Get in touch →
          </a>
          <p className="mt-4 text-xs text-[hsl(40,8%,35%)] font-[family-name:var(--font-inter)]">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <Link 
            href="/"
            className="text-xs text-[hsl(40,8%,35%)] hover:text-[hsl(40,8%,55%)] transition-colors font-[family-name:var(--font-inter)]"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
