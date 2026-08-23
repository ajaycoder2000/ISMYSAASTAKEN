import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';
import dbConnect from '@/lib/mongodb';
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
    const plan = searchParams.get('plan')?.trim() || '';
    const role = searchParams.get('role')?.trim() || '';
    const suspended = searchParams.get('suspended')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const query: Record<string, unknown> = {};
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    if (plan && ['free', 'pro'].includes(plan)) {
      query.plan = plan;
    }
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }
    if (suspended === 'true') {
      query.suspended = true;
    } else if (suspended === 'false') {
      query.suspended = { $ne: true };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const serialized = users.map((u) => ({
      _id: u._id.toString(),
      email: u.email,
      role: u.role || 'user',
      plan: u.plan,
      suspended: !!u.suspended,
      adminNotes: u.adminNotes || '',
      scansUsedThisMonth: u.scansUsedThisMonth || 0,
      scansResetDate: u.scansResetDate,
      stripeCustomerId: u.stripeCustomerId,
      createdAt: u.createdAt,
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
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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
    const { userId, plan, suspended, role, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const logActions: string[] = [];

    // Plan override
    if (plan && ['free', 'pro'].includes(plan) && plan !== user.plan) {
      updates.plan = plan;
      logActions.push(`Changed plan from ${user.plan} to ${plan}`);
    }

    // Suspension toggle
    if (typeof suspended === 'boolean' && suspended !== user.suspended) {
      updates.suspended = suspended;
      logActions.push(suspended ? 'Suspended user' : 'Unsuspended user');
    }

    // Role change
    if (role && ['user', 'admin'].includes(role) && role !== user.role) {
      // Prevent removing own admin role by accident
      if (user._id.toString() === admin._id.toString() && role !== 'admin') {
        return NextResponse.json({ error: 'Cannot revoke your own admin role' }, { status: 400 });
      }
      updates.role = role;
      logActions.push(`Changed role to ${role}`);
    }

    // Admin notes
    if (note !== undefined) {
      updates.adminNotes = note;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, data: user });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'USER_UPDATE',
      targetId: userId,
      targetType: 'User',
      note: `${logActions.join(', ')}. Admin note: ${note || 'None'}`,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
