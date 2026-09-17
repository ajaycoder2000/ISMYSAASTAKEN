"use client";
import { useState } from "react";

interface GapPreviewItem {
  idea: string;
  category: string;
  verdict: string;
}

interface WeeklyGapSignupProps {
  previewItems?: GapPreviewItem[];
  subscriberCount?: number;
  onSubscribe?: (email: string) => Promise<void>;
}

const DEFAULT_ITEMS: GapPreviewItem[] = [
  { idea: "voice notes for sales teams → Linear auto-ticket", category: "AI & Workflows", verdict: "OPEN GAP" },
  { idea: "soc2 compliance tracker for solo founders", category: "Micro-SaaS", verdict: "LOW MOAT" },
  { idea: "figma design token → tailwind compiler", category: "DevTools", verdict: "OPEN GAP" },
  { idea: "ai cold email warmup with deliverability telemetry", category: "Growth Tools", verdict: "UNDERSERVED" },
];

export default function WeeklyGapSignup({
  previewItems = DEFAULT_ITEMS,
  subscriberCount = 1204,
  onSubscribe,
}: WeeklyGapSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) return;

    setStatus("loading");
    setMessage("");

    try {
      if (onSubscribe) {
        await onSubscribe(cleanEmail);
      }

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("done");
        setMessage(data.message || "✓ You're in! First report lands Monday at 9:00 AM.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Top gradient accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: "linear-gradient(90deg, var(--accent-amber), #b967ff, var(--accent-amber))",
          backgroundSize: "200% 100%",
        }}
      />

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Copy + Form */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📡</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--accent-amber)]">
                FOUNDER MARKET INTELLIGENCE
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] mb-2">
              The Weekly SaaS Gap Report
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed mb-6 max-w-lg">
              Every Monday: we distill real scan telemetry into the top 5 defensible startup wedges and underserved market gaps. 100% signal, zero fluff.
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                disabled={status === "loading"}
                className="flex-1 bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] font-[family-name:var(--font-inter)] text-xs outline-none focus:border-[var(--accent-amber)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[var(--accent-amber)] hover:opacity-90 text-black px-5 py-2.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-grotesk)] whitespace-nowrap transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {status === "loading" ? "Subscribing..." : "Get Free Report →"}
              </button>
            </form>

            {message && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-[family-name:var(--font-mono)] max-w-md animate-fade-in ${
                  status === "done"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] mt-3">
              🔒 Join {subscriberCount.toLocaleString()} founders • Unsubscribe anytime with 1 click
            </p>
          </div>

          {/* Right Column: Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2.5">
                <span className="text-[9.5px] font-bold font-[family-name:var(--font-mono)] text-[var(--text-muted)] tracking-[0.2em] uppercase">
                  PREVIEW: LATEST IDENTIFIED GAPS
                </span>
                <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                  LIVE ISSUE
                </span>
              </div>

              <div className="space-y-2">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex items-start justify-between gap-3 text-xs shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[var(--text-primary)] font-medium block truncate">
                        &ldquo;{item.idea}&rdquo;
                      </span>
                      <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 flex-shrink-0">
                      {item.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
