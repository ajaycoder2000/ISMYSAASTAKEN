import { Metadata } from 'next';
import ScanResult from '@/components/ScanResult';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { DevStore } from '@/lib/dev-store';
import Link from 'next/link';

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

    try {
      const conn = await dbConnect();
      if (conn) {
        const scan = await Scan.findOne({ shareSlug }).lean();
        if (scan) {
          ideaText = scan.ideaText;
          saturation = scan.saturationScore.toUpperCase();
          count = scan.competitors.length;
          reasoning = scan.saturationReasoning;
        }
      }
    } catch {
      // fallback
    }

    if (!ideaText) {
      const devScan = DevStore.findScanBySlug(shareSlug);
      if (devScan) {
        ideaText = devScan.ideaText;
        saturation = devScan.saturationScore.toUpperCase();
        count = devScan.competitors.length;
        reasoning = devScan.saturationReasoning;
      }
    }
    
    if (!ideaText) {
      return { title: 'Scan Not Found — Is My SaaS Taken?' };
    }
    
    const truncatedIdea = ideaText.length > 80 ? ideaText.slice(0, 80) + '...' : ideaText;
    
    return {
      title: `"${truncatedIdea}" — Is My SaaS Taken?`,
      description: `Market saturation: ${saturation}. ${count} competitors found. ${reasoning.slice(0, 120)}...`,
      openGraph: {
        title: `Is this SaaS idea taken? "${truncatedIdea}"`,
        description: `Saturation: ${saturation} — ${count} competitors found. See the full analysis.`,
      },
      twitter: {
        card: 'summary',
        title: `Is this SaaS idea taken?`,
        description: `Saturation: ${saturation} — ${count} competitors found.`,
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
    try {
      const conn = await dbConnect();
      if (conn) {
        const doc = await Scan.findOne({ shareSlug }).lean();
        if (doc) {
          scan = {
            _id: doc._id.toString(),
            userId: doc.userId?.toString() || null,
            ideaText: doc.ideaText,
            competitors: doc.competitors,
            saturationScore: doc.saturationScore,
            saturationReasoning: doc.saturationReasoning,
            gapAnalysis: doc.gapAnalysis,
            shareSlug: doc.shareSlug,
            createdAt: doc.createdAt,
          };
        }
      }
    } catch {
      // fallback
    }

    if (!scan) {
      const devScan = DevStore.findScanBySlug(shareSlug);
      if (devScan) {
        scan = {
          _id: devScan._id,
          userId: devScan.userId,
          ideaText: devScan.ideaText,
          competitors: devScan.competitors,
          saturationScore: devScan.saturationScore,
          saturationReasoning: devScan.saturationReasoning,
          gapAnalysis: devScan.gapAnalysis,
          shareSlug: devScan.shareSlug,
          createdAt: devScan.createdAt,
        };
      } else {
        error = "This scan doesn't exist. Maybe the link is wrong, or maybe it was a fever dream.";
      }
    }
  } catch {
    error = "Something went wrong loading this scan.";
  }
  
  if (error || !scan) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-3">
            Scan not found
          </h1>
          <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
            {error}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
          >
            Check your own idea →
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-10 sm:py-16">
      {/* Header with the original idea */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <p className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,45%)] mb-3">
          Scan Result
        </p>
        <blockquote className="text-lg sm:text-xl text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)] leading-snug border-l-2 border-[hsl(42,95%,55%,0.4)] pl-4">
          &ldquo;{scan.ideaText}&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-[hsl(40,8%,35%)] font-[family-name:var(--font-mono)]">
          Scanned {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      
      {/* Results */}
      <ScanResult data={scan} showShareButton={true} />
      
      {/* CTA */}
      <div className="w-full max-w-2xl mx-auto mt-12 pt-8 border-t border-[hsl(220,10%,15%)] text-center">
        <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-4">
          Have your own idea? Get an honest answer in under a minute.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
        >
          Check your idea →
        </Link>
      </div>
    </div>
  );
}
