'use client';
import { useState, useEffect } from 'react';
import { IScanDocument } from '@/types';
import ScanningIndicator from './ScanningIndicator';

interface ScanFormProps {
  onScanStart?: () => void;
  onScanSuccess?: (data: IScanDocument) => void;
  onResult?: (data: IScanDocument) => void;
  onError: (message: string) => void;
  onRateLimited: (message: string) => void;
  disabled?: boolean;
}

export default function ScanForm({
  onScanStart,
  onScanSuccess,
  onResult,
  onError,
  onRateLimited,
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

      if (res.status === 429) {
        onRateLimited(data.error || 'Rate limit reached.');
        return;
      }

      if (!res.ok || !data.success) {
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
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="relative">
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value.slice(0, 500))}
          placeholder="Describe your SaaS idea in plain English (e.g. AI tool that turns Figma designs into clean React & Tailwind components with live AST parsing)..."
          disabled={loading || disabled}
          rows={4}
          className="w-full bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,20%)] rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-[hsl(40,20%,92%)] text-sm sm:text-base font-[family-name:var(--font-inter)] placeholder:text-[hsl(40,8%,35%)] focus:outline-none focus:border-[hsl(42,95%,55%)] focus:shadow-[0_0_0_1px_hsl(42,95%,55%,0.3)] transition-all duration-200 resize-none disabled:opacity-50"
        />
        <span className="absolute bottom-3 right-4 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)]">
          {ideaText.length}/500
        </span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,60%,55%)]" />
          <span>Live Web Search Grounded • 100% Private</span>
        </div>

        <button
          type="submit"
          disabled={!ideaText.trim() || loading || disabled}
          className="w-full sm:w-auto px-7 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[rgba(245,166,35,0.15)] cursor-pointer"
        >
          {loading || disabled ? (
            <>
              <ScanningIndicator size="sm" />
              <span>Scanning live market...</span>
            </>
          ) : (
            'Scan this idea →'
          )}
        </button>
      </div>

      {/* Trust & Privacy Guarantee Banner */}
      <div className="mt-3 pt-2.5 border-t border-[hsl(220,10%,14%)] flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
        <div className="flex items-center gap-1.5">
          <span>🔒</span>
          <span><strong>100% Confidential:</strong> Ideas are analyzed live in real-time and never used for public AI training.</span>
        </div>
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
          <span>✓ 3 Free Monthly Scans</span>
          <span>•</span>
          <span>✓ Zero Credit Card Needed</span>
        </div>
      </div>
    </form>
  );
}
