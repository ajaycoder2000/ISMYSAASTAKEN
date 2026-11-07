const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============================================================================
// TEMPLATE 3: The YC / Warm Editorial Pitch Canvas (Cream, Slate & Burnt Amber)
// ============================================================================
const canvasSvg = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.04" />
    </filter>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  </style>

  <!-- Canvas Background (Warm editorial cream) -->
  <rect width="1200" height="1600" fill="#f6f4ee" />

  <!-- Sheet Paper Surface -->
  <rect x="50" y="50" width="1100" height="1500" rx="14" fill="#ffffff" stroke="#e8e5dc" stroke-width="2" />

  <!-- Top Accent Bar -->
  <rect x="50" y="50" width="1100" height="10" fill="#d97706" />

  <!-- Header -->
  <g transform="translate(100, 95)">
    <text x="0" y="32" fill="#1c1917" font-size="28" font-weight="800" class="font-sans" letter-spacing="-0.5px">
      IsMySaaS<tspan fill="#d97706">Taken</tspan><tspan fill="#10b981">?</tspan>
    </text>
    <text x="0" y="56" fill="#78716c" font-size="12" font-weight="700" class="font-mono" letter-spacing="2px">
      STARTUP MARKET CANVAS // SECTOR INTELLIGENCE
    </text>

    <!-- Stamp in top right -->
    <g transform="translate(740, 0)">
      <rect x="0" y="0" width="260" height="60" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
      <text x="130" y="24" fill="#b45309" font-size="10" font-weight="800" class="font-mono" text-anchor="middle">MARKET STATUS</text>
      <text x="130" y="46" fill="#78350f" font-size="16" font-weight="800" class="font-sans" text-anchor="middle">VERIFIED WEDGE GAP</text>
    </g>
  </g>

  <line x1="100" y1="180" x2="1100" y2="180" stroke="#e7e5e4" stroke-width="1.5" />

  <!-- Target Idea Banner -->
  <g transform="translate(100, 205)">
    <rect x="0" y="0" width="1000" height="90" rx="10" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1.5" />
    <text x="24" y="28" fill="#78716c" font-size="11" font-weight="700" class="font-mono" letter-spacing="1px">VALIDATION TARGET</text>
    <text x="24" y="60" fill="#1c1917" font-size="21" font-weight="800" class="font-sans">
      "AI Meeting Notes &amp; Client Record Keeper for Licensed Therapists"
    </text>
  </g>

  <!-- Two Column Layout (Left: Signals & User Quotes | Right: Market Wedge & Competitors) -->

  <!-- ================= LEFT COLUMN (Width: 460px) ================= -->
  <g transform="translate(100, 320)">
    <!-- Card: Saturation & Demand -->
    <rect x="0" y="0" width="460" height="140" rx="12" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1.5" />
    <text x="20" y="28" fill="#78716c" font-size="11" font-weight="800" class="font-mono">MARKET SATURATION SCORE</text>
    <text x="20" y="70" fill="#166534" font-size="34" font-weight="800" class="font-sans">24% <tspan font-size="18" fill="#15803d">(LOW)</tspan></text>
    <text x="20" y="98" fill="#44403c" font-size="13" class="font-sans">General space is crowded, but medical sub-niche is wide open.</text>
    <text x="20" y="118" fill="#15803d" font-size="12" font-weight="700" class="font-sans">✓ Strong founder recommendation to proceed</text>

    <!-- Card: Voice of the Customer (Reddit & Twitter Signals) -->
    <g transform="translate(0, 160)">
      <rect x="0" y="0" width="460" height="320" rx="12" fill="#fdfbf7" stroke="#e8e2d2" stroke-width="1.5" />
      <text x="20" y="30" fill="#b45309" font-size="11" font-weight="800" class="font-mono" letter-spacing="1px">VOICE OF CUSTOMER (REDDIT / FORUMS)</text>

      <!-- Quote 1 -->
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="420" height="74" rx="8" fill="#ffffff" stroke="#e8e2d2" stroke-width="1" />
        <text x="14" y="24" fill="#1c1917" font-size="12.5" font-weight="600" class="font-sans">"My therapy malpractice insurance won't let</text>
        <text x="14" y="44" fill="#1c1917" font-size="12.5" font-weight="600" class="font-sans">me touch Otter because of permanent audio storage."</text>
        <text x="14" y="62" fill="#78716c" font-size="10.5" class="font-mono">r/therapists • 48 upvotes</text>
      </g>

      <!-- Quote 2 -->
      <g transform="translate(20, 136)">
        <rect x="0" y="0" width="420" height="74" rx="8" fill="#ffffff" stroke="#e8e2d2" stroke-width="1" />
        <text x="14" y="24" fill="#1c1917" font-size="12.5" font-weight="600" class="font-sans">"I spend 10 hours every weekend writing notes.</text>
        <text x="14" y="44" fill="#1c1917" font-size="12.5" font-weight="600" class="font-sans">I would happily pay $50/mo for a private tool."</text>
        <text x="14" y="62" fill="#78716c" font-size="10.5" class="font-mono">Psychology Today Forum • Verified Clinician</text>
      </g>

      <!-- Key Takeaway -->
      <g transform="translate(20, 222)">
        <text x="0" y="20" fill="#78716c" font-size="10.5" font-weight="800" class="font-mono">VALIDATION SIGNAL</text>
        <text x="0" y="40" fill="#1c1917" font-size="13" font-weight="700" class="font-sans">Pain urgency: HIGH • Price sensitivity: LOW ($50-$80/mo)</text>
        <text x="0" y="60" fill="#44403c" font-size="12" class="font-sans">Decision makers are solo practitioners who purchase immediately.</text>
      </g>
    </g>

    <!-- Card: Pricing Strategy Recommendation -->
    <g transform="translate(0, 500)">
      <rect x="0" y="0" width="460" height="150" rx="12" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1.5" />
      <text x="20" y="28" fill="#78716c" font-size="11" font-weight="800" class="font-mono">OPTIMAL PRICING ARCHITECTURE</text>
      <text x="20" y="60" fill="#1c1917" font-size="18" font-weight="800" class="font-sans">$49/month or $490/year</text>
      <text x="20" y="84" fill="#44403c" font-size="12.5" class="font-sans">Do NOT offer a free plan. Clinicians distrust "free" healthcare software due to data sale fears. Offer a 14-day zero-risk trial instead.</text>
    </g>
  </g>

  <!-- ================= RIGHT COLUMN (Width: 510px) ================= -->
  <g transform="translate(590, 320)">
    <!-- Winning Wedge Callout -->
    <rect x="0" y="0" width="510" height="210" rx="12" fill="#fffbeb" stroke="#d97706" stroke-width="2" />
    <g transform="translate(24, 24)">
      <rect x="0" y="0" width="160" height="24" rx="4" fill="#d97706" />
      <text x="80" y="16" fill="#ffffff" font-size="10.5" font-weight="800" class="font-mono" text-anchor="middle">WHERE YOU WIN</text>

      <text x="0" y="56" fill="#78350f" font-size="19" font-weight="800" class="font-sans">
        The Zero-Audio-Retention Moat
      </text>
      <text x="0" y="86" fill="#92400e" font-size="13" class="font-sans">
        Otter and Fireflies are built on recording archival. You can outmaneuver them by turning the exact opposite into your superpower:
      </text>
      <text x="0" y="128" fill="#78350f" font-size="13.5" font-weight="700" class="font-sans">
        "Audio is transcribed in-memory and immediately destroyed. Even with a legal court order, there is zero audio to seize."
      </text>
    </g>

    <!-- Competitors Landscape -->
    <g transform="translate(0, 230)">
      <rect x="0" y="0" width="510" height="235" rx="12" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1.5" />
      <text x="20" y="28" fill="#78716c" font-size="11" font-weight="800" class="font-mono">CURRENT COMPETITOR STATUS</text>

      <!-- Row 1 -->
      <g transform="translate(20, 46)">
        <text x="0" y="16" fill="#1c1917" font-size="14" font-weight="800" class="font-sans">Otter.ai ($16.99/mo)</text>
        <text x="0" y="34" fill="#78716c" font-size="12" class="font-sans">Massive general market presence, zero clinical customization.</text>
      </g>
      <!-- Row 2 -->
      <g transform="translate(20, 102)">
        <text x="0" y="16" fill="#1c1917" font-size="14" font-weight="800" class="font-sans">Fireflies.ai ($18/mo)</text>
        <text x="0" y="34" fill="#78716c" font-size="12" class="font-sans">Focuses on Zoom sales calls; requires bot to join meetings (dealbreaker).</text>
      </g>
      <!-- Row 3 -->
      <g transform="translate(20, 158)">
        <text x="0" y="16" fill="#1c1917" font-size="14" font-weight="800" class="font-sans">Heidi Health ($79/mo)</text>
        <text x="0" y="34" fill="#78716c" font-size="12" class="font-sans">Too enterprise and clinical for independent psychotherapy practices.</text>
      </g>
    </g>

    <!-- Action Plan -->
    <g transform="translate(0, 485)">
      <rect x="0" y="0" width="510" height="165" rx="12" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" />
      <text x="20" y="28" fill="#166534" font-size="11" font-weight="800" class="font-mono">14-DAY VALIDATION ROADMAP</text>

      <g transform="translate(20, 48)">
        <text x="0" y="16" fill="#14532d" font-size="12.5" font-weight="700" class="font-sans">Day 1-4: Cold DM 20 private therapists on LinkedIn offering 1 pilot.</text>
        <text x="0" y="44" fill="#14532d" font-size="12.5" font-weight="700" class="font-sans">Day 5-9: Deploy Next.js landing page with Stripe pre-orders.</text>
        <text x="0" y="72" fill="#14532d" font-size="12.5" font-weight="700" class="font-sans">Day 10-14: If 3 pre-orders convert ($147), build and ship MVP in 7 days.</text>
      </g>
    </g>
  </g>

  <!-- ================= FOOTER ================= -->
  <g transform="translate(100, 1420)">
    <line x1="0" y1="0" x2="1000" y2="0" stroke="#e7e5e4" stroke-width="1.5" />
    <text x="0" y="34" fill="#78716c" font-size="12" font-weight="600" class="font-sans">IsMySaaSTaken.live Market Validation Platform</text>
    <text x="0" y="52" fill="#a8a29e" font-size="11" class="font-mono">REPORT IDENTIFIER: #MEMO-892F • CONFIDENTIAL</text>
  </g>
</svg>
`;

// ============================================================================
// TEMPLATE 4: Neo-Brutalist Founder Battlecard (Bold, Vibrant, High-Contrast)
// ============================================================================
const neoBrutalistSvg = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Hard drop shadows characteristic of neo-brutalism -->
    <filter id="brutalShadow" x="0" y="0" width="106%" height="106%">
      <feDropShadow dx="6" dy="6" stdDeviation="0" flood-color="#000000" />
    </filter>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  </style>

  <!-- Canvas Background (Pale energetic cream) -->
  <rect width="1200" height="1600" fill="#fcfbf7" />

  <!-- Sheet Paper Surface with 3px solid border & heavy black offset shadow -->
  <rect x="50" y="50" width="1100" height="1500" rx="16" fill="#fffdfa" stroke="#000000" stroke-width="3.5" filter="url(#brutalShadow)" />

  <!-- Top Strip -->
  <rect x="50" y="50" width="1100" height="24" rx="4" fill="#facc15" stroke="#000000" stroke-width="3" />

  <!-- Header -->
  <g transform="translate(90, 110)">
    <rect x="0" y="0" width="310" height="48" rx="8" fill="#000000" />
    <text x="155" y="32" fill="#facc15" font-size="22" font-weight="900" class="font-mono" text-anchor="middle">
      ISMYSAASTAKEN.LIVE
    </text>

    <!-- Right Header Badge -->
    <g transform="translate(710, 0)">
      <rect x="0" y="0" width="310" height="48" rx="8" fill="#bbf7d0" stroke="#000000" stroke-width="2.5" />
      <text x="155" y="30" fill="#000000" font-size="14" font-weight="900" class="font-mono" text-anchor="middle">
        ★ VERDICT: GREENLIGHT (BUILD)
      </text>
    </g>
  </g>

  <!-- Big Target Box -->
  <g transform="translate(90, 190)">
    <rect x="0" y="0" width="1020" height="120" rx="12" fill="#ffffff" stroke="#000000" stroke-width="3" filter="url(#brutalShadow)" />
    <text x="28" y="34" fill="#000000" font-size="12" font-weight="900" class="font-mono">VALIDATING SAAS PROPOSITION</text>
    <text x="28" y="74" fill="#000000" font-size="24" font-weight="900" class="font-sans">
      "AI Meeting Notes for Licensed Therapists &amp; Clinicians"
    </text>
    <text x="28" y="100" fill="#4b5563" font-size="13" font-weight="700" class="font-mono">
      NICHE: Mental Healthcare • B2B Micro-SaaS • Target MRR: $5,000 in 90 Days
    </text>
  </g>

  <!-- 3 Brutalist Stat Blocks -->
  <g transform="translate(90, 350)">
    <!-- Block 1 -->
    <rect x="0" y="0" width="320" height="130" rx="12" fill="#bbf7d0" stroke="#000000" stroke-width="3" filter="url(#brutalShadow)" />
    <text x="20" y="34" fill="#000000" font-size="12" font-weight="900" class="font-mono">SATURATION</text>
    <text x="20" y="80" fill="#000000" font-size="38" font-weight="900" class="font-sans">LOW</text>
    <text x="20" y="108" fill="#166534" font-size="12" font-weight="800" class="font-mono">→ Uncrowded territory</text>

    <!-- Block 2 -->
    <g transform="translate(350, 0)">
      <rect x="0" y="0" width="320" height="130" rx="12" fill="#fef08a" stroke="#000000" stroke-width="3" filter="url(#brutalShadow)" />
      <text x="20" y="34" fill="#000000" font-size="12" font-weight="900" class="font-mono">COMPETITION DENSITY</text>
      <text x="20" y="80" fill="#000000" font-size="38" font-weight="900" class="font-sans">2 TOOLS</text>
      <text x="20" y="108" fill="#854d0e" font-size="12" font-weight="800" class="font-mono">→ Both lack HIPAA</text>
    </g>

    <!-- Block 3 -->
    <g transform="translate(700, 0)">
      <rect x="0" y="0" width="320" height="130" rx="12" fill="#fed7aa" stroke="#000000" stroke-width="3" filter="url(#brutalShadow)" />
      <text x="20" y="34" fill="#000000" font-size="12" font-weight="900" class="font-mono">PRICING POWER</text>
      <text x="20" y="80" fill="#000000" font-size="38" font-weight="900" class="font-sans">$49/MO</text>
      <text x="20" y="108" fill="#9a3412" font-size="12" font-weight="800" class="font-mono">→ 3x generic SaaS prices</text>
    </g>
  </g>

  <!-- Competitors Strike List -->
  <g transform="translate(90, 525)">
    <text x="0" y="24" fill="#000000" font-size="18" font-weight="900" class="font-mono">
      [01] COMPETITOR FLANKING ANALYSIS
    </text>

    <!-- Comp 1 -->
    <g transform="translate(0, 42)">
      <rect x="0" y="0" width="1020" height="70" rx="10" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
      <text x="24" y="30" fill="#000000" font-size="17" font-weight="900" class="font-sans">Otter.ai ($16.99/mo)</text>
      <text x="24" y="52" fill="#4b5563" font-size="13" font-weight="600" class="font-sans">Giant in sales meetings. BUT: permanently stores audio, violating clinic liability.</text>

      <rect x="790" y="16" width="205" height="38" rx="6" fill="#fecaca" stroke="#000000" stroke-width="2" />
      <text x="892" y="40" fill="#991b1b" font-size="12" font-weight="900" class="font-mono" text-anchor="middle">VULNERABILITY: FATAL</text>
    </g>

    <!-- Comp 2 -->
    <g transform="translate(0, 126)">
      <rect x="0" y="0" width="1020" height="70" rx="10" fill="#ffffff" stroke="#000000" stroke-width="2.5" />
      <text x="24" y="30" fill="#000000" font-size="17" font-weight="900" class="font-sans">Fireflies.ai ($18.00/mo)</text>
      <text x="24" y="52" fill="#4b5563" font-size="13" font-weight="600" class="font-sans">Sends a public AI bot into calls. Therapists report patients refuse to speak when bot is present.</text>

      <rect x="790" y="16" width="205" height="38" rx="6" fill="#fecaca" stroke="#000000" stroke-width="2" />
      <text x="892" y="40" fill="#991b1b" font-size="12" font-weight="900" class="font-mono" text-anchor="middle">VULNERABILITY: HIGH</text>
    </g>
  </g>

  <!-- The Winning Weapon (Moat) -->
  <g transform="translate(90, 780)">
    <rect x="0" y="0" width="1020" height="200" rx="14" fill="#fef08a" stroke="#000000" stroke-width="3" filter="url(#brutalShadow)" />
    <g transform="translate(30, 30)">
      <rect x="0" y="0" width="210" height="30" rx="6" fill="#000000" />
      <text x="105" y="20" fill="#fef08a" font-size="12" font-weight="900" class="font-mono" text-anchor="middle">
        THE UNFAIR ADVANTAGE
      </text>

      <text x="0" y="70" fill="#000000" font-size="22" font-weight="900" class="font-sans">
        Zero-Retention Ephemeral Processing + SOAP Note Export
      </text>
      <text x="0" y="104" fill="#1c1917" font-size="14.5" font-weight="700" class="font-sans">
        The feature that makes you win isn't fancier AI—it's what you DELETE:
      </text>
      <text x="0" y="132" fill="#1c1917" font-size="14" class="font-sans">
        1. Transcribe audio locally in memory. 2. Output standard SOAP clinical notes. 3. Delete raw recording in 0 seconds.
      </text>
    </g>
  </g>

  <!-- 3-Step Action Checklist -->
  <g transform="translate(90, 1030)">
    <text x="0" y="24" fill="#000000" font-size="18" font-weight="900" class="font-mono">
      [02] NON-CODER 30-DAY EXECUTION PLAYBOOK
    </text>

    <!-- Item 1 -->
    <g transform="translate(0, 44)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <text x="24" y="30" fill="#000000" font-size="15" font-weight="900" class="font-mono">STEP 01 // PRE-SELL 3 CLINICS</text>
      <text x="24" y="50" fill="#4b5563" font-size="13" class="font-sans">Post in r/therapists offering to generate SOAP notes for 3 private practitioners by hand to test format acceptance.</text>
    </g>

    <!-- Item 2 -->
    <g transform="translate(0, 122)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <text x="24" y="30" fill="#000000" font-size="15" font-weight="900" class="font-mono">STEP 02 // BUILD MVP WITH CURSOR / AI</text>
      <text x="24" y="50" fill="#4b5563" font-size="13" class="font-sans">Build minimal upload box connected to Whisper API with custom clinical SOAP prompt. Do not add logins or billing yet.</text>
    </g>

    <!-- Item 3 -->
    <g transform="translate(0, 200)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <text x="24" y="30" fill="#000000" font-size="15" font-weight="900" class="font-mono">STEP 03 // LAUNCH AT $49/MONTH</text>
      <text x="24" y="50" fill="#4b5563" font-size="13" class="font-sans">Charge $49/mo on Stripe. 20 customers = $1,000 MRR. 100 customers = $5,000 MRR.</text>
    </g>
  </g>

  <!-- Footer -->
  <g transform="translate(90, 1420)">
    <line x1="0" y1="0" x2="1020" y2="0" stroke="#000000" stroke-width="2.5" />
    <text x="0" y="34" fill="#000000" font-size="13" font-weight="900" class="font-mono">
      VERIFIED VIA ISMYSAASTAKEN.LIVE • DATA BACKED STARTUP RADAR
    </text>
  </g>
</svg>
`;

// ============================================================================
// TEMPLATE 5: Corporate Market Analyst & 2x2 Quadrant (Slate Navy & Ice Blue)
// ============================================================================
const analystSvg = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="quadrantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(16, 185, 129, 0.08)" />
      <stop offset="100%" stop-color="rgba(16, 185, 129, 0.01)" />
    </linearGradient>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  </style>

  <!-- Background -->
  <rect width="1200" height="1600" fill="url(#bgGrad)" />

  <!-- Sheet Container -->
  <rect x="50" y="50" width="1100" height="1500" rx="16" fill="#0d1322" stroke="#1e293b" stroke-width="2" />

  <!-- Header -->
  <g transform="translate(90, 95)">
    <text x="0" y="30" fill="#38bdf8" font-size="12" font-weight="800" class="font-mono" letter-spacing="2px">
      STRATEGIC MARKET INTELLIGENCE REPORT
    </text>
    <text x="0" y="60" fill="#ffffff" font-size="26" font-weight="800" class="font-sans">
      IsMySaaS<tspan fill="#38bdf8">Taken</tspan> Analyst Brief
    </text>

    <!-- Meta Details -->
    <g transform="translate(720, 10)">
      <rect x="0" y="0" width="300" height="50" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1" />
      <text x="20" y="22" fill="#94a3b8" font-size="11" class="font-mono">BENCHMARK ID: IMST-2026-892F</text>
      <text x="20" y="38" fill="#38bdf8" font-size="11" font-weight="700" class="font-mono">VALIDATION VERDICT: OPEN OPPORTUNITY</text>
    </g>
  </g>

  <line x1="90" y1="175" x2="1110" y2="175" stroke="#1e293b" stroke-width="1.5" />

  <!-- Target Opportunity Summary -->
  <g transform="translate(90, 200)">
    <rect x="0" y="0" width="1020" height="90" rx="10" fill="#131b2e" stroke="#253550" stroke-width="1.5" />
    <text x="24" y="28" fill="#94a3b8" font-size="11" font-weight="800" class="font-mono">EVALUATED PROPOSITION</text>
    <text x="24" y="58" fill="#ffffff" font-size="20" font-weight="700" class="font-sans">
      "AI Meeting Notes &amp; Client Record Keeper for Licensed Therapists"
    </text>
  </g>

  <!-- ================= 2x2 COMPETITIVE POSITIONING MATRIX ================= -->
  <g transform="translate(90, 315)">
    <text x="0" y="24" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">
      1. Competitive Landscape Matrix (2x2 Quadrant)
    </text>

    <!-- Quadrant Box (500x380) -->
    <g transform="translate(0, 40)">
      <rect x="0" y="0" width="500" height="360" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5" />

      <!-- Sweet Spot Highlight (Top-Right Quadrant) -->
      <rect x="250" y="0" width="250" height="180" rx="12" fill="url(#quadrantGrad)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1.5" />
      <text x="375" y="30" fill="#10b981" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">★ YOUR OPPORTUNITY</text>

      <!-- Center Axes -->
      <line x1="250" y1="20" x2="250" y2="340" stroke="#374151" stroke-width="1.5" stroke-dasharray="4 4" />
      <line x1="20" y1="180" x2="480" y2="180" stroke="#374151" stroke-width="1.5" stroke-dasharray="4 4" />

      <!-- Axis Labels -->
      <text x="250" y="355" fill="#64748b" font-size="10" font-weight="700" class="font-mono" text-anchor="middle">
        ← GENERIC B2B  |  CLINICAL SPECIALIST →
      </text>
      <text x="14" y="100" fill="#64748b" font-size="10" font-weight="700" class="font-mono" transform="rotate(-90 14, 100)">
        HIGH DATA RETENTION RISK
      </text>
      <text x="14" y="280" fill="#10b981" font-size="10" font-weight="700" class="font-mono" transform="rotate(-90 14, 280)">
        ZERO RETENTION (HIPAA)
      </text>

      <!-- Plot Point: Otter.ai (Bottom Left - Red zone) -->
      <circle cx="90" cy="280" r="8" fill="#ef4444" />
      <text x="105" y="284" fill="#fca5a5" font-size="12" font-weight="700" class="font-sans">Otter.ai</text>

      <!-- Plot Point: Fireflies.ai (Bottom Left) -->
      <circle cx="160" cy="240" r="8" fill="#ef4444" />
      <text x="175" y="244" fill="#fca5a5" font-size="12" font-weight="700" class="font-sans">Fireflies</text>

      <!-- Plot Point: Heidi Health (Middle Right - High clinical, but high complexity) -->
      <circle cx="390" cy="240" r="8" fill="#f59e0b" />
      <text x="405" y="244" fill="#fde68a" font-size="12" font-weight="700" class="font-sans">Heidi ($79/mo)</text>

      <!-- Plot Point: YOUR SAAS (Top Right - Green sweet spot) -->
      <circle cx="375" cy="80" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2.5" />
      <text x="375" y="112" fill="#34d399" font-size="13" font-weight="800" class="font-sans" text-anchor="middle">YOUR SAAS ($49/mo)</text>
    </g>

    <!-- Right Side Metrics Breakdown (Width: 490px) -->
    <g transform="translate(530, 40)">
      <rect x="0" y="0" width="490" height="110" rx="10" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" />
      <text x="20" y="26" fill="#38bdf8" font-size="11" font-weight="800" class="font-mono">MARKET DEFICIT RATING</text>
      <text x="20" y="64" fill="#ffffff" font-size="32" font-weight="800" class="font-sans">8.8 / 10</text>
      <text x="20" y="90" fill="#94a3b8" font-size="12" class="font-sans">High willingness-to-pay + acute compliance void.</text>

      <!-- Strategic Moat Box -->
      <g transform="translate(0, 126)">
        <rect x="0" y="0" width="490" height="234" rx="10" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" />
        <text x="20" y="28" fill="#38bdf8" font-size="11" font-weight="800" class="font-mono">THE STRATEGIC WEDGE</text>
        <text x="20" y="58" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">Zero-Retention Local Audio Sanitization</text>
        <text x="20" y="86" fill="#94a3b8" font-size="13" class="font-sans">
          • Competitors treat audio as an asset to build data moats.
        </text>
        <text x="20" y="112" fill="#94a3b8" font-size="13" class="font-sans">
          • Therapists treat stored audio as a catastrophic legal liability.
        </text>
        <text x="20" y="138" fill="#94a3b8" font-size="13" class="font-sans">
          • By deleting audio immediately, you eliminate compliance friction.
        </text>
        <text x="20" y="174" fill="#34d399" font-size="13" font-weight="700" class="font-sans">
          Verdict: High-margin B2B wedge with low acquisition friction.
        </text>
      </g>
    </g>
  </g>

  <!-- ================= FINANCIAL & TRACTION PROJECTION ================= -->
  <g transform="translate(90, 745)">
    <text x="0" y="24" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">
      2. Unit Economics &amp; Realistic Milestones
    </text>

    <g transform="translate(0, 40)">
      <!-- Tier 1 -->
      <rect x="0" y="0" width="320" height="110" rx="10" fill="#111827" stroke="#1f2937" stroke-width="1.5" />
      <text x="20" y="28" fill="#94a3b8" font-size="11" font-weight="800" class="font-mono">STAGE 1: VALIDATION</text>
      <text x="20" y="60" fill="#38bdf8" font-size="26" font-weight="800" class="font-mono">10 CLINICS</text>
      <text x="20" y="88" fill="#94a3b8" font-size="12" class="font-sans">$490 MRR • Manual pilot stage</text>

      <!-- Tier 2 -->
      <g transform="translate(350, 0)">
        <rect x="0" y="0" width="320" height="110" rx="10" fill="#111827" stroke="#1f2937" stroke-width="1.5" />
        <text x="20" y="28" fill="#94a3b8" font-size="11" font-weight="800" class="font-mono">STAGE 2: SUSTAINABLE</text>
        <text x="20" y="60" fill="#38bdf8" font-size="26" font-weight="800" class="font-mono">50 CLINICS</text>
        <text x="20" y="88" fill="#94a3b8" font-size="12" class="font-sans">$2,450 MRR • Profitable solo run</text>
      </g>

      <!-- Tier 3 -->
      <g transform="translate(700, 0)">
        <rect x="0" y="0" width="320" height="110" rx="10" fill="#111827" stroke="#1f2937" stroke-width="1.5" />
        <text x="20" y="28" fill="#94a3b8" font-size="11" font-weight="800" class="font-mono">STAGE 3: SCALE</text>
        <text x="20" y="60" fill="#10b981" font-size="26" font-weight="800" class="font-mono">200 CLINICS</text>
        <text x="20" y="88" fill="#94a3b8" font-size="12" class="font-sans">$9,800 MRR • Freedom business</text>
      </g>
    </g>
  </g>

  <!-- ================= DE-RISKING ROADMAP ================= -->
  <g transform="translate(90, 930)">
    <text x="0" y="24" fill="#ffffff" font-size="16" font-weight="800" class="font-sans">
      3. Actionable De-risking Checklist
    </text>

    <g transform="translate(0, 42)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" />
      <text x="24" y="28" fill="#38bdf8" font-size="14" font-weight="800" class="font-mono">CHECK 01 // MALPRACTICE VERIFICATION</text>
      <text x="24" y="48" fill="#94a3b8" font-size="12.5" class="font-sans">Confirm state-level HIPAA compliance standards for in-memory Whisper processing.</text>
    </g>

    <g transform="translate(0, 120)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" />
      <text x="24" y="28" fill="#38bdf8" font-size="14" font-weight="800" class="font-mono">CHECK 02 // PRE-SELL DEPOSIT GATEWAY</text>
      <text x="24" y="48" fill="#94a3b8" font-size="12.5" class="font-sans">Collect $49 refundable pre-orders before writing back-end logic.</text>
    </g>

    <g transform="translate(0, 198)">
      <rect x="0" y="0" width="1020" height="66" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1.5" />
      <text x="24" y="28" fill="#38bdf8" font-size="14" font-weight="800" class="font-mono">CHECK 03 // SIMPLEPRACTICE INTEGRATION</text>
      <text x="24" y="48" fill="#94a3b8" font-size="12.5" class="font-sans">Provide 1-click clipboard paste formatted for SimplePractice EHR (therapists standard tool).</text>
    </g>
  </g>

  <!-- Footer -->
  <g transform="translate(90, 1420)">
    <line x1="0" y1="0" x2="1020" y2="0" stroke="#1e293b" stroke-width="1.5" />
    <text x="0" y="32" fill="#38bdf8" font-size="12" font-weight="700" class="font-mono">ISMYSAASTAKEN.LIVE // ENTERPRISE INTELLIGENCE REPORT</text>
    <text x="0" y="52" fill="#64748b" font-size="11" class="font-mono">PROPRIETARY ANALYSIS • DATA RETRIEVED ACROSS 42 CRAWLER ENDPOINTS</text>
  </g>
</svg>
`;

async function run() {
  const targetDir = path.join(__dirname, '../public/templates');
  const artifactDir = 'C:\\Users\\subha\\.gemini\\antigravity\\brain\\6c9fd4a9-d7b8-4e2e-a0b3-4e38e5f3e66e';

  const t3Path = path.join(targetDir, 'template-3-pitch-canvas.png');
  const t4Path = path.join(targetDir, 'template-4-neobrutalist.png');
  const t5Path = path.join(targetDir, 'template-5-analyst-quadrant.png');

  await sharp(Buffer.from(canvasSvg)).png().toFile(t3Path);
  console.log('Generated Template 3');

  await sharp(Buffer.from(neoBrutalistSvg)).png().toFile(t4Path);
  console.log('Generated Template 4');

  await sharp(Buffer.from(analystSvg)).png().toFile(t5Path);
  console.log('Generated Template 5');

  fs.copyFileSync(t3Path, path.join(artifactDir, 'template-3-pitch-canvas.png'));
  fs.copyFileSync(t4Path, path.join(artifactDir, 'template-4-neobrutalist.png'));
  fs.copyFileSync(t5Path, path.join(artifactDir, 'template-5-analyst-quadrant.png'));
  console.log('All templates successfully rendered & copied to artifact dir!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
