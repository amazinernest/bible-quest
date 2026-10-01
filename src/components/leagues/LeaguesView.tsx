'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Trophy, Shield, Flame, Sparkles, ChevronUp, ChevronDown, Crown, Star } from 'lucide-react';

const LEAGUES = [
  { id: 'bronze', name: 'Bronze League', icon: '🥉', color: 'from-amber-800 to-amber-600', minXp: 0 },
  { id: 'silver', name: 'Silver League', icon: '🥈', color: 'from-slate-400 to-slate-200', minXp: 1000 },
  { id: 'gold', name: 'Gold League', icon: '🥇', color: 'from-yellow-500 to-amber-300', minXp: 3000 },
  { id: 'sapphire', name: 'Sapphire League', icon: '💎', color: 'from-blue-500 to-cyan-400', minXp: 6000 },
  { id: 'ruby', name: 'Ruby League', icon: '👑', color: 'from-rose-500 to-pink-400', minXp: 10000 },
  { id: 'diamond', name: 'Diamond Master League', icon: '✨', color: 'from-indigo-500 to-purple-400', minXp: 15000 },
];

const MOCK_LEAGUE_RIVALS = [
  { rank: 1, name: 'Elijah The Fire Prophet', xp: 4850, avatar: '🔥', streak: 18 },
  { rank: 2, name: 'Priscilla & Aquila', xp: 4420, avatar: '📜', streak: 14 },
  { rank: 3, name: 'Deborah Judge of Israel', xp: 3950, avatar: '⚔️', streak: 12 },
  { rank: 4, name: 'Barnabas Son of Encouragement', xp: 3600, avatar: '🕊️', streak: 9 },
  { rank: 5, name: 'Timothy of Lystra', xp: 3200, avatar: '📖', streak: 8 },
  { rank: 6, name: 'Lydia of Thyatira', xp: 2900, avatar: '💜', streak: 7 },
  { rank: 7, name: 'Nehemiah Wall Builder', xp: 2650, avatar: '🏰', streak: 6 },
  { rank: 8, name: 'Stephen Full of Grace', xp: 2400, avatar: '✨', streak: 5 },
  { rank: 9, name: 'Esther Queen of Susa', xp: 2100, avatar: '👑', streak: 4 },
  { rank: 10, name: 'Gideon of Manasseh', xp: 1850, avatar: '🎺', streak: 3 },
];

export default function LeaguesView() {
  const { profile } = useGame();
  const [selectedLeagueIdx, setSelectedLeagueIdx] = useState<number>(2); // Default to Gold

  const currentLeague = LEAGUES[selectedLeagueIdx];

  // Insert player into leaderboard
  const playerRank = Math.max(1, Math.min(6, 11 - Math.floor(profile.xp / 400)));
  const rivalsWithPlayer = [...MOCK_LEAGUE_RIVALS];
  rivalsWithPlayer.splice(playerRank - 1, 0, {
    rank: playerRank,
    name: `${profile.displayName} (You)`,
    xp: profile.xp || 3450,
    avatar: '⭐',
    streak: profile.stats.currentStreak || 5,
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER BANNER */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center space-y-3 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 mb-1">
          {currentLeague.icon}
        </div>

        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
            Weekly Promotion Tournament
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {currentLeague.name.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Top 3 advance to the next league every Sunday at midnight!
          </p>
        </div>

        {/* LEAGUE TIER STEPPER */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {LEAGUES.map((l, idx) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeagueIdx(idx)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm transition-all ${
                selectedLeagueIdx === idx
                  ? 'bg-amber-500 border-yellow-200 scale-110 shadow-lg'
                  : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              {l.icon}
            </button>
          ))}
        </div>
      </div>

      {/* RIVAL RANKINGS LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase">
          <span>Pilgrim</span>
          <span>XP This Week</span>
        </div>

        <div className="space-y-2">
          {rivalsWithPlayer.slice(0, 10).map((rival, idx) => {
            const rankNum = idx + 1;
            const isPlayer = rival.name.includes('(You)');
            const isPromotion = rankNum <= 3;
            const isDemotion = rankNum >= 9;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isPlayer
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                    : isPromotion
                    ? 'bg-slate-900/90 border-emerald-500/40 hover:bg-slate-800'
                    : isDemotion
                    ? 'bg-slate-950/70 border-red-900/40 text-slate-400'
                    : 'bg-[#121b30] border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      rankNum === 1
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : rankNum === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rankNum === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rankNum}
                  </div>

                  <span className="text-xl">{rival.avatar}</span>

                  <div className="text-left">
                    <h4 className={`text-xs sm:text-sm font-black leading-tight ${isPlayer ? 'text-amber-300' : 'text-white'}`}>
                      {rival.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {rival.streak} day streak
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPromotion && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                      <ChevronUp className="w-3 h-3" /> Promoted
                    </span>
                  )}
                  {isDemotion && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-0.5">
                      <ChevronDown className="w-3 h-3" /> Demote
                    </span>
                  )}
                  <span className="text-xs font-black font-mono text-amber-300">
                    {rival.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
