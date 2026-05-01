'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import type { User, PrivacyType } from '@/types/profile';
import { PRIVACY_ICONS, PRIVACY_LABELS } from '@/lib/profile-constants';

interface PostComposerProps {
  user: User;
  onSubmit: (content: string, media: string[], privacy: PrivacyType) => Promise<void>;
  isLoading?: boolean;
}

export function PostComposer({ user, onSubmit, isLoading }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyType>('friends');
  const [isFocus, setIsFocus] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content, [], privacy);
      setContent('');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.fullName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
        </div>

        {/* Compose Area */}
        <div className="flex-1 min-w-0">
          <textarea
            placeholder={`What's on your mind, ${user.firstName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(!content)}
            className="w-full px-4 py-3 rounded-full bg-gray-50 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-transparent focus:border-gray-200 transition-all"
            rows={1}
            style={{ minHeight: isFocus ? '100px' : '44px' }}
          />

          {/* Actions */}
          {isFocus && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
                  title="Add image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-800"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Privacy Selector */}
                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <span className="text-sm text-gray-600 hidden sm:inline">{PRIVACY_ICONS[privacy]}</span>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as PrivacyType)}
                    className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-none cursor-pointer transition-colors"
                  >
                    {(Object.entries(PRIVACY_LABELS) as [PrivacyType, string][]).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
