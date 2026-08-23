'use client';

import { useState, useEffect, useCallback } from 'react';
import ScanningIndicator from '@/components/ScanningIndicator';
import { PlanType, UserRole } from '@/types';

interface UserItem {
  _id: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  suspended: boolean;
  adminNotes: string;
  scansUsedThisMonth: number;
  scansResetDate: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [overridePlan, setOverridePlan] = useState<PlanType>('free');
  const [adminNote, setAdminNote] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search ? { search } : {}),
      ...(planFilter ? { plan: planFilter } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(suspendedFilter ? { suspended: suspendedFilter } : {}),
    });

    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setUsers(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, planFilter, roleFilter, suspendedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuspend = async (user: UserItem) => {
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
          userId: user._id,
          suspended: nextSuspended,
          note: nextSuspended ? 'Suspended by admin' : 'Reactivated by admin',
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, suspended: nextSuspended } : u))
        );
      }
    } catch {
      alert('Failed to update user suspension status');
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role for ${user.email} to ${nextRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          role: nextRole,
          note: `Role toggled to ${nextRole}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
        );
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch {
      alert('Error updating role');
    }
  };

  const handleOpenPlanOverride = (user: UserItem) => {
    setEditingUser(user);
    setOverridePlan(user.plan === 'pro' ? 'free' : 'pro');
    setAdminNote('');
  };

  const handleSavePlanOverride = async () => {
    if (!editingUser) return;
    if (!adminNote.trim()) {
      alert('Please write an admin note/reason for this plan override for accountability.');
      return;
    }

    setSavingOverride(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser._id,
          plan: overridePlan,
          note: adminNote.trim(),
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === editingUser._id
              ? { ...u, plan: overridePlan, adminNotes: adminNote.trim() }
              : u
          )
        );
        setEditingUser(null);
      } else {
        alert('Failed to update user plan');
      }
    } catch {
      alert('Error saving plan override');
    } finally {
      setSavingOverride(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(220,10%,14%)]">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
            User Directory
          </h1>
          <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)] mt-0.5">
            Manage plans, suspend abusive accounts, and promote admins ({totalCount} total).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search users by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3.5 py-2 text-xs text-[hsl(40,20%,92%)] placeholder:text-[hsl(40,8%,40%)] focus:outline-none focus:border-[hsl(42,95%,55%)] font-[family-name:var(--font-inter)]"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="free">Free Users</option>
          <option value="pro">Pro Subscribers</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">Standard Users</option>
          <option value="admin">Admins</option>
        </select>

        {/* Status Filter */}
        <select
          value={suspendedFilter}
          onChange={(e) => {
            setSuspendedFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg px-3 py-2 text-xs text-[hsl(40,20%,90%)] font-[family-name:var(--font-mono)] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="false">Active Only</option>
          <option value="true">Suspended Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <ScanningIndicator size="lg" className="mb-3" />
            <p className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">Loading user directory...</p>
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
                  <th className="py-3 px-4 font-medium">Plan & Role</th>
                  <th className="py-3 px-4 font-medium">Monthly Usage</th>
                  <th className="py-3 px-4 font-medium">Joined Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(220,10%,16%)]">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-[hsl(220,10%,14%)] transition-colors">
                    {/* Email */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs text-[hsl(40,20%,92%)]">{user.email}</p>
                      {user.adminNotes && (
                        <p className="text-[10px] text-[hsl(40,8%,45%)] italic mt-0.5 max-w-xs truncate">
                          Note: {user.adminNotes}
                        </p>
                      )}
                    </td>

                    {/* Plan & Role */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-[family-name:var(--font-mono)] uppercase px-2 py-0.5 rounded font-bold ${
                            user.plan === 'pro'
                              ? 'bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)]'
                              : 'bg-[hsl(220,10%,16%)] text-[hsl(40,8%,50%)]'
                          }`}
                        >
                          {user.plan}
                        </span>
                        {user.role === 'admin' && (
                          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 rounded bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scans Used */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-xs text-[hsl(40,8%,60%)]">
                      {user.scansUsedThisMonth} {user.plan === 'pro' ? '(∞)' : '/ 3'}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-[family-name:var(--font-mono)] text-[11px] text-[hsl(40,8%,45%)]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {user.suspended ? (
                        <span className="text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(0,72%,55%,0.15)] text-[hsl(0,72%,60%)] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(145,60%,50%)]">
                          ● Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenPlanOverride(user)}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] transition-colors"
                      >
                        Override Plan
                      </button>
                      <button
                        onClick={() => handleToggleRole(user)}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded border border-[hsl(220,10%,20%)] hover:bg-[hsl(220,10%,16%)] text-[hsl(40,8%,60%)] transition-colors"
                      >
                        {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(user)}
                        className={`text-[11px] font-[family-name:var(--font-mono)] px-2 py-1 rounded transition-colors ${
                          user.suspended
                            ? 'text-[hsl(145,60%,50%)] hover:bg-[hsl(145,60%,45%,0.1)]'
                            : 'text-[hsl(0,72%,60%)] hover:bg-[hsl(0,72%,55%,0.1)]'
                        }`}
                      >
                        {user.suspended ? 'Unsuspend' : 'Suspend'}
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

      {/* Plan Override Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,22%)] rounded-xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(220,10%,18%)]">
              <h3 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Override Plan for User
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1">
                Target User
              </span>
              <p className="text-xs font-semibold text-[hsl(40,20%,90%)]">{editingUser.email}</p>
            </div>

            <div>
              <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1.5">
                Select New Plan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOverridePlan('free')}
                  className={`py-2 px-3 rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold border transition-colors ${
                    overridePlan === 'free'
                      ? 'border-[hsl(40,20%,80%)] bg-[hsl(220,10%,20%)] text-white'
                      : 'border-[hsl(220,10%,18%)] text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,80%)]'
                  }`}
                >
                  Free (3 scans/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setOverridePlan('pro')}
                  className={`py-2 px-3 rounded-lg text-xs font-[family-name:var(--font-mono)] font-bold border transition-colors ${
                    overridePlan === 'pro'
                      ? 'border-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)]'
                      : 'border-[hsl(220,10%,18%)] text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,80%)]'
                  }`}
                >
                  Pro (Unlimited)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,45%)] block mb-1.5">
                Admin Note / Audit Reason <span className="text-[hsl(0,72%,60%)]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Granted lifetime pro for early beta feedback..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-lg p-3 text-xs text-[hsl(40,20%,92%)] placeholder:text-[hsl(40,8%,40%)] focus:outline-none focus:border-[hsl(42,95%,55%)]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[hsl(220,10%,18%)]">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 rounded text-xs text-[hsl(40,8%,60%)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingOverride || !adminNote.trim()}
                onClick={handleSavePlanOverride}
                className="px-4 py-1.5 rounded bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs font-[family-name:var(--font-space-grotesk)] disabled:opacity-50"
              >
                {savingOverride ? 'Saving...' : 'Apply Plan Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
