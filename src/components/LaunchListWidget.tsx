'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

interface LaunchListWidgetProps {
  keyId?: string;
  className?: string;
}

export default function LaunchListWidget({
  keyId = 'R7xdtZ',
  className = '',
}: LaunchListWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If script already loaded in session, trigger re-scan for new DOM element
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.LaunchList?.init) {
        win.LaunchList.init();
      }
    }
  }, []);

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* LaunchList Widget Container */}
      <div className="launchlist-widget" data-key-id={keyId} />

      {/* Load LaunchList Script */}
      <Script
        src="https://getlaunchlist.com/js/widget.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.LaunchList?.init) {
              win.LaunchList.init();
            }
          }
        }}
      />
    </div>
  );
}
