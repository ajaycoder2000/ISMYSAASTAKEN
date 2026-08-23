import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const verdict = searchParams.get('verdict')?.trim() || '';
    const featured = searchParams.get('featured')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const query: Record<string, unknown> = {};
    if (search) {
      query.ideaText = { $regex: search, $options: 'i' };
    }
    if (verdict && ['low', 'medium', 'high'].includes(verdict)) {
      query.saturationScore = verdict;
    }
    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = { $ne: true };
    }

    const skip = (page - 1) * limit;
    const [scans, total] = await Promise.all([
      Scan.find(query)
        .populate('userId', 'email plan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Scan.countDocuments(query),
    ]);

    const serialized = scans.map((s) => ({
      _id: s._id.toString(),
      ideaText: s.ideaText,
      saturationScore: s.saturationScore,
      saturationReasoning: s.saturationReasoning,
      gapAnalysis: s.gapAnalysis,
      competitorsCount: s.competitors?.length || 0,
      competitors: s.competitors,
      shareSlug: s.shareSlug,
      featured: !!s.featured,
      createdAt: s.createdAt,
      user: s.userId
        ? {
            email: (s.userId as { email?: string }).email,
            plan: (s.userId as { plan?: string }).plan,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin scans error:', error);
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { scanId, featured } = body;

    if (!scanId || typeof featured !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const scan = await Scan.findByIdAndUpdate(scanId, { featured }, { new: true });
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: featured ? 'SCAN_FEATURED' : 'SCAN_UNFEATURED',
      targetId: scanId,
      targetType: 'Scan',
      note: `Toggled featured to ${featured} for "${scan.ideaText.slice(0, 40)}..."`,
    });

    return NextResponse.json({ success: true, data: scan });
  } catch (error) {
    console.error('Admin toggle scan error:', error);
    return NextResponse.json({ error: 'Failed to update scan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get('id');

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
    }

    const scan = await Scan.findByIdAndDelete(scanId);
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'SCAN_DELETE',
      targetId: scanId,
      targetType: 'Scan',
      note: `Deleted scan "${scan.ideaText.slice(0, 40)}..."`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete scan error:', error);
    return NextResponse.json({ error: 'Failed to delete scan' }, { status: 500 });
  }
}
