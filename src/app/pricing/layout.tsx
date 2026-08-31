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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the 7-Day Sprint Pass work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Sprint Pass is a one-time $9 payment that gives you 25 deep AI scans and full Pro access for 7 days. There is zero recurring subscription, making it perfect for hackathons or weekend ideation sprints.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where does the competitor data come from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every scan triggers a live, real-time Google search grounding crawl that inspects active SaaS landing pages, Product Hunt launches, GitHub repos, and pricing directories.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my Founder Pro subscription anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, with one click in your dashboard. You retain Pro access until the end of your billing cycle, and your past scans remain saved forever.',
      },
    },
    {
      '@type': 'Question',
      name: 'When will founder tool sponsorships open?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are prioritizing search accuracy and founder adoption first. Tool sponsorships will open in Phase 3 after reaching our monthly active scan milestone. You can preview the mockup and join the waitlist on our public roadmap.',
      },
    },
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
