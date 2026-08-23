import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { getAdminDashboardStats } from '@/lib/admin';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const stats = await getAdminDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
