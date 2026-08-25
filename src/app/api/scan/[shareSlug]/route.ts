import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareSlug: string }> }
) {
  try {
    const { shareSlug } = await params;
    const scan = await SupabaseDB.getScanBySlug(shareSlug);

    if (scan) {
      return NextResponse.json({
        success: true,
        data: scan,
      });
    }

    return NextResponse.json(
      { success: false, error: "This scan doesn't exist. Maybe the link is wrong, or maybe it was a fever dream." },
      { status: 404 }
    );
  } catch (error) {
    console.error('Fetch scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load scan results.' },
      { status: 500 }
    );
  }
}
