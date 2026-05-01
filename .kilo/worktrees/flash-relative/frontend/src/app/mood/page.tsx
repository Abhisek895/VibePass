"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage, getMoodOptions } from '@/services/api';
import type { MoodOption } from '@/services/api/lookups.service';

export default function MoodPage() {
  const router = useRouter();
  const [moods, setMoods] = useState<MoodOption[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMoods = async () => {
      try {
        const moodOptions = await getMoodOptions();

        if (!isMounted) {
          return;
        }

        setMoods(moodOptions);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMsg(
          getApiErrorMessage(error, 'Unable to load mood options from the database.'),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadMoods();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectMood = (moodName: string) => {
    if (isAnimating) {
      return;
    }

    setSelectedMood(moodName);
    setIsAnimating(true);

    setTimeout(() => {
      router.push('/matches');
    }, 300);
  };

  return (
    <main className="min-h-screen flex flex-col p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[rgb(var(--accent-primary),0.1)] rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-[rgb(var(--accent-secondary),0.08)] rounded-full blur-[80px]" />
      </div>

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-bold">What's your vibe today?</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">Choose how you're feeling</p>
      </div>

      {errorMsg ? (
        <div className="mx-auto mb-6 max-w-xl rounded-xl border border-[rgb(var(--danger),0.3)] bg-[rgb(var(--danger),0.1)] px-4 py-3 text-sm text-[rgb(var(--danger))] relative z-10">
          {errorMsg}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-sm text-[rgb(var(--text-muted))]">
            Loading mood options from the database...
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto w-full relative z-10">
          {moods.map((mood, index) => (
            <button
              key={mood.id}
              onClick={() => handleSelectMood(mood.name)}
              className={`
                relative overflow-hidden rounded-2xl p-4 transition-all duration-300
                hover:scale-105 active:scale-95
                ${selectedMood === mood.name ? 'ring-2 ring-[rgb(var(--accent-primary))] ring-offset-2 ring-offset-[rgb(var(--bg-primary))]' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-20`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 hover:opacity-20 transition-opacity`} />

              <div className="relative flex flex-col items-center justify-center h-28">
                {mood.emoji ? (
                  <span className="text-4xl mb-2 drop-shadow-lg">{mood.emoji}</span>
                ) : null}
                <span className="text-sm font-medium text-center">{mood.description}</span>
              </div>

              {selectedMood === mood.name && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[rgb(var(--accent-primary))] animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="text-center mt-8 relative z-10">
        <button
          onClick={() => router.push('/matches')}
          className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))] text-sm transition-colors"
        >
          {'Skip for now ->'}
        </button>
      </div>
    </main>
  );
}
