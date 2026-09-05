'use client';

import { useState, useEffect, useCallback } from 'react';
import ScanningIndicator from '@/components/ScanningIndicator';
import { PlanType, UserRole, IAdminActionLog } from '@/types';

interface UserItem {
  _id: string;
  id?: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  is_admin?: boolean;
  suspended: boolean;
  adminNotes?: string;
  new_tools_scans_used: number;
  scans_used_this_month: number;
  plan_expires_at?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0); // 0-indexed pagination
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Plan Override Panel State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [overridePlan, setOverridePlan] = useState<PlanType>('free');
  const [overrideExpiry, setOverrideExpiry] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [savingOverride, setSavingOverride] = useState(false);
  const [overrideLogs, setOverrideLogs] = useState<IAdminActionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search ? { search } : {}),
      ...(planFilter ? { plan: planFilter } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
    });

    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.users) {
          setUsers(res.users);
          setTotalCount(res.total ?? res.users.length);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch users:', err);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, search, planFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load audit history when opening user plan override panel
  const handleOpenPlanOverride = async (user: UserItem) => {
    setEditingUser(user);
    setOverridePlan(user.plan || 'free');
    setOverrideReason('');
    setStatusMsg(null);

    if (user.plan_expires_at) {
      try {
        const d = new Date(user.plan_expires_at);
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        const formatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setOverrideExpiry(formatted);
      } catch {
        setOverrideExpiry('');
      }
    } else {
      setOverrideExpiry('');
    }

    // Fetch user audit history
    setLoadingLogs(true);
    const userId = user.id || user._id;
    try {
      const res = await fetch(`/api/admin/override-plan?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setOverrideLogs(data.logs);
      } else {
        setOverrideLogs([]);
      }
    } catch {
      setOverrideLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleApplySprintPassPreset = () => {
    setOverridePlan('sprint_pass');
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const formatted = new Date(future.getTime() - future.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setOverrideExpiry(formatted);
  };

  const handleClearExpiry = () => {
    setOverrideExpiry('');
  };

  const handleSavePlanOverride = async () => {
    if (!editingUser) return;
    const cleanReason = overrideReason.trim();

    if (!cleanReason) {
      setStatusMsg({
        type: 'error',
        text: 'A reason is required for manual plan overrides to preserve audit accountability.',
      });
      return;
    }

    setSavingOverride(true);
    setStatusMsg(null);

    const userId = editingUser.id || editingUser._id;
    const isoExpiry = overrideExpiry ? new Date(overrideExpiry).toISOString() : null;

    try {
      const res = await fetch('/api/admin/override-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          newPlan: overridePlan,
          expiresAt: isoExpiry,
          reason: cleanReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Plan updated to ${overridePlan} successfully.` });
        
        // Update local user in table
        setUsers((prev) =>
          prev.map((u) => {
            const uid = u.id || u._id;
            if (uid === userId) {
              return {
                ...u,
                plan: overridePlan,
                plan_expires_at: isoExpiry,
                adminNotes: cleanReason,
              };
            }
            return u;
          })
        );

        // Refresh audit logs
        const logRes = await fetch(`/api/admin/override-plan?userId=${encodeURIComponent(userId)}`);
        const logData = await logRes.json();
        if (logData.success && Array.isArray(logData.logs)) {
          setOverrideLogs(logData.logs);
        }
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update plan.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network error executing plan override.' });
    } finally {
      setSavingOverride(false);
    }
  };

  const handleToggleSuspend = async (user: UserItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSuspended = !user.suspended;
    const confirmMsg = nextSuspended
      ? `Are you sure you want to SUSPEND ${user.email}? They will be blocked from running scans.`
      : `Re-activate ${user.email}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          suspended: nextSuspended,
          note: nextSuspended ? 'Suspended by admin' : 'Reactivated by admin',
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => {
            const uid = u.id || u._id;
            const targetId = user.id || user._id;
            return uid === targetId ? { ...u, suspended: nextSuspended } : u;
          })
        );
      }
    } catch {
      alert('Failed to update user suspension status');
    }
  };

  // Helper for remaining days display
  const getExpiryLabel = (dateStr?: string | null) => {
    if (!dateStr) return { text: '—', status: 'permanent' };
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { text: 'Expired', status: 'expired' };
    }
    return {
      text: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${diffDays}d left)`,
      status: diffDays <= 2 ? 'warning' : 'active',
    };
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(220,10%,14%)]">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight">
            Subscribers &amp; Users
          </h1>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
            Internal user directory, manual plan overrides, and real-time usage quotas ({totalCount} users).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search users by email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3.5 py-2 text-xs text-[hsl(40,20%,90%)] placeholder:text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)] focus:outline-none focus:border-[hsl(42,95%,55%)] transition-colors"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(0);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="free">Free Explorer</option>
          <option value="sprint_pass">Sprint Pass (7-Day)</option>
          <option value="founder_pro">Founder Pro</option>
          <option value="pro">Legacy Pro</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">Standard Users</option>
          <option value="admin">Admins</option>
        </select>

        {/* Page Size */}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <ScanningIndicator size="lg" className="mb-3" />
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">Loading subscriber directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
              No users found matching query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,18%)] bg-[hsl(220,14%,10%)] text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">User Email</th>
                  <th className="py-3 px-4 font-medium">Plan</th>
                  <th className="py-3 px-4 font-medium">New Tools Scans</th>
                  <th className="py-3 px-4 font-medium">Idea Scans (Mo)</th>
                  <th className="py-3 px-4 font-medium">Plan Expiry</th>
                  <th className="py-3 px-4 font-medium">Signup Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,16%)]">
                {users.map((user) => {
                  const expiry = getExpiryLabel(user.plan_expires_at);
                  const isPaid = user.plan === 'pro' || user.plan === 'founder_pro' || user.plan === 'sprint_pass';

                  return (
                    <tr
                      key={user.id || user._id}
                      onClick={() => handleOpenPlanOverride(user)}
                      className="hover:bg-[hsl(220,10%,14%)] cursor-pointer transition-colors group"
                    >
                      {/* Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[hsl(40,20%,94%)] group-hover:text-[hsl(42,95%,55%)] transition-colors">
                            {user.email}
                          </span>
                          {user.is_admin && (
                            <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.2 rounded bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] font-bold border border-[hsl(145,60%,45%,0.25)]">
                              Admin
                            </span>
                          )}
                        </div>
                        {user.adminNotes && (
                          <p className="text-[10px] text-[hsl(40,8%,45%)] italic mt-0.5 max-w-xs truncate">
                            Note: {user.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {user.plan === 'founder_pro' || user.plan === 'pro' ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] border border-[hsl(145,60%,45%,0.3)]">
                            ★ Founder Pro
                          </span>
                        ) : user.plan === 'sprint_pass' ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)]">
                            🏃 Sprint Pass
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[hsl(220,10%,16%)] text-[hsl(40,8%,55%)] border border-[hsl(220,10%,22%)]">
                            Free
                          </span>
                        )}
                      </td>

                      {/* New Tools Scans */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-[hsl(40,8%,65%)]">
                        {isPaid ? (
                          <span className="text-[hsl(145,60%,55%)] font-bold">Unlimited</span>
                        ) : (
                          <span>
                            {user.new_tools_scans_used ?? 0} <span className="text-[hsl(40,8%,40%)]">/ 1</span>
                          </span>
                        )}
                      </td>

                      {/* Idea Scans Monthly */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-[hsl(40,8%,65%)]">
                        {isPaid ? (
                          <span className="text-[hsl(145,60%,55%)] font-bold">Unlimited</span>
                        ) : (
                          <span>
                            {user.scans_used_this_month ?? 0} <span className="text-[hsl(40,8%,40%)]">/ 3</span>
                          </span>
                        )}
                      </td>

                      {/* Plan Expiry */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {expiry.status === 'expired' ? (
                          <span className="text-[var(--red)] font-semibold">{expiry.text}</span>
                        ) : expiry.status === 'warning' ? (
                          <span className="text-[hsl(42,95%,55%)] font-semibold">{expiry.text}</span>
                        ) : expiry.status === 'active' ? (
                          <span className="text-[hsl(145,60%,55%)]">{expiry.text}</span>
                        ) : (
                          <span className="text-[hsl(40,8%,40%)]">{expiry.text}</span>
                        )}
                      </td>

                      {/* Signup Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[hsl(40,8%,45%)]">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlanOverride(user);
                          }}
                          className="text-[11px] font-mono px-2.5 py-1 rounded bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] hover:text-[hsl(42,95%,55%)] transition-colors border border-[hsl(220,10%,22%)]"
                        >
                          Override Plan →
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSuspend(user, e)}
                          className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                            user.suspended
                              ? 'text-[hsl(145,60%,50%)] hover:bg-[hsl(145,60%,45%,0.1)]'
                              : 'text-[hsl(0,72%,60%)] hover:bg-[hsl(0,72%,55%,0.1)]'
                          }`}
                        >
                          {user.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-[hsl(220,10%,16%)] flex items-center justify-between text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] bg-[hsl(220,14%,10%)]">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] disabled:opacity-30 disabled:cursor-not-allowed text-[hsl(40,20%,90%)]"
              >
                ← Prev
              </button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] disabled:opacity-30 disabled:cursor-not-allowed text-[hsl(40,20%,90%)]"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Plan Override Drawer / Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,22%)] rounded-2xl max-w-xl w-full p-5 sm:p-7 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,18%)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[hsl(42,95%,55%)] font-bold block">
                  MANUAL OVERRIDE
                </span>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                  Override User Membership
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-xs font-mono w-7 h-7 rounded-lg bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] text-[hsl(40,8%,50%)] hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Target User Info */}
              <div className="bg-[hsl(220,14%,8%)] border border-[hsl(220,10%,16%)] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[hsl(40,8%,45%)] uppercase tracking-wider block">
                    Target User
                  </span>
                  <p className="text-xs font-bold text-[hsl(40,20%,92%)] font-mono">{editingUser.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[hsl(40,8%,45%)] uppercase tracking-wider block">
                    Current Plan
                  </span>
                  <span className="text-xs font-mono font-bold text-[hsl(42,95%,55%)]">
                    {editingUser.plan.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono ${
                    statusMsg.type === 'success'
                      ? 'bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] border border-[hsl(145,60%,45%,0.3)]'
                      : 'bg-[hsl(0,72%,55%,0.15)] text-[var(--red)] border border-[hsl(0,72%,55%,0.3)]'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              {/* Select New Plan */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[hsl(40,8%,50%)] block mb-2 font-bold">
                  Select New Plan Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOverridePlan('free')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      overridePlan === 'free'
                        ? 'border-[hsl(40,20%,80%)] bg-[hsl(220,10%,20%)] text-white shadow-md'
                        : 'border-[hsl(220,10%,18%)] bg-[hsl(220,13%,11%)] text-[hsl(40,8%,50%)] hover:text-white'
                    }`}
                  >
                    <span>Free</span>
                    <span className="text-[10px] font-normal opacity-70 mt-1">3 idea scans, 1 tool scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplySprintPassPreset}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      overridePlan === 'sprint_pass'
                        ? 'border-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] shadow-md'
                        : 'border-[hsl(220,10%,18%)] bg-[hsl(220,13%,11%)] text-[hsl(40,8%,50%)] hover:text-white'
                    }`}
                  >
                    <span>🏃 Sprint Pass</span>
                    <span className="text-[10px] font-normal opacity-70 mt-1">7 days unlimited (+7d preset)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverridePlan('founder_pro')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      overridePlan === 'founder_pro'
                        ? 'border-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] shadow-md'
                        : 'border-[hsl(220,10%,18%)] bg-[hsl(220,13%,11%)] text-[hsl(40,8%,50%)] hover:text-white'
                    }`}
                  >
                    <span>★ Founder Pro</span>
                    <span className="text-[10px] font-normal opacity-70 mt-1">Unlimited full suite</span>
                  </button>
                </div>
              </div>

              {/* Expiry Date Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[hsl(40,8%,50%)] font-bold">
                    Plan Expiry Date <span className="text-[hsl(40,8%,40%)] font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplySprintPassPreset}
                      className="text-[10px] font-mono text-[hsl(42,95%,55%)] hover:underline cursor-pointer"
                    >
                      +7 Days
                    </button>
                    <span className="text-[hsl(40,8%,30%)]">•</span>
                    <button
                      type="button"
                      onClick={handleClearExpiry}
                      className="text-[10px] font-mono text-[hsl(40,8%,50%)] hover:text-white cursor-pointer"
                    >
                      Clear Expiry
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={overrideExpiry}
                  onChange={(e) => setOverrideExpiry(e.target.value)}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-xl p-2.5 text-xs text-[hsl(40,20%,90%)] font-mono focus:outline-none focus:border-[hsl(42,95%,55%)]"
                />
                <p className="text-[10px] text-[hsl(40,8%,45%)] font-mono mt-1">
                  Leave blank for permanent plans (Founder Pro, Free Explorer).
                </p>
              </div>

              {/* Required Reason Field */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[hsl(40,8%,50%)] block mb-1.5 font-bold">
                  Reason for Override <span className="text-[var(--red)] font-bold">* Required for audit log</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Beta tester gift, Twitter launch winner, billing fix, extending expired hackathon sprint..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-xl p-3 text-xs text-[hsl(40,20%,92%)] placeholder:text-[hsl(40,8%,40%)] focus:outline-none focus:border-[hsl(42,95%,55%)] font-[family-name:var(--font-inter)] leading-relaxed"
                />
              </div>

              {/* Audit Trail History */}
              <div className="pt-2 border-t border-[hsl(220,10%,16%)]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[hsl(40,8%,45%)] block mb-2 font-bold">
                  User Override History (admin_actions_log)
                </span>
                {loadingLogs ? (
                  <div className="text-center py-4 text-xs font-mono text-[hsl(40,8%,50%)]">
                    Loading audit trail...
                  </div>
                ) : overrideLogs.length === 0 ? (
                  <div className="text-xs font-mono text-[hsl(40,8%,40%)] p-3 rounded-lg bg-[hsl(220,14%,8%)] border border-[hsl(220,10%,14%)]">
                    No manual overrides recorded for this user yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {overrideLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-[hsl(220,14%,8%)] border border-[hsl(220,10%,16%)] rounded-lg p-2.5 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[hsl(40,8%,50%)]">
                          <span>
                            {new Date(log.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[hsl(42,95%,55%)] font-bold">
                            {log.details?.newPlan?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[hsl(40,20%,85%)] font-[family-name:var(--font-inter)]">
                          &ldquo;{log.details?.reason || 'No reason specified'}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[hsl(220,10%,18%)] shrink-0">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[hsl(40,8%,60%)] hover:text-white bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingOverride || !overrideReason.trim()}
                onClick={handleSavePlanOverride}
                className="px-5 py-2 rounded-xl bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs font-[family-name:var(--font-space-grotesk)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              >
                {savingOverride ? 'Applying...' : 'Apply Plan Override →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
