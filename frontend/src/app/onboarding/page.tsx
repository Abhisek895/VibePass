"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

    const loadData = async () => {
      try {
        const lookupData = await getOnboardingLookups();

        // Filter out duplicate interests (case-insensitive label check)
        const uniqueInterests: LookupOption[] = [];
        const seenLabels = new Set<string>();
        lookupData.interests.forEach(interest => {
          const labelLower = interest.label.toLowerCase();
          if (!seenLabels.has(labelLower)) {
            seenLabels.add(labelLower);
            uniqueInterests.push(interest);
          }
        });
        setInterests(uniqueInterests);

        // Ensure standard pronouns are always available
        const defaultPronouns = [
          { label: 'He/Him', value: 'he/him' },
          { label: 'She/Her', value: 'she/her' },
          { label: 'They/Them', value: 'they/them' },
        ];

        // Merge with API data, avoiding duplicates
        const combinedPronouns = [...defaultPronouns];
        lookupData.pronouns.forEach(p => {
          if (!combinedPronouns.find(cp => cp.value.toLowerCase() === p.value.toLowerCase())) {
            combinedPronouns.push(p);
          }
        });

        setPronouns(combinedPronouns);
        setConversationIntents(lookupData.conversationIntents);
        setVoiceLevels(lookupData.voiceLevels);
      } catch (error) {
        setErrorMsg(getApiErrorMessage(error, 'Unable to load configuration.'));
      } finally {
        setIsLoadingLookups(false);
      }
    };

    void loadData();
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
      setErrorMsg(getApiErrorMessage(error, 'Failed to complete onboarding.'));
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const progress = (step / 3) * 100;

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  if (isLoadingLookups) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[rgb(var(--accent-primary),0.2)] border-t-[rgb(var(--accent-primary))] rounded-full animate-spin" />
          <p className="text-[rgb(var(--text-secondary))] animate-pulse">Setting the vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] relative overflow-y-auto no-scrollbar">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[rgb(var(--accent-primary),0.05)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgb(var(--accent-secondary),0.05)] rounded-full blur-[100px] pointer-events-none" />

      {/* Progress Header */}
      <div className="w-full max-w-2xl mx-auto pt-12 px-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--accent-primary))]">Identity Discovery</span>
          <span className="text-xs font-medium text-[rgb(var(--text-muted))]">Step {step} of 3</span>
        </div>
        <div className="h-1.5 w-full bg-[rgb(var(--bg-surface))] rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[rgb(var(--accent-primary))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10">
        <div className="w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">Who are <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))]">you?</span></h1>
                  <p className="text-[rgb(var(--text-secondary))]">Choose an anonymous identity and reveal your age.</p>
                </div>

                <div className="space-y-6">
                  <div className="vibe-card bg-white/5 backdrop-blur-xl border-white/10 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))]">Nickname</label>
                      <input
                        type="text"
                        placeholder="e.g. NightOwl99"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-transparent border-b border-white/10 py-3 text-xl focus:border-[rgb(var(--accent-primary))] outline-none transition-colors placeholder:text-white/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[rgb(var(--text-muted))]">Age</label>
                      <input
                        type="number"
                        placeholder="18-28"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full bg-transparent border-b border-white/10 py-3 text-xl focus:border-[rgb(var(--accent-primary))] outline-none transition-colors placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Pronouns</label>
                    <div className="max-h-[250px] overflow-y-auto pr-2 no-scrollbar border border-white/5 bg-white/5 p-4 rounded-2xl">
                      <div className="flex flex-wrap gap-2">
                        {pronouns.map((p) => {
                          const isSelected = formData.pronouns === p.value;
                          return (
                            <button
                              key={p.value}
                              onClick={() => setFormData({ ...formData, pronouns: p.value })}
                              className={`px-6 py-3 rounded-2xl border transition-all ${isSelected
                                ? 'bg-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))] text-white shadow-lg'
                                : 'bg-white/5 border-white/10 hover:border-white/30 text-[rgb(var(--text-secondary))]'
                                }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={nextStep}
                    disabled={!formData.username || !formData.age || !formData.pronouns}
                    className="w-full btn-primary h-14 text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    Next
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))]">Spark</span></h1>
                  <p className="text-[rgb(var(--text-secondary))]">What gets you excited? Select at least 3.</p>
                </div>

                <div className="max-h-[450px] overflow-y-auto pr-3 no-scrollbar rounded-2xl border border-white/5 bg-white/5 p-4 shadow-inner">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interests.map((interest) => {
                      const isSelected = formData.interests.includes(interest.value);
                      return (
                        <button
                          key={interest.value}
                          onClick={() => {
                            const nextInterests = isSelected
                              ? formData.interests.filter(i => i !== interest.value)
                              : [...formData.interests, interest.value];
                            setFormData({ ...formData, interests: nextInterests });
                          }}
                          className={`p-4 rounded-2xl border transition-all duration-300 text-left relative group ${isSelected
                            ? 'bg-[rgb(var(--accent-primary),0.1)] border-[rgb(var(--accent-primary))] shadow-[0_0_20px_rgba(var(--accent-primary),0.15)]'
                            : 'bg-[rgb(var(--bg-surface),0.4)] border-white/5 hover:border-white/20'
                            }`}
                        >
                          <span className={`block font-medium ${isSelected ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--text-secondary))]'}`}>
                            {interest.label}
                          </span>
                          {isSelected && (
                            <motion.div
                              layoutId="check-interest"
                              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[rgb(var(--accent-primary))]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="w-1/3 btn-secondary h-14">Back</button>
                  <button
                    onClick={nextStep}
                    disabled={formData.interests.length < 3}
                    className="flex-1 btn-primary h-14 text-lg font-bold disabled:opacity-30"
                  >
                    {formData.interests.length < 3 ? `Pick ${3 - formData.interests.length} more` : 'Next'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--accent-tertiary))] to-[rgb(var(--accent-primary))]">Vibe</span></h1>
                  <p className="text-[rgb(var(--text-secondary))]">How do you want to connect?</p>
                </div>

                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-3 no-scrollbar border border-white/5 bg-white/5 p-4 rounded-2xl">
                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Intent</label>
                    <div className="space-y-3">
                      {conversationIntents.map((intent) => {
                        const isSelected = formData.conversationIntent === intent.value;
                        return (
                          <button
                            key={intent.value}
                            onClick={() => {
                              if (intent.isCasual) setShowCasualWarning(true);
                              setFormData({ ...formData, conversationIntent: intent.value });
                            }}
                            className={`w-full p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${isSelected
                              ? 'bg-[rgb(var(--accent-secondary),0.1)] border-[rgb(var(--accent-secondary))]'
                              : 'bg-[rgb(var(--bg-surface),0.4)] border-white/5 hover:border-white/20'
                              }`}
                          >
                            <span className="text-2xl">{intent.emoji || '✨'}</span>
                            <div className="text-left">
                              <p className="font-bold">{intent.label}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Voice Comfort</label>
                    <div className="grid grid-cols-2 gap-3">
                      {voiceLevels.map((level) => {
                        const isSelected = formData.voiceComfort === level.value;
                        return (
                          <button
                            key={level.value}
                            onClick={() => setFormData({ ...formData, voiceComfort: level.value })}
                            className={`p-4 rounded-2xl border transition-all duration-300 ${isSelected
                              ? 'bg-[rgb(var(--voice-active),0.1)] border-[rgb(var(--voice-active))]'
                              : 'bg-[rgb(var(--bg-surface),0.4)] border-white/5 hover:border-white/20'
                              }`}
                          >
                            <p className="text-sm font-bold">{level.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={prevStep} className="w-1/3 btn-secondary h-14">Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.conversationIntent || !formData.voiceComfort}
                    className="flex-1 btn-primary h-14 text-lg font-bold disabled:opacity-30 animate-sparkle"
                  >
                    {isLoading ? 'Joining...' : 'Complete Discovery'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Safety Modal */}
      <AnimatePresence>
        {showCasualWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[rgb(var(--bg-elevated))] rounded-[32px] p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Safety First</h2>
              <p className="text-[rgb(var(--text-secondary))] mb-6 leading-relaxed">
                When exploring casual connections, your safety is our priority.
              </p>
              <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-3 mb-8">
                <li className="flex gap-3"><span>•</span> Always meet in public first</li>
                <li className="flex gap-3"><span>•</span> Share identity only when comfortable</li>
                <li className="flex gap-3"><span>•</span> Trust your instincts</li>
              </ul>
              <button
                onClick={() => setShowCasualWarning(false)}
                className="w-full btn-primary h-14 font-bold"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
