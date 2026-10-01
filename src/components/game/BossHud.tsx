'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Shield, Zap, Skull, Heart, Sword, Flame } from 'lucide-react';

export default function BossHud() {
  const { activeRound } = useGame();
  const boss = activeRound?.bossState;

  if (!boss) return null;

  const bossHpRatio = Math.max(0, boss.bossCurrentHp / boss.bossMaxHp);
  const playerHpRatio = Math.max(0, boss.playerCurrentHp / boss.playerMaxHp);

  return (
    <div className="w-full bg-[#0d1424] border-2 border-red-500/50 rounded-2xl p-4 shadow-2xl space-y-3 animate-fade-in relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* BOSS & PLAYER HEALTH BARS */}
      <div className="grid grid-cols-2 gap-4">
        {/* PLAYER SIDE */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Pilgrim
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {boss.playerCurrentHp}/{boss.playerMaxHp} HP
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${playerHpRatio * 100}%` }}
            />
          </div>
        </div>

        {/* BOSS SIDE */}
        <div className="space-y-1.5 text-right">
          <div className="flex items-center justify-between flex-row-reverse">
            <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1">
              <Skull className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              {boss.bossName}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {boss.bossCurrentHp}/{boss.bossMaxHp} HP
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-red-950 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-300 shadow-md shadow-red-500/50"
              style={{ width: `${bossHpRatio * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* BOSS DIALOGUE / COMBAT LOG */}
      <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-center">
        <p className="text-xs font-serif italic text-red-200">
          “{boss.bossDialogue || 'Who is this that comes against me in the name of the Lord?'}”
        </p>
      </div>
    </div>
  );
}
