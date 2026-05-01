'use client';

interface EmptyStateProps {
  type: 'posts' | 'photos' | 'friends' | 'about';
  isOwner?: boolean;
}

const messages = {
  posts: {
    title: 'No posts to show yet',
    description: 'Your profile looks quiet. Share a thought, a photo, or a moment to start your timeline.',
  },
  photos: {
    title: 'No photos yet',
    description: 'Upload your favorite moments so visitors can explore your gallery.',
  },
  friends: {
    title: 'No friends yet',
    description: 'When you add friends, they will appear here for easy access.',
  },
  about: {
    title: 'No profile details',
    description: 'Add a few bio and work details so people can learn more about you.',
  },
};

export function EmptyState({ type, isOwner = false }: EmptyStateProps) {
  const message = messages[type];

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-10 text-center text-slate-300 shadow-lg">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-2xl">✨</div>
      <h3 className="text-xl font-semibold text-white">{message.title}</h3>
      <p className="mt-3 text-sm text-slate-400">{message.description}</p>
      {isOwner && type === 'posts' && (
        <p className="mt-4 text-sm text-slate-500">Tap the create post card to share something with your friends.</p>
      )}
    </div>
  );
}
