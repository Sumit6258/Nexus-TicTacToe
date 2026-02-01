'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameBoard from '@/components/GameBoard';

type Player = 'X' | 'O' | null;

export default function SinglePlayerGame() {
  const router = useRouter();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (currentBoard: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: [a, b, c] };
      }
    }

    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }

    return { winner: null, line: null };
  };

  const makeAIMove = (currentBoard: Player[]) => {
    const emptyCells = currentBoard
      .map((cell, index) => cell === null ? index : -1)
      .filter(i => i !== -1);

    if (emptyCells.length === 0) return;

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    setTimeout(() => {
      const newBoard = [...currentBoard];
      newBoard[randomIndex] = 'O';
      setBoard(newBoard);
      
      const result = checkWinner(newBoard);
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.line);
      } else {
        setCurrentPlayer('X');
      }
    }, 500);
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
    } else {
      setCurrentPlayer('O');
      makeAIMove(newBoard);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Single Player vs AI
          </h1>
          
          <div className="text-2xl font-semibold text-white">
            {winner
              ? winner === 'draw'
                ? "It's a Draw!"
                : winner === 'X'
                ? '🎉 You Won!'
                : '🤖 AI Wins!'
              : currentPlayer === 'X'
              ? 'Your Turn (X)'
              : 'AI is thinking... (O)'}
          </div>
        </div>

        <GameBoard
          board={board}
          winningLine={winningLine}
          currentPlayer={currentPlayer}
          onCellClick={handleCellClick}
          disabled={currentPlayer === 'O' || winner !== null}
          theme="cyberpunk"
        />

        <div className="flex gap-4 mt-8">
          <button
            onClick={resetGame}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-neon-purple transition-all"
          >
            New Game
          </button>
          <button
            onClick={() => router.push('/play')}
            className="flex-1 bg-white/10 border border-purple-500/50 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
