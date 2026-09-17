'use client';

import { useState } from 'react';
import type { FailureKey } from './StartupFailureChart';

interface Question {
  id: string;
  text: string;
  options: { label: string; riskWeights: Partial<Record<FailureKey, number>> }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'demand',
    text: 'Have you confirmed real people actively want this?',
    options: [
      { label: "Yes — I've talked to potential users", riskWeights: {} },
      { label: "I think so, but haven't verified", riskWeights: { no_market_need: 2 } },
      { label: "Not yet — it's still just an idea", riskWeights: { no_market_need: 3 } },
    ],
  },
  {
    id: 'competition',
    text: "Do you know who you're competing against?",
    options: [
      { label: "Yes — I've mapped the competitors", riskWeights: {} },
      { label: "A few, but haven't looked deeply", riskWeights: { outcompeted: 2 } },
      { label: 'No idea who else is out there', riskWeights: { outcompeted: 3, no_market_need: 1 } },
    ],
  },
  {
    id: 'money',
    text: 'Do you have a plan for how this makes money?',
    options: [
      { label: 'Yes — clear pricing and model', riskWeights: {} },
      { label: 'Rough idea, not finalized', riskWeights: { ran_out_of_cash: 2 } },
      { label: "Haven't thought about it yet", riskWeights: { ran_out_of_cash: 3 } },
    ],
  },
];

const FAILURE_LABELS: Record<FailureKey, string> = {
  no_market_need: 'No market need',
  ran_out_of_cash: 'Ran out of cash',
  wrong_team: 'Wrong team',
  outcompeted: 'Got outcompeted',
};

export function ValidationSelfCheck({
  onComplete,
  onReset,
}: {
  onComplete?: (topRisk: FailureKey) => void;
  onReset?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<FailureKey, number>>({
    no_market_need: 0,
    ran_out_of_cash: 0,
    wrong_team: 0,
    outcompeted: 0,
  });
  const [done, setDone] = useState(false);

  function answer(option: Question['options'][number]) {
    const next = { ...scores };
    for (const [key, weight] of Object.entries(option.riskWeights)) {
      next[key as FailureKey] += weight as number;
    }
    setScores(next);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      const topRisk = (Object.keys(next) as FailureKey[]).reduce((a, b) =>
        next[a] >= next[b] ? a : b
      );
      onComplete?.(topRisk);
    }
  }

  function handleReset() {
    setScores({
      no_market_need: 0,
      ran_out_of_cash: 0,
      wrong_team: 0,
      outcompeted: 0,
    });
    setStep(0);
    setDone(false);
    onReset?.();
  }

  if (done) {
    const topRisk = (Object.keys(scores) as FailureKey[]).reduce((a, b) =>
      scores[a] >= scores[b] ? a : b
    );
    const allZero = Object.values(scores).every((v) => v === 0);

    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 text-center shadow-xl">
        {allZero ? (
          <>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xl mb-3">
              👏
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-space-grotesk)] mb-2">
              You&apos;ve done your homework 👏
            </h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed mb-5 font-[family-name:var(--font-inter)]">
              Your answers suggest you&apos;ve already thought about demand, competition, and monetization.
              A real scan can confirm it with live web search grounding and competitor moat analysis.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)] mb-1 font-semibold">
              Your idea is most exposed to:
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--accent-amber)] mb-2 font-[family-name:var(--font-space-grotesk)]">
              {FAILURE_LABELS[topRisk]}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed mb-5 font-[family-name:var(--font-inter)]">
              This is exactly what a live scan checks. Don&apos;t guess — verify real competitors and market demand before writing code.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-mono)] underline underline-offset-4 cursor-pointer font-medium"
        >
          ↺ Retake self-check
        </button>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-7 shadow-xl">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border)]">
        <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)] font-medium">
          Question {step + 1} of {QUESTIONS.length}
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 sm:w-8 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-[var(--accent-amber)]' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-space-grotesk)]">
        {q.text}
      </h3>

      <div className="flex flex-col gap-2.5">
        {q.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => answer(opt)}
            className="text-left px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface-alt)] text-xs sm:text-sm text-[var(--text-secondary)] hover:border-[var(--accent-amber)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all font-[family-name:var(--font-inter)] cursor-pointer flex items-center justify-between group shadow-sm font-medium"
          >
            <span>{opt.label}</span>
            <span className="text-[var(--accent-amber)] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ValidationSelfCheck;
