'use client';

import { useState, useEffect } from 'react';
import ScanningIndicator from '@/components/ScanningIndicator';
import { SponsorTier } from '@/types';

interface SponsorItem {
  _id: string;
  name: string;
  url: string;
  description: string;
  iconText: string;
  tier: SponsorTier;
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  ctr: string;
  createdAt: string;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    iconText: '⚡',
    tier: 'starter' as SponsorTier,
    priority: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchSponsors = () => {
    setLoading(true);
    fetch('/api/admin/sponsors')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSponsors(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      url: '',
      description: '',
      iconText: '⚡',
      tier: 'starter',
      priority: 0,
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sponsor: SponsorItem) => {
    setEditingId(sponsor._id);
    setFormData({
      name: sponsor.name,
      url: sponsor.url,
      description: sponsor.description,
      iconText: sponsor.iconText || '⚡',
      tier: sponsor.tier,
      priority: sponsor.priority || 0,
      active: sponsor.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim() || !formData.description.trim()) {
      alert('Please fill out all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/sponsors';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { _id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchSponsors();
      } else {
        alert('Failed to save sponsor');
      }
    } catch {
      alert('Error saving sponsor');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (sponsor: SponsorItem) => {
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: sponsor._id,
          active: !sponsor.active,
        }),
      });
      if (res.ok) {
        setSponsors((prev) =>
          prev.map((s) => (s._id === sponsor._id ? { ...s, active: !sponsor.active } : s))
        );
      }
    } catch {
      alert('Failed to update active state');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete sponsor "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/sponsors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSponsors((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert('Failed to delete sponsor');
      }
    } catch {
      alert('Error deleting sponsor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(220,10%,14%)]">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
            Sponsors & Placement Ads
          </h1>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
            Manage live desktop side-rail and feed placements. Directly controls live site ads.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-lg transition-colors shadow-md"
        >
          + Add New Sponsor
        </button>
      </div>

      {/* Sponsors Table */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <ScanningIndicator size="lg" className="mb-3" />
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">Loading sponsor campaigns...</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mb-3">
              No sponsor campaigns found in database.
            </p>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline"
            >
              Add your first sponsor →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,18%)] bg-[hsl(220,14%,10%)] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Sponsor</th>
                  <th className="py-3 px-4 font-medium">Tier & Priority</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Impressions</th>
                  <th className="py-3 px-4 font-medium">Clicks & CTR</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,16%)]">
                {sponsors.map((sponsor) => (
                  <tr key={sponsor._id} className="hover:bg-[hsl(220,10%,14%)] transition-colors">
                    {/* Sponsor Info */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg mt-0.5">{sponsor.iconText || '⚡'}</span>
                        <div className="min-w-0">
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-[hsl(40,20%,92%)] hover:text-[hsl(42,95%,55%)] transition-colors flex items-center gap-1"
                          >
                            {sponsor.name}
                            <span className="text-[10px] opacity-50">↗</span>
                          </a>
                          <p className="text-[11px] text-[hsl(40,8%,55%)] mt-0.5 line-clamp-1">{sponsor.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tier & Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded font-bold ${
                            sponsor.tier === 'featured'
                              ? 'bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)]'
                              : 'bg-[hsl(220,10%,16%)] text-[hsl(40,8%,50%)]'
                          }`}
                        >
                          {sponsor.tier}
                        </span>
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                          p:{sponsor.priority}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(sponsor)}
                        className={`text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded font-semibold transition-colors ${
                          sponsor.active
                            ? 'bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] hover:bg-[hsl(145,60%,45%,0.25)]'
                            : 'bg-[hsl(0,72%,55%,0.15)] text-[hsl(0,72%,60%)] hover:bg-[hsl(0,72%,55%,0.25)]'
                        }`}
                      >
                        {sponsor.active ? '● Active' : '○ Paused'}
                      </button>
                    </td>

                    {/* Impressions */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs text-[hsl(40,8%,60%)]">
                      {sponsor.impressions.toLocaleString()}
                    </td>

                    {/* Clicks & CTR */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs">
                      <span className="text-[hsl(40,20%,90%)] font-semibold">{sponsor.clicks}</span>
                      <span className="text-[hsl(40,8%,40%)] ml-1.5">({sponsor.ctr}%)</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(sponsor)}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor._id, sponsor.name)}
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
      </div>

      {/* Add / Edit Sponsor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,22%)] rounded-xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,18%)]">
              <h3 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                {editingId ? 'Edit Sponsor Campaign' : 'Create New Sponsor'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                  Product / Sponsor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supastack Cloud"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  placeholder="⚡"
                  value={formData.iconText}
                  onChange={(e) => setFormData({ ...formData, iconText: e.target.value })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,92%)] text-center focus:outline-none focus:border-[hsl(42,95%,55%)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Outbound Target URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/ref"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)] font-[family-name:var(--font-mono)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Description (Max 140 chars) *
              </label>
              <textarea
                rows={2}
                maxLength={140}
                required
                placeholder="Instant PostgreSQL, Auth & background jobs for indie SaaS."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg p-2.5 text-xs text-[hsl(40,20%,92%)] focus:outline-none focus:border-[hsl(42,95%,55%)] resize-none"
              />
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)] block text-right">
                {formData.description.length}/140
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                  Tier Placement
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as SponsorTier })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)] focus:outline-none"
                >
                  <option value="starter">Starter Placement</option>
                  <option value="featured">Featured Slot ★</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                  Priority Weight (0-100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value || '0', 10) })}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activeToggle"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-[hsl(220,10%,20%)]"
              />
              <label htmlFor="activeToggle" className="text-xs text-[hsl(40,20%,85%)] font-medium cursor-pointer">
                Campaign is active and currently rendering in rotation
              </label>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[hsl(220,10%,18%)]">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-[hsl(40,8%,60%)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs font-[family-name:var(--font-space-grotesk)] disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Sponsor' : 'Publish Sponsor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
