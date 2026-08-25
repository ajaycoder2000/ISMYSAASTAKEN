"use client";
import { useState } from "react";

interface CommunityPollProps {
  scanId: string;
  initialYes?: number;
  initialNo?: number;
  onVote?: (scanId: string, vote: "yes" | "no") => Promise<void>;
}

export default function CommunityPoll({
  scanId,
  initialYes = 104,
  initialNo = 38,
  onVote,
}: CommunityPollProps) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [yes, setYes] = useState(initialYes);
  const [no, setNo] = useState(initialNo);

  const total = yes + no;
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
  const noPct = total > 0 ? 100 - yesPct : 0;

  const handleVote = async (choice: "yes" | "no") => {
    if (voted) return;
    if (choice === "yes") setYes((v) => v + 1);
    else setNo((v) => v + 1);
    setVoted(choice);
    await onVote?.(scanId, choice);
  };

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-5 max-w-[420px] w-full mx-auto text-center shadow-lg">
      <p className="text-sm font-bold text-[var(--text)] font-[family-name:var(--font-space-grotesk)] mb-4">
        Would you build this idea?
      </p>

      <div className="flex gap-2.5 justify-center mb-4">
        <button
          onClick={() => handleVote("yes")}
          disabled={!!voted}
          className={`flex-1 py-3 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer ${
            voted === "yes"
              ? "border-[var(--green-mid,#1a5c33)] bg-[var(--green-dim,#173d24)] text-[var(--green,#39ff6a)] cursor-default"
              : voted
              ? "border-[var(--border)] bg-[var(--panel-raised)] text-[var(--text-faint)] cursor-default opacity-50"
              : "border-[var(--border)] bg-[var(--panel-raised)] text-[var(--text-dim)] hover:border-[var(--accent-mid)] hover:text-[var(--text)] hover:shadow-md"
          }`}
        >
          👍 Yes, build it
        </button>
        <button
          onClick={() => handleVote("no")}
          disabled={!!voted}
          className={`flex-1 py-3 rounded-lg text-xs font-bold border transition-all duration-150 cursor-pointer ${
            voted === "no"
              ? "border-[#6b3a33] bg-[rgba(255,103,89,0.08)] text-[var(--red)] cursor-default"
              : voted
              ? "border-[var(--border)] bg-[var(--panel-raised)] text-[var(--text-faint)] cursor-default opacity-50"
              : "border-[var(--border)] bg-[var(--panel-raised)] text-[var(--text-dim)] hover:border-[var(--accent-mid)] hover:text-[var(--text)] hover:shadow-md"
          }`}
        >
          👎 Skip it
        </button>
      </div>

      {/* Result bar — only shown after voting */}
      {voted && (
        <div className="animate-fade-in pt-1">
          <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-1.5 flex">
            <div
              className="h-full bg-[var(--green,#39ff6a)] transition-all duration-700"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="h-full bg-[var(--red)] transition-all duration-700"
              style={{ width: `${noPct}%` }}
            />
          </div>
          <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-faint)]">
            {yesPct}% yes · {noPct}% no · {total + 1} votes
          </p>
        </div>
      )}
    </div>
  );
}
