"use client";
import { useState, useRef, useEffect } from "react";

export interface Notification {
  id: string;
  type: "alert" | "success" | "billing" | "info";
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAllRead?: () => void;
  onClickNotification?: (id: string) => void;
}

const TYPE_STYLES: Record<string, string> = {
  alert: "bg-[rgba(255,103,89,0.12)] border-[#6b3a33] text-[var(--red)]",
  success: "bg-[var(--green-dim,#173d24)] border-[var(--green-mid,#1a5c33)] text-[var(--green,#39ff6a)]",
  billing: "bg-[var(--amber-dim,#3d2c0c)] border-[var(--amber-mid,#6b5a2a)] text-[var(--amber)]",
  info: "bg-[var(--accent-dim)] border-[var(--accent-mid)] text-[var(--accent)]",
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "alert",
    icon: "⚠",
    title: "New competitor detected",
    body: 'for "Notion for voice notes" — Voicenotes.com launched 3 days ago',
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "success",
    icon: "📊",
    title: "Weekly Gap Report",
    body: "is ready — 3 new market gaps found in DevTools",
    time: "6 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "billing",
    icon: "💳",
    title: "Sprint Pass",
    body: "23 of 25 scans remaining on your pass",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "info",
    icon: "🔖",
    title: "Bookmarked idea",
    body: '"AI changelog generator" was re-scanned — saturation is LOW',
    time: "3 days ago",
    read: true,
  },
];

export default function NotificationCenter({
  notifications: initialNotifications = DEFAULT_NOTIFICATIONS,
  onMarkAllRead,
  onClickNotification,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onClickNotification?.(id);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 border border-[var(--border)] rounded-lg bg-[var(--panel-raised)] flex items-center justify-center text-sm hover:border-[var(--accent-mid)] transition-colors relative cursor-pointer"
        title="Notifications & Market Alerts"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--red)] shadow-[0_0_8px_rgba(255,103,89,0.8)] animate-pulse" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-10 right-0 w-[320px] sm:w-[350px] bg-[hsl(220,15%,9%)] border border-[var(--border)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border)] bg-[hsl(220,13%,11%)]">
            <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text)]">
              Market Telemetry Alerts
            </span>
            <button
              onClick={handleMarkAll}
              className="text-[var(--accent)] text-[11px] font-[family-name:var(--font-mono)] hover:underline cursor-pointer"
            >
              mark all read
            </button>
          </div>

          {/* Items */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-[hsl(220,10%,14%)]">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n.id)}
                className={`flex gap-3 px-3.5 py-3 cursor-pointer hover:bg-[hsl(220,12%,13%)] transition-colors ${
                  !n.read ? "border-l-2 border-l-[var(--accent)] bg-[hsl(220,14%,10%)]" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs border ${TYPE_STYLES[n.type]}`}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    <strong className="text-[var(--text)] font-semibold">{n.title}</strong>{" "}
                    {n.body}
                  </p>
                  <p className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-faint)] mt-1">
                    {n.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
