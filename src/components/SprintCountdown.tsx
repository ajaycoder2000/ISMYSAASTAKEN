"use client";
import { useState, useEffect } from "react";

interface SprintCountdownProps {
  expiresAt: Date;
  variant?: "full" | "badge";
}

function calcTimeLeft(expiresAt: Date) {
  const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    total: diff,
  };
}

export default function SprintCountdown({ expiresAt, variant = "full" }: SprintCountdownProps) {
  const [time, setTime] = useState(calcTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => setTime(calcTimeLeft(expiresAt)), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (time.total <= 0) return null;

  // Compact nav badge variant
  if (variant === "badge") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-mono)] text-[var(--amber)] font-bold px-2.5 py-1 border border-[var(--amber-mid,#6b5a2a)] rounded-lg bg-[var(--amber-dim,#3d2c0c)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_6px_var(--amber)] animate-pulse" />
        SPRINT {time.days}d {String(time.hours).padStart(2, "0")}h
      </div>
    );
  }

  // Full dashboard variant
  return (
    <div className="rounded-2xl border border-[var(--amber-mid,#6b5a2a)] bg-gradient-to-r from-[var(--amber-dim,#3d2c0c)] to-[rgba(255,210,63,0.08)] px-5 py-4 flex items-center justify-between gap-4 flex-wrap shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--amber-dim,#3d2c0c)] border border-[var(--amber-mid,#6b5a2a)] flex items-center justify-center text-base">
          ⚡
        </div>
        <div>
          <p className="text-xs text-[var(--amber)] font-bold font-[family-name:var(--font-space-grotesk)]">
            7-DAY SPRINT PASS ACTIVE
          </p>
          <p className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)]">
            Full Pro access & 25 deep scans until timer expires
          </p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {[
          { val: time.days, lbl: "DAYS" },
          { val: String(time.hours).padStart(2, "0"), lbl: "HRS" },
          { val: String(time.minutes).padStart(2, "0"), lbl: "MIN" },
          { val: String(time.seconds).padStart(2, "0"), lbl: "SEC" },
        ].map((u) => (
          <div
            key={u.lbl}
            className="bg-[hsl(220,15%,9%)] border border-[var(--amber-mid,#6b5a2a)] rounded-lg px-2.5 py-1.5 text-center min-w-[44px]"
          >
            <span className="block text-sm sm:text-base font-extrabold font-[family-name:var(--font-mono)] text-[var(--amber)]">
              {u.val}
            </span>
            <span className="block text-[8px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] tracking-wider mt-0.5">
              {u.lbl}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
