'use client';

import { useMemo, useState } from 'react';
import { ImagePlus, Sparkles, ChevronDown, X, Lock, Globe, Users } from 'lucide-react';
import { privacyOptions } from '@/lib/constants';
import { normalizeImageUrl } from '@/lib/image-utils';
import type { PrivacyType, PostMedia, User } from '@/types/profile';

interface CreatePostModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, media: PostMedia[], privacy: PrivacyType) => Promise<void>;
}

const maxCharacters = 280;

export function CreatePostModal({ user, open, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyType>('friends');
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const characterCount = content.length;
  const isValid = content.trim().length > 0 || media.length > 0;

  const privacyLabel = useMemo(() => privacyOptions.find((option) => option.value === privacy)?.label ?? 'Friends', [privacy]);
  const privacyIcon = useMemo(() => {
    return privacy === 'public' ? <Globe className="w-4 h-4" /> : privacy === 'friends' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />;
  }, [privacy]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const attachments: PostMedia[] = Array.from(files).slice(0, 4).map((file) => ({
      id: `media-${Date.now()}-${file.name}`,
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      alt: file.name,
    }));

    setMedia((current) => [...current, ...attachments]);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      await onSubmit(content.trim(), media, privacy);
      setContent('');
      setMedia([]);
      setPrivacy('friends');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-[rgb(var(--bg-secondary))] border border-white/10 p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-300">Create post</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Share your latest update</h2>
          </div>
          <button onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-[rgb(var(--bg-surface))] p-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={(user as any).avatar || (user as any).profilePhotoUrl} 
              alt={user.fullName} 
              size={48} 
              className="flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-white">{user.fullName}</p>
              <button type="button" className="mt-1 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20">
                {privacyIcon}
                {privacyLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What’s on your mind?"
            maxLength={maxCharacters}
            className="mt-5 min-h-[180px] w-full resize-none rounded-[28px] border border-white/10 bg-black/20 px-5 py-4 text-base text-white placeholder:text-slate-500 focus:border-[rgb(var(--accent-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/20"
          />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                <Sparkles className="w-4 h-4 text-amber-300" /> Feeling/activity
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                <ImagePlus className="w-4 h-4 text-emerald-300" /> Add photo/video
              </button>
            </div>
            <p className="text-sm text-slate-500">{characterCount}/{maxCharacters}</p>
          </div>

          {media.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {media.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-3xl bg-white/5">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.alt} className="h-48 w-full object-cover" />
                  ) : (
                    <video src={item.url} controls className="h-48 w-full object-cover" />
                  )}
                  <button
                    onClick={() => setMedia((current) => current.filter((photo) => photo.id !== item.id))}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
            <ImagePlus className="w-5 h-5 text-emerald-300" />
            <span>Add media</span>
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />
          </label>

          <button
            type="button"
            disabled={!isValid || isLoading}
            onClick={handleSubmit}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Sharing...' : 'Share post'}
          </button>
        </div>
      </div>
    </div>
  );
}
