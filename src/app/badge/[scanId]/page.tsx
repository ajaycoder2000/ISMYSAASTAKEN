import { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseDB } from '@/lib/supabase/db';
import { DevStore } from '@/lib/dev-store';
import { isBadgeEligible } from '@/lib/badge';
import { isScanOwnerBadgeEntitled } from '@/lib/checkEntitlement';
import SignalBars from '@/components/SignalBars';

interface Props {
  params: Promise<{ scanId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scanId } = await params;

  try {
    let scan = await SupabaseDB.getScanByIdOrSlug(scanId);
    if (!scan) {
      scan = DevStore.findScanByIdOrSlug(scanId) as any;
    }

    const contentEligible = Boolean(scan && isBadgeEligible(scan));
    const planEligible = scan && contentEligible
      ? await isScanOwnerBadgeEntitled(scan.userId || (scan as any).user_id)
      : false;

    if (!scan || !contentEligible || !planEligible) {
      return { title: 'Market Validation Certificate — Is My SaaS Taken?' };
    }

    const truncated =
      scan.ideaText.length > 70
        ? scan.ideaText.slice(0, 70) + '...'
        : scan.ideaText;

    return {
      title: `✓ Validated: "${truncated}" — Is My SaaS Taken?`,
      description: `Official Market Validation Certificate for "${truncated}". Market saturation: ${scan.saturationScore?.toUpperCase()}. Verified opportunity wedge identified.`,
      alternates: {
        canonical: `/badge/${scanId}`,
      },
      openGraph: {
        title: `✓ Validated: "${truncated}"`,
        description: `Verified market opportunity with ${scan.saturationScore?.toUpperCase()} saturation.`,
        images: [`/api/badge/${scanId}`],
      },
    };
  } catch {
    return { title: 'Market Validation Certificate — Is My SaaS Taken?' };
  }
}

export default async function BadgeVerificationPage({ params }: Props) {
  const { scanId } = await params;

  let scan: any = null;
  try {
    scan = await SupabaseDB.getScanByIdOrSlug(scanId);
    if (!scan) {
      scan = DevStore.findScanByIdOrSlug(scanId);
    }
  } catch {
    // ignore
  }

  const contentEligible = Boolean(scan && isBadgeEligible(scan));
  const planEligible = scan && contentEligible
    ? await isScanOwnerBadgeEntitled(scan.userId || (scan as any).user_id)
    : false;
  const eligible = Boolean(scan && contentEligible && planEligible);

  if (!scan || !eligible) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md w-full bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
            ?
          </div>
          <h1 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-zinc-100">
            Certificate Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-[family-name:var(--font-inter)] leading-relaxed">
            This scan does not have an active validation certificate. It may not exist or did
            not meet the qualification criteria (low/medium saturation + verified market gap).
          </p>
          <Link
            href="/?utm_source=badge_verify_notfound"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
          >
            Validate your own SaaS idea free &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const scanDate = scan.createdAt
    ? new Date(scan.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Scan';

  const competitorCount = scan.competitors?.length || 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-10 sm:py-16 w-full max-w-3xl mx-auto space-y-8 text-left">
      {/* 1. Header Certificate Seal */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
          <span>✓</span>
          <span>OFFICIAL MARKET VALIDATION CERTIFICATE</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-zinc-100 tracking-tight">
          Verified Market Opportunity
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 font-[family-name:var(--font-inter)] max-w-lg mx-auto leading-relaxed">
          This concept was independently analyzed by IsMySaaSTaken and passed the qualification
          bar for open market positioning and a viable differentiation wedge.
        </p>
      </div>

      {/* 2. Certificate Card */}
      <div className="w-full bg-[hsl(220,15%,9%)] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle emerald ambient glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              Status: Verified Qualified
            </span>
          </div>
          <span className="text-zinc-500">Scanned on {scanDate}</span>
        </div>

        {/* Target Concept */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold block">
            Validated Concept
          </span>
          <p className="text-base sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-zinc-100 leading-snug">
            &ldquo;{scan.ideaText}&rdquo;
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Metric 1: Saturation */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Market Saturation
            </span>
            <div className="flex items-center gap-3">
              <SignalBars score={scan.saturationScore} size="sm" />
              <span className="text-sm font-bold font-mono uppercase text-emerald-400">
                {scan.saturationScore} Saturation
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-[family-name:var(--font-inter)] pt-1">
              {scan.saturationReasoning ||
                'Market has room for targeted alternatives without enterprise crowding.'}
            </p>
          </div>

          {/* Metric 2: Live Grounded Crawl */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Competitive Intelligence
            </span>
            <div className="text-sm font-bold font-mono text-zinc-200">
              {competitorCount} Active Competitors Tracked
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-[family-name:var(--font-inter)] pt-1">
              Grounded in live search indexing across landing pages, Product Hunt, and software
              directories.
            </p>
          </div>
        </div>

        {/* Opportunity Wedge */}
        <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
              Identified Opportunity Wedge
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-200 font-[family-name:var(--font-inter)] leading-relaxed pt-1">
            {scan.gapAnalysis}
          </p>
        </div>

        {/* Privacy & Integrity Disclaimer */}
        <div className="pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Certificate ID: {scan._id || scan.shareSlug}</span>
          <span>Zero founder personal data published</span>
        </div>
      </div>

      {/* 3. Action Buttons & Viral CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-[hsl(220,12%,11%)] border border-zinc-800">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-zinc-100">
            Building your own software product?
          </h3>
          <p className="text-xs text-zinc-400 font-[family-name:var(--font-inter)]">
            Scan your idea for live competitors, market saturation, and open gaps before writing code.
          </p>
        </div>

        <Link
          href="/?utm_source=badge_verify"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs font-[family-name:var(--font-space-grotesk)] transition-all shadow-md"
        >
          <span>Validate your idea free</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
