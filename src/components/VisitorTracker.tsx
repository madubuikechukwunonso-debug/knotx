'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Optional: You can pass user info if you store it in localStorage after login
        const user = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('user') || '{}') 
          : {};

        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname,
            userId: user?.id || null,
            displayName: user?.name || user?.displayName || null,
            userType: user?.id ? 'registered' : 'guest',
          }),
        });
      } catch (error) {
        // Fail silently so it doesn't break the user experience
        console.error('Visitor tracking failed:', error);
      }
    };

    // Track on initial load and on every route change
    trackVisit();
  }, [pathname]);

  return null;
}
