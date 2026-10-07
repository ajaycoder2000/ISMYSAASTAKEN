'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LaunchListWidgetProps {
  keyId?: string;
  className?: string;
}

export default function LaunchListWidget({
  keyId = 'R7xdtZ',
  className = '',
}: LaunchListWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Listen for resize messages from LaunchList iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'launchlist:resize') {
        const iframe = container.querySelector('iframe');
        if (iframe && iframe.contentWindow === e.source) {
          if (!container.getAttribute('data-height')) {
            iframe.style.height = `${Math.ceil(e.data.height)}px`;
          }
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // If iframe already exists in this container, do nothing
    if (!container.querySelector('iframe')) {
      const queryString = typeof window !== 'undefined' && window.location.search ? window.location.search : '';
      const iframe = document.createElement('iframe');
      iframe.scrolling = 'no';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.height = '180px';
      iframe.style.transition = 'height 0.2s ease';
      iframe.src = `https://getlaunchlist.com/w/e/${keyId}${queryString}`;
      iframe.onload = () => {
        setLoading(false);
      };
      container.appendChild(iframe);
    }

    // Ping LaunchList install beacon so the dashboard detects the active installation
    try {
      const host = window.location.hostname || '';
      const pingKey = `ll_pinged_${keyId}_${host}`;
      if (host && window.localStorage && !localStorage.getItem(pingKey)) {
        localStorage.setItem(pingKey, '1');
        const pingUrl = `https://getlaunchlist.com/w/p/${encodeURIComponent(keyId)}/install`;
        if (navigator.sendBeacon) {
          navigator.sendBeacon(pingUrl, JSON.stringify({ host }));
        } else {
          fetch(pingUrl, {
            method: 'POST',
            body: JSON.stringify({ host }),
            headers: { 'Content-Type': 'application/json' },
            mode: 'no-cors',
          }).catch(() => {});
        }
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [keyId]);

  return (
    <div className={`w-full max-w-md mx-auto relative ${className}`}>
      {loading && (
        <div className="w-full h-44 rounded-xl bg-[var(--bg-surface-alt)] animate-pulse flex items-center justify-center text-xs text-[var(--text-dim)] font-mono">
          Loading waitlist...
        </div>
      )}
      <div
        ref={containerRef}
        className={`launchlist-widget transition-opacity duration-300 ${
          loading ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'
        }`}
        data-key-id={keyId}
      />
    </div>
  );
}
