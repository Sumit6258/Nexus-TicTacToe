// ====================================================================
// ADMIN DASHBOARD - Real-time monitoring and management
// ====================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiTrendingUp, FiDownload, FiAlertCircle } from 'react-icons/fi';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  gamesPlayed: number;
  gamesToday: number;
  activeGames: ActiveGameInfo[];
}

interface ActiveGameInfo {
  gameId: string;
  playerA: { id: string; username: string };
  playerB: { id: string; username: string };
  mode: string;
  duration: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('csv');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const exportGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/admin/games/export?format=${selectedFormat}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `games-export-${Date.now()}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export games:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Real-time monitoring and management</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiUsers />}
            label="Total Users"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={<FiActivity />}
            label="Active Users"
            value={stats?.activeUsers || 0}
            color="green"
          />
          <StatCard
            icon={<FiTrendingUp />}
            label="Total Games"
            value={stats?.gamesPlayed || 0}
            color="purple"
          />
          <StatCard
            icon={<FiAlertCircle />}
            label="Games Today"
            value={stats?.gamesToday || 0}
            color="pink"
          />
        </div>

        {/* Export Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Export Game Data</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'json' | 'csv')}
              className="bg-black/50 border border-purple-500/50 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={exportGames}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg hover:shadow-neon-purple transition-all"
            >
              <FiDownload />
              Export Games
            </button>
          </div>
        </motion.div>

        {/* Active Games Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Active Games ({stats?.activeGames?.length || 0})</h2>
          
          {stats?.activeGames && stats.activeGames.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left py-3 px-4">Game ID</th>
                    <th className="text-left py-3 px-4">Player A</th>
                    <th className="text-left py-3 px-4">Player B</th>
                    <th className="text-left py-3 px-4">Mode</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.activeGames.map((game, index) => (
                    <motion.tr
                      key={game.gameId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-purple-500/10 hover:bg-purple-500/10 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-sm">
                        {game.gameId.substring(0, 8)}...
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                          <span>{game.playerA.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full" />
                          <span>{game.playerB.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm">
                          {game.mode}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {formatDuration(game.duration)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400">{game.status}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No active games at the moment
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'pink';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-violet-500',
    pink: 'from-pink-500 to-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:shadow-neon-purple transition-all"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2">{value.toLocaleString()}</div>
      <div className="text-gray-400">{label}</div>
    </motion.div>
  );
}
