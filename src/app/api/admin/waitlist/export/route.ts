import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { WaitlistDB } from '@/lib/waitlistDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const csvContent = await WaitlistDB.getConfirmedCsv();
    const filename = `ismysaastaken-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('[AdminWaitlistExport] Error generating CSV:', err);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
