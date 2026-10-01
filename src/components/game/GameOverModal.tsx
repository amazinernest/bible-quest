'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Heart, RotateCcw, ShoppingBag, Sparkles, X, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  onQuit: () => void;
  onRetryPractice: () => void;
  onGoToShop: () => void;
}

export default function GameOverModal({ onQuit, onRetryPractice, onGoToShop }: GameOverModalProps) {
  const { activeRound, profile, buyShopItem } = useGame();

  if (!activeRound?.isGameOver) return null;

  const handleRefillLives = () => {
    if (buyShopItem('refill_lives', 100)) {
      // Continue round
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md game-panel rounded-3xl p-6 sm:p-8 text-center space-y-6 border-2 border-red-500/50 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/20">
          <Heart className="w-8 h-8 fill-red-500 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white tracking-wide">Out of Lives!</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Your hearts have run out for this round, but your journey and progress are safe.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-left text-xs">
          <div className="flex justify-between font-bold text-slate-300">
            <span>Score Achieved:</span>
            <span className="text-amber-400 font-black">{activeRound.score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-300">
            <span>Correct Answers:</span>
            <span className="text-emerald-400 font-black">{activeRound.correctCount}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {profile.wisdomCoins >= 100 ? (
            <button
              onClick={handleRefillLives}
              className="w-full py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              Restore Lives (100 🪙)
            </button>
          ) : (
            <button
              onClick={onGoToShop}
              className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Visit Wisdom Sanctuary
            </button>
          )}

          <button
            onClick={onRetryPractice}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry in Practice Mode (Infinite Lives)
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
          >
            Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
}
