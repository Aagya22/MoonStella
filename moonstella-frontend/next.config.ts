// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
//   reactStrictMode: true,
// };

// export default nextConfig;
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Add domains here if you later load images from Cloudinary
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
