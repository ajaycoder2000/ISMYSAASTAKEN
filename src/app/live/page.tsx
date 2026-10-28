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
      <div className="flex items-center justify-between mb-6 text-xs font-mono text-[#5b7b64]">
        <Link
          href="/"
          className="hover:text-[#10b981] transition-colors flex items-center gap-1.5"
        >
          ← Return to Idea Scanner
        </Link>
        <span className="text-[#3b5240]">OPEN TELEMETRY</span>
      </div>

      {/* Main HUD */}
      <LiveVisitorHUD />

      {/* Transparency / Methodology Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
        <div className="p-5 rounded-xl bg-[#0c100c] border border-[#18261b] text-left font-mono">
          <div className="text-[#10b981] text-xs font-bold uppercase tracking-wider mb-2">
            🛡️ Privacy First
          </div>
          <p className="text-xs text-[#82a48b] leading-relaxed">
            Country-level geolocation only. We do not store raw IP addresses, cookies, or track personal identities.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0c100c] border border-[#18261b] text-left font-mono">
          <div className="text-[#f59e0b] text-xs font-bold uppercase tracking-wider mb-2">
            ⚡ Edge Architecture
          </div>
          <p className="text-xs text-[#82a48b] leading-relaxed">
            Telemetry is processed across distributed edge nodes for instant responsiveness and zero impact on site load speeds.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0c100c] border border-[#18261b] text-left font-mono">
          <div className="text-[#38bdf8] text-xs font-bold uppercase tracking-wider mb-2">
            🌍 Global Reach
          </div>
          <p className="text-xs text-[#82a48b] leading-relaxed">
            Founders from 120+ countries use IsMySaaSTaken to research competitors and uncover real market moats.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#101912] to-[#0a0d0a] border border-[#1b2b1f] text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-2">
          Ready to validate your SaaS idea?
        </h3>
        <p className="text-xs sm:text-sm text-[#8cae96] max-w-md mx-auto mb-5 font-[family-name:var(--font-inter)]">
          Search real competitors, check space saturation, and find your unique angle in seconds.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[#10b981]/20"
        >
          Scan An Idea Now →
        </Link>
      </div>
    </main>
  );
}
