'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { ShoppingBag, Zap, Clock, HelpCircle, Heart, Shield, Sparkles, Check } from 'lucide-react';

export default function SanctuaryShop() {
  const { profile, buyShopItem } = useGame();

  const shopItems = [
    {
      id: 'refill_lives',
      title: 'Full Life Restoration',
      description: 'Instantly restore all 5 player hearts to jump straight back into battle.',
      icon: Heart,
      iconColor: 'text-red-400 bg-red-950/60 border-red-500/50',
      cost: 100,
      currentCount: profile.lives,
      countLabel: `${profile.lives}/${profile.maxLives} Hearts`,
      canBuyMultiple: false,
    },
    {
      id: 'fiftyFifty',
      title: '50/50 Wisdom Strike',
      description: 'Strips away two incorrect answers in multiple choice and verse matching questions.',
      icon: Zap,
      iconColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/50',
      cost: 50,
      currentCount: profile.inventory.fiftyFifty,
      countLabel: `${profile.inventory.fiftyFifty} Owned`,
      canBuyMultiple: true,
    },
    {
      id: 'clueReveal',
      title: 'Prophetic Clue Scroll',
      description: 'Reveals an extra hidden clue in "Who Am I?" detective challenges without penalty.',
      icon: HelpCircle,
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-500/50',
      cost: 100,
      currentCount: profile.inventory.clueReveal,
      countLabel: `${profile.inventory.clueReveal} Owned`,
      canBuyMultiple: true,
    },
    {
      id: 'timeFreeze',
      title: 'Hourglass of Joshua',
      description: 'Adds +15 seconds to the countdown timer during intense speed challenges.',
      icon: Clock,
      iconColor: 'text-blue-400 bg-blue-950/60 border-blue-500/50',
      cost: 150,
      currentCount: profile.inventory.timeFreeze,
      countLabel: `${profile.inventory.timeFreeze} Owned`,
      canBuyMultiple: true,
    },
    {
      id: 'secondChance',
      title: 'Shield of Faith',
      description: 'Protects your life and streak from 1 incorrect answer during high-stakes stages.',
      icon: Shield,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50',
      cost: 200,
      currentCount: profile.inventory.secondChance,
      countLabel: `${profile.inventory.secondChance} Owned`,
      canBuyMultiple: true,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER CREST */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-amber-500/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
          <ShoppingBag className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          WISDOM <span className="gold-gradient-text">SANCTUARY</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Invest your earned Wisdom Coins into sacred aids, time boosts, and heart restorations.
        </p>

        {/* COIN BALANCE DISPLAY */}
        <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border-2 border-amber-400/80 px-5 py-2.5 rounded-2xl shadow-xl mt-5">
          <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center text-xs font-black text-slate-950">
            🪙
          </div>
          <div className="text-left">
            <span className="text-[9px] font-bold uppercase text-amber-300/80 block leading-none">Your Wisdom Coins</span>
            <span className="text-lg font-black text-white leading-tight">{profile.wisdomCoins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {shopItems.map((item) => {
          const IconComp = item.icon;
          const canAfford = profile.wisdomCoins >= item.cost;
          const isMaxHearts = item.id === 'refill_lives' && profile.lives >= profile.maxLives;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-700 bg-[#131d33] hover:border-amber-400/60 transition-all flex flex-col justify-between shadow-md text-left space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-md ${item.iconColor}`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {item.countLabel}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-snug">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-sm font-black text-amber-300">
                  <span>🪙 {item.cost}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Coins</span>
                </div>

                <button
                  onClick={() => buyShopItem(item.id as any, item.cost)}
                  disabled={!canAfford || isMaxHearts}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
                    isMaxHearts
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isMaxHearts ? 'Full Hearts' : canAfford ? 'Acquire' : 'Need Coins'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
