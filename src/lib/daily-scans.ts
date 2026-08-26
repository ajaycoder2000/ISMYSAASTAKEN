import { SaturationLevel } from '@/types';

export interface DailyScanIdea {
  id: string;
  idea: string;
  category: 'ai' | 'devtools' | 'b2b' | 'creator';
  saturationScore: SaturationLevel;
  competitors: number;
  gapSummary: string;
  shareSlug: string;
}

export const CURATED_DAILY_POOL: DailyScanIdea[] = [
  // AI Category
  {
    id: 'd1',
    idea: 'AI meeting notes to Linear tickets with auto-reproduction steps',
    category: 'ai',
    saturationScore: 'low',
    competitors: 3,
    gapSummary: 'Direct developer issue-tracker sync vs generic meeting transcripts',
    shareSlug: 'ai-meeting-notes-linear',
  },
  {
    id: 'd2',
    idea: 'Figma design tokens to Tailwind CSS code exporter with live AST previews',
    category: 'devtools',
    saturationScore: 'medium',
    competitors: 7,
    gapSummary: 'Automated semantic design token synchronizer directly to GitHub PRs',
    shareSlug: 'figma-tailwind-ast',
  },
  {
    id: 'd3',
    idea: 'Customer support QA grader using custom LLM evaluation rubrics',
    category: 'ai',
    saturationScore: 'medium',
    competitors: 8,
    gapSummary: 'Self-hosted privacy-first QA grader without sending PII to 3rd-party clouds',
    shareSlug: 'customer-support-qa-llm',
  },
  {
    id: 'd4',
    idea: 'SOC2 compliance automation tailored specifically for solo indie founders',
    category: 'b2b',
    saturationScore: 'low',
    competitors: 4,
    gapSummary: 'Priced at $49/mo instead of $15,000/yr enterprise platforms like Vanta',
    shareSlug: 'soc2-solo-founders',
  },
  {
    id: 'd5',
    idea: 'Micro-SaaS server health and uptime monitor via Telegram & WhatsApp bots',
    category: 'devtools',
    saturationScore: 'low',
    competitors: 3,
    gapSummary: 'Instant zero-dashboard alert bots instead of heavy monitoring suites',
    shareSlug: 'uptime-monitor-whatsapp',
  },
  {
    id: 'd6',
    idea: 'Voice notes with automated bullet-point executive summaries for founders',
    category: 'creator',
    saturationScore: 'medium',
    competitors: 9,
    gapSummary: 'Direct 1-click webhook integrations into Notion, Slack, and Linear',
    shareSlug: 'voice-notes-executive',
  },
  {
    id: 'd7',
    idea: 'Automated dunning & failed Stripe payment recovery via smart SMS nudges',
    category: 'b2b',
    saturationScore: 'high',
    competitors: 15,
    gapSummary: 'Zero-commission model with flat $19/mo pricing vs 15% recovery fees',
    shareSlug: 'stripe-dunning-recovery',
  },
  {
    id: 'd8',
    idea: 'AI changelog generator compiled directly from merged GitHub pull requests',
    category: 'devtools',
    saturationScore: 'high',
    competitors: 14,
    gapSummary: 'Auto-categorizes user-facing improvements and skips internal refactors',
    shareSlug: 'github-pr-changelog',
  },
  {
    id: 'd9',
    idea: 'Open-source Datadog alternative for Next.js and Supabase serverless apps',
    category: 'devtools',
    saturationScore: 'low',
    competitors: 4,
    gapSummary: 'Zero per-event billing gotchas with self-hosted Docker clickhouse core',
    shareSlug: 'nextjs-serverless-apm',
  },
  {
    id: 'd10',
    idea: 'AI cold outreach personalization trained on prospect podcast appearances',
    category: 'b2b',
    saturationScore: 'medium',
    competitors: 6,
    gapSummary: 'References actual spoken quotes rather than generic LinkedIn bios',
    shareSlug: 'podcast-cold-outreach',
  },
  {
    id: 'd11',
    idea: 'HIPAA-compliant client intake form builder for private therapy practices',
    category: 'b2b',
    saturationScore: 'low',
    competitors: 5,
    gapSummary: 'Built strictly for solopreneur therapists with integrated Stripe billing',
    shareSlug: 'hipaa-therapy-intake',
  },
  {
    id: 'd12',
    idea: 'Raycast extension that converts unstructured text to validated JSON schema',
    category: 'devtools',
    saturationScore: 'low',
    competitors: 2,
    gapSummary: 'Local hotkey JSON formatter with offline LLM fallback',
    shareSlug: 'raycast-json-schema',
  },
  {
    id: 'd13',
    idea: 'AI podcast editing assistant that removes filler words and silences in 1 click',
    category: 'creator',
    saturationScore: 'high',
    competitors: 18,
    gapSummary: 'Browser-based WebAssembly speed without uploading large GB video files',
    shareSlug: 'podcast-filler-removal',
  },
  {
    id: 'd14',
    idea: 'Automated testimonial wall widget with verifiable Twitter and LinkedIn embeds',
    category: 'creator',
    saturationScore: 'high',
    competitors: 16,
    gapSummary: 'SEO-indexed review cards with JSON-LD schema snippet generation',
    shareSlug: 'testimonial-wall-widget',
  },
  {
    id: 'd15',
    idea: 'PostgreSQL database query cost and slow query optimizer for Supabase',
    category: 'devtools',
    saturationScore: 'low',
    competitors: 3,
    gapSummary: 'Provides copy-paste index suggestions before slow queries cause outages',
    shareSlug: 'postgres-query-optimizer',
  },
  {
    id: 'd16',
    idea: 'Automated invoice factoring & cash advance broker for Shopify merchants',
    category: 'b2b',
    saturationScore: 'medium',
    competitors: 7,
    gapSummary: 'Connects to Shopify API and disburses instant payouts under $5,000',
    shareSlug: 'shopify-invoice-factoring',
  },
  {
    id: 'd17',
    idea: 'Chrome extension to extract B2B SaaS pricing tables into structured Google Sheets',
    category: 'devtools',
    saturationScore: 'low',
    competitors: 2,
    gapSummary: '1-click competitor pricing intelligence scraper for sales teams',
    shareSlug: 'pricing-scraper-extension',
  },
  {
    id: 'd18',
    idea: 'AI SDR agent that qualifies incoming inbound demo requests via email in 2m',
    category: 'ai',
    saturationScore: 'high',
    competitors: 22,
    gapSummary: 'Routes directly to calendar with pre-filled company revenue enrichment',
    shareSlug: 'ai-sdr-qualification',
  },
];

/**
 * Returns a dynamically rotated list of scans for today based on the date seed.
 */
export function getDailyRotatedScans(categoryFilter: string = 'all'): Array<DailyScanIdea & { timeAgo: string; isToday: boolean }> {
  // Use today's day of year as deterministic rotation offset
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const offset = (dayOfYear * 3) % CURATED_DAILY_POOL.length;
  const rotated = [
    ...CURATED_DAILY_POOL.slice(offset),
    ...CURATED_DAILY_POOL.slice(0, offset),
  ];

  // Dynamic realistic timestamps for today
  const timeOffsets = [
    '6m ago',
    '18m ago',
    '34m ago',
    '52m ago',
    '1h ago',
    '2h ago',
    '3h ago',
    '4h ago',
    '6h ago',
    '8h ago',
    '11h ago',
    'Yesterday',
    'Yesterday',
    '2d ago',
    '3d ago',
    '3d ago',
    '4d ago',
    '5d ago',
  ];

  const withTimestamps = rotated.map((item, idx) => ({
    ...item,
    timeAgo: timeOffsets[idx % timeOffsets.length],
    isToday: idx < 11,
  }));

  if (categoryFilter === 'all') return withTimestamps;
  if (categoryFilter === 'today') return withTimestamps.filter((s) => s.isToday);
  if (categoryFilter === 'low') return withTimestamps.filter((s) => s.saturationScore === 'low');
  return withTimestamps.filter((s) => s.category === categoryFilter);
}
