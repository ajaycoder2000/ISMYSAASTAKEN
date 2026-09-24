import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkIdeaAppropriate, generateRoast } from '@/lib/llm';
import { SupabaseDB } from '@/lib/supabase/db';

interface RoastRequestBody {
  scanId?: string;
  shareSlug?: string;
  ideaText?: string;
  competitors?: any[];
  saturationScore?: string;
  gapAnalysis?: string;
  force?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Verified server-side Clerk authentication
    const { userId } = await auth();

    const body: RoastRequestBody = await req.json();
    const targetIdOrSlug = body.scanId || body.shareSlug;

    let ideaText = body.ideaText;
    let competitors = body.competitors;
    let saturationScore = body.saturationScore;
    let gapAnalysis = body.gapAnalysis;

    // 1. If scan ID or slug provided, check existing record
    let existingScan: any = null;
    if (targetIdOrSlug) {
      try {
        existingScan = await SupabaseDB.getScanByIdOrSlug(targetIdOrSlug);
        if (existingScan) {
          ideaText = ideaText || existingScan.ideaText;
          competitors = competitors || existingScan.competitors;
          saturationScore = saturationScore || existingScan.saturationScore;
          gapAnalysis = gapAnalysis || existingScan.gapAnalysis;

          // If cached roast exists and re-generation not forced, return cached
          if (
            !body.force &&
            existingScan.roast &&
            Array.isArray(existingScan.roast.lines) &&
            existingScan.roast.lines.length > 0 &&
            existingScan.roast.takeaway
          ) {
            const scanReceiptId = String(existingScan._id || existingScan.id || targetIdOrSlug)
              .replace(/[^a-zA-Z0-9]/g, '')
              .slice(0, 6)
              .toUpperCase() || 'ROAST1';
            const satRaw = (existingScan.saturationScore || 'medium').toLowerCase();
            const saturation = satRaw === 'low' || satRaw === 'high' ? satRaw : 'medium';

            return NextResponse.json({
              success: true,
              declined: false,
              cached: true,
              receiptId: scanReceiptId,
              ideaText: existingScan.ideaText,
              competitorCount: Array.isArray(existingScan.competitors) ? existingScan.competitors.length : 0,
              saturation,
              freeAlternatives: null,
              roastLines: existingScan.roast.lines,
              takeaway: existingScan.roast.takeaway,
              createdAt: existingScan.createdAt
                ? new Date(existingScan.createdAt).toISOString()
                : new Date().toISOString(),
              roast: existingScan.roast,
              scanId: existingScan.shareSlug || existingScan._id || targetIdOrSlug,
            });
          }
        }
      } catch (err) {
        console.warn('Could not query existing scan for roast:', err);
      }
    }

    // 2. Validate idea text
    if (!ideaText || typeof ideaText !== 'string' || ideaText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid idea text or scan ID is required.' },
        { status: 400 }
      );
    }

    const cleanIdeaText = ideaText.trim();

    // 3. Input Moderation Check
    // If inappropriate, toxic, or junk, return friendly in-brand refusal
    const moderation = await checkIdeaAppropriate(cleanIdeaText);
    if (!moderation.appropriate) {
      return NextResponse.json({
        success: true,
        declined: true,
        message:
          "That's not really an idea we can roast — try submitting an actual SaaS concept.",
      });
    }

    // 4. Generate Roast via LLM with strict guardrails
    const roast = await generateRoast({
      ideaText: cleanIdeaText,
      competitors: competitors || [],
      saturationScore: saturationScore || 'medium',
      gapAnalysis: gapAnalysis || '',
    });

    // 5. Cache result in database / dev-store if scan identifier is available
    if (targetIdOrSlug) {
      try {
        await SupabaseDB.saveRoast(targetIdOrSlug, roast);
      } catch (saveErr) {
        console.warn('Failed to cache roast in DB:', saveErr);
      }
    }

    const effectiveScanId = existingScan?._id || existingScan?.id || targetIdOrSlug || 'ROAST1';
    const receiptId = String(effectiveScanId)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase() || 'ROAST1';
    const competitorCount = Array.isArray(competitors)
      ? competitors.length
      : Array.isArray(existingScan?.competitors)
      ? existingScan.competitors.length
      : 0;
    const saturationRaw = (saturationScore || existingScan?.saturationScore || 'medium').toLowerCase();
    const saturation = saturationRaw === 'low' || saturationRaw === 'high' ? saturationRaw : 'medium';

    return NextResponse.json({
      success: true,
      declined: false,
      receiptId,
      ideaText: cleanIdeaText,
      competitorCount,
      saturation,
      freeAlternatives: null,
      roastLines: roast.lines,
      takeaway: roast.takeaway,
      createdAt: new Date().toISOString(),
      roast: {
        lines: roast.lines,
        takeaway: roast.takeaway,
      },
      scanId: existingScan?.shareSlug || existingScan?._id || targetIdOrSlug,
    });
  } catch (error: any) {
    console.error('Roast generation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
