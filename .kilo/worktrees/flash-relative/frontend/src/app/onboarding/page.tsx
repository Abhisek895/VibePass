"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getApiErrorMessage,
  getOnboardingLookups,
  onboardUser,
} from '@/services/api';
import type {
  ConversationIntentOption,
  LookupOption,
} from '@/services/api/lookups.service';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    pronouns: '',
    interests: [] as string[],
    conversationIntent: '',
    voiceComfort: '',
  });
  const [interests, setInterests] = useState<LookupOption[]>([]);
  const [pronouns, setPronouns] = useState<LookupOption[]>([]);
  const [conversationIntents, setConversationIntents] = useState<
    ConversationIntentOption[]
  >([]);
  const [voiceLevels, setVoiceLevels] = useState<LookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCasualWarning, setShowCasualWarning] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('accessToken');

    if (!token) {
      router.push('/auth');
      return;
    }

    let isMounted = true;

    const loadLookups = async () => {
      try {
        const lookupData = await getOnboardingLookups();

        if (!isMounted) {
          return;
        }

        setInterests(lookupData.interests);
        setPronouns(lookupData.pronouns);
        setConversationIntents(lookupData.conversationIntents);
        setVoiceLevels(lookupData.voiceLevels);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMsg(
          getApiErrorMessage(error, 'Unable to load onboarding options from the database.'),
        );
      } finally {
        if (isMounted) {
          setIsLoadingLookups(false);
        }
      }
    };

    void loadLookups();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      await onboardUser({
        username: formData.username,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        pronouns: formData.pronouns || undefined,
        interests: formData.interests,
        conversationIntent: formData.conversationIntent || undefined,
        voiceComfort: formData.voiceComfort || undefined,
      });
      router.push('/mood');
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Network error while saving your setup.'));
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(currentStep => currentStep + 1);
  const prevStep = () => setStep(currentStep => currentStep - 1);
  const progress = (step / 3) * 100;

  return (
    <main className="min-h-screen flex flex-col p-6 relative">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[rgb(var(--accent-primary),0.08)] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto mb-8">
        <div className="h-1 bg-[rgb(var(--bg-surface))] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-[rgb(var(--text-muted))]">
          Step {step} of 3
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-[rgb(var(--danger),0.3)] bg-[rgb(var(--danger),0.1)] px-4 py-3 text-sm text-[rgb(var(--danger))]">
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Welcome to VibePass</h1>
                <p className="text-[rgb(var(--text-secondary))] mt-1">Let's get to know you</p>
              </div>

              <div className="vibe-card space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What should we call you?</label>
                  <input
                    type="text"
                    placeholder="Your nickname"
                    value={formData.username}
                    onChange={event =>
                      setFormData({ ...formData, username: event.target.value })
                    }
                    className="w-full p-4 bg-[rgb(var(--bg-primary))] border border-[rgba(var(--border-subtle),0.1)] rounded-xl focus:outline-none focus:border-[rgb(var(--accent-primary))] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">How old are you?</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={event =>
                      setFormData({ ...formData, age: event.target.value })
                    }
                    className="w-full p-4 bg-[rgb(var(--bg-primary))] border border-[rgba(var(--border-subtle),0.1)] rounded-xl focus:outline-none focus:border-[rgb(var(--accent-primary))] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your pronouns</label>
                  {isLoadingLookups ? (
                    <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
                      Loading choices from the database...
                    </div>
                  ) : pronouns.length ? (
                    <div className="flex gap-2">
                      {pronouns.map(option => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setFormData({ ...formData, pronouns: option.value })
                          }
                          className={`flex-1 py-3 px-3 rounded-xl border transition-all ${
                            formData.pronouns === option.value
                              ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary)),0.1]'
                              : 'border-[rgba(var(--border-subtle),0.1)] hover:border-[rgba(var(--border-subtle),0.3)]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-3 text-sm text-[rgb(var(--text-muted))]">
                      No pronoun options are available in the database yet.
                    </div>
                  )}
                </div>

                <button
                  onClick={nextStep}
                  disabled={!formData.username}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Your Interests</h1>
                <p className="text-[rgb(var(--text-secondary))] mt-1">Select what gets you excited</p>
              </div>

              <div className="vibe-card">
                {isLoadingLookups ? (
                  <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                    Loading interests from the database...
                  </div>
                ) : interests.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {interests.map(interest => (
                      <button
                        key={interest.value}
                        onClick={() => {
                          const nextInterests = formData.interests.includes(interest.value)
                            ? formData.interests.filter(item => item !== interest.value)
                            : [...formData.interests, interest.value];

                          setFormData({ ...formData, interests: nextInterests });
                        }}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-2 ${
                          formData.interests.includes(interest.value)
                            ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary)),0.1]'
                            : 'border-[rgba(var(--border-subtle),0.1)] hover:border-[rgba(var(--border-subtle),0.3)]'
                        }`}
                      >
                        <span className="font-medium">{interest.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                    No interests are available in the database yet.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 btn-secondary">
                  Back
                </button>
                <button onClick={nextStep} className="flex-1 btn-primary">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Conversation Style</h1>
                <p className="text-[rgb(var(--text-secondary))] mt-1">Help us find your vibe</p>
              </div>

              <div className="vibe-card space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-3">What are you looking for?</label>
                  {isLoadingLookups ? (
                    <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                      Loading intents from the database...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversationIntents.map(intent => (
                        <button
                          key={intent.value}
                          onClick={() => {
                            if (intent.isCasual) {
                              setShowCasualWarning(true);
                            }

                            setFormData({
                              ...formData,
                              conversationIntent: intent.value,
                            });
                          }}
                          className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                            formData.conversationIntent === intent.value
                              ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary)),0.1]'
                              : 'border-[rgba(var(--border-subtle),0.1)] hover:border-[rgba(var(--border-subtle),0.3)]'
                          }`}
                        >
                          {intent.emoji ? (
                            <span className="text-xl">{intent.emoji}</span>
                          ) : null}
                          <span>{intent.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Voice chat comfort</label>
                  {isLoadingLookups ? (
                    <div className="rounded-xl border border-[rgba(var(--border-subtle),0.1)] px-4 py-8 text-center text-sm text-[rgb(var(--text-muted))]">
                      Loading voice options from the database...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {voiceLevels.map(level => (
                        <button
                          key={level.value}
                          onClick={() =>
                            setFormData({ ...formData, voiceComfort: level.value })
                          }
                          className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                            formData.voiceComfort === level.value
                              ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary)),0.1]'
                              : 'border-[rgba(var(--border-subtle),0.1)] hover:border-[rgba(var(--border-subtle),0.3)]'
                          }`}
                        >
                          <span>{level.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 btn-secondary">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCasualWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg-primary))] rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Safety First for Casual Connections</h2>
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              When looking for casual encounters, remember:
            </p>
            <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-2 mb-6">
              <li>- Always meet in public first</li>
              <li>- Share your real identity only when you feel safe</li>
              <li>- Use protection and get tested regularly</li>
              <li>- Respect boundaries and communicate clearly</li>
              <li>- Report any inappropriate behavior</li>
            </ul>
            <button
              onClick={() => setShowCasualWarning(false)}
              className="w-full btn-primary"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
