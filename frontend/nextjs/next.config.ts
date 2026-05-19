import type { NextConfig } from "next";
import path from "path";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND}/:path*`,
      },
    ]
  },
};

export default nextConfig;
