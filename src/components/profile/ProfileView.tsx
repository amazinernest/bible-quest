'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { getLevelFromXp, AVATAR_OPTIONS } from '@/lib/gameEngine';
import {
  User,
  Star,
  Flame,
  Sparkles,
  Trophy,
  CheckCircle2,
  Edit2,
  Check,
  BookOpen,
  Award,
  Zap,
  Target,
} from 'lucide-react';

export default function ProfileView() {
  const { profile, updateProfile, achievementsList } = useGame();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profile.displayName);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const levelInfo = getLevelFromXp(profile.xp);
  const totalQ = profile.stats.totalQuestionsAnswered;
  const correct = profile.stats.correctAnswers;
  const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfile({ displayName: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const currentAvatarObj = AVATAR_OPTIONS.find((a) => a.id === profile.avatar) || AVATAR_OPTIONS[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* PROFILE HEADER CARD */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-amber-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* AVATAR */}
          <div className="relative group">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${currentAvatarObj.color} flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-300`}
            >
              <Award className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md hover:bg-amber-400 transition"
              title="Change Avatar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* NAME & TITLE */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    maxLength={20}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-400 text-white font-bold text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.displayName}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {profile.title}
              </span>
            </div>

            {/* LEVEL PROGRESS */}
            <div className="space-y-1 max-w-md">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Player Level {levelInfo.level}</span>
                <span className="text-amber-400">{profile.xp.toLocaleString()} / {levelInfo.nextLevelXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AVATAR PICKER POPUP */}
        {isPickerOpen && (
          <div className="mt-6 pt-5 border-t border-slate-700 space-y-3 text-left">
            <span className="text-xs font-bold uppercase text-amber-300 tracking-wider block">
              Choose Avatar Archetype:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => {
                    updateProfile({ avatar: av.id });
                    setIsPickerOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                    profile.avatar === av.id
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${av.color} flex items-center justify-center shrink-0`}>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">{av.name}</span>
                    <span className="text-[9px] text-slate-400">{av.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIFETIME STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
          <span className="text-base sm:text-lg font-black text-white">{profile.stats.lifetimeScore.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mx-auto" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Stars Collected</span>
          <span className="text-base sm:text-lg font-black text-white">{profile.stats.starsEarned} ⭐</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <Target className="w-5 h-5 text-emerald-400 mx-auto" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
          <span className="text-base sm:text-lg font-black text-emerald-400">{accuracy}%</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <Flame className="w-5 h-5 text-orange-400 fill-orange-400 mx-auto animate-flame" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Best Streak</span>
          <span className="text-base sm:text-lg font-black text-orange-300">{profile.stats.longestStreak}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <BookOpen className="w-5 h-5 text-blue-400 mx-auto" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Answered</span>
          <span className="text-base sm:text-lg font-black text-white">{totalQ}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#121c32] border border-slate-800 text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-purple-400 mx-auto" />
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Stages Clear</span>
          <span className="text-base sm:text-lg font-black text-white">{profile.stats.stagesCompleted}</span>
        </div>
      </div>

      {/* CATEGORY ACCURACY MASTERY */}
      <div className="game-panel rounded-3xl p-6 text-left space-y-4 border border-slate-800">
        <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Category Scripture Knowledge
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(profile.stats.categoryAccuracy).length === 0 ? (
            <p className="text-xs text-slate-400 col-span-2 italic">
              Play Bible Blitz, Journey stages, or Daily Challenges to build your category mastery profile.
            </p>
          ) : (
            Object.entries(profile.stats.categoryAccuracy).map(([catName, data]) => {
              const catAcc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
              return (
                <div key={catName} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-200">{catName}</span>
                    <span className="text-amber-400">{catAcc}% ({data.correct}/{data.total})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${catAcc}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
