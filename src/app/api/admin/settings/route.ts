import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin';
import dbConnect from '@/lib/mongodb';
import SiteConfigModel, { getSiteConfig } from '@/models/SiteConfig';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await dbConnect();
    const config = await getSiteConfig();
    return NextResponse.json({
      success: true,
      data: {
        freeTierMonthlyLimit: config.freeTierMonthlyLimit,
        proMonthlyPrice: config.proMonthlyPrice,
        proYearlyPrice: config.proYearlyPrice,
        estimatedCostPerScan: config.estimatedCostPerScan,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
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
    const { freeTierMonthlyLimit, proMonthlyPrice, proYearlyPrice, estimatedCostPerScan } = body;

    let config = await SiteConfigModel.findOne();
    if (!config) {
      config = new SiteConfigModel();
    }

    if (typeof freeTierMonthlyLimit === 'number' && freeTierMonthlyLimit >= 0) {
      config.freeTierMonthlyLimit = freeTierMonthlyLimit;
    }
    if (typeof proMonthlyPrice === 'number' && proMonthlyPrice >= 0) {
      config.proMonthlyPrice = proMonthlyPrice;
    }
    if (typeof proYearlyPrice === 'number' && proYearlyPrice >= 0) {
      config.proYearlyPrice = proYearlyPrice;
    }
    if (typeof estimatedCostPerScan === 'number' && estimatedCostPerScan >= 0) {
      config.estimatedCostPerScan = estimatedCostPerScan;
    }

    await config.save();

    await logAdminAction({
      adminUserId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'CONFIG_UPDATE',
      note: `Updated SiteConfig: freeLimit=${config.freeTierMonthlyLimit}, proMonthly=$${config.proMonthlyPrice}, proYearly=$${config.proYearlyPrice}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        freeTierMonthlyLimit: config.freeTierMonthlyLimit,
        proMonthlyPrice: config.proMonthlyPrice,
        proYearlyPrice: config.proYearlyPrice,
        estimatedCostPerScan: config.estimatedCostPerScan,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
