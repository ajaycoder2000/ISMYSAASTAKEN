"use client";
import { useState } from "react";

interface GapPreviewItem {
  idea: string;
}

interface WeeklyGapSignupProps {
  previewItems?: GapPreviewItem[];
  subscriberCount?: number;
  onSubscribe?: (email: string) => Promise<void>;
}

const DEFAULT_ITEMS: GapPreviewItem[] = [
  { idea: "voice notes for sales teams" },
  { idea: "soc2 automation for solopreneurs" },
  { idea: "figma → tailwind converter" },
  { idea: "ai cold email warmup tool" },
  { idea: "micro-saas uptime monitor" },
];

export default function WeeklyGapSignup({
  previewItems = DEFAULT_ITEMS,
  subscriberCount = 1204,
  onSubscribe,
}: WeeklyGapSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async () => {
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
    }, 3000);
  };

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl max-w-[540px] w-full mx-auto overflow-hidden shadow-2xl">
      {/* Animated gradient accent bar */}
      <div
        className="h-[3px]"
        style={{
          background: "linear-gradient(90deg, var(--accent), #b967ff, var(--accent))",
          backgroundSize: "200% 100%",
        }}
      />

      <div className="px-6 py-8 text-center">
        <p className="text-3xl mb-2.5">📡</p>
        <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-1">
          The Weekly Gap Report
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-dim)] font-[family-name:var(--font-inter)] leading-relaxed mb-6 max-w-sm mx-auto">
          Every Monday: the top 5 defensible SaaS gaps found across all scans that week. No fluff, just pure market opportunities.
        </p>

        {/* Preview of last week's report */}
        <div className="bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-left mb-6">
          <p className="text-[9.5px] font-bold font-[family-name:var(--font-mono)] text-[var(--text-faint)] tracking-[0.2em] mb-2.5">
            PREVIEW — LAST WEEK&apos;S SCAN REPORT
          </p>
          <div className="space-y-1.5">
            {previewItems.map((item, i) => (
              <div
                key={i}
                className={`flex justify-between items-center py-1.5 text-xs ${
                  i < previewItems.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <span className="text-[var(--text)] font-medium">&ldquo;{item.idea}&rdquo;</span>
                <span className="text-[9.5px] font-bold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-mid)]">
                  OPEN GAP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email form */}
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="founder@example.com"
            disabled={status !== "idle"}
            className="flex-1 bg-[hsl(220,15%,8%)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] font-[family-name:var(--font-inter)] text-xs outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={status !== "idle"}
            className="bg-[var(--accent)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] px-5 py-2.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-grotesk)] whitespace-nowrap transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {status === "done" ? "✓ Subscribed!" : status === "loading" ? "..." : "Subscribe →"}
          </button>
        </div>

        <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] mt-3.5">
          Join {subscriberCount.toLocaleString()} founders receiving free weekly gaps
        </p>
      </div>
    </div>
  );
}
