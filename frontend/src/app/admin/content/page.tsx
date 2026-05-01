'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/table';
import { Trash2, ImageIcon, Heart, MessageSquare, Share2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/services/api/client';

interface AdminPost {
  id: string;
  content: string;
  imageUrl?: string | null;
  isDarkMeme: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: { id: string; username: string | null; email: string; role: string };
  _count: { likes: number; comments: number };
}

const LIMIT = 20;

export default function AdminContentPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [darkMemeFilter, setDarkMemeFilter] = useState<'all' | 'dark' | 'normal'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * LIMIT;
    const params = new URLSearchParams({ offset: String(offset), limit: String(LIMIT) });
    if (search) params.append('search', search);
    if (darkMemeFilter === 'dark') params.append('darkMeme', 'true');
    if (darkMemeFilter === 'normal') params.append('darkMeme', 'false');

    apiRequest<{ posts: AdminPost[]; total: number }>(`/api/v1/admin-panel/content/posts?${params}`, { auth: true })
      .then((d) => { setPosts(d.posts); setTotal(d.total); })
      .catch(() => addToast({ type: 'error', title: 'Failed to load posts' }))
      .finally(() => setLoading(false));
  }, [page, search, darkMemeFilter, addToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/v1/admin-panel/content/posts/${deleteTarget.id}`, {
        auth: true,
        method: 'DELETE',
        body: { reason: deleteReason || 'Removed by admin' },
      });
      addToast({ type: 'success', title: 'Post removed' });
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      addToast({ type: 'error', title: 'Failed to remove post' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
          <p className="text-white/40 text-sm mt-1">Review and remove posts · {total.toLocaleString()} total</p>
        </div>
        <input
          type="text"
          placeholder="Search content or user…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'dark', 'normal'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setDarkMemeFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              darkMemeFilter === f
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-white/40 hover:text-white border border-white/8 hover:border-white/20'
            }`}
          >
            {f === 'all' ? 'All Posts' : f === 'dark' ? '🌑 Dark Meme' : '✅ Normal'}
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
                  <TableHead className="text-white/40 w-2/5">Content</TableHead>
                  <TableHead className="text-white/40">Author</TableHead>
                  <TableHead className="text-white/40">Type</TableHead>
                  <TableHead className="text-white/40">Engagement</TableHead>
                  <TableHead className="text-white/40">Date</TableHead>
                  <TableHead className="text-right text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-white/30 py-12">
                      No posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} className="border-white/5 hover:bg-white/3">
                      <TableCell>
                        <p className="text-sm text-white line-clamp-2">{post.content}</p>
                        {post.imageUrl && (
                          <span className="flex items-center gap-1 text-xs text-white/30 mt-1">
                            <ImageIcon className="w-3 h-3" /> Has image
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-white text-sm">{post.user.username || post.user.email.split('@')[0]}</p>
                        <p className="text-white/30 text-xs">{post.user.email}</p>
                      </TableCell>
                      <TableCell>
                        {post.isDarkMeme ? (
                          <Badge variant="danger">🌑 Dark Meme</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likesCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentsCount}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.sharesCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/30 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => { setDeleteTarget(post); setDeleteReason(''); }} title="Remove Post">
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/30">
              {total === 0 ? '0' : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)}`} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-white/40 px-2 py-1">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={posts.length < LIMIT}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Post">
        {deleteTarget && (
          <div className="space-y-4 py-2">
            <div className="bg-white/5 rounded-xl p-4 text-sm">
              <p className="text-white/80 line-clamp-3">{deleteTarget.content}</p>
              <p className="text-white/30 text-xs mt-2">
                by {deleteTarget.user.username || deleteTarget.user.email}
              </p>
            </div>
            {deleteTarget.isDarkMeme && (
              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This post is flagged as Dark Meme
              </div>
            )}
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Reason for removal (optional)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-violet-500/50"
                rows={3}
                placeholder="e.g. Violates community guidelines…"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
            <p className="text-xs text-white/30">
              This is permanent and will be recorded in the audit log.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Remove Post</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
