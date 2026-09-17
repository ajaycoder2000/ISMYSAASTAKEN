'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface AdminNavProps {
  adminEmail: string;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Usage Analytics', icon: '📈' },
  { href: '/admin/users', label: 'User Directory', icon: '👥' },
  { href: '/admin/coupons', label: 'Coupons & Promos', icon: '🎟️' },
  { href: '/admin/scans', label: 'Scans Feed', icon: '🔍' },
  { href: '/admin/sponsors', label: 'Sponsors & Ads', icon: '⚡' },
  { href: '/admin/settings', label: 'Site Settings', icon: '⚙️' },
];

export default function AdminNav({ adminEmail }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-[var(--bg-surface)] border-b md:border-b-0 md:border-r border-[var(--border)] flex-shrink-0 flex flex-col justify-between">
      <div>
        {/* Header / Brand */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="Logo" width={22} height={22} className="rounded" />
              <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-sm text-[var(--text-primary)] tracking-tight">
                ismysaas<span className="text-[var(--accent-amber)]">taken</span>
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider bg-amber-500/15 text-[var(--accent-amber)] px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                Admin
              </span>
            </div>
            <p className="mt-1 text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] truncate max-w-[190px]">
              {adminEmail}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-inter)] transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-surface-alt)] text-[var(--accent-amber)] font-semibold border-l-2 border-[var(--accent-amber)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]'
                }`}
              >
                <span className="text-sm opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Back to site */}
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors font-[family-name:var(--font-inter)]"
        >
          <span>←</span>
          <span>Back to public site</span>
        </Link>
      </div>
    </aside>
  );
}
