import Image from 'next/image';
import { PostMedia } from '@/lib/types/profile';

interface MediaGridProps {
  media: PostMedia[];
}

export function MediaGrid({ media }: MediaGridProps) {
  if (media.length === 0) return null;

  // Single media
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={item.url}
          alt=""
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Two media items
  if (media.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {media.map((item, index) => (
          <div key={index} className="relative aspect-square bg-gray-100">
            <Image
              src={item.url}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  // Three media items
  if (media.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1">
        <div className="col-span-2 relative aspect-video bg-gray-100">
          <Image
            src={media[0].url}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        {media.slice(1, 3).map((item, index) => (
          <div key={index} className="relative aspect-square bg-gray-100">
            <Image
              src={item.url}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  // Four or more media items
  return (
    <div className="grid grid-cols-2 gap-1">
      {media.slice(0, 3).map((item, index) => (
        <div 
          key={index} 
          className={`relative ${index === 0 ? 'col-span-2 aspect-video' : 'aspect-square'} bg-gray-100`}
        >
          <Image
            src={item.url}
            alt=""
            fill
            className="object-cover"
          />
          {index === 2 && media.length > 3 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">+{media.length - 3}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
