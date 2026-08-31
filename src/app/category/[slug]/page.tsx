import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SignalBars from '@/components/SignalBars';
import { REAL_SEEDED_SCANS, SeedScanData } from '@/lib/seeds/real-scans';

interface CategoryInfo {
  name: string;
  headline: string;
  description: string;
  metaTitle: string;
  metaDesc: string;
  badge: string;
}

const CATEGORIES: Record<string, CategoryInfo> = {
  'ai-agents': {
    name: 'AI Agents & Automation',
    headline: 'AI Agents & Automation SaaS Market Saturation',
    description: 'Explore live competitor intelligence and moat opportunities for autonomous AI agents, LLM evaluators, and generative workflow automation.',
    metaTitle: 'AI Agents & Automation SaaS Ideas — Market Validation Index',
    metaDesc: 'Discover which AI Agent and Automation startup concepts are oversaturated and where open space market gaps exist. Live validation reports.',
    badge: '🤖 AI & Agents',
  },
  'dev-tools': {
    name: 'Developer Tools & APIs',
    headline: 'Developer Tools & Infrastructure Market Saturation',
    description: 'Real-time competitive breakdown for developer platforms, API bridges, AST converters, and serverless APM observability.',
    metaTitle: 'DevTools & API Startup Ideas — Market Saturation Index',
    metaDesc: 'Explore devtool startup ideas, competitor lists, and untapped engineering software wedges tested by founders.',
    badge: '🛠️ DevTools',
  },
  'micro-saas': {
    name: 'Micro-SaaS & Indie Apps',
    headline: 'Micro-SaaS & Solopreneur Market Saturation',
    description: 'Lightweight software concepts built for solo founders, Telegram bots, niche browser extensions, and single-utility tools.',
    metaTitle: 'Micro-SaaS & Solopreneur Ideas — Market Validation Index',
    metaDesc: 'Validate your micro-SaaS and solopreneur software concepts before spending months coding. Real competitor benchmarks.',
    badge: '⚡ Micro-SaaS',
  },
  'b2b-saas': {
    name: 'B2B & Enterprise Workflows',
    headline: 'B2B SaaS & Workflow Automation Market Saturation',
    description: 'Competitive teardowns for SOC2 automation, invoice factoring, customer QA rubrics, and high-ACV enterprise software.',
    metaTitle: 'B2B Workflow & Enterprise SaaS Ideas — Market Index',
    metaDesc: 'Teardowns of B2B SaaS ideas, competitor pricing tiers, and underserved enterprise software gaps.',
    badge: '📈 B2B SaaS',
  },
  'creator-economy': {
    name: 'Creator Economy & Media',
    headline: 'Creator Economy & Media SaaS Market Saturation',
    description: 'Market dynamics for voice note apps, automated PRD summaries, podcast editors, and social proof widgets.',
    metaTitle: 'Creator Economy SaaS Ideas — Market Saturation Reports',
    metaDesc: 'Analyze creator economy software tools, competitor saturation, and whitespace opportunities for founders.',
    badge: '🎨 Creator Economy',
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: cat.metaTitle,
    description: cat.metaDesc,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDesc,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: cat.metaTitle,
      description: cat.metaDesc,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORIES[slug];

  if (!category) {
    notFound();
  }

  const categoryScans = REAL_SEEDED_SCANS.filter((s) => s.category === slug);
  const lowSaturationCount = categoryScans.filter((s) => s.saturationScore === 'low').length;
  const avgCompetitors = categoryScans.length > 0
    ? Math.round(categoryScans.reduce((acc, curr) => acc + curr.competitors.length, 0) / categoryScans.length)
    : 0;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ismysaastaken.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: 'https://ismysaastaken.vercel.app/#categories',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://ismysaastaken.vercel.app/category/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-8 sm:py-14 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] mb-6">
        <Link href="/" className="hover:text-[hsl(42,95%,55%)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[hsl(40,8%,65%)]">Categories</span>
        <span>/</span>
        <span className="text-[hsl(42,95%,55%)]">{category.name}</span>
      </div>

      {/* Category Header Hero */}
      <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 sm:p-9 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(42,95%,55%,0.04)] rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 text-xs font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.12)] px-2.5 py-1 rounded-lg border border-[hsl(42,95%,55%,0.25)] mb-3">
          {category.badge}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] tracking-tight mb-3">
          {category.headline}
        </h1>

        <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-2xl mb-6">
          {category.description}
        </p>

        {/* Aggregate Market Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 border-t border-[hsl(220,10%,16%)]">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-0.5">
              Tracked Concepts
            </span>
            <p className="text-base sm:text-lg font-bold font-[family-name:var(--font-mono)] text-[hsl(40,20%,92%)]">
              {categoryScans.length} verified scans
            </p>
          </div>

          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-0.5">
              Open Space Gaps
            </span>
            <p className="text-base sm:text-lg font-bold font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)]">
              {lowSaturationCount} low saturation
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-0.5">
              Avg Competitors
            </span>
            <p className="text-base sm:text-lg font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)]">
              {avgCompetitors} players / idea
            </p>
          </div>
        </div>
      </div>

      {/* Idea Reports List */}
      <div className="mb-10">
        <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-4">
          Validated {category.name} Concepts
        </h2>

        <div className="space-y-3.5">
          {categoryScans.map((scan) => (
            <div
              key={scan.shareSlug}
              className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.4)] rounded-xl p-4 sm:p-5 transition-all group shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] group-hover:text-[hsl(42,95%,55%)] transition-colors leading-snug">
                    &ldquo;{scan.ideaText}&rdquo;
                  </h3>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-center">
                  <SignalBars score={scan.saturationScore} size="sm" />
                  <Link
                    href={`/scan/${scan.shareSlug}`}
                    className="px-3 py-1 bg-[hsl(220,10%,16%)] hover:bg-[hsl(42,95%,55%)] text-[hsl(40,20%,85%)] hover:text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-mono)] rounded-lg transition-all"
                  >
                    View Report →
                  </Link>
                </div>
              </div>

              {/* Moat Summary Preview */}
              <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mb-3 line-clamp-2">
                {scan.gapAnalysis}
              </p>

              {/* Competitor Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[hsl(220,10%,15%)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
                <span>Tracked Competitors:</span>
                {scan.competitors.map((comp) => (
                  <span
                    key={comp.name}
                    className="px-2 py-0.5 bg-[hsl(220,12%,14%)] text-[hsl(40,20%,85%)] rounded border border-[hsl(220,10%,20%)] text-[10px]"
                  >
                    {comp.name} ({comp.pricing ? comp.pricing.split(',')[0] : 'Pricing tracked'})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category CTA Banner */}
      <div className="p-6 sm:p-8 bg-[hsl(220,15%,10%)] border border-[hsl(42,95%,55%,0.3)] rounded-2xl text-center relative overflow-hidden shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] mb-2">
          Have your own {category.name} idea?
        </h3>
        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-md mx-auto mb-5 leading-relaxed">
          Run a live web search scan to uncover direct competitors, pricing models, and strategic market gaps in 10 seconds.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
        >
          Check your idea free →
        </Link>
      </div>
    </div>
  );
}
