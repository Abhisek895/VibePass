'use client';

export function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Skeleton */}
      <div className="h-80 bg-gray-200 animate-pulse" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar & Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-20 pb-6">
          <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-48" />
            <div className="h-4 bg-gray-200 animate-pulse rounded-lg w-64" />
            <div className="h-4 bg-gray-200 animate-pulse rounded-lg w-40" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-6 border-b border-gray-200 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 space-y-3">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-full" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-5/6" />
                  <div className="h-32 bg-gray-200 animate-pulse rounded mt-4" />
                </div>
                <div className="flex gap-2 pt-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-gray-200 animate-pulse rounded-lg flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-1 bg-white rounded-full" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-red-50 rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl">
          ⚠️
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 mb-1">Error</p>
          <p className="text-gray-600 mb-4">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  type?: 'posts' | 'photos' | 'friends' | 'comments';
  viewMode?: 'owner' | 'visitor';
}

export function EmptyState({ type = 'posts', viewMode = 'visitor' }: EmptyStateProps) {
  const messages = {
    posts: {
      owner: {
        title: 'No posts yet',
        message: 'Share your first post to get started',
        icon: '📝',
      },
      visitor: {
        title: 'No posts',
        message: 'This user hasn\'t posted yet',
        icon: '📝',
      },
    },
    photos: {
      owner: {
        title: 'No photos yet',
        message: 'Upload your first photo to your gallery',
        icon: '📸',
      },
      visitor: {
        title: 'No photos',
        message: 'This user hasn\'t uploaded any photos',
        icon: '📸',
      },
    },
    friends: {
      owner: {
        title: 'No friends yet',
        message: 'Start connecting with people',
        icon: '👥',
      },
      visitor: {
        title: 'No friends',
        message: 'This user doesn\'t have any friends yet',
        icon: '👥',
      },
    },
    comments: {
      owner: {
        title: 'No comments',
        message: 'Be the first to comment',
        icon: '💬',
      },
      visitor: {
        title: 'No comments',
        message: 'Be the first to comment',
        icon: '💬',
      },
    },
  };

  const content = messages[type]?.[viewMode] || messages.posts[viewMode];

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-50 rounded-2xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-5xl">{content.icon}</span>
        <p className="font-semibold text-gray-900">{content.title}</p>
        <p className="text-gray-600 text-sm px-4">{content.message}</p>
      </div>
    </div>
  );
}
