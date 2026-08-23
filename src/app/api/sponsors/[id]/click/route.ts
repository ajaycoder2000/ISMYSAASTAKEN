import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sponsor from '@/models/Sponsor';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    await Sponsor.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track sponsor click error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
