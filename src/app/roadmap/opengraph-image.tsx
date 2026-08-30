import { ImageResponse } from 'next/og';

export const alt = 'Product Roadmap — Is My SaaS Taken?';
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
          IS MY SAAS TAKEN? • PRODUCT ROADMAP
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          Founder Market Telemetry
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#f5a623' }}>
          &amp; Upcoming Releases
        </div>
        <div style={{ fontSize: 24, marginTop: 30, color: '#8a8f98' }}>
          See what we are shipping next: radar scanning, weekly gap reports, and founder intelligence.
        </div>
      </div>
    ),
    { ...size }
  );
}
