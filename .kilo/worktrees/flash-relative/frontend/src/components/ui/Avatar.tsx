'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { normalizeImageUrl } from '@/lib/image-utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  initials?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
  xxl: 'w-24 h-24 text-4xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  className,
  initials,
  bgColor = 'bg-blue-500',
  children
}) => {
  if (children) {
    return (
      <div className={cn('relative rounded-full flex-shrink-0 overflow-hidden bg-gray-200', sizeMap[size], className)}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { src: normalizeImageUrl(child.props.src || src), alt: child.props.alt || alt });
          }
          return child;
        })}
      </div>
    );
  }

  if (src) {
    return (
      <div 
        className={cn('relative flex-shrink-0 overflow-hidden', sizeMap[size], className)}
        style={{ borderRadius: '100%', aspectRatio: '1/1' }}
      >
        <Image 
          src={normalizeImageUrl(src)!} 
          alt={alt} 
          fill 
          className="object-cover" 
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white',
        sizeMap[size],
        bgColor,
        className
      )}
    >
      {initials || (alt ? alt.charAt(0) : '?')}
    </div>
  );
};

export const AvatarImage = ({ src, alt, className }: any) => {
  if (!src) return null;
  return <Image src={normalizeImageUrl(src)!} alt={alt || ''} fill className={cn('object-cover', className)} style={{ borderRadius: '100%' }} />;
};

export const AvatarFallback = ({ children, className }: any) => {
  return (
    <div className={cn('w-full h-full flex items-center justify-center font-semibold text-white', className)}>
      {children}
    </div>
  );
};
