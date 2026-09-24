"use client";

import { useEffect, useState } from "react";

export type Saturation = "low" | "medium" | "high";

const VERDICTS: Record<Saturation, { label: string; color: string; fallback: string }> = {
  low:    { label: "OPEN SPACE", color: "var(--stamp-open)",    fallback: "wide open for a focused tool" },
  medium: { label: "MEDIUM",     color: "var(--stamp-medium)",  fallback: "room for a focused wedge" },
  high:   { label: "CROWDED",    color: "var(--stamp-crowded)", fallback: "you'll need a sharp angle" },
};

interface Props {
  ideaText: string;
  saturation: Saturation;
  competitorCount: number;
  summary?: string;     // use the scan's own one-line summary if it has one
  skip?: boolean;       // true = show the final state instantly
  onStamped?: () => void;
}

export default function VerdictStampCard({ ideaText, saturation, competitorCount, summary, skip, onStamped }: Props) {
  const v = VERDICTS[saturation] ?? VERDICTS.medium;
  const [stage, setStage] = useState<"pre" | "stamped" | "done">("pre");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip || reduceMotion) {
      setStage("done");
      onStamped?.();
      return;
    }
    const t1 = setTimeout(() => setStage("stamped"), 250);  // brief beat before the slam
    const t2 = setTimeout(() => { setStage("done"); onStamped?.(); }, 250 + 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const animate = !skip && stage !== "done";

  return (
    <div
      className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:pr-48 text-left"
      style={{ animation: stage === "stamped" && animate ? "card-shake 0.2s ease-out 0.22s both" : "none" }}
    >
      <div className="text-sm text-[var(--text-secondary)]">Your idea</div>
      <div className="mt-1 text-lg font-semibold text-[var(--text-primary)] line-clamp-2">{ideaText}</div>

      {/* Stamp: its own row on mobile, pinned right on larger screens */}
      {stage !== "pre" && (
        <div className="mt-4 sm:absolute sm:right-6 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
          <div
            role="img"
            aria-label={`Verdict: ${v.label.toLowerCase()}`}
            className="inline-block rounded-lg px-3.5 py-1.5 font-mono text-lg font-semibold tracking-wider sm:text-2xl"
            style={{
              color: v.color,
              border: `3px double ${v.color}`,
              transform: "rotate(-10deg)",
              animation: animate ? "stamp-slam 0.22s cubic-bezier(0.5, 0, 0.75, 0) both" : "none",
            }}
          >
            {v.label}
          </div>
        </div>
      )}

      {stage === "done" && (
        <p
          className="mt-4 text-sm text-[var(--text-secondary)]"
          style={{ animation: skip ? "none" : "reveal-up 0.3s ease-out both" }}
        >
          {competitorCount} competitor{competitorCount === 1 ? "" : "s"} · {summary ?? v.fallback}
        </p>
      )}
    </div>
  );
}
