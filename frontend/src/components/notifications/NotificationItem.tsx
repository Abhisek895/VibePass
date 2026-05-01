'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Bell, MessageCircle, Heart, Users, MessageSquare, Phone, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date-utils';
import { normalizeImageUrl } from '@/lib/image-utils';
import type { AppNotification as Notification } from '@/lib/types/notification';
import Link from 'next/link';
import { useState } from 'react';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'LIKE_POST': 
      return { 
        icon: Heart, 
        bg: 'bg-[rgb(var(--accent-tertiary),0.2)]', 
        color: 'text-[rgb(var(--accent-tertiary))]',
        accent: 'border-[rgb(var(--accent-tertiary))]'
      };
    case 'COMMENT_POST': 
      return { 
        icon: MessageSquare, 
        bg: 'bg-[rgb(var(--voice-active),0.2)]', 
        color: 'text-[rgb(var(--voice-active))]',
        accent: 'border-[rgb(var(--voice-active))]'
      };
    case 'FRIEND_REQUEST': 
    case 'FRIEND_ACCEPTED':
      return { 
        icon: Users, 
        bg: 'bg-[rgb(var(--success),0.2)]', 
        color: 'text-[rgb(var(--success))]',
        accent: 'border-[rgb(var(--success))]'
      };
    case 'NEW_MESSAGE': 
      return { 
        icon: MessageCircle, 
        bg: 'bg-[rgb(var(--accent-primary),0.2)]', 
        color: 'text-[rgb(var(--accent-primary))]',
        accent: 'border-[rgb(var(--accent-primary))]'
      };
    case 'NEW_MATCH': 
      return { 
        icon: Heart, 
        bg: 'bg-[rgb(var(--accent-secondary),0.2)]', 
        color: 'text-[rgb(var(--accent-secondary))]',
        accent: 'border-[rgb(var(--accent-secondary))]'
      };
    case 'VOICE_REQUEST': 
      return { 
        icon: Phone, 
        bg: 'bg-[rgb(var(--accent-primary),0.2)]', 
        color: 'text-[rgb(var(--accent-primary))]',
        accent: 'border-[rgb(var(--accent-primary))]'
      };
    default: 
      return { 
        icon: Bell, 
        bg: 'bg-white/10', 
        color: 'text-[rgb(var(--text-secondary))]',
        accent: 'border-[rgb(var(--text-muted))]'
      };
  }
};

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const config = getTypeConfig(notification.type);
  const Icon = config.icon;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onMarkRead && !notification.read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      aria-label={`${notification.message} - ${notification.read ? 'read' : 'unread'}`}
      className={`vibe-card p-4 flex gap-4 cursor-pointer transition-all duration-400 hover:scale-[1.008] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:border-[rgba(var(--border-subtle),0.15)] group focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-primary))] relative overflow-hidden ${!notification.read ? `border-l-4 ${config.accent} bg-gradient-to-r from-[rgba(var(--accent-primary),0.08)] to-transparent` : ''}`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-400 pointer-events-none" />

      <div className="relative flex-shrink-0">
        <Avatar className="h-10 sm:h-12 w-10 sm:w-12 border-2 border-[rgba(var(--border-subtle),0.1)] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105">
          <AvatarImage 
            src={normalizeImageUrl(notification.actor.avatar || (notification.actor as any).profileImage)} 
            alt={notification.actor.username} 
            className="object-cover" 
          />
          <AvatarFallback className="bg-[rgb(var(--bg-elevated))] bg-gradient-to-br from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-surface))]">
            {notification.actor.username.slice(0,2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 size-4 sm:size-5.5 rounded-full ${config.bg} flex items-center justify-center border-2 border-[rgb(var(--bg-surface))] shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 ${config.color}`} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
          <div className="flex-1">
            <p className={`font-medium text-sm sm:text-[15px] leading-relaxed tracking-tight ${!notification.read ? 'text-white drop-shadow-sm' : 'text-[rgb(var(--text-secondary))]'}`}>
              {notification.message}
            </p>

            {notification.actionUrl && (
              <Link 
                href={notification.actionUrl} 
                className="text-xs text-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))] font-medium inline-flex items-center gap-1 mt-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View →
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[rgb(var(--text-muted))] font-medium tracking-wide">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-[rgb(var(--danger),0.15)] transition-all duration-300 transform hover:scale-110"
              >
                <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--danger))] transition-colors duration-200" />
              </button>
            )}
          </div>
        </div>
      </div>

      {!notification.read && (
        <div className="flex-shrink-0 mt-1.5">
          <div className="size-3 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] shadow-[0_0_12px_rgba(139,92,246,0.7)] relative">
            <div className="absolute inset-0 rounded-full bg-[rgb(var(--accent-primary))] animate-ping opacity-40" />
          </div>
        </div>
      )}
    </div>
  );
}
