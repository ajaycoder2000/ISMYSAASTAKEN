import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AdminLog from '@/models/AdminLog';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    const serialized = logs.map((l) => ({
      _id: l._id.toString(),
      adminEmail: l.adminEmail,
      action: l.action,
      targetId: l.targetId,
      targetType: l.targetType,
      note: l.note,
      timestamp: l.timestamp,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Admin logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
