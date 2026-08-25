'use client';

import { useState } from 'react';

interface BookmarkButtonProps {
  scanId: string;
  initialBookmarked?: boolean;
}

export default function BookmarkButton({ scanId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarked(data.bookmarked);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg border text-xs font-[family-name:var(--font-mono)] transition-all flex items-center gap-1.5 cursor-pointer ${
        bookmarked
          ? 'bg-[hsl(42,95%,55%,0.15)] border-[hsl(42,95%,55%,0.4)] text-[hsl(42,95%,55%)] font-bold shadow-sm'
          : 'bg-[hsl(220,12%,12%)] border-[hsl(220,10%,20%)] text-[hsl(40,8%,60%)] hover:text-[hsl(40,20%,90%)] hover:border-[hsl(220,10%,30%)]'
      }`}
      title={bookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
    >
      <span>{bookmarked ? '★ Saved' : '☆ Bookmark'}</span>
    </button>
  );
}
