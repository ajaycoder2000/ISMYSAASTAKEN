'use client';

import React, { useState, useRef } from 'react';
import { ICompetitor, SaturationLevel } from '@/types';
import ExecutiveReportTemplate from './ExecutiveReportTemplate';
import { trackEvent } from '@/lib/telemetry';

interface DownloadReportButtonProps {
  ideaText: string;
  saturationScore: SaturationLevel;
  saturationReasoning?: string;
  competitors: ICompetitor[];
  gapAnalysis: string;
  shareSlug: string;
  createdAt?: Date | string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

export default function DownloadReportButton({
  ideaText,
  saturationScore,
  saturationReasoning,
  competitors,
  gapAnalysis,
  shareSlug,
  createdAt,
  className = '',
  variant = 'primary',
}: DownloadReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!reportRef.current || loading) return;

    setLoading(true);
    trackEvent('export_card_clicked', { format: 'pdf', shareSlug });

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      // 1. Capture high-resolution image of the executive template
      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // 2. Initialize A4 PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const computedHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Fit cleanly onto A4 page
      const renderHeight = Math.min(computedHeight, pdfHeight);

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, renderHeight);
      pdf.save(`saas-validation-report-${shareSlug || 'report'}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle =
    variant === 'primary'
      ? 'px-4 py-2 bg-[var(--accent-amber)] hover:opacity-90 text-black font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md flex items-center justify-center gap-2'
      : variant === 'compact'
      ? 'px-3 py-1.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5'
      : 'px-4 py-2 bg-[var(--bg-surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2';

  return (
    <>
      <button
        onClick={handleDownloadPdf}
        disabled={loading}
        className={`${buttonStyle} ${className} cursor-pointer disabled:opacity-60 disabled:cursor-wait`}
        title="Download high-resolution Executive PDF report"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Compiling PDF...</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Download Report (PDF)</span>
          </>
        )}
      </button>

      {/* Hidden off-screen render container for crisp A4 PDF capture */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          zIndex: -100,
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div ref={reportRef}>
          <ExecutiveReportTemplate
            ideaText={ideaText}
            saturationScore={saturationScore}
            saturationReasoning={saturationReasoning}
            competitors={competitors}
            gapAnalysis={gapAnalysis}
            shareSlug={shareSlug}
            createdAt={createdAt}
          />
        </div>
      </div>
    </>
  );
}
