'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import {
  Trophy,
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Compass,
  CheckCircle2,
  Calendar,
  Sun,
  Award,
  HeartHandshake,
  Coins,
  Crown,
  Lock,
  Check,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Compass,
  CheckCircle2,
  Calendar,
  Sun,
  Award,
  HeartHandshake,
  Coins,
  Crown,
  Trophy,
};

const TIER_COLORS: Record<string, { badge: string; border: string; glow: string }> = {
  bronze: { badge: 'from-amber-700 to-amber-900', border: 'border-amber-700/60', glow: 'shadow-amber-900/20' },
  silver: { badge: 'from-slate-400 to-slate-600', border: 'border-slate-400/60', glow: 'shadow-slate-400/20' },
  gold: { badge: 'from-yellow-400 to-amber-600', border: 'border-amber-400/80', glow: 'shadow-amber-500/30' },
  diamond: { badge: 'from-cyan-400 to-blue-600', border: 'border-cyan-400/90', glow: 'shadow-cyan-500/40' },
};

export default function AchievementsView() {
  const { achievementsList } = useGame();

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;
  const totalCount = achievementsList.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER CREST */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-amber-500/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
          <Trophy className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          HALL OF <span className="gold-gradient-text">ACHIEVEMENTS</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Unlock sacred badges by mastering Scripture, maintaining streaks, and conquering the 10 Levels.
        </p>

        {/* PROGRESS BAR */}
        <div className="max-w-md mx-auto mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Achievements Unlocked</span>
            <span className="text-amber-400">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {achievementsList.map((ach) => {
          const IconComp = ICON_MAP[ach.icon] || Trophy;
          const tierStyle = TIER_COLORS[ach.tier] || TIER_COLORS.bronze;
          const isUnlocked = ach.unlocked;
          const progressPercent = Math.min(100, Math.round(((ach.currentProgress || 0) / (ach.target || 1)) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                isUnlocked
                  ? `bg-[#131d33] ${tierStyle.border} shadow-lg ${tierStyle.glow}`
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tierStyle.badge} flex items-center justify-center shadow-md text-white shrink-0`}
                  >
                    {isUnlocked ? <IconComp className="w-6 h-6" /> : <Lock className="w-5 h-5 text-slate-300" />}
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {ach.tier}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white leading-tight">{ach.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{ach.description}</p>
              </div>

              {/* PROGRESS & REWARDS */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                {!isUnlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Progress</span>
                      <span>{ach.currentProgress || 0} / {ach.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> +{ach.xpReward} XP
                    </span>
                    <span className="text-yellow-300 flex items-center gap-0.5">
                      🪙 +{ach.coinReward}
                    </span>
                  </div>

                  {isUnlocked && (
                    <span className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Unlocked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
