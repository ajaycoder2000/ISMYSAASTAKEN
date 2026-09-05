import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { DevStore } from '@/lib/dev-store';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { logAdminAction } from '@/lib/admin';

export async function GET(req: NextRequest) {
  // 1. Independent Server-side Admin Verification
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const plan = searchParams.get('plan')?.trim() || '';
    const role = searchParams.get('role')?.trim() || '';
    const pageParam = parseInt(searchParams.get('page') ?? '0', 10);
    // Support 0-indexed or 1-indexed page
    const page = pageParam > 0 ? pageParam - 1 : Math.max(0, pageParam);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '50', 10)));

    const supabase = getSupabaseAdmin();

    // 2. Try Supabase profiles or users table
    if (supabase) {
      let tableName: 'profiles' | 'users' = 'profiles';

      // Verify if profiles table exists and has data, otherwise use users table
      const { data: testProfiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (profilesErr || testProfiles === null) {
        tableName = 'users';
      }

      let query = supabase
        .from(tableName)
        .select('id, email, plan, created_at, new_tools_scans_used, scans_used_this_month, plan_expires_at, is_admin, role, suspended', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (search) {
        query = query.ilike('email', `%${search}%`);
      }
      if (plan) {
        query = query.eq('plan', plan);
      }
      if (role) {
        query = query.eq('role', role);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const serialized = data.map((u: any) => ({
          _id: u.id,
          id: u.id,
          email: u.email,
          plan: u.plan || 'free',
          created_at: u.created_at,
          createdAt: u.created_at,
          new_tools_scans_used: u.new_tools_scans_used ?? 0,
          scans_used_this_month: u.scans_used_this_month ?? 0,
          scansUsedThisMonth: u.scans_used_this_month ?? 0,
          plan_expires_at: u.plan_expires_at ?? null,
          is_admin: !!u.is_admin || u.role === 'admin',
          role: u.role || (u.is_admin ? 'admin' : 'user'),
          suspended: !!u.suspended,
        }));

        return NextResponse.json({
          success: true,
          users: serialized,
          data: serialized,
          total: count ?? serialized.length,
          pagination: {
            page: page + 1,
            pageSize,
            total: count ?? serialized.length,
            totalPages: Math.ceil((count ?? serialized.length) / pageSize),
          },
        });
      }
    }

    // 3. Fallback: MongoDB and DevStore
    await dbConnect();
    const mongoQuery: Record<string, unknown> = {};
    if (search) {
      mongoQuery.email = { $regex: search, $options: 'i' };
    }
    if (plan) {
      mongoQuery.plan = plan;
    }

    const [mongoUsers, mongoCount] = await Promise.all([
      User.find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(pageSize)
        .lean()
        .catch(() => []),
      User.countDocuments(mongoQuery).catch(() => 0),
    ]);

    if (mongoUsers.length > 0) {
      const serialized = mongoUsers.map((u: any) => ({
        _id: u._id.toString(),
        id: u._id.toString(),
        email: u.email,
        plan: u.plan,
        created_at: u.createdAt,
        createdAt: u.createdAt,
        new_tools_scans_used: u.new_tools_scans_used ?? 0,
        scans_used_this_month: u.scansUsedThisMonth ?? 0,
        scansUsedThisMonth: u.scansUsedThisMonth ?? 0,
        plan_expires_at: u.plan_expires_at ?? null,
        is_admin: u.role === 'admin',
        role: u.role || 'user',
        suspended: !!u.suspended,
      }));

      return NextResponse.json({
        success: true,
        users: serialized,
        data: serialized,
        total: mongoCount,
        pagination: {
          page: page + 1,
          pageSize,
          total: mongoCount,
          totalPages: Math.ceil(mongoCount / pageSize),
        },
      });
    }

    // 4. DevStore Fallback
    const devUsers = DevStore.getAllUsers();
    let filtered = devUsers;
    if (search) {
      filtered = filtered.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));
    }
    if (plan) {
      filtered = filtered.filter((u) => u.plan === plan);
    }

    const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
    const serialized = paginated.map((u) => ({
      _id: u._id,
      id: u._id,
      email: u.email,
      plan: u.plan,
      created_at: u.createdAt,
      createdAt: u.createdAt,
      new_tools_scans_used: u.new_tools_scans_used ?? 0,
      scans_used_this_month: u.scansUsedThisMonth ?? 0,
      scansUsedThisMonth: u.scansUsedThisMonth ?? 0,
      plan_expires_at: u.plan_expires_at ?? null,
      is_admin: u.is_admin || u.role === 'admin',
      role: u.role,
      suspended: !!u.suspended,
    }));

    return NextResponse.json({
      success: true,
      users: serialized,
      data: serialized,
      total: filtered.length,
      pagination: {
        page: page + 1,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminAuth = await verifyAdminAccess();
  if (!adminAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, plan, suspended, role, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const updates: Record<string, any> = {};
      if (plan) updates.plan = plan;
      if (typeof suspended === 'boolean') updates.suspended = suspended;
      if (role) {
        updates.role = role;
        updates.is_admin = role === 'admin';
      }
      if (note !== undefined) updates.admin_notes = note;

      // Update profiles and users
      try {
        await supabase.from('profiles').update(updates).eq('id', userId);
      } catch {}
      try {
        await supabase.from('users').update(updates).or(`id.eq.${userId},clerk_id.eq.${userId}`);
      } catch {}
    }

    // DevStore and MongoDB
    await dbConnect();
    const updates: Record<string, any> = {};
    if (plan) updates.plan = plan;
    if (typeof suspended === 'boolean') updates.suspended = suspended;
    if (role) updates.role = role;
    if (note !== undefined) updates.adminNotes = note;

    await User.findByIdAndUpdate(userId, updates).catch(() => {});

    await logAdminAction({
      adminUserId: adminAuth.adminId || 'admin',
      adminEmail: adminAuth.adminEmail || 'admin@ismysaastaken.com',
      action: 'USER_UPDATE',
      targetId: userId,
      targetType: 'User',
      note: note || 'User details updated by admin',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}
