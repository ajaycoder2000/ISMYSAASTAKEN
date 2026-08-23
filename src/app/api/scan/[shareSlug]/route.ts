import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { DevStore } from '@/lib/dev-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareSlug: string }> }
) {
  try {
    const { shareSlug } = await params;
    
    try {
      const conn = await dbConnect();
      if (conn) {
        const scan = await Scan.findOne({ shareSlug }).lean();
        if (scan) {
          return NextResponse.json({
            success: true,
            data: {
              _id: scan._id.toString(),
              ideaText: scan.ideaText,
              competitors: scan.competitors,
              saturationScore: scan.saturationScore,
              saturationReasoning: scan.saturationReasoning,
              gapAnalysis: scan.gapAnalysis,
              shareSlug: scan.shareSlug,
              createdAt: scan.createdAt,
            },
          });
        }
      }
    } catch {
      // fallback
    }

    const devScan = DevStore.findScanBySlug(shareSlug);
    if (devScan) {
      return NextResponse.json({
        success: true,
        data: devScan,
      });
    }

    return NextResponse.json(
      { success: false, error: "This scan doesn't exist. Maybe the link is wrong, or maybe it was a fever dream." },
      { status: 404 }
    );
  } catch (error) {
    console.error('Fetch scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load scan results.' },
      { status: 500 }
    );
  }
}
