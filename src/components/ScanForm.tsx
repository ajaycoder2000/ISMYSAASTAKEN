'use client';
import { useState } from 'react';
import { IScanDocument } from '@/types';
import ScanningIndicator from './ScanningIndicator';

interface ScanFormProps {
  onResult: (data: IScanDocument) => void;
  onError: (message: string) => void;
  onRateLimited: (message: string) => void;
  disabled?: boolean;
}

export default function ScanForm({ onResult, onError, onRateLimited, disabled }: ScanFormProps) {
  const [ideaText, setIdeaText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim() || loading || disabled) return;
    
    setLoading(true);
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
      
      onResult(data.data);
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
          placeholder="Describe your SaaS idea in plain English..."
          disabled={loading || disabled}
          rows={4}
          className="w-full bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,20%)] rounded-xl px-5 py-4 text-[hsl(40,20%,92%)] text-base sm:text-lg font-[family-name:var(--font-inter)] placeholder:text-[hsl(40,8%,35%)] focus:outline-none focus:border-[hsl(42,95%,55%)] focus:shadow-[0_0_0_1px_hsl(42,95%,55%,0.3)] transition-all duration-200 resize-none disabled:opacity-50"
        />
        <span className="absolute bottom-3 right-4 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)]">
          {ideaText.length}/500
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <p className="text-xs text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)] hidden sm:block">
          Press ↵ to scan • 100% private
        </p>
        <button
          type="submit"
          disabled={!ideaText.trim() || loading || disabled}
          className="w-full sm:w-auto px-7 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[rgba(245,166,35,0.15)] cursor-pointer"
        >
          {loading ? (
            <>
              <ScanningIndicator size="sm" />
              <span>Scanning competitors...</span>
            </>
          ) : (
            'Scan this idea →'
          )}
        </button>
      </div>
    </form>
  );
}
