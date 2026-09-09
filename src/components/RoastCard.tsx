'use client';

import React, { useState } from 'react';
import RoastShareModal from './RoastShareModal';

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

export default function RoastCard({
  ideaText,
  competitors,
  saturationScore,
  gapAnalysis,
  scanId,
  shareSlug,
  initialRoast,
}: RoastCardProps) {
  const [roast, setRoast] = useState<{ lines: string[]; takeaway: string } | null>(
    initialRoast && initialRoast.lines?.length > 0 ? initialRoast : null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [declinedMessage, setDeclinedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  const effectiveId = shareSlug || scanId;

  const handleTriggerRoast = async (force: boolean = false) => {
    setLoading(true);
    setError(null);
    setDeclinedMessage(null);

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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate roast');
      }

      if (data.declined) {
        setDeclinedMessage(
          data.message ||
            "That's not really an idea we can roast — try submitting an actual SaaS concept."
        );
      } else if (data.roast) {
        setRoast(data.roast);
      }
    } catch (err: any) {
      console.error('Error generating roast:', err);
      setError(err.message || 'Something went wrong firing up the grill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full bg-[hsl(20,20%,8%)] border border-[hsl(24,95%,50%,0.3)] rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden text-left transition-all">
        {/* Ambient flame glow effect */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{
            background:
              'radial-gradient(circle, #f97316 0%, #dc2626 50%, transparent 100%)',
          }}
        />

        {/* State 1: Loading State */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
              <span className="absolute text-xl animate-pulse">🔥</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-orange-200">
                Firing up the grill...
              </h4>
              <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-mono)]">
                Analyzing competitor moats, saturated wedges &amp; market traps
              </p>
            </div>
          </div>
        )}

        {/* State 2: Declined / Input Inappropriate Refusal */}
        {!loading && declinedMessage && (
          <div className="py-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                NOTICE
              </span>
            </div>
            <p className="text-sm text-[hsl(40,20%,90%)] font-[family-name:var(--font-inter)] leading-relaxed">
              {declinedMessage}
            </p>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-mono)]">
              Your standard validation report above remains unaffected.
            </p>
          </div>
        )}

        {/* State 3: Pre-generation CTA (Unroasted) */}
        {!loading && !declinedMessage && !roast && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔥</span>
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                    OPT-IN ROAST MODE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
                  Want the unfiltered comedy roast of this idea?
                </h3>
                <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
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
              <p className="text-xs text-red-400 font-mono pt-1">{error}</p>
            )}

            <div className="flex items-center gap-2 pt-1 text-[10px] text-[hsl(40,8%,45%)] font-mono border-t border-[hsl(220,10%,14%)]">
              <span>✦ Grounded in {competitors?.length || 0} competitors</span>
              <span>•</span>
              <span>✦ Always ends on a constructive takeaway</span>
            </div>
          </div>
        )}

        {/* State 4: Active / Completed Roast Result */}
        {!loading && roast && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔥</span>
                <div>
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-orange-400">
                    IDEA ROAST VERDICT
                  </span>
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
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
                  className="p-1.5 text-xs text-[hsl(40,8%,50%)] hover:text-orange-400 font-mono transition-colors cursor-pointer"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Roast Lines */}
            <div className="space-y-2.5">
              {roast.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(220,14%,9%)] border border-orange-500/20 text-xs sm:text-sm font-[family-name:var(--font-inter)] text-orange-100/90 leading-relaxed"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 flex items-center justify-center text-[10px] font-bold font-mono mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="flex-1 font-medium">{line}</p>
                </div>
              ))}
            </div>

            {/* Constructive Takeaway */}
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100 flex items-start gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider mt-0.5">
                Takeaway
              </span>
              <p className="flex-1 font-[family-name:var(--font-inter)] leading-relaxed text-[hsl(40,20%,90%)]">
                {roast.takeaway}
              </p>
            </div>

            {/* Footer subtext & share trigger */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-[hsl(40,8%,50%)] font-mono border-t border-[hsl(220,10%,14%)]">
              <span>Roasts the market &amp; positioning, never the founder.</span>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Create shareable card &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Preview Modal */}
      {roast && (
        <RoastShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          ideaText={ideaText}
          roastLines={roast.lines}
          takeaway={roast.takeaway}
          scanId={effectiveId}
        />
      )}
    </>
  );
}
