"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

// Decorative "source" locations the blips appear at. Not real data.
const LOCATIONS: [number, number][] = [
  [37.77, -122.42], [40.71, -74.0], [51.5, -0.12], [52.52, 13.4], [48.85, 2.35],
  [12.97, 77.59], [19.07, 72.87], [1.35, 103.82], [35.68, 139.69], [-33.86, 151.2],
  [43.65, -79.38], [-23.55, -46.63], [25.2, 55.27], [59.33, 18.06], [37.56, 126.97],
];

type Blip = { location: [number, number]; born: number };

export default function ScanGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDark = resolvedTheme !== "light";
    const isMobile = window.innerWidth < 768;

    let width = canvas.offsetWidth || 560;
    let phi = 0;
    let speed = 1;
    let burstUntil = 0;
    let visible = true;
    let blips: Blip[] = [];
    let rafId: number;

    const spawn = () =>
      blips.push({
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        born: performance.now(),
      });

    // The scan form dispatches this event when the user clicks "Scan this idea".
    const onScanStart = () => {
      burstUntil = performance.now() + 1600;
      for (let i = 0; i < 8; i++) setTimeout(spawn, i * 120);
    };
    const onResize = () => {
      if (canvas.offsetWidth) {
        width = canvas.offsetWidth;
      }
    };

    window.addEventListener("scan:start", onScanStart);
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(canvas);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: isMobile ? 8000 : 16000,
      mapBrightness: isDark ? 6 : 4,
      baseColor: isDark ? [0.25, 0.25, 0.28] : [0.9, 0.89, 0.86],
      markerColor: isDark ? [0.96, 0.65, 0.14] : [0.71, 0.33, 0.04], // amber, darker in light mode
      glowColor: isDark ? [0.05, 0.06, 0.07] : [0.98, 0.97, 0.95],   // blends into the page background
      markers: [],
    });

    const render = () => {
      const now = performance.now();

      if (reduceMotion) {
        // Still globe, a few static markers, no spinning.
        globe.update({
          markers: LOCATIONS.slice(0, 5).map((location) => ({ location, size: 0.04 })),
          phi,
          width: width * 2,
          height: width * 2,
        });
        return;
      }

      if (visible) {
        const target = now < burstUntil ? 4 : 1;
        speed += (target - speed) * 0.06;
        phi += 0.004 * speed;
        if (Math.random() < 0.02) spawn();
      }

      blips = blips.filter((b) => now - b.born < 2400);
      const currentMarkers = blips.map((b) => {
        const age = (now - b.born) / 2400;
        return { location: b.location, size: 0.03 + 0.05 * Math.sin(age * Math.PI) };
      });

      globe.update({
        phi,
        markers: currentMarkers,
        width: width * 2,
        height: width * 2,
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // Fade in after first frame so it never flashes in.
    requestAnimationFrame(() => {
      if (canvas) canvas.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      io.disconnect();
      window.removeEventListener("scan:start", onScanStart);
      window.removeEventListener("resize", onResize);
    };
  }, [resolvedTheme]); // recreate when the theme toggles

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ width: "100%", aspectRatio: "1", opacity: 0, transition: "opacity 1s ease" }}
    />
  );
}
