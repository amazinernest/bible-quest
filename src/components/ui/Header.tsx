'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { getLevelFromXp } from '@/lib/gameEngine';
import {
  Heart,
  Flame,
  Volume2,
  VolumeX,
  Music,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Compass,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  openSettings: () => void;
}

export default function Header({ currentView, setCurrentView, openSettings }: HeaderProps) {
  const { profile, toggleSound, toggleMusic } = useGame();
  const levelInfo = getLevelFromXp(profile.xp);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1224]/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* LOGO & BRAND */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 group text-left transition hover:opacity-90 shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">
                WORD <span className="text-amber-400">QUEST</span>
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-amber-200/70 font-medium hidden sm:block">
              “How well do you know the Word?”
            </p>
          </div>
        </button>

        {/* DESKTOP NAV TABS */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131d35] p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Home
          </button>
          <button
            onClick={() => setCurrentView('journey')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'journey'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Journey Map
          </button>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
          <button
            onClick={() => setCurrentView('shop')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              currentView === 'shop'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Sanctuary
          </button>
        </nav>

        {/* STATUS HUD & BADGES */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* LIVES */}
          <button
            onClick={() => setCurrentView('shop')}
            title="Lives remaining. Click to refill in Sanctuary."
            className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 px-2.5 py-1.5 rounded-xl hover:bg-red-900/40 transition shadow-inner"
          >
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-xs font-extrabold text-red-300">
              {profile.lives}
              <span className="text-red-400/60 font-medium">/{profile.maxLives}</span>
            </span>
          </button>

          {/* WISDOM COINS */}
          <button
            onClick={() => setCurrentView('shop')}
            title="Wisdom Coins. Click to open Sanctuary Shop."
            className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1.5 rounded-xl hover:bg-amber-900/40 transition shadow-inner"
          >
            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-sm">
              🪙
            </div>
            <span className="text-xs font-black text-amber-300">{profile.wisdomCoins.toLocaleString()}</span>
          </button>

          {/* STREAK */}
          {profile.stats.currentStreak > 0 && (
            <div
              title={`${profile.stats.currentStreak} answers in a row!`}
              className="hidden sm:flex items-center gap-1 bg-orange-950/40 border border-orange-500/50 px-2.5 py-1.5 rounded-xl animate-flame"
            >
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-xs font-extrabold text-orange-300">{profile.stats.currentStreak}</span>
            </div>
          )}

          {/* LEVEL BADGE */}
          <button
            onClick={() => setCurrentView('profile')}
            className="flex items-center gap-2 bg-[#17233f] border border-slate-700/80 px-2.5 py-1.5 rounded-xl hover:border-amber-400 transition"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow">
              {levelInfo.level}
            </div>
            <div className="hidden lg:flex flex-col items-start text-left">
              <span className="text-[10px] font-bold text-slate-200 leading-none">{profile.displayName}</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* AUDIO CONTROLS */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              title={profile.isSoundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/50"
            >
              {profile.isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={toggleMusic}
              title={profile.isMusicEnabled ? 'Stop Ambient Music' : 'Play Ambient Music'}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/50 hidden sm:block"
            >
              <Music className={`w-4 h-4 ${profile.isMusicEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            </button>
          </div>

          {/* SETTINGS / ADMIN */}
          <button
            onClick={openSettings}
            title="Game Settings"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/50"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
