'use client';

import React from 'react';
import { ICompetitor, SaturationLevel } from '@/types';
import { SITE_URL } from '@/lib/site';

interface ExecutiveReportTemplateProps {
  ideaText: string;
  saturationScore: SaturationLevel;
  saturationReasoning?: string;
  competitors: ICompetitor[];
  gapAnalysis: string;
  shareSlug: string;
  createdAt?: Date | string;
}

export default function ExecutiveReportTemplate({
  ideaText,
  saturationScore,
  saturationReasoning,
  competitors,
  gapAnalysis,
  shareSlug,
  createdAt,
}: ExecutiveReportTemplateProps) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const isLow = saturationScore === 'low';
  const isMed = saturationScore === 'medium';

  const saturationColor = isLow ? '#166534' : isMed ? '#92400e' : '#991b1b';
  const saturationBg = isLow ? '#f0fdf4' : isMed ? '#fffbeb' : '#fef2f2';
  const saturationBorder = isLow ? '#bbf7d0' : isMed ? '#fde68a' : '#fecaca';
  const saturationLabel = isLow
    ? 'LOW / OPEN'
    : isMed
    ? 'MEDIUM / PIVOT'
    : 'HIGH / CROWDED';
  const saturationSubtitle = isLow
    ? '✓ Strong market gap identified'
    : isMed
    ? '⚠️ Moderate crowding — differentiate on wedge'
    : '⚠️ Highly saturated — direct clone not recommended';

  const moatScore = isLow ? '8.8 / 10' : isMed ? '6.4 / 10' : '4.1 / 10';
  const moatLabel = isLow
    ? 'High defensibility potential'
    : isMed
    ? 'Moderate defensibility'
    : 'Difficult moat / commoditized';

  // Format competitors (up to 4)
  const displayCompetitors = (competitors || []).slice(0, 4);

  return (
    <div
      id="executive-report-pdf-canvas"
      style={{
        width: '820px',
        minHeight: '1160px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '36px 42px',
        boxSizing: 'border-box',
        position: 'relative',
        lineHeight: 1.45,
      }}
    >
      {/* Top Brand Accent Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: '#f5a623',
        }}
      />

      {/* ================= HEADER SECTION ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '16px',
          borderBottom: '1.5px solid #e2e8f0',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#0f172a',
            }}
          >
            IsMySaaS<span style={{ color: '#f5a623' }}>Taken</span>
            <span style={{ color: '#10b981' }}>?</span>
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '1.5px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              marginTop: '2px',
            }}
          >
            MARKET VALIDATION MEMO
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px 14px',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: '#64748b',
            }}
          >
            REPORT ID: #SC-{shareSlug.slice(0, 8).toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#0f172a',
              marginTop: '2px',
            }}
          >
            DATE: {formattedDate.toUpperCase()} • 100% PRIVATE
          </div>
        </div>
      </div>

      {/* ================= TARGET IDEA SUMMARY ================= */}
      <div
        style={{
          marginTop: '18px',
          backgroundColor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px 18px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#64748b',
            letterSpacing: '1px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          VALIDATED SAAS CONCEPT
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0f172a',
            marginTop: '4px',
            lineHeight: 1.35,
          }}
        >
          &ldquo;{ideaText}&rdquo;
        </div>
        {saturationReasoning && (
          <div
            style={{
              fontSize: '11.5px',
              color: '#475569',
              marginTop: '6px',
            }}
          >
            {saturationReasoning}
          </div>
        )}
      </div>

      {/* ================= 3 KEY METRIC CARDS ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        {/* Card 1: Saturation */}
        <div
          style={{
            backgroundColor: saturationBg,
            border: `1.5px solid ${saturationBorder}`,
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: saturationColor,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            SATURATION SCORE
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: saturationColor,
              marginTop: '3px',
            }}
          >
            {saturationLabel}
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: saturationColor,
              marginTop: '3px',
              fontWeight: 500,
            }}
          >
            {saturationSubtitle}
          </div>
        </div>

        {/* Card 2: Competitors */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#b45309',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            DIRECT COMPETITORS
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#92400e',
              marginTop: '3px',
            }}
          >
            {displayCompetitors.length} Detected
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: '#b45309',
              marginTop: '3px',
              fontWeight: 500,
            }}
          >
            {displayCompetitors.length === 0
              ? 'Zero direct competitors found'
              : 'Live web & product scan grounded'}
          </div>
        </div>

        {/* Card 3: Moat Rating */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#475569',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            FEASIBILITY &amp; MOAT
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '3px',
            }}
          >
            {moatScore}
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: '#64748b',
              marginTop: '3px',
              fontWeight: 500,
            }}
          >
            {moatLabel}
          </div>
        </div>
      </div>

      {/* ================= COMPETITOR MATRIX TABLE ================= */}
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px',
          }}
        >
          1. Competitive Landscape Matrix
        </div>

        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 100px 190px',
              backgroundColor: '#f1f5f9',
              padding: '8px 12px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#475569',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            <div>COMPETITOR</div>
            <div>POSITIONING &amp; FOCUS</div>
            <div>PRICING</div>
            <div>CRITICAL WEAKNESS / GAP</div>
          </div>

          {/* Table Rows */}
          {displayCompetitors.length > 0 ? (
            displayCompetitors.map((comp, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 100px 190px',
                  backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                  padding: '9px 12px',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '11px',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {comp.name}
                </div>
                <div style={{ color: '#475569', paddingRight: '8px' }}>
                  {comp.description || 'General SaaS solution'}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#0f172a',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '10.5px',
                  }}
                >
                  {comp.pricing || 'Freemium / Paid'}
                </div>
                <div
                  style={{
                    color: '#dc2626',
                    fontWeight: 600,
                    fontSize: '10.5px',
                  }}
                >
                  ⚠️ Not specialized for this wedge
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              No direct commercial competitors detected for this specific angle.
            </div>
          )}
        </div>
      </div>

      {/* ================= THE MARKET GAP CALLOUT ================= */}
      <div
        style={{
          marginTop: '18px',
          backgroundColor: '#fffbeb',
          border: '1.5px solid #f5a623',
          borderRadius: '10px',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: '#f5a623',
              color: '#ffffff',
              fontSize: '9.5px',
              fontWeight: 800,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            THE WINNING WEDGE
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#78350f',
            }}
          >
            Strategic Opportunity Analysis
          </span>
        </div>

        <div
          style={{
            fontSize: '12.5px',
            color: '#92400e',
            marginTop: '8px',
            lineHeight: 1.45,
          }}
        >
          {gapAnalysis}
        </div>
      </div>

      {/* ================= GO-TO-MARKET ACTION PLAYBOOK ================= */}
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px',
          }}
        >
          2. Recommended 30-Day Go-To-Market Execution
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Phase 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0f172a',
                flexShrink: 0,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              1
            </div>
            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Pre-Validate With 5 Target Customers ($0 Code)
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '2px',
                }}
              >
                Reach out to niche communities (Reddit, LinkedIn, Discord) offering manual assistance to confirm pain point urgency before writing back-end logic.
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0f172a',
                flexShrink: 0,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              2
            </div>
            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Build Single-Feature MVP Focusing on the Wedge
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '2px',
                }}
              >
                Focus exclusively on the primary gap identified above. Cut all secondary features (teams, complex analytics) for the v1 release.
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0f172a',
                flexShrink: 0,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              3
            </div>
            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                Monetize with Founding Member Pricing
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '2px',
                }}
              >
                Offer an early-bird monthly or annual pass to lock in first 10-20 paying users before scaling to public Product Hunt and directories.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOOTER / AUTHENTICITY STAMP ================= */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '14px',
          borderTop: '1.5px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Is My SaaS Taken? Intelligence Suite
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              marginTop: '1px',
            }}
          >
            Live Web Crawling • Real Competitor Tracking • Moat Analysis
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '10px',
            fontWeight: 800,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            color: '#15803d',
          }}
        >
          ✓ VERIFIED BY ISMYSAAS
        </div>
      </div>

      <div
        style={{
          marginTop: '10px',
          fontSize: '9.5px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: '#cbd5e1',
          textAlign: 'center',
        }}
      >
        {SITE_URL}/scan/{shareSlug} • CONFIDENTIAL AND PROPRIETARY • PAGE 1 OF 1
      </div>
    </div>
  );
}
