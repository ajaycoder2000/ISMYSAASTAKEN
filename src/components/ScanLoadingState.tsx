'use client';
import { useState, useEffect } from 'react';
import ScanningIndicator from './ScanningIndicator';

const steps = [
  { text: 'Searching the live web for competitors...', subtext: 'Scouring Product Hunt, G2, search index, and community discussions.' },
  { text: 'Analyzing market saturation...', subtext: 'Evaluating competitor density, pricing models, and feature overlap.' },
  { text: 'Extracting strategic wedge & gap...', subtext: 'Pinpointing underserved niches and positioning opportunities.' },
];

export default function ScanLoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-[hsl(220,12%,11%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 sm:p-6 animate-fade-in relative overflow-hidden">
      {/* Top Banner with Large Radar Ping */}
      <div className="flex items-center gap-4 pb-5 border-b border-[hsl(220,10%,16%)]">
        <ScanningIndicator size="lg" />
        <div>
          <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
            Market Scanner Active
          </h3>
          <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-0.5">
            Running real-time competitor discovery and wedge extraction
          </p>
        </div>
      </div>

      {/* Step Progress Feed */}
      <div className="space-y-4 pt-5">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-3.5 transition-all duration-300 ${
              i <= currentStep ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-1'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {i < currentStep ? (
                <div className="w-[22px] h-[22px] rounded-full bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.4)] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[hsl(145,60%,50%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : i === currentStep ? (
                <ScanningIndicator size="sm" />
              ) : (
                <div className="w-[22px] h-[22px] border border-[hsl(220,10%,22%)] rounded-full bg-[hsl(220,15%,9%)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium font-[family-name:var(--font-space-grotesk)] ${
                i <= currentStep ? 'text-[hsl(40,20%,92%)]' : 'text-[hsl(40,8%,40%)]'
              }`}>
                {step.text}
              </p>
              {i === currentStep && (
                <p className="mt-1 text-[11px] sm:text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
                  {step.subtext}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
