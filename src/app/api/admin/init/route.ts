import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { logAdminAction } from '@/lib/admin';

export async function POST() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Please sign in first' }, { status: 401 });
  }

  try {
    await dbConnect();
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Allow setting admin if no admins exist or if running locally
    if (adminCount === 0 || process.env.NODE_ENV !== 'production') {
      const user = await User.findByIdAndUpdate(
        session.userId,
        { role: 'admin' },
        { new: true }
      );

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await logAdminAction({
        adminUserId: user._id.toString(),
        adminEmail: user.email,
        action: 'ADMIN_INITIALIZED',
        note: `Granted initial admin privileges to ${user.email}`,
      });

      return NextResponse.json({
        success: true,
        message: `Admin role granted to ${user.email}. You can now access /admin.`,
      });
    }

    return NextResponse.json({ error: 'Admin already initialized' }, { status: 403 });
  } catch (error) {
    console.error('Admin init error:', error);
    return NextResponse.json({ error: 'Failed to initialize admin' }, { status: 500 });
  }
}
