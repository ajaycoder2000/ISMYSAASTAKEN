import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const result = await SupabaseDB.addSubscriber(email);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        alreadyActive: result.alreadyActive || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
