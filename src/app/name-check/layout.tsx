import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Startup Name & Handle Availability Checker — Is My SaaS Taken?',
  description:
    'Instant domain availability (.com, .io, .co, .app via official RDAP) and social handle availability (X, GitHub, Instagram, TikTok) for startup and SaaS founders.',
  alternates: {
    canonical: '/name-check',
  },
  openGraph: {
    title: 'Free Startup Name & Handle Checker — Is My SaaS Taken?',
    description:
      'Check domain availability (.com/.io/.co/.app) and social handles (X, Instagram, TikTok, GitHub) in one click before launching.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Startup Name & Handle Availability Checker — Is My SaaS Taken?',
    description:
      'Official RDAP domain checks (.com/.io/.co/.app) + social handle availability for founders.',
  },
};

export default function NameCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
