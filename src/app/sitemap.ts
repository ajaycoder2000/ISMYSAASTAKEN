import type { MetadataRoute } from 'next';
import { REAL_SEEDED_SCANS } from '@/lib/seeds/real-scans';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ismysaastaken.vercel.app';
  const now = new Date();

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/keywords`, lastModified: now, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/pricing`, lastModified: now, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/roadmap`, lastModified: now, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${baseUrl}/terms`, lastModified: now, priority: 0.3, changeFrequency: 'monthly' },
    { url: `${baseUrl}/privacy`, lastModified: now, priority: 0.3, changeFrequency: 'monthly' },
  ];

  // Category index pages
  const categoryPages: MetadataRoute.Sitemap = [
    'ai-agents',
    'dev-tools',
    'micro-saas',
    'b2b-saas',
    'creator-economy',
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  // Public scan permalink pages from authentic verified scans
  const scanPages: MetadataRoute.Sitemap = (REAL_SEEDED_SCANS || []).slice(0, 25).map((scan) => ({
    url: `${baseUrl}/scan/${scan.shareSlug}`,
    lastModified: now,
    priority: 0.6,
    changeFrequency: 'monthly',
  }));

  return [...corePages, ...categoryPages, ...scanPages];
}
