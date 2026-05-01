'use client';

import Image from 'next/image';
import { useState, useEffect, type KeyboardEvent, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Globe, Mail, ShieldCheck, UserRound, Hash, AtSign, Cake, Users2, MessageCircle, Shield, Pencil, Heart, Eye, Mic, Menu, X, Bell, RefreshCw, LogOut, Zap, Camera, Upload, UserMinus, Trash2 } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { getOnboardingLookups } from '@/services/api';
import { profileService } from '@/services/api/profiles.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/services/api/client';
import { normalizeImageUrl } from '@/lib/image-utils';
import type { UpdateUserInput } from '@/lib/types';

/* ── Types ── */
interface BackendProfile {
  id: string;
  username: string | null;
  displayName?: string;
  email?: string;
  bio?: string;
  intro?: string;
  age?: number | null;
  pronouns?: string | null;
  genderPreference?: string | null;
  interests?: string[] | null;
  language?: string;
  timezone?: string;
  voiceComfort?: string | null;
  trustScore?: number;
  isSuspended?: boolean;
  isBanned?: boolean;
  friendsCount?: number;
  postsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isOwnProfile?: boolean;
  friendshipStatus?: string;
  gender?: string | null;
  profileDetails?: {
    voiceOpen?: boolean;
    interests?: string[] | null;
  } | null;
  profile?: {
    profilePhotoUrl?: string | null;
    coverPhotoUrl?: string | null;
    intro?: string | null;
    voiceOpen?: boolean;
    workTitle?: string | null;
    workPlace?: string | null;
    education?: string | null;
    currentCity?: string | null;
    hometown?: string | null;
    relationshipStatus?: string | null;
    pronouns?: string | null;
    interests?: string | null;
  } | null;
}

/* ── Helpers ── */
const EMPTY = 'Not provided';

function fmt(v?: string | number | null) {
  if (v === null || v === undefined || v === '') return EMPTY;
  return String(v);
}

function fmtDate(v?: string) {
  if (!v) return EMPTY;
  return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openImage(url?: string | null) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function normalizeInterestTag(value: string) {
  return value.replace(/^#+/, '').replace(/\s+/g, ' ').trim();
}

/* ── Page Component ── */
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: authUser, logout } = useAuth();
  const queryClient = useQueryClient();

  // ── Refs for file inputs ──
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── All state declarations ──
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    age: '',
    bio: '',
    pronouns: '',
    genderPreference: '',
    interests: [] as string[],
  });
  const [interestInput, setInterestInput] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);

  // ── Fetch profile ──
  const { data: profile, isLoading, error, refetch, isFetching } = useQuery<BackendProfile>({
    queryKey: ['profile', username],
    queryFn: () => profileService.getProfile(username, authUser?.id),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  const { data: onboardingLookups } = useQuery({
    queryKey: ['onboarding-lookups'],
    queryFn: getOnboardingLookups,
    enabled: Boolean(authUser),
    staleTime: 1000 * 60 * 10,
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Mutations ──
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => profileService.updateUser(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');

      if (updatedUser.username && updatedUser.username !== username) {
        window.location.href = `/profile/${updatedUser.username}`;
      }
    },
    onError: (mutationError) => {
      showNotification(getApiErrorMessage(mutationError, 'Failed to update profile'), 'error');
    },
  });

  const uploadProfilePhotoMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadProfilePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showNotification('Profile photo updated!', 'success');
      setShowAvatarMenu(false);
    },
    onError: (err) => showNotification(getApiErrorMessage(err, 'Failed to upload photo'), 'error'),
  });

  const uploadCoverPhotoMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadCoverPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showNotification('Cover photo updated!', 'success');
      setShowCoverMenu(false);
    },
    onError: (err) => showNotification(getApiErrorMessage(err, 'Failed to upload photo'), 'error'),
  });

  const clearProfilePhotoMutation = useMutation({
    mutationFn: () => profileService.clearProfilePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showNotification('Profile photo cleared!', 'success');
      setShowAvatarMenu(false);
    },
    onError: (err) => showNotification(getApiErrorMessage(err, 'Failed to clear photo'), 'error'),
  });

  const clearCoverPhotoMutation = useMutation({
    mutationFn: () => profileService.clearCoverPhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showNotification('Cover photo cleared!', 'success');
      setShowCoverMenu(false);
    },
    onError: (err) => showNotification(getApiErrorMessage(err, 'Failed to clear photo'), 'error'),
  });

  const isOwnProfile = authUser?.username === profile?.username || authUser?.username === username;
  const interestSuggestions = onboardingLookups?.interests ?? [];
  const filteredInterestSuggestions = interestSuggestions.filter(option => {
    const interestValue = normalizeInterestTag(option.value || option.label);
    const alreadySelected = editData.interests.some(
      interest => interest.toLowerCase() === interestValue.toLowerCase(),
    );

    if (alreadySelected) return false;
    if (!interestInput.trim()) return true;

    const normalizedSearch = interestInput.trim().toLowerCase();
    return (
      option.label.toLowerCase().includes(normalizedSearch) ||
      interestValue.toLowerCase().includes(normalizedSearch)
    );
  }).slice(0, 10);

  // ── Handlers ──
  const handleEdit = () => {
    setEditData({
      username: profile?.username || '',
      age: profile?.age?.toString() || '',
      bio: profile?.bio || profile?.profile?.intro || '',
      pronouns: profile?.pronouns || profile?.profile?.pronouns || '',
      genderPreference: profile?.genderPreference || '',
      interests: (profile?.interests ?? (profile?.profile?.interests ? profile.profile.interests.split(',').map(i => i.trim()) : [])) || [],
    });
    setInterestInput('');
    setIsEditing(true);
  };

  const addInterestTag = (rawValue: string) => {
    const normalizedTag = normalizeInterestTag(rawValue);
    if (!normalizedTag) return;

    setEditData(prev => {
      const alreadySelected = prev.interests.some(i => i.toLowerCase() === normalizedTag.toLowerCase());
      if (alreadySelected) return prev;
      return { ...prev, interests: [...prev.interests, normalizedTag] };
    });
    setInterestInput('');
  };

  const removeInterestTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i.toLowerCase() !== tagToRemove.toLowerCase()),
    }));
  };

  const handleInterestKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addInterestTag(interestInput);
    } else if (event.key === 'Backspace' && !interestInput && editData.interests.length) {
      event.preventDefault();
      removeInterestTag(editData.interests[editData.interests.length - 1]);
    }
  };

  const handleSave = () => {
    const payload: UpdateUserInput = {};
    const ageValue = editData.age ? Number(editData.age) : undefined;
    
    if (ageValue !== undefined && (!Number.isFinite(ageValue) || ageValue < 18 || ageValue > 100)) {
      showNotification('Age must be between 18 and 100', 'error');
      return;
    }

    if (editData.username.trim()) payload.username = editData.username.trim();
    if (ageValue !== undefined) payload.age = ageValue;
    payload.bio = editData.bio;
    if (editData.pronouns.trim()) payload.pronouns = editData.pronouns.trim();
    payload.genderPreference = editData.genderPreference.trim();
    payload.interests = editData.interests;
    updateMutation.mutate(payload);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size too large (max 5MB)', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    if (type === 'profile') {
      uploadProfilePhotoMutation.mutate(file);
    } else {
      uploadCoverPhotoMutation.mutate(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY delete your account? This action cannot be undone and all your data will be lost.')) {
      return;
    }

    try {
      const res = await profileService.deleteAccount();
      if (res.success) {
        showNotification('Account deleted successfully.', 'success');
        setTimeout(() => {
          logout();
          router.push('/auth');
        }, 2000);
      } else {
        showNotification(res.message || 'Failed to delete account.', 'error');
      }
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to delete account.'), 'error');
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-slate-800 animate-pulse">
            <div className="h-56 sm:h-72 bg-slate-700" />
            <div className="absolute -bottom-16 left-6">
              <div className="h-32 w-32 rounded-full bg-slate-700 border-4 border-slate-900" />
            </div>
          </div>
          <div className="pt-20 pb-8 px-8 flex flex-col gap-4">
            <div className="h-8 w-48 bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
            <UserRound className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Profile Not Found</h2>
          <p className="text-slate-400 mb-6">{getApiErrorMessage(error, `The user "${username}" doesn't exist.`)}</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-blue-600 rounded-xl font-medium">Go Home</button>
        </div>
      </div>
    );
  }

  const displayName = profile.displayName || profile.username || 'VibePass User';
  const avatarUrl = profile.profile?.profilePhotoUrl || undefined;
  const coverUrl = profile.profile?.coverPhotoUrl || undefined;
  const voiceOpen = profile.profile?.voiceOpen ?? false;

  const detailItems = [
    { label: 'User ID', value: fmt(profile.id?.slice(0, 8) + '...'), icon: <Hash className="h-5 w-5" /> },
    { label: 'Username', value: fmt(profile.username), icon: <AtSign className="h-5 w-5" /> },
    { label: 'Age', value: fmt(profile.age), icon: <Cake className="h-5 w-5" /> },
    { label: 'Pronouns', value: fmt(profile.pronouns), icon: <UserRound className="h-5 w-5" /> },
    { label: 'Gender Preference', value: fmt(profile.genderPreference), icon: <Eye className="h-5 w-5" /> },
    { label: 'Interests', value: fmt(profile.interests?.join(', ') || ''), icon: <Heart className="h-5 w-5" /> },
    { label: 'Connections', value: fmt(profile.friendsCount ?? 0), icon: <Users2 className="h-5 w-5" /> },
    { label: 'Posts', value: fmt(profile.postsCount ?? 0), icon: <MessageCircle className="h-5 w-5" /> },
    { label: 'Joined', value: fmtDate(profile.createdAt), icon: <Calendar className="h-5 w-5" /> },
    { label: 'Language', value: fmt(profile.language || null), icon: <Globe className="h-5 w-5" /> },
  ];

  const fullAvatarUrl = normalizeImageUrl(avatarUrl);
  const fullCoverUrl = normalizeImageUrl(coverUrl);

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative text-white">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={profileInputRef} 
        onChange={(e) => handleFileChange(e, 'profile')} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={(e) => handleFileChange(e, 'cover')} 
        className="hidden" 
        accept="image/*"
      />

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-medium backdrop-blur-sm ${
            notification.type === 'success' ? 'bg-emerald-600/90 border border-emerald-500/50' : 'bg-red-600/90 border border-red-500/50'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Immersive Header - Matching Inbox Style */}
      <header className="px-5 py-3 bg-[#202C33]/80 backdrop-blur-xl border-b border-white/10 z-20 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-white">Profile</h1>
        {isOwnProfile && (
          <button onClick={handleEdit} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <Pencil className="h-5 w-5 text-white" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar relative animate-in fade-in duration-700">
        {/* Profile Header */}
        <div className="relative mb-8 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Cover */}
          <div
            onClick={() => setShowCoverMenu(!showCoverMenu)}
            className="h-56 sm:h-72 relative w-full hover:opacity-90 transition-opacity cursor-pointer group"
          >
            {fullCoverUrl ? (
              <Image src={fullCoverUrl} alt="Cover" fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {isOwnProfile && (
              <div className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            )}

            {/* Menu Buttons (Hamburger) */}
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/40 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>

            {/* Cover Menu */}
            {showCoverMenu && (
              <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 min-w-48 overflow-hidden" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => openImage(fullCoverUrl)}
                  disabled={!fullCoverUrl}
                  className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                >
                  View cover photo
                </button>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full text-left px-4 py-3 text-blue-400 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {fullCoverUrl ? 'Change cover photo' : 'Upload cover photo'}
                    </button>
                    {fullCoverUrl && (
                      <button
                        onClick={() => clearCoverPhotoMutation.mutate()}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove cover photo
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="pt-8 pb-10 px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Avatar */}
              <div className="relative -mt-24 md:-mt-32 z-10">
                <button
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-1 shadow-2xl hover:scale-105 transition-transform group"
                >
                  <div className="relative w-full h-full rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden flex items-center justify-center">
                    {fullAvatarUrl ? (
                      <Image src={fullAvatarUrl} alt={displayName} fill className="object-cover" />
                    ) : (
                      <span className="text-4xl sm:text-6xl font-bold text-white uppercase">{displayName.charAt(0)}</span>
                    )}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg" />

                {/* Avatar Menu */}
                {showAvatarMenu && (
                  <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 min-w-48 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openImage(fullAvatarUrl)} disabled={!fullAvatarUrl} className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700 disabled:opacity-40">View photo</button>
                    {isOwnProfile && (
                      <>
                        <button onClick={() => profileInputRef.current?.click()} className="w-full text-left px-4 py-3 text-blue-400 hover:bg-slate-700 flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {fullAvatarUrl ? 'Change photo' : 'Upload photo'}
                        </button>
                        {fullAvatarUrl && (
                          <button onClick={() => clearProfilePhotoMutation.mutate()} className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Remove photo
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">{displayName}</h1>
                  <span className="text-slate-400 font-medium">@{profile.username}</span>
                </div>
                {(profile.bio || profile.profile?.intro) && (
                  <p className="text-slate-300 text-lg max-w-2xl mb-4">{profile.bio || profile.profile?.intro}</p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Users2 className="h-4 w-4" /> {profile.friendsCount || 0} connections</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {profile.postsCount || 0} posts</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {fmtDate(profile.createdAt)}</span>
                </div>
              </div>

              {isOwnProfile && (
                <button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                  <Pencil className="h-4 w-4" /> Edit Profile
                </button>
              )}

              {!isOwnProfile && profile.friendshipStatus === 'FRIEND' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push(`/chat`)}
                    className="bg-[#25D366] hover:bg-[#20bd5b] text-[#0B141B] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                  >
                    <MessageCircle className="h-4 w-4" /> Message
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm(`Are you sure you want to unmatch with ${profile.displayName}? This will also archive your chat.`)) {
                        try {
                           const { unmatch } = await import('@/services/api/matches.service');
                           await unmatch(profile.id);
                           router.push('/chat');
                        } catch (err) {
                           alert('Failed to unmatch. Please try again.');
                        }
                      }
                    }}
                    className="bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/10 hover:border-red-500/50"
                  >
                    <UserMinus className="h-4 w-4" /> Unmatch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trust Score', value: profile.trustScore ?? 100, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Voice Status', value: voiceOpen ? 'Open' : 'Closed', icon: Mic, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Language', value: profile.language || 'English', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Pronouns', value: profile.pronouns || 'Not set', icon: UserRound, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-all cursor-default group">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs and Content */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-slate-700/50 flex gap-2">
          {['overview', 'details'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-xl font-bold mb-6">Profile Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detailItems.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="text-slate-500">{item.icon}</div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-tight">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
             <h3 className="text-xl font-bold mb-6">Full Profile Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detailItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="text-slate-500">{item.icon}</div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-tight">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsEditing(false)}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Username</label>
                    <input type="text" value={editData.username} onChange={e => setEditData(prev => ({ ...prev, username: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Age</label>
                    <input type="number" value={editData.age} onChange={e => setEditData(prev => ({ ...prev, age: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Bio / Intro</label>
                  <textarea value={editData.bio} onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white h-32 resize-none focus:border-blue-500 outline-none" placeholder="Tell us about yourself..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Pronouns</label>
                    <input type="text" value={editData.pronouns} onChange={e => setEditData(prev => ({ ...prev, pronouns: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="e.g. they/them" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Gender Preference</label>
                    <select value={editData.genderPreference} onChange={e => setEditData(prev => ({ ...prev, genderPreference: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none">
                      <option value="">Select preference</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Everyone">Everyone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Interests</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-2 mb-2">
                    {editData.interests.map(tag => (
                      <span key={tag} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        #{tag}
                        <button onClick={() => removeInterestTag(tag)} className="hover:text-white"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    {!editData.interests.length && <span className="text-slate-500 text-sm">No interests added yet</span>}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={handleInterestKeyDown} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Add interest..." />
                    <button onClick={() => addInterestTag(interestInput)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl font-medium transition-colors">Add</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-end mt-8 pt-6 border-t border-slate-800">
                <button 
                  onClick={handleDeleteAccount}
                  className="text-red-500 hover:text-red-400 font-bold text-xs uppercase tracking-widest transition-colors mr-auto"
                >
                  Delete Account
                </button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 font-medium hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-80 bg-slate-900 border-l border-slate-800 h-full p-8 shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">VibePass Menu</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
              </div>
              
              <div className="space-y-4">
                <button onClick={() => { logout(); router.push('/auth'); }} className="w-full flex items-center gap-4 p-4 bg-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition-all group">
                  <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" /> Sign Out
                </button>

                <button 
                  onClick={handleDeleteAccount} 
                  className="w-full flex items-center gap-4 p-4 bg-red-500/10 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all group border border-red-500/10"
                >
                  <Trash2 className="h-6 w-6 group-hover:scale-110 transition-transform" /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
