'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/table';
import { Ban, CheckCircle, UserX, Shield, UserCog, Trash2, Eye } from 'lucide-react';
import { apiRequest } from '@/services/api/client';

interface AdminUser {
  id: string;
  email: string;
  username?: string | null;
  role: string;
  isBanned: boolean;
  isSuspended: boolean;
  trustScore: number;
  createdAt: string;
}

const LIMIT = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'moderator' | 'admin' | 'super_admin'>('user');
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * LIMIT;
    const params = new URLSearchParams({ offset: String(offset), limit: String(LIMIT) });
    if (search) params.append('search', search);
    if (roleFilter) params.append('role', roleFilter);

    apiRequest<{ users: AdminUser[]; total: number }>(
      `/api/v1/admin-panel/users?${params}`,
      { auth: true },
    )
      .then((data) => { setUsers(data.users); setTotal(data.total); })
      .catch(() => addToast({ type: 'error', title: 'Failed to load users' }))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter, addToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (endpoint: string, method: 'PUT' | 'DELETE' = 'PUT', body?: object) => {
    setActionLoading(true);
    try {
      await apiRequest(`/api/v1/admin-panel/users/${endpoint}`, { auth: true, method, body });
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/v1/admin-panel/users/${selectedUser.id}/role`, {
        auth: true,
        method: 'PUT',
        body: { role: newRole },
      });
      addToast({ type: 'success', title: 'Role updated' });
      setRoleModalOpen(false);
      fetchUsers();
    } catch {
      addToast({ type: 'error', title: 'Failed to update role' });
    } finally {
      setActionLoading(false);
    }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, 'danger' | 'warning' | 'success' | 'default'> = {
      super_admin: 'danger',
      admin: 'warning',
      moderator: 'success',
      user: 'default',
    };
    return map[role] ?? 'default';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/40 text-sm mt-1">{total.toLocaleString()} total accounts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search email or username…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-violet-500/50"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="text-white/40">User</TableHead>
                  <TableHead className="text-white/40">Role</TableHead>
                  <TableHead className="text-white/40">Status</TableHead>
                  <TableHead className="text-white/40">Trust</TableHead>
                  <TableHead className="text-white/40">Joined</TableHead>
                  <TableHead className="text-right text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/30 py-12">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/3">
                      <TableCell>
                        <div className="font-medium text-white text-sm">
                          {user.username || user.email.split('@')[0]}
                        </div>
                        <div className="text-white/40 text-xs">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadge(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="danger">Banned</Badge>
                        ) : user.isSuspended ? (
                          <Badge variant="warning">Suspended</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-white/50 text-sm">{user.trustScore}</span>
                      </TableCell>
                      <TableCell className="text-white/30 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <a href={`/admin/users/${user.id}`}>
                            <Button size="sm" variant="ghost" title="View Detail" disabled={actionLoading}>
                              <Eye className="w-4 h-4 text-blue-400" />
                            </Button>
                          </a>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setNewRole(user.role as any); setRoleModalOpen(true); }} title="Change Role" disabled={actionLoading}>
                            <UserCog className="w-4 h-4 text-white/50" />
                          </Button>
                          {!user.isBanned ? (
                            <Button size="sm" variant="ghost" onClick={() => doAction(`${user.id}/ban`, 'PUT', { reason: 'Banned by admin' })} title="Ban" disabled={actionLoading}>
                              <Ban className="w-4 h-4 text-rose-400" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => doAction(`${user.id}/unban`, 'PUT', { reason: 'Unbanned by admin' })} title="Unban" disabled={actionLoading}>
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            </Button>
                          )}
                          {!user.isSuspended ? (
                            <Button size="sm" variant="ghost" onClick={() => doAction(`${user.id}/suspend`, 'PUT', { reason: 'Suspended by admin', durationHours: 24 })} title="Suspend 24h" disabled={actionLoading}>
                              <UserX className="w-4 h-4 text-amber-400" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => doAction(`${user.id}/unsuspend`, 'PUT', { reason: 'Unsuspended by admin' })} title="Unsuspend" disabled={actionLoading}>
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Permanently delete this user?')) doAction(`${user.id}`, 'DELETE'); }} title="Delete" disabled={actionLoading}>
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/30">
              {total === 0 ? '0' : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)}`} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-white/40 px-2 py-1">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={users.length < LIMIT}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Role Modal */}
      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Change User Role">
        <div className="space-y-4 py-2">
          <p className="text-sm text-white/50">
            Changing role for <strong className="text-white">{selectedUser?.username || selectedUser?.email}</strong>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['user', 'moderator', 'admin', 'super_admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setNewRole(role)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all ${
                  newRole === role
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
          <p className="text-xs text-amber-400/70">⚠ Cannot modify super_admin accounts.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRoleChange} isLoading={actionLoading}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
