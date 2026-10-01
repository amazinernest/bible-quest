'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { SEED_LEADERBOARD } from '@/lib/gameEngine';
import { LeaderboardUser } from '@/types/game';
import { Trophy, Medal, Flame, Star, Crown, Users, Sparkles, Share2, Compass, Shield, BookOpen } from 'lucide-react';
import FriendChallengeModal from '../modals/FriendChallengeModal';

export default function LeaderboardView() {
  const { profile } = useGame();
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);

  // Merge player into leaderboard
  const currentPlayerEntry: LeaderboardUser = {
    id: profile.id,
    displayName: profile.displayName + ' (You)',
    avatar: profile.avatar,
    title: profile.title,
    level: profile.level,
    score: profile.stats.lifetimeScore || 1250,
    streak: profile.stats.longestStreak || 0,
    stars: profile.stats.starsEarned || 0,
    isCurrentPlayer: true,
  };

  const combinedList = [...SEED_LEADERBOARD, currentPlayerEntry]
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const top3 = combinedList.slice(0, 3);
  const restList = combinedList.slice(3);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER CREST */}
      <div className="game-panel rounded-3xl p-6 text-center relative overflow-hidden border border-amber-500/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
          <Trophy className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          SANCTUARY <span className="gold-gradient-text">LEADERBOARD</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Honoring the most faithful scholars and swift seekers of the Word.
        </p>

        {/* TIMEFRAME TABS */}
        <div className="flex justify-center gap-2 mt-5">
          {[
            { id: 'weekly', label: 'This Week' },
            { id: 'monthly', label: 'This Month' },
            { id: 'allTime', label: 'All-Time Champions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFrame(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                timeFrame === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
        {/* Rank 2 (Silver) */}
        {top3[1] && (
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-[#141e34] border border-slate-600/60 shadow-lg order-1">
            <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md mb-2">
              #2
            </div>
            <span className="text-xs font-black text-white truncate max-w-full">{top3[1].displayName}</span>
            <span className="text-[10px] text-slate-400 font-medium">Lvl {top3[1].level}</span>
            <span className="text-xs font-extrabold text-amber-300 mt-1">{top3[1].score.toLocaleString()}</span>
          </div>
        )}

        {/* Rank 1 (Gold Champion) */}
        {top3[0] && (
          <div className="flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-[#192644] border-2 border-amber-400 shadow-xl shadow-amber-500/10 order-2 scale-105 z-10">
            <Crown className="w-6 h-6 text-yellow-400 animate-bounce mb-1" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg mb-2">
              #1
            </div>
            <span className="text-sm font-black text-amber-200 truncate max-w-full">{top3[0].displayName}</span>
            <span className="text-[10px] text-amber-300/80 font-bold">{top3[0].title}</span>
            <span className="text-sm font-black text-yellow-400 mt-1">{top3[0].score.toLocaleString()} pts</span>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {top3[2] && (
          <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-[#141e34] border border-amber-800/40 shadow-lg order-3">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md mb-2">
              #3
            </div>
            <span className="text-xs font-black text-white truncate max-w-full">{top3[2].displayName}</span>
            <span className="text-[10px] text-slate-400 font-medium">Lvl {top3[2].level}</span>
            <span className="text-xs font-extrabold text-amber-300 mt-1">{top3[2].score.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* LEADERBOARD LIST */}
      <div className="space-y-2">
        {restList.map((entry) => (
          <div
            key={entry.id}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md transition ${
              entry.isCurrentPlayer
                ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-[#121c32] border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                #{entry.rank}
              </span>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{entry.displayName}</span>
                  {entry.isCurrentPlayer && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                      YOU
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {entry.title} • Level {entry.level}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {entry.streak > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-400">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{entry.streak}</span>
                </div>
              )}
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-amber-300 block leading-tight">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-medium">pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FRIEND CHALLENGE CTA */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            Friend & Youth Group Challenges
          </h4>
          <p className="text-xs text-slate-300">
            Generate a custom score challenge and test your friends’ Scripture knowledge!
          </p>
        </div>
        <button
          onClick={() => setIsChallengeModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-lg shadow-blue-500/20 flex items-center gap-1.5 shrink-0 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          Create Challenge
        </button>
      </div>

      <FriendChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        score={profile.stats.lifetimeScore || 1500}
        mode="blitz"
      />
    </div>
  );
}
