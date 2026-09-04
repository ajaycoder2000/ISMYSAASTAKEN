'use client';

import React, { useState } from 'react';
import Link from 'next/router'; // We will use next/link
import { useRouter } from 'next/navigation';
import KeywordTrendChart from './KeywordTrendChart';

interface CompetitionSignal {
  totalResults: number;
  topDomains: string[];
  label: 'Lower competition' | 'Moderate competition' | 'Higher competition';
  forumSignalsCount: number;
  note: string;
}

interface TrendPoint {
  date: string;
  interest: number;
}

interface KeywordData {
  seed: string;
  trend: TrendPoint[];
  autocomplete: string[];
  generatedKeywords: string[];
  competitionSignal: CompetitionSignal;
  fromCache?: boolean;
  fetchedAt?: string;
}

const SAMPLE_SEEDS = [
  'ai meeting notes',
  'linear alternative',
  'postgres backup saas',
  'b2b onboarding checklist',
  'social proof widget',
  'open source stripe billing',
];

export default function KeywordResearchView() {
  const router = useRouter();
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [results, setResults] = useState<KeywordData | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const handleSearch = async (targetSeed?: string) => {
    const query = (targetSeed || seed).trim();
    if (!query || query.length < 2) {
      setError('Please enter a seed keyword with at least 2 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setRateLimited(false);
    if (targetSeed) setSeed(targetSeed);

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
        }
        throw new Error(data.error || 'Failed to analyze keyword signals.');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Network error while fetching keyword signals.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleValidateIdea = (keywordIdea: string) => {
    // Navigate to homepage with prefilled idea
    router.push(`/?idea=${encodeURIComponent(keywordIdea)}`);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-8 sm:py-14 max-w-6xl mx-auto space-y-8">
      {/* Header telemetry brief */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(145,60%,45%,0.1)] border border-[hsl(145,60%,45%,0.25)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,60%,55%)] animate-pulse" />
          FREE-TIER SEO TELEMETRY
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight">
          SaaS Keyword Radar
        </h1>

        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
          Ground your product hypothesis in real search behavior. Search interest trajectory (0–100 scale), live Google autocomplete queries, and SERP competition signals.
        </p>
      </div>

      {/* Input Search Console */}
      <div className="max-w-3xl mx-auto bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[hsl(40,8%,45%)] font-mono text-sm">
              &gt;
            </div>
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. ai meeting notes, linear alternative, postgres backup saas..."
              disabled={loading}
              className="w-full pl-9 pr-28 py-3.5 bg-[hsl(220,16%,7%)] border border-[hsl(220,10%,20%)] focus:border-[hsl(145,60%,55%)] focus:ring-1 focus:ring-[hsl(145,60%,55%)] rounded-xl text-xs sm:text-sm text-[hsl(40,20%,95%)] placeholder:text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !seed.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[hsl(145,60%,45%)] hover:bg-[hsl(145,60%,50%)] disabled:opacity-40 disabled:hover:bg-[hsl(145,60%,45%)] text-[hsl(220,15%,8%)] font-bold text-xs rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-[hsl(220,15%,8%)] border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Radar Scan</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

          {/* Quick seed suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] uppercase tracking-wider mr-1">
              Try Seed:
            </span>
            {SAMPLE_SEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSearch(s)}
                disabled={loading}
                className="text-[11px] font-[family-name:var(--font-mono)] px-2.5 py-1 rounded-md bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] text-[hsl(40,20%,80%)] hover:text-[hsl(40,20%,95%)] border border-[hsl(220,10%,20%)] transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[hsl(0,70%,45%,0.1)] border border-[hsl(0,70%,50%,0.25)] text-xs text-[hsl(0,80%,70%)] font-[family-name:var(--font-mono)] flex items-start gap-2">
            <span>⚠️</span>
            <div className="flex-1">
              <p>{error}</p>
              {rateLimited && (
                <div className="mt-2">
                  <a
                    href="/pricing"
                    className="inline-block font-bold underline hover:text-white"
                  >
                    Upgrade to Sprint Pass or Founder Pro for unlimited research →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state skeleton */}
      {loading && (
        <div className="max-w-4xl mx-auto p-12 border border-[hsl(220,10%,18%)] rounded-2xl bg-[hsl(220,14%,10%)] text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[hsl(145,60%,55%)] border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Querying Free-Tier Search Grounding...
            </p>
            <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
              Parallelizing Google Trends interest curve + Google Suggest autocomplete + Page-1 SERP proxy
            </p>
          </div>
        </div>
      )}

      {/* Results Telemetry Panel */}
      {results && !loading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Cache Status Badge */}
          {results.fromCache && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
              <span>⚡ Served from 48-Hour Cache</span>
              <span>{results.fetchedAt ? new Date(results.fetchedAt).toLocaleDateString() : 'Fresh snapshot'}</span>
            </div>
          )}

          {/* Sub-panel 1: Search Interest Trend */}
          <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-7 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(145,60%,55%)] font-bold block">
                  SUB-PANEL 01 // TELEMETRY
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                  Search Interest Trend
                </h2>
              </div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] bg-[hsl(220,12%,14%)] px-2.5 py-1 rounded-md border border-[hsl(220,10%,20%)]">
                Seed: &quot;{results.seed}&quot;
              </span>
            </div>

            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
              Relative search interest (0–100 scale) over the past 12 months. Indicates consumer demand momentum.
            </p>

            <KeywordTrendChart data={results.trend} seed={results.seed} />
          </div>

          {/* 2-Column Grid: Panel 2 & Panel 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sub-panel 2: Keyword Generator & Expansion (7 cols) */}
            <div className="lg:col-span-7 bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-7 space-y-6">
              <div>
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] font-bold block">
                  SUB-PANEL 02 // DISCOVERY
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                  Keyword Ideas &amp; Founder Angles
                </h2>
                <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-1">
                  Live Google autocomplete queries combined with AI-expanded long-tail angles.
                </p>
              </div>

              {/* 1. Live Autocomplete Queries */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,20%,85%)] font-bold">
                    ⚡ Live Autocomplete Suggestions ({results.autocomplete?.length || 0})
                  </span>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
                    What searchers type
                  </span>
                </div>

                <div className="space-y-1.5">
                  {results.autocomplete && results.autocomplete.length > 0 ? (
                    results.autocomplete.map((kw, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)] hover:border-[hsl(220,10%,24%)] transition-colors"
                      >
                        <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,90%)] truncate">
                          {kw}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopy(kw)}
                            title="Copy keyword"
                            className="p-1 rounded bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,60%)] hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedKeyword === kw ? '✓' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValidateIdea(kw)}
                            title="Validate as SaaS idea"
                            className="px-2 py-1 rounded bg-[hsl(42,95%,55%,0.15)] hover:bg-[hsl(42,95%,55%,0.25)] text-[hsl(42,95%,55%)] text-[10px] font-[family-name:var(--font-mono)] font-bold transition-colors cursor-pointer"
                          >
                            Scan SaaS →
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] py-2">
                      No live autocomplete variants found for this exact seed.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. AI Long-Tail & Question Variations */}
              <div className="space-y-2.5 pt-3 border-t border-[hsl(220,10%,16%)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,20%,85%)] font-bold">
                    🎯 Founder Long-Tail &amp; Questions ({results.generatedKeywords?.length || 0})
                  </span>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)]">
                    Uncrowded Angles
                  </span>
                </div>

                <div className="space-y-1.5">
                  {results.generatedKeywords && results.generatedKeywords.length > 0 ? (
                    results.generatedKeywords.map((kw, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)] hover:border-[hsl(220,10%,24%)] transition-colors"
                      >
                        <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,20%,90%)] truncate">
                          {kw}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopy(kw)}
                            title="Copy keyword"
                            className="p-1 rounded bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,60%)] hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedKeyword === kw ? '✓' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValidateIdea(kw)}
                            title="Validate as SaaS idea"
                            className="px-2 py-1 rounded bg-[hsl(145,60%,45%,0.15)] hover:bg-[hsl(145,60%,45%,0.25)] text-[hsl(145,60%,55%)] text-[10px] font-[family-name:var(--font-mono)] font-bold transition-colors cursor-pointer"
                          >
                            Scan SaaS →
                          </button>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            </div>

            {/* Sub-panel 3: Competition Signal (5 cols) */}
            <div className="lg:col-span-5 bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(200,85%,60%)] font-bold block">
                    SUB-PANEL 03 // ESTIMATE
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Competition Signal
                  </h2>
                  <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mt-1">
                    Heuristic proxy derived from page-1 SERP diversity &amp; forum discussion presence.
                  </p>
                </div>

                {/* Competition Signal Status Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    results.competitionSignal.label === 'Lower competition'
                      ? 'bg-[hsl(145,60%,45%,0.1)] border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)]'
                      : results.competitionSignal.label === 'Moderate competition'
                      ? 'bg-[hsl(42,95%,55%,0.1)] border-[hsl(42,95%,55%,0.3)] text-[hsl(42,95%,55%)]'
                      : 'bg-[hsl(0,70%,50%,0.1)] border-[hsl(0,70%,50%,0.3)] text-[hsl(0,80%,70%)]'
                  }`}
                >
                  <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider block opacity-75">
                    Signal Proxy Verdict
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] mt-0.5">
                    {results.competitionSignal.label}
                  </div>
                  <p className="text-xs text-[hsl(40,20%,85%)] mt-2 font-[family-name:var(--font-inter)] leading-relaxed">
                    {results.competitionSignal.label === 'Lower competition'
                      ? 'Multiple community discussions (Reddit, forums, Indie Hackers) rank on page 1. This signal indicates strong user demand with softer incumbent software defense.'
                      : results.competitionSignal.label === 'Moderate competition'
                      ? 'A healthy blend of specialized indie tools and discussion threads. Viable opportunity wedge if your positioning is crisp.'
                      : 'Page 1 is dominated by entrenched software giants, directories, or enterprise brands. Requires strong wedge differentiation.'}
                  </p>
                </div>

                {/* Top Page 1 Domains */}
                <div className="space-y-2">
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,50%)] block">
                    Page 1 SERP Footprint
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {results.competitionSignal.topDomains?.map((domain, idx) => {
                      const isForum = /reddit|quora|forum|community|indiehackers|github|medium|stackoverflow/i.test(domain);
                      return (
                        <span
                          key={idx}
                          className={`text-[11px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded border ${
                            isForum
                              ? 'bg-[hsl(145,60%,45%,0.15)] border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,60%)] font-bold'
                              : 'bg-[hsl(220,12%,14%)] border-[hsl(220,10%,18%)] text-[hsl(40,8%,65%)]'
                          }`}
                        >
                          {domain} {isForum && '💬'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Forum Signals Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                    <span className="text-[10px] font-mono text-[hsl(40,8%,45%)] uppercase block">
                      Community Results
                    </span>
                    <span className="text-sm font-bold font-mono text-[hsl(40,20%,90%)]">
                      {results.competitionSignal.forumSignalsCount} threads detected
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                    <span className="text-[10px] font-mono text-[hsl(40,8%,45%)] uppercase block">
                      Indexed Results
                    </span>
                    <span className="text-sm font-bold font-mono text-[hsl(40,20%,90%)]">
                      ~{results.competitionSignal.totalResults.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Honesty Disclaimer Notice */}
              <div className="pt-4 border-t border-[hsl(220,10%,16%)] text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] leading-relaxed">
                ⚖️ <strong>Honesty Transparency:</strong> We label this as a <em>Competition Signal</em> estimate based on organic SERP composition. We never display a fabricated numeric score like &quot;72/100&quot; which would falsely imply backlink &amp; domain authority data we do not have.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
