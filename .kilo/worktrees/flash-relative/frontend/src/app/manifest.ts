import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VibePass',
    short_name: 'VibePass',
    description: 'Match by vibe. Reveal by choice.',
    start_url: '/chat',
    display: 'standalone',
    background_color: '#0B141B',
    theme_color: '#8B5CF6',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
