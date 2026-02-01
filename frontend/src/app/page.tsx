'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-8">
          NEXUS TIC-TAC-TOE
        </h1>
        
        <div className="space-y-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/play')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:shadow-neon-purple transition-all"
          >
            Play as Guest
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Sign In coming soon! Click "Play as Guest" to start.')}
            className="w-full bg-white/10 backdrop-blur-xl border border-purple-500/50 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-white/20 transition-all"
          >
            Sign In
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Create Account coming soon! Click "Play as Guest" to start.')}
            className="w-full bg-white/10 backdrop-blur-xl border border-purple-500/50 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-white/20 transition-all"
          >
            Create Account
          </motion.button>
        </div>

        <div className="mt-12 text-gray-400">
          <p>✨ Real-time Multiplayer</p>
          <p>🤖 AI Opponents (Easy, Medium, Hard)</p>
          <p>🎮 Stunning Animations</p>
        </div>
      </motion.div>
    </div>
  );
}
