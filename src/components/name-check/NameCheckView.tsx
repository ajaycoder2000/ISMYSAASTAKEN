'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DomainCheckResult {
  domain: string;
  tld: string;
  available: boolean | null;
}

interface HandleCheckResult {
  platform: string;
  url: string;
  likelyAvailable: boolean | null;
}

interface NameCheckData {
  name: string;
  domains: DomainCheckResult[];
  handles: HandleCheckResult[];
  fromCache?: boolean;
  fetchedAt?: string;
}

const SAMPLE_NAMES = [
  'supastack',
  'promptkit',
  'linearflow',
  'nexuskit',
  'moatpulse',
  'devradar',
];

export default function NameCheckView() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [results, setResults] = useState<NameCheckData | null>(null);

  const cleanInput = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const handleCheck = async (targetName?: string) => {
    const raw = (targetName || name).trim();
    const normalized = raw.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!normalized || normalized.length < 2) {
      setError('Please enter a name with at least 2 alphanumeric characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setRateLimited(false);
    if (targetName) setName(targetName);

    try {
      const res = await fetch('/api/name-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
        }
        throw new Error(data.error || 'Failed to check name availability.');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Network error while checking name.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateIdea = () => {
    if (!results?.name) return;
    router.push(`/?idea=${encodeURIComponent(`SaaS software named ${results.name}`)}`);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-8 sm:py-14 max-w-5xl mx-auto space-y-8">
      {/* Header telemetry brief */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(42,95%,55%,0.1)] border border-[hsl(42,95%,55%,0.25)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
          FOUNDER IDENTITY RADAR // IS IT TAKEN?
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight">
          Is It Taken?
        </h1>

        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
          Check if your startup name is taken across .com, .io, .co, .app domains (via official RDAP protocol) and X, GitHub, Instagram, and TikTok — all in one search.
        </p>
      </div>

      {/* Input Search Console */}
      <div className="max-w-2xl mx-auto bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-4 sm:p-6 shadow-2xl relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheck();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[hsl(40,8%,45%)] font-mono text-sm">
              &gt;
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. supastack, promptkit, linearflow..."
              disabled={loading}
              className="w-full pl-9 pr-28 py-3.5 bg-[hsl(220,16%,7%)] border border-[hsl(220,10%,20%)] focus:border-[hsl(42,95%,55%)] focus:ring-1 focus:ring-[hsl(42,95%,55%)] rounded-xl text-xs sm:text-sm text-[hsl(40,20%,95%)] placeholder:text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !cleanInput}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] disabled:opacity-40 disabled:hover:bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] font-bold text-xs rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-[hsl(220,15%,8%)] border-t-transparent rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Check Name</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

          {/* Clean name indicator */}
          {cleanInput && (
            <div className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] flex items-center gap-1.5">
              <span>Checking handle handle slug:</span>
              <span className="text-[hsl(42,95%,55%)] font-bold">@{cleanInput}</span>
            </div>
          )}

          {/* Quick seed suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] uppercase tracking-wider mr-1">
              Sample Names:
            </span>
            {SAMPLE_NAMES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleCheck(s)}
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
                    Upgrade to Sprint Pass or Founder Pro for unlimited searches →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state skeleton */}
      {loading && (
        <div className="max-w-2xl mx-auto p-12 border border-[hsl(220,10%,18%)] rounded-2xl bg-[hsl(220,14%,10%)] text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[hsl(42,95%,55%)] border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
              Querying RDAP Domain Registries &amp; Social Endpoints...
            </p>
            <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
              Verifying .com, .io, .co, .app + probing profile availability on X, GitHub, Instagram, TikTok
            </p>
          </div>
        </div>
      )}

      {/* Results Telemetry Display */}
      {results && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
          {/* Cache Status Badge */}
          {results.fromCache && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,55%)]">
              <span>⚡ Served from 24-Hour Cache</span>
              <span>{results.fetchedAt ? new Date(results.fetchedAt).toLocaleDateString() : 'Recent check'}</span>
            </div>
          )}

          {/* 2-Column Results Layout: Domains vs Social Handles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Domain Availability (Official RDAP) */}
            <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,16%)]">
                <div>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(145,60%,55%)] font-bold block">
                    OFFICIAL RDAP PROTOCOL
                  </span>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Domain Names
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[hsl(40,8%,50%)] bg-[hsl(220,12%,14%)] px-2 py-0.5 rounded border border-[hsl(220,10%,20%)]">
                  Standardized
                </span>
              </div>

              <div className="space-y-2.5">
                {results.domains.map((d) => (
                  <div
                    key={d.domain}
                    className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        {d.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {d.available === true && (
                        <a
                          href={`https://porkbun.com/checkout/search?q=${encodeURIComponent(d.domain)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] hover:bg-[hsl(145,60%,45%,0.25)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold transition-colors"
                        >
                          ✓ Available ↗
                        </a>
                      )}

                      {d.available === false && (
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-[hsl(0,70%,50%,0.1)] hover:bg-[hsl(0,70%,50%,0.2)] border border-[hsl(0,70%,50%,0.25)] text-[hsl(0,75%,65%)] text-xs font-[family-name:var(--font-mono)] font-bold transition-colors"
                        >
                          Taken ↗
                        </a>
                      )}

                      {d.available === null && (
                        <span className="px-2.5 py-1 rounded-md bg-[hsl(220,10%,18%)] text-[hsl(40,8%,55%)] text-xs font-[family-name:var(--font-mono)]">
                          Couldn&apos;t check
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Social Handles (Heuristic Probing) */}
            <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,16%)]">
                <div>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] font-bold block">
                    PROFILE HEURISTIC
                  </span>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Social Handles
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2 py-0.5 rounded border border-[hsl(42,95%,55%,0.25)]">
                  Estimated
                </span>
              </div>

              <div className="space-y-2.5">
                {results.handles.map((h) => (
                  <div
                    key={h.platform}
                    className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        {h.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {h.likelyAvailable === true && (
                        <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                          ✓ Likely available
                        </span>
                      )}

                      {h.likelyAvailable === false && (
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-[hsl(42,95%,55%,0.1)] hover:bg-[hsl(42,95%,55%,0.2)] border border-[hsl(42,95%,55%,0.25)] text-[hsl(42,95%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold transition-colors"
                        >
                          Likely taken ↗
                        </a>
                      )}

                      {h.likelyAvailable === null && (
                        <span className="px-2.5 py-1 rounded-md bg-[hsl(220,10%,18%)] text-[hsl(40,8%,55%)] text-xs font-[family-name:var(--font-mono)]">
                          Couldn&apos;t check
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Honesty Note */}
          <div className="p-4 rounded-xl bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] leading-relaxed">
            ⚖️ <strong>Honesty Transparency:</strong> Domain availability is queried against official ICANN-recognized RDAP registries (reliable &amp; standardized). Social handle checks probe public profile URLs; suspended accounts or platform bot filters may produce false negatives/positives, hence labeled <em>&quot;Likely available&quot;</em> rather than a guarantee.
          </div>

          {/* Natural Upsell / Idea Validation Bridge */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[hsl(220,15%,11%)] to-[hsl(220,15%,9%)] border border-[hsl(42,95%,55%,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(42,95%,55%)] font-bold">
                NEXT STEP // MARKET VALIDATION
              </span>
              <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                Like this name? Validate the SaaS idea behind it
              </h3>
              <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
                Don&apos;t buy the domain until you verify competitor saturation and defensible moats.
              </p>
            </div>

            <button
              type="button"
              onClick={handleValidateIdea}
              className="px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md shrink-0 cursor-pointer"
            >
              Validate on SaaS Radar →
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Section A (Preview), Section B (How It Works), Section C (Methodology) */}
      {!results && !loading && (
        <div className="space-y-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
          {/* Section A — Sample Output Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
                <span className="text-[11px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)]">
                  PREVIEW: SAMPLE CHECK RESULT
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2.5 py-0.5 rounded border border-[hsl(42,95%,55%,0.25)]">
                STATIC SAMPLE
              </span>
            </div>

            {/* Mock result card */}
            <div className="bg-[hsl(220,14%,10%)]/90 border border-[hsl(220,10%,20%)] rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[hsl(220,10%,16%)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Target Name:
                  </span>
                  <span className="text-sm font-mono font-bold text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2.5 py-0.5 rounded border border-[hsl(42,95%,55%,0.25)]">
                    flowlyapp
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[hsl(40,8%,50%)]">
                  Simulated multi-channel scan
                </span>
              </div>

              {/* 2-Column Mock Layout: Domains vs Social Handles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Domains Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(145,60%,55%)] font-bold">
                      OFFICIAL RDAP PROTOCOL
                    </span>
                    <span className="text-[10px] font-mono text-[hsl(40,8%,50%)]">Domains</span>
                  </div>

                  <div className="space-y-2">
                    {/* flowlyapp.com */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        flowlyapp.com
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(0,70%,50%,0.1)] border border-[hsl(0,70%,50%,0.25)] text-[hsl(0,75%,65%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        Taken
                      </span>
                    </div>

                    {/* flowlyapp.io */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        flowlyapp.io
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        ✓ Available
                      </span>
                    </div>

                    {/* flowlyapp.co */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        flowlyapp.co
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        ✓ Available
                      </span>
                    </div>

                    {/* flowlyapp.app */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <span className="font-mono text-sm font-bold text-[hsl(40,20%,92%)]">
                        flowlyapp.app
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(0,70%,50%,0.1)] border border-[hsl(0,70%,50%,0.25)] text-[hsl(0,75%,65%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        Taken
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handles Row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] font-bold">
                      PROFILE HEURISTIC
                    </span>
                    <span className="text-[10px] font-mono text-[hsl(40,8%,50%)]">Social Handles</span>
                  </div>

                  <div className="space-y-2">
                    {/* X */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-[hsl(40,20%,92%)]">
                        <span className="font-bold">X</span>
                        <span className="text-xs text-[hsl(40,8%,50%)]">(@flowlyapp)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        ✓ Likely available
                      </span>
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-[hsl(40,20%,92%)]">
                        <span className="font-bold">Instagram</span>
                        <span className="text-xs text-[hsl(40,8%,50%)]">(@flowlyapp)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(42,95%,55%,0.1)] border border-[hsl(42,95%,55%,0.25)] text-[hsl(42,95%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        Likely taken
                      </span>
                    </div>

                    {/* TikTok */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-[hsl(40,20%,92%)]">
                        <span className="font-bold">TikTok</span>
                        <span className="text-xs text-[hsl(40,8%,50%)]">(@flowlyapp)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        ✓ Likely available
                      </span>
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)]">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-[hsl(40,20%,92%)]">
                        <span className="font-bold">GitHub</span>
                        <span className="text-xs text-[hsl(40,8%,50%)]">(@flowlyapp)</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] text-[hsl(145,60%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold">
                        ✓ Likely available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
              Sample data shown. Run a real check above for your own name.
            </p>
          </div>

          {/* Section B — How It Works */}
          <div className="pt-8 sm:pt-10 border-t border-[hsl(220,10%,16%)] space-y-6">
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[hsl(40,8%,50%)] block">
                CHECK PIPELINE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                How It Works
              </h2>
              <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
                Unified registry queries and profile probes executed simultaneously.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.3)] rounded-2xl p-5 sm:p-6 space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(220,15%,15%)] border border-[hsl(220,10%,22%)] flex items-center justify-center text-base">
                    🌐
                  </div>
                  <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2 py-0.5 rounded border border-[hsl(42,95%,55%,0.2)]">
                    STEP 01
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Domain check
                  </h3>
                  <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mt-2">
                    We query RDAP — the official domain registration protocol used by registries — across .com, .io, .co, and .app instantly.
                  </p>
                </div>
              </div>

              <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.3)] rounded-2xl p-5 sm:p-6 space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(220,15%,15%)] border border-[hsl(220,10%,22%)] flex items-center justify-center text-base">
                    👤
                  </div>
                  <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2 py-0.5 rounded border border-[hsl(42,95%,55%,0.2)]">
                    STEP 02
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    Handle check
                  </h3>
                  <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mt-2">
                    We check whether X, Instagram, TikTok, and GitHub profile URLs for that name currently resolve.
                  </p>
                </div>
              </div>

              <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.3)] rounded-2xl p-5 sm:p-6 space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(220,15%,15%)] border border-[hsl(220,10%,22%)] flex items-center justify-center text-base">
                    ⚡
                  </div>
                  <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2 py-0.5 rounded border border-[hsl(42,95%,55%,0.2)]">
                    STEP 03
                  </span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                    One combined view
                  </h3>
                  <p className="text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mt-2">
                    See everything in one place instead of checking four domain registrars and four platforms by hand.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section C — Methodology Note */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">ℹ️</span>
              <p>
                <strong className="text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)]">Methodology Note: </strong>
                Domain results come from RDAP, the official registry protocol — reliable and accurate. Social handle results are estimated by checking whether a profile page exists at that URL, which is not an official API from any platform — treat these as a strong signal, not a guarantee, especially right before you commit to a name everywhere.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shared: Cross-link footer */}
      <div className="pt-6 pb-6 border-t border-[hsl(220,10%,16%)] flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] max-w-4xl mx-auto">
        <span className="text-[hsl(40,8%,40%)] uppercase tracking-wider text-[11px]">Also try:</span>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg bg-[hsl(220,12%,12%)] hover:bg-[hsl(220,12%,16%)] text-[hsl(40,20%,85%)] hover:text-white border border-[hsl(220,10%,18%)] hover:border-[hsl(42,95%,55%,0.3)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>🚀</span>
          <span>SaaS Idea Scanner</span>
        </Link>
        <span>·</span>
        <Link
          href="/keywords"
          className="px-3 py-1.5 rounded-lg bg-[hsl(220,12%,12%)] hover:bg-[hsl(220,12%,16%)] text-[hsl(40,20%,85%)] hover:text-white border border-[hsl(220,10%,18%)] hover:border-[hsl(145,60%,45%,0.3)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>📡</span>
          <span>SaaS Keyword Radar</span>
        </Link>
      </div>
    </div>
  );
}
