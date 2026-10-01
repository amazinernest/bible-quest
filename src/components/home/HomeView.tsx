'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { GameMode } from '@/types/game';
import { MASTER_RELICS } from '@/lib/relics';
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
  Zap,
  Gift,
  Shield,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onStartMode: (mode: GameMode) => void;
  onOpenWheel?: () => void;
}

export default function HomeView({ onNavigate, onStartMode, onOpenWheel }: HomeViewProps) {
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
  const equippedRelic = MASTER_RELICS.find((r) => r.id === profile.equippedRelicId);
  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = profile.stats.lastSpinDate === todayStr;

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
              onClick={() => onNavigate('world3d')}
              className="py-3.5 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:scale-105 transition-all shadow-xl shadow-amber-500/30 flex items-center gap-2 border border-yellow-200"
            >
              <span>🏎️</span>
              PLAY 3D WORLD
            </button>
            <button
              onClick={() => onNavigate('journey')}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
              Journey Map
            </button>
            <button
              onClick={() => onNavigate('arcade')}
              className="py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider bg-orange-600 hover:bg-orange-500 text-white border border-orange-400 transition flex items-center gap-2 shadow-lg"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              Speed Rush
            </button>
          </div>
        </div>
      </div>

      {/* 3D SANDBOX WORLD SHOWCASE BANNER */}
      <div
        onClick={() => onNavigate('world3d')}
        className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#152342] to-[#1e1435] border-2 border-amber-400/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 text-left cursor-pointer hover:border-amber-300 transition-all group overflow-hidden relative"
      >
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            3D Physics Sandbox • Inspired by Bruno Simon
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
            DRIVE THE CHARIOT OF FIRE IN 3D!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Drive freely across Mount Sinai, smash through the physical Walls of Jericho, cruise through the parted Red Sea, collect golden shekels, and uncover hidden biblical lore shrines.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <button className="py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary flex items-center gap-2 shadow-xl group-hover:scale-105 transition-transform">
            <span>ENTER 3D WORLD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SPECIAL FEATURE HUBS (Wheel, Speed Rush, Relics, Codex) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Daily Wheel */}
        <div
          onClick={onOpenWheel}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-[#121c33] border border-amber-500/40 hover:border-amber-400 transition cursor-pointer shadow-md flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            {!hasSpunToday ? (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                Ready!
              </span>
            ) : (
              <span className="text-[9px] font-mono text-slate-500">Spun</span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Daily Wheel</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Free blessing spin</p>
          </div>
        </div>

        {/* Speed Rush */}
        <div
          onClick={() => onNavigate('arcade')}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-950/40 to-[#121c33] border border-orange-500/40 hover:border-orange-400 transition cursor-pointer shadow-md flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/50 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
              60s
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Speed Rush</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">High-speed gauntlet</p>
          </div>
        </div>

        {/* Relics Sanctuary */}
        <div
          onClick={() => onNavigate('relics')}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#121c33] border border-purple-500/40 hover:border-purple-400 transition cursor-pointer shadow-md flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Perks
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Holy Relics</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{equippedRelic ? equippedRelic.name : 'Equip perks'}</p>
          </div>
        </div>

        {/* Codex Lore */}
        <div
          onClick={() => onNavigate('codex')}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#121c33] border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer shadow-md flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Lore
            </span>
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Lore Codex</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Linguistics & archaeology</p>
          </div>
        </div>
      </div>

      {/* CONTINUE JOURNEY BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#172646] to-[#121c32] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Continue Where You Left Off
            </span>
            {activeStageDef.isBossStage && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                Boss Battle
              </span>
            )}
          </div>
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
