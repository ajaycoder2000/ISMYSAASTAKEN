"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ONLY include source types the scan really searches.
const DEFAULT_SOURCES = ["Reddit", "G2", "Product Hunt", "Hacker News", "App Store", "GitHub"];

const STATUS_LINES = [
  "Checking every source...",
  "Finding similar products...",
  "Comparing pricing...",
  "Measuring saturation...",
  "Looking for the gap...",
];

const CX = 340;
const CY = 160;
const PING_POOL = 6;

type Sat = { label: string; rx: number; ry: number; phase: number; speed: number; width: number };

export default function OrbitingSourcesLoader({ sources = DEFAULT_SOURCES }: { sources?: string[] }) {
  const satRefs = useRef<(SVGGElement | null)[]>([]);
  const pingRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [statusIdx, setStatusIdx] = useState(0);

  const sats: Sat[] = useMemo(() => {
    const list = sources.slice(0, 8);
    const half = Math.ceil(list.length / 2);
    return list.map((label, i) => {
      const inner = i < half;
      const ringIndex = inner ? i : i - half;
      const ringSize = inner ? half : list.length - half;
      return {
        label,
        rx: inner ? 170 : 270,
        ry: inner ? 58 : 105,
        speed: inner ? 0.5 : 0.32,
        phase: (ringIndex / ringSize) * Math.PI * 2 + (inner ? 0 : 0.5),
        width: label.length * 7 + 18,
      };
    });
  }, [sources]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pings = Array.from({ length: PING_POOL }, () => ({ active: false, x: 0, y: 0, t0: 0 }));
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      sats.forEach((s, i) => {
        const a = s.phase + (reduceMotion ? 0 : t * s.speed);
        const x = CX + Math.cos(a) * s.rx;
        const y = CY + Math.sin(a) * s.ry;
        const el = satRefs.current[i];
        if (el) {
          el.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          el.setAttribute("opacity", Math.sin(a) > 0 ? "1" : "0.45"); // back of the orbit is dimmer
        }
        if (!reduceMotion && Math.random() < 0.006) {
          const p = pings.find((p) => !p.active);
          if (p) Object.assign(p, { active: true, x, y, t0: now });
        }
      });

      pings.forEach((p, i) => {
        const el = pingRefs.current[i];
        if (!el) return;
        if (!p.active) { el.setAttribute("opacity", "0"); return; }
        const k = (now - p.t0) / 900;
        if (k >= 1) { p.active = false; el.setAttribute("opacity", "0"); return; }
        el.setAttribute("cx", (p.x + (CX - p.x) * k).toFixed(1));
        el.setAttribute("cy", (p.y + (CY - p.y) * k).toFixed(1));
        el.setAttribute("opacity", "1");
      });

      if (!reduceMotion) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const statusTimer = setInterval(
      () => setStatusIdx((i) => Math.min(i + 1, STATUS_LINES.length - 1)),
      1800
    );

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(statusTimer);
    };
  }, [sats]);

  return (
    <div className="w-full">
      <svg viewBox="0 0 680 330" className="mx-auto block w-full max-w-[560px]" aria-hidden="true">
        <ellipse cx={CX} cy={CY} rx={170} ry={58} fill="none" stroke="var(--border)" strokeWidth={1} />
        <ellipse cx={CX} cy={CY} rx={270} ry={105} fill="none" stroke="var(--border)" strokeWidth={1} />

        {/* Center: the user's idea. Back-of-orbit labels never overlap it, so draw order is safe. */}
        <circle cx={CX} cy={CY} r={30} fill="var(--accent-emerald)" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={12} fontWeight={600} fill="#FFFFFF">Idea</text>

        {sats.map((s, i) => (
          <g key={s.label} ref={(el) => { satRefs.current[i] = el; }}>
            <rect x={-s.width / 2} y={-13} width={s.width} height={26} rx={13}
              fill="var(--bg-surface)" stroke="var(--border)" strokeWidth={1} />
            <text y={4} textAnchor="middle" fontSize={12} fill="var(--text-primary)">{s.label}</text>
          </g>
        ))}

        {Array.from({ length: PING_POOL }).map((_, i) => (
          <circle key={i} ref={(el) => { pingRefs.current[i] = el; }} r={3.5} fill="var(--accent-amber)" opacity={0} />
        ))}
      </svg>

      <p role="status" aria-live="polite" className="mt-2 text-center text-sm text-[var(--text-secondary)]">
        {STATUS_LINES[statusIdx]}
      </p>
    </div>
  );
}
