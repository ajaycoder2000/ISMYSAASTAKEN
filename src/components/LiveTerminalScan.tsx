"use client";

import { useEffect, useRef, useState } from "react";

type Seg = { text: string; color?: string };
const LINES: Seg[][] = [
  [{ text: "$ ", color: "var(--accent-emerald)" }, { text: 'scan "ai meeting notes for sales teams"' }],
  [{ text: "crawling 42 live sources...", color: "var(--text-secondary)" }],
  [{ text: "competitors found: ", color: "var(--text-secondary)" }, { text: "14", color: "var(--accent-amber)" }],
  [{ text: "saturation: ", color: "var(--text-secondary)" }, { text: "MEDIUM", color: "var(--accent-amber)" }],
  [{ text: "gap found: ", color: "var(--text-secondary)" }, { text: "CRM-native notes for small sales teams", color: "var(--accent-emerald)" }],
];

const lineLength = (segs: Seg[]) => segs.reduce((n, s) => n + s.text.length, 0);

function renderLine(segs: Seg[], upto: number) {
  let left = upto;
  return segs.map((s, i) => {
    if (left <= 0) return null;
    const part = s.text.slice(0, left);
    left -= s.text.length;
    return <span key={i} style={{ color: s.color ?? "var(--text-primary)" }}>{part}</span>;
  });
}

export default function LiveTerminalScan() {
  const ref = useRef<HTMLDivElement>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduceMotion) return; // pause off-screen; no typing with reduced motion
    let t: ReturnType<typeof setTimeout>;
    if (lineIdx >= LINES.length) {
      t = setTimeout(() => { setLineIdx(0); setCharIdx(0); }, 2600); // loop
    } else if (charIdx <= lineLength(LINES[lineIdx])) {
      t = setTimeout(() => setCharIdx((c) => c + 1), lineIdx === 0 ? 45 : 22);
    } else {
      t = setTimeout(() => { setLineIdx((l) => l + 1); setCharIdx(0); }, 500);
    }
    return () => clearTimeout(t);
  }, [visible, reduceMotion, lineIdx, charIdx]);

  const shownLines = reduceMotion ? LINES.length : lineIdx;

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Sample scan: 42 sources crawled, 14 competitors found, medium saturation, gap found in CRM-native notes for small sales teams."
      className="mx-auto w-full max-w-[560px] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden text-left shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]" aria-hidden="true">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />)}
        </div>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">sample scan</span>
      </div>
      <div aria-hidden="true" className="font-mono text-[13px] leading-[1.8] px-4 py-3.5 min-h-[190px]">
        {LINES.slice(0, shownLines).map((segs, i) => (
          <div key={i}>{renderLine(segs, lineLength(segs))}</div>
        ))}
        {!reduceMotion && lineIdx < LINES.length && <div>{renderLine(LINES[lineIdx], charIdx)}<Cursor /></div>}
        {!reduceMotion && lineIdx >= LINES.length && <Cursor />}
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span className="inline-block w-2 h-[15px] align-[-2px] bg-[var(--accent-emerald)] motion-safe:animate-[blink_1s_step-end_infinite]" />
  );
}
