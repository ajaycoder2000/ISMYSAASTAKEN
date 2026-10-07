import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const isPrelaunch = process.env.PRELAUNCH_MODE === 'true';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: isPrelaunch ? ['/api/'] : ['/api/', '/dashboard', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
