"use client";

type ChangeType = "new" | "gone" | "same";

interface DiffEntry {
  name: string;
  change: ChangeType;
  detail: string;
}

interface ScanDiffProps {
  ideaText?: string;
  comparedTo?: string;
  entries?: DiffEntry[];
  summary?: string;
  previousScore?: string;
  currentScore?: string;
}

const CHANGE_STYLES: Record<ChangeType, { bg: string; border: string; color: string; symbol: string }> = {
  new: {
    bg: "bg-[var(--green-dim,#173d24)]",
    border: "border-[var(--green-mid,#1a5c33)]",
    color: "text-[var(--green,#39ff6a)]",
    symbol: "+",
  },
  gone: {
    bg: "bg-[rgba(255,103,89,0.1)]",
    border: "border-[#6b3a33]",
    color: "text-[var(--red)]",
    symbol: "×",
  },
  same: {
    bg: "bg-[var(--panel-raised)]",
    border: "border-[var(--border)]",
    color: "text-[var(--text-faint)]",
    symbol: "—",
  },
};

const SCORE_COLORS: Record<string, string> = {
  LOW: "text-[var(--green,#39ff6a)]",
  MEDIUM: "text-[var(--amber)]",
  HIGH: "text-[var(--red)]",
};

const DEFAULT_ENTRIES: DiffEntry[] = [
  { name: "Voicenotes.com", change: "new", detail: "launched 3d ago" },
  { name: "Fireflies.ai", change: "same", detail: "still active" },
  { name: "Otter.ai", change: "same", detail: "still active" },
  { name: "Audiopen.ai", change: "gone", detail: "domain expired" },
];

export default function ScanDiff({
  ideaText = "Notion for voice notes",
  comparedTo = "vs. scan from 28 days ago",
  entries = DEFAULT_ENTRIES,
  summary = "Saturation moved due to Voicenotes.com entering the space. Your original gap (project-tracker integration) is still wide open.",
  previousScore = "LOW",
  currentScore = "MEDIUM",
}: ScanDiffProps) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 max-w-[500px] w-full mx-auto shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border)]">
        <div>
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--accent)] block">
            MARKET DELTA DIFF
          </span>
          <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mt-0.5">
            &ldquo;{ideaText}&rdquo;
          </p>
        </div>
        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] px-2 py-0.5 rounded bg-[hsl(220,10%,16%)]">
          {comparedTo}
        </span>
      </div>

      {/* Diff rows */}
      <div className="space-y-1.5 mb-4">
        {entries.map((entry, i) => {
          const style = CHANGE_STYLES[entry.change];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-2 px-2.5 rounded-lg text-xs hover:bg-[hsl(220,10%,14%)] transition-colors ${
                i < entries.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0 border ${style.bg} ${style.border} ${style.color}`}
              >
                {style.symbol}
              </div>
              <span className="text-[var(--text)] font-medium flex-1">{entry.name}</span>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-faint)]">
                {entry.detail}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary callout */}
      <div className="pl-3.5 border-l-2 border-l-[var(--accent)] bg-[var(--panel-raised)] rounded-r-xl py-3 pr-3 text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)] leading-relaxed">
        Saturation moved from{" "}
        <strong className={SCORE_COLORS[previousScore] || "text-[var(--text)]"}>
          {previousScore}
        </strong>{" "}
        →{" "}
        <strong className={SCORE_COLORS[currentScore] || "text-[var(--text)]"}>
          {currentScore}
        </strong>
        . {summary}
      </div>
    </div>
  );
}
