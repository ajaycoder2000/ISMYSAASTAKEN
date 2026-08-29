"use client";

import { useEffect, useRef, useState } from "react";

export interface Competitor {
  name: string;
}

export interface RadarScanLoaderProps {
  /** Whether the scan is currently running. Sweep spins continuously while true. */
  active: boolean;
  /**
   * Competitors discovered so far, in the order they were found.
   * Push into this array as your backend returns real results — each new
   * entry animates in as a blip + log line. If you don't have incremental
   * results yet, pass the full list at once and they'll stagger in automatically.
   */
  competitors: Competitor[];
  /** Called once, when the scan is marked complete (see markComplete below). */
  onDone?: () => void;
  /** Set true once your API call has actually resolved, to trigger the "done" state. */
  isComplete?: boolean;
}

// Deterministic-looking but varied placement so blips don't overlap and don't
// look randomly scattered every render. Cycles through if more competitors
// than positions are supplied.
const BLIP_POSITIONS = [
  { r: 55, a: 40 },
  { r: 30, a: 160 },
  { r: 62, a: 260 },
  { r: 20, a: 320 },
  { r: 48, a: 110 },
  { r: 68, a: 200 },
];

export function RadarScanLoader({
  active,
  competitors,
  onDone,
  isComplete,
}: RadarScanLoaderProps) {
  const [angle, setAngle] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const staggerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const doneFiredRef = useRef(false);

  // Continuous sweep rotation while active.
  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setAngle(0);
      return;
    }
    let last = performance.now();
    const spin = (now: number) => {
      const dt = now - last;
      last = now;
      setAngle((prev) => (prev + dt * 0.14) % 360);
      rafRef.current = requestAnimationFrame(spin);
    };
    rafRef.current = requestAnimationFrame(spin);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  // Stagger newly-added competitors in one at a time rather than popping
  // them all in simultaneously when a batch arrives from the API.
  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      doneFiredRef.current = false;
      staggerTimers.current.forEach(clearTimeout);
      staggerTimers.current = [];
      return;
    }
    staggerTimers.current.forEach(clearTimeout);
    staggerTimers.current = [];
    setVisibleCount(0);
    competitors.forEach((_, i) => {
      const t = setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), i * 450 + 300);
      staggerTimers.current.push(t);
    });
    return () => {
      staggerTimers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, competitors.length]);

  // Fire onDone once the real scan is marked complete AND all blips have
  // finished staggering in, with a brief pause so the "done" state is visible.
  useEffect(() => {
    if (
      isComplete &&
      visibleCount >= competitors.length &&
      !doneFiredRef.current
    ) {
      doneFiredRef.current = true;
      const doneTimer = setTimeout(() => {
        onDone?.();
      }, 750);
      return () => clearTimeout(doneTimer);
    }
  }, [isComplete, visibleCount, competitors.length, onDone]);

  if (!active) return null;

  const showDone = isComplete && visibleCount >= competitors.length;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-2xl border border-[hsl(220,10%,18%)] bg-[hsl(220,14%,9%)] p-5 sm:p-6 my-6 shadow-2xl transition-all duration-300 animate-fade-in relative overflow-hidden"
    >
      {/* Subtle ambient scanner glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(145,60%,55%,0.05)] rounded-full blur-3xl pointer-events-none" />

      {showDone ? (
        <div className="flex items-center justify-between gap-3 py-2 px-2">
          <div className="flex items-center gap-2.5 text-sm sm:text-base text-[hsl(145,60%,55%)] font-[family-name:var(--font-mono)] font-bold animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] flex items-center justify-center">
              <CheckIcon />
            </div>
            <span>Scan complete — verdict ready</span>
          </div>
          <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
            Opening report...
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-center">
          {/* Radar Screen */}
          <div className="relative w-[150px] h-[150px] flex-shrink-0">
            <svg viewBox="0 0 150 150" className="w-full h-full drop-shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              {/* Concentric distance rings */}
              <circle cx="75" cy="75" r="70" fill="none" stroke="hsl(220,10%,20%)" strokeWidth="1" />
              <circle cx="75" cy="75" r="47" fill="none" stroke="hsl(220,10%,20%)" strokeWidth="1" />
              <circle cx="75" cy="75" r="24" fill="none" stroke="hsl(220,10%,20%)" strokeWidth="1" />
              
              {/* Crosshairs */}
              <line x1="75" y1="5" x2="75" y2="145" stroke="hsl(220,10%,20%)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="5" y1="75" x2="145" y2="75" stroke="hsl(220,10%,20%)" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Rotating radar sweep line */}
              <g transform={`rotate(${angle} 75 75)`}>
                <line x1="75" y1="75" x2="75" y2="5" stroke="hsl(145,60%,55%)" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Detected competitor blips */}
              {competitors.slice(0, visibleCount).map((c, i) => {
                const pos = BLIP_POSITIONS[i % BLIP_POSITIONS.length];
                const rad = (pos.a * Math.PI) / 180;
                const x = 75 + pos.r * Math.cos(rad);
                const y = 75 + pos.r * Math.sin(rad);
                return (
                  <g key={c.name}>
                    <circle cx={x} cy={y} r="6" fill="none" stroke="hsl(145,60%,55%)" strokeWidth="1" opacity="0.4" className="animate-ping" />
                    <circle cx={x} cy={y} r="3.5" fill="hsl(145,60%,55%)" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Telemetry Log */}
          <div className="flex-1 w-full font-[family-name:var(--font-mono)] text-xs text-[hsl(40,8%,55%)]">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[hsl(220,10%,16%)]">
              <span className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(145,60%,55%)] animate-pulse" />
                Scanning Live Web for Competitors...
              </span>
              <span className="text-[10px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)]">
                {competitors.length > 0 ? `${visibleCount}/${competitors.length} localized` : 'Grounding...'}
              </span>
            </div>

            {/* Found competitors list */}
            <div className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto pr-1">
              {competitors.slice(0, visibleCount).map((c) => (
                <div key={c.name} className="text-[hsl(145,60%,55%)] flex items-center gap-1.5 animate-slide-up">
                  <span>+</span>
                  <span className="font-semibold text-[hsl(40,20%,92%)]">found</span>
                  <span className="text-[hsl(145,60%,55%)] font-bold">{c.name}</span>
                </div>
              ))}

              {visibleCount === 0 && (
                <div className="text-[hsl(40,8%,45%)] italic text-[11px] py-1">
                  Querying live search index, G2, Product Hunt & GitHub registries...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default RadarScanLoader;
