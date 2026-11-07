const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 1. TEMPLATE 1: Clean Executive Memo (Light / Professional)
const executiveSvg = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#27272a" />
    </linearGradient>
    <linearGradient id="amberPill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f5a623" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  </style>

  <!-- Canvas Background -->
  <rect width="1200" height="1600" fill="#f8fafc" />

  <!-- Sheet Paper Surface -->
  <rect x="50" y="50" width="1100" height="1500" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

  <!-- Top Decorative Header Strip -->
  <path d="M 50 66 Q 50 50 66 50 L 1134 50 Q 1150 50 1150 66 L 1150 62 L 50 62 Z" fill="#f5a623" />

  <!-- ================= HEADER SECTION ================= -->
  <g transform="translate(100, 100)">
    <!-- Brand Logo & Name -->
    <text x="0" y="32" fill="#0f172a" font-size="28" font-weight="800" class="font-sans" letter-spacing="-0.5px">
      IsMySaaS<tspan fill="#f5a623">Taken</tspan><tspan fill="#10b981">?</tspan>
    </text>
    <text x="0" y="56" fill="#64748b" font-size="13" font-weight="600" class="font-mono" letter-spacing="1.5px">
      MARKET VALIDATION MEMO
    </text>

    <!-- Meta Info Box (Right Side) -->
    <g transform="translate(730, 0)">
      <rect x="0" y="0" width="270" height="64" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
      <text x="16" y="24" fill="#64748b" font-size="11" font-weight="700" class="font-mono">REPORT ID: #SC-9428-A</text>
      <text x="16" y="44" fill="#0f172a" font-size="12" font-weight="600" class="font-sans">DATE: NOV 7, 2026 • 100% PRIVATE</text>
    </g>
  </g>

  <!-- Divider -->
  <line x1="100" y1="185" x2="1100" y2="185" stroke="#e2e8f0" stroke-width="1.5" />

  <!-- ================= TARGET IDEA SUMMARY ================= -->
  <g transform="translate(100, 215)">
    <rect x="0" y="0" width="1000" height="105" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="24" y="32" fill="#64748b" font-size="11" font-weight="700" class="font-mono" letter-spacing="1px">VALIDATED SAAS CONCEPT</text>
    <text x="24" y="66" fill="#0f172a" font-size="20" font-weight="700" class="font-sans">
      "AI Meeting Notes &amp; Client Record Keeper for Licensed Therapists"
    </text>
    <text x="24" y="90" fill="#475569" font-size="13" class="font-sans">
      Target Industry: Mental Health &amp; Healthcare Clinics • Model: B2B Micro-SaaS ($49/seat/mo)
    </text>
  </g>

  <!-- ================= 3 KEY METRIC CARDS ================= -->
  <g transform="translate(100, 345)">
    <!-- Card 1: Saturation Verdict -->
    <rect x="0" y="0" width="315" height="115" rx="12" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5" />
    <text x="20" y="30" fill="#15803d" font-size="11" font-weight="800" class="font-mono">SATURATION SCORE</text>
    <text x="20" y="68" fill="#166534" font-size="28" font-weight="800" class="font-sans">LOW / OPEN</text>
    <text x="20" y="92" fill="#15803d" font-size="12" font-weight="500" class="font-sans">✓ Strong market gap identified</text>

    <!-- Card 2: Competitors Detected -->
    <g transform="translate(342, 0)">
      <rect x="0" y="0" width="315" height="115" rx="12" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5" />
      <text x="20" y="30" fill="#b45309" font-size="11" font-weight="800" class="font-mono">DIRECT COMPETITORS</text>
      <text x="20" y="68" fill="#92400e" font-size="28" font-weight="800" class="font-sans">2 Detected</text>
      <text x="20" y="92" fill="#b45309" font-size="12" font-weight="500" class="font-sans">No dominant niche specialist</text>
    </g>

    <!-- Card 3: Moat Index -->
    <g transform="translate(685, 0)">
      <rect x="0" y="0" width="315" height="115" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="20" y="30" fill="#475569" font-size="11" font-weight="800" class="font-mono">FEASIBILITY &amp; MOAT</text>
      <text x="20" y="68" fill="#0f172a" font-size="28" font-weight="800" class="font-sans">8.6 / 10</text>
      <text x="20" y="92" fill="#64748b" font-size="12" font-weight="500" class="font-sans">High compliance moat</text>
    </g>
  </g>

  <!-- ================= COMPETITOR MATRIX TABLE ================= -->
  <g transform="translate(100, 490)">
    <text x="0" y="24" fill="#0f172a" font-size="17" font-weight="800" class="font-sans">
      1. Competitive Landscape Matrix
    </text>

    <!-- Table Header -->
    <g transform="translate(0, 42)">
      <rect x="0" y="0" width="1000" height="38" rx="6" fill="#f1f5f9" />
      <text x="20" y="24" fill="#475569" font-size="11" font-weight="800" class="font-mono">COMPETITOR</text>
      <text x="250" y="24" fill="#475569" font-size="11" font-weight="800" class="font-mono">TARGET MARKET</text>
      <text x="470" y="24" fill="#475569" font-size="11" font-weight="800" class="font-mono">PRICING</text>
      <text x="680" y="24" fill="#475569" font-size="11" font-weight="800" class="font-mono">CRITICAL VULNERABILITY</text>
    </g>

    <!-- Table Row 1 -->
    <g transform="translate(0, 85)">
      <rect x="0" y="0" width="1000" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1" />
      <text x="20" y="32" fill="#0f172a" font-size="14" font-weight="700" class="font-sans">Otter.ai</text>
      <text x="250" y="32" fill="#475569" font-size="13" class="font-sans">General B2B / Sales</text>
      <text x="470" y="32" fill="#0f172a" font-size="13" font-weight="600" class="font-mono">$16.99/mo</text>
      <text x="680" y="32" fill="#dc2626" font-size="13" font-weight="600" class="font-sans">⚠️ Not HIPAA compliant by default</text>
    </g>

    <!-- Table Row 2 -->
    <g transform="translate(0, 142)">
      <rect x="0" y="0" width="1000" height="52" fill="#f8fafc" stroke="#f1f5f9" stroke-width="1" />
      <text x="20" y="32" fill="#0f172a" font-size="14" font-weight="700" class="font-sans">Fireflies.ai</text>
      <text x="250" y="32" fill="#475569" font-size="13" class="font-sans">Broad Enterprise Meetings</text>
      <text x="470" y="32" fill="#0f172a" font-size="13" font-weight="600" class="font-mono">$18.00/mo</text>
      <text x="680" y="32" fill="#dc2626" font-size="13" font-weight="600" class="font-sans">⚠️ High data retention risk</text>
    </g>

    <!-- Table Row 3 -->
    <g transform="translate(0, 199)">
      <rect x="0" y="0" width="1000" height="52" fill="#ffffff" stroke="#f1f5f9" stroke-width="1" />
      <text x="20" y="32" fill="#0f172a" font-size="14" font-weight="700" class="font-sans">Heidi Health</text>
      <text x="250" y="32" fill="#475569" font-size="13" class="font-sans">General Medical Doctors</text>
      <text x="470" y="32" fill="#0f172a" font-size="13" font-weight="600" class="font-mono">$79.00/mo</text>
      <text x="680" y="32" fill="#d97706" font-size="13" font-weight="600" class="font-sans">⚠️ Too complex for solo therapists</text>
    </g>
  </g>

  <!-- ================= THE MARKET GAP CALLOUT ================= -->
  <g transform="translate(100, 775)">
    <rect x="0" y="0" width="1000" height="175" rx="14" fill="#fffbeb" stroke="#f5a623" stroke-width="2" />
    <g transform="translate(30, 28)">
      <rect x="0" y="0" width="180" height="26" rx="6" fill="#f5a623" />
      <text x="90" y="18" fill="#ffffff" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">THE WINNING WEDGE</text>

      <text x="0" y="60" fill="#78350f" font-size="18" font-weight="800" class="font-sans">
        Zero-Retention Ephemeral Audio with Direct EHR Integration
      </text>
      <text x="0" y="90" fill="#92400e" font-size="14" class="font-sans" width="940">
        Therapists fear subpoenas and data leaks. Existing corporate tools store raw audio files forever.
      </text>
      <text x="0" y="114" fill="#92400e" font-size="14" font-weight="600" class="font-sans">
        Your moat: Generate notes immediately, wipe the audio instantly, and export direct to SimplePractice.
      </text>
    </g>
  </g>

  <!-- ================= GO-TO-MARKET ACTION PLAYBOOK ================= -->
  <g transform="translate(100, 985)">
    <text x="0" y="24" fill="#0f172a" font-size="17" font-weight="800" class="font-sans">
      2. Recommended 30-Day Go-To-Market Execution
    </text>

    <!-- Phase 1 -->
    <g transform="translate(0, 44)">
      <rect x="0" y="0" width="1000" height="74" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <circle cx="36" cy="37" r="16" fill="#f1f5f9" />
      <text x="36" y="42" fill="#0f172a" font-size="13" font-weight="800" class="font-mono" text-anchor="middle">1</text>
      <text x="72" y="32" fill="#0f172a" font-size="15" font-weight="700" class="font-sans">Pre-Validate with 5 Solo Therapists ($0 Code)</text>
      <text x="72" y="54" fill="#64748b" font-size="13" class="font-sans">Post in private therapist subreddits / Facebook groups offering free manual test notes to verify pricing tolerance.</text>
    </g>

    <!-- Phase 2 -->
    <g transform="translate(0, 130)">
      <rect x="0" y="0" width="1000" height="74" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <circle cx="36" cy="37" r="16" fill="#f1f5f9" />
      <text x="36" y="42" fill="#0f172a" font-size="13" font-weight="800" class="font-mono" text-anchor="middle">2</text>
      <text x="72" y="32" fill="#0f172a" font-size="15" font-weight="700" class="font-sans">Build Single-Feature MVP (No Audio Storage)</text>
      <text x="72" y="54" fill="#64748b" font-size="13" class="font-sans">Build lightweight Whisper + Claude pipeline with strict in-memory transcription and signed BAA certification.</text>
    </g>

    <!-- Phase 3 -->
    <g transform="translate(0, 216)">
      <rect x="0" y="0" width="1000" height="74" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <circle cx="36" cy="37" r="16" fill="#f1f5f9" />
      <text x="36" y="42" fill="#0f172a" font-size="13" font-weight="800" class="font-mono" text-anchor="middle">3</text>
      <text x="72" y="32" fill="#0f172a" font-size="15" font-weight="700" class="font-sans">Offer $49/mo Founding Member Lifetime Deal</text>
      <text x="72" y="54" fill="#64748b" font-size="13" class="font-sans">Lock in first 20 clinics for $49/mo recurring before scaling to public channels and directory launches.</text>
    </g>
  </g>

  <!-- ================= FOOTER / AUTHENTICITY STAMP ================= -->
  <g transform="translate(100, 1380)">
    <line x1="0" y1="0" x2="1000" y2="0" stroke="#e2e8f0" stroke-width="1.5" />

    <g transform="translate(0, 30)">
      <text x="0" y="16" fill="#0f172a" font-size="14" font-weight="700" class="font-sans">Is My SaaS Taken? Intelligence Suite</text>
      <text x="0" y="36" fill="#94a3b8" font-size="12" class="font-sans">Live Web Crawling • Real Competitor Tracking • Moat Analysis</text>
    </g>

    <!-- Verified Badge (Right) -->
    <g transform="translate(760, 20)">
      <rect x="0" y="0" width="240" height="42" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
      <text x="120" y="26" fill="#15803d" font-size="12" font-weight="800" class="font-mono" text-anchor="middle">✓ VERIFIED BY ISMYSAAS</text>
    </g>

    <text x="0" y="85" fill="#cbd5e1" font-size="11" class="font-mono">
      ismysaastaken.live/scan/sc-9428-a • CONFIDENTIAL AND PROPRIETARY • PAGE 1 OF 1
    </text>
  </g>
</svg>
`;

// 2. TEMPLATE 2: Dark Terminal Intelligence Dossier (High-Tech / Bloomberg Aesthetic)
const terminalSvg = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="termGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141822" />
      <stop offset="100%" stop-color="#0d1017" />
    </linearGradient>
    <radialGradient id="amberGlow" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#f5a623" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#0b0d10" stop-opacity="0" />
    </radialGradient>
    <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.04)" />
    </pattern>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  </style>

  <!-- Base Canvas -->
  <rect width="1200" height="1600" fill="#0b0d10" />
  <rect width="1200" height="1600" fill="url(#dotGrid)" />
  <rect width="1200" height="1600" fill="url(#amberGlow)" />

  <!-- Sheet Container -->
  <rect x="50" y="50" width="1100" height="1500" rx="16" fill="#10141d" stroke="#1f2937" stroke-width="2" />

  <!-- ================= TERMINAL TOP BAR ================= -->
  <g transform="translate(90, 85)">
    <!-- Window buttons -->
    <circle cx="10" cy="10" r="5" fill="#ef4444" />
    <circle cx="28" cy="10" r="5" fill="#f59e0b" />
    <circle cx="46" cy="10" r="5" fill="#10b981" />

    <text x="75" y="14" fill="#94a3b8" font-size="11" font-weight="700" class="font-mono" letter-spacing="1px">
      ISMYSAASTAKEN // LIVE MARKET INTELLIGENCE TELEMETRY
    </text>

    <!-- Status pill -->
    <rect x="800" y="-3" width="120" height="24" rx="12" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" />
    <text x="860" y="13" fill="#10b981" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">STATUS: PASS</text>
  </g>

  <line x1="90" y1="125" x2="1110" y2="125" stroke="#1f2937" stroke-width="1.5" />

  <!-- ================= TARGET SCAN QUERY ================= -->
  <g transform="translate(90, 155)">
    <rect x="0" y="0" width="1020" height="110" rx="12" fill="#141924" stroke="#253248" stroke-width="1.5" />
    <text x="28" y="32" fill="#f5a623" font-size="11" font-weight="800" class="font-mono" letter-spacing="1.5px">&gt; TARGET INPUT SPECIFICATION</text>
    <text x="28" y="68" fill="#ffffff" font-size="22" font-weight="800" class="font-sans">
      "AI Meeting Notes &amp; Client Record Keeper for Licensed Therapists"
    </text>
    <text x="28" y="94" fill="#94a3b8" font-size="12" class="font-mono">
      INDEX: 42 SOURCES CRAWLED • ENGINE: REDDIT, PRODUCT HUNT, GOOGLE SERP, G2
    </text>
  </g>

  <!-- ================= TELEMETRY STATS GRID ================= -->
  <g transform="translate(90, 290)">
    <!-- Metric 1: Saturation Verdict -->
    <rect x="0" y="0" width="320" height="120" rx="12" fill="#13231b" stroke="#10b981" stroke-width="1.5" />
    <text x="24" y="30" fill="#10b981" font-size="11" font-weight="800" class="font-mono">SATURATION SCORE</text>
    <text x="24" y="70" fill="#34d399" font-size="30" font-weight="800" class="font-mono">LOW / OPEN</text>
    <text x="24" y="96" fill="#86efac" font-size="12" class="font-sans">High probability of founder traction</text>

    <!-- Metric 2: Competitors Detected -->
    <g transform="translate(350, 0)">
      <rect x="0" y="0" width="320" height="120" rx="12" fill="#241b12" stroke="#f5a623" stroke-width="1.5" />
      <text x="24" y="30" fill="#f5a623" font-size="11" font-weight="800" class="font-mono">DIRECT COMPETITORS</text>
      <text x="24" y="70" fill="#fbbf24" font-size="30" font-weight="800" class="font-mono">2 DETECTED</text>
      <text x="24" y="96" fill="#fde68a" font-size="12" class="font-sans">Otter, Fireflies (Generic only)</text>
    </g>

    <!-- Metric 3: Wedge Index -->
    <g transform="translate(700, 0)">
      <rect x="0" y="0" width="320" height="120" rx="12" fill="#151b28" stroke="#38bdf8" stroke-width="1.5" />
      <text x="24" y="30" fill="#38bdf8" font-size="11" font-weight="800" class="font-mono">WEDGE POTENTIAL</text>
      <text x="24" y="70" fill="#7dd3fc" font-size="30" font-weight="800" class="font-mono">8.6 / 10</text>
      <text x="24" y="96" fill="#bae6fd" font-size="12" class="font-sans">Zero-retention HIPAA moat</text>
    </g>
  </g>

  <!-- ================= DIRECT COMPETITORS BREAKDOWN ================= -->
  <g transform="translate(90, 440)">
    <text x="0" y="24" fill="#ffffff" font-size="17" font-weight="800" class="font-sans">
      &gt; DETECTED THREATS &amp; COMPETITOR PROFILE
    </text>

    <!-- Comp 1 -->
    <g transform="translate(0, 44)">
      <rect x="0" y="0" width="1020" height="68" rx="8" fill="#151b27" stroke="#253248" stroke-width="1" />
      <text x="24" y="30" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">Otter.ai</text>
      <text x="24" y="50" fill="#64748b" font-size="12" class="font-mono">POSITIONING: Generic Meeting Transcription Suite ($16.99/seat/mo)</text>

      <rect x="780" y="20" width="215" height="28" rx="6" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1" />
      <text x="887" y="38" fill="#f87171" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">FATAL GAP: NOT HIPAA COMPLIANT</text>
    </g>

    <!-- Comp 2 -->
    <g transform="translate(0, 126)">
      <rect x="0" y="0" width="1020" height="68" rx="8" fill="#151b27" stroke="#253248" stroke-width="1" />
      <text x="24" y="30" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">Fireflies.ai</text>
      <text x="24" y="50" fill="#64748b" font-size="12" class="font-mono">POSITIONING: B2B Enterprise Bot Assistant ($18.00/seat/mo)</text>

      <rect x="780" y="20" width="215" height="28" rx="6" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1" />
      <text x="887" y="38" fill="#f87171" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">FATAL GAP: DATA RETENTION RISK</text>
    </g>

    <!-- Comp 3 -->
    <g transform="translate(0, 208)">
      <rect x="0" y="0" width="1020" height="68" rx="8" fill="#151b27" stroke="#253248" stroke-width="1" />
      <text x="24" y="30" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">Heidi Health</text>
      <text x="24" y="50" fill="#64748b" font-size="12" class="font-mono">POSITIONING: Hospital &amp; General Practitioner Scribe ($79.00/seat/mo)</text>

      <rect x="780" y="20" width="215" height="28" rx="6" fill="rgba(245, 166, 35, 0.15)" stroke="#f5a623" stroke-width="1" />
      <text x="887" y="38" fill="#fbbf24" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">GAP: TOO EXPENSIVE FOR CLINICS</text>
    </g>
  </g>

  <!-- ================= THE STRATEGIC MOAT & GAP ================= -->
  <g transform="translate(90, 755)">
    <rect x="0" y="0" width="1020" height="185" rx="14" fill="#181e2b" stroke="#f5a623" stroke-width="2" />
    <g transform="translate(32, 28)">
      <rect x="0" y="0" width="190" height="26" rx="6" fill="#f5a623" />
      <text x="95" y="18" fill="#000000" font-size="11" font-weight="900" class="font-mono" text-anchor="middle">DEFENSIBLE MOAT FOUND</text>

      <text x="0" y="64" fill="#ffffff" font-size="20" font-weight="800" class="font-sans">
        Zero-Retention Ephemeral Note Transcription for Therapy Practice
      </text>
      <text x="0" y="96" fill="#94a3b8" font-size="14" class="font-sans">
        Therapists are legally terrified of subpoenaed audio recordings. The big players store raw audio by design.
      </text>
      <text x="0" y="122" fill="#34d399" font-size="14" font-weight="700" class="font-sans">
        Your Winning Wedge: Transcribe client session locally in-memory, generate structured SOAP notes, and delete audio instantly.
      </text>
    </g>
  </g>

  <!-- ================= ACTIONABLE PLAYBOOK ================= -->
  <g transform="translate(90, 975)">
    <text x="0" y="24" fill="#ffffff" font-size="17" font-weight="800" class="font-sans">
      &gt; TACTICAL 3-STEP BUILD PLAN
    </text>

    <!-- Step 1 -->
    <g transform="translate(0, 44)">
      <rect x="0" y="0" width="1020" height="74" rx="10" fill="#141823" stroke="#232d3f" stroke-width="1.5" />
      <rect x="20" y="18" width="36" height="36" rx="8" fill="#1d2638" stroke="#334155" stroke-width="1"/>
      <text x="38" y="42" fill="#f5a623" font-size="15" font-weight="800" class="font-mono" text-anchor="middle">01</text>
      <text x="74" y="34" fill="#ffffff" font-size="15" font-weight="700" class="font-sans">Manual Cold Outreach ($0 Code Stage)</text>
      <text x="74" y="54" fill="#94a3b8" font-size="12.5" class="font-sans">Interview 10 solo therapy practitioners. Verify if "zero audio retention" is their #1 barrier to using AI tools.</text>
    </g>

    <!-- Step 2 -->
    <g transform="translate(0, 132)">
      <rect x="0" y="0" width="1020" height="74" rx="10" fill="#141823" stroke="#232d3f" stroke-width="1.5" />
      <rect x="20" y="18" width="36" height="36" rx="8" fill="#1d2638" stroke="#334155" stroke-width="1"/>
      <text x="38" y="42" fill="#f5a623" font-size="15" font-weight="800" class="font-mono" text-anchor="middle">02</text>
      <text x="74" y="34" fill="#ffffff" font-size="15" font-weight="700" class="font-sans">Build Single-Tenant HIPAA Compliant MVP</text>
      <text x="74" y="54" fill="#94a3b8" font-size="12.5" class="font-sans">Use self-hosted Whisper or private AWS Bedrock instance with signed BAA. Guarantee zero audio footprint.</text>
    </g>

    <!-- Step 3 -->
    <g transform="translate(0, 220)">
      <rect x="0" y="0" width="1020" height="74" rx="10" fill="#141823" stroke="#232d3f" stroke-width="1.5" />
      <rect x="20" y="18" width="36" height="36" rx="8" fill="#1d2638" stroke="#334155" stroke-width="1"/>
      <text x="38" y="42" fill="#f5a623" font-size="15" font-weight="800" class="font-mono" text-anchor="middle">03</text>
      <text x="74" y="34" fill="#ffffff" font-size="15" font-weight="700" class="font-sans">Monetize at $49/mo (5x Faster than Generic SaaS)</text>
      <text x="74" y="54" fill="#94a3b8" font-size="12.5" class="font-sans">Private clinics willingly expense $49/seat/mo because note writing currently burns 8 hours/week of unpaid time.</text>
    </g>
  </g>

  <!-- ================= TERMINAL FOOTER ================= -->
  <g transform="translate(90, 1380)">
    <line x1="0" y1="0" x2="1020" y2="0" stroke="#1f2937" stroke-width="1.5" />

    <g transform="translate(0, 30)">
      <text x="0" y="16" fill="#f5a623" font-size="14" font-weight="800" class="font-mono">ISMYSAASTAKEN.LIVE // INTELLIGENCE VERDICT</text>
      <text x="0" y="38" fill="#64748b" font-size="12" class="font-mono">TELEMETRY CHECKSUM: 0x892F_VERIFIED • WEB-GROUNDED</text>
    </g>

    <g transform="translate(770, 20)">
      <rect x="0" y="0" width="250" height="42" rx="8" fill="#132016" stroke="#10b981" stroke-width="1" />
      <text x="125" y="26" fill="#10b981" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">CRYPTOGRAPHICALLY LOGGED</text>
    </g>

    <text x="0" y="85" fill="#475569" font-size="11" class="font-mono">
      PAGE 1/1 • GENERATED ON DEMAND • CONFIDENTIAL STARTUP REPORT
    </text>
  </g>
</svg>
`;

async function run() {
  const targetDir = path.join(__dirname, '../public/templates');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outExec = path.join(targetDir, 'template-1-executive.png');
  const outTerm = path.join(targetDir, 'template-2-terminal.png');

  await sharp(Buffer.from(executiveSvg)).png().toFile(outExec);
  console.log('Generated Template 1:', outExec);

  await sharp(Buffer.from(terminalSvg)).png().toFile(outTerm);
  console.log('Generated Template 2:', outTerm);

  // Also copy to artifact directory
  const artifactDir = 'C:\\Users\\subha\\.gemini\\antigravity\\brain\\6c9fd4a9-d7b8-4e2e-a0b3-4e38e5f3e66e';
  fs.copyFileSync(outExec, path.join(artifactDir, 'template-1-executive.png'));
  fs.copyFileSync(outTerm, path.join(artifactDir, 'template-2-terminal.png'));
  console.log('Copied to artifact dir successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
