'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SaturationBadge from '@/components/SaturationBadge';
import ScanningIndicator from '@/components/ScanningIndicator';
import { SaturationLevel } from '@/types';

interface ScanItem {
  _id: string;
  ideaText: string;
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
  competitorsCount: number;
  competitors: Array<{ name: string; description: string; pricing: string; url: string }>;
  shareSlug: string;
  featured: boolean;
  createdAt: string;
  user: { email?: string; plan?: string } | null;
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchScans = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search ? { search } : {}),
      ...(verdict ? { verdict } : {}),
      ...(featuredFilter ? { featured: featuredFilter } : {}),
    });

    fetch(`/api/admin/scans?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setScans(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, verdict, featuredFilter]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const handleToggleFeatured = async (scan: ScanItem) => {
    const nextFeatured = !scan.featured;
    try {
      const res = await fetch('/api/admin/scans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: scan._id, featured: nextFeatured }),
      });
      if (res.ok) {
        setScans((prev) =>
          prev.map((s) => (s._id === scan._id ? { ...s, featured: nextFeatured } : s))
        );
      }
    } catch {
      alert('Failed to update featured state');
    }
  };

  const handleDeleteScan = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this scan? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/scans?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s._id !== id));
        if (selectedScan?._id === id) setSelectedScan(null);
      } else {
        alert('Failed to delete scan');
      }
    } catch {
      alert('Error deleting scan');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(220,10%,14%)]">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
            Scans Feed Management
          </h1>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
            View, search, curate featured scans, or prune user queries ({totalCount} total).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search ideas by keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3.5 py-2 text-xs text-[hsl(40,20%,92%)] placeholder:text-[hsl(40,8%,40%)] focus:outline-none focus:border-[hsl(42,95%,55%)] font-[family-name:var(--font-inter)]"
          />
        </div>

        {/* Verdict Filter */}
        <select
          value={verdict}
          onChange={(e) => {
            setVerdict(e.target.value);
            setPage(1);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Verdicts</option>
          <option value="low">Low Saturation</option>
          <option value="medium">Medium Saturation</option>
          <option value="high">High Saturation</option>
        </select>

        {/* Featured Filter */}
        <select
          value={featuredFilter}
          onChange={(e) => {
            setFeaturedFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Visibility</option>
          <option value="true">Featured Only ★</option>
          <option value="false">Standard Feed</option>
        </select>
      </div>

      {/* Scans Table */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <ScanningIndicator size="lg" className="mb-3" />
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">Loading scans feed...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
              No scans matching query filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,18%)] bg-[hsl(220,14%,10%)] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Idea & Saturation</th>
                  <th className="py-3 px-4 font-medium">User</th>
                  <th className="py-3 px-4 font-medium">Competitors</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,16%)]">
                {scans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-[hsl(220,10%,14%)] transition-colors">
                    {/* Idea column */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <SaturationBadge level={scan.saturationScore} />
                        {scan.featured && (
                          <span className="text-[10px] font-[family-name:var(--font-mono)] bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] px-1.5 py-0.2 rounded font-bold">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(40,20%,92%)] font-medium line-clamp-2">
                        {scan.ideaText}
                      </p>
                    </td>

                    {/* User column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {scan.user ? (
                        <div>
                          <p className="text-xs text-[hsl(40,20%,85%)]">{scan.user.email}</p>
                          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase text-[hsl(40,8%,45%)]">
                            {scan.user.plan} user
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                          Anonymous (Cookie)
                        </span>
                      )}
                    </td>

                    {/* Competitors count */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs text-[hsl(40,8%,60%)]">
                      {scan.competitorsCount} found
                    </td>

                    {/* Date column */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-[11px] text-[hsl(40,8%,45%)]">
                      {new Date(scan.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions column */}
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(scan)}
                        className={`text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded border transition-colors ${
                          scan.featured
                            ? 'border-[hsl(42,95%,55%,0.5)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)]'
                            : 'border-[hsl(220,10%,20%)] text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)]'
                        }`}
                      >
                        {scan.featured ? 'Unfeature' : 'Feature ★'}
                      </button>
                      <button
                        onClick={() => handleDeleteScan(scan._id)}
                        disabled={deletingId === scan._id}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded text-[hsl(0,72%,60%)] hover:bg-[hsl(0,72%,55%,0.1)] transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,22%)] rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,18%)]">
              <div className="flex items-center gap-2">
                <SaturationBadge level={selectedScan.saturationScore} />
                <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
                  Slug: {selectedScan.shareSlug}
                </span>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] hover:text-white px-2 py-1"
              >
                Close ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Idea Statement
              </span>
              <p className="text-sm font-medium text-[hsl(40,20%,92%)] leading-relaxed">
                {selectedScan.ideaText}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1.5">
                Competitors Found ({selectedScan.competitors?.length || 0})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedScan.competitors?.map((c, i) => (
                  <div key={i} className="p-2.5 bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,18%)] rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[hsl(40,20%,90%)]">{c.name}</span>
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[hsl(42,95%,55%)]">{c.pricing}</span>
                    </div>
                    <p className="text-[11px] text-[hsl(40,8%,55%)] mt-0.5">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Saturation Reasoning
              </span>
              <p className="text-xs text-[hsl(40,20%,80%)] leading-relaxed">
                {selectedScan.saturationReasoning}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Gap Analysis
              </span>
              <p className="text-xs text-[hsl(40,20%,90%)] bg-[hsl(220,14%,10%)] border-l-2 border-[hsl(42,95%,55%)] p-3 rounded leading-relaxed">
                {selectedScan.gapAnalysis}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[hsl(220,10%,18%)]">
              <Link
                href={`/scan/${selectedScan.shareSlug}`}
                target="_blank"
                className="text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline"
              >
                Open public share page ↗
              </Link>
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-1.5 rounded bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-xs text-[hsl(40,20%,90%)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
