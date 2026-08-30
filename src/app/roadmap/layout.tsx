import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Roadmap — Is My SaaS Taken?',
  description:
    'Explore what has shipped, what is in active engineering, and what is coming next for IsMySaaSTaken founder telemetry.',
  alternates: {
    canonical: '/roadmap',
  },
  openGraph: {
    title: 'Product Roadmap — Is My SaaS Taken?',
    description:
      'Explore what has shipped, what is in active engineering, and what is coming next for IsMySaaSTaken founder telemetry.',
    type: 'website',
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
