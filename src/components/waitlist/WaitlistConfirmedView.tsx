'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WAITLIST_BASE_REWARD, REFERRAL_TIERS } from '@/lib/waitlistRewards';
import { SITE_URL } from '@/lib/site';

export default function WaitlistConfirmedView() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code')?.trim() || '';

  const [copied, setCopied] = useState(false);
  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const referralUrl = code ? `${SITE_URL}/?ref=${encodeURIComponent(code)}` : `${SITE_URL}/`;

  const shareText = `I just joined the waitlist for ismysaastaken?, it checks if your SaaS idea is already taken. Join me: ${referralUrl}`;
  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  useEffect(() => {
    if (!code) return;

    let isMounted = true;
    setLoadingProgress(true);

    fetch(`/api/waitlist/progress?code=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && typeof data.confirmedFriends === 'number') {
          setFriendsCount(data.confirmedFriends);
        }
      })
      .catch((err) => {
        console.error('Error fetching waitlist progress:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingProgress(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 sm:py-20">
      {/* Brand Badge */}
      <div className="flex items-center justify-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-[family-name:var(--font-mono)] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Confirmed Founding Member
        </span>
      </div>

      <div className="space-y-8 text-center">
        {/* Main Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto text-emerald-400 shadow-xl">
            🎉
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
            You&apos;re in.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-md mx-auto leading-relaxed">
            Your spot is confirmed and your Founding Member perks are locked in.
          </p>
        </div>

        {/* Guaranteed Base Reward Box */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 text-left shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase font-bold tracking-wider text-[var(--accent-amber)]">
              ★ Status: Confirmed
            </span>
            <span className="text-[11px] font-[family-name:var(--font-mono)] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ✓ Unlocked
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-amber)]/15 border border-[var(--accent-amber)]/30 flex items-center justify-center text-base shrink-0">
              🎁
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
                {WAITLIST_BASE_REWARD}
              </div>
              <div className="text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)] mt-0.5">
                Will be automatically credited to your account when you sign in on launch day.
              </div>
            </div>
          </div>
        </div>

        {/* Share & Invite Section */}
        {code ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 text-left space-y-5 shadow-lg">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
                Invite friends, unlock more launch perks
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
                Share your unique link. When someone joins and confirms their email, both of your accounts level up.
              </p>
            </div>

            {/* 1-Click Copy Link Box */}
            <div className="space-y-2">
              <label className="block text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)]">
                Your Personal Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-[family-name:var(--font-mono)] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl bg-[var(--accent-amber)] hover:opacity-90 active:scale-95 text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Share on X Button */}
            <div>
              <a
                href={shareTwitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0f1419] hover:bg-[#1a2027] text-white border border-[#2f3336] text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all cursor-pointer shadow"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X (Twitter)
              </a>
            </div>

            {/* Progress / Tier Ladder */}
            <div className="pt-4 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase font-semibold text-[var(--text-dim)] tracking-wider">
                  Referral Progress
                </span>
                <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--accent-amber)]">
                  {loadingProgress ? (
                    'Checking...'
                  ) : (
                    `${friendsCount ?? 0} confirmed ${friendsCount === 1 ? 'friend' : 'friends'}`
                  )}
                </span>
              </div>

              <div className="space-y-2">
                {REFERRAL_TIERS.map((tier) => {
                  const current = friendsCount ?? 0;
                  const isUnlocked = current >= tier.friends;
                  const needed = tier.friends - current;

                  return (
                    <div
                      key={tier.friends}
                      className={`flex items-center justify-between py-2 px-3.5 rounded-xl border transition-all text-xs font-[family-name:var(--font-inter)] ${
                        isUnlocked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-[var(--bg-surface-alt)] border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {tier.friends} {tier.friends === 1 ? 'friend' : 'friends'}
                        </span>
                        <span className="text-[var(--text-dim)]">•</span>
                        <span className="font-bold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                          {tier.label}
                        </span>
                      </div>
                      <div>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
                            {needed} more to unlock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
