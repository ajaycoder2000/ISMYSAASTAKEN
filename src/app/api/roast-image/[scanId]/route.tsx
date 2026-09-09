import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { SupabaseDB } from '@/lib/supabase/db';

export const runtime = 'nodejs';
export const contentType = 'image/png';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const customLine = searchParams.get('line');
  const lineIndexStr = searchParams.get('lineIndex');
  const lineIndex = lineIndexStr ? parseInt(lineIndexStr, 10) : 0;

  let ideaText = 'My SaaS Concept';
  let selectedLine = customLine ? customLine.trim() : '';
  let takeaway = 'The actual takeaway: Carve out a defensible moat before writing code.';

  try {
    const scan = await SupabaseDB.getScanByIdOrSlug(scanId);
    if (scan) {
      ideaText = scan.ideaText || ideaText;
      if (!selectedLine) {
        if (scan.roast?.lines && scan.roast.lines.length > 0) {
          const safeIndex = Math.min(
            Math.max(0, isNaN(lineIndex) ? 0 : lineIndex),
            scan.roast.lines.length - 1
          );
          selectedLine = scan.roast.lines[safeIndex];
        }
      }
      if (scan.roast?.takeaway) {
        takeaway = scan.roast.takeaway;
      }
    }
  } catch (err) {
    console.warn('Error loading scan for roast image:', err);
  }

  if (!selectedLine) {
    selectedLine =
      'Building this in 2026 is like opening a lemonade stand in the middle of a hurricane.';
  }

  // Clean up takeaway prefix if already present
  const cleanTakeaway = takeaway.replace(/^The actual takeaway:\s*/i, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(249, 115, 22, 0.22) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(220, 38, 38, 0.16) 0%, transparent 55%)',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '4px',
                backgroundColor: '#f97316',
              }}
            />
            <span
              style={{
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#f4f4f5',
              }}
            >
              ismysaas<span style={{ color: '#f97316' }}>taken</span>
              <span style={{ color: '#10b981' }}>?</span>
            </span>
          </div>

          {/* Roast Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(124, 45, 18, 0.35)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
            }}
          >
            <span style={{ fontSize: '15px' }}>🔥</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#fb923c',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              Idea Roast Verdict
            </span>
          </div>
        </div>

        {/* Target Idea Label & Quote */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '2.5px',
            }}
          >
            Target Concept
          </span>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#a1a1aa',
              lineHeight: 1.3,
            }}
          >
            &ldquo;{ideaText.slice(0, 110)}
            {ideaText.length > 110 ? '...' : ''}&rdquo;
          </div>
        </div>

        {/* Center: Featured Roast Punchline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 32px',
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
            borderRadius: '20px',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                lineHeight: 1,
                color: '#f97316',
                fontFamily: 'Georgia, serif',
                marginTop: '-4px',
              }}
            >
              &ldquo;
            </span>
            <div
              style={{
                fontSize: selectedLine.length > 120 ? '30px' : '36px',
                fontWeight: 800,
                lineHeight: 1.3,
                color: '#ffedd5',
                letterSpacing: '-0.3px',
              }}
            >
              {selectedLine}
            </div>
          </div>
        </div>

        {/* Constructive Takeaway Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 24px',
            backgroundColor: 'rgba(20, 20, 22, 0.95)',
            borderRadius: '12px',
            border: '1px solid #27272a',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            The actual takeaway
          </span>
          <span
            style={{
              fontSize: '15px',
              color: '#d4d4d8',
              lineHeight: 1.4,
            }}
          >
            {cleanTakeaway}
          </span>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '6px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#71717a',
              fontFamily: 'monospace',
            }}
          >
            ismysaastaken.com/scan/{scanId}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: '#52525b',
              fontFamily: 'monospace',
            }}
          >
            Roasts the market, never the founder.
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
