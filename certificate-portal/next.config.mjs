/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname for HTTPS images
        pathname: '**', // Allow any path
      },
    ],
  },
};

export default nextConfig;