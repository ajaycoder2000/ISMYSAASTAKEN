import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-surface)] mt-20 sm:mt-28 transition-colors duration-200">
      <div className="w-full max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
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
                className="h-5 sm:h-6 w-auto object-contain hidden dark:block"
              />
              <Image
                src="/logo-light.png"
                alt="IsMySaaSTaken"
                width={180}
                height={22}
                className="h-5 sm:h-6 w-auto object-contain block dark:hidden"
              />
            </Link>
            <p className="mt-1 text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
              Instant market validation and competitive gap discovery for SaaS founders.
            </p>
          </div>

          {/* Core Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-[family-name:var(--font-inter)] text-[var(--text-secondary)]">
            <Link href="/keywords" className="hover:text-[var(--accent-emerald)] transition-colors flex items-center gap-1 font-medium">
              <span>Keyword Radar</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/15 text-[var(--accent-emerald)] rounded font-bold">NEW</span>
            </Link>
            <Link href="/is-it-taken" className="hover:text-[var(--accent-amber)] transition-colors flex items-center gap-1 font-medium">
              <span>Is It Taken?</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-500/15 text-[var(--accent-amber)] rounded font-bold">NEW</span>
            </Link>
            <Link href="/why-validation-matters" className="hover:text-[var(--accent-amber)] transition-colors flex items-center gap-1 font-medium">
              <span>Why Validate?</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-500/15 text-[var(--accent-amber)] rounded font-bold">QUIZ</span>
            </Link>
            <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">
              Pricing
            </Link>
            <Link href="/#recent-scans" className="hover:text-[var(--text-primary)] transition-colors">
              Live Feed
            </Link>
            <Link href="/roadmap" className="hover:text-[var(--text-primary)] transition-colors">
              Roadmap 🚀
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Category Intelligence SEO Index Links */}
        <div className="py-5 border-b border-[var(--border)]">
          <p className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)] mb-2.5">
            Market Intelligence Categories:
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-[family-name:var(--font-inter)] text-[var(--text-secondary)]">
            <Link href="/category/ai-agents" className="hover:text-[var(--accent-amber)] transition-colors">
              🤖 AI & Automation
            </Link>
            <Link href="/category/dev-tools" className="hover:text-[var(--accent-amber)] transition-colors">
              🛠️ Developer Tools
            </Link>
            <Link href="/category/micro-saas" className="hover:text-[var(--accent-amber)] transition-colors">
              ⚡ Micro-SaaS
            </Link>
            <Link href="/category/b2b-saas" className="hover:text-[var(--accent-amber)] transition-colors">
              📈 B2B SaaS
            </Link>
            <Link href="/category/creator-economy" className="hover:text-[var(--accent-amber)] transition-colors">
              🎨 Creator Economy
            </Link>
          </div>
        </div>

        {/* Privacy & Legal Disclaimer */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-[family-name:var(--font-inter)] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-4">
            <span>🔒 Private &amp; Confidential • Web results are AI-grounded in real-time.</span>
            <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors underline">
              Privacy Policy
            </Link>
          </div>
          <p className="text-[var(--text-dim)]">
            © {new Date().getFullYear()} ismysaastaken.
          </p>
        </div>
      </div>
    </footer>
  );
}
