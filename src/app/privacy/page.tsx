import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Is My SaaS Taken?',
  description: 'Privacy Policy and data protection disclosures for Is My SaaS Taken?',
  alternates: {
    canonical: '/privacy',
  },
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

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
          Last updated: August 31, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <SectionHeading>1. Information We Collect</SectionHeading>
        <Paragraph>
          We only collect information necessary to provide you with fast, accurate market validation telemetry:
        </Paragraph>
        <ul className="list-disc pl-5 text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] space-y-2 mb-4">
          <li><strong>Account Data:</strong> When you sign up or subscribe, we receive your email address and authentication credentials managed securely via Clerk.</li>
          <li><strong>Scan Queries:</strong> The text descriptions of the SaaS ideas you submit to generate competitive analysis, saturation scores, and opportunity wedges.</li>
          <li><strong>Email Subscriptions:</strong> Your email address and notification preferences when you opt in to receive &quot;The Weekly SaaS Gap Report&quot;.</li>
          <li><strong>Technical Telemetry:</strong> Anonymized client IP addresses (solely used to enforce fair-use rate limits) and standard browser device characteristics.</li>
        </ul>

        <SectionHeading>2. How We Protect Your SaaS Ideas</SectionHeading>
        <Paragraph>
          We treat the startup concepts you submit with strict confidentiality. Your idea text is transmitted via TLS encryption and used exclusively in real time to query public search APIs and generative models for live competitors. We do not sell your ideas, share proprietary concepts with competitors, or use your unshared scans to build internal software products.
        </Paragraph>

        <SectionHeading>3. Third-Party Infrastructure Partners</SectionHeading>
        <Paragraph>
          We rely on industry-standard infrastructure providers to deliver reliable, secure service:
        </Paragraph>
        <ul className="list-disc pl-5 text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] space-y-2 mb-4">
          <li><strong>Supabase:</strong> Encrypted PostgreSQL cloud storage with Row-Level Security (RLS) for user accounts and scan history.</li>
          <li><strong>Clerk:</strong> SOC2-compliant user authentication and session management.</li>
          <li><strong>Resend:</strong> Secure transactional and weekly report email dispatch.</li>
          <li><strong>Vercel:</strong> Global edge serverless hosting and execution.</li>
        </ul>

        <SectionHeading>4. Email Preferences & 1-Click Unsubscribe</SectionHeading>
        <Paragraph>
          We respect your inbox. Every edition of &quot;The Weekly SaaS Gap Report&quot; contains a secure, tokenized 1-click unsubscribe link at the footer. Clicking it immediately sets your subscriber status to inactive with zero confirmation hurdles.
        </Paragraph>

        <SectionHeading>5. Your Data Rights & Deletion</SectionHeading>
        <Paragraph>
          Under applicable data protection regulations (including GDPR and CCPA), you have the right to request access to, correction of, or permanent deletion of your account and scan records. You can delete individual scans directly from your dashboard or contact us for full account removal.
        </Paragraph>

        <SectionHeading>6. Contact Us</SectionHeading>
        <Paragraph>
          If you have any questions, concerns, or requests regarding this Privacy Policy, please email our team directly at{' '}
          <a
            href="mailto:ismysaastaken@gmail.com"
            className="text-[hsl(42,95%,55%)] hover:underline font-mono"
          >
            ismysaastaken@gmail.com
          </a>.
        </Paragraph>
      </div>
    </div>
  );
}
