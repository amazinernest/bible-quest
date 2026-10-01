'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { getComboMultiplier, getComboLabel } from '@/lib/gameEngine';
import { Heart, Flame, Clock, Zap, HelpCircle, Shield, X, AlertCircle } from 'lucide-react';

interface ArenaHeaderProps {
  onQuit: () => void;
}

export default function ArenaHeader({ onQuit }: ArenaHeaderProps) {
  const {
    profile,
    activeRound,
    useFiftyFifty,
    useTimeFreeze,
    useClueReveal,
  } = useGame();

  if (!activeRound) return null;

  const currentQ = activeRound.questions[activeRound.currentQuestionIndex];
  const totalQ = activeRound.questions.length;
  const progressRatio = (activeRound.currentQuestionIndex + 1) / totalQ;

  const comboMult = getComboMultiplier(activeRound.currentStreak);
  const comboLabel = getComboLabel(activeRound.currentStreak);

  const totalTime = currentQ?.timeLimit || 15;
  const timeFraction = Math.max(0, activeRound.timeRemaining / totalTime);
  const isLowTime = activeRound.timeRemaining <= 4;

  return (
    <div className="w-full space-y-3">
      {/* TOP ROW: Stage title, Quit button, Lives, and Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Stage Name / Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onQuit}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Leave Round"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              {activeRound.isDailyChallenge ? "Today's Daily Challenge" : activeRound.stageTitle || 'Battle Arena'}
            </span>
            <div className="text-xs font-bold text-slate-300">
              Question {activeRound.currentQuestionIndex + 1} of {totalQ}
            </div>
          </div>
        </div>

        {/* HUD STATS: Lives, Streak, Combo, Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* LIVES */}
          <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/40 px-2 py-1 rounded-lg">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="text-xs font-extrabold text-red-300">
              {activeRound.isPracticeMode ? '∞' : profile.lives}
            </span>
          </div>

          {/* STREAK & COMBO BADGE */}
          {activeRound.currentStreak >= 2 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 font-black px-2 py-1 rounded-lg text-xs shadow-md animate-pop">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>{comboMult}x</span>
            </div>
          )}

          {/* SCORE */}
          <div className="bg-[#17233f] border border-amber-500/30 px-3 py-1 rounded-lg text-right shadow-sm">
            <span className="text-[9px] font-bold uppercase text-amber-300/80 block leading-none">Score</span>
            <span className="text-xs sm:text-sm font-black text-white leading-tight">
              {activeRound.score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* QUESTION PROGRESS DOTS & TIMER BAR */}
      <div className="space-y-1.5">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>

        {/* TIMER BAR */}
        {activeRound.isTimerActive && (
          <div className="flex items-center gap-2">
            <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 linear ${
                  isLowTime ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-amber-400'
                }`}
                style={{ width: `${timeFraction * 100}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-bold ${
                isLowTime ? 'text-red-400 font-black animate-pulse' : 'text-slate-300'
              }`}
            >
              {activeRound.timeRemaining}s
            </span>
          </div>
        )}
      </div>

      {/* HINT POWERUPS TOOLBAR */}
      {!activeRound.isAnswerSubmitted && (
        <div className="flex items-center justify-end gap-2 pt-1">
          {/* 50/50 Strike (Available in MC / Fill / Quote) */}
          {(currentQ?.type === 'multiple_choice' || currentQ?.type === 'fill_blank' || currentQ?.type === 'quote') && (
            <button
              onClick={useFiftyFifty}
              disabled={activeRound.activeFiftyFiftyOptions.length > 0}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                activeRound.activeFiftyFiftyOptions.length > 0
                  ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                  : 'bg-[#15233c] hover:bg-[#1f3254] text-amber-300 border-amber-500/40 shadow-sm'
              }`}
              title="Remove two wrong answers (Cost: 50 Coins or 1 Item)"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>50/50</span>
              <span className="text-[9px] text-slate-400 ml-0.5">
                ({profile.inventory.fiftyFifty > 0 ? `${profile.inventory.fiftyFifty} left` : '50🪙'})
              </span>
            </button>
          )}

          {/* Reveal Clue (Who Am I) */}
          {currentQ?.type === 'clues' && activeRound.revealedCluesCount < 4 && (
            <button
              onClick={useClueReveal}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#15233c] hover:bg-[#1f3254] text-amber-300 border-amber-500/40 shadow-sm transition"
              title="Reveal Next Clue (Cost: 100 Coins or 1 Item)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Reveal Clue</span>
              <span className="text-[9px] text-slate-400 ml-0.5">
                ({profile.inventory.clueReveal > 0 ? `${profile.inventory.clueReveal} left` : '100🪙'})
              </span>
            </button>
          )}

          {/* +15s Time Freeze */}
          <button
            onClick={useTimeFreeze}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#15233c] hover:bg-[#1f3254] text-blue-300 border-blue-500/40 shadow-sm transition"
            title="Add +15 seconds to timer (Cost: 150 Coins or 1 Item)"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>+15s</span>
            <span className="text-[9px] text-slate-400 ml-0.5">
              ({profile.inventory.timeFreeze > 0 ? `${profile.inventory.timeFreeze} left` : '150🪙'})
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
