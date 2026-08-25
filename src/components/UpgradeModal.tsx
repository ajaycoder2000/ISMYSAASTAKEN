"use client";
import { useState } from "react";
import Link from "next/link";

interface UpgradeModalProps {
  open: boolean;
  scansUsed?: number;
  scansLimit?: number;
  daysUntilReset?: number;
  proMonthlyPrice?: number;
  proYearlyPrice?: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export default function UpgradeModal({
  open,
  scansUsed = 3,
  scansLimit = 3,
  daysUntilReset = 12,
  proMonthlyPrice = 12,
  proYearlyPrice = 99,
  onUpgrade,
  onDismiss,
}: UpgradeModalProps) {
  const [upgrading, setUpgrading] = useState(false);

  if (!open) return null;

  const yearlySavings = Math.round((1 - proYearlyPrice / (proMonthlyPrice * 12)) * 100);

  const handleUpgrade = () => {
    setUpgrading(true);
    if (onUpgrade) {
      onUpgrade();
    } else {
      window.location.href = "/pricing";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[rgba(5,7,9,0.8)] backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
    >
      <div
        className="bg-[hsl(220,15%,10%)] border border-[var(--border)] rounded-2xl max-w-[420px] w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top section */}
        <div className="px-6 pt-7 text-center">
          {/* Depleted icon with ping ring */}
          <div className="w-14 h-14 rounded-full mx-auto mb-3.5 flex items-center justify-center text-2xl relative bg-[rgba(255,103,89,0.12)] border border-[#6b3a33]">
            ⚡
            <span className="absolute inset-[-4px] rounded-full border border-[var(--red)] animate-ping opacity-50" />
          </div>

          <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-1.5 leading-snug">
            You&apos;ve used all {scansLimit} free scans this month
          </h3>
          <p className="text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)] leading-relaxed mb-5">
            Your quota resets in {daysUntilReset} days — or upgrade now for instant unlimited
            access, Pivot Angles, and Pitch Deck exports.
          </p>

          {/* Depleted meter */}
          <div className="flex gap-1.5 justify-center mb-5">
            {Array.from({ length: scansLimit }).map((_, i) => (
              <div
                key={i}
                className={`w-9 h-2.5 rounded-sm ${
                  i < scansUsed
                    ? "bg-[var(--red)] shadow-[0_0_8px_rgba(255,103,89,0.4)]"
                    : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Plan card */}
        <div className="px-6 pb-6">
          <div className="bg-[var(--panel-raised)] border border-[var(--amber-mid,#6b5a2a)] rounded-xl p-4 mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(255,210,63,0.08)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[var(--amber)] font-extrabold font-[family-name:var(--font-mono)] tracking-wider">
                FOUNDER PRO
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--amber-dim,#3d2c0c)] text-[var(--amber)] border border-[var(--amber-mid,#6b5a2a)]">
                UNLIMITED
              </span>
            </div>
            <p className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-3">
              ${proMonthlyPrice}
              <span className="text-xs text-[var(--text-faint)] font-normal">/month</span>
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--amber)] font-bold">✓</span> Unlimited AI scans, no monthly cap
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--amber)] font-bold">✓</span> Strategic Pivot Moats & Wedges
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--amber)] font-bold">✓</span> Executive Pitch Card PNG export
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--amber)] font-bold">✓</span> Saved scan history & bookmarks
              </li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] bg-[var(--accent)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] shadow-lg shadow-[rgba(245,166,35,0.2)] transition-all disabled:opacity-60 cursor-pointer"
          >
            {upgrading ? "Redirecting..." : "Upgrade to Pro →"}
          </button>

          <button
            onClick={onDismiss}
            className="block mx-auto mt-3 text-xs text-[var(--text-faint)] hover:text-[var(--text-dim)] bg-transparent border-none cursor-pointer"
          >
            I&apos;ll wait for the quota reset
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] text-center text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] bg-[hsl(220,15%,8%)]">
          or <Link href="/pricing" className="text-[var(--amber)] hover:underline">get a $9 7-Day Sprint Pass</Link>
        </div>
      </div>
    </div>
  );
}
