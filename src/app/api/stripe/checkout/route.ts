import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { getBaseUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    }
    
    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required.' }, { status: 400 });
    }
    
    const url = await createCheckoutSession(session.userId, session.email, priceId, getBaseUrl());
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
