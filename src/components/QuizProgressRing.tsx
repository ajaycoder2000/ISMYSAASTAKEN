"use client";

interface Props {
  answered: number; // how many questions have been answered (0–5)
  total: number;    // 5
  current: number;  // current question number shown in the center (1–5)
}

export function QuizProgressRing({ answered, total, current }: Props) {
  const size = 44;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(answered / total, 1);
  const offset = circumference * (1 - progress);
  const complete = answered >= total;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={answered}
      aria-label={`Question ${current} of ${total}`}
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {/* fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={complete ? "var(--accent-emerald)" : "var(--accent-amber)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="motion-safe:transition-[stroke-dashoffset,stroke] motion-safe:duration-[400ms] motion-safe:ease-out motion-reduce:transition-none"
        />
      </svg>
      <span
        className="absolute text-[11px] font-mono font-semibold tabular-nums"
        style={{ color: complete ? "var(--accent-emerald)" : "var(--text-primary)" }}
      >
        {complete ? "✓" : `${current}/${total}`}
      </span>
    </div>
  );
}
