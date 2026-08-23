import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function GET() {
  try {
    await dbConnect();
    const sponsors = await Sponsor.find({ active: true })
      .sort({ priority: -1, createdAt: -1 })
      .limit(20)
      .lean();

    // Increment impressions asynchronously
    if (sponsors.length > 0) {
      const ids = sponsors.map((s) => s._id);
      Sponsor.updateMany({ _id: { $in: ids } }, { $inc: { impressions: 1 } }).catch(() => {});
    }

    const serialized = sponsors.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      url: s.url,
      description: s.description,
      iconText: s.iconText || '⚡',
      tier: s.tier,
      priority: s.priority,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Fetch public sponsors error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
