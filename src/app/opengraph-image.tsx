import { ImageResponse } from 'next/og';

export const alt = 'Is My SaaS Taken? — Instant Market Validation for SaaS Ideas';
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
          IS MY SAAS TAKEN?
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          Instant Market Validation
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: '#f5a623' }}>
          for SaaS Ideas
        </div>
        <div style={{ fontSize: 24, marginTop: 30, color: '#8a8f98' }}>
          Real competitors. Real gaps. No BS.
        </div>
      </div>
    ),
    { ...size }
  );
}
