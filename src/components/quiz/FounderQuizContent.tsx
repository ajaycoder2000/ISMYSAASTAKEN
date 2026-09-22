'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser, SignUpButton } from '@clerk/nextjs';
import { X, ArrowLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  Answers,
  QUESTIONS,
  PROFILE_NAMES,
  TOOL_FOR_WORRY,
  getSummarySentence,
  suggestPlan,
} from './types';

interface FounderQuizContentProps {
  onClose: () => void;
  onCompleted: (answers: Answers) => void;
}

export default function FounderQuizContent({
  onClose,
  onCompleted,
}: FounderQuizContentProps) {
  const { isSignedIn, user } = useUser();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelectOption = (value: any) => {
    const question = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finished all 5 questions
      finishQuiz(newAnswers as Answers);
    }
  };

  const finishQuiz = async (completedAnswers: Answers) => {
    setIsCompleted(true);
    onCompleted(completedAnswers);

    // If user is already signed in, claim bonus scan directly
    if (isSignedIn) {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/onboarding/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completedAnswers),
        });
        if (res.ok) {
          setBonusClaimed(true);
        } else {
          setClaimError('Bonus scan already recorded or claimed.');
        }
      } catch (err) {
        console.warn('Failed to auto-claim bonus scan:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Stash pending claim in localStorage for post-signup redemption
      try {
        localStorage.setItem(
          'founderQuiz:pendingClaim',
          JSON.stringify(completedAnswers)
        );
      } catch {
        // localStorage not available
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isCompleted) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const totalQuestions = QUESTIONS.length;
  const progressPercent = isCompleted
    ? 100
    : Math.round(((currentStep + 1) / totalQuestions) * 100);

  const fullAnswers = answers as Answers;
  const profileName = fullAnswers.stage ? PROFILE_NAMES[fullAnswers.stage] : 'Founder';
  const recommendedTool = fullAnswers.worry
    ? TOOL_FOR_WORRY[fullAnswers.worry]
    : TOOL_FOR_WORRY.already_built;
  const suggestedPlan = fullAnswers.stage ? suggestPlan(fullAnswers) : 'free';

  const greetingHeading =
    isSignedIn && user?.firstName
      ? `Welcome back, ${user.firstName} 👋`
      : 'Welcome, founder 👋';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-quiz-heading"
      ref={modalRef}
      className="relative w-full max-w-[480px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden text-left transition-colors"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          {currentStep > 0 && !isCompleted && (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
              aria-label="Previous question"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--accent-amber)]">
            {isCompleted ? 'Profile Result' : `Question ${currentStep + 1} of ${totalQuestions}`}
          </span>
        </div>

        {/* Close Button — min 44x44px touch area */}
        <button
          type="button"
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer rounded-lg hover:bg-[var(--bg-surface-alt)]"
          aria-label="Close founder quiz"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[var(--border)] h-1 rounded-full overflow-hidden mt-2.5 mb-3.5 sm:mt-3 sm:mb-5">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-amber)] to-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Questions View */}
      {!isCompleted && currentQuestion && (
        <div className="flex flex-col justify-between min-h-[280px] sm:min-h-[300px]">
          <div>
            {/* Step 0 Welcome Greeting */}
            {currentStep === 0 && (
              <div className="mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-[var(--border)] motion-safe:animate-fade-in motion-reduce:animate-none">
                <h3 className="text-[17px] sm:text-[18px] font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
                  {greetingHeading}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-snug mt-1">
                  Before you build anything, let&apos;s see where you stand. 5 quick taps, 30 seconds, and a bonus scan at the end.
                </p>
              </div>
            )}

            <h2
              id="founder-quiz-heading"
              className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight mb-1"
            >
              {currentQuestion.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)] mb-3 sm:mb-4">
              {currentQuestion.subtitle}
            </p>

            {/* Options List */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`group w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] ${
                      isSelected
                        ? 'border-[var(--accent-amber)] bg-amber-500/10 text-[var(--text-primary)] shadow-sm'
                        : 'border-[var(--border)] bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] hover:border-[var(--accent-amber)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {opt.icon && (
                        <span className="text-base sm:text-lg shrink-0">
                          {opt.icon}
                        </span>
                      )}
                      <span>{opt.label}</span>
                    </div>
                    <span
                      className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[var(--accent-amber)] bg-[var(--accent-amber)] text-white'
                          : 'border-[var(--border)] group-hover:border-[var(--accent-amber)]'
                      }`}
                    >
                      {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Dismiss Button */}
          <div className="flex justify-between items-center pt-5 mt-4 border-t border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-dim)]">
              🔒 100% private. Never shared.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer underline underline-offset-4"
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {/* Result Card View */}
      {isCompleted && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* Profile Header */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-surface-alt)] to-[var(--bg-surface-alt)] border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-[var(--accent-amber)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent-amber)]">
                Your Founder Profile
              </span>
            </div>
            <h2
              id="founder-quiz-heading"
              className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]"
            >
              You&apos;re <span className="text-[var(--accent-amber)]">{profileName}</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-1.5 leading-relaxed">
              {getSummarySentence(fullAnswers)}
            </p>
          </div>

          {/* Recommended Tool */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--text-dim)]">
                Recommended Tool For You
              </span>
              <span className="text-sm">{recommendedTool.icon}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
                {recommendedTool.name}
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5">
                {recommendedTool.desc}
              </p>
            </div>
            <Link
              href={recommendedTool.href}
              onClick={onClose}
              className="inline-flex items-center justify-center w-full py-2 px-3.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] transition-all font-[family-name:var(--font-mono)]"
            >
              {recommendedTool.actionText}
            </Link>
          </div>

          {/* Soft Plan Suggestion (only if not free) */}
          {suggestedPlan !== 'free' && (
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
              <span className="text-sm shrink-0">💡</span>
              <div>
                <strong className="text-[var(--text-primary)] font-semibold">
                  {suggestedPlan === 'sprint_pass'
                    ? '7-Day Sprint Pass Suggested'
                    : 'Founder Pro Suggested'}
                  :
                </strong>{' '}
                {suggestedPlan === 'sprint_pass'
                  ? 'Since you plan to decide this week, a Sprint Pass gives you 25 rapid-fire scans with zero monthly commitment.'
                  : 'Since you are ready to launch or build this month, Pro keeps your competitors on continuous telemetry.'}
              </div>
            </div>
          )}

          {/* Bonus Scan Reward Section */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm font-[family-name:var(--font-space-grotesk)]">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>1 Bonus Idea Scan Unlocked!</span>
            </div>

            {isSignedIn ? (
              <div className="space-y-1">
                <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
                  {bonusClaimed
                    ? '✓ Your bonus scan has been credited directly to your account.'
                    : claimError ||
                      (isSubmitting
                        ? 'Applying bonus scan to your account...'
                        : 'Your bonus scan has been registered.')}
                </p>
                <div className="pt-2">
                  <Link
                    href="/#scan-form"
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[var(--accent-amber)] hover:opacity-95 text-white text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all shadow-sm"
                  >
                    Run Your Bonus Scan Now →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
                  Create a free account to claim your bonus scan. No credit card required.
                </p>
                <div className="pt-1">
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[var(--accent-amber)] hover:opacity-95 text-white text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all shadow-sm cursor-pointer"
                    >
                      Sign Up Free to Claim 1 Bonus Scan →
                    </button>
                  </SignUpButton>
                </div>
              </div>
            )}
          </div>

          {/* Dismiss Footer */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer underline underline-offset-4"
            >
              Done, close window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
