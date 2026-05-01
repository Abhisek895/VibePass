'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { privacyOptions } from '@/lib/constants';
import { PrivacyType } from '@/types/profile';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, privacy: PrivacyType, bgColor?: string) => void;
  isLoading?: boolean;
  userAvatar?: string;
  userName?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  userAvatar,
  userName = 'User',
}) => {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyType>('public');
  const [bgColor, setBgColor] = useState<string | undefined>(undefined);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);

  const backgroundColors = ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, privacy, bgColor);
      setContent('');
      setPrivacy('public');
      setBgColor(undefined);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post">
      <div className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Avatar src={userAvatar} alt={userName} size="md" />
          <div>
            <p className="font-semibold text-gray-900">{userName}</p>
            <div className="relative">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                {privacyOptions.find((opt) => opt.value === privacy)?.label || 'Public'}
                <span>▼</span>
              </button>
              {showPrivacyDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPrivacy(option.value as PrivacyType);
                        setShowPrivacyDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      {option.label}
                      <p className="text-xs text-gray-600">{option.subtitle}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={bgColor ? { backgroundColor: bgColor, color: 'white' } : undefined}
        />

        {/* Background Colors*/}
        <div className="flex gap-2">
          <button
            onClick={() => setBgColor(undefined)}
            className={`w-8 h-8 rounded-full border-2 ${!bgColor ? 'border-blue-600' : 'border-gray-300'} bg-white`}
            title="None"
          />
          {backgroundColors.map((color) => (
            <button
              key={color}
              onClick={() => setBgColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${bgColor === color ? 'border-blue-600' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <div className="flex-1 flex gap-2">
            <button className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              🖼️
            </button>
            <button className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              🎥
            </button>
            <button className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              😊
            </button>
          </div>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} disabled={!content.trim()} type="button">
            Post
          </Button>
        </div>
      </div>
    </Modal>
  );
};
