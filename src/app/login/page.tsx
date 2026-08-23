'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for URL error params
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlError = params?.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    setDevUrl(null);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      
      if (data.devMagicUrl) {
        setDevUrl(data.devMagicUrl);
      }
      setSent(true);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {sent ? (
          /* Success state */
          <div className="text-center animate-fade-in space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[hsl(145,60%,45%,0.12)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[hsl(145,60%,45%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-1">
                Check your inbox
              </h1>
              <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed">
                We sent a login link to <span className="text-[hsl(40,20%,92%)] font-medium">{email}</span>
              </p>
              <p className="text-xs text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)] mt-1">
                The link expires in 15 minutes.
              </p>
            </div>

            {/* Dev Mode Instant Link */}
            {devUrl && (
              <div className="p-3.5 bg-[hsl(42,95%,55%,0.1)] border border-[hsl(42,95%,55%,0.25)] rounded-xl text-left text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-[hsl(42,95%,55%)] font-bold font-[family-name:var(--font-mono)]">
                  <span>⚡ Development Mode</span>
                </div>
                <p className="text-[11px] text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
                  Click below to verify and complete signup immediately without email:
                </p>
                <a
                  href={devUrl}
                  className="block text-center py-2 px-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold rounded font-[family-name:var(--font-space-grotesk)] transition-colors"
                >
                  Verify & Sign In Now →
                </a>
              </div>
            )}

            <button
              onClick={() => { setSent(false); setEmail(''); setDevUrl(null); }}
              className="mt-4 text-xs text-[hsl(40,8%,45%)] hover:text-[hsl(42,95%,55%)] transition-colors font-[family-name:var(--font-mono)]"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Login form */
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-2">
              Sign in
            </h1>
            <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              We&apos;ll send you a link. No password, ever.
            </p>

            {/* URL error messages */}
            {urlError === 'expired' && (
              <div className="mb-4 p-3 bg-[hsl(35,85%,55%,0.08)] border border-[hsl(35,85%,55%,0.2)] rounded-lg">
                <p className="text-xs text-[hsl(35,85%,65%)] font-[family-name:var(--font-inter)]">
                  That link expired. Request a new one below.
                </p>
              </div>
            )}
            {urlError === 'missing-token' && (
              <div className="mb-4 p-3 bg-[hsl(0,72%,55%,0.08)] border border-[hsl(0,72%,55%,0.2)] rounded-lg">
                <p className="text-xs text-[hsl(0,72%,65%)] font-[family-name:var(--font-inter)]">
                  Invalid login link. Enter your email to get a new one.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                className="w-full bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,20%)] rounded-lg px-4 py-3 text-[hsl(40,20%,92%)] text-sm font-[family-name:var(--font-inter)] placeholder:text-[hsl(40,8%,35%)] focus:outline-none focus:border-[hsl(42,95%,55%)] focus:shadow-[0_0_0_1px_hsl(42,95%,55%,0.3)] transition-all duration-200"
              />
              
              {error && (
                <p className="mt-2 text-xs text-[hsl(0,72%,65%)] font-[family-name:var(--font-inter)]">
                  {error}
                </p>
              )}
              
              <button
                type="submit"
                disabled={!email.trim() || loading}
                className="mt-3 w-full px-5 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-[family-name:var(--font-space-grotesk)]"
              >
                {loading ? 'Sending...' : 'Send login link →'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[hsl(40,8%,35%)] font-[family-name:var(--font-inter)]">
              Don&apos;t have an account? Signing in creates one automatically.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-xs text-[hsl(40,8%,35%)] hover:text-[hsl(40,8%,55%)] transition-colors font-[family-name:var(--font-inter)]"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
