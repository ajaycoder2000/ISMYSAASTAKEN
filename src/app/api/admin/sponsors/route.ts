import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const sponsors = await Sponsor.find().sort({ priority: -1, createdAt: -1 }).lean();
    const serialized = sponsors.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      url: s.url,
      description: s.description,
      iconText: s.iconText || '⚡',
      tier: s.tier,
      active: s.active,
      priority: s.priority || 0,
      impressions: s.impressions || 0,
      clicks: s.clicks || 0,
      ctr: s.impressions > 0 ? ((s.clicks / s.impressions) * 100).toFixed(1) : '0.0',
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Admin sponsors error:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { name, url, description, iconText, tier, priority, active } = body;

    if (!name || !url || !description) {
      return NextResponse.json({ error: 'Name, URL, and Description are required' }, { status: 400 });
    }

    const sponsor = await Sponsor.create({
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      iconText: iconText?.trim() || '⚡',
      tier: tier === 'featured' ? 'featured' : 'starter',
      priority: typeof priority === 'number' ? priority : 0,
      active: typeof active === 'boolean' ? active : true,
    });

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'SPONSOR_CREATE',
      targetId: sponsor._id.toString(),
      targetType: 'Sponsor',
      note: `Created sponsor "${sponsor.name}" (${sponsor.tier})`,
    });

    return NextResponse.json({ success: true, data: sponsor }, { status: 201 });
  } catch (error) {
    console.error('Admin create sponsor error:', error);
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { _id, name, url, description, iconText, tier, priority, active } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Missing sponsor ID' }, { status: 400 });
    }

    const sponsor = await Sponsor.findByIdAndUpdate(
      _id,
      {
        ...(name ? { name: name.trim() } : {}),
        ...(url ? { url: url.trim() } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(iconText !== undefined ? { iconText: iconText.trim() || '⚡' } : {}),
        ...(tier ? { tier } : {}),
        ...(typeof priority === 'number' ? { priority } : {}),
        ...(typeof active === 'boolean' ? { active } : {}),
      },
      { new: true }
    );

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'SPONSOR_UPDATE',
      targetId: sponsor._id.toString(),
      targetType: 'Sponsor',
      note: `Updated sponsor "${sponsor.name}"`,
    });

    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    console.error('Admin update sponsor error:', error);
    return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 });
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
    const sponsorId = searchParams.get('id');

    if (!sponsorId) {
      return NextResponse.json({ error: 'Missing sponsor ID' }, { status: 400 });
    }

    const sponsor = await Sponsor.findByIdAndDelete(sponsorId);
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'SPONSOR_DELETE',
      targetId: sponsorId,
      targetType: 'Sponsor',
      note: `Deleted sponsor "${sponsor.name}"`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete sponsor error:', error);
    return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 });
  }
}
