import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free SaaS Keyword Research & Search Trend Signals — Is My SaaS Taken?',
  description:
    'Free keyword research tool for SaaS founders. Analyze Google Trends search interest over time (0–100 scale), real Google autocomplete suggestions, and organic SERP competition signals.',
  alternates: {
    canonical: '/keywords',
  },
  openGraph: {
    title: 'Free SaaS Keyword Research & Search Trend Signals',
    description:
      'Analyze Google Trends search interest over time (0–100 relative scale), live Google autocomplete queries, and SERP competition signals for SaaS ideas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SaaS Keyword Research Radar — Is My SaaS Taken?',
    description:
      'Search interest trends (0-100 scale), real Google autocomplete, and SERP competition signals for SaaS founders.',
  },
};

export default function KeywordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
