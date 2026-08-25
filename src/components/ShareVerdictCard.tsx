'use client';

import { useState, useRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import SignalBars from './SignalBars';

interface ShareVerdictCardProps {
  ideaText: string;
  saturationScore: 'low' | 'medium' | 'high';
  competitorsCount: number;
  gapAnalysis: string;
  shareSlug: string;
}

export default function ShareVerdictCard({
  ideaText,
  saturationScore,
  competitorsCount,
  gapAnalysis,
  shareSlug,
}: ShareVerdictCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/scan/${shareSlug}`;
    }
    return `https://ismysaastaken.vercel.app/scan/${shareSlug}`;
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `saas-verdict-${shareSlug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyBadge = () => {
    const color = saturationScore === 'low' ? 'brightgreen' : saturationScore === 'medium' ? 'yellow' : 'red';
    const badgeMarkdown = `[![Market Saturation: ${saturationScore.toUpperCase()}](https://img.shields.io/badge/SaaS_Saturation-${saturationScore.toUpperCase()}-${color}?style=for-the-badge)](${getShareUrl()})`;
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const handleShareTwitter = () => {
    const tweet = `I just validated my SaaS idea on @ismysaastaken:\n\n"${ideaText.slice(0, 100)}..."\n\n🎯 Verdict: ${saturationScore.toUpperCase()} SATURATION (${competitorsCount} competitors found)\n\nCheck full gap analysis:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Visual Pitch Deck Card (Exportable Canvas) */}
      <div
        ref={cardRef}
        className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #f5a623 1px, transparent 1px), linear-gradient(to bottom, #f5a623 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Brand header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[hsl(220,10%,16%)] relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
            <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-[hsl(40,20%,92%)] text-sm tracking-tight">
              ismysaas<span className="text-[hsl(42,95%,55%)]">taken</span>?
            </span>
          </div>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] uppercase tracking-widest">
            Executive Summary
          </span>
        </div>

        {/* Idea prompt */}
        <div className="mb-5 relative z-10">
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[hsl(40,8%,45%)] block mb-1">
            TARGET CONCEPT
          </span>
          <p className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] leading-snug">
            &ldquo;{ideaText}&rdquo;
          </p>
        </div>

        {/* Verdict stats row */}
        <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl relative z-10">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] uppercase tracking-wider block mb-1">
              Market Saturation
            </span>
            <div className="flex items-center gap-2">
              <SignalBars score={saturationScore} size="md" />
              <span className={`text-xs font-bold font-[family-name:var(--font-mono)] uppercase ${
                saturationScore === 'low' ? 'text-[hsl(145,60%,55%)]' : saturationScore === 'medium' ? 'text-[hsl(42,95%,55%)]' : 'text-[hsl(0,72%,55%)]'
              }`}>
                {saturationScore}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] uppercase tracking-wider block mb-1">
              Competitors Found
            </span>
            <p className="text-sm font-bold font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)]">
              {competitorsCount} tracked live
            </p>
          </div>
        </div>

        {/* Opportunity Wedge */}
        <div className="relative z-10">
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] uppercase tracking-widest font-semibold block mb-1">
            🎯 Strategic Moat Angle
          </span>
          <p className="text-xs sm:text-sm text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)] leading-relaxed line-clamp-3">
            {gapAnalysis}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3 border-t border-[hsl(220,10%,14%)] flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)] relative z-10">
          <span>Verified via Web-Grounded AI</span>
          <span>ismysaastaken.vercel.app</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={handleDownloadPng}
          disabled={downloading}
          className="px-4 py-2 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,24%)] hover:border-[hsl(42,95%,55%,0.4)] text-[hsl(40,20%,90%)] hover:text-[hsl(42,95%,55%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {downloading ? 'Rendering PNG...' : '🖼️ Export Pitch Card'}
        </button>

        <button
          onClick={handleShareTwitter}
          className="px-4 py-2 bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 border border-[#1d9bf0]/30 hover:border-[#1d9bf0] text-[#1d9bf0] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          🐦 Post to X / Twitter
        </button>

        <button
          onClick={handleCopyBadge}
          className="px-3.5 py-2 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,24%)] text-[hsl(40,8%,70%)] hover:text-[hsl(40,20%,92%)] text-xs font-[family-name:var(--font-mono)] rounded-lg transition-all cursor-pointer"
        >
          {copiedBadge ? '✓ Badge Copied' : '🔖 GitHub Badge'}
        </button>

        <button
          onClick={handleCopyLink}
          className="px-3.5 py-2 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,24%)] text-[hsl(40,8%,70%)] hover:text-[hsl(40,20%,92%)] text-xs font-[family-name:var(--font-mono)] rounded-lg transition-all cursor-pointer"
        >
          {copiedLink ? '✓ Link Copied' : '🔗 Copy URL'}
        </button>
      </div>
    </div>
  );
}
