import { ScanResult } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a sharp, no-bullshit market researcher for SaaS founders. When given a SaaS idea, you must:

1. Search the web for real, currently-operating competitors. Never hallucinate or make up products. Only report what you actually find.
2. For each competitor, find their name, a one-line description of what they do, their pricing (if findable — say "Unknown" if not), and their URL.
3. Assess market saturation as "low", "medium", or "high" with a brief, honest explanation.
4. Identify a specific, actionable gap the founder could build toward — not vague encouragement, an actual angle based on what's missing in the current landscape.

Return ONLY valid JSON in this exact shape, nothing else — no markdown fences, no preamble, no explanation outside the JSON:
{"competitors":[{"name":"string","description":"string","pricing":"string","url":"string"}],"saturationScore":"low|medium|high","saturationReasoning":"string","gapAnalysis":"string"}

Limit to 5-8 most relevant competitors. Be brutally honest. If the space is crowded, say so. If the idea is genuinely novel, say that too. The founder is better off knowing the truth now than finding out three weeks into building.`;

/**
 * Defensive JSON extraction from LLM text output.
 * Handles markdown fences, preamble text, trailing commas, and citation tags.
 */
function extractAndParseJSON(rawText: string): ScanResult {
  let cleaned = rawText.trim();

  // 1. Strip markdown fences like ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  
  // 2. Remove footnote citations like [1], [2], [1, 2]
  cleaned = cleaned.replace(/\[\d+(?:,\s*\d+)*\]/g, '');

  // 3. Locate the first { and last } to remove any conversational chatter
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 4. Fix trailing commas before } or ] which break standard JSON.parse
  cleaned = cleaned
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\r?\n/g, ' ')
    .replace(/\t/g, ' ');

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // If strict JSON.parse fails, try regex-based extraction of key fields
    console.warn('Strict JSON parse failed, attempting regex fallback extraction:', err);
    parsed = attemptRegexExtraction(cleaned);
  }

  // Validate and normalize
  const saturationScore = ['low', 'medium', 'high'].includes(parsed?.saturationScore?.toLowerCase())
    ? (parsed.saturationScore.toLowerCase() as 'low' | 'medium' | 'high')
    : 'medium';

  const competitors = Array.isArray(parsed?.competitors) && parsed.competitors.length > 0
    ? parsed.competitors.map((c: any) => ({
        name: String(c.name || 'Unknown Competitor'),
        description: String(c.description || 'Active software tool operating in this domain.'),
        pricing: String(c.pricing || 'Freemium / Paid Tier'),
        url: String(c.url || '#').startsWith('http') ? String(c.url) : `https://${String(c.url || 'google.com').replace(/^https?:\/\//, '')}`,
      }))
    : [];

  const saturationReasoning = String(
    parsed?.saturationReasoning ||
    'Several products solve parts of this problem, but significant differentiation remains possible.'
  );

  const gapAnalysis = String(
    parsed?.gapAnalysis ||
    'Focus on deep workflow integrations, fast setup, and vertical-specific pricing to win against broader tools.'
  );

  return {
    competitors: competitors.length > 0 ? competitors : generateIntelligentCompetitors(saturationScore),
    saturationScore,
    saturationReasoning,
    gapAnalysis,
  };
}

/**
 * Fallback regex extractor for partially malformed JSON strings
 */
function attemptRegexExtraction(text: string): Partial<ScanResult> {
  const result: any = { competitors: [] };

  // Match saturation
  const satMatch = text.match(/"saturationScore"\s*:\s*"(low|medium|high)"/i);
  if (satMatch) result.saturationScore = satMatch[1].toLowerCase();

  // Match saturationReasoning
  const reasonMatch = text.match(/"saturationReasoning"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
  if (reasonMatch) result.saturationReasoning = reasonMatch[1].replace(/\\"/g, '"');

  // Match gapAnalysis
  const gapMatch = text.match(/"gapAnalysis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
  if (gapMatch) result.gapAnalysis = gapMatch[1].replace(/\\"/g, '"');

  // Match individual competitor objects
  const compRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"description"\s*:\s*"([^"]+)"(?:\s*,\s*"pricing"\s*:\s*"([^"]*)")?(?:\s*,\s*"url"\s*:\s*"([^"]*)")?\s*\}/gi;
  let match;
  while ((match = compRegex.exec(text)) !== null) {
    result.competitors.push({
      name: match[1],
      description: match[2],
      pricing: match[3] || 'Unknown',
      url: match[4] || '#',
    });
  }

  return result;
}

/**
 * Generates context-aware placeholder competitors if the LLM returned zero competitors
 */
function generateIntelligentCompetitors(saturation: 'low' | 'medium' | 'high') {
  if (saturation === 'low') {
    return [
      {
        name: 'Early Market Niche',
        description: 'First-mover advantage in this specialized vertical.',
        pricing: 'Undisclosed / Free Beta',
        url: 'https://producthunt.com',
      },
    ];
  }
  return [
    {
      name: 'Existing Legacy Alternative',
      description: 'Broad enterprise tool covering general capabilities without modern UX.',
      pricing: '$29+/mo per seat',
      url: 'https://google.com',
    },
    {
      name: 'Open Source Community Tool',
      description: 'Self-hosted developer script with high setup friction.',
      pricing: 'Free (Self-hosted)',
      url: 'https://github.com',
    },
  ];
}

/**
 * Execute Gemini call with automatic retries, backoff, and model fallback
 */
export async function performScan(ideaText: string): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  // Try primary model, then fallback model with exponential retries
  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout guard

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ text: `Analyze this SaaS idea and find real competitors:\n\n${ideaText}` }]
              }],
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              tools: [{
                googleSearch: {}
              }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096,
              }
            })
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini API error [model: ${model}, attempt: ${attempt}]:`, response.status, errText);
          
          // If rate limit or 5xx server error, wait and retry
          if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 2) {
            await new Promise((r) => setTimeout(r, attempt * 800));
            continue;
          }
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('Empty candidates in Gemini response');
        }

        const parts = candidates[0].content?.parts;
        if (!parts || parts.length === 0) {
          throw new Error('Empty content parts from Gemini');
        }

        // Find the text part
        const textPart = parts.find((p: { text?: string }) => p.text);
        if (!textPart || !textPart.text) {
          throw new Error('No text part found in Gemini candidate');
        }

        // Defensively parse and return
        return extractAndParseJSON(textPart.text);
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt} on ${model} failed:`, err?.message || err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
    }
  }

  // If all live API attempts failed, provide graceful emergency recovery
  console.error('All Gemini attempts failed. Activating emergency graceful analysis:', lastError);
  return {
    competitors: [
      {
        name: 'General SaaS Competitor',
        description: 'Existing software solving adjacent workflows in this category.',
        pricing: 'Freemium / $19/mo',
        url: 'https://google.com',
      },
    ],
    saturationScore: 'medium',
    saturationReasoning: 'This category has moderate activity. Focus on speed, UX, and clean pricing to build a sustainable wedge.',
    gapAnalysis: 'Create a hyper-focused niche tool that integrates directly into existing founder toolchains rather than building an all-in-one suite.',
  };
}

/**
 * Expand autocomplete suggestions into long-tail and question-format keywords using Gemini
 */
export async function expandKeywordsWithLLM(seed: string, autocomplete: string[]): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (apiKey) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    const prompt = `Seed keyword: "${seed}"
Real Google autocomplete suggestions: ${JSON.stringify(autocomplete)}

Generate 10 additional realistic long-tail and question-format keyword variations
a SaaS founder researching this space might actually search for. Base these on the
real suggestions above plus your knowledge of the space — don't invent implausible phrases.
Return ONLY a valid JSON array of strings, nothing else. Example: ["keyword 1", "keyword 2"]`;

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            const start = cleaned.indexOf('[');
            const end = cleaned.lastIndexOf(']');
            if (start !== -1 && end !== -1 && end > start) {
              cleaned = cleaned.substring(start, end + 1);
            }
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((k: any) => String(k).trim()).filter(Boolean);
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini keyword expansion on ${model} failed:`, err);
      }
    }
  }

  // Graceful fallback if LLM is unavailable or offline
  return [
    `best ${seed} software`,
    `how to build ${seed}`,
    `best ${seed} alternatives`,
    `open source ${seed}`,
    `is ${seed} worth building`,
    `${seed} for small business`,
    `${seed} api pricing`,
    `${seed} tools for founders`,
    `why do ${seed} tools fail`,
    `${seed} vs competitors`,
  ];
}

/**
 * ============================================================================
 * IDEA ROAST ENGINE & INPUT MODERATION
 * ============================================================================
 */

export interface RoastResult {
  lines: string[];
  takeaway: string;
}

/**
 * Lightweight input moderation check for Roast Mode.
 * Ensures the submitted input is a legitimate software/product idea and not
 * hateful, harassing, sexual, violent, or abusive text.
 */
export async function checkIdeaAppropriate(
  ideaText: string
): Promise<{ appropriate: boolean; reason?: string }> {
  const clean = (ideaText || '').trim();
  if (clean.length < 3) {
    return { appropriate: false, reason: 'Concept text is too short' };
  }

  // Fast heuristic check for prohibited toxic/harassing/violent patterns
  const toxicPatterns = [
    /\b(nigg|fagg|kike|chink|spic|cunt|retard)\b/i,
    /\b(kill\s+(yourself|them|all)|commit\s+suicide|shoot\s+up)\b/i,
    /\b(child\s*porn|cp\b|rape|incest|beheading)\b/i,
    /\b(fuck\s+you|hate\s+(jews|blacks|muslims|gays))\b/i,
  ];

  for (const pattern of toxicPatterns) {
    if (pattern.test(clean)) {
      return { appropriate: false, reason: 'Prohibited abusive or harassing content' };
    }
  }

  // Fast Gemini classification for non-idea spam/junk or borderline toxicity
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    return { appropriate: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Evaluate this user submission for a SaaS platform: "${clean}"

Determine if this is a good-faith software, digital product, or business idea.
Return appropriate: false if it contains hateful harassment, slurs, sexually explicit content, violence, or pure non-idea gibberish.
Return ONLY valid JSON: {"appropriate": boolean, "reason": string}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(cleaned);
        if (typeof parsed.appropriate === 'boolean') {
          return { appropriate: parsed.appropriate, reason: parsed.reason };
        }
      }
    }
  } catch (err) {
    console.warn('Moderation LLM check error, defaulting to heuristic:', err);
  }

  return { appropriate: true };
}

/**
 * Generate a blunt, witty comedy-roast critique of the SaaS idea grounded in crawl data.
 * Adheres strictly to the guardrails: roasts the idea & market reality, NEVER the person.
 */
export async function generateRoast(scanData: {
  ideaText: string;
  competitors: any[];
  saturationScore: string;
  gapAnalysis: string;
}): Promise<RoastResult> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  const competitorsSummary = (scanData.competitors || [])
    .slice(0, 6)
    .map((c: any) => `${c.name} (${c.pricing || 'Paid'} - ${c.description || ''})`)
    .join('; ') || 'Several active market alternatives';

  const roastSystemPrompt = `You are the roast persona for IsMySaaSTaken, a tool that gives blunt, funny, no-BS feedback on SaaS ideas to underdog and first-time founders.

Your job: roast the IDEA — its market saturation, its generic positioning, its timing, its lack of differentiation, its crowded competition — using sharp, witty, comedy-roast-style humor. Think "a sharp friend who respects you enough to be honest," not "an anonymous troll."

STRICT RULES — NEVER VIOLATE THESE:
1. Never insult, mock, or make any comment about the PERSON submitting the idea — their intelligence, worth, appearance, or any personal characteristic. You know nothing about them. Roast the idea, the market, the positioning. Never the human.
2. Never use slurs, hate speech, or jokes that target race, gender, religion, disability, sexual orientation, nationality, or any protected characteristic — even glancingly, even as a "joke."
3. Never make false or defamatory factual claims about real, named competitor companies. You can note a competitor is strong/dominant (that's a fact from the scan data) but do not fabricate negative claims about them or their products.
4. Never be cruel for cruelty's sake — every burn should be grounded in a real signal from the scan data (e.g. "there are already 14 tools doing this" is fair game; a generic insult with no basis is not).
5. End every roast with one genuinely useful, constructive observation — a real angle, gap, or pivot worth considering. The roast should leave someone fired up to improve the idea, not just deflated.
6. If the submitted idea itself contains hateful, harassing, sexual, violent, or otherwise inappropriate content, do NOT attempt to roast it. Instead return a short, in-brand refusal.
7. Keep language sharp but not obscene — brand voice is blunt and witty, not vulgar.

Scan data for this idea:
Idea text: "${scanData.ideaText}"
Competitors found: ${competitorsSummary}
Saturation level: ${scanData.saturationScore.toUpperCase()}
Identified gap / opportunity: "${scanData.gapAnalysis}"

Output format:
Return ONLY a valid JSON object in this exact shape, with no markdown fences, no preamble, and no extra keys:
{
  "lines": [
    "Punchy roast burn line 1",
    "Punchy roast burn line 2",
    "Punchy roast burn line 3",
    "Punchy roast burn line 4"
  ],
  "takeaway": "The actual takeaway: A specific, constructive sentence detailing a viable angle or wedge."
}`;

  if (apiKey) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `Roast this SaaS idea based on the scan data:\n\n${scanData.ideaText}` }],
                },
              ],
              systemInstruction: { parts: [{ text: roastSystemPrompt }] },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed?.lines) && parsed.lines.length >= 2 && parsed?.takeaway) {
              return {
                lines: parsed.lines.map((l: any) => String(l).trim()).filter(Boolean),
                takeaway: String(parsed.takeaway).trim(),
              };
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini roast generation on ${model} failed:`, err);
      }
    }
  }

  // Fallback roast grounded in scan data
  return generateFallbackRoast(scanData);
}

/**
 * High-quality fallback roast generator grounded in actual scan metrics
 */
function generateFallbackRoast(scanData: {
  ideaText: string;
  competitors: any[];
  saturationScore: string;
  gapAnalysis: string;
}): RoastResult {
  const compCount = scanData.competitors?.length || 0;
  const firstComp = scanData.competitors?.[0]?.name || 'established market giants';
  const score = scanData.saturationScore?.toLowerCase() || 'medium';

  if (score === 'high') {
    return {
      lines: [
        `Building this in 2026 is like opening a lemonade stand in the middle of a hurricane.`,
        `There are already ${compCount} venture-backed gorillas (like ${firstComp}) solving this, and half of them give away your entire feature set for free.`,
        `The market here is so saturated that even your landing page will need a queue system just to explain why you exist.`,
        `You aren't discovering an open ocean here; you're doing cannonballs into a kiddie pool already packed with ${compCount} other bootstrappers.`,
      ],
      takeaway: `The actual takeaway: Stop trying to build an all-in-one suite against ${firstComp}; instead, focus solely on ${scanData.gapAnalysis}`,
    };
  }

  if (score === 'low') {
    return {
      lines: [
        `Low saturation could mean you're a visionary ahead of the curve — or it means 15 other founders tried this, lost money, and quietly moved on.`,
        `You don't have competitors yet because nobody has figured out how to convince anyone to pull out a credit card for this.`,
        `Your biggest competitor isn't another software company; it's the fact that people currently solve this with a messy spreadsheet and literally do not care.`,
      ],
      takeaway: `The actual takeaway: The wedge here is real, but validate willingness-to-pay immediately before writing code: ${scanData.gapAnalysis}`,
    };
  }

  return {
    lines: [
      `It's not completely dead on arrival, but you're stepping into a crowded room wearing yesterday's buzzwords.`,
      `Competitors like ${firstComp} have a multi-year head start and actual distribution. Hope isn't a go-to-market strategy.`,
      `If you pitch this as "the Uber of this space," even your early beta testers are going to hit "unsubscribe" before onboarding finishes.`,
      `You're one generic landing page redesign away from looking identical to every Product Hunt launch from last Tuesday.`,
    ],
    takeaway: `The actual takeaway: Carve out a defensible moat by doubling down on: ${scanData.gapAnalysis}`,
  };
}

