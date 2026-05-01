'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/services/api/client';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  createdAt: string;
  admin: { id: string; username: string | null; email: string; role: string };
}

const ACTION_COLORS: Record<string, string> = {
  USER_BAN: 'text-rose-400',
  USER_UNBAN: 'text-emerald-400',
  USER_SUSPEND: 'text-amber-400',
  USER_UNSUSPEND: 'text-emerald-400',
  USER_DELETE: 'text-rose-600',
  ROLE_CHANGE: 'text-violet-400',
  REPORT_RESOLVE: 'text-blue-400',
  POST_DELETE: 'text-orange-400',
};

const LIMIT = 25;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * LIMIT;
    apiRequest<{ logs: AuditLog[]; total: number }>(
      `/api/v1/admin-panel/audit-logs?offset=${offset}&limit=${LIMIT}`,
      { auth: true },
    )
      .then((d) => { setLogs(d.logs); setTotal(d.total); })
      .catch(() => console.error('Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-white/40 text-sm mt-1">
          Complete record of all admin actions · {total.toLocaleString()} entries
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="text-white/40">Action</TableHead>
                  <TableHead className="text-white/40">Target</TableHead>
                  <TableHead className="text-white/40">Details</TableHead>
                  <TableHead className="text-white/40">Admin</TableHead>
                  <TableHead className="text-white/40">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-white/30 py-12">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/3">
                      <TableCell>
                        <code
                          className={`text-xs font-mono px-2 py-1 rounded bg-white/5 ${ACTION_COLORS[log.action] ?? 'text-white/60'}`}
                        >
                          {log.action}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.entityType}</Badge>
                          <span className="text-white/30 text-xs font-mono">{log.entityId.slice(0, 8)}…</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/40 text-sm max-w-xs truncate" title={log.details ?? ''}>
                        {log.details || '—'}
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{log.admin.username || log.admin.email.split('@')[0]}</p>
                        <p className="text-white/30 text-xs">{log.admin.role}</p>
                      </TableCell>
                      <TableCell className="text-white/30 text-sm whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
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
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={logs.length < LIMIT}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
