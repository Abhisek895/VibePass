'use client';

import { usePathname } from 'next/navigation';
import { NavigationBar } from '@/components/ui/navigation-bar';

export function ConditionalNavigationBar() {
  const pathname = usePathname();
  const isChatDetailRoute =
    pathname?.startsWith('/chat/') && pathname.split('/').length > 2;

  // Hide navbar on auth, landing, and full-screen chat detail pages.
  if (pathname?.startsWith('/auth') || pathname === '/' || isChatDetailRoute) {
    return null;
  }

  return <NavigationBar />;
}
