import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Is My SaaS Taken? — Instant Market Validation',
    short_name: 'IsMySaaSTaken',
    description:
      'Describe your SaaS idea, get back real competitors, market saturation, and defensible opportunity wedges.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0e12',
    theme_color: '#0c0e12',
    icons: [
      {
        src: '/icon.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '1024x123',
        type: 'image/png',
      },
    ],
  };
}
