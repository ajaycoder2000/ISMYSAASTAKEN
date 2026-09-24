"use client";

import { useEffect, useRef } from "react";

export default function LogoBadge3D({ size = 160 }: { size?: number }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const layers = 12;
  const depthStep = Math.max(1, size / 85);
  const border = Math.round(size * 0.04);
  const radius = Math.round(size * 0.22);

  useEffect(() => {
    const scene = sceneRef.current;
    const badge = badgeRef.current;
    if (!scene || !badge) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (reduceMotion) {
      badge.style.transform = "rotateX(8deg) rotateY(-16deg)";
      return;
    }

    let rx = 0, ry = 0, tx = 0, ty = 0, hover = false, raf = 0, visible = true;

    const onMove = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect();
      hover = true;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 50;
      tx = -((e.clientY - r.top) / r.height - 0.5) * 35;
    };
    const onLeave = () => { hover = false; };
    if (finePointer) {
      scene.addEventListener("pointermove", onMove);
      scene.addEventListener("pointerleave", onLeave);
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(scene);

    const frame = (t: number) => {
      if (visible) {
        const s = t / 1000;
        if (!hover) { ty = Math.sin(s * 0.8) * 24; tx = Math.sin(s * 0.6) * 9; }
        rx += (tx - rx) * 0.08;
        ry += (ty - ry) * 0.08;
        const fy = Math.sin(s * 1.2) * (size * 0.04);
        badge.style.transform = `translateY(${fy}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      if (finePointer) {
        scene.removeEventListener("pointermove", onMove);
        scene.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [size]);

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="flex items-center justify-center shrink-0 select-none"
      style={{ width: size * 1.6, height: size * 1.6, perspective: 900 }}
    >
      <div ref={badgeRef} className="relative" style={{ width: size, height: size, transformStyle: "preserve-3d" }}>
        {Array.from({ length: layers + 1 }).map((_, idx) => {
          const i = layers - idx; // back layers first, front layer (i = 0) last
          const front = i === 0;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                borderRadius: radius,
                border: `${border}px solid ${front ? "var(--accent-amber)" : "var(--badge-side)"}`,
                transform: `translateZ(${-i * depthStep}px)`,
                ...(front && {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: size * 0.08,
                }),
              }}
            >
              {front && (
                <>
                  <div className="font-mono font-medium leading-none" style={{ fontSize: size * 0.5, color: "var(--accent-amber)" }}>?</div>
                  <div className="flex" style={{ gap: size * 0.035 }}>
                    {Array.from({ length: 6 }).map((_, d) => (
                      <span
                        key={d}
                        style={{ width: size * 0.07, height: size * 0.03, background: "var(--accent-emerald)", borderRadius: 1 }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
