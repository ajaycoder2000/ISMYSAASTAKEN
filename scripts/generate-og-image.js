const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background grid -->
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1"/>
    </pattern>

    <!-- Radial glows -->
    <radialGradient id="glowOrange" cx="80%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#f5a623" stop-opacity="0.16" />
      <stop offset="60%" stop-color="#f5a623" stop-opacity="0.02" />
      <stop offset="100%" stop-color="#0b0d10" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glowEmerald" cx="20%" cy="25%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.12" />
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.02" />
      <stop offset="100%" stop-color="#0b0d10" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#131722" />
      <stop offset="100%" stop-color="#0d1017" />
    </linearGradient>

    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <linearGradient id="rowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#181e2b" />
      <stop offset="100%" stop-color="#141824" />
    </linearGradient>
  </defs>

  <style>
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
  </style>

  <!-- Base background -->
  <rect width="1200" height="630" fill="#0b0d10" />

  <!-- Grid overlay -->
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Atmospheric glows -->
  <rect width="1200" height="630" fill="url(#glowOrange)" />
  <rect width="1200" height="630" fill="url(#glowEmerald)" />

  <!-- Subtle vignette border -->
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />

  <!-- ================= LEFT COLUMN (80px safe margin) ================= -->

  <!-- Top Green Label Pill -->
  <g transform="translate(80, 85)">
    <rect x="0" y="0" width="220" height="34" rx="17" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1" />
    <circle cx="18" cy="17" r="4.5" fill="#10b981" />
    <text x="32" y="22" fill="#10b981" font-size="12" font-weight="800" class="font-mono" letter-spacing="2px">IS MY SAAS TAKEN?</text>
  </g>

  <!-- Big Headline (74px, bold) -->
  <text x="80" y="200" fill="#ffffff" font-size="74" font-weight="800" class="font-sans" letter-spacing="-1.5px">Is Your SaaS Idea</text>
  <text x="80" y="285" fill="#f5a623" font-size="74" font-weight="800" class="font-sans" letter-spacing="-1.5px">Already Taken?</text>

  <!-- Subtext -->
  <text x="80" y="358" fill="#94a3b8" font-size="26" font-weight="500" class="font-sans" letter-spacing="-0.3px">
    Real competitors. Real gaps. No BS.
  </text>

  <!-- Feature Telemetry Chips -->
  <g transform="translate(80, 420)">
    <!-- Chip 1 -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="168" height="36" rx="8" fill="#141822" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="14" y="23" fill="#38bdf8" font-size="13" font-weight="700" class="font-mono">⚡ Live Web Search</text>
    </g>
    <!-- Chip 2 -->
    <g transform="translate(180, 0)">
      <rect x="0" y="0" width="165" height="36" rx="8" fill="#141822" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="14" y="23" fill="#f5a623" font-size="13" font-weight="700" class="font-mono">🎯 Moat Analysis</text>
    </g>
    <!-- Chip 3 -->
    <g transform="translate(357, 0)">
      <rect x="0" y="0" width="168" height="36" rx="8" fill="#141822" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <text x="14" y="23" fill="#10b981" font-size="13" font-weight="700" class="font-mono">✓ Free 10s Scan</text>
    </g>
  </g>

  <!-- Footer URL -->
  <g transform="translate(80, 535)">
    <text x="0" y="0" fill="#64748b" font-size="17" font-weight="600" class="font-mono" letter-spacing="0.5px">
      ismysaastaken.live
    </text>
  </g>


  <!-- ================= RIGHT COLUMN (Mock Results Card) ================= -->
  <!-- Bounded within x=670 to x=1120 (450px width), y=80 to y=550 (470px height) -->
  <g transform="translate(680, 80)">
    <!-- Outer Card Container -->
    <rect x="0" y="0" width="440" height="470" rx="20" fill="url(#cardGrad)" stroke="#222a3a" stroke-width="2"/>

    <!-- Terminal Window Bar -->
    <g transform="translate(24, 22)">
      <circle cx="6" cy="6" r="5" fill="#ef4444" opacity="0.85"/>
      <circle cx="24" cy="6" r="5" fill="#f59e0b" opacity="0.85"/>
      <circle cx="42" cy="6" r="5" fill="#10b981" opacity="0.85"/>

      <text x="66" y="10" fill="#64748b" font-size="11" font-weight="700" class="font-mono" letter-spacing="1.5px">
        LIVE VALIDATION SCAN
      </text>

      <rect x="300" y="-3" width="90" height="20" rx="10" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" />
      <text x="345" y="11" fill="#10b981" font-size="10" font-weight="800" class="font-mono" text-anchor="middle">VERIFIED</text>
    </g>

    <!-- Searched Idea Box -->
    <g transform="translate(24, 52)">
      <rect x="0" y="0" width="392" height="46" rx="10" fill="#181f2c" stroke="#28354b" stroke-width="1"/>
      <text x="14" y="20" fill="#64748b" font-size="10" font-weight="700" class="font-mono" letter-spacing="1px">SEARCHED CONCEPT</text>
      <text x="14" y="36" fill="#f1f5f9" font-size="13.5" font-weight="600" class="font-sans">"AI Meeting Notes for Linear &amp; Notion"</text>
    </g>

    <!-- Competitors Section Header -->
    <g transform="translate(24, 116)">
      <text x="0" y="0" fill="#94a3b8" font-size="11" font-weight="700" class="font-mono" letter-spacing="1.5px">
        DIRECT COMPETITORS FOUND (3)
      </text>
    </g>

    <!-- Competitor Row 1 -->
    <g transform="translate(24, 128)">
      <rect x="0" y="0" width="392" height="44" rx="8" fill="url(#rowGrad)" stroke="#222b3d" stroke-width="1"/>
      <circle cx="20" cy="22" r="7" fill="#3b82f6" opacity="0.3"/>
      <text x="20" y="26" fill="#60a5fa" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">O</text>
      <text x="36" y="26" fill="#f8fafc" font-size="14" font-weight="700" class="font-sans">Otter.ai</text>
      <text x="100" y="26" fill="#64748b" font-size="12" class="font-sans">· Meeting transcription suite</text>

      <rect x="312" y="10" width="66" height="24" rx="6" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.4)"/>
      <text x="345" y="26" fill="#f87171" font-size="10" font-weight="800" class="font-mono" text-anchor="middle">CROWDED</text>
    </g>

    <!-- Competitor Row 2 -->
    <g transform="translate(24, 180)">
      <rect x="0" y="0" width="392" height="44" rx="8" fill="url(#rowGrad)" stroke="#222b3d" stroke-width="1"/>
      <circle cx="20" cy="22" r="7" fill="#8b5cf6" opacity="0.3"/>
      <text x="20" y="26" fill="#a78bfa" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">F</text>
      <text x="36" y="26" fill="#f8fafc" font-size="14" font-weight="700" class="font-sans">Fireflies.ai</text>
      <text x="115" y="26" fill="#64748b" font-size="12" class="font-sans">· Automated bot recorder</text>

      <rect x="312" y="10" width="66" height="24" rx="6" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.4)"/>
      <text x="345" y="26" fill="#f87171" font-size="10" font-weight="800" class="font-mono" text-anchor="middle">CROWDED</text>
    </g>

    <!-- Competitor Row 3 -->
    <g transform="translate(24, 232)">
      <rect x="0" y="0" width="392" height="44" rx="8" fill="url(#rowGrad)" stroke="#222b3d" stroke-width="1"/>
      <circle cx="20" cy="22" r="7" fill="#ec4899" opacity="0.3"/>
      <text x="20" y="26" fill="#f472b6" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">G</text>
      <text x="36" y="26" fill="#f8fafc" font-size="14" font-weight="700" class="font-sans">Grain.com</text>
      <text x="110" y="26" fill="#64748b" font-size="12" class="font-sans">· Video clip highlights</text>

      <rect x="312" y="10" width="66" height="24" rx="6" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.4)"/>
      <text x="345" y="26" fill="#f87171" font-size="10" font-weight="800" class="font-mono" text-anchor="middle">CROWDED</text>
    </g>

    <!-- ================= MARKET GAP FOUND HIGHLIGHT BOX ================= -->
    <g transform="translate(24, 292)">
      <!-- Outer glow card -->
      <rect x="0" y="0" width="392" height="152" rx="14" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="1.8" stroke-dasharray="0"/>

      <!-- Header Badge -->
      <g transform="translate(16, 16)">
        <rect x="0" y="0" width="186" height="26" rx="6" fill="url(#badgeGrad)"/>
        <text x="93" y="17" fill="#090d0b" font-size="11" font-weight="800" class="font-mono" text-anchor="middle">✓ MARKET GAP FOUND</text>
      </g>

      <!-- Opportunity text -->
      <text x="16" y="68" fill="#ecfdf5" font-size="15" font-weight="700" class="font-sans">
        "HIPAA Audio Redaction for Therapists"
      </text>

      <text x="16" y="94" fill="#a7f3d0" font-size="12.5" font-weight="400" class="font-sans">
        Enterprise giants ignore solo clinician compliance.
      </text>

      <!-- Bottom verification bar -->
      <line x1="16" y1="112" x2="376" y2="112" stroke="rgba(16, 185, 129, 0.25)" stroke-width="1" />
      <text x="16" y="133" fill="#34d399" font-size="11" font-weight="700" class="font-mono" letter-spacing="1px">
        STATUS: UNCONTESTED OPPORTUNITY WEDGE
      </text>
    </g>
  </g>
</svg>
`;

async function generate() {
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  const buffer = Buffer.from(svgContent);

  await sharp(buffer)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`Generated og-image.png successfully at: ${outputPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB (under 5 MB)`);
}

generate().catch(err => {
  console.error('Error generating og-image:', err);
  process.exit(1);
});
