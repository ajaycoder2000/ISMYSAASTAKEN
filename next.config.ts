import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ismysaastaken.vercel.app',
          },
        ],
        destination: 'https://www.ismysaastaken.live/:path*',
        permanent: true,
      },
      {
        source: '/name-check',
        destination: '/is-it-taken',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
