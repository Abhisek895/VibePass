'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { User } from '@/types/profile';
import { Image as ImageIcon, Video, Smile, MapPin, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useCreatePost } from '@/hooks/use-create-post';

interface PostComposerProps {
  user: User;
  onPostCreated?: (post: any) => void;
}

export function PostComposer({ user, onPostCreated }: PostComposerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('friends');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPost, isCreating } = useCreatePost(user.username, onPostCreated);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        setAttachments(prev => [...prev, url]);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;
    
    await createPost({
      content,
      media: attachments.map((url, i) => ({
        id: `media-${Date.now()}-${i}`,
        type: 'image' as const,
        url,
        alt: 'Post media',
      })),
      privacy,
    });
    
    setContent('');
    setAttachments([]);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Inline Composer */}
<div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
<div className="flex gap-4 p-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border border-slate-600 flex-shrink-0">
              <Image
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=48&h=48'}
                alt={user.fullName}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left px-5 py-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border border-gray-200 shadow-sm"
          >
            What's on your mind, {user.firstName}?
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-around border-t border-gray-200 pt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <Video className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Video</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <Smile className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Feeling</span>
          </button>
        </div>
      </div>

      {/* Full Create Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create post"
      >
        <div className="p-4 space-y-4">
          {/* User info + privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                <Image
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40&h=40'}
                  alt={user.fullName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <button className="text-xs bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                  {privacy === 'public' && '🌐'}
                  {privacy === 'friends' && '👥'}
                  {privacy === 'private' && '🔒'}
                  <span>{privacy.charAt(0).toUpperCase() + privacy.slice(1)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user.firstName}?`}
            className="w-full min-h-[120px] resize-none border-0 text-lg focus:outline-none"
            autoFocus
          />

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {attachments.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ImageIcon className="w-5 h-5 text-green-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Video className="w-5 h-5 text-red-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Smile className="w-5 h-5 text-yellow-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <MapPin className="w-5 h-5 text-red-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium"
            >
              <option value="public">🌐 Public</option>
              <option value="friends">👥 Friends</option>
              <option value="private">🔒 Only me</option>
            </select>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && attachments.length === 0) || isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </Modal>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
