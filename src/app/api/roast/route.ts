import { NextRequest, NextResponse } from 'next/server';
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
            return NextResponse.json({
              success: true,
              declined: false,
              cached: true,
              roast: existingScan.roast,
              scanId: targetIdOrSlug,
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

    return NextResponse.json({
      success: true,
      declined: false,
      roast: {
        lines: roast.lines,
        takeaway: roast.takeaway,
      },
      scanId: targetIdOrSlug || existingScan?.shareSlug,
    });
  } catch (error: any) {
    console.error('Roast generation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
