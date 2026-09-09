import { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseDB } from '@/lib/supabase/db';
import { DevStore } from '@/lib/dev-store';
import RoastView from '@/components/roast/RoastView';

interface Props {
  params: Promise<{ shareSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareSlug } = await params;

  try {
    const scan = await SupabaseDB.getScanByIdOrSlug(shareSlug);
    if (!scan) {
      return { title: 'Roast Not Found — Is My SaaS Taken?' };
    }

    const truncated =
      scan.ideaText.length > 70
        ? scan.ideaText.slice(0, 70) + '...'
        : scan.ideaText;

    const roastLine =
      scan.roast?.lines?.[0] || 'Unfiltered comedy roast grounded in live crawl data.';

    return {
      title: `🔥 Roast: "${truncated}" — Is My SaaS Taken?`,
      description: `"${roastLine}" — Roasts the market, never the founder. Read the full verdict and constructive takeaway.`,
      alternates: {
        canonical: `/roast/${shareSlug}`,
      },
      openGraph: {
        title: `🔥 Idea Roast: "${truncated}"`,
        description: roastLine,
        images: [
          {
            url: `/api/roast-image/${shareSlug}`,
            width: 1200,
            height: 630,
            alt: `Idea Roast Verdict for "${truncated}"`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `🔥 Idea Roast: "${truncated}"`,
        description: roastLine,
        images: [`/api/roast-image/${shareSlug}`],
      },
    };
  } catch {
    return { title: 'Idea Roast Mode — Is My SaaS Taken?' };
  }
}

export default async function SharedRoastPage({ params }: Props) {
  const { shareSlug } = await params;

  let scan = null;
  try {
    scan = await SupabaseDB.getScanByIdOrSlug(shareSlug);
    if (!scan) {
      scan = DevStore.findScanByIdOrSlug(shareSlug) as any;
    }
  } catch {
    // ignore
  }

  if (!scan) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-950/60 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto text-xl">
            🔥
          </div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-zinc-100">
            Roast Report Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-[family-name:var(--font-inter)] leading-relaxed">
            This idea roast could not be found. It may have expired or the link is incorrect.
          </p>
          <Link
            href="/roast"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all font-mono shadow-md"
          >
            Roast your own idea free &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return <RoastView initialScan={scan} />;
}
