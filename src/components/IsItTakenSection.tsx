'use client';

import React from 'react';
import Link from 'next/link';

export default function IsItTakenSection() {
  const previewDomains = [
    { domain: 'flowlyapp.com', status: 'taken' },
    { domain: 'flowlyapp.io', status: 'available' },
    { domain: 'flowlyapp.co', status: 'taken' },
    { domain: 'flowlyapp.app', status: 'available' },
  ];

  const previewHandles = [
    { platform: 'X (Twitter)', handle: '@flowlyapp', status: 'available' },
    { platform: 'GitHub', handle: 'github.com/flowlyapp', status: 'available' },
    { platform: 'Instagram', handle: '@flowlyapp', status: 'taken' },
    { platform: 'TikTok', handle: '@flowlyapp', status: 'available' },
  ];

  return (
    <section className="w-full my-6 sm:my-10">
      <div className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Copy & CTA */}
          <div className="max-w-xl space-y-3.5 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--accent-amber)] tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-pulse" />
              NAME &amp; HANDLE AVAILABILITY
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight leading-snug">
              Before you build it — is it taken?
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
              Check your startup name across .com, .io, .co, .app domains (via official RDAP protocol) and X, Instagram, TikTok, GitHub — all in one search.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/is-it-taken"
                className="px-5 py-2.5 bg-[var(--accent-amber)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Check a name</span>
                <span>→</span>
              </Link>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                Free &bull; No signup required
              </span>
            </div>
          </div>

          {/* Right Column: Inline Legible Preview (e.g. "flowlyapp") */}
          <div className="w-full lg:max-w-md bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl p-4 sm:p-5 space-y-4 shadow-inner">
            {/* Terminal mock bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                <span className="ml-1 text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                  preview: &quot;flowlyapp&quot;
                </span>
              </div>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-[var(--accent-emerald)] border border-emerald-500/30 font-bold">
                RDAP + PROBE
              </span>
            </div>

            {/* Domains Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold uppercase tracking-wider block">
                Domains (Official RDAP)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {previewDomains.map((d) => (
                  <div
                    key={d.domain}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[11px] font-[family-name:var(--font-mono)]"
                  >
                    <span className="text-[var(--text-primary)] truncate mr-1">{d.domain}</span>
                    {d.status === 'available' ? (
                      <span className="text-[10px] font-bold text-[var(--accent-emerald)] bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/25 shrink-0">
                        Taken
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Handles Preview */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] font-semibold uppercase tracking-wider block">
                Social Handles
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {previewHandles.map((h) => (
                  <div
                    key={h.platform}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[11px] font-[family-name:var(--font-mono)]"
                  >
                    <span className="text-[var(--text-primary)] truncate mr-1">{h.platform}</span>
                    {h.status === 'available' ? (
                      <span className="text-[10px] font-bold text-[var(--accent-emerald)] bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--accent-amber)] bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/25 shrink-0">
                        Taken
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
