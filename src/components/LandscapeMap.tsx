"use client";
import { useRef, useEffect, useCallback } from "react";

interface Competitor {
  name: string;
  crowdedness: number; // 0-1, higher = more crowded area
  establishment: number; // 0-1, higher = more established
  size?: number; // dot radius, default 14
}

interface LandscapeMapProps {
  competitors?: Competitor[];
  ideaLabel?: string;
  ideaPosition?: { x: number; y: number };
  onExport?: () => void;
}

const DEFAULT_COMPETITORS: Competitor[] = [
  { name: "Otter.ai", crowdedness: 0.7, establishment: 0.75, size: 16 },
  { name: "Fireflies", crowdedness: 0.6, establishment: 0.6, size: 14 },
  { name: "Fathom", crowdedness: 0.45, establishment: 0.5, size: 12 },
  { name: "Grain", crowdedness: 0.55, establishment: 0.35, size: 9 },
];

export default function LandscapeMap({
  competitors = DEFAULT_COMPETITORS,
  ideaLabel = "YOUR IDEA",
  ideaPosition = { x: 0.22, y: 0.45 },
  onExport,
}: LandscapeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 30;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    // Background
    ctx.fillStyle = "#0a0e12";
    ctx.fillRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = "#171f28";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L, H - PAD_B);
    ctx.lineTo(W - PAD_R, H - PAD_B);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(PAD_L, H - PAD_B);
    ctx.lineTo(PAD_L, PAD_T);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#6e7681";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("← less crowded", W * 0.3, H - 10);
    ctx.fillText("more crowded →", W * 0.75, H - 10);
    ctx.save();
    ctx.translate(14, H * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("← newer        more established →", 0, 0);
    ctx.restore();

    // Grid
    ctx.strokeStyle = "rgba(79,209,255,0.06)";
    ctx.setLineDash([4, 6]);
    for (let i = 1; i < 5; i++) {
      const x = PAD_L + plotW * (i / 5);
      ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B); ctx.stroke();
    }
    for (let i = 1; i < 4; i++) {
      const y = PAD_T + plotH * (i / 4);
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Competitors (red/amber dots)
    competitors.forEach((c) => {
      const cx = PAD_L + plotW * c.crowdedness;
      const cy = PAD_T + plotH * (1 - c.establishment);
      const r = c.size || 14;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,103,89,0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,103,89,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ece6d6";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.name, cx, cy + r + 13);
    });

    // Your idea (blue dashed circle)
    const ix = PAD_L + plotW * ideaPosition.x;
    const iy = PAD_T + plotH * (1 - ideaPosition.y);

    ctx.beginPath();
    ctx.arc(ix, iy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,209,255,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(79,209,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#4fd1ff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(ideaLabel, ix, iy + 3);
    ctx.fillText("(open space)", ix, iy + 15);
  }, [competitors, ideaLabel, ideaPosition]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).catch(() => {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "competitive-landscape.png";
        a.click();
        URL.revokeObjectURL(url);
      });
      onExport?.();
    });
  };

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl overflow-hidden w-full max-w-[620px] mx-auto shadow-xl">
      <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 border-b border-[var(--border)] bg-[hsl(220,15%,9%)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)]">
            Competitive Landscape Matrix
          </span>
          <span className="text-[9px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(220,10%,18%)] text-[hsl(40,8%,55%)]">
            2D SCATTER
          </span>
        </div>
        <button
          onClick={handleExport}
          className="bg-[var(--panel-raised)] border border-[var(--border)] text-[var(--text-dim)] px-3 py-1 rounded-lg text-[10px] font-[family-name:var(--font-mono)] hover:border-[var(--accent-mid)] hover:text-[var(--accent)] transition-all cursor-pointer"
        >
          📋 Copy PNG
        </button>
      </div>
      <div ref={wrapRef} className="relative h-[280px] sm:h-[320px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
