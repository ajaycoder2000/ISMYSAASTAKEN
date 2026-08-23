import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { performScan } from '@/lib/llm';
import { validateIdeaText, generateSlug } from '@/lib/utils';
import { checkRateLimit, recordScanUsage } from '@/lib/rate-limit';
import { DevStore } from '@/lib/dev-store';

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit();
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimit.reason, rateLimited: true },
        { status: 429 }
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
    let scanId = fallbackSlug;
    let shareSlug = fallbackSlug;
    const createdAt = new Date();

    // Save to database or DevStore
    let savedInDb = false;
    try {
      const conn = await dbConnect();
      if (conn) {
        const scan = await Scan.create({
          userId: rateLimit.userId && rateLimit.userId.length === 24 ? rateLimit.userId : null,
          ideaText: validation.sanitized,
          ...result,
          shareSlug: fallbackSlug,
        });
        scanId = scan._id.toString();
        shareSlug = scan.shareSlug;
        savedInDb = true;
      }
    } catch (dbErr) {
      console.warn('MongoDB save fallback to DevStore:', (dbErr as Error).message);
    }

    if (!savedInDb) {
      const devScan = DevStore.createScan({
        userId: rateLimit.userId || null,
        ideaText: validation.sanitized!,
        competitors: result.competitors,
        saturationScore: result.saturationScore,
        saturationReasoning: result.saturationReasoning,
        gapAnalysis: result.gapAnalysis,
        shareSlug: fallbackSlug,
        featured: false,
      });
      scanId = devScan._id;
      shareSlug = devScan.shareSlug;
    }

    // Record usage
    try {
      await recordScanUsage(rateLimit.userId);
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
