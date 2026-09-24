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
import RevealItem from './scan/RevealItem';

interface ScanResultProps {
  data: IScanDocument;
  showShareButton?: boolean;
  skip?: boolean;
}

export default function ScanResult({ data, skip = true }: ScanResultProps) {
  // Map live competitors to landscape coordinates
  const landscapeCompetitors = (data.competitors || []).map((c, i) => ({
    name: c.name,
    crowdedness: Math.min(0.85, 0.35 + (i * 0.15) + (data.saturationScore === 'high' ? 0.2 : 0)),
    establishment: Math.max(0.25, 0.85 - (i * 0.12)),
    size: 12 + (i % 3) * 2,
  }));

  return (
    <div className="w-full mx-auto space-y-6 sm:space-y-8 text-left">
      {/* Top Header Actions */}
      <RevealItem index={0} skip={skip}>
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
      </RevealItem>

      {/* Section 1: Competitors */}
      <RevealItem index={1} skip={skip}>
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
      </RevealItem>

      {/* Section 2: 2D Competitive Landscape Matrix */}
      <RevealItem index={2} skip={skip}>
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
      </RevealItem>

      {/* Section 3 & 4: Saturation & Opportunity Wedge */}
      <RevealItem index={3} skip={skip}>
        <div className="space-y-6">
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
        </div>
      </RevealItem>

      {/* Section 5 & 6: Idea Roast Mode & Strategic Pivot Wedges */}
      <RevealItem index={4} skip={skip}>
        <div className="space-y-6">
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

          <section>
            <PivotAngles
              ideaText={data.ideaText}
              saturationScore={data.saturationScore}
              competitors={data.competitors}
            />
          </section>
        </div>
      </RevealItem>

      {/* Section 7, 8, 9: Community Validation Poll, Trust Badge, Share Card */}
      <RevealItem index={5} skip={skip}>
        <div className="space-y-6 pt-2">
          <section>
            <CommunityPoll scanId={data._id} />
          </section>

          <section>
            <EmbeddableBadgeCard scan={data} />
          </section>

          <section>
            <ShareVerdictCard
              ideaText={data.ideaText}
              saturationScore={data.saturationScore}
              competitorsCount={data.competitors.length}
              gapAnalysis={data.gapAnalysis}
              shareSlug={data.shareSlug}
            />
          </section>
        </div>
      </RevealItem>
    </div>
  );
}
