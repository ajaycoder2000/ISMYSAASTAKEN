import { Checkout } from '@dodopayments/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getReturnUrl() {
  return (
    process.env.DODO_PAYMENTS_RETURN_URL ||
    process.env.NEXT_PUBLIC_DODO_RETURN_URL ||
    'https://ismysaastaken.vercel.app/checkout/success'
  );
}

function getEnvironment(): 'live_mode' | 'test_mode' {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (env === 'live_mode' || env === 'test_mode') {
    return env;
  }
  return 'live_mode';
}

let cachedSessionHandler: ((req: NextRequest) => Promise<NextResponse<unknown>>) | null = null;
let cachedStaticHandler: ((req: NextRequest) => Promise<NextResponse<unknown>>) | null = null;
let lastApiKey = '';
let lastEnv = '';

function getSessionHandler(apiKey: string) {
  const env = getEnvironment();
  if (!cachedSessionHandler || lastApiKey !== apiKey || lastEnv !== env) {
    lastApiKey = apiKey;
    lastEnv = env;
    cachedSessionHandler = Checkout({
      bearerToken: apiKey,
      returnUrl: getReturnUrl(),
      environment: env,
      type: 'session',
    });
  }
  return cachedSessionHandler;
}

function getStaticHandler(apiKey: string) {
  const env = getEnvironment();
  if (!cachedStaticHandler || lastApiKey !== apiKey || lastEnv !== env) {
    lastApiKey = apiKey;
    lastEnv = env;
    cachedStaticHandler = Checkout({
      bearerToken: apiKey,
      returnUrl: getReturnUrl(),
      environment: env,
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
