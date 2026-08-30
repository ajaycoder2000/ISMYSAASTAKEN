import { ImageResponse } from 'next/og';

export const alt = 'Pricing & Plans — Is My SaaS Taken?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0c0e12',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          color: '#e4e4e7',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ color: '#10b981', fontSize: 28, marginBottom: 20, letterSpacing: '2px' }}>
          IS MY SAAS TAKEN? • PRICING &amp; PLANS
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          Unlimited Market Validation
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#f5a623' }}>
          for Serious SaaS Builders
        </div>
        <div style={{ fontSize: 24, marginTop: 30, color: '#8a8f98' }}>
          Start free with 3 monthly scans. Upgrade to Sprint Pass or Founder Pro anytime.
        </div>
      </div>
    ),
    { ...size }
  );
}
