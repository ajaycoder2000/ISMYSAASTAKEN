"use client";

import { useEffect, useState } from "react";

const STATUS_LINES = [
  "Reading your pitch...",
  "Counting your competitors...",
  "Checking the saturation...",
  "Sharpening the burns...",
];

interface Props {
  cooking: boolean;              // true while the request is in flight
  dinging: boolean;              // true once the result arrived; plays the DING
  onDingComplete?: () => void;   // called ~900ms after the DING starts
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function RoastMicrowave({ cooking, dinging, onDingComplete }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Count-up timer + rotating status line while cooking.
  useEffect(() => {
    if (!cooking) return;
    setSeconds(0);
    setStatusIdx(0);
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    const status = setInterval(
      () => setStatusIdx((i) => Math.min(i + 1, STATUS_LINES.length - 1)),
      1800
    );
    return () => {
      clearInterval(timer);
      clearInterval(status);
    };
  }, [cooking]);

  // After the DING, hand off to the receipt.
  useEffect(() => {
    if (!dinging) return;
    const t = setTimeout(() => onDingComplete?.(), reduceMotion ? 300 : 900);
    return () => clearTimeout(t);
  }, [dinging, onDingComplete, reduceMotion]);

  const statusText = dinging ? "Ding. Your roast is ready." : STATUS_LINES[statusIdx];

  return (
    <div className="w-full">
      <div
        aria-hidden="true"
        className="relative mx-auto flex w-full max-w-[420px] aspect-[2/1] gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-xl"
      >
        {/* Window */}
        <div
          className={`relative flex-1 overflow-hidden rounded-xl transition-colors duration-300 ${
            cooking ? "bg-[#FAEEDA]" : "bg-[var(--bg-surface-alt)]"
          }`}
          style={{ perspective: 600 }}
        >
          {/* Plate */}
          <div className="absolute bottom-[12%] left-1/2 h-[12%] w-[72%] -translate-x-1/2 rounded-[50%] bg-[#D3D1C7]" />
          {/* Idea card */}
          <div className="absolute bottom-[20%] left-1/2 h-[48%] w-[46%] -translate-x-1/2">
            <div
              className="flex h-full w-full flex-col gap-1.5 rounded-md border border-[#B4B2A9] bg-white p-2"
              style={{
                animation: cooking && !reduceMotion ? "plate-spin 2.4s linear infinite" : "none",
              }}
            >
              <div className="h-1.5 rounded bg-[#D3D1C7]" />
              <div className="h-1.5 w-3/5 rounded bg-[#D3D1C7]" />
              <div className="h-1.5 w-4/5 rounded bg-[#D3D1C7]" />
            </div>
          </div>
        </div>

        {/* Control panel */}
        <div className="flex w-[26%] flex-col items-center gap-2.5 pt-1">
          <div className="w-full rounded-md bg-[#2C2C2A] py-1.5 text-center font-mono text-lg tabular-nums text-[#97C459]">
            {formatTime(seconds)}
          </div>
          <div className="font-mono text-[10px] text-[var(--text-muted)]">ROAST · HIGH</div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-4 w-4 rounded-full bg-[var(--border)]" />
            ))}
          </div>
        </div>

        {/* DING */}
        {dinging && (
          <div
            className="absolute -top-9 left-[35%] -translate-x-1/2 text-xl font-semibold text-[var(--accent-amber)]"
            style={{ animation: reduceMotion ? "none" : "ding-pop 0.5s ease-out both" }}
          >
            DING
          </div>
        )}
      </div>

      {/* Status line — NOT aria-hidden, so screen readers hear progress */}
      <p role="status" aria-live="polite" className="mt-3 text-center text-sm text-[var(--text-secondary)]">
        {statusText}
      </p>
    </div>
  );
}
