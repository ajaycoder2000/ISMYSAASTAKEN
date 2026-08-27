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
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      await onSubscribe?.(email);
    } catch {
      // Proceed anyway for UI
    }
    setStatus("done");
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
    }, 4000);
  };

  return (
    <div className="w-full bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Top gradient accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: "linear-gradient(90deg, hsl(42,95%,55%), #b967ff, hsl(42,95%,55%))",
          backgroundSize: "200% 100%",
        }}
      />

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Copy + Form */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📡</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)]">
                FOUNDER MARKET INTELLIGENCE
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] mb-2">
              The Weekly SaaS Gap Report
            </h3>

            <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mb-6 max-w-lg">
              Every Monday: we distill real scan telemetry into the top 5 defensible startup wedges and underserved market gaps. 100% signal, zero fluff.
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                disabled={status !== "idle"}
                className="flex-1 bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,20%)] rounded-xl px-4 py-2.5 text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] text-xs outline-none focus:border-[hsl(42,95%,55%)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] px-5 py-2.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-grotesk)] whitespace-nowrap transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {status === "done" ? "✓ Subscribed!" : status === "loading" ? "..." : "Get Free Report →"}
              </button>
            </form>

            <p className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] mt-3">
              🔒 Join {subscriberCount.toLocaleString()} founders • Unsubscribe anytime with 1 click
            </p>
          </div>

          {/* Right Column: Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 border-b border-[hsl(220,10%,16%)] pb-2.5">
                <span className="text-[9.5px] font-bold font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] tracking-[0.2em] uppercase">
                  PREVIEW: LATEST IDENTIFIED GAPS
                </span>
                <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.1)] px-1.5 py-0.5 rounded border border-[hsl(145,60%,45%,0.2)]">
                  LIVE ISSUE
                </span>
              </div>

              <div className="space-y-2">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[hsl(220,14%,9%)] border border-[hsl(220,10%,16%)] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[hsl(40,20%,90%)] font-medium block truncate">
                        &ldquo;{item.idea}&rdquo;
                      </span>
                      <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(42,95%,55%,0.12)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.25)] flex-shrink-0">
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
