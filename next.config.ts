import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/name-check',
        destination: '/is-it-taken',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
