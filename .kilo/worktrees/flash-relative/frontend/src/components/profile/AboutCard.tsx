'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AboutCardProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export const AboutCard: React.FC<AboutCardProps> = ({ profile, isOwnProfile, onEdit }) => {
  const items = [
    { label: 'Intro', value: profile.intro },
    { label: 'Work', value: profile.work ? `${profile.work.title} at ${profile.work.company}` : (profile.workTitle ? `${profile.workTitle}${profile.workPlace ? ` at ${profile.workPlace}` : ''}` : null) },
    { label: 'Education', value: typeof profile.education === 'string' ? profile.education : null },
    { label: 'City', value: profile.location?.city || profile.currentCity },
    { label: 'Hometown', value: profile.location?.hometown || profile.hometown },
    { label: 'Relationship', value: profile.relationshipStatus },
  ];

  const filledItems = items.filter((item) => item.value);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">About</h3>
        {isOwnProfile && (
          <button onClick={onEdit} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Edit
          </button>
        )}
      </div>

      {filledItems.length > 0 ? (
        <div className="space-y-4">
          {filledItems.map((item) => (
            <div key={item.label}>
              <p className="text-sm text-gray-600 font-medium">{item.label}</p>
              <p className="text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-6">No additional information yet</p>
      )}
    </Card>
  );
};
