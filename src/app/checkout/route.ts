import { Checkout } from '@dodopayments/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const returnUrl =
  process.env.DODO_PAYMENTS_RETURN_URL ||
  process.env.NEXT_PUBLIC_DODO_RETURN_URL ||
  'https://ismysaastaken.vercel.app/checkout/success';
const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode';

let cachedSessionHandler: ((req: NextRequest) => Promise<NextResponse<unknown>>) | null = null;
let cachedStaticHandler: ((req: NextRequest) => Promise<NextResponse<unknown>>) | null = null;

function getSessionHandler(apiKey: string) {
  if (!cachedSessionHandler) {
    cachedSessionHandler = Checkout({
      bearerToken: apiKey,
      returnUrl,
      environment,
      type: 'session',
    });
  }
  return cachedSessionHandler;
}

function getStaticHandler(apiKey: string) {
  if (!cachedStaticHandler) {
    cachedStaticHandler = Checkout({
      bearerToken: apiKey,
      returnUrl,
      environment,
      type: 'static',
    });
  }
  return cachedStaticHandler;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    console.warn('[Dodo Payments] DODO_PAYMENTS_API_KEY is not configured.');
    return NextResponse.json(
      { error: 'DODO_PAYMENTS_API_KEY is not configured. Please set it in .env.local or Vercel.' },
      { status: 500 }
    );
  }
  const handler = getSessionHandler(apiKey);
  return handler(req);
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    console.warn('[Dodo Payments] DODO_PAYMENTS_API_KEY is not configured.');
    return NextResponse.json(
      { error: 'DODO_PAYMENTS_API_KEY is not configured. Please set it in .env.local or Vercel.' },
      { status: 500 }
    );
  }
  const handler = getStaticHandler(apiKey);
  return handler(req);
}
