import type { Metadata } from 'next';
import Link from 'next/link';
import LiveVisitorHUD from '@/components/live/LiveVisitorHUD';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Live Visitor Telemetry & Real-Time Traffic | Is My SaaS Taken?',
  description:
    'Live public traffic dashboard. See real-time visitors, active global countries, and SaaS idea validation activity.',
  alternates: {
    canonical: `${SITE_URL}/live`,
  },
  openGraph: {
    title: 'Live Visitor Telemetry | Is My SaaS Taken?',
    description: 'Live public traffic dashboard. Country-level only, nobody is identifiable.',
    url: `${SITE_URL}/live`,
  },
};

export default function LiveDashboardPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto py-8 sm:py-12">
      {/* Breadcrumb / Top Navigation */}
      <div className="flex items-center justify-between mb-6 text-xs font-mono text-[var(--text-muted)]">
        <Link
          href="/"
          className="hover:text-[var(--accent-amber)] transition-colors flex items-center gap-1.5"
        >
          ← Return to Idea Scanner
        </Link>
        <span className="text-[var(--text-dim)] uppercase tracking-wider">OPEN TELEMETRY</span>
      </div>

      {/* Main HUD */}
      <LiveVisitorHUD />

      {/* Transparency / Methodology Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-left font-mono">
          <div className="text-[var(--accent-emerald)] text-xs font-bold uppercase tracking-wider mb-2">
            🛡️ Privacy First
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-inter)]">
            Country-level geolocation only. We do not store raw IP addresses, cookies, or track personal identities.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-left font-mono">
          <div className="text-[var(--accent-amber)] text-xs font-bold uppercase tracking-wider mb-2">
            ⚡ Edge Architecture
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-inter)]">
            Telemetry is processed across distributed edge nodes for instant responsiveness and zero impact on site load speeds.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-left font-mono">
          <div className="text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            🌍 Global Reach
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-inter)]">
            Founders from 120+ countries use IsMySaaSTaken to research competitors and uncover real market moats.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)] mb-2 relative z-10">
          Ready to validate your SaaS idea?
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5 font-[family-name:var(--font-inter)] relative z-10">
          Search real competitors, check space saturation, and find your unique angle in seconds.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-2.5 bg-[var(--accent-amber)] hover:opacity-90 text-black font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md relative z-10"
        >
          Scan An Idea Now →
        </Link>
      </div>
    </main>
  );
}
