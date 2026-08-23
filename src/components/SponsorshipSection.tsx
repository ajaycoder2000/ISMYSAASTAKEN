'use client';

export default function SponsorshipSection() {
  return (
    <section id="sponsors-section" className="w-full mx-auto pt-6 sm:pt-8">
      {/* Header & Subhead */}
      <div className="mb-8">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-1.5 block font-semibold">
          Partnerships
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
          Sponsor ismysaastaken
        </h2>
        <p className="mt-2.5 text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
          Put your dev tool, SaaS boilerplate, or infrastructure product directly in front of technical founders at the exact moment they decide what to build. Sponsor cards appear in the desktop side rails shown to every visitor, plus rotate through the recent-scans feed.
        </p>
      </div>

      {/* Live Preview Box */}
      <div className="mb-10 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[hsl(40,8%,45%)] font-medium">
            Live Placement Preview
          </span>
          <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
            Identical to live rails
          </span>
        </div>

        {/* Exact Mockup Card matching SponsorRail */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(220,10%,30%)] rounded-lg p-3.5 transition-all max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-[hsl(220,10%,16%)] border border-[hsl(220,10%,22%)] flex items-center justify-center flex-shrink-0 text-base mt-0.5">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)]">
                  YourProduct.io
                </span>
                <span className="text-[9px] sm:text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] uppercase tracking-wider bg-[hsl(220,10%,16%)] px-1.5 py-0.5 rounded font-medium">
                  Sponsor
                </span>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
                Your one-line punchy description here. Speaks directly to solo founders and builders.
              </p>
              <span className="inline-block mt-1.5 text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,20%,90%)] hover:underline cursor-pointer">
                yourproduct.io/founders →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Numbered Steps — Non-card horizontal flow (contrast to boxed cards) */}
      <div className="mb-12">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,45%)] block mb-5 font-semibold">
          How it works
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,8%,35%)] block mb-1">
              01
            </span>
            <h4 className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-1">
              Submit Details
            </h4>
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] leading-relaxed">
              Send your product name, target URL, and a clean one-line description.
            </p>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,8%,35%)] block mb-1">
              02
            </span>
            <h4 className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-1">
              Go Live in 24h
            </h4>
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] leading-relaxed">
              Your placement enters the active rotation across all page views and side rails.
            </p>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,8%,35%)] block mb-1">
              03
            </span>
            <h4 className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-1">
              Monthly Analytics
            </h4>
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] leading-relaxed">
              Receive a simple monthly report of impressions and verified outbound clicks.
            </p>
          </div>
        </div>
      </div>

      {/* Sponsor Pricing Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Starter Sponsor Tier */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Starter Placement
              </h4>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                Standard
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3.5">
              <span className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $199
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                /month
              </span>
            </div>

            <ul className="space-y-2 mb-5 text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                Desktop side-rail rotation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                Recent scans feed placement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                Monthly click & impression report
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                Cancel anytime, no commitment
              </li>
            </ul>
          </div>

          <a
            href="mailto:sponsor@ismysaastaken.com?subject=Starter%20Sponsorship%20Inquiry"
            className="w-full text-center py-2.5 px-4 bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,92%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
          >
            Get Starter Slot →
          </a>
        </div>

        {/* Featured Sponsor Tier */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,24%)] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Featured Placement
              </h4>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,20%,90%)] font-bold">
                Max Exposure
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-3.5">
              <span className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $499
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                /month
              </span>
            </div>

            <ul className="space-y-2 mb-5 text-xs text-[hsl(40,20%,85%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,20%,90%)] font-bold">★</span>
                Fixed top position in desktop side rails
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,20%,90%)] font-bold">★</span>
                Permanent presence on public share URLs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,20%,90%)] font-bold">★</span>
                Highlighted badge & priority rotation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,20%,90%)] font-bold">★</span>
                Bi-weekly analytics & founder support
              </li>
            </ul>
          </div>

          <a
            href="mailto:sponsor@ismysaastaken.com?subject=Featured%20Sponsorship%20Inquiry"
            className="w-full text-center py-2.5 px-4 bg-[hsl(220,10%,20%)] hover:bg-[hsl(220,10%,28%)] text-[hsl(40,20%,92%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
          >
            Get Featured Slot →
          </a>
        </div>
      </div>
    </section>
  );
}
