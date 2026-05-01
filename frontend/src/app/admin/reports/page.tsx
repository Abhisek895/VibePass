'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/table';
import { CheckCircle, X, Eye, ArrowUp } from 'lucide-react';
import { apiRequest } from '@/services/api/client';

interface Report {
  id: string;
  reason: string;
  description?: string | null;
  status: 'pending' | 'resolved' | 'dismissed' | 'escalated';
  createdAt: string;
  reporter: { id: string; username: string | null; email: string };
  reported: { id: string; username: string | null; email: string };
  chat?: { id: string; user1: { username: string }; user2: { username: string } } | null;
}

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  resolved: 'success',
  dismissed: 'default',
  escalated: 'danger',
};

const STATUSES = ['pending', 'resolved', 'dismissed', 'escalated'];
const LIMIT = 20;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<Report | null>(null);
  const [notes, setNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const { addToast } = useToast();

  const fetchReports = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * LIMIT;
    const params = new URLSearchParams({ status: statusFilter, offset: String(offset), limit: String(LIMIT) });
    apiRequest<{ reports: Report[]; total: number }>(`/api/v1/admin-panel/reports?${params}`, { auth: true })
      .then((d) => { setReports(d.reports); setTotal(d.total); })
      .catch(() => addToast({ type: 'error', title: 'Failed to load reports' }))
      .finally(() => setLoading(false));
  }, [statusFilter, page, addToast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async (action: 'resolved' | 'dismissed' | 'escalated') => {
    if (!selected) return;
    setResolving(true);
    try {
      await apiRequest(`/api/v1/admin-panel/reports/${selected.id}/resolve`, {
        auth: true,
        method: 'PUT',
        body: { action, notes },
      });
      addToast({ type: 'success', title: `Report ${action}` });
      setSelected(null);
      fetchReports();
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-white/40 text-sm mt-1">Review and act on user reports · {total} {statusFilter}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-white/40 hover:text-white border border-white/8 hover:border-white/20'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="text-white/40">Reason</TableHead>
                  <TableHead className="text-white/40">Reporter</TableHead>
                  <TableHead className="text-white/40">Reported User</TableHead>
                  <TableHead className="text-white/40">Date</TableHead>
                  <TableHead className="text-white/40">Status</TableHead>
                  <TableHead className="text-right text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/30 py-12">
                      No {statusFilter} reports.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((r) => (
                    <TableRow key={r.id} className="border-white/5 hover:bg-white/3">
                      <TableCell>
                        <span className="font-medium text-white text-sm capitalize">
                          {r.reason.replace(/_/g, ' ')}
                        </span>
                        {r.description && (
                          <p className="text-white/30 text-xs line-clamp-1 mt-0.5">{r.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{r.reporter.username || '—'}</p>
                        <p className="text-white/30 text-xs">{r.reporter.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{r.reported.username || '—'}</p>
                        <p className="text-white/30 text-xs">{r.reported.email}</p>
                      </TableCell>
                      <TableCell className="text-white/30 text-sm">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[r.status] ?? 'default'}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelected(r); setNotes(''); }} title="View / Resolve">
                            <Eye className="w-4 h-4 text-white/50" />
                          </Button>
                          {r.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => { setSelected(r); handleResolve('resolved'); }} title="Resolve">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setSelected(r); handleResolve('dismissed'); }} title="Dismiss">
                                <X className="w-4 h-4 text-white/40" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setSelected(r); handleResolve('escalated'); }} title="Escalate">
                                <ArrowUp className="w-4 h-4 text-amber-400" />
                              </Button>
                            </>
                          )}
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
            <span className="text-sm text-white/30">{total === 0 ? '0' : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)}`} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-white/40 px-2 py-1">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={reports.length < LIMIT}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Detail / Resolve Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Report Detail">
        {selected && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Reason</p>
                <p className="text-white capitalize">{selected.reason.replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Status</p>
                <Badge variant={STATUS_BADGE[selected.status] ?? 'default'}>{selected.status}</Badge>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Reporter</p>
                <p className="text-white">{selected.reporter.username || selected.reporter.email}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/40 text-xs mb-1">Reported</p>
                <p className="text-white">{selected.reported.username || selected.reported.email}</p>
              </div>
            </div>
            {selected.description && (
              <div className="bg-white/5 rounded-lg p-3 text-sm">
                <p className="text-white/40 text-xs mb-1">Description</p>
                <p className="text-white/80">{selected.description}</p>
              </div>
            )}
            {selected.status === 'pending' && (
              <>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Notes (optional)</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-violet-500/50"
                    rows={3}
                    placeholder="Add moderation notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => handleResolve('resolved')} isLoading={resolving}>
                    <CheckCircle className="w-4 h-4" /> Resolve
                  </Button>
                  <Button variant="secondary" onClick={() => handleResolve('escalated')} isLoading={resolving}>
                    <ArrowUp className="w-4 h-4" /> Escalate
                  </Button>
                  <Button variant="ghost" onClick={() => handleResolve('dismissed')} isLoading={resolving}>
                    <X className="w-4 h-4" /> Dismiss
                  </Button>
                </div>
              </>
            )}
            {selected.status !== 'pending' && (
              <p className="text-sm text-white/30 text-center py-2">
                This report has already been <strong className="text-white/60">{selected.status}</strong>.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
