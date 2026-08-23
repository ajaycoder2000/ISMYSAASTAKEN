import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import { DevStore } from '@/lib/dev-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in to view your scan history.' }, { status: 401 });
    }

    try {
      const conn = await dbConnect();
      if (conn) {
        const scans = await Scan.find({ userId: session.userId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        
        const serialized = scans.map(s => ({
          _id: s._id.toString(),
          ideaText: s.ideaText,
          saturationScore: s.saturationScore,
          shareSlug: s.shareSlug,
          competitorCount: s.competitors?.length || 0,
          createdAt: s.createdAt,
        }));
        
        return NextResponse.json({ scans: serialized });
      }
    } catch {
      // Fallback to DevStore
    }

    const devScans = DevStore.getAllScans()
      .filter((s) => s.userId === session.userId)
      .map((s) => ({
        _id: s._id,
        ideaText: s.ideaText,
        saturationScore: s.saturationScore,
        shareSlug: s.shareSlug,
        competitorCount: s.competitors?.length || 0,
        createdAt: s.createdAt,
      }));

    return NextResponse.json({ scans: devScans });
  } catch (error) {
    console.error('Scan history error:', error);
    return NextResponse.json({ error: 'Failed to load scan history.' }, { status: 500 });
  }
}
