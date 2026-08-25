'use client';
import { useState } from 'react';
import { IScanDocument } from '@/types';
import CompetitorRow from './CompetitorRow';
import SignalBars from './SignalBars';
import DecryptText from './DecryptText';
import SponsorSlot from './SponsorSlot';
import PivotAngles from './PivotAngles';
import ShareVerdictCard from './ShareVerdictCard';
import BookmarkButton from './BookmarkButton';

interface ScanResultProps {
  data: IScanDocument;
  showShareButton?: boolean;
}

export default function ScanResult({ data }: ScanResultProps) {
  return (
    <div className="w-full mx-auto mt-6 sm:mt-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-[hsl(220,10%,16%)]">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] font-bold">
            VALIDATION REPORT
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] mt-0.5">
            Market Intelligence Verdict
          </h2>
        </div>
        <BookmarkButton scanId={data._id} />
      </div>

      {/* Section 1: Competitors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] font-semibold">
            Competitors Found — {data.competitors.length}
          </h3>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
            Live Web-Grounded
          </span>
        </div>
        <div className="space-y-2">
          {data.competitors.map((comp, i) => (
            <CompetitorRow key={i} competitor={comp} index={i} />
          ))}
        </div>
      </section>

      {/* Section 2: Saturation with SignalBars */}
      <section>
        <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-3 font-semibold">
          Market Saturation Level
        </h3>
        <div className="bg-[hsl(220,12%,12%)] scanline-card rounded-xl p-4 sm:p-5 border border-[hsl(220,10%,18%)]">
          <SignalBars score={data.saturationScore} size="md" />
          <p className="mt-3 text-[hsl(40,20%,85%)] text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-inter)]">
            {data.saturationReasoning}
          </p>
        </div>
      </section>

      {/* Section 3: Gap / Opportunity with DecryptText */}
      <section>
        <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] mb-3 font-semibold">
          Your Opportunity Wedge
        </h3>
        <div className="bg-[hsl(220,12%,12%)] scanline-card rounded-xl p-4 sm:p-5 border-l-2 border-[hsl(42,95%,55%)] border-r border-t border-b border-r-[hsl(220,10%,18%)] border-t-[hsl(220,10%,18%)] border-b-[hsl(220,10%,18%)]">
          <DecryptText
            text={data.gapAnalysis}
            durationMs={900}
            className="text-[hsl(40,20%,92%)] text-xs sm:text-sm sm:leading-relaxed font-[family-name:var(--font-inter)] leading-relaxed font-mono-subtle"
          />
        </div>
      </section>

      {/* Section 4: Interactive Strategic Pivot Wedges */}
      <section>
        <PivotAngles
          ideaText={data.ideaText}
          saturationScore={data.saturationScore}
          competitors={data.competitors}
        />
      </section>

      {/* Section 5: Share / Export Executive Card */}
      <section className="pt-2">
        <ShareVerdictCard
          ideaText={data.ideaText}
          saturationScore={data.saturationScore}
          competitorsCount={data.competitors.length}
          gapAnalysis={data.gapAnalysis}
          shareSlug={data.shareSlug}
        />
      </section>

      {/* Sponsor placement */}
      <section className="pt-2">
        <SponsorSlot />
      </section>
    </div>
  );
}
