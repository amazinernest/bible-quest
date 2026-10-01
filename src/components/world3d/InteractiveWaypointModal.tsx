'use client';

import React from 'react';
import { HolyWaypoint } from './worldBuilder';
import { Sparkles, Play, BookOpen, X, Trophy, Shield, Zap } from 'lucide-react';
import { GameMode } from '@/types/game';

interface InteractiveWaypointModalProps {
  waypoint: HolyWaypoint | null;
  onClose: () => void;
  onEnterChallenge: (waypoint: HolyWaypoint) => void;
}

export default function InteractiveWaypointModal({
  waypoint,
  onClose,
  onEnterChallenge,
}: InteractiveWaypointModalProps) {
  if (!waypoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg game-panel rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-amber-500/60 shadow-2xl overflow-hidden text-center text-slate-100">
        {/* Glow backdrop */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: `#${waypoint.color.toString(16)}` }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Badge */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-3xl flex items-center justify-center shadow-xl shadow-amber-500/30 border border-amber-300">
            {waypoint.icon}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Sacred Site Discovered
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight">
            {waypoint.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {waypoint.subtitle}
          </p>
        </div>

        {/* DETAILS INFO CARD */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
          {waypoint.specialAction ? (
            <div className="text-xs text-slate-300 font-medium">
              {waypoint.specialAction === 'wheel' && 'Spin the 3D Fortune Obelisk to claim daily blessings, XP boosts, and Wisdom Coins!'}
              {waypoint.specialAction === 'relics' && 'Consecrate biblical relics (Shield of Faith, Trumpet of Gideon) to activate passive perks in all trials.'}
              {waypoint.specialAction === 'arcade' && 'Engage in a 60-second high-speed blitz. Correct answers add +3s, errors deduct -5s.'}
              {waypoint.specialAction === 'codex' && 'Examine ancient biblical manuscripts, archaeological discoveries, and Greek & Hebrew linguistic insights.'}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Mode Category:</span>
                <span className="text-amber-400 font-black uppercase">{waypoint.mode.replace('_', ' ')}</span>
              </div>
              {waypoint.levelNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Journey Target:</span>
                  <span className="text-white font-bold">
                    Level {waypoint.levelNumber} - Stage {waypoint.stageNumber}
                  </span>
                </div>
              )}
              {waypoint.bossStage && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs font-black text-red-300">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span>Boss Encounter: High Stakes Scripture Trial!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2.5">
          <button
            onClick={() => onEnterChallenge(waypoint)}
            className="w-full py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {waypoint.specialAction === 'wheel'
              ? 'OPEN WHEEL OF PROVIDENCE'
              : waypoint.specialAction === 'relics'
              ? 'ENTER RELICS SANCTUARY'
              : waypoint.specialAction === 'arcade'
              ? 'START SPEED RUSH TRIAL'
              : waypoint.specialAction === 'codex'
              ? 'OPEN SCRIPTURE CODEX'
              : 'ENTER SACRED TRIAL'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Keep Driving & Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
