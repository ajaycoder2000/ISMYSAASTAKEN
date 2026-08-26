import { SaturationLevel, ICompetitor } from '@/types';

export interface SeedScanData {
  ideaText: string;
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
  shareSlug: string;
  category: 'ai-agents' | 'dev-tools' | 'micro-saas' | 'b2b-saas' | 'creator-economy';
  competitors: ICompetitor[];
}

export const REAL_SEEDED_SCANS: SeedScanData[] = [
  // 1. AI & Meeting Notes to Linear
  {
    ideaText: 'AI meeting notes to Linear tickets with auto-reproduction steps',
    saturationScore: 'low',
    saturationReasoning: 'While Otter and Fireflies dominate generic audio transcription, zero players specialize in extracting deterministic GitHub/Linear bug repro steps for engineering teams.',
    gapAnalysis: 'Focus entirely on developer workflows: parse stack traces, terminal logs, and spoken reproduction steps directly into structured Linear issues with 1-click GitHub commit references.',
    shareSlug: 'ai-meeting-notes-linear',
    category: 'ai-agents',
    competitors: [
      {
        name: 'Otter.ai',
        url: 'https://otter.ai',
        description: 'Generic AI meeting assistant that records audio, writes notes, and summarizes meetings.',
        pricing: 'Free tier available, Pro starts at $16.99/mo.',
      },
      {
        name: 'Fireflies.ai',
        url: 'https://fireflies.ai',
        description: 'AI voice assistant that joins conference calls and automates meeting notes.',
        pricing: 'Pro plan at $10/user/mo, Business at $19/user/mo.',
      },
      {
        name: 'Fathom',
        url: 'https://fathom.video',
        description: 'Free AI meeting recorder that records, transcribes, and highlights calls.',
        pricing: 'Free for individuals, Team Edition at $19/user/mo.',
      },
    ],
  },

  // 2. Figma to Tailwind AST Exporter
  {
    ideaText: 'Figma design tokens to Tailwind CSS code exporter with live AST previews',
    saturationScore: 'medium',
    saturationReasoning: 'Several Figma plugins export HTML, but most generate bloated inline CSS that requires hours of manual refactoring.',
    gapAnalysis: 'Win on clean semantic AST parsing: export production-ready React/Vue components with exact Tailwind v4 classes and design token config files.',
    shareSlug: 'figma-tailwind-ast',
    category: 'dev-tools',
    competitors: [
      {
        name: 'Anima App',
        url: 'https://animaapp.com',
        description: 'Design to code platform translating Figma & Adobe XD into React/Vue/HTML.',
        pricing: 'Free tier with watermarks, Starter at $39/mo.',
      },
      {
        name: 'Locofy.ai',
        url: 'https://locofy.ai',
        description: 'Frontend AI tool that turns Figma designs into frontend code.',
        pricing: 'Free trial, Pro starts at $33/mo.',
      },
    ],
  },

  // 3. Customer Support QA Grader
  {
    ideaText: 'Customer support QA grader using custom LLM evaluation rubrics',
    saturationScore: 'medium',
    saturationReasoning: 'Existing QA platforms like MaestroQA charge $10k+/year enterprise contracts, leaving solopreneurs and small startups unserved.',
    gapAnalysis: 'Self-serve $29/mo QA grader with 1-click Zendesk/Intercom sync that scores ticket responses against company brand voice guidelines automatically.',
    shareSlug: 'customer-support-qa-llm',
    category: 'b2b-saas',
    competitors: [
      {
        name: 'MaestroQA',
        url: 'https://maestroqa.com',
        description: 'Enterprise quality assurance software for customer service teams.',
        pricing: 'Custom enterprise quotes ($10,000+/yr).',
      },
      {
        name: 'Klaus (acquired by Zendesk)',
        url: 'https://klausapp.com',
        description: 'AI-powered customer service quality management platform.',
        pricing: 'Enterprise tier pricing, requires sales call.',
      },
    ],
  },

  // 4. SOC2 Compliance Automation for Solo Founders
  {
    ideaText: 'SOC2 compliance automation tailored specifically for solo indie founders',
    saturationScore: 'low',
    saturationReasoning: 'Vanta and Drata focus on funded companies with $15k budgets. Micro-SaaS founders building enterprise plugins need lightweight proof of security.',
    gapAnalysis: 'Provide an opinionated $49/mo SOC2 checklist generator with automated AWS/Supabase read-only permission scanners designed for 1-person teams.',
    shareSlug: 'soc2-solo-founders',
    category: 'b2b-saas',
    competitors: [
      {
        name: 'Vanta',
        url: 'https://vanta.com',
        description: 'Automated compliance platform for SOC 2, ISO 27001, and HIPAA.',
        pricing: 'Starts around $7,500 to $15,000 annually.',
      },
      {
        name: 'Drata',
        url: 'https://drata.com',
        description: 'Continuous security and compliance automation software.',
        pricing: 'Custom enterprise pricing ($10k+/yr).',
      },
    ],
  },

  // 5. Micro-SaaS Server Health Telegram Bot
  {
    ideaText: 'Micro-SaaS server health and uptime monitor via Telegram & WhatsApp bots',
    saturationScore: 'low',
    saturationReasoning: 'Statuspage and Better Stack are great but overwhelm users with complex dashboards when all a solo founder wants is a simple chat notification.',
    gapAnalysis: 'Zero-dashboard uptime monitoring: configure ping endpoints and receive actionable webhook alerts directly in Telegram or WhatsApp with instant restart commands.',
    shareSlug: 'uptime-monitor-whatsapp',
    category: 'micro-saas',
    competitors: [
      {
        name: 'Better Stack',
        url: 'https://betterstack.com',
        description: 'Infrastructure observability, log management, and uptime monitoring.',
        pricing: 'Free tier available, Starter at $29/mo.',
      },
      {
        name: 'UptimeRobot',
        url: 'https://uptimerobot.com',
        description: 'Uptime monitoring service with 50 free monitors and 5-minute checks.',
        pricing: 'Free plan, Pro starts at $8/mo.',
      },
    ],
  },

  // 6. Voice Notes with Executive Summaries
  {
    ideaText: 'Voice notes with automated bullet-point executive summaries for founders',
    saturationScore: 'medium',
    saturationReasoning: 'Consumer voice apps like AudioPen and Coconote do well, but lack direct integration into Notion, Slack, and Linear for busy executives.',
    gapAnalysis: 'Specialize in asynchronous team handoffs: convert rambling 5-minute audio brain dumps into structured PRD requirements with auto-assigned action items.',
    shareSlug: 'voice-notes-executive',
    category: 'creator-economy',
    competitors: [
      {
        name: 'AudioPen',
        url: 'https://audiopen.ai',
        description: 'AI tool that converts unstructured voice memos into clear, written text.',
        pricing: 'Free plan, Prime Pass at $60/yr.',
      },
      {
        name: 'Oasis Voice',
        url: 'https://theoasis.com',
        description: 'AI voice recording app that cleans up ramblings into summaries.',
        pricing: 'Subscription at $10/mo.',
      },
    ],
  },

  // 7. Stripe Dunning & Failed Payment Recovery
  {
    ideaText: 'Automated dunning & failed Stripe payment recovery via smart SMS nudges',
    saturationScore: 'high',
    saturationReasoning: 'Baremetrics Recover and Churn Buster have dominated this for years, but take large percentages or charge high subscription minimums.',
    gapAnalysis: 'Flat $19/mo pricing with zero percentage fee on recovered MRR, using gentle WhatsApp & SMS nudges with localized payment retries.',
    shareSlug: 'stripe-dunning-recovery',
    category: 'b2b-saas',
    competitors: [
      {
        name: 'Baremetrics Recover',
        url: 'https://baremetrics.com/features/recover',
        description: 'Failed payment recovery tool for Stripe and Braintree.',
        pricing: '$58/mo minimum base fee + MRR tier scaling.',
      },
      {
        name: 'Churn Buster',
        url: 'https://churnbuster.io',
        description: 'Dunning management and passive churn reduction software.',
        pricing: 'Starts at $249/mo.',
      },
    ],
  },

  // 8. Open Source Datadog for Supabase Apps
  {
    ideaText: 'Open-source Datadog alternative for Next.js and Supabase serverless apps',
    saturationScore: 'low',
    saturationReasoning: 'Datadog bills by the host and event, causing massive unexpected bills for serverless startups. PostHog and Highlight focus on frontend, leaving serverless APM open.',
    gapAnalysis: 'Single-binary ClickHouse-powered APM that visualizes Next.js cold starts, edge middleware latency, and Supabase slow query logs in one lightweight pane.',
    shareSlug: 'nextjs-serverless-apm',
    category: 'dev-tools',
    competitors: [
      {
        name: 'Datadog',
        url: 'https://datadoghq.com',
        description: 'Enterprise cloud monitoring and application performance management.',
        pricing: 'Starts at $15/host/mo with complex per-metric overages.',
      },
      {
        name: 'Highlight.io',
        url: 'https://highlight.io',
        description: 'Open source full-stack monitoring and session replay platform.',
        pricing: 'Free tier up to 500 sessions, then $150/mo.',
      },
    ],
  },
];
