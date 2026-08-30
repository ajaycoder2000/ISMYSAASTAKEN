import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans — Is My SaaS Taken?',
  description:
    'Flexible pricing for founders and indie hackers. Start with 3 free scans every month, or upgrade to Sprint Pass and Founder Pro for unlimited validation.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing & Plans — Is My SaaS Taken?',
    description:
      'Instant market validation pricing. Start free or upgrade for unlimited scans and deep grounding.',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
