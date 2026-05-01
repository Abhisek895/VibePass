"use client";

import { useState } from 'react';
import { Post, postsService } from '@/services/api/social.service';
import { Avatar } from '@/components/common/Avatar';

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export function ShareModal({ post, onClose }: ShareModalProps) {
  const [caption, setCaption] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setError('');

    try {
      await postsService.sharePost(post.id, caption || undefined);
      onClose();
      // Optionally refresh feed or show success
    } catch (err: any) {
      setError(err.message || 'Failed to share post');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Share Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User's caption */}
          <div className="mb-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Original post preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.author.profilePhotoUrl}
                alt={post.author.username}
                size={32}
              />
              <span className="font-semibold text-sm">
                {post.author.firstName} {post.author.lastName}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">
              {post.content}
            </p>
            {post.media && post.media.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={post.media[0].url}
                  alt="Post media"
                  className="w-full max-h-[200px] object-cover"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}