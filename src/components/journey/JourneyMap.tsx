'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { Level, Stage } from '@/types/game';
import {
  Sparkles,
  Flame,
  Crown,
  Scroll,
  BookOpen,
  Sun,
  Mail,
  ShieldAlert,
  Trophy,
  Star,
  Lock,
  Play,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';

const LEVEL_ICONS: Record<string, any> = {
  Sparkles,
  Flame,
  Crown,
  Scroll,
  BookOpen,
  Sun,
  Mail,
  ShieldAlert,
  Trophy,
};

const MODE_ICONS: Record<string, any> = {
  blitz: Sparkles,
  who_am_i: HelpCircle,
  bible_or_not: CheckCircle,
  verse_match: Scroll,
  who_said_it: BookOpen,
  timeline: Clock,
  sort: Layers,
  daily: Flame,
};

export default function JourneyMap() {
  const { profile, startStageRound } = useGame();
  const [selectedLevelId, setSelectedLevelId] = useState<number>(profile.unlockedLevels[profile.unlockedLevels.length - 1] || 1);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const selectedLevel = LEVELS_CONFIG.find((l) => l.id === selectedLevelId) || LEVELS_CONFIG[0];
  const IconComponent = LEVEL_ICONS[selectedLevel.iconName] || Sparkles;

  const totalEarnedStars = Object.values(profile.stageProgress).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  const handleLaunchStage = (levelNum: number, stage: Stage, isPractice: boolean = false) => {
    setSelectedStage(null);
    startStageRound(levelNum, stage.stageNumber, isPractice);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* JOURNEY HERO CREST & STATS */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-200 shrink-0">
              <IconComponent className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Level {selectedLevel.levelNumber} of 10
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {selectedLevel.bookCoverage}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">
                {selectedLevel.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {selectedLevel.theme} • <span className="text-amber-200/70 font-mono">{selectedLevel.era}</span>
              </p>
            </div>
          </div>

          {/* STARS TOTAL */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-inner shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pop" />
            <div className="text-left">
              <span className="text-[9px] font-bold uppercase text-amber-300/80 block leading-none">Total Stars</span>
              <span className="text-base font-black text-white leading-tight">{totalEarnedStars} ⭐</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed text-left border-t border-slate-700/60 pt-3">
          {selectedLevel.description}
        </p>
      </div>

      {/* 10-LEVEL SELECTOR TABS / CAROUSEL */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider text-left px-1">
          Select Journey Chapter (10 Levels)
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LEVELS_CONFIG.map((lvl) => {
            const isUnlocked = profile.unlockedLevels.includes(lvl.levelNumber);
            const isSelected = selectedLevelId === lvl.id;
            const LvlIcon = LEVEL_ICONS[lvl.iconName] || Sparkles;

            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevelId(lvl.id)}
                disabled={!isUnlocked}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-amber-200 shadow-lg shadow-amber-500/20 scale-105'
                    : isUnlocked
                    ? 'bg-[#15233c] hover:bg-[#1f3357] text-slate-200 border-slate-700 hover:border-slate-500 font-bold'
                    : 'bg-slate-900/50 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isUnlocked ? <LvlIcon className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-[10px] block leading-none uppercase opacity-80">
                    Lvl {lvl.levelNumber}
                  </span>
                  <span className="text-xs truncate max-w-[110px] block leading-tight font-extrabold">
                    {lvl.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE PATH / NODES MAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider">
            {selectedLevel.title} — Stage Trials
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {selectedLevel.stages.length} Stages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {selectedLevel.stages.map((stage) => {
            const stageId = `${selectedLevel.levelNumber}-${stage.stageNumber}`;
            const isUnlocked = profile.unlockedStages.includes(stageId);
            const progress = profile.stageProgress[stageId];
            const stars = progress?.stars || 0;
            const ModeIcon = MODE_ICONS[stage.gameMode] || Sparkles;

            return (
              <div
                key={stage.id}
                onClick={() => isUnlocked && setSelectedStage(stage)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                  stage.isBossStage
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/30 to-[#121c32] shadow-lg shadow-amber-500/10'
                    : isUnlocked
                    ? 'border-slate-700 hover:border-amber-400/60 bg-[#131d33] hover:bg-[#192745] cursor-pointer shadow-md'
                    : 'border-slate-800/80 bg-slate-950/60 opacity-50 cursor-not-allowed'
                }`}
              >
                {stage.isBossStage && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                    Apex Master Trial
                  </div>
                )}

                {/* TOP ROW: Stage Number, Mode Icon, Locked State */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center justify-center">
                      {stage.stageNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <ModeIcon className="w-3 h-3 text-amber-400" />
                      {stage.gameMode.replace('_', ' ')}
                    </span>
                  </div>

                  {!isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : progress?.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : null}
                </div>

                {/* TITLE & DESCRIPTION */}
                <div className="my-2 space-y-1">
                  <h4 className="text-sm font-black text-white leading-snug">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-amber-200/80 font-medium leading-tight line-clamp-1">
                    {stage.subtitle}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-1">
                    {stage.description}
                  </p>
                </div>

                {/* BOTTOM ROW: Stars Earned & Play Trigger */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-2">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchStage(selectedLevel.levelNumber, stage);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] uppercase transition flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      Play
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE DETAILS MODAL / DIALOG */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md game-panel rounded-3xl p-6 sm:p-8 text-center space-y-6 border border-amber-500/40 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Level {selectedLevel.levelNumber} • Stage {selectedStage.stageNumber}
              </span>
              <h3 className="text-2xl font-black text-white">{selectedStage.title}</h3>
              <p className="text-xs font-bold text-amber-200/80 font-serif italic">
                {selectedStage.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedStage.description}
            </p>

            {/* STAGE REWARDS & STATS */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Questions</span>
                <span className="text-sm font-black text-white">{selectedStage.questionCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
                <span className="text-[9px] font-bold uppercase text-amber-400 block">+XP</span>
                <span className="text-sm font-black text-amber-300">+{selectedStage.xpReward}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-yellow-500/30">
                <span className="text-[9px] font-bold uppercase text-yellow-400 block">Coins</span>
                <span className="text-sm font-black text-yellow-300">+{selectedStage.coinReward}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleLaunchStage(selectedLevel.levelNumber, selectedStage, false)}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2 shadow-xl"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Start Challenge
              </button>

              <button
                onClick={() => handleLaunchStage(selectedLevel.levelNumber, selectedStage, true)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Practice Mode (No Life Loss)
              </button>

              <button
                onClick={() => setSelectedStage(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
