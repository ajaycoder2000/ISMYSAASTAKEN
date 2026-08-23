import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';

export async function GET() {
  try {
    await dbConnect();
    // Prioritize featured scans first, then most recent scans
    const scans = await Scan.find()
      .sort({ featured: -1, createdAt: -1 })
      .limit(10)
      .lean();

    const serialized = scans.map((s) => ({
      _id: s._id.toString(),
      ideaText: s.ideaText,
      saturationScore: s.saturationScore,
      competitorsCount: s.competitors?.length || 0,
      shareSlug: s.shareSlug,
      featured: !!s.featured,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Fetch recent scans error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
