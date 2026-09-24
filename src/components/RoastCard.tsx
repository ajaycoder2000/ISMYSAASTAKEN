'use client';

import React, { useState } from 'react';
import RoastShareModal from './RoastShareModal';
import RoastMicrowave from './roast/RoastMicrowave';
import RoastReceipt, { type RoastReceiptData } from './roast/RoastReceipt';

export interface RoastCardProps {
  ideaText: string;
  competitors: any[];
  saturationScore: string;
  gapAnalysis: string;
  scanId: string;
  shareSlug?: string;
  initialRoast?: {
    lines: string[];
    takeaway: string;
  };
}

function toReceiptData(
  scanId: string,
  ideaText: string,
  competitors: any[],
  saturationScore: string,
  roastData: { lines: string[]; takeaway: string }
): RoastReceiptData {
  const satRaw = (saturationScore || 'medium').toLowerCase();
  const saturation = satRaw === 'low' || satRaw === 'high' ? satRaw : 'medium';
  return {
    receiptId: String(scanId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'ROAST1',
    ideaText,
    competitorCount: Array.isArray(competitors) ? competitors.length : 0,
    saturation,
    freeAlternatives: null,
    roastLines: roastData.lines,
    takeaway: roastData.takeaway,
    createdAt: new Date().toISOString(),
  };
}

type Phase = 'idle' | 'cooking' | 'ding' | 'receipt' | 'declined' | 'error';

export default function RoastCard({
  ideaText,
  competitors,
  saturationScore,
  gapAnalysis,
  scanId,
  shareSlug,
  initialRoast,
}: RoastCardProps) {
  const [phase, setPhase] = useState<Phase>(
    initialRoast && initialRoast.lines?.length > 0 ? 'receipt' : 'idle'
  );
  const [receiptData, setReceiptData] = useState<RoastReceiptData | null>(
    initialRoast && initialRoast.lines?.length > 0
      ? toReceiptData(scanId, ideaText, competitors, saturationScore, initialRoast)
      : null
  );
  const [declinedMessage, setDeclinedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [printed, setPrinted] = useState<boolean>(
    Boolean(initialRoast && initialRoast.lines?.length > 0)
  );

  const effectiveId = shareSlug || scanId;

  const handleTriggerRoast = async (force: boolean = false) => {
    setPhase('cooking');
    setError(null);
    setDeclinedMessage(null);
    setPrinted(false);
    const started = Date.now();

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId,
          shareSlug: effectiveId,
          ideaText,
          competitors,
          saturationScore,
          gapAnalysis,
          force,
        }),
      });

      const data = await res.json();

      const elapsed = Date.now() - started;
      if (elapsed < 1200) {
        await new Promise((r) => setTimeout(r, 1200 - elapsed));
      }

      if (data.declined) {
        setDeclinedMessage(
          data.message ||
            "That's not really an idea we can roast — try submitting an actual SaaS concept."
        );
        setPhase('declined');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate roast');
      }

      const formatted: RoastReceiptData = {
        receiptId: data.receiptId || String(effectiveId).slice(0, 6).toUpperCase(),
        ideaText: data.ideaText || ideaText,
        competitorCount:
          typeof data.competitorCount === 'number'
            ? data.competitorCount
            : competitors?.length || 0,
        saturation: data.saturation || (saturationScore || 'medium').toLowerCase(),
        freeAlternatives: data.freeAlternatives ?? null,
        roastLines: data.roastLines || data.roast?.lines || [],
        takeaway: data.takeaway || data.roast?.takeaway || '',
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setReceiptData(formatted);
      setPhase('ding');
    } catch (err: any) {
      console.error('Error generating roast:', err);
      setError(err.message || 'Something went wrong firing up the grill.');
      setPhase('error');
    }
  };

  return (
    <>
      <div className="w-full bg-[var(--bg-surface)] dark:bg-[hsl(20,20%,8%)] border border-[var(--border)] dark:border-[hsl(24,95%,50%,0.3)] rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden text-left transition-all">
        {/* Ambient flame glow effect */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{
            background:
              'radial-gradient(circle, #f97316 0%, #dc2626 50%, transparent 100%)',
          }}
        />

        {/* State 1: Microwave Cooking / Ding */}
        {(phase === 'cooking' || phase === 'ding') && (
          <div className="py-2 animate-in fade-in duration-300">
            <RoastMicrowave
              cooking={phase === 'cooking'}
              dinging={phase === 'ding'}
              onDingComplete={() => setPhase('receipt')}
            />
          </div>
        )}

        {/* State 2: Declined / Input Inappropriate Refusal */}
        {phase === 'declined' && declinedMessage && (
          <div className="py-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/60">
                NOTICE
              </span>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-relaxed">
              {declinedMessage}
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-mono)]">
              Your standard validation report above remains unaffected.
            </p>
          </div>
        )}

        {/* State 3: Pre-generation CTA (Unroasted) */}
        {phase === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔥</span>
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-300 dark:border-orange-800/60">
                    OPT-IN ROAST MODE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                  Want the unfiltered comedy roast of this idea?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
                  Get a sharp, witty critique of your market saturation and positioning.
                  Roasts the market realities, never the person.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTriggerRoast(false)}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs font-[family-name:var(--font-mono)] transition-all shadow-lg shadow-orange-950/40 hover:scale-[1.02] cursor-pointer"
              >
                <span>Roast this idea</span>
                <span>🔥</span>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-mono pt-1">{error}</p>
            )}

            <div className="flex items-center gap-2 pt-1 text-[10px] text-[var(--text-muted)] font-mono border-t border-[var(--border)]">
              <span>✦ Grounded in {competitors?.length || 0} competitors</span>
              <span>•</span>
              <span>✦ Always ends on a constructive takeaway</span>
            </div>
          </div>
        )}

        {/* State 4: Error State */}
        {phase === 'error' && (
          <div className="py-4 space-y-3 text-center">
            <p className="text-xs text-red-500 font-mono">{error || 'Something went wrong.'}</p>
            <button
              type="button"
              onClick={() => handleTriggerRoast(false)}
              className="text-xs font-mono font-bold text-[var(--accent-amber)] hover:underline cursor-pointer"
            >
              Try again →
            </button>
          </div>
        )}

        {/* State 5: Active / Completed Roast Receipt Result */}
        {phase === 'receipt' && receiptData && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔥</span>
                <div>
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--accent-amber)]">
                    IDEA ROAST VERDICT
                  </span>
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                    The Unfiltered Market Breakdown
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-[family-name:var(--font-mono)] transition-colors shadow-sm cursor-pointer"
                >
                  <span>Share roast</span>
                  <span>🔥</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerRoast(true)}
                  title="Generate a fresh roast"
                  className="p-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-amber)] font-mono transition-colors cursor-pointer"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Thermal Roast Receipt */}
            <div className="pt-2">
              <RoastReceipt data={receiptData} onPrinted={() => setPrinted(true)} />
            </div>

            {/* Subtext and share trigger */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)] font-mono border-t border-[var(--border)]">
              <span>Roasts the market &amp; positioning, never the founder.</span>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="text-[var(--accent-amber)] hover:opacity-80 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Create shareable card &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Preview Modal */}
      {receiptData && (
        <RoastShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          ideaText={receiptData.ideaText}
          roastLines={receiptData.roastLines}
          takeaway={receiptData.takeaway}
          scanId={effectiveId}
        />
      )}
    </>
  );
}
