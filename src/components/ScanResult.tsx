'use client';
import { useState } from 'react';
import { IScanDocument } from '@/types';
import CompetitorRow from './CompetitorRow';
import SignalBars from './SignalBars';
import DecryptText from './DecryptText';
import SponsorSlot from './SponsorSlot';

interface ScanResultProps {
  data: IScanDocument;
  showShareButton?: boolean;
}

export default function ScanResult({ data, showShareButton = true }: ScanResultProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/scan/${data.shareSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full mx-auto mt-6 sm:mt-8 space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Section: Competitors */}
      <section>
        <h2 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-3 font-semibold">
          Competitors Found — {data.competitors.length}
        </h2>
        <div className="space-y-2">
          {data.competitors.map((comp, i) => (
            <CompetitorRow key={i} competitor={comp} index={i} />
          ))}
        </div>
      </section>

      {/* Section: Saturation with SignalBars */}
      <section>
        <h2 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-3 font-semibold">
          Market Saturation
        </h2>
        <div className="bg-[hsl(220,12%,12%)] scanline-card rounded-lg p-4 sm:p-5 border border-[hsl(220,10%,18%)]">
          <SignalBars score={data.saturationScore} size="md" />
          <p className="mt-3 text-[hsl(40,20%,85%)] text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-inter)]">
            {data.saturationReasoning}
          </p>
        </div>
      </section>

      {/* Section: Gap / Opportunity with DecryptText */}
      <section>
        <h2 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-3 font-semibold">
          Your Opportunity
        </h2>
        <div className="bg-[hsl(220,12%,12%)] scanline-card rounded-lg p-4 sm:p-5 border-l-2 border-[hsl(42,95%,55%)] border-r border-t border-b border-r-[hsl(220,10%,18%)] border-t-[hsl(220,10%,18%)] border-b-[hsl(220,10%,18%)]">
          <DecryptText
            text={data.gapAnalysis}
            durationMs={900}
            className="text-[hsl(40,20%,92%)] text-xs sm:text-sm sm:leading-relaxed font-[family-name:var(--font-inter)] leading-relaxed font-mono-subtle"
          />
        </div>
      </section>

      {/* Sponsor placement */}
      <section className="pt-1">
        <SponsorSlot />
      </section>

      {/* Share button */}
      {showShareButton && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)] hover:text-[hsl(42,95%,55%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(42,95%,55%,0.4)] rounded-md transition-all duration-200"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-[hsl(42,95%,55%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share this scan
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
