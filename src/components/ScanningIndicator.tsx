'use client';

interface ScanningIndicatorProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export default function ScanningIndicator({ size = 'sm', className = '' }: ScanningIndicatorProps) {
  const isLarge = size === 'lg';

  return (
    <div
      role="status"
      aria-label="Scanning"
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${
        isLarge ? 'w-14 h-14' : 'w-[22px] h-[22px]'
      } ${className}`}
    >
      {/* Ping Ring 1 */}
      <span
        aria-hidden="true"
        className={`absolute rounded-full pointer-events-none animate-radar-ping ${
          isLarge ? '-inset-2 border-[1.5px]' : '-inset-1 border'
        }`}
        style={{
          borderColor: 'var(--accent-mid)',
        }}
      />

      {/* Ping Ring 2 (staggered delay by 0.8s) */}
      <span
        aria-hidden="true"
        className={`absolute rounded-full pointer-events-none animate-radar-ping-delayed ${
          isLarge ? '-inset-2 border-[1.5px]' : '-inset-1 border'
        }`}
        style={{
          borderColor: 'var(--accent-mid)',
        }}
      />

      {/* Base Radar Circle */}
      <div
        className={`relative rounded-full flex items-center justify-center bg-[hsl(220,15%,9%)] ${
          isLarge ? 'w-14 h-14 border-[1.5px]' : 'w-[22px] h-[22px] border'
        }`}
        style={{
          borderColor: 'var(--accent-mid)',
        }}
      >
        {/* Solid Center Dot */}
        <span
          className={`rounded-full ${isLarge ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`}
          style={{
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 6px var(--accent-glow)',
          }}
        />
      </div>
    </div>
  );
}
