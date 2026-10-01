'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, Flame, Trophy, Award, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let borderClass = 'border-blue-500/40';
        let bgClass = 'from-slate-900 to-blue-950/80';

        if (toast.type === 'xp') {
          icon = <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />;
          borderClass = 'border-amber-500/50';
          bgClass = 'from-slate-900 to-amber-950/80';
        } else if (toast.type === 'coin') {
          icon = <Sparkles className="w-5 h-5 text-yellow-300" />;
          borderClass = 'border-yellow-500/50';
          bgClass = 'from-slate-900 to-yellow-950/80';
        } else if (toast.type === 'achievement') {
          icon = <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />;
          borderClass = 'border-amber-400';
          bgClass = 'from-amber-950/90 to-slate-900';
        } else if (toast.type === 'level_up') {
          icon = <Award className="w-6 h-6 text-emerald-400 animate-pulse" />;
          borderClass = 'border-emerald-500';
          bgClass = 'from-emerald-950/90 to-slate-900';
        } else if (toast.type === 'streak') {
          icon = <Flame className="w-6 h-6 text-orange-400 animate-flame" />;
          borderClass = 'border-orange-500';
          bgClass = 'from-orange-950/90 to-slate-900';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-gradient-to-r ${bgClass} ${borderClass} shadow-2xl backdrop-blur-md animate-pop text-left`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-wide">{toast.title}</h4>
              {toast.subtitle && <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.subtitle}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
