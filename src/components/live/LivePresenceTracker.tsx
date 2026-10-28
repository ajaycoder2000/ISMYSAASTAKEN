'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function LivePresenceTracker() {
  const pathname = usePathname();
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    const sendPing = () => {
      // Throttle pings to minimum 15 seconds apart unless pathname changes
      const now = Date.now();
      lastPingRef.current = now;

      try {
        const payload = JSON.stringify({ path: pathname || '/' });
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/live/heartbeat', blob);
        } else {
          fetch('/api/live/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Ignore background network errors
      }
    };

    // Immediate ping on route change
    sendPing();

    // Regular heartbeat every 45 seconds while tab is active
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendPing();
      }
    }, 45000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastPingRef.current > 30000) {
        sendPing();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname]);

  return null;
}
