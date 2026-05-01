'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface PostComposerProps {
  userName?: string;
  userAvatar?: string;
  onCreatePost?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  userName = 'User',
  userAvatar,
  onCreatePost,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-4">
        <Avatar src={userAvatar} alt={userName} size="md" />
        <button
          onClick={onCreatePost}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-left"
        >
          What's on your mind, {userName.split(' ')[0]}?
        </button>
      </div>

      {/* Quick Action Bar */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
          🖼️ Photo
        </button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
          🎥 Video
        </button>
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
          😊 Feeling
        </button>
      </div>
    </div>
  );
};
