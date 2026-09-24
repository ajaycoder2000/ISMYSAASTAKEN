"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import RoastMicrowave from "./RoastMicrowave";
import RoastReceipt, { type RoastReceiptData } from "./RoastReceipt";

type Phase = "idle" | "cooking" | "ding" | "receipt" | "declined" | "error";

const MIN_COOK_MS = 1200;
const TIMEOUT_MS = 45000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function RoastFlow({
  scanId,
  initialData,
  autoStart,
  renderActions, // existing share UI + "Run a full scan", shown after printing
}: {
  scanId: string;
  initialData?: RoastReceiptData | null;
  autoStart?: boolean;
  renderActions?: (data: RoastReceiptData) => ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>(initialData ? "receipt" : "idle");
  const [data, setData] = useState<RoastReceiptData | null>(initialData || null);
  const [message, setMessage] = useState("");
  const [printed, setPrinted] = useState(Boolean(initialData));

  const startRoast = useCallback(async () => {
    setPhase("cooking");
    setPrinted(false);
    setData(null);
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }), // no userId — the server gets it from Clerk
        signal: controller.signal,
      });
      const json = await res.json();

      const elapsed = Date.now() - started;
      if (elapsed < MIN_COOK_MS) await wait(MIN_COOK_MS - elapsed);

      if (json.declined) {
        setMessage(json.message);
        setPhase("declined");
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "Roast failed");

      setData(json as RoastReceiptData);
      setPhase("ding");
    } catch {
      setPhase("error");
    } finally {
      clearTimeout(timeout);
    }
  }, [scanId]);

  useEffect(() => {
    if (autoStart && !initialData && phase === "idle") {
      startRoast();
    }
  }, [autoStart, initialData, phase, startRoast]);

  const onDingComplete = useCallback(() => setPhase("receipt"), []);

  if (phase === "idle") {
    return (
      <button
        onClick={startRoast}
        className="rounded-lg bg-[var(--accent-amber)] px-5 py-3 font-medium text-black cursor-pointer shadow-md hover:opacity-90 transition-opacity"
      >
        Roast this idea 🔥
      </button>
    );
  }

  if (phase === "cooking" || phase === "ding") {
    return (
      <RoastMicrowave
        cooking={phase === "cooking"}
        dinging={phase === "ding"}
        onDingComplete={onDingComplete}
      />
    );
  }

  if (phase === "receipt" && data) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
        <RoastReceipt data={data} onPrinted={() => setPrinted(true)} />
        {printed && renderActions?.(data)}
      </div>
    );
  }

  // Declined or error: no DING, no receipt, just a plain message.
  return (
    <div className="mx-auto max-w-[420px] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center">
      <p className="text-[var(--text-primary)]">
        {phase === "declined" ? message : "The microwave broke down. Something went wrong on our side."}
      </p>
      {phase === "error" && (
        <button onClick={startRoast} className="mt-3 text-sm font-medium text-[var(--accent-amber)] cursor-pointer">
          Try again →
        </button>
      )}
    </div>
  );
}
