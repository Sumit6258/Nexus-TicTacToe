// ====================================================================
// GAME BOARD COMPONENT - Stunning animated Tic-Tac-Toe board
// ====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Player } from '../../../shared/types';

interface GameBoardProps {
  board: Player[];
  winningLine: number[] | null;
  currentPlayer: Player;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  theme?: 'cyberpunk' | 'minimal' | 'retro' | 'neon';
  showHoverEffects?: boolean;
}

export default function GameBoard({
  board,
  winningLine,
  currentPlayer,
  onCellClick,
  disabled = false,
  theme = 'cyberpunk',
  showHoverEffects = true,
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Trigger confetti on win
  useEffect(() => {
    if (winningLine) {
      triggerConfetti();
    }
  }, [winningLine]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'cyberpunk':
        return {
          container: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border-2 border-purple-500/50',
          cell: 'bg-black/40 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10',
          cellActive: 'bg-purple-500/20 border-purple-400 shadow-neon-purple',
          xColor: 'text-neon-pink',
          oColor: 'text-neon-blue',
          glow: 'shadow-neon-purple',
        };
      case 'neon':
        return {
          container: 'bg-black/90 backdrop-blur-xl border-2 border-neon-pink',
          cell: 'bg-gray-900/50 border border-neon-pink/50 hover:border-neon-pink hover:bg-neon-pink/10',
          cellActive: 'bg-neon-pink/20 border-neon-pink shadow-neon-pink',
          xColor: 'text-neon-pink',
          oColor: 'text-neon-blue',
          glow: 'shadow-neon-pink',
        };
      case 'minimal':
        return {
          container: 'bg-white/80 backdrop-blur-sm border-2 border-gray-300',
          cell: 'bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          cellActive: 'bg-gray-100 border-gray-400',
          xColor: 'text-blue-600',
          oColor: 'text-red-600',
          glow: '',
        };
      case 'retro':
        return {
          container: 'bg-black border-4 border-green-500 font-mono',
          cell: 'bg-black border-2 border-green-500 hover:bg-green-500/10',
          cellActive: 'bg-green-500/20 border-green-400',
          xColor: 'text-green-500',
          oColor: 'text-yellow-500',
          glow: 'shadow-[0_0_20px_rgba(0,255,65,0.5)]',
        };
      default:
        return {
          container: '',
          cell: '',
          cellActive: '',
          xColor: '',
          oColor: '',
          glow: '',
        };
    }
  };

  const themeClasses = getThemeClasses();

  const isWinningCell = (index: number) => {
    return winningLine?.includes(index) || false;
  };

  const handleCellClick = (index: number) => {
    if (!disabled && board[index] === null) {
      onCellClick(index);
    }
  };

  const cellVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const xVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.3 },
      },
    },
  };

  const oVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.3 },
      },
    },
  };

  const winLineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="relative">
      {/* Background particles */}
      {theme === 'cyberpunk' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
              }}
              animate={{
                y: ['-10%', '110%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Board container */}
      <motion.div
        className={`relative p-6 rounded-3xl ${themeClasses.container} ${themeClasses.glow}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 relative">
          {board.map((cell, index) => (
            <motion.div
              key={index}
              className={`
                relative aspect-square rounded-xl cursor-pointer
                flex items-center justify-center transition-all duration-200
                ${themeClasses.cell}
                ${isWinningCell(index) ? themeClasses.cellActive : ''}
                ${disabled || cell !== null ? 'cursor-not-allowed' : ''}
              `}
              variants={cellVariants}
              initial="hidden"
              animate="visible"
              whileHover={!disabled && cell === null ? 'hover' : {}}
              whileTap={!disabled && cell === null ? 'tap' : {}}
              onClick={() => handleCellClick(index)}
              onMouseEnter={() => setHoveredCell(index)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {/* Hover preview */}
              {showHoverEffects && hoveredCell === index && cell === null && !disabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className={`absolute inset-0 flex items-center justify-center ${
                    currentPlayer === 'X' ? themeClasses.xColor : themeClasses.oColor
                  }`}
                >
                  <span className="text-6xl font-bold">{currentPlayer}</span>
                </motion.div>
              )}

              {/* Cell content */}
              <AnimatePresence>
                {cell && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    className={`text-7xl font-bold ${
                      cell === 'X' ? themeClasses.xColor : themeClasses.oColor
                    }`}
                  >
                    {cell === 'X' ? (
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 100 100"
                        className="stroke-current"
                      >
                        <motion.line
                          x1="20"
                          y1="20"
                          x2="80"
                          y2="80"
                          strokeWidth="8"
                          strokeLinecap="round"
                          variants={xVariants}
                        />
                        <motion.line
                          x1="80"
                          y1="20"
                          x2="20"
                          y2="80"
                          strokeWidth="8"
                          strokeLinecap="round"
                          variants={xVariants}
                        />
                      </svg>
                    ) : (
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 100 100"
                        className="stroke-current fill-none"
                      >
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="30"
                          strokeWidth="8"
                          strokeLinecap="round"
                          variants={oVariants}
                        />
                      </svg>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winning cell glow */}
              {isWinningCell(index) && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Winning line overlay */}
        {winningLine && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial="hidden"
            animate="visible"
          >
            <svg className="w-full h-full absolute" viewBox="0 0 300 300">
              {getWinningLineCoordinates(winningLine).map((coords, i) => (
                <motion.line
                  key={i}
                  x1={coords.x1}
                  y1={coords.y1}
                  x2={coords.x2}
                  y2={coords.y2}
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  variants={winLineVariants}
                />
              ))}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Helper function to get winning line SVG coordinates
function getWinningLineCoordinates(winningLine: number[]): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const positions = [
    { x: 50, y: 50 },
    { x: 150, y: 50 },
    { x: 250, y: 50 },
    { x: 50, y: 150 },
    { x: 150, y: 150 },
    { x: 250, y: 150 },
    { x: 50, y: 250 },
    { x: 150, y: 250 },
    { x: 250, y: 250 },
  ];

  const start = positions[winningLine[0]];
  const end = positions[winningLine[2]];

  return [
    {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    },
  ];
}
