import dbConnect from './mongodb';
import AdminLog from '@/models/AdminLog';
import User from '@/models/User';
import Scan from '@/models/Scan';
import Sponsor from '@/models/Sponsor';
import { getSiteConfig } from '@/models/SiteConfig';

export async function logAdminAction(params: {
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  targetType?: string;
  note?: string;
}) {
  try {
    await dbConnect();
    await AdminLog.create({
      ...params,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write admin log:', error);
  }
}

export async function getAdminDashboardStats() {
  await dbConnect();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalScans,
    scansToday,
    scans7d,
    scans30d,
    totalUsers,
    proUsers,
    freeUsers,
    suspendedUsers,
    activeSponsors,
    totalSponsors,
    recentLogs,
    config,
  ] = await Promise.all([
    Scan.countDocuments(),
    Scan.countDocuments({ createdAt: { $gte: startOfToday } }),
    Scan.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Scan.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments(),
    User.countDocuments({ plan: 'pro' }),
    User.countDocuments({ plan: 'free' }),
    User.countDocuments({ suspended: true }),
    Sponsor.countDocuments({ active: true }),
    Sponsor.countDocuments(),
    AdminLog.find().sort({ timestamp: -1 }).limit(10).lean(),
    getSiteConfig(),
  ]);

  const costPerScan = config.estimatedCostPerScan || 0.02;
  const estimatedSpendMonth = (scans30d * costPerScan).toFixed(2);
  const estimatedSpendTotal = (totalScans * costPerScan).toFixed(2);
  const currentMRR = proUsers * (config.proMonthlyPrice || 12);

  return {
    scans: {
      total: totalScans,
      today: scansToday,
      last7d: scans7d,
      last30d: scans30d,
    },
    users: {
      total: totalUsers,
      pro: proUsers,
      free: freeUsers,
      suspended: suspendedUsers,
    },
    sponsors: {
      active: activeSponsors,
      total: totalSponsors,
    },
    financials: {
      currentMRR,
      proPriceMonthly: config.proMonthlyPrice || 12,
      estimatedCostPerScan: costPerScan,
      estimatedSpendMonth,
      estimatedSpendTotal,
    },
    recentLogs: recentLogs.map((l) => ({
      _id: l._id.toString(),
      adminEmail: l.adminEmail,
      action: l.action,
      targetId: l.targetId,
      targetType: l.targetType,
      note: l.note,
      timestamp: l.timestamp,
    })),
  };
}
