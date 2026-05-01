"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/common/Avatar';

interface MatchSuccessOverlayProps {
  currentUser: {
    username: string | null;
    profilePhotoUrl?: string | null;
  } | null;
  matchedUser: {
    displayName: string;
    avatarUrl?: string | null;
    chatId?: string;
  } | null;
  onClose: () => void;
}

export function MatchSuccessOverlay({ currentUser, matchedUser, onClose }: MatchSuccessOverlayProps) {
  const router = useRouter();

  if (!matchedUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/90 backdrop-blur-lg px-6"
      >
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 -z-0 opacity-10" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-extrabold text-indigo-900 mb-2">It's a Vibe!</h2>
            <p className="text-slate-500 font-medium">You and {matchedUser.displayName} liked each other.</p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mb-10">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Avatar src={currentUser?.profilePhotoUrl} alt={currentUser?.username || 'You'} size={120} className="border-4 border-white shadow-xl" />
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-3xl z-10"
            >
              ❤️
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Avatar src={matchedUser.avatarUrl} alt={matchedUser.displayName} size={120} className="border-4 border-white shadow-xl" />
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => matchedUser.chatId && router.push(`/chat/${matchedUser.chatId}`)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors"
            >
              Send a Message
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
            >
              Keep Discovering
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
