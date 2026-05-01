"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import { UserRound, HeartIcon, XIcon } from 'lucide-react';
import type { MatchViewModel } from '../_lib/matches-view-model';
import { normalizeImageUrl } from '@/lib/image-utils';

const SWIPE_THRESHOLD = 120;

type MatchesSwipeDeckProps = {
  matches: MatchViewModel[];
  onLike: (match: MatchViewModel) => void;
  onPass: (match: MatchViewModel) => void;
  onViewProfile: (match: MatchViewModel) => void;
};

/**
 * Unified DiscoveryCard handles both Active and Background states.
 */
function DiscoveryCard({
  match,
  index,
  total,
  onSwipeLeft,
  onSwipeRight,
  onViewProfile
}: {
  match: MatchViewModel;
  index: number;
  total: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onViewProfile: () => void;
}) {
  const isActive = index === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  const likeOpacity = useTransform(x, [40, 100], [0, 1]);
  const passOpacity = useTransform(x, [-40, -100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (!isActive) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > SWIPE_THRESHOLD || velocity > 400) {
      animate(x, 600, { duration: 0.3 }).then(onSwipeRight);
    } else if (offset < -SWIPE_THRESHOLD || velocity < -400) {
      animate(x, -600, { duration: 0.3 }).then(onSwipeLeft);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
    }
  };

  const scale = 1 - index * 0.05;
  const yOffset = index * 10;
  const zIndex = 100 - index;

  return (
    <motion.div
      key={match.id}
      style={{ x, rotate, zIndex, willChange: 'transform' }}
      drag={isActive ? "x" : false}
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 35 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: scale - 0.05, y: yOffset + 10 }}
      animate={{
        opacity: isActive ? 1 : 0.8,
        scale,
        y: yOffset,
        transition: {
          type: 'spring',
          stiffness: 600,
          damping: 40,
          mass: 0.4,
          restDelta: 0.001
        }
      }}
      exit={{
        opacity: 0,
        x: x.get() > 20 ? 800 : x.get() < -20 ? -800 : 0,
        transition: { duration: 0.2, ease: "circIn" }
      }}
      className="absolute inset-0 touch-none origin-bottom"
    >
      <article className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl relative group">
        <div className="relative h-full w-full">
          {normalizeImageUrl(match.avatarUrl) ? (
            <>
              <img
                src={normalizeImageUrl(match.avatarUrl)!}
                alt={match.displayName}
                className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
              />
              {!isActive && <div className="absolute inset-0 bg-slate-950/40 transition-opacity" />}
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-800" />
          )}

          {/* Swipe Stamps */}
          {isActive && (
            <>
              <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-6 z-40 px-4 py-2 border-4 border-green-500 rounded-lg -rotate-12 pointer-events-none">
                <span className="text-3xl font-black text-green-500 uppercase">LIKE</span>
              </motion.div>
              <motion.div style={{ opacity: passOpacity }} className="absolute top-10 right-6 z-40 px-4 py-2 border-4 border-red-500 rounded-lg rotate-12 pointer-events-none">
                <span className="text-3xl font-black text-red-500 uppercase">NOPE</span>
              </motion.div>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Profile Details */}
          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3 z-20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
                <h3 className="text-lg font-bold text-white truncate">{match.displayName}</h3>
                <span className="text-base text-white/70 font-medium">{match.age}</span>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
                className="flex-shrink-0 p-2 rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 shadow-lg"
              >
                <UserRound className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-white/80 line-clamp-1">
              {match.locationLabel ? `${match.locationLabel} · ` : ''}
              {match.moodLabel}
            </p>

            <div className="flex flex-wrap gap-2">
              {match.interests.slice(0, 3).map(interest => (
                <span key={interest} className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {interest}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); animate(x, -800, { type: 'spring', stiffness: 400, damping: 35, velocity: -2000 }).then(onSwipeLeft); }}
                className="h-14 w-14 flex items-center justify-center rounded-full bg-slate-800 border border-white/10 text-red-500 shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <XIcon className="h-7 w-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); animate(x, 800, { type: 'spring', stiffness: 400, damping: 35, velocity: 2000 }).then(onSwipeRight); }}
                className="h-14 w-14 flex items-center justify-center rounded-full bg-white text-rose-600 shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <HeartIcon className="h-7 w-7 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

export function MatchesSwipeDeck({
  matches,
  onLike,
  onPass,
  onViewProfile,
}: MatchesSwipeDeckProps) {
  if (matches.length === 0) return null;

  const visibleMatches = matches.slice(0, 3);

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-full px-4 relative">
      <div className="relative w-full aspect-[3/5] sm:aspect-auto sm:h-[42rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleMatches.map((match, index) => (
            <DiscoveryCard
              key={match.id}
              match={match}
              index={index}
              total={visibleMatches.length}
              onSwipeLeft={() => onPass(match)}
              onSwipeRight={() => onLike(match)}
              onViewProfile={() => onViewProfile(match)}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
