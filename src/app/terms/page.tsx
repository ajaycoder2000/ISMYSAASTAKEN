import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Is My SaaS Taken?',
  description: 'Terms of Service and usage guidelines for Is My SaaS Taken?',
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] mt-8 mb-3 tracking-tight">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mb-4">
      {children}
    </p>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[hsl(220,10%,16%)]">
        <Link
          href="/"
          className="text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline mb-3 inline-block"
        >
          ← Back to Is My SaaS Taken?
        </Link>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
          Last updated: August 27, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <SectionHeading>1. Overview & Service Description</SectionHeading>
        <Paragraph>
          Is My SaaS Taken? provides automated competitive market intelligence, saturation analysis, and strategic moat discovery for startup ideas using live web search crawling and generative reasoning models. By using our website and services, you agree to comply with and be bound by the following terms.
        </Paragraph>

        <SectionHeading>2. User Accounts & Fair Usage</SectionHeading>
        <Paragraph>
          Users on the Free tier receive 3 scans per monthly billing cycle. Paid subscribers (Sprint Pass or Founder Pro) receive their designated allowances without automated rate throttling. You agree not to reverse engineer, abuse, automatedly scrape, or attempt to overwhelm the scanning API infrastructure.
        </Paragraph>

        <SectionHeading>3. Intellectual Property & Idea Ownership</SectionHeading>
        <Paragraph>
          <strong>Your startup ideas belong entirely to you.</strong> We do not claim ownership of any concepts, prompts, or proprietary descriptions you input. Scan results generated for your inputs can be used, shared, and exported by you freely. Our site design, branding, scoring algorithms, and codebase remain our exclusive intellectual property.
        </Paragraph>

        <SectionHeading>4. Sponsorship and Advertising</SectionHeading>
        <Paragraph>
          The site displays sponsored placements from third-party businesses. These are clearly labeled as sponsored content. We do not allow sponsors to influence scan results, saturation scores, or strategic verdicts in any way. Sponsor presence on the site does not constitute an official endorsement.
        </Paragraph>

        <SectionHeading>5. Limitation of Liability</SectionHeading>
        <Paragraph>
          This service is provided &quot;as is&quot; without warranties of any kind. Scan results are directional market intelligence based on real-time web snapshots and do not constitute legal, financial, or formal patent advice. We are not liable for business decisions made based on scan results, for downtime, or for any indirect or consequential damages. Our total liability is strictly limited to the amount you have paid us in the 12 months preceding any claim.
        </Paragraph>

        <SectionHeading>6. Changes to These Terms</SectionHeading>
        <Paragraph>
          We may update these terms from time to time. Material changes will be communicated via email or prominent site notice to registered users at least 14 days before taking effect. Continued use of the service after changes take effect constitutes acceptance.
        </Paragraph>

        <SectionHeading>7. Contact Information</SectionHeading>
        <Paragraph>
          For questions regarding these terms, privacy inquiries, or commercial sponsorships, please contact us at <a href="mailto:ismysaastaken@gmail.com" className="text-[hsl(42,95%,55%)] hover:underline font-mono">ismysaastaken@gmail.com</a>.
        </Paragraph>
      </div>
    </div>
  );
}
