'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[hsl(220,10%,14%)] bg-[hsl(220,15%,7%)] mt-20 sm:mt-28">
      <div className="w-full max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[hsl(220,10%,12%)]">
          {/* Logo & Tagline */}
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-space-grotesk)] font-bold text-[hsl(40,20%,92%)] text-base hover:text-[hsl(42,95%,55%)] transition-colors"
            >
              ismysaas<span className="text-[hsl(42,95%,55%)]">taken</span><span className="text-[hsl(40,8%,45%)]">?</span>
            </Link>
            <p className="mt-1 text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
              Instant market validation and competitive gap discovery for SaaS founders.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-[family-name:var(--font-inter)] text-[hsl(40,8%,55%)]">
            <Link
              href="/#pricing"
              className="hover:text-[hsl(40,20%,92%)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#recent-scans"
              className="hover:text-[hsl(40,20%,92%)] transition-colors"
            >
              Recent Scans
            </Link>
            <Link
              href="/#sponsors-section"
              className="hover:text-[hsl(40,20%,92%)] transition-colors"
            >
              Sponsor
            </Link>
            <Link
              href="/login"
              className="hover:text-[hsl(40,20%,92%)] transition-colors"
            >
              Sign In
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(40,20%,92%)] transition-colors flex items-center gap-1"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-[family-name:var(--font-inter)] text-[hsl(40,8%,40%)]">
          <p>
            Results are AI-generated from live web search — directional, not formal market research.
          </p>
          <p className="text-[hsl(40,8%,30%)]">
            © {new Date().getFullYear()} ismysaastaken.
          </p>
        </div>
      </div>
    </footer>
  );
}
