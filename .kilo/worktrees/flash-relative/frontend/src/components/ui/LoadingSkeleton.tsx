'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'post' | 'comment' | 'friend' | 'photo' | 'text' | 'card';
  className?: string;
}

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse', className)} />
);

const PostSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="flex gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="flex-1 h-8" />
      <Skeleton className="flex-1 h-8" />
      <Skeleton className="flex-1 h-8" />
    </div>
  </div>
);

const CommentSkeleton = () => (
  <div className="space-y-3 p-4">
    <div className="flex gap-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

const FriendSkeleton = () => (
  <div className="text-center space-y-2 p-4">
    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
    <Skeleton className="h-4 w-20 mx-auto" />
    <Skeleton className="h-3 w-16 mx-auto" />
    <Skeleton className="h-8 w-full mt-2" />
  </div>
);

const PhotoSkeleton = () => <Skeleton className="w-full pt-[100%]" />;

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  variant = 'post',
  className,
}) => {
  const getSkeletonComponent = () => {
    switch (variant) {
      case 'post':
        return <PostSkeleton />;
      case 'comment':
        return <CommentSkeleton />;
      case 'friend':
        return <FriendSkeleton />;
      case 'photo':
        return <PhotoSkeleton />;
      case 'text':
        return <Skeleton className="h-4 w-full" />;
      case 'card':
        return <Skeleton className="h-32 w-full rounded-lg" />;
      default:
        return <PostSkeleton />;
    }
  };

  const gridClass = {
    post: 'space-y-4',
    comment: 'space-y-3',
    friend: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    photo: 'grid grid-cols-3 gap-3',
    text: 'space-y-2',
    card: 'grid grid-cols-2 gap-4',
  }[variant];

  return (
    <div className={cn(gridClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {getSkeletonComponent()}
        </div>
      ))}
    </div>
  );
};
