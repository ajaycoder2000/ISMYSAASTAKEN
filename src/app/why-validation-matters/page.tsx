import { Metadata } from 'next';
import Link from 'next/link';
import WhyValidationMattersSection from '@/components/WhyValidationMattersSection';

export const metadata: Metadata = {
  title: 'Why Idea Validation Matters — Interactive Startup Risk Self-Check | IsMySaaSTaken',
  description:
    '42% of startups fail for one avoidable reason. Answer 3 quick questions to see which failure mode your SaaS idea is most exposed to, and map it to real post-mortem data.',
  alternates: {
    canonical: '/why-validation-matters',
  },
  openGraph: {
    title: 'Why Idea Validation Matters — Interactive Startup Risk Self-Check',
    description:
      '42% of startups fail for one avoidable reason. Answer 3 questions to see which failure mode your SaaS idea is most exposed to.',
    url: 'https://ismysaastaken.com/why-validation-matters',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why Idea Validation Matters — Is My SaaS Taken?',
    description:
      '42% of startups fail for one avoidable reason. Answer 3 questions to see which failure your idea is most exposed to.',
  },
};

export default function WhyValidationMattersPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-8 sm:py-14 w-full max-w-4xl mx-auto">
      <div className="mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)] transition-colors font-[family-name:var(--font-mono)]"
        >
          <span>←</span>
          <span>Back to Scanner</span>
        </Link>
      </div>

      <WhyValidationMattersSection />
    </div>
  );
}
