'use client';
import { IScanDocument } from '@/types';
import CompetitorRow from './CompetitorRow';
import SignalBars from './SignalBars';
import DecryptText from './DecryptText';
import PivotAngles from './PivotAngles';
import ShareVerdictCard from './ShareVerdictCard';
import BookmarkButton from './BookmarkButton';
import LandscapeMap from './LandscapeMap';
import CommunityPoll from './CommunityPoll';
import RoastCard from './RoastCard';
import EmbeddableBadgeCard from './EmbeddableBadgeCard';

interface ScanResultProps {
  data: IScanDocument;
  showShareButton?: boolean;
}

export default function ScanResult({ data }: ScanResultProps) {
  // Map live competitors to landscape coordinates
  const landscapeCompetitors = (data.competitors || []).map((c, i) => ({
    name: c.name,
    crowdedness: Math.min(0.85, 0.35 + (i * 0.15) + (data.saturationScore === 'high' ? 0.2 : 0)),
    establishment: Math.max(0.25, 0.85 - (i * 0.12)),
    size: 12 + (i % 3) * 2,
  }));

  return (
    <div className="w-full mx-auto mt-6 sm:mt-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-left">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--accent-amber)] font-bold">
            VALIDATION REPORT
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] mt-0.5">
            Market Intelligence Verdict
          </h2>
        </div>
        <BookmarkButton scanId={data._id} />
      </div>

      {/* Section 1: Competitors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold">
            Competitors Found — {data.competitors.length}
          </h3>
          <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-dim)]">
            Live Web-Grounded
          </span>
        </div>
        <div className="space-y-2">
          {data.competitors.map((comp, i) => (
            <CompetitorRow key={i} competitor={comp} index={i} />
          ))}
        </div>
      </section>

      {/* Section 2: 2D Competitive Landscape Matrix */}
      <section>
        <LandscapeMap
          competitors={landscapeCompetitors.length > 0 ? landscapeCompetitors : undefined}
          ideaLabel="YOUR IDEA"
          ideaPosition={{
            x: data.saturationScore === 'low' ? 0.22 : data.saturationScore === 'medium' ? 0.38 : 0.58,
            y: 0.45,
          }}
        />
      </section>

      {/* Section 3: Saturation with SignalBars */}
      <section>
        <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 font-semibold">
          Market Saturation Level
        </h3>
        <div className="bg-[var(--bg-surface)] scanline-card rounded-xl p-4 sm:p-5 border border-[var(--border)] shadow-sm">
          <SignalBars score={data.saturationScore} size="md" />
          <p className="mt-3 text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-inter)]">
            {data.saturationReasoning}
          </p>
        </div>
      </section>

      {/* Section 4: Gap / Opportunity with DecryptText */}
      <section>
        <h3 className="text-[11px] sm:text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 font-semibold">
          Your Opportunity Wedge
        </h3>
        <div className="bg-[var(--bg-surface)] scanline-card rounded-xl p-4 sm:p-5 border-l-2 border-[var(--accent-amber)] border-r border-t border-b border-[var(--border)] shadow-sm">
          <DecryptText
            text={data.gapAnalysis}
            durationMs={900}
            className="text-[var(--text-primary)] text-xs sm:text-sm sm:leading-relaxed font-[family-name:var(--font-inter)] leading-relaxed font-mono-subtle"
          />
        </div>
      </section>

      {/* Section 5: Idea Roast Mode (Opt-In Comedy Critique) */}
      <section>
        <RoastCard
          ideaText={data.ideaText}
          competitors={data.competitors}
          saturationScore={data.saturationScore}
          gapAnalysis={data.gapAnalysis}
          scanId={data._id}
          shareSlug={data.shareSlug}
          initialRoast={data.roast}
        />
      </section>

      {/* Section 6: Interactive Strategic Pivot Wedges */}
      <section>
        <PivotAngles
          ideaText={data.ideaText}
          saturationScore={data.saturationScore}
          competitors={data.competitors}
        />
      </section>

      {/* Section 6: Community Validation Poll */}
      <section className="pt-2">
        <CommunityPoll scanId={data._id} />
      </section>

      {/* Section 7: Validated Embeddable Trust Badge */}
      <section className="pt-2">
        <EmbeddableBadgeCard scan={data} />
      </section>

      {/* Section 8: Share / Export Executive Card */}
      <section className="pt-2">
        <ShareVerdictCard
          ideaText={data.ideaText}
          saturationScore={data.saturationScore}
          competitorsCount={data.competitors.length}
          gapAnalysis={data.gapAnalysis}
          shareSlug={data.shareSlug}
        />
      </section>
    </div>
  );
}
