'use client';
import { useState, useEffect } from 'react';
import { IScanDocument } from '@/types';
import ButtonAI from './ButtonAI';

interface ScanFormProps {
  onScanStart?: () => void;
  onScanSuccess?: (data: IScanDocument) => void;
  onResult?: (data: IScanDocument) => void;
  onError: (message: string) => void;
  onRateLimited: (message: string) => void;
  onPaywall?: (mode: 'PAYWALL' | 'SIGN_IN_REQUIRED') => void;
  disabled?: boolean;
}

export default function ScanForm({
  onScanStart,
  onScanSuccess,
  onResult,
  onError,
  onRateLimited,
  onPaywall,
  disabled,
}: ScanFormProps) {
  const [ideaText, setIdeaText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prefilledIdea = params.get('idea');
      if (prefilledIdea) {
        setIdeaText(prefilledIdea);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim() || loading || disabled) return;

    setLoading(true);
    onScanStart?.();

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaText: ideaText.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.paywall === 'SIGN_IN_REQUIRED' || res.status === 401) {
          if (onPaywall) {
            onPaywall('SIGN_IN_REQUIRED');
            return;
          }
        }
        if (data.paywall === 'PAYWALL' || res.status === 402) {
          if (onPaywall) {
            onPaywall('PAYWALL');
            return;
          }
        }
        if (res.status === 429) {
          onRateLimited(data.error || 'Rate limit reached.');
          return;
        }
        onError(data.error || 'Something went wrong.');
        return;
      }

      if (onScanSuccess) {
        onScanSuccess(data.data);
      } else if (onResult) {
        onResult(data.data);
      }
    } catch {
      onError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="scan-form" onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="relative">
        <textarea
          id="scan-input"
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value.slice(0, 500))}
          placeholder="Describe your SaaS idea in plain English (e.g. AI tool that turns Figma designs into clean React & Tailwind components with live AST parsing)..."
          disabled={loading || disabled}
          rows={4}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-[var(--text-primary)] text-body font-[family-name:var(--font-inter)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-amber)] focus:shadow-[0_0_0_1px_var(--accent-amber)] transition-all duration-200 resize-none disabled:opacity-50 shadow-sm"
        />
        <span className="absolute bottom-3 right-4 text-xs font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
          {ideaText.length}/500
        </span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-meta text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Live Web Search Grounded • 100% Private</span>
        </div>

        <ButtonAI
          type="submit"
          disabled={!ideaText.trim() || loading || disabled}
          loading={loading || disabled}
          idleText="Scan this idea →"
          thinkingText="Scanning market..."
          className="w-full sm:w-auto font-[family-name:var(--font-space-grotesk)]"
        />
      </div>

      {/* Trust & Privacy Guarantee Banner */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-meta text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
        <div className="flex items-center gap-1.5">
          <span>🔒</span>
          <span><strong>100% Confidential:</strong> Ideas are analyzed live in real-time and never used for public AI training.</span>
        </div>
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-meta text-[var(--text-dim)]">
          <span>✓ 1 Free Lifetime Scan</span>
          <span>•</span>
          <span>✓ Zero Credit Card Needed</span>
        </div>
      </div>
    </form>
  );
}
