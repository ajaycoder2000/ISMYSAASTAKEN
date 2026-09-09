'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  isBadgeEligible,
  getBadgeImageUrl,
  getBadgeVerificationUrl,
  getBadgeHtmlSnippet,
  getBadgeMarkdownSnippet,
} from '@/lib/badge';
import { IScanDocument } from '@/types';

interface EmbeddableBadgeCardProps {
  scan: IScanDocument;
}

export default function EmbeddableBadgeCard({ scan }: EmbeddableBadgeCardProps) {
  const [theme, setTheme] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [format, setFormat] = useState<'html' | 'markdown'>('html');
  const [copied, setCopied] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(false);

  React.useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserPlan(data.user.plan || 'free');
          setIsAdmin(Boolean(data.user.is_admin || data.user.role === 'admin'));
        } else {
          setUserPlan('free');
        }
      })
      .catch(() => setUserPlan('free'))
      .finally(() => setSessionLoaded(true));
  }, []);

  if (!isBadgeEligible(scan)) {
    return null;
  }

  const isPaidUser =
    isAdmin ||
    ['sprint_pass', 'founder_pro', 'pro', 'studio'].includes(userPlan || '');

  const effectiveId = scan.shareSlug || scan._id;
  const badgeImgUrl = getBadgeImageUrl(effectiveId, theme);
  const verifyUrl = getBadgeVerificationUrl(effectiveId);

  const snippet =
    format === 'html'
      ? getBadgeHtmlSnippet(effectiveId, theme)
      : getBadgeMarkdownSnippet(effectiveId, theme);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="w-full bg-[hsl(220,15%,9%)] border border-emerald-500/30 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden text-left space-y-6">
      {/* Subtle emerald ambient glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">✓</span>
            <span className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              TRUST SEAL QUALIFIED
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-zinc-100">
            Your idea qualified for a Validated Trust Seal 🎉
          </h3>
          <p className="text-xs text-zinc-400 font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
            Embed this live badge on your landing page or README. It proves to early adopters and
            investors that this concept has an open opportunity wedge.
          </p>
        </div>

        {isPaidUser && (
          <Link
            href={verifyUrl}
            target="_blank"
            rel="noopener"
            className="shrink-0 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
          >
            Preview Certificate &rarr;
          </Link>
        )}
      </div>

      {/* Live Badge Preview */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 block">
          Badge Preview
        </span>

        <div
          className={`p-6 rounded-xl flex items-center justify-center border transition-colors ${
            theme === 'light'
              ? 'bg-zinc-100 border-zinc-300'
              : theme === 'transparent'
              ? 'bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800'
              : 'bg-zinc-950 border-zinc-800'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeImgUrl}
            alt="Validated by IsMySaaSTaken"
            width={280}
            height={80}
            className="h-16 sm:h-20 w-auto rounded-lg drop-shadow-md"
          />
        </div>
      </div>

      {/* Gating: Paid Tiers unlock snippet & copy */}
      {sessionLoaded && !isPaidUser ? (
        <div className="bg-zinc-950 border border-emerald-500/20 rounded-xl p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold font-mono">
            <span>🔒</span>
            <span>Paid Tier Feature (Sprint Pass or Founder Pro)</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Your scan passed the saturation qualification check! To embed the live trust seal on your
            landing page and unlock your public verification certificate, upgrade your plan.
          </p>
          <div className="pt-1">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-[family-name:var(--font-space-grotesk)] transition-all shadow-md cursor-pointer"
            >
              <span>Unlock Validated Badge — View Plans &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Controls & Snippet */
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500 px-2 text-[10px] uppercase tracking-wider">
                Theme:
              </span>
              {(['dark', 'light', 'transparent'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-2.5 py-1 rounded-md text-[11px] capitalize transition-colors cursor-pointer ${
                    theme === t
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Format Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              {(['html', 'markdown'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] uppercase transition-colors cursor-pointer ${
                    format === f
                      ? 'bg-zinc-800 text-zinc-100 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Code Snippet Box */}
          <div className="relative">
            <pre className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">
              <code>{snippet}</code>
            </pre>

            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-colors shadow cursor-pointer flex items-center gap-1.5"
            >
              <span>{copied ? '✓' : '⧉'}</span>
              <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer reassurance */}
      <div className="pt-1 text-[11px] font-mono text-zinc-500 flex items-center justify-between border-t border-zinc-800">
        <span>Includes click-through verification &amp; rel=&quot;noopener&quot;</span>
        <span>Backlink drives organic trust</span>
      </div>
    </div>
  );
}
