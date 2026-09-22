'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Sparkles, X } from 'lucide-react';
import { Answers } from './types';

// Lazy load the full quiz modal only when triggered (Core Web Vitals & LCP protection)
const FounderQuizContent = dynamic(() => import('./FounderQuizContent'), {
  ssr: false,
  loading: () => null,
});

const ALLOWED_ROUTES = ['/', '/keywords', '/is-it-taken', '/roast'];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function FounderQuizLauncher() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();

  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileTeaser, setShowMobileTeaser] = useState<boolean>(false);
  const [showFullQuiz, setShowFullQuiz] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = useRef<boolean>(false);

  // 1. Check Route and Frequency Capping
  const checkEligibility = useCallback(() => {
    // Check route whitelist
    const isAllowed = ALLOWED_ROUTES.includes(pathname);
    if (!isAllowed) return false;

    // Check localStorage & sessionStorage safely
    try {
      if (typeof window === 'undefined') return false;

      // Never show if completed
      if (localStorage.getItem('founderQuiz:completed') === 'true') {
        return false;
      }

      // Max once per session
      if (sessionStorage.getItem('founderQuiz:sessionShown') === 'true') {
        return false;
      }

      // 30-day cooldown if dismissed
      const dismissedAt = localStorage.getItem('founderQuiz:dismissedAt');
      if (dismissedAt) {
        const diff = Date.now() - Number(dismissedAt);
        if (diff < THIRTY_DAYS_MS) {
          return false;
        }
      }
    } catch {
      // Storage unavailable or blocked
      return false;
    }

    return true;
  }, [pathname]);

  // 2. Post-signup auto-claim listener
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    try {
      const pendingJson = localStorage.getItem('founderQuiz:pendingClaim');
      if (pendingJson) {
        const pendingAnswers = JSON.parse(pendingJson);
        fetch('/api/onboarding/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingAnswers),
        })
          .then((res) => {
            if (res.ok) {
              localStorage.removeItem('founderQuiz:pendingClaim');
              localStorage.setItem('founderQuiz:completed', 'true');
            }
          })
          .catch((err) => console.warn('Failed to claim pending onboarding bonus:', err));
      }

      // Check if signed-in user already completed onboarding
      fetch('/api/auth/session')
        .then((r) => r.json())
        .then((data) => {
          if (data?.user?.onboarding_completed_at) {
            localStorage.setItem('founderQuiz:completed', 'true');
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, [isLoaded, isSignedIn]);

  // 3. Setup engagement triggers
  useEffect(() => {
    if (triggeredRef.current) return;

    const eligible = checkEligibility();
    setIsEligible(eligible);
    if (!eligible) return;

    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });

    const triggerPopup = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      // Mark session shown
      try {
        sessionStorage.setItem('founderQuiz:sessionShown', 'true');
      } catch {
        // ignore
      }

      // Log telemetry
      fetch('/api/onboarding/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'quiz_shown' }),
      }).catch(() => {});

      const mobileMode = window.innerWidth < 768;
      if (mobileMode) {
        // Mobile SEO rule: NEVER auto-open a modal! Show bottom slide-in teaser card only
        setShowMobileTeaser(true);
      } else {
        // Desktop: open centered modal
        setShowFullQuiz(true);
      }
    };

    // Trigger A: 20 seconds time-on-page
    timerRef.current = setTimeout(() => {
      triggerPopup();
    }, 20000);

    // Trigger B: 50% scroll depth using IntersectionObserver on sentinel
    let observer: IntersectionObserver | null = null;
    const sentinel = document.getElementById('quiz-scroll-sentinel');
    if (sentinel && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            triggerPopup();
          }
        },
        { rootMargin: '0px', threshold: 0.1 }
      );
      observer.observe(sentinel);
    }

    // Trigger C (Desktop only): Exit intent (mouse leaves top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (window.innerWidth >= 768 && e.clientY <= 0) {
        triggerPopup();
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (observer) observer.disconnect();
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', checkViewport);
    };
  }, [checkEligibility]);

  // Handle dismiss
  const handleDismiss = () => {
    setShowMobileTeaser(false);
    setShowFullQuiz(false);

    try {
      localStorage.setItem('founderQuiz:dismissedAt', Date.now().toString());
    } catch {
      // ignore
    }

    fetch('/api/onboarding/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'quiz_dismissed' }),
    }).catch(() => {});
  };

  // Handle completion
  const handleCompleted = (answers: Answers) => {
    try {
      localStorage.setItem('founderQuiz:completed', 'true');
    } catch {
      // ignore
    }

    fetch('/api/onboarding/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'quiz_completed',
        metadata: { stage: answers.stage, worry: answers.worry },
      }),
    }).catch(() => {});
  };

  // If not eligible and no active view, render nothing
  if (!isEligible && !showMobileTeaser && !showFullQuiz) {
    return null;
  }

  return (
    <>
      {/* 1. Mobile Bottom Teaser Card (< 20% viewport height, strictly non-intrusive) */}
      {showMobileTeaser && !showFullQuiz && (
        <aside
          aria-label="Founder Quiz Invitation"
          className="fixed bottom-3 left-3 right-3 z-40 sm:hidden bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-slide-up transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-base shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] truncate">
                Take 30-sec Founder Quiz
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                Unlock 1 bonus idea scan reward
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowMobileTeaser(false);
                setShowFullQuiz(true);
              }}
              className="px-3 py-2 rounded-xl bg-[var(--accent-amber)] hover:opacity-95 text-white text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all cursor-pointer shadow-sm"
            >
              Start →
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss quiz invitation"
            >
              <X className="size-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. Full Modal Dialog (Desktop or user-initiated mobile sheet) */}
      {showFullQuiz && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleDismiss();
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div className="w-full sm:w-auto max-h-[92vh] flex items-center justify-center">
            <FounderQuizContent
              onClose={handleDismiss}
              onCompleted={handleCompleted}
            />
          </div>
        </div>
      )}
    </>
  );
}
