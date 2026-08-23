'use client';
import Link from 'next/link';

interface RateLimitMessageProps {
  message: string;
  isAnonymous?: boolean;
}

export default function RateLimitMessage({ message, isAnonymous = true }: RateLimitMessageProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-[hsl(220,12%,12%)] border border-[hsl(35,85%,55%,0.3)] rounded-lg p-6">
      <p className="text-sm text-[hsl(40,20%,82%)] font-[family-name:var(--font-inter)] leading-relaxed">
        {message}
      </p>
      <div className="mt-4">
        {isAnonymous ? (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
          >
            Sign up free →
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
          >
            Upgrade to Pro →
          </Link>
        )}
      </div>
    </div>
  );
}
