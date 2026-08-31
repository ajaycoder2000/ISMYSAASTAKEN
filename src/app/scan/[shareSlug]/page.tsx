import { Metadata } from 'next';
import Link from 'next/link';
import ScanResult from '@/components/ScanResult';
import { SupabaseDB } from '@/lib/supabase/db';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { DevStore } from '@/lib/dev-store';

interface Props {
  params: Promise<{ shareSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareSlug } = await params;
  
  try {
    let ideaText = '';
    let saturation = 'MEDIUM';
    let count = 0;
    let reasoning = '';

    const scan = await SupabaseDB.getScanBySlug(shareSlug);
    if (scan) {
      ideaText = scan.ideaText;
      saturation = (scan.saturationScore || 'medium').toUpperCase();
      count = scan.competitors?.length || 0;
      reasoning = scan.saturationReasoning || '';
    }

    if (!ideaText) {
      return { title: 'Scan Not Found — Is My SaaS Taken?' };
    }
    
    const truncatedIdea = ideaText.length > 80 ? ideaText.slice(0, 80) + '...' : ideaText;
    
    return {
      title: `"${truncatedIdea}" — Market Validation Report`,
      description: `Saturation: ${saturation} • ${count} competitors found. ${reasoning.slice(0, 120)}...`,
      alternates: {
        canonical: `/scan/${shareSlug}`,
      },
      openGraph: {
        title: `Is this SaaS idea taken? "${truncatedIdea}"`,
        description: `Saturation: ${saturation} — ${count} competitors tracked live. See the full gap analysis.`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Is this SaaS idea taken? "${truncatedIdea}"`,
        description: `Saturation: ${saturation} — ${count} competitors tracked live.`,
      },
    };
  } catch {
    return { title: 'Is My SaaS Taken?' };
  }
}

export default async function SharedScanPage({ params }: Props) {
  const { shareSlug } = await params;
  
  let scan = null;
  let error = null;
  
  try {
    scan = await SupabaseDB.getScanBySlug(shareSlug);

    if (!scan) {
      const devScan = DevStore.findScanBySlug(shareSlug);
      if (devScan) {
        scan = devScan;
      } else {
        error = "This market scan report could not be found. It may have expired or the link is incorrect.";
      }
    }
  } catch {
    error = "Something went wrong loading this market scan.";
  }
  
  if (error || !scan) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-md bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[hsl(0,72%,55%,0.1)] text-[hsl(0,72%,55%)] flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] mb-2">
            Scan Report Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6 leading-relaxed">
            {error}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
          >
            Check your own idea free →
          </Link>
        </div>
      </div>
    );
  }
  
  const scanJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `Market Saturation Analysis: ${scan.ideaText}`,
    description: `Competitive market validation for "${scan.ideaText}". Found ${scan.competitors?.length || 0} competitors. Saturation score: ${scan.saturationScore}.`,
    datePublished: scan.createdAt,
    author: {
      '@type': 'Organization',
      name: 'IsMySaaSTaken',
      url: 'https://ismysaastaken.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IsMySaaSTaken',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ismysaastaken.vercel.app/icon.png',
      },
    },
    mainEntityOfPage: `https://ismysaastaken.vercel.app/scan/${scan.shareSlug}`,
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-6 sm:py-12 max-w-3xl xl:max-w-4xl mx-auto pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scanJsonLd) }}
      />
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] mb-5">
        <Link href="/" className="hover:text-[hsl(42,95%,55%)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/#recent-scans" className="hover:text-[hsl(42,95%,55%)] transition-colors">
          Validation Feed
        </Link>
        <span>/</span>
        <span className="text-[hsl(40,8%,65%)] truncate max-w-[180px] sm:max-w-[280px]">
          {scan.shareSlug}
        </span>
      </div>

      {/* Executive Brief Header Card */}
      <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-7 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(42,95%,55%,0.04)] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.1)] px-2 py-0.5 rounded-full border border-[hsl(145,60%,45%,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,60%,55%)] animate-pulse" />
              VERIFIED CRAWL
            </span>
            <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
              {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)]">
            Permanent Share Link
          </span>
        </div>

        <blockquote className="text-base sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] leading-snug">
          &ldquo;{scan.ideaText}&rdquo;
        </blockquote>
      </div>
      
      {/* Full Interactive Scan Results */}
      <ScanResult data={scan} showShareButton={true} />

      {/* Bottom Sticky Viral Conversion CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(220,15%,8%,0.92)] backdrop-blur-md border-t border-[hsl(220,10%,18%)] p-3 sm:p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 px-2">
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
              Testing your own SaaS or AI idea?
            </p>
            <p className="text-[10px] sm:text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] hidden sm:block">
              Get real competitors, pricing tears, and open market gaps in 10 seconds.
            </p>
          </div>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[rgba(245,166,35,0.2)] text-center flex-shrink-0"
          >
            Scan your idea free →
          </Link>
        </div>
      </div>
    </div>
  );
}
