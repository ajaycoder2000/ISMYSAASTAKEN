"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OrbitingSourcesLoader from "./OrbitingSourcesLoader";
import VerdictStampCard, { type Saturation } from "./VerdictStampCard";
import ScanResult from "@/components/ScanResult";
import ButtonAI from "@/components/ButtonAI";
import { IScanDocument } from "@/types";

type Phase = "idle" | "scanning" | "result" | "error";
const MIN_SCAN_MS = 1200;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ScanCardProps {
  onScanStart?: () => void;
  onScanSuccess?: (data: IScanDocument) => void;
  onResultChange?: (data: IScanDocument | null) => void;
  onError?: (message: string) => void;
  onRateLimited?: (message: string) => void;
  onPaywall?: (mode: "PAYWALL" | "SIGN_IN_REQUIRED") => void;
  disabled?: boolean;
}

export default function ScanCard({
  onScanStart,
  onScanSuccess,
  onResultChange,
  onError,
  onRateLimited,
  onPaywall,
  disabled,
}: ScanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [result, setResult] = useState<IScanDocument | null>(null);
  const [message, setMessage] = useState("");
  const [stamped, setStamped] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefilledIdea = params.get("idea");
      if (prefilledIdea) {
        setIdea(prefilledIdea);
      }
    }
  }, []);

  const handleScan = useCallback(async () => {
    const cleanIdea = idea.trim();
    if (!cleanIdea || disabled) return;

    if (cardRef.current) {
      setLockedHeight(cardRef.current.offsetHeight); // lock height to prevent layout jump
    }
    setPhase("scanning");
    setMessage("");
    setStamped(false);
    setSkip(false);

    // Keep dispatching scan:start so homepage globe reacts
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("scan:start"));
    }
    onScanStart?.();

    const started = Date.now();

    try {
      // POST scan request. userId is never sent from browser; server gets it from Clerk.
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaText: cleanIdea }),
      });
      const json = await res.json();

      const elapsed = Date.now() - started;
      if (elapsed < MIN_SCAN_MS) await wait(MIN_SCAN_MS - elapsed);

      // Handle paywalls and sign-in requirements without stamping
      if (res.status === 401 || json.paywall === "SIGN_IN_REQUIRED") {
        setLockedHeight(null);
        setPhase("idle");
        onPaywall?.("SIGN_IN_REQUIRED");
        return;
      }
      if (res.status === 402 || json.paywall === "PAYWALL") {
        setLockedHeight(null);
        setPhase("idle");
        onPaywall?.("PAYWALL");
        return;
      }
      if (res.status === 429) {
        setLockedHeight(null);
        setPhase("idle");
        onRateLimited?.(json.error || "Rate limit reached.");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to scan idea.");
      }

      const scanDoc = json.data as IScanDocument;
      setResult(scanDoc);
      setLockedHeight(null);
      setPhase("result");
      onScanSuccess?.(scanDoc);
      onResultChange?.(scanDoc);

      // Keep the card's top in view when result appears
      const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) {
        cardRef.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    } catch (err: any) {
      const errMsg = err?.message || "The scan hit a snag on our side. Try again in a moment.";
      setMessage(errMsg);
      setLockedHeight(null);
      setPhase("error");
      onError?.(errMsg);
    }
  }, [idea, disabled, onScanStart, onScanSuccess, onResultChange, onError, onRateLimited, onPaywall]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "scanning") return;
    handleScan();
  };

  const showInput = phase === "idle" || phase === "error";

  return (
    <div
      ref={cardRef}
      className="w-full relative transition-all"
      style={{ minHeight: lockedHeight ?? undefined }}
    >
      {/* 1. INPUT FORM PHASE (idle & error) */}
      {showInput && (
        <form id="scan-form" onSubmit={handleSubmit} className="w-full mx-auto">
          <div className="relative">
            <textarea
              id="scan-input"
              value={idea}
              onChange={(e) => setIdea(e.target.value.slice(0, 500))}
              placeholder="Describe your SaaS idea in plain English (e.g. AI tool that turns Figma designs into clean React & Tailwind components with live AST parsing)..."
              rows={4}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-[var(--text-primary)] text-body font-[family-name:var(--font-inter)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-amber)] focus:shadow-[0_0_0_1px_var(--accent-amber)] transition-all duration-200 resize-none shadow-sm"
            />
            <span className="absolute bottom-3 right-4 text-xs font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
              {idea.length}/500
            </span>
          </div>

          {message && (
            <p role="alert" className="mt-3 text-xs text-red-500 font-mono bg-red-950/20 p-2.5 rounded-lg border border-red-900/30 text-left">
              {message}
            </p>
          )}

          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-meta text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Live Web Search Grounded • 100% Private</span>
            </div>

            <ButtonAI
              type="submit"
              disabled={!idea.trim() || disabled}
              loading={false}
              idleText="Scan this idea →"
              thinkingText="Scanning market..."
              className="w-full sm:w-auto font-[family-name:var(--font-space-grotesk)] cursor-pointer"
            />
          </div>

          {/* Trust & Privacy Guarantee Banner */}
          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-meta text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
            <div className="flex items-center gap-1.5">
              <span>🔒</span>
              <span><strong>100% Confidential:</strong> Ideas are analyzed live in real-time and never used for public AI training.</span>
            </div>
            <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-meta text-[var(--text-dim)]">
              <span>✓ 1 Free Lifetime Scan</span>
              <span>•</span>
              <span>✓ Zero Credit Card Needed</span>
            </div>
          </div>
        </form>
      )}

      {/* 2. ORBITING SOURCES LOADER PHASE */}
      {phase === "scanning" && (
        <div className="flex h-full min-h-[inherit] flex-col items-center justify-center py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm animate-in fade-in duration-300">
          <OrbitingSourcesLoader />
        </div>
      )}

      {/* 3. VERDICT STAMP & STAGGERED RESULT PHASE */}
      {phase === "result" && result && (
        // Clicking anywhere during the reveal skips straight to final state
        <div onClick={() => setSkip(true)} className="flex flex-col gap-6 cursor-default">
          <VerdictStampCard
            ideaText={idea}
            saturation={(result.saturationScore || "medium").toLowerCase() as Saturation}
            competitorCount={result.competitors?.length ?? 0}
            summary={result.saturationReasoning}
            skip={skip}
            onStamped={() => setStamped(true)}
          />

          {(stamped || skip) && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              <ScanResult data={result} skip={skip} showShareButton={true} />

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhase("idle");
                    setResult(null);
                    setStamped(false);
                    setSkip(false);
                    onResultChange?.(null);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] px-6 py-2.5 text-xs font-mono font-bold text-[var(--text-primary)] transition-colors cursor-pointer shadow-sm"
                >
                  Scan another idea &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
