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

export async function performScan(ideaText: string): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('Empty response from Gemini');
    }

    // Find the text part
    const textPart = parts.find((p: { text?: string }) => p.text);
    if (!textPart || !textPart.text) {
      throw new Error('No text in Gemini response');
    }

    let rawText = textPart.text.trim();
    
    // Strip markdown fencing if present
    rawText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    rawText = rawText.trim();

    // Parse JSON defensively
    const parsed = JSON.parse(rawText);
    
    // Validate required fields
    if (!parsed.competitors || !Array.isArray(parsed.competitors)) {
      throw new Error('Invalid response: missing competitors array');
    }
    if (!['low', 'medium', 'high'].includes(parsed.saturationScore)) {
      throw new Error('Invalid response: invalid saturationScore');
    }
    if (!parsed.saturationReasoning || !parsed.gapAnalysis) {
      throw new Error('Invalid response: missing analysis fields');
    }

    // Clean up competitors
    const competitors = parsed.competitors.map((c: Record<string, string>) => ({
      name: c.name || 'Unknown',
      description: c.description || 'No description available',
      pricing: c.pricing || 'Unknown',
      url: c.url || '#',
    }));

    return {
      competitors,
      saturationScore: parsed.saturationScore,
      saturationReasoning: parsed.saturationReasoning,
      gapAnalysis: parsed.gapAnalysis,
    };
  } catch (error) {
    // If JSON parse failed, provide a clear error
    if (error instanceof SyntaxError) {
      console.error('Failed to parse LLM response as JSON:', error);
      throw new Error('The AI returned a garbled response. This happens occasionally — try again.');
    }
    throw error;
  }
}
