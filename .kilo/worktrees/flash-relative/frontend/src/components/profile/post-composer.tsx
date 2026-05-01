'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Video, Smile, MapPin, MoreHorizontal, X } from 'lucide-react';
import { User } from '@/types/profile';

interface PostComposerProps {
  user: User;
  onSubmit: (content: string, attachments: string[]) => Promise<void>;
}

export function PostComposer({ user, onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content, attachments);
      setContent('');
      setAttachments([]);
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="vibe-card">
      <div className="flex gap-3">
        <Image
          src={user.avatar}
          alt={user.fullName}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
            className="w-full resize-none border-0 bg-[rgb(var(--bg-elevated))] rounded-full px-4 py-3 text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] min-h-[44px]"
            rows={isExpanded ? 3 : 1}
          />
          
          {attachments.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {attachments.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {isExpanded && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium hidden sm:inline">Photo</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] transition-colors">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium hidden sm:inline">Video</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] transition-colors">
                  <Smile className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium hidden sm:inline">Feeling</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] transition-colors">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium hidden sm:inline">Location</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-[rgb(var(--text-muted))]" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setAttachments([]);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && attachments.length === 0) || isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
