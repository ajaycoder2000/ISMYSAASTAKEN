import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDB } from '@/lib/supabase/db';
import { getSession } from '@/lib/auth';
import { checkNewToolsAccess, incrementNewToolsUsage } from '@/lib/checkNewToolsAccess';

export const dynamic = 'force-dynamic';

const CACHE_TTL_HOURS = 24;
const TLDS = ['com', 'io', 'co', 'app'] as const;

interface DomainCheckResult {
  domain: string;
  tld: string;
  available: boolean | null; // true = available, false = taken, null = couldn't verify
}

interface HandleCheckResult {
  platform: string;
  url: string;
  likelyAvailable: boolean | null; // true = likely available, false = likely taken, null = couldn't verify
}

const PLATFORMS: { name: string; urlTemplate: string }[] = [
  { name: 'X (Twitter)', urlTemplate: 'https://x.com/{handle}' },
  { name: 'Instagram', urlTemplate: 'https://www.instagram.com/{handle}/' },
  { name: 'TikTok', urlTemplate: 'https://www.tiktok.com/@{handle}' },
  { name: 'GitHub', urlTemplate: 'https://github.com/{handle}' },
];

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.name === 'string' ? body.name : '';
    const cleanName = normalizeName(rawName);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter a name with at least 2 alphanumeric characters.' },
        { status: 400 }
      );
    }

    if (cleanName.length > 40) {
      return NextResponse.json(
        { error: 'Name is too long. Please keep under 40 characters.' },
        { status: 400 }
      );
    }

    // --- 1. User session & Freemium Gating Check ---
    const session = await getSession();
    const userId = session?.userId || null;

    const access = await checkNewToolsAccess(userId);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            access.reason === 'SIGN_IN_REQUIRED'
              ? 'Sign in to use this tool.'
              : 'Free scan used. Upgrade to continue.',
          paywall: access.reason,
        },
        { status: access.reason === 'SIGN_IN_REQUIRED' ? 401 : 402 }
      );
    }

    // --- 2. Check 24-Hour Cache ---
    const cached = await SupabaseDB.getNameCheckCache(cleanName);
    const isFresh =
      cached &&
      Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_HOURS * 60 * 60 * 1000;

    if (isFresh && cached.results) {
      if (userId) {
        await incrementNewToolsUsage(userId);
      }
      return NextResponse.json({
        success: true,
        name: cleanName,
        domains: cached.results.domains || [],
        handles: cached.results.handles || [],
        fromCache: true,
        fetchedAt: cached.fetched_at,
      });
    }

    // --- 3. Fresh check: Domains + Social Handles in Parallel ---
    const [domainResults, handleResults] = await Promise.all([
      checkAllDomains(cleanName),
      checkAllHandles(cleanName),
    ]);

    const results = {
      domains: domainResults,
      handles: handleResults,
    };

    // --- 4. Save to Cache & Record Usage ---
    await SupabaseDB.saveNameCheckCache(cleanName, results);
    if (userId) {
      await incrementNewToolsUsage(userId);
    }

    return NextResponse.json({
      success: true,
      name: cleanName,
      ...results,
      fromCache: false,
    });
  } catch (error) {
    console.error('Name check API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal name-check error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DOMAIN AVAILABILITY VIA RDAP (Official, Free, No API Key)
// ============================================================================
async function checkAllDomains(name: string): Promise<DomainCheckResult[]> {
  const checks = TLDS.map(async (tld) => {
    const domain = `${name}.${tld}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // rdap.org routes automatically to the official authoritative registry
      const res = await fetch(`https://rdap.org/domain/${domain}`, {
        method: 'GET',
        headers: {
          Accept: 'application/rdap+json, application/json',
          'User-Agent': 'IsMySaaSTaken-RDAPBot/1.0 (+https://ismysaastaken.vercel.app)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // RDAP standard: 404 means the domain is NOT registered (Available)
      // 200 means registered (Taken)
      if (res.status === 404) {
        return { domain, tld, available: true };
      }
      if (res.status === 200) {
        return { domain, tld, available: false };
      }

      // If status is 429, 500 or redirect loop, mark as unknown
      return { domain, tld, available: null };
    } catch {
      // Timeout or DNS error -> neutral state
      return { domain, tld, available: null };
    }
  });

  return Promise.all(checks);
}

// ============================================================================
// SOCIAL HANDLE PROBING (Unofficial Heuristic)
// ============================================================================
async function checkAllHandles(handle: string): Promise<HandleCheckResult[]> {
  const checks = PLATFORMS.map(async ({ name, urlTemplate }) => {
    const url = urlTemplate.replace('{handle}', handle);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        method: 'GET',
        redirect: 'manual', // Do not follow redirects so we can detect status code
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      clearTimeout(timeoutId);

      // Status 404 on profile endpoint generally indicates the handle is unclaimed
      if (res.status === 404) {
        return { platform: name, url, likelyAvailable: true };
      }

      // 200 or 301/302 redirect indicates an active profile exists
      if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
        return { platform: name, url, likelyAvailable: false };
      }

      // 403, 429 or anti-bot challenge: neutral unverified state
      return { platform: name, url, likelyAvailable: null };
    } catch {
      return { platform: name, url, likelyAvailable: null };
    }
  });

  return Promise.all(checks);
}


