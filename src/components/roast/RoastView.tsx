'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RoastMicrowave from './RoastMicrowave';
import RoastReceipt, { type RoastReceiptData } from './RoastReceipt';
import RoastShareModal from '@/components/RoastShareModal';
import { IScanDocument } from '@/types';

const SAMPLE_ROASTS = [
  {
    idea: 'AI meeting notes that sync directly to Notion',
    saturation: 'HIGH',
    competitors: '14+ tracked (Otter, Fireflies, Grain)',
    burns: [
      'Building this in 2026 is like opening a lemonade stand in the middle of a hurricane.',
      'There are already 14 venture-backed gorillas solving this, and half of them give away your entire feature set for free.',
      'The market here is so saturated that even your landing page will need a queue system just to explain why you exist.',
      'You aren\'t discovering an open ocean here; you\'re doing cannonballs into a kiddie pool already packed with bootstrappers.',
    ],
    takeaway:
      'Stop trying to build an all-in-one suite against Otter; instead, focus solely on HIPAA-compliant audio redaction for clinical therapists.',
  },
  {
    idea: 'A micro-CRM designed specifically for freelance designers',
    saturation: 'MEDIUM',
    competitors: '6 tracked (Bonsai, HoneyBook, Notion)',
    burns: [
      'Freelance designers are famous for two things: having pristine portfolios and refusing to pay monthly subscriptions for tools they can recreate in a Notion template.',
      'Your biggest competitor isn\'t Salesforce or HubSpot; it\'s a color-coded Google Sheet that costs zero dollars.',
      'If you pitch this as "the simple CRM," even your beta testers are going to churn back to their email inbox before month two.',
    ],
    takeaway:
      'Don\'t sell a generic CRM; sell automated invoice chasing with legally binding deposit escrow.',
  },
];

function scanToReceiptData(scan: IScanDocument): RoastReceiptData {
  const satRaw = (scan.saturationScore || 'medium').toLowerCase();
  const saturation = satRaw === 'low' || satRaw === 'high' ? satRaw : 'medium';
  return {
    receiptId: String(scan._id || scan.shareSlug || 'ROAST1')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase() || 'ROAST1',
    ideaText: scan.ideaText,
    competitorCount: Array.isArray(scan.competitors) ? scan.competitors.length : 0,
    saturation,
    freeAlternatives: null,
    roastLines: scan.roast?.lines || [],
    takeaway: scan.roast?.takeaway || '',
    createdAt: scan.createdAt ? new Date(scan.createdAt).toISOString() : new Date().toISOString(),
  };
}

type Phase = 'idle' | 'cooking' | 'ding' | 'receipt' | 'declined' | 'error';

export default function RoastView({ initialScan }: { initialScan?: IScanDocument }) {
  const [ideaText, setIdeaText] = useState<string>('');
  const [phase, setPhase] = useState<Phase>(
    initialScan && initialScan.roast ? 'receipt' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [declinedMessage, setDeclinedMessage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<RoastReceiptData | null>(
    initialScan && initialScan.roast ? scanToReceiptData(initialScan) : null
  );
  const [currentScanId, setCurrentScanId] = useState<string>(
    initialScan ? initialScan.shareSlug || initialScan._id : ''
  );
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [printed, setPrinted] = useState<boolean>(Boolean(initialScan && initialScan.roast));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdea = ideaText.trim();
    if (!cleanIdea || cleanIdea.length < 8) {
      setError('Please enter at least 8 characters describing your SaaS idea.');
      return;
    }

    setPhase('cooking');
    setError(null);
    setDeclinedMessage(null);
    setReceiptData(null);
    setPrinted(false);

    const started = Date.now();

    try {
      // 1. Run idea validation scan to ground in competitors
      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: cleanIdea }),
      });

      const scanData = await scanRes.json();

      if (!scanRes.ok) {
        if (scanData.rateLimited) {
          throw new Error('Free scan quota reached. Please sign in or upgrade to run more scans.');
        }
        throw new Error(scanData.error || 'Failed to analyze idea.');
      }

      const scan = scanData.data;
      setCurrentScanId(scan.shareSlug || scan._id);

      // 2. Generate Roast grounded in the scan data
      const roastRes = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: scan._id,
          shareSlug: scan.shareSlug,
          ideaText: scan.ideaText,
          competitors: scan.competitors,
          saturationScore: scan.saturationScore,
          gapAnalysis: scan.gapAnalysis,
        }),
      });

      const roastData = await roastRes.json();

      // Enforce minimum 1.2s cook time so the microwave animation feels natural and never jarring
      const elapsed = Date.now() - started;
      if (elapsed < 1200) {
        await new Promise((r) => setTimeout(r, 1200 - elapsed));
      }

      // Input moderation refusal — stop microwave, no DING!
      if (roastData.declined) {
        setDeclinedMessage(
          roastData.message ||
            "That's not really an idea we can roast — try submitting an actual SaaS concept."
        );
        setPhase('declined');
        return;
      }

      if (!roastRes.ok) {
        throw new Error(roastData.error || 'Failed to analyze idea for roast.');
      }

      const formattedReceipt: RoastReceiptData = {
        receiptId: roastData.receiptId || String(scan._id).slice(0, 6).toUpperCase(),
        ideaText: roastData.ideaText || scan.ideaText,
        competitorCount:
          typeof roastData.competitorCount === 'number'
            ? roastData.competitorCount
            : scan.competitors.length,
        saturation: roastData.saturation || (scan.saturationScore || 'medium').toLowerCase(),
        freeAlternatives: roastData.freeAlternatives ?? null,
        roastLines: roastData.roastLines || roastData.roast?.lines || [],
        takeaway: roastData.takeaway || roastData.roast?.takeaway || '',
        createdAt: roastData.createdAt || new Date().toISOString(),
      };

      setReceiptData(formattedReceipt);
      setPhase('ding');
    } catch (err: any) {
      console.error('Roast error:', err);
      setError(err.message || 'Something went wrong while roasting this idea.');
      setPhase('error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* 1. Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-widest uppercase">
          <span>🔥</span>
          <span>IDEA ROAST MODE</span>
        </div>

        <h1 className="text-display font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] tracking-tight">
          Get Your SaaS Idea <span className="text-orange-500">Roasted</span>
        </h1>

        <p className="text-subhead text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] leading-relaxed">
          Blunt, witty, comedy-roast feedback on your market reality. We critique crowded
          competition, buzzwords, and generic positioning — never the person. Always ends
          on a real, actionable wedge.
        </p>
      </div>

      {/* 2. Idea Input Form */}
      {phase !== 'receipt' && (
        <div className="w-full bg-[hsl(220,15%,9%)] border border-orange-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label
                htmlFor="roast-idea"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-300/90 flex items-center justify-between"
              >
                <span>Describe your SaaS concept</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  {ideaText.length}/300 characters
                </span>
              </label>
              <textarea
                id="roast-idea"
                rows={3}
                maxLength={300}
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="e.g. AI meeting notes that sync directly to Notion, or a micro-CRM for freelance designers..."
                disabled={phase === 'cooking' || phase === 'ding'}
                className="w-full bg-[hsl(220,15%,6%)] border border-orange-500/30 focus:border-orange-500 rounded-xl p-3.5 sm:p-4 text-body text-[hsl(40,20%,94%)] placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed font-[family-name:var(--font-inter)] resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-mono bg-red-950/30 p-2.5 rounded-lg border border-red-900/40">
                {error}
              </p>
            )}

            {declinedMessage && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 font-[family-name:var(--font-inter)] leading-relaxed flex items-start gap-2.5">
                <span className="text-sm shrink-0">🛡️</span>
                <span>{declinedMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="text-meta text-[var(--text-muted)] font-mono flex items-center gap-2">
                <span>✦ Grounded in real competitors</span>
                <span>•</span>
                <span>✦ Free &amp; shareable</span>
              </div>

              <button
                type="submit"
                disabled={phase === 'cooking' || phase === 'ding' || ideaText.trim().length < 8}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-button font-[family-name:var(--font-mono)] transition-all shadow-lg shadow-orange-950/40 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>Roast My Idea</span>
                <span>🔥</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Microwave Loader State (Cooking or Ding) */}
      {(phase === 'cooking' || phase === 'ding') && (
        <div className="py-4 animate-in fade-in duration-300">
          <RoastMicrowave
            cooking={phase === 'cooking'}
            dinging={phase === 'ding'}
            onDingComplete={() => setPhase('receipt')}
          />
        </div>
      )}

      {/* 4. Live Roast Receipt Result */}
      {phase === 'receipt' && receiptData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between max-w-[420px] mx-auto">
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-[var(--accent-amber)]">
              🔥 YOUR ROAST RECEIPT
            </h2>
            <button
              type="button"
              onClick={() => {
                setPhase('idle');
                setReceiptData(null);
                setIdeaText('');
              }}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono underline underline-offset-2 transition-colors cursor-pointer"
            >
              Roast another idea &rarr;
            </button>
          </div>

          <RoastReceipt data={receiptData} onPrinted={() => setPrinted(true)} />

          {/* Action buttons revealed once printing finishes */}
          {printed && (
            <div className="space-y-4 max-w-[420px] mx-auto animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs font-[family-name:var(--font-mono)] transition-all shadow-lg shadow-orange-950/40 hover:scale-[1.01] cursor-pointer"
              >
                <span>Share this roast</span>
                <span>🔥</span>
              </button>

              {currentScanId && (
                <div className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-emerald)] font-bold">
                      COMPREHENSIVE DATA
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
                      Want to see all {receiptData.competitorCount} competitors, pricing models, and 2D landscape matrix?
                    </p>
                  </div>
                  <Link
                    href={`/scan/${currentScanId}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[hsl(220,14%,16%)] hover:bg-[hsl(220,14%,20%)] border border-[hsl(220,10%,24%)] text-xs text-white font-mono font-semibold transition-colors"
                  >
                    <span>View Full Report</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Share Preview Modal */}
          <RoastShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            ideaText={receiptData.ideaText}
            roastLines={receiptData.roastLines}
            takeaway={receiptData.takeaway}
            scanId={currentScanId || receiptData.receiptId}
          />
        </div>
      )}

      {/* 5. Pre-search Showcase: Sample Roast Examples */}
      {phase !== 'receipt' && phase !== 'cooking' && phase !== 'ding' && (
        <div className="space-y-6 pt-2">
          <div className="text-left space-y-1 border-b border-[var(--border)] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent-amber)] font-bold">
              PREVIEW: SAMPLE BURNS
            </span>
            <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              How Idea Roast Mode Evaluates Concepts
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              Real sample roasts grounded in live competitor tracking and saturation metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_ROASTS.map((sample, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] font-bold border border-[var(--border)]">
                      SAMPLE #{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--accent-amber)] font-semibold">
                      {sample.saturation} SATURATION
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] italic">
                    &ldquo;{sample.idea}&rdquo;
                  </p>

                  <div className="space-y-2">
                    {sample.burns.slice(0, 3).map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="flex items-start gap-2 text-xs text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-relaxed bg-[var(--bg-surface-alt)] p-2.5 rounded-lg border border-orange-500/20"
                      >
                        <span className="text-[var(--accent-amber)] font-bold text-[10px] mt-0.5 font-mono">
                          {bIdx + 1}.
                        </span>
                        <p>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-2.5 text-xs text-[var(--text-primary)] flex items-start gap-2">
                    <span className="shrink-0 text-[9px] font-mono uppercase font-bold text-[var(--accent-emerald)] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-200 dark:border-emerald-500/40">
                      Takeaway
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                      {sample.takeaway}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* The 3 Roast Guardrails */}
          <div className="pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3 text-left">
              The 3 Roast Guardrails
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] space-y-1">
                <span className="text-sm">🛡️</span>
                <h5 className="text-xs font-bold text-[var(--text-primary)]">Never the Person</h5>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  We roast market saturation and positioning. Zero insults or personal remarks toward the founder.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] space-y-1">
                <span className="text-sm">📊</span>
                <h5 className="text-xs font-bold text-[var(--text-primary)]">Grounded in Data</h5>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Every burn cites real competitor metrics, pricing pressure, and saturation signals found during crawl.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] space-y-1">
                <span className="text-sm">🎯</span>
                <h5 className="text-xs font-bold text-[var(--text-primary)]">Constructive Takeaway</h5>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Every critique concludes with a specific, viable wedge angle to help you pivot before writing code.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
