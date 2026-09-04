'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[hsl(220,10%,14%)] bg-[hsl(220,15%,7%)] mt-20 sm:mt-28">
      <div className="w-full max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[hsl(220,10%,12%)]">
          {/* Logo & Tagline */}
          <div>
            <Link
              href="/"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="IsMySaaSTaken"
                width={180}
                height={22}
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </Link>
            <p className="mt-1 text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
              Instant market validation and competitive gap discovery for SaaS founders.
            </p>
          </div>

          {/* Core Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-[family-name:var(--font-inter)] text-[hsl(40,8%,55%)]">
            <Link href="/keywords" className="hover:text-[hsl(145,60%,55%)] transition-colors flex items-center gap-1 font-medium">
              <span>Keyword Radar</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] rounded">NEW</span>
            </Link>
            <Link href="/pricing" className="hover:text-[hsl(40,20%,92%)] transition-colors">
              Pricing
            </Link>
            <Link href="/#recent-scans" className="hover:text-[hsl(40,20%,92%)] transition-colors">
              Live Feed
            </Link>
            <Link href="/roadmap" className="hover:text-[hsl(40,20%,92%)] transition-colors">
              Roadmap 🚀
            </Link>
            <Link href="/dashboard" className="hover:text-[hsl(40,20%,92%)] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Category Intelligence SEO Index Links */}
        <div className="py-5 border-b border-[hsl(220,10%,12%)]">
          <p className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,40%)] mb-2.5">
            Market Intelligence Categories:
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-[family-name:var(--font-inter)] text-[hsl(40,8%,55%)]">
            <Link href="/category/ai-agents" className="hover:text-[hsl(42,95%,55%)] transition-colors">
              🤖 AI & Automation
            </Link>
            <Link href="/category/dev-tools" className="hover:text-[hsl(42,95%,55%)] transition-colors">
              🛠️ Developer Tools
            </Link>
            <Link href="/category/micro-saas" className="hover:text-[hsl(42,95%,55%)] transition-colors">
              ⚡ Micro-SaaS
            </Link>
            <Link href="/category/b2b-saas" className="hover:text-[hsl(42,95%,55%)] transition-colors">
              📈 B2B SaaS
            </Link>
            <Link href="/category/creator-economy" className="hover:text-[hsl(42,95%,55%)] transition-colors">
              🎨 Creator Economy
            </Link>
          </div>
        </div>

        {/* Privacy & Legal Disclaimer */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-[family-name:var(--font-inter)] text-[hsl(40,8%,40%)]">
          <div className="flex flex-wrap items-center gap-4">
            <span>🔒 Private &amp; Confidential • Web results are AI-grounded in real-time.</span>
            <Link href="/terms" className="text-[hsl(40,8%,55%)] hover:text-[hsl(42,95%,55%)] transition-colors underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-[hsl(40,8%,55%)] hover:text-[hsl(42,95%,55%)] transition-colors underline">
              Privacy Policy
            </Link>
          </div>
          <p className="text-[hsl(40,8%,30%)]">
            © {new Date().getFullYear()} ismysaastaken.
          </p>
        </div>
      </div>
    </footer>
  );
}
