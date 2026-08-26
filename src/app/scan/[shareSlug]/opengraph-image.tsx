import { ImageResponse } from 'next/og';
import { SupabaseDB } from '@/lib/supabase/db';

export const alt = 'Is My SaaS Taken? — Market Validation Report';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;
  let ideaText = 'Is My SaaS Taken?';
  let saturation = 'MEDIUM';
  let competitorCount = 5;

  try {
    const scan = await SupabaseDB.getScanBySlug(shareSlug);
    if (scan) {
      ideaText = scan.ideaText;
      saturation = (scan.saturationScore || 'medium').toUpperCase();
      competitorCount = scan.competitors?.length || 0;
    }
  } catch {
    // fallback
  }

  const scoreColor =
    saturation === 'LOW'
      ? '#39ff6a'
      : saturation === 'MEDIUM'
      ? '#f5a623'
      : '#ff6759';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          backgroundColor: '#0a0e14',
          backgroundImage:
            'radial-gradient(circle at 90% 10%, rgba(245, 166, 35, 0.12) 0%, transparent 50%)',
          color: '#f3ece2',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#f5a623',
              }}
            />
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
              ismysaas<span style={{ color: '#f5a623' }}>taken</span>?
            </span>
          </div>
          <span
            style={{
              fontSize: '16px',
              fontFamily: 'monospace',
              color: '#8b949e',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Live Market Intelligence
          </span>
        </div>

        {/* Center Idea Quote */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <span
            style={{
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#8b949e',
              textTransform: 'uppercase',
              letterSpacing: '3px',
            }}
          >
            Target Concept
          </span>
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              lineHeight: '1.2',
              color: '#ffffff',
            }}
          >
            &ldquo;{ideaText.slice(0, 110)}{ideaText.length > 110 ? '...' : ''}&rdquo;
          </div>
        </div>

        {/* Footer Verdict Metric Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            backgroundColor: '#121820',
            borderRadius: '16px',
            border: '1px solid #1e2632',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '18px', color: '#8b949e' }}>Market Saturation:</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: scoreColor,
                padding: '4px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${scoreColor}`,
              }}
            >
              {saturation}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', color: '#8b949e' }}>Competitors:</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#ffffff',
              }}
            >
              {competitorCount} tracked live
            </span>
          </div>

          <span
            style={{
              fontSize: '16px',
              fontFamily: 'monospace',
              color: '#f5a623',
            }}
          >
            ismysaastaken.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
