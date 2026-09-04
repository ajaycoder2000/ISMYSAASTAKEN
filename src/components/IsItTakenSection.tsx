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
      <div className="w-full bg-[hsl(220,14%,9%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[hsl(42,95%,55%,0.04)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[hsl(145,60%,45%,0.03)] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Copy & CTA */}
          <div className="max-w-xl space-y-3.5 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[hsl(42,95%,55%,0.1)] border border-[hsl(42,95%,55%,0.25)] text-[10px] font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
              NAME &amp; HANDLE AVAILABILITY
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight leading-snug">
              Before you build it — is it taken?
            </h2>

            <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
              Check your startup name across .com, .io, .co, .app domains (via official RDAP protocol) and X, Instagram, TikTok, GitHub — all in one search.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/is-it-taken"
                className="px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Check a name</span>
                <span>→</span>
              </Link>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
                Free &bull; No signup required
              </span>
            </div>
          </div>

          {/* Right Column: Inline Legible Preview (e.g. "flowlyapp") */}
          <div className="w-full lg:max-w-md bg-[hsl(220,16%,7%)] border border-[hsl(220,10%,17%)] rounded-xl p-4 sm:p-5 space-y-4 shadow-inner">
            {/* Terminal mock bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[hsl(220,10%,15%)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(0,70%,50%)]/70" />
                <span className="w-2 h-2 rounded-full bg-[hsl(42,95%,55%)]/70" />
                <span className="w-2 h-2 rounded-full bg-[hsl(145,60%,55%)]/70" />
                <span className="ml-1 text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
                  preview: &quot;flowlyapp&quot;
                </span>
              </div>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 rounded bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] border border-[hsl(145,60%,45%,0.25)] font-bold">
                RDAP + PROBE
              </span>
            </div>

            {/* Domains Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] uppercase tracking-wider block">
                Domains (Official RDAP)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {previewDomains.map((d) => (
                  <div
                    key={d.domain}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[hsl(220,13%,10%)] border border-[hsl(220,10%,15%)] text-[11px] font-[family-name:var(--font-mono)]"
                  >
                    <span className="text-[hsl(40,20%,85%)] truncate mr-1">{d.domain}</span>
                    {d.status === 'available' ? (
                      <span className="text-[10px] font-bold text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.15)] px-1.5 py-0.2 rounded border border-[hsl(145,60%,45%,0.25)] shrink-0">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-1.5 py-0.2 rounded border border-[hsl(42,95%,55%,0.2)] shrink-0">
                        Taken
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Handles Preview */}
            <div className="space-y-1.5 pt-2 border-t border-[hsl(220,10%,14%)]">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] uppercase tracking-wider block">
                Social Handles
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {previewHandles.map((h) => (
                  <div
                    key={h.platform}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[hsl(220,13%,10%)] border border-[hsl(220,10%,15%)] text-[11px] font-[family-name:var(--font-mono)]"
                  >
                    <span className="text-[hsl(40,20%,85%)] truncate mr-1">{h.platform}</span>
                    {h.status === 'available' ? (
                      <span className="text-[10px] font-bold text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.15)] px-1.5 py-0.2 rounded border border-[hsl(145,60%,45%,0.25)] shrink-0">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-1.5 py-0.2 rounded border border-[hsl(42,95%,55%,0.2)] shrink-0">
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
