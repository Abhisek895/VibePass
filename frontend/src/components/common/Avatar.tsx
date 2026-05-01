"use client";

import Image from 'next/image';
import { normalizeImageUrl } from '@/lib/image-utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 40, className = "" }: AvatarProps) {
  const normalized = normalizeImageUrl(src);
  const defaultSrc = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40&h=40';

  return (
    <div
      className={`relative inline-block overflow-hidden flex-shrink-0 ${!normalized ? 'bg-black' : 'bg-slate-800'} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
    >
      {normalized ? (
        <Image
          src={normalized}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
          priority
        />
      ) : (
        <div className="absolute inset-0" />
      )}
    </div>
  );
}