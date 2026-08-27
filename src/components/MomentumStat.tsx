'use client';

export default function MomentumStat() {
  const stats = [
    { value: '2,847+', label: 'Ideas Scanned This Month', detail: 'Live web validations' },
    { value: '< 4.8s', label: 'Average Scan Latency', detail: 'Real-time crawler speed' },
    { value: '84.2%', label: 'Pivots & Wedges Found', detail: 'Uncrowded angle rate' },
    { value: '100%', label: 'Web-Grounded Search', detail: 'Real competitor data' },
  ];

  return (
    <section className="w-full py-8 sm:py-12 my-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-[hsl(220,13%,10%)] border border-[hsl(220,10%,16%)] text-center transition-all hover:border-[hsl(42,95%,55%,0.3)]"
          >
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="mt-0.5 text-[10.5px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
              {stat.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
