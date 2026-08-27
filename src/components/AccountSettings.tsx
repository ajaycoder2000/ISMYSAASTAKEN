'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface UserSettings {
  email: string;
  plan: 'free' | 'pro' | 'sprint';
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
      <h1 className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] mb-1">
        Account Settings
      </h1>
      <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-8">
        Manage your profile preferences, email notifications, and private data.
      </p>

      {/* ---- Profile section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[hsl(40,8%,50%)] uppercase mb-3.5">
          PROFILE & MEMBERSHIP
        </h2>

        {/* Plan badge */}
        <div className="flex items-center justify-between mb-4 p-4 bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-xl">
          <div>
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">Current plan</p>
            <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mt-0.5">
              {user.plan === 'pro' ? 'Founder Pro (Unlimited)' : user.plan === 'sprint' ? '7-Day Sprint Pass' : 'Free Explorer Tier'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] hidden sm:inline">
              Joined {user.joinedDate}
            </span>
            {user.plan === 'free' && (
              <Link
                href="/pricing"
                className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] px-3.5 py-1.5 rounded-lg bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] hover:bg-[hsl(42,95%,50%)] transition-all shadow-sm"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        {/* Email */}
        <label className="block mb-1.5 text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)]">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,20%)] rounded-xl px-4 py-2.5 text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)] text-xs sm:text-sm outline-none focus:border-[hsl(42,95%,55%)] mb-1.5 transition-colors"
        />
        <p className="text-[11px] text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] mb-0">
          Used for login notifications, competitor alerts, and scan receipts.
        </p>
      </div>

      {/* ---- Notifications section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[hsl(40,8%,50%)] uppercase mb-3.5">
          EMAIL NOTIFICATIONS
        </h2>

        <div className="flex flex-col bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden">
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
                i < arr.length - 1 ? 'border-b border-[hsl(220,10%,16%)]' : ''
              }`}
            >
              <div>
                <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">{item.title}</p>
                <p className="text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotif(item.key)}
                className={`relative w-11 h-6 rounded-full border transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                  notifs[item.key]
                    ? 'bg-[hsl(42,95%,55%,0.2)] border-[hsl(42,95%,55%)]'
                    : 'bg-[hsl(220,10%,16%)] border-[hsl(220,10%,24%)]'
                }`}
              >
                <span
                  className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200 ${
                    notifs[item.key]
                      ? 'left-[22px] bg-[hsl(42,95%,55%)]'
                      : 'left-[3px] bg-[hsl(40,8%,45%)]'
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
        className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] transition-all shadow-md disabled:opacity-50 mb-8 cursor-pointer"
      >
        {saved ? '✓ Changes Saved' : saving ? 'Saving settings...' : 'Save Changes'}
      </button>

      {/* ---- Data section ---- */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold font-[family-name:var(--font-mono)] tracking-[1.5px] text-[hsl(40,8%,50%)] uppercase mb-3.5">
          YOUR DATA & PRIVACY
        </h2>

        <div className="flex flex-col gap-3">
          {/* Export data */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-xl gap-3">
            <div>
              <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">Export All Scan Data</p>
              <p className="text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
                Download all your saved scans, bookmarked competitors, and profile telemetry as JSON.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-xs font-bold font-[family-name:var(--font-mono)] px-3.5 py-1.5 rounded-lg bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,85%)] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
            >
              {exporting ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>

          {/* Delete account */}
          <div className="px-4 py-3.5 bg-[hsl(220,13%,11%)] border border-[hsl(0,72%,55%,0.3)] rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(0,72%,65%)]">Delete Account</p>
                <p className="text-[11px] text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
                  Permanently remove your account and all associated validation history. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDelete(!showDelete)}
                className="text-xs font-bold font-[family-name:var(--font-mono)] px-3.5 py-1.5 rounded-lg bg-[hsl(0,72%,55%,0.1)] border border-[hsl(0,72%,55%,0.3)] text-[hsl(0,72%,65%)] hover:bg-[hsl(0,72%,55%,0.2)] transition-colors flex-shrink-0 cursor-pointer"
              >
                {showDelete ? 'Cancel' : 'Delete'}
              </button>
            </div>

            {showDelete && (
              <div className="mt-3.5 pt-3.5 border-t border-[hsl(0,72%,55%,0.2)]">
                <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-2">
                  Type <strong className="text-[hsl(0,72%,65%)] font-mono">DELETE</strong> to confirm permanent deletion:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 bg-[hsl(220,12%,12%)] border border-[hsl(0,72%,55%,0.4)] rounded-lg px-3 py-2 text-[hsl(40,20%,92%)] font-mono text-xs outline-none focus:border-[hsl(0,72%,55%)]"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirm !== 'DELETE'}
                    className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] px-4 py-2 rounded-lg bg-[hsl(0,72%,55%)] text-white hover:bg-[hsl(0,72%,50%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
