'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export interface GlobeMarker {
  location: [number, number]; // [lat, lng]
  size?: number;
}

interface LiveGlobeProps {
  markers?: GlobeMarker[];
  className?: string;
}

export default function LiveGlobe({ markers = [], className = '' }: LiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const markersRef = useRef(markers);
  markersRef.current = markers;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth || 340;
    let phi = 0;
    let visible = true;
    let rafId: number;

    const onResize = () => {
      if (canvas.offsetWidth) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    // Initial globe setup matching the site's dark slate & warm amber theme
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.15,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 14000,
      mapBrightness: 5.5,
      baseColor: [0.24, 0.25, 0.28], // sleek slate dots matching website palette
      markerColor: [0.96, 0.65, 0.14], // brand amber (#f5a623) ping markers
      glowColor: [0.06, 0.07, 0.09], // blends with site surface background
      markers: [],
    });

    const render = () => {
      if (visible) {
        // Natural rotation when not manually dragged
        if (pointerInteracting.current === null) {
          phi += 0.0035;
        } else {
          phi += pointerInteractionMovement.current;
          pointerInteractionMovement.current = 0;
        }

        const now = performance.now();
        // Pulse marker size subtly
        const currentMarkers = markersRef.current.map((m) => {
          const pulse = 0.035 + 0.02 * Math.sin((now / 600) + (m.location[0] + m.location[1]));
          return {
            location: m.location,
            size: m.size || pulse,
          };
        });

        globe.update({
          phi,
          markers: currentMarkers,
          width: width * 2,
          height: width * 2,
        });
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // Fade in gracefully
    requestAnimationFrame(() => {
      if (canvas) canvas.style.opacity = '1';
    });

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={`relative w-full aspect-square max-w-[340px] sm:max-w-[400px] mx-auto select-none touch-none ${className}`}
      onPointerDown={(e) => {
        pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onMouseMove={(e) => {
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.004;
        }
      }}
      onTouchMove={(e) => {
        if (pointerInteracting.current !== null && e.touches[0]) {
          const delta = e.touches[0].clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.004;
        }
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D Globe of live visitors"
        style={{
          width: '100%',
          height: '100%',
          opacity: 0,
          transition: 'opacity 0.8s ease',
          cursor: 'grab',
        }}
      />
    </div>
  );
}
