import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { performScan } from '@/lib/llm';
import { validateIdeaText, generateSlug } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { checkEntitlement, incrementFeatureUsage } from '@/lib/checkEntitlement';
import { DevStore } from '@/lib/dev-store';
import { SupabaseDB } from '@/lib/supabase/db';
import { recordScanEvent } from '@/lib/scan-events';

export async function POST(req: NextRequest) {
  try {
    // 1. User session & Centralized Entitlement Check
    const session = await getSession();
    const userId = session?.userId || null;

    const access = await checkEntitlement(userId, 'ideaScans');
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.reason === 'SIGN_IN_REQUIRED'
              ? 'Sign in to scan your SaaS idea.'
              : 'Scan limit reached. Upgrade to continue.',
          paywall: access.reason,
        },
        { status: access.reason === 'SIGN_IN_REQUIRED' ? 401 : 402 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validation = validateIdeaText(body.ideaText);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Perform the scan via LLM with live web search
    const result = await performScan(validation.sanitized!);

    const fallbackSlug = generateSlug();
    const scanId = fallbackSlug;
    const shareSlug = fallbackSlug;
    const createdAt = new Date();

    // 2. Save to Supabase (and fallback to DevStore / Mongo)
    await SupabaseDB.saveScan({
      userId: userId || null,
      ideaText: validation.sanitized!,
      competitors: result.competitors,
      saturationScore: result.saturationScore,
      saturationReasoning: result.saturationReasoning,
      gapAnalysis: result.gapAnalysis,
      shareSlug: fallbackSlug,
    });

    // 3. Atomically record usage
    try {
      if (userId) {
        await incrementFeatureUsage(userId, 'ideaScans');
        await recordScanEvent('idea_scanner', userId);
      }
    } catch (usageErr) {
      console.warn('Usage recording error:', (usageErr as Error).message);
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: scanId,
        ideaText: validation.sanitized,
        competitors: result.competitors,
        saturationScore: result.saturationScore,
        saturationReasoning: result.saturationReasoning,
        gapAnalysis: result.gapAnalysis,
        shareSlug: shareSlug,
        createdAt: createdAt,
      },
    });
  } catch (error) {
    console.error('Scan error:', error);
    const message = error instanceof Error ? error.message : 'Something went sideways. The robots are looking into it. Try again in a minute.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
