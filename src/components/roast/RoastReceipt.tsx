"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

export interface RoastReceiptData {
  receiptId: string;
  ideaText: string;
  competitorCount: number;
  saturation: "low" | "medium" | "high";
  freeAlternatives?: number | null;
  roastLines: string[];
  takeaway: string;
  createdAt: string;
}

const BURN_LEVEL: Record<RoastReceiptData["saturation"], { label: string; color: string }> = {
  low: { label: "MILD", color: "#854F0B" },
  medium: { label: "HOT", color: "#993C1D" },
  high: { label: "EXTRA HOT", color: "#791F1F" },
};

const INK = "#2C2C2A";
const INK_MUTED = "#5F5E5A";
const PAPER = "#F1EFE8";

function Divider() {
  return <div className="my-1 border-t border-dashed" style={{ borderColor: "#B4B2A9" }} />;
}

function Row({ left, right, rightColor }: { left: string; right: string; rightColor?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{left}</span>
      <span className="text-right font-semibold" style={{ color: rightColor ?? INK }}>{right}</span>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export default function RoastReceipt({
  data,
  onPrinted,
}: {
  data: RoastReceiptData;
  onPrinted?: () => void;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const burn = BURN_LEVEL[data.saturation] ?? BURN_LEVEL.medium;
  const date = new Date(data.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  // Every line of the receipt, in print order.
  const rows: ReactNode[] = useMemo(() => {
    const r: ReactNode[] = [
      <div key="brand" className="text-center text-[11px]" style={{ color: INK_MUTED }}>IS MY SAAS TAKEN?</div>,
      <div key="title" className="text-center text-[15px] font-bold tracking-wide">ROAST RECEIPT</div>,
      <Row key="order" left="ORDER" right={`#${data.receiptId}`} />,
      <Row key="date" left="DATE" right={date} />,
      <Divider key="d1" />,
      <div key="idea"><span style={{ color: INK_MUTED }}>IDEA: </span>{truncate(data.ideaText, 70)}</div>,
      <Divider key="d2" />,
      <Row key="comp" left="COMPETITORS" right={`×${data.competitorCount}`} />,
      <Row key="sat" left="SATURATION" right={data.saturation.toUpperCase()} />,
    ];

    // Only show if the scan really tracks it — never invent this number.
    if (typeof data.freeAlternatives === "number") {
      r.push(<Row key="free" left="FREE ALTERNATIVES" right={String(data.freeAlternatives)} />);
    }

    r.push(
      <Row key="burn" left="BURN LEVEL" right={burn.label} rightColor={burn.color} />,
      <Divider key="d3" />,
      <div key="burns-h" className="font-bold">THE BURNS</div>,
      ...data.roastLines.map((line, i) => (
        <div key={`b${i}`} className="flex gap-2 text-left">
          <span className="font-semibold shrink-0" style={{ color: burn.color }}>{i + 1}.</span>
          <span className="flex-1">{line}</span>
        </div>
      )),
      <Divider key="d4" />,
      <div key="take-h" className="font-bold" style={{ color: "#0F6E56" }}>THE ACTUAL TAKEAWAY</div>,
      <div key="take" className="text-left leading-relaxed">{data.takeaway}</div>,
      <Divider key="d5" />,
      <div key="thanks" className="text-center font-semibold">THANKS FOR ORDERING</div>,
      <div key="url" className="text-center text-[11px]" style={{ color: INK_MUTED }}>ismysaastaken.vercel.app</div>
    );
    return r;
  }, [data, burn, date]);

  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(rows.length);
      onPrinted?.();
      return;
    }
    setShown(0);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setShown(i);
      if (i >= rows.length) {
        clearInterval(tick);
        onPrinted?.();
      }
    }, 140);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, reduceMotion]);

  return (
    <section aria-label="Your roast result" className="mx-auto w-full max-w-[420px]">
      {/* Printer slot */}
      <div aria-hidden="true" className="relative h-[22px] rounded-t-lg rounded-b border border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="absolute bottom-1.5 left-3.5 right-3.5 h-[3px] rounded bg-[var(--border)]" />
      </div>

      {/* Paper */}
      <div
        className="mx-[18px] flex flex-col gap-1 px-4 pb-2 pt-3 font-mono text-[13px] leading-relaxed shadow-lg text-left"
        style={{ background: PAPER, color: INK }}
      >
        {rows.slice(0, shown).map((row, i) => (
          <div key={i} style={{ animation: reduceMotion ? "none" : "receipt-line-in 0.18s ease-out both" }}>
            {row}
          </div>
        ))}
      </div>

      {/* Torn zigzag edge */}
      <div
        aria-hidden="true"
        className="mx-[18px] h-2.5"
        style={{
          background: `linear-gradient(-45deg, transparent 6px, ${PAPER} 0), linear-gradient(45deg, transparent 6px, ${PAPER} 0)`,
          backgroundSize: "12px 12px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </section>
  );
}
