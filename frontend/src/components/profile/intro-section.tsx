import { User } from '@/types/profile';
import { MapPin, Link, Calendar, Briefcase, GraduationCap, Heart } from 'lucide-react';

interface IntroSectionProps {
  user: User;
  viewMode: 'owner' | 'visitor';
}

export function IntroSection({ user, viewMode }: IntroSectionProps) {
  return (
    <div className="vibe-card">
      <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">Intro</h2>
      
      <div className="space-y-3">
        {user.bio && (
          <p className="text-[rgb(var(--text-secondary))]">{user.bio}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {user.currentCity && (
            <div className="flex items-center gap-3 text-[rgb(var(--text-secondary))]">
              <MapPin className="w-5 h-5 text-[rgb(var(--text-muted))]" />
              <span>Lives in <span className="font-semibold text-[rgb(var(--text-primary))]">{user.currentCity}</span></span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-[rgb(var(--text-secondary))]">
            <Calendar className="w-5 h-5 text-[rgb(var(--text-muted))]" />
            <span>Joined <span className="font-semibold text-[rgb(var(--text-primary))]">{user.joinedDate}</span></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {user.workTitle && (
            <span className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] px-3 py-1.5 rounded-full text-sm font-medium">
              💻 {user.workTitle}
            </span>
          )}
          {user.education && (
            <span className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] px-3 py-1.5 rounded-full text-sm font-medium">
              🎓 {user.education}
            </span>
          )}
          {user.currentCity && (
            <span className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-secondary))] px-3 py-1.5 rounded-full text-sm font-medium">
              📍 {user.currentCity}
            </span>
          )}
        </div>
      </div>

      {viewMode === 'owner' && (
        <button className="w-full mt-4 btn-secondary">
          Edit details
        </button>
      )}
    </div>
  );
}
