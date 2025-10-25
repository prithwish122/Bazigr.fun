import { error } from "console";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ignoreBuildErrors: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
