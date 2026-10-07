'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WAITLIST_BASE_REWARD, REFERRAL_TIERS } from '@/lib/waitlistRewards';

const BUILDING_TYPES = ['SaaS', 'Mobile app', 'AI tool', 'Not sure yet'] as const;

export default function WaitlistClientView() {
  const [email, setEmail] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Optional building_type
  const [buildingType, setBuildingType] = useState<string | null>(null);
  const [buildingSaved, setBuildingSaved] = useState(false);

  // Stored URL params
  const [refParam, setRefParam] = useState<string | null>(null);
  const [utmParams, setUtmParams] = useState<{
    utm_source?: string;
    utm_campaign?: string;
    utm_content?: string;
  }>({});

  // 1. Read ref and UTMs from URL on mount & manage localStorage (30-day attribution)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref')?.trim();
      const utmSource = params.get('utm_source')?.trim();
      const utmCampaign = params.get('utm_campaign')?.trim();
      const utmContent = params.get('utm_content')?.trim();

      const utms: { utm_source?: string; utm_campaign?: string; utm_content?: string } = {};
      if (utmSource) utms.utm_source = utmSource;
      if (utmCampaign) utms.utm_campaign = utmCampaign;
      if (utmContent) utms.utm_content = utmContent;
      setUtmParams(utms);

      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

      if (urlRef) {
        setRefParam(urlRef);
        localStorage.setItem(
          'waitlist:ref',
          JSON.stringify({ code: urlRef, expiresAt: Date.now() + THIRTY_DAYS_MS })
        );
      } else {
        const stored = localStorage.getItem('waitlist:ref');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.code && parsed?.expiresAt > Date.now()) {
            setRefParam(parsed.code);
          } else {
            localStorage.removeItem('waitlist:ref');
          }
        }
      }
    } catch {
      // Storage unavailable or blocked
    }
  }, []);

  // Cooldown ticker
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ref: refParam,
          website: websiteHoneypot,
          ...utmParams,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok && res.status === 429) {
        setErrorMessage(data?.error || 'Too many tries, please wait a bit.');
        setLoading(false);
        return;
      }

      if (data?.ok) {
        setJoined(true);
        if (data.referralCode) {
          setReferralCode(data.referralCode);
        }
        setCooldown(60); // 60s cooldown for resend button
      } else {
        setErrorMessage(data?.error || 'Unable to join at this moment. Please try again.');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(60);
    try {
      await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ref: refParam,
          ...utmParams,
        }),
      });
    } catch {
      // Silently fail
    }
  };

  const handleSelectBuildingType = async (type: string) => {
    setBuildingType(type);
    setBuildingSaved(true);

    if (referralCode || email) {
      try {
        await fetch('/api/waitlist/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referralCode: referralCode || email,
            buildingType: type,
          }),
        });
      } catch {
        // Silently fail
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 sm:py-20">
      {/* Brand Badge */}
      <div className="flex items-center justify-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-[family-name:var(--font-mono)] font-bold uppercase tracking-wider bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-pulse" />
          Pre-Launch Waitlist
        </span>
      </div>

      {!joined ? (
        /* BEFORE JOINING */
        <div className="space-y-8 text-center">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              Be first in when we launch.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-md mx-auto leading-relaxed">
              Verify if your SaaS idea is taken, surface live competitors, and spot defensible product wedges before writing code.
            </p>
          </div>

          {/* Perks & Rewards Ladder Preview */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 text-left shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase font-bold tracking-wider text-[var(--accent-amber)]">
                ★ Founding Member Reward
              </span>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
                Guaranteed
              </span>
            </div>

            <div className="flex items-start gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-amber)]/15 border border-[var(--accent-amber)]/30 flex items-center justify-center text-sm shrink-0">
                🎁
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
                  {WAITLIST_BASE_REWARD}
                </div>
                <div className="text-xs text-[var(--text-dim)] font-[family-name:var(--font-inter)] mt-0.5">
                  Locked for everyone who confirms their spot before launch day.
                </div>
              </div>
            </div>

            {/* Referral Perks Ladder */}
            <div className="pt-3 border-t border-[var(--border)]">
              <span className="block text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-2.5">
                Invite friends to unlock extra launch perks:
              </span>
              <div className="space-y-2">
                {REFERRAL_TIERS.map((tier) => (
                  <div
                    key={tier.friends}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border)] text-xs font-[family-name:var(--font-inter)]"
                  >
                    <span className="text-[var(--text-secondary)] font-medium">
                      Invite {tier.friends} {tier.friends === 1 ? 'friend' : 'friends'}
                    </span>
                    <span className="font-bold text-[var(--accent-amber)] font-[family-name:var(--font-mono)]">
                      {tier.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Honeypot field for bot deterrence */}
            <div className="sr-only" aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="waitlist-website">Leave this field blank</label>
              <input
                id="waitlist-website"
                type="text"
                name="website"
                value={websiteHoneypot}
                onChange={(e) => setWebsiteHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourdomain.com"
                aria-label="Email address"
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--accent-amber)] focus:ring-1 focus:ring-[var(--accent-amber)] text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-all font-[family-name:var(--font-inter)] shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[var(--accent-amber)] hover:opacity-90 active:scale-[0.98] text-[hsl(220,15%,8%)] font-bold text-sm font-[family-name:var(--font-space-grotesk)] transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join the waitlist →'}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium font-[family-name:var(--font-inter)]">
                {errorMessage}
              </p>
            )}

            <p className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] leading-relaxed">
              We&apos;ll email you about launch and product updates. Unsubscribe anytime.
            </p>
          </form>
        </div>
      ) : (
        /* AFTER JOINING (Same Page, No Navigation) */
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto text-emerald-400">
            ✉️
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              Check your inbox to confirm your spot.
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-md mx-auto leading-relaxed">
              We sent a verification link to <strong className="text-[var(--text-primary)]">{email}</strong>.
              Click the link inside to confirm your double opt-in and lock in your Founding Member perks.
            </p>
          </div>

          {/* Resend Cooldown */}
          <div className="pt-1">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:hover:text-[var(--text-dim)] transition-colors underline font-[family-name:var(--font-inter)] cursor-pointer"
            >
              {cooldown > 0 ? `Resend confirmation email (${cooldown}s)` : "Didn't receive the email? Resend"}
            </button>
          </div>

          {/* Optional Question */}
          <div className="pt-6 border-t border-[var(--border)] space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Quick question while you wait: What are you building?
              </span>
              {buildingSaved && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BUILDING_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectBuildingType(type)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium font-[family-name:var(--font-inter)] border transition-all text-left cursor-pointer ${
                    buildingType === type
                      ? 'bg-[var(--accent-amber)]/15 border-[var(--accent-amber)] text-[var(--accent-amber)] font-bold'
                      : 'bg-[var(--bg-surface-alt)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
