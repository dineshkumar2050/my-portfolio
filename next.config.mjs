/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Allow serving learning-content from parent folder via rewrites in dev
  async rewrites() {
    return [];
  },
};

export default nextConfig;
