'use client';
import { ICompetitor } from '@/types';

interface CompetitorRowProps {
  competitor: ICompetitor;
  index: number;
}

export default function CompetitorRow({ competitor, index }: CompetitorRowProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:border-[var(--accent-amber)]/40 transition-colors duration-200 shadow-sm">
      <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-dim)] min-w-[24px]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={competitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-primary)] font-semibold text-sm hover:text-[var(--accent-amber)] transition-colors font-[family-name:var(--font-space-grotesk)]"
          >
            {competitor.name}
            <span className="inline-block ml-1 opacity-40">↗</span>
          </a>
          <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-2 py-0.5 rounded font-semibold border border-[var(--accent-amber)]/20">
            {competitor.pricing}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-inter)]">
          {competitor.description}
        </p>
      </div>
    </div>
  );
}
