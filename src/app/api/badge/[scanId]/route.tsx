import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { SupabaseDB } from '@/lib/supabase/db';
import { isBadgeEligible } from '@/lib/badge';
import { isScanOwnerBadgeEntitled } from '@/lib/checkEntitlement';

export const runtime = 'nodejs';
export const contentType = 'image/png';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const theme = searchParams.get('theme') || 'dark';

  let eligible = false;
  try {
    const scan = await SupabaseDB.getScanByIdOrSlug(scanId);
    if (scan && isBadgeEligible(scan)) {
      const planAllowsBadge = await isScanOwnerBadgeEntitled(scan.userId || (scan as any).user_id);
      eligible = planAllowsBadge;
    }
  } catch (err) {
    console.warn('Badge lookup failed:', err);
  }

  // Anti-forgery guard: never claim Validated for non-qualifying or missing scans
  if (!eligible) {
    return renderFallbackBadge(theme);
  }

  // Styling based on theme
  const isLight = theme === 'light';
  const isTransparent = theme === 'transparent';

  const bgColor = isLight
    ? '#ffffff'
    : isTransparent
    ? 'rgba(12, 14, 18, 0.45)'
    : '#0c0e12';

  const borderColor = isLight ? 'rgba(16, 185, 129, 0.55)' : 'rgba(16, 185, 129, 0.45)';
  const textColor = isLight ? '#09090b' : '#f4f4f5';
  const subtitleColor = isLight ? '#059669' : '#10b981';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '14px',
          fontFamily: 'sans-serif',
          color: textColor,
          boxShadow: isLight
            ? '0 4px 12px rgba(0, 0, 0, 0.06)'
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Left Side: Checkmark Icon + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Emerald Checkmark Circle */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: isLight
                ? 'rgba(16, 185, 129, 0.14)'
                : 'rgba(16, 185, 129, 0.18)',
              border: `1.5px solid ${subtitleColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: subtitleColor,
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            ✓
          </div>

          {/* Texts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: subtitleColor,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              Validated By
            </span>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>ismysaas</span>
              <span style={{ color: '#f5a623' }}>taken</span>
              <span style={{ color: '#10b981' }}>?</span>
            </div>
          </div>
        </div>

        {/* Right Corner Accent: Verified Dot */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
          }}
        />
      </div>
    ),
    {
      width: 280,
      height: 80,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}

/**
 * Neutral fallback badge for non-qualifying or nonexistent scans.
 * Never falsely claims "Validated".
 */
function renderFallbackBadge(theme: string) {
  const isLight = theme === 'light';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 18px',
          backgroundColor: isLight ? '#f4f4f5' : '#18181b',
          border: `1.5px solid ${isLight ? '#e4e4e7' : '#27272a'}`,
          borderRadius: '14px',
          fontFamily: 'monospace',
          color: isLight ? '#52525b' : '#a1a1aa',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Market Intelligence
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: isLight ? '#09090b' : '#f4f4f5',
            marginTop: '2px',
          }}
        >
          ismysaastaken.vercel.app
        </span>
      </div>
    ),
    {
      width: 280,
      height: 80,
      headers: {
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}
