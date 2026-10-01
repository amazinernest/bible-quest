'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { GameMode } from '@/types/game';
import {
  Sparkles,
  Flame,
  Crown,
  Play,
  Calendar,
  Compass,
  Trophy,
  ShoppingBag,
  HelpCircle,
  CheckCircle,
  Scroll,
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
  Star,
  Users,
  Check,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onStartMode: (mode: GameMode) => void;
}

export default function HomeView({ onNavigate, onStartMode }: HomeViewProps) {
  const {
    profile,
    startDailyChallenge,
    startStageRound,
    dailyChallenge,
  } = useGame();

  // Find latest unlocked stage for "Continue Where You Left Off"
  const latestStageId = profile.unlockedStages[profile.unlockedStages.length - 1] || '1-1';
  const [lastLvlStr, lastStgStr] = latestStageId.split('-');
  const lastLvlNum = parseInt(lastLvlStr, 10);
  const lastStgNum = parseInt(lastStgStr, 10);
  const activeLevelDef = LEVELS_CONFIG.find((l) => l.levelNumber === lastLvlNum) || LEVELS_CONFIG[0];
  const activeStageDef = activeLevelDef.stages.find((s) => s.stageNumber === lastStgNum) || activeLevelDef.stages[0];

  const gameModesList = [
    {
      id: 'blitz' as GameMode,
      title: 'Bible Blitz',
      tagline: 'Fast-paced, high-speed Scripture trivia.',
      icon: Sparkles,
      color: 'from-amber-500 to-yellow-400',
      badge: 'Popular',
    },
    {
      id: 'who_am_i' as GameMode,
      title: 'Who Am I?',
      tagline: 'Deduce the character from progressive clues.',
      icon: HelpCircle,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Mystery',
    },
    {
      id: 'bible_or_not' as GameMode,
      title: 'Bible or Not?',
      tagline: 'Is it real Scripture, or a cultural myth?',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Fact-Check',
    },
    {
      id: 'verse_match' as GameMode,
      title: 'Complete the Verse',
      tagline: 'Fill the blank in foundational verses.',
      icon: Scroll,
      color: 'from-orange-500 to-red-600',
      badge: 'Memory',
    },
    {
      id: 'who_said_it' as GameMode,
      title: 'Who Said It?',
      tagline: 'Identify who spoke famous biblical quotes.',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-700',
      badge: 'Quotes',
    },
    {
      id: 'timeline' as GameMode,
      title: 'Bible Timeline',
      tagline: 'Reorder major biblical events in history.',
      icon: Clock,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Chronology',
    },
    {
      id: 'sort' as GameMode,
      title: 'Bible Sort',
      tagline: 'Drag and sort characters & books into categories.',
      icon: Layers,
      color: 'from-pink-500 to-rose-600',
      badge: 'Interactive',
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyCompletedToday = profile.completedDailyDates.includes(todayStr);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-8 animate-fade-in text-slate-100">
      {/* HERO SECTION */}
      <div className="game-panel rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden border-2 border-amber-500/40 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The Ultimate Bible Adventure
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight">
            TEST YOUR KNOWLEDGE. <br />
            <span className="gold-gradient-text">MASTER THE WORD.</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed">
            Challenge yourself with verified Scripture questions, conquer 10 historical levels, build your streak, and discover how well you truly know the Bible.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('journey')}
              className="py-3.5 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl shadow-amber-500/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              PLAY NOW
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* CONTINUE JOURNEY BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#172646] to-[#121c32] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative overflow-hidden">
        <div className="space-y-1 z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            Continue Where You Left Off
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Level {activeLevelDef.levelNumber}: {activeLevelDef.title}
          </h3>
          <p className="text-xs text-slate-300">
            Stage {activeStageDef.stageNumber}: {activeStageDef.title} ({activeStageDef.subtitle})
          </p>
        </div>

        <button
          onClick={() => startStageRound(activeLevelDef.levelNumber, activeStageDef.stageNumber, false)}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center gap-2 shrink-0 z-10 shadow-lg"
        >
          <span>Continue Stage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* DAILY CHALLENGE & 7-DAY STREAK SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DAILY CHALLENGE CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#141e35] to-[#0f172a] border border-amber-500/40 shadow-xl text-left flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Daily Challenge
              </span>
              <span className="text-xs font-mono text-slate-400">{dailyChallenge.date}</span>
            </div>

            <h3 className="text-lg font-black text-white">{dailyChallenge.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dailyChallenge.description}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-amber-400">+{dailyChallenge.xpReward} XP</span>
              <span className="text-yellow-300">🪙 +{dailyChallenge.coinReward}</span>
            </div>

            <button
              onClick={startDailyChallenge}
              className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-md flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              {isDailyCompletedToday ? 'Play Daily Again' : 'Enter Today’s Trial'}
            </button>
          </div>
        </div>

        {/* 7-DAY LOGIN STREAK REWARDS */}
        <div className="p-6 rounded-3xl bg-[#121c32] border border-slate-800 text-left flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 animate-flame" />
                7-Day Pilgrimage Streak
              </h3>
              <span className="text-xs font-bold text-orange-300">
                Day {profile.stats.dailyStreak} of 7
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Return daily to keep your pilgrimage fire burning and collect growing coin bounties.
            </p>
          </div>

          {/* 7-DAY PILLS */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const isClaimed = dayNum <= profile.stats.dailyStreak;
              const isToday = dayNum === profile.stats.dailyStreak;

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isToday
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-300'
                      : isClaimed
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[9px] font-bold block leading-none">D{dayNum}</span>
                  <div className="my-1 flex justify-center">
                    {isClaimed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Flame className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[8px] font-mono block">+{dayNum * 25}🪙</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8 GAME MODES GRID */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-lg font-black text-white">Playable Game Modes</h3>
            <p className="text-xs text-slate-400">Choose a game mode to train specific Scripture skills.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {gameModesList.map((mode) => {
            const IconComp = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => onStartMode(mode.id)}
                className="p-5 rounded-2xl border border-slate-700/80 bg-[#131d33] hover:border-amber-400/60 hover:bg-[#182645] transition-all cursor-pointer shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mode.color} flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {mode.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white leading-tight">{mode.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">{mode.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-amber-400 group-hover:text-amber-300">
                  <span>Start Match</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
