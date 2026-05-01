import { Loader2, User, FileText, Image as ImageIcon, Users } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[rgb(var(--text-muted))]">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[rgb(var(--accent-primary))]" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[rgb(var(--text-muted))]">
      <div className="w-16 h-16 rounded-full bg-[rgb(var(--danger),0.1)] flex items-center justify-center mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <p className="text-lg font-medium mb-2 text-[rgb(var(--text-primary))]">Something went wrong</p>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  type: 'posts' | 'photos' | 'friends';
  viewMode: 'owner' | 'visitor';
}

const emptyStateConfig = {
  posts: {
    icon: FileText,
    owner: { title: 'No posts yet', description: 'Share your first post with your friends' },
    visitor: { title: 'No posts to show', description: 'This user hasn\'t shared anything publicly' },
  },
  photos: {
    icon: ImageIcon,
    owner: { title: 'No photos yet', description: 'Upload your first photo' },
    visitor: { title: 'No photos to show', description: 'This user hasn\'t shared any photos publicly' },
  },
  friends: {
    icon: Users,
    owner: { title: 'No friends yet', description: 'Start connecting with people' },
    visitor: { title: 'No friends to show', description: 'This user\'s friends list is private' },
  },
};

export function EmptyState({ type, viewMode }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;
  const content = config[viewMode];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-[rgb(var(--text-muted))]">
      <div className="w-16 h-16 rounded-full bg-[rgb(var(--bg-surface))] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[rgb(var(--text-muted))]/50" />
      </div>
      <p className="text-lg font-medium mb-1 text-[rgb(var(--text-primary))]">{content.title}</p>
      <p className="text-sm text-[rgb(var(--text-muted))]">{content.description}</p>
    </div>
  );
}
