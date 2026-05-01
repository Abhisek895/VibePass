'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { UpdateProfileInput, User } from '@/lib/types';
import { relationshipOptions } from '@/lib/constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfileInput) => void;
  initialData?: User;
  isLoading?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UpdateProfileInput>(
    initialData
      ? {
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          bio: initialData.bio,
          intro: initialData.intro,
          work: initialData.work ?? (
            initialData.workTitle || initialData.workPlace
              ? {
                  title: initialData.workTitle ?? undefined,
                  company: initialData.workPlace ?? undefined,
                }
              : null
          ),
          education: initialData.education
            ? { school: initialData.education }
            : null,
          location: initialData.location ?? (
            initialData.currentCity || initialData.hometown
              ? {
                  city: initialData.currentCity ?? undefined,
                  hometown: initialData.hometown ?? undefined,
                }
              : null
          ),
          relationshipStatus: initialData.relationshipStatus,
          dateOfBirth: initialData.dateOfBirth,
        }
      : {}
  );

  const handleChange = (field: keyof UpdateProfileInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={(formData.firstName as string) || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={(formData.lastName as string) || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={(formData.bio as string) || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            maxLength={160}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
            placeholder="Tell people about yourself"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.bio as string)?.length || 0}/160
          </p>
        </div>

        {/* Intro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intro</label>
          <input
            type="text"
            value={(formData.intro as string) || ''}
            onChange={(e) => handleChange('intro', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your professional headline"
          />
        </div>

        {/* Work */}
        <fieldset className="border-t pt-4">
          <legend className="text-sm font-semibold text-gray-900 mb-3">Work</legend>
          <div className="space-y-3">
            <input
              type="text"
              value={(formData.work?.title as string) || ''}
              onChange={(e) => handleChange('work', { ...formData.work, title: e.target.value })}
              placeholder="Job title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={(formData.work?.company as string) || ''}
              onChange={(e) => handleChange('work', { ...formData.work, company: e.target.value })}
              placeholder="Company name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </fieldset>

        {/* Education */}
        <fieldset className="border-t pt-4">
          <legend className="text-sm font-semibold text-gray-900 mb-3">Education</legend>
          <div className="space-y-3">
            <input
              type="text"
              value={(formData.education?.school as string) || ''}
              onChange={(e) => handleChange('education', { ...formData.education, school: e.target.value })}
              placeholder="School or university"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="number"
              value={(formData.education?.graduationYear as number) || ''}
              onChange={(e) => handleChange('education', { ...formData.education, graduationYear: parseInt(e.target.value) })}
              placeholder="Graduation year"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </fieldset>

        {/* Location */}
        <fieldset className="border-t pt-4">
          <legend className="text-sm font-semibold text-gray-900 mb-3">Location</legend>
          <div className="space-y-3">
            <input
              type="text"
              value={(formData.location?.city as string) || ''}
              onChange={(e) => handleChange('location', { ...formData.location, city: e.target.value })}
              placeholder="Current city"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={(formData.location?.hometown as string) || ''}
              onChange={(e) => handleChange('location', { ...formData.location, hometown: e.target.value })}
              placeholder="Hometown"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </fieldset>

        {/* Relationship Status */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Status</label>
          <select
            value={(formData.relationshipStatus as string) || ''}
            onChange={(e) => handleChange('relationshipStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not specified</option>
            {relationshipOptions.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-6 pt-4 flex gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Cancel
        </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="flex-1" type="button">
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};
