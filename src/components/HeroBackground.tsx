'use client';

export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]"
    >
      {/* 1. Drifting Grid Layer */}
      <div
        className="absolute inset-0 animate-grid-drift opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(42 95% 55% / 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(42 95% 55% / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 2. Radar Sweep Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[180%] sm:w-[150%] aspect-square rounded-full animate-radar-spin pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(42 95% 55% / 0.14) 25deg, transparent 60deg)',
            mixBlendMode: 'screen',
            maskImage: 'radial-gradient(circle at center, black 15%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 15%, transparent 65%)',
          }}
        />
      </div>
    </div>
  );
}
