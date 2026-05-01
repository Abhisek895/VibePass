"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import {
  getConnections,
  getMatchPool,
  submitMatchAction,
  type ConnectionPreview,
  type Match,
} from '@/services/api';
import { apiRequest } from '@/services/api/client';
import { getAccessToken } from '@/services/api/storage';
import { fetchProfile } from '@/services/api/profile-content.service';
import { useAuth } from '@/store/auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MatchesEmptyState } from './_components/MatchesEmptyState';
import { MatchesFilterTabs } from './_components/MatchesFilterTabs';
import { MatchesHeader } from './_components/MatchesHeader';
import { MatchesLoadingState } from './_components/MatchCardSkeleton';
import { MatchesSwipeDeck } from './_components/MatchesSwipeDeck';
import { MatchSuccessOverlay } from './_components/MatchSuccessOverlay';
import {
  buildMatchViewModels,
  filterMatches,
  getSummaryCounts,
  MATCHES_MOCK_CONNECTIONS,
  MATCHES_MOCK_POOL,
  sortMatches,
  type MatchesFilterKey,
  type MatchesSortKey,
  type MatchViewModel,
} from './_lib/matches-view-model';

export default function MatchesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const [matchPool, setMatchPool] = useState<Match[]>([]);
  const [connections, setConnections] = useState<ConnectionPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<MatchesFilterKey>('all');
  const [sortValue, setSortValue] = useState<MatchesSortKey>('recent');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [matchedUserForOverlay, setMatchedUserForOverlay] = useState<MatchViewModel | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const socketRef = useRef<Socket | null>(null);

  const hasToken = typeof window !== 'undefined' ? Boolean(getAccessToken()) : false;

  // Real-time Badge Sync
  useEffect(() => {
    if (!isAuthenticated || !hasToken) return;
    const token = getAccessToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3003` : 'http://localhost:3003');

    if (!socketRef.current) {
      const socket = io(`${apiUrl}/chat`, { auth: { token } });

      const refreshQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      };

      socket.on('chat:message_received', refreshQueries);
      socket.on('notifications:new', refreshQueries);

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, hasToken, queryClient]);

  const { data: unreadMessagesData } = useQuery({
    queryKey: ['notifications', 'messages-count'],
    queryFn: () =>
      apiRequest<{ count: number }>('/api/v1/notifications/unread-messages-count', {
        auth: true,
      }),
    enabled: isAuthenticated && hasToken,
  });

  const unreadMessagesCount = unreadMessagesData?.count ?? 0;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('vibepass-match-favorites');
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage issues and keep a clean in-memory fallback.
    }
  }, []);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      window.localStorage.removeItem('vibepass-match-favorites');
      return;
    }

    window.localStorage.setItem(
      'vibepass-match-favorites',
      JSON.stringify(favoriteIds),
    );
  }, [favoriteIds]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setFeedback('');

      const [poolResult, connectionsResult] = await Promise.allSettled([
        getMatchPool(),
        getConnections(),
      ]);

      if (cancelled) {
        return;
      }

      const livePool =
        poolResult.status === 'fulfilled' ? poolResult.value : null;
      const liveConnections =
        connectionsResult.status === 'fulfilled' ? connectionsResult.value : null;

      if (livePool || liveConnections) {
        setMatchPool(livePool ?? []);
        setConnections(liveConnections ?? []);
        setDismissedIds([]);

        if (poolResult.status === 'rejected' || connectionsResult.status === 'rejected') {
          setFeedback('Some live match details are unavailable right now.');
        }
      } else {
        setMatchPool(MATCHES_MOCK_POOL);
        setConnections(MATCHES_MOCK_CONNECTIONS);
        setDismissedIds([]);
        setFeedback('Live matches are unavailable, so you are seeing a local preview.');
      }

      setIsLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router]);


  const allMatches = useMemo(
    () => buildMatchViewModels(matchPool, connections, {
      favorites: favoriteIds,
    }),
    [connections, favoriteIds, matchPool],
  );

  const filteredMatches = useMemo(() => {
    const filtered = filterMatches(allMatches, activeFilter, '');
    return sortMatches(
      filtered.filter(match => !dismissedIds.includes(match.id)),
      sortValue,
    );
  }, [activeFilter, allMatches, dismissedIds, sortValue]);

  const counts = useMemo(() => {
    const summary = getSummaryCounts(allMatches);

    return {
      active: summary.active,
      all: allMatches.length,
      favorites: allMatches.filter(match => match.isFavorite).length,
      nearby: allMatches.filter(match => match.isNearby).length,
      new: summary.new,
      recent: allMatches.filter(match => match.hasConversation).length,
      unread: summary.unread,
    };
  }, [allMatches]);

  const activeSummary = counts.unread > 0
    ? 'unread'
    : counts.new > 0
      ? 'new'
      : counts.active > 0
        ? 'active'
        : null;

  const handleLike = async (match: MatchViewModel) => {
    if (submittingId) {
      return;
    }

    if (match.connectionId) {
      setFeedback(`${match.displayName} is already in your matches.`);
      return;
    }

    if (!match.rawMatch) {
      return;
    }

    setSubmittingId(match.id);
    setFeedback('');

    try {
      const result = await submitMatchAction({
        action: 'like',
        matchId: match.rawMatch.id,
      });

      if (result.chatId) {
        setDismissedIds(current => [...current, match.id]);
        setMatchedUserForOverlay({ ...match, chatId: result.chatId });
        return;
      }

      setDismissedIds(current => [...current, match.id]);
      setFeedback(result.message || `You liked ${match.displayName}. If they like you back, it becomes a match.`);
    } catch {
      setFeedback('Unable to save your like right now.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleViewProfile = (match: MatchViewModel) => {
    router.push(`/profile/${match.username}`);
  };

  const handlePass = async (match: MatchViewModel) => {
    if (submittingId) {
      return;
    }

    setDismissedIds(current => [...current, match.id]);

    if (!match.rawMatch) {
      return;
    }

    setSubmittingId(match.id);

    try {
      await submitMatchAction({
        action: 'pass',
        matchId: match.rawMatch.id,
      });
    } catch {
      setFeedback('Unable to pass this profile right now.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleOpenFilters = () => {
    startTransition(() => {
      if (activeFilter === 'all') {
        setActiveFilter('favorites');
      } else {
        setActiveFilter('all');
      }
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0B141B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasMatches = allMatches.length > 0;
  const hasFilteredMatches = filteredMatches.length > 0;

  return (
    <div className="h-full flex flex-col bg-[#06090B] overflow-hidden relative">
      {/* Ambient Vibe Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-rose-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Immersive Header */}
      <header className="px-5 py-3 sm:py-4 bg-[#0B141B]/60 backdrop-blur-2xl border-b border-white/5 z-40">
        <div className="flex items-center justify-between max-w-xl mx-auto w-full">
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white uppercase italic">Discover</h1>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/chat"
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:text-[#25D366] transition-colors" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#25D366] text-[8px] sm:text-[10px] font-black text-black">
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleOpenFilters}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${activeFilter === 'favorites' ? 'bg-[#25D366] text-black scale-105' : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'}`}
            >
              {activeFilter === 'favorites' ? 'Viewing Favorites' : 'Show Favorites'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative no-scrollbar overflow-hidden z-30">

        {!hasMatches ? (
          <MatchesEmptyState />
        ) : !hasFilteredMatches ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-white/60 mb-4">No more profiles in this category.</p>
            <button onClick={() => setActiveFilter('all')} className="text-[#25D366] font-bold hover:underline">Show All Profiles</button>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto flex items-center justify-center">
            <MatchesSwipeDeck
              matches={filteredMatches}
              onLike={handleLike}
              onPass={handlePass}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </main>

      <MatchSuccessOverlay
        currentUser={{
          username: currentUser?.displayName || currentUser?.username || 'You',
          profilePhotoUrl: currentUser?.profilePhotoUrl || null,
        }}
        matchedUser={matchedUserForOverlay}
        onClose={() => setMatchedUserForOverlay(null)}
      />
    </div>
  );
}
