const nextConfig = {
  // Static export is disabled to support dynamic routes like /profile/[username]
  // Standard server rendering will be used.
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3003',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.8',
        port: '3003',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.9',
        port: '3003',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Rewrites only work in local development/standard hosting, not on GitHub Pages
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/api/:path*',
      },
      {
        source: '/public/uploads/:path*',
        destination: 'http://localhost:3003/public/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;


