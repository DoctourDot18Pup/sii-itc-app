import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(isDev && {
    turbopack: { root: path.resolve(__dirname) },
    allowedDevOrigins: ['192.168.56.1'],
  }),
  async rewrites() {
    return [
      {
        source: '/api/sii/:path*',
        destination: 'https://sii.celaya.tecnm.mx/api/:path*',
      },
    ]
  },
};

export default nextConfig;
