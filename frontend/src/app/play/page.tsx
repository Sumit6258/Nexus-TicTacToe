'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PlayPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-12">
          Choose Game Mode
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/game/single-player')}
            className="bg-white/10 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all"
          >
            <div className="text-6xl mb-4 text-center">🤖</div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Single Player</h3>
            <p className="text-gray-300 text-center text-sm">Play against AI</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Online multiplayer coming soon!')}
            className="bg-white/10 backdrop-blur-xl border-2 border-pink-500/50 rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all"
          >
            <div className="text-6xl mb-4 text-center">🌐</div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Online</h3>
            <p className="text-gray-300 text-center text-sm">Play with friends</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Local multiplayer coming soon!')}
            className="bg-white/10 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all"
          >
            <div className="text-6xl mb-4 text-center">👥</div>
            <h3 className="text-2xl font-bold text-white text-center mb-2">Local</h3>
            <p className="text-gray-300 text-center text-sm">Same device</p>
          </motion.div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-8 w-full bg-white/5 border border-purple-500/30 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}
