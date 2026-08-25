"use client";
import { useState } from "react";

const CATEGORIES = [
  { icon: "🤖", label: "AI / automation tool" },
  { icon: "🔧", label: "Developer tool" },
  { icon: "📊", label: "Analytics / dashboards" },
  { icon: "💬", label: "Communication / collaboration" },
];

interface OnboardingFlowProps {
  onComplete: (data: { category: string; idea: string }) => void;
  onSkip?: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [idea, setIdea] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setScanning(true);
      setTimeout(() => {
        onComplete({
          category: selectedCategory >= 0 ? CATEGORIES[selectedCategory].label : "",
          idea,
        });
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto rounded-2xl border border-[var(--border)] bg-[hsl(220,14%,10%)] overflow-hidden shadow-2xl">
      {/* Progress bars */}
      <div className="flex gap-1.5 px-6 pt-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i < step
                ? "bg-[var(--accent)] shadow-[0_0_8px_var(--accent-mid)]"
                : i === step
                ? "bg-[var(--accent-mid)]"
                : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>

      {/* Body */}
      <div className="p-6 min-h-[300px] flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] tracking-[0.2em] text-[var(--accent)] block mb-2">
            STEP {step + 1} OF 3
          </span>

          {/* Step 1: Category */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-1">
                What kind of SaaS are you thinking about?
              </h3>
              <p className="text-xs text-[var(--text-dim)] mb-4">
                Pick the closest category — we&apos;ll tailor the market scan.
              </p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCategory(i)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm text-left transition-all duration-150 cursor-pointer ${
                      selectedCategory === i
                        ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)] font-bold shadow-sm"
                        : "border-[var(--border)] bg-[var(--panel-raised)] text-[var(--text-dim)] hover:border-[var(--accent-mid)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span className="text-base w-5 text-center">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Idea input */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-1">
                Describe your idea in a sentence
              </h3>
              <p className="text-xs text-[var(--text-dim)] mb-4">
                Be specific — &quot;AI that turns meeting notes into Linear tickets&quot; works
                better than &quot;AI productivity tool.&quot;
              </p>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. an AI tool that extracts B2B pricing tables into Google Sheets..."
                className="w-full bg-[hsl(220,15%,8%)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] font-[family-name:var(--font-inter)] text-xs sm:text-sm outline-none focus:border-[var(--accent)] resize-none min-h-[100px] mb-2"
              />
            </div>
          )}

          {/* Step 3: Launch */}
          {step === 2 && (
            <div className="animate-fade-in text-center py-4">
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)] mb-1">
                Ready to scan the live web?
              </h3>
              <p className="text-xs text-[var(--text-dim)] mb-6 max-w-xs mx-auto">
                We&apos;ll search live indexes and uncover existing competitors, saturation levels, and open space in seconds.
              </p>
              <div className="w-16 h-16 rounded-full bg-[var(--accent-dim)] border border-[var(--accent-mid)] flex items-center justify-center text-3xl mx-auto animate-pulse">
                ⚡
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
          <button
            onClick={onSkip}
            className="text-xs text-[var(--text-faint)] hover:text-[var(--text-dim)] bg-transparent border-none cursor-pointer"
          >
            {step < 2 ? "skip guide" : ""}
          </button>
          <button
            onClick={handleNext}
            disabled={scanning || (step === 1 && !idea.trim())}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-[family-name:var(--font-space-grotesk)] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {scanning ? "Scanning live web..." : step === 2 ? "⚡ Run First Scan" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
