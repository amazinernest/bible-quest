'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Trophy, Star, Sparkles, Flame, RotateCcw, ArrowRight, Share2, Award, HeartHandshake } from 'lucide-react';

interface RoundResultsProps {
  onPlayAgain: () => void;
  onContinue: () => void;
  onShare: () => void;
}

export default function RoundResults({ onPlayAgain, onContinue, onShare }: RoundResultsProps) {
  const { activeRound, profile } = useGame();
  if (!activeRound) return null;

  const totalQ = activeRound.questions.length;
  const correct = activeRound.correctCount;
  const accuracy = Math.round((correct / (totalQ || 1)) * 100);
  const stars = activeRound.earnedStars;

  const scriptureEncouragements = [
    { text: '“Let the word of Christ dwell in you richly.”', ref: 'Colossians 3:16' },
    { text: '“Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.”', ref: '2 Timothy 2:15' },
    { text: '“I have hidden your word in my heart that I might not sin against you.”', ref: 'Psalm 119:11' },
    { text: '“Man shall not live on bread alone, but on every word that comes from the mouth of God.”', ref: 'Matthew 4:4' },
  ];
  const quote = scriptureEncouragements[Math.floor(Math.random() * scriptureEncouragements.length)];

  return (
    <div className="w-full max-w-lg mx-auto game-panel rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-pop shadow-2xl border-2 border-amber-500/40 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER CREST */}
      <div className="space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-200">
          <Trophy className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          {stars === 3 ? 'TRIUMPHANT VICTORY!' : stars >= 1 ? 'WELL DONE, PILGRIM!' : 'STAGE COMPLETED'}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-amber-300">
          {activeRound.stageTitle || 'Word Quest Arena'}
        </p>
      </div>

      {/* STARS RATING */}
      <div className="flex items-center justify-center gap-3 py-1">
        {[1, 2, 3].map((starIdx) => {
          const isEarned = starIdx <= stars;
          return (
            <div
              key={starIdx}
              className={`transition-all transform duration-500 ${
                isEarned ? 'scale-110 text-amber-400 animate-pop' : 'scale-90 text-slate-700 opacity-40'
              }`}
            >
              <Star className={`w-10 h-10 sm:w-12 sm:h-12 ${isEarned ? 'fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''}`} />
            </div>
          );
        })}
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Score */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Score</span>
          <span className="text-base sm:text-lg font-black text-white">{activeRound.score.toLocaleString()}</span>
        </div>

        {/* XP Gained */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 text-center">
          <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> XP
          </span>
          <span className="text-base sm:text-lg font-black text-amber-300">+{activeRound.gainedXp}</span>
        </div>

        {/* Coins Gained */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-yellow-500/30 text-center">
          <span className="text-[10px] font-bold uppercase text-yellow-400 flex items-center justify-center gap-1">
            🪙 Coins
          </span>
          <span className="text-base sm:text-lg font-black text-yellow-300">+{activeRound.gainedCoins}</span>
        </div>

        {/* Accuracy */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
          <span className="text-base sm:text-lg font-black text-emerald-400">{accuracy}%</span>
        </div>
      </div>

      {/* STREAK & CORRECT BREAKDOWN */}
      <div className="flex items-center justify-around p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400 animate-flame" />
          <span>Best Streak: <strong className="text-white">{activeRound.roundStreakMax}</strong></span>
        </div>
        <div>
          <span>Correct Answers: <strong className="text-emerald-400">{correct}/{totalQ}</strong></span>
        </div>
      </div>

      {/* SCRIPTURE ENCOURAGEMENT */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-left space-y-1">
        <p className="text-xs font-serif italic text-amber-100/90 leading-relaxed">
          {quote.text}
        </p>
        <span className="text-[10px] font-mono font-bold text-amber-400/80 block text-right">
          — {quote.ref}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2 shadow-xl"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onPlayAgain}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Again
          </button>
          <button
            onClick={onShare}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/40 transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Challenge Friends
          </button>
        </div>
      </div>
    </div>
  );
}
