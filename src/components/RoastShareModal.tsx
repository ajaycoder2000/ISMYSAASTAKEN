'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export interface RoastShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaText: string;
  roastLines: string[];
  takeaway: string;
  scanId: string;
}

export default function RoastShareModal({
  isOpen,
  onClose,
  ideaText,
  roastLines,
  takeaway,
  scanId,
}: RoastShareModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [customText, setCustomText] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedImageUrl, setCopiedImageUrl] = useState<boolean>(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  // Sync custom text when selected line changes
  useEffect(() => {
    if (roastLines && roastLines.length > 0) {
      const line = roastLines[selectedIndex] || roastLines[0];
      setCustomText(line);
      setIsCustomizing(false);
    }
  }, [selectedIndex, roastLines]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeLine = isCustomizing
    ? customText
    : roastLines[selectedIndex] || roastLines[0] || '';

  const cleanTakeaway = takeaway.replace(/^The actual takeaway:\s*/i, '');

  const getScanUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/scan/${scanId}`;
    }
    return `https://ismysaastaken.com/scan/${scanId}`;
  };

  const getImageUrl = () => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://ismysaastaken.com';
    return `${base}/api/roast-image/${scanId}?line=${encodeURIComponent(activeLine)}`;
  };

  // Download high-res PNG
  const handleDownloadPng = async () => {
    if (!previewCardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(previewCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `idea-roast-${scanId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export roast image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Post to X/Twitter
  const handleShareTwitter = () => {
    const tweet = `Got my SaaS idea roasted by @ismysaastaken 🔥\n\n"${activeLine}"\n\nRead the full report & takeaway:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(getScanUrl())}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getScanUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(getImageUrl());
    setCopiedImageUrl(true);
    setTimeout(() => setCopiedImageUrl(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[hsl(220,15%,9%)] border border-[hsl(24,95%,50%,0.25)] rounded-2xl shadow-2xl p-5 sm:p-7 z-10 overflow-y-auto max-h-[92vh] space-y-6 text-left">
        {/* Warm radial glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(220,10%,16%)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔥</span>
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-orange-400 bg-orange-950/60 px-2.5 py-0.5 rounded border border-orange-800/60">
                SHARE PREVIEW
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
              Pick Your Featured Burn
            </h2>
            <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
              Choose or tweak which punchline to feature on your card before downloading or sharing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,95%)] bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,20%)] w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* 1. Line Selector */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,55%)] font-semibold flex items-center justify-between">
            <span>Select Punchline</span>
            <span className="text-[10px] text-orange-400/80">
              {selectedIndex + 1} of {roastLines.length}
            </span>
          </label>

          <div className="grid grid-cols-1 gap-2">
            {roastLines.map((line, idx) => {
              const isSelected = selectedIndex === idx && !isCustomizing;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setCustomText(line);
                    setIsCustomizing(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-[family-name:var(--font-inter)] transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-orange-950/40 border-orange-500/60 text-orange-100 shadow-sm'
                      : 'bg-[hsl(220,14%,11%)] border-[hsl(220,10%,18%)] text-[hsl(40,15%,80%)] hover:border-orange-500/30 hover:bg-[hsl(220,14%,13%)]'
                  }`}
                >
                  <span
                    className={`shrink-0 w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center text-[9px] font-bold ${
                      isSelected
                        ? 'border-orange-400 bg-orange-500 text-white'
                        : 'border-[hsl(220,10%,30%)] text-[hsl(40,8%,50%)]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="leading-snug flex-1">{line}</span>
                </button>
              );
            })}
          </div>

          {/* Edit/Customize toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-[11px] font-[family-name:var(--font-mono)] text-orange-400/90 hover:text-orange-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isCustomizing ? '▾ Close editor' : '▸ Tweak this punchline text'}</span>
            </button>

            {isCustomizing && (
              <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Customize your roast burn..."
                  className="w-full bg-[hsl(220,15%,7%)] border border-orange-500/40 rounded-lg p-2.5 text-xs text-orange-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-[family-name:var(--font-inter)] leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Live Card Preview */}
        <div className="space-y-2">
          <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,55%)] font-semibold">
            Card Preview (What will be exported)
          </label>

          <div
            ref={previewCardRef}
            className="w-full bg-[#09090b] border border-orange-500/30 rounded-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-left space-y-4"
          >
            {/* Background flame glow */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{
                background:
                  'radial-gradient(circle, #f97316 0%, #ef4444 60%, transparent 100%)',
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Image src="/icon.png" alt="Logo" width={18} height={18} className="rounded" />
                <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-zinc-100 text-xs tracking-tight">
                  ismysaas<span className="text-orange-500">taken</span>
                  <span className="text-emerald-500">?</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-500/30 text-[9px] font-bold font-mono uppercase tracking-wider text-orange-300">
                <span>🔥</span>
                <span>IDEA ROAST VERDICT</span>
              </div>
            </div>

            {/* Target Concept */}
            <div className="space-y-1 relative z-10">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
                Target Concept
              </span>
              <p className="text-xs text-zinc-400 italic line-clamp-2">
                &ldquo;{ideaText}&rdquo;
              </p>
            </div>

            {/* Featured Burn */}
            <div className="relative z-10 bg-zinc-900/80 border border-orange-500/25 rounded-lg p-3.5 sm:p-4">
              <p className="text-sm sm:text-base font-bold text-orange-100 font-[family-name:var(--font-space-grotesk)] leading-snug tracking-tight">
                &ldquo;{activeLine}&rdquo;
              </p>
            </div>

            {/* Takeaway */}
            <div className="relative z-10 flex items-start gap-2 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs">
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                Takeaway
              </span>
              <span className="text-zinc-300 font-[family-name:var(--font-inter)] leading-relaxed">
                {cleanTakeaway}
              </span>
            </div>

            {/* Footer URL note */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
              <span>ismysaastaken.com</span>
              <span>Roasts the market, not the founder</span>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[hsl(220,10%,16%)]">
          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs font-[family-name:var(--font-mono)] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-orange-950/40"
          >
            {downloading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>↓</span>
                <span>Download PNG</span>
              </>
            )}
          </button>

          {/* Post to X */}
          <button
            type="button"
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,22%)] text-[hsl(40,20%,94%)] font-semibold text-xs font-[family-name:var(--font-mono)] transition-colors cursor-pointer"
          >
            <span>𝕏</span>
            <span>Post to X</span>
          </button>

          {/* Copy Image URL */}
          <button
            type="button"
            onClick={handleCopyImageUrl}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,22%)] text-[hsl(40,20%,94%)] font-semibold text-xs font-[family-name:var(--font-mono)] transition-colors cursor-pointer"
          >
            <span>🖼</span>
            <span>{copiedImageUrl ? 'URL Copied!' : 'Image Link'}</span>
          </button>

          {/* Copy Page Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,22%)] text-[hsl(40,20%,94%)] font-semibold text-xs font-[family-name:var(--font-mono)] transition-colors cursor-pointer"
          >
            <span>🔗</span>
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
