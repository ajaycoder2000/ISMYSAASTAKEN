'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface UserSettings {
  email: string;
  plan: 'free' | 'pro' | 'sprint' | 'sprint_pass' | 'founder_pro' | string;
  role?: 'user' | 'admin' | string;
  is_admin?: boolean;
  scansUsedThisMonth: number;
  scansLimit: number;
  joinedDate: string;
  notifications: {
    weeklyDigest: boolean;
    competitorAlerts: boolean;
    productUpdates: boolean;
    scanReceipts: boolean;
  };
}

interface AccountSettingsProps {
  user?: UserSettings;
  onSave?: (settings: Partial<UserSettings>) => Promise<void>;
  onExportData?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

const DEFAULT_USER: UserSettings = {
  email: 'founder@example.com',
  plan: 'free',
  role: 'user',
  is_admin: false,
  scansUsedThisMonth: 2,
  scansLimit: 3,
  joinedDate: 'Aug 2, 2026',
  notifications: {
    weeklyDigest: true,
    competitorAlerts: true,
    productUpdates: false,
    scanReceipts: true,
  },
};

export default function AccountSettings({
  user = DEFAULT_USER,
  onSave,
  onExportData,
  onDeleteAccount,
}: AccountSettingsProps) {
  const [email, setEmail] = useState(user.email);
  const [notifs, setNotifs] = useState(user.notifications);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [exporting, setExporting] = useState(false);

  const isAdmin = user.role === 'admin' || user.is_admin;

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave({ email, notifications: notifs });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      if (onExportData) {
        await onExportData();
      } else {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
          JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2)
        );
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `saastaken-data-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (onDeleteAccount) {
      await onDeleteAccount();
    } else {
      alert('Account deletion requested. Please contact support or manage in Clerk.');
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] mb-1">
        Account Settings
      </h1>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-8">
        Manage your profile preferences, email notifications, and private data.
      </p>

      {/* ---- Profile section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3.5">
          PROFILE & MEMBERSHIP
        </h2>

        {/* Plan badge */}
        <div className="flex items-center justify-between mb-4 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">Current plan</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                {isAdmin
                  ? 'Founder Pro (Admin Full Access)'
                  : user.plan === 'pro' || user.plan === 'founder_pro'
                  ? 'Founder Pro (Unlimited)'
                  : user.plan === 'sprint' || user.plan === 'sprint_pass'
                  ? '7-Day Sprint Pass'
                  : 'Free Explorer Tier'}
              </p>
              {isAdmin && (
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-[var(--accent-emerald)] font-bold border border-emerald-500/30">
                  ⚡ Testing Suite Active
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] hidden sm:inline">
              Joined {user.joinedDate}
            </span>
            {!isAdmin && user.plan === 'free' && (
              <Link
                href="/pricing"
                className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] px-3.5 py-1.5 rounded-lg bg-[var(--accent-amber)] text-white hover:opacity-90 transition-all shadow-sm"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        {/* Email */}
        <label className="block mb-1.5 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] font-[family-name:var(--font-mono)] text-xs sm:text-sm outline-none focus:border-[var(--accent-amber)] mb-1.5 transition-colors"
        />
        <p className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] mb-0">
          Used for login notifications, competitor alerts, and scan receipts.
        </p>
      </div>

      {/* ---- Notifications section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3.5">
          EMAIL NOTIFICATIONS
        </h2>

        <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          {([
            {
              key: 'weeklyDigest' as const,
              title: 'Weekly Gap Report',
              desc: 'Top high-opportunity SaaS gaps found across all live scans, every Monday.',
            },
            {
              key: 'competitorAlerts' as const,
              title: 'Competitor Alerts',
              desc: 'Get notified when a new competitor appears for a bookmarked idea.',
            },
            {
              key: 'scanReceipts' as const,
              title: 'Scan Receipts',
              desc: 'Email summary and executive brief of every scan you execute.',
            },
            {
              key: 'productUpdates' as const,
              title: 'Product Updates',
              desc: 'New market intelligence features and engine updates (max 2x/month).',
            },
          ]).map((item, i, arr) => (
            <div
              key={item.key}
              className={`flex items-center justify-between px-4 py-3.5 gap-3 ${
                i < arr.length - 1 ? 'border-b border-[var(--border)]' : ''
              }`}
            >
              <div>
                <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">{item.title}</p>
                <p className="text-[11px] text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotif(item.key)}
                className={`relative w-11 h-6 rounded-full border transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                  notifs[item.key]
                    ? 'bg-[var(--accent-amber)]/20 border-[var(--accent-amber)]'
                    : 'bg-[var(--bg-surface-alt)] border-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200 ${
                    notifs[item.key]
                      ? 'left-[22px] bg-[var(--accent-amber)]'
                      : 'left-[3px] bg-[var(--text-muted)]'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Save button ---- */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] bg-[var(--accent-amber)] hover:opacity-90 text-white transition-all shadow-md disabled:opacity-50 mb-8 cursor-pointer"
      >
        {saved ? '✓ Changes Saved' : saving ? 'Saving settings...' : 'Save Changes'}
      </button>

      {/* ---- Data section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3.5">
          YOUR DATA & PRIVACY
        </h2>

        <div className="flex flex-col gap-3">
          {/* Export data */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl gap-3 shadow-sm">
            <div>
              <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">Export All Scan Data</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-0.5">
                Download all your saved scans, bookmarked competitors, and profile telemetry as JSON.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-xs font-bold font-[family-name:var(--font-mono)] px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
            >
              {exporting ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>

          {/* Delete account */}
          <div className="px-4 py-3.5 bg-[var(--bg-surface)] border border-red-500/30 rounded-xl shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-[11px] text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-0.5">
                  Permanently remove your account and all associated validation history. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDelete(!showDelete)}
                className="text-xs font-bold font-[family-name:var(--font-mono)] px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0 cursor-pointer"
              >
                {showDelete ? 'Cancel' : 'Delete'}
              </button>
            </div>

            {showDelete && (
              <div className="mt-3.5 pt-3.5 border-t border-red-500/20">
                <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-2">
                  Type <strong className="text-red-600 dark:text-red-400 font-mono">DELETE</strong> to confirm permanent deletion:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 bg-[var(--bg-surface-alt)] border border-red-500/40 rounded-lg px-3 py-2 text-[var(--text-primary)] font-mono text-xs outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirm !== 'DELETE'}
                    className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
