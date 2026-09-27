import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tuservidor.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'bnsports.com.mx', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' }
    ],
  },
  // Agregar esto para que /admin redirija al dashboard
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;