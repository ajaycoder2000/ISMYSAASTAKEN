'use client';
import { ICompetitor } from '@/types';

interface CompetitorRowProps {
  competitor: ICompetitor;
  index: number;
}

export default function CompetitorRow({ competitor, index }: CompetitorRowProps) {
  return (
    <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:border-[hsl(220,10%,25%)] transition-colors duration-200">
      <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)] min-w-[24px]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={competitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(40,20%,92%)] font-semibold text-sm hover:text-[hsl(42,95%,55%)] transition-colors font-[family-name:var(--font-space-grotesk)]"
          >
            {competitor.name}
            <span className="inline-block ml-1 opacity-40">↗</span>
          </a>
          <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2 py-0.5 rounded">
            {competitor.pricing}
          </span>
        </div>
        <p className="mt-1 text-sm text-[hsl(40,8%,55%)] leading-relaxed font-[family-name:var(--font-inter)]">
          {competitor.description}
        </p>
      </div>
    </div>
  );
}
