'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { MASTER_RELICS } from '@/lib/relics';
import { Relic } from '@/types/game';
import { Shield, Flame, Sparkles, Zap, Scroll, Music, Check, Lock, Star, Award } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

const RELIC_ICONS: Record<string, any> = {
  Shield,
  Flame,
  Sparkles,
  Zap,
  Scroll,
  Music,
};

const RARITY_COLORS: Record<string, { badge: string; border: string; bg: string }> = {
  rare: { badge: 'text-blue-400 bg-blue-950/60 border-blue-500/40', border: 'border-blue-500/40', bg: 'from-blue-950/30' },
  epic: { badge: 'text-purple-400 bg-purple-950/60 border-purple-500/40', border: 'border-purple-500/40', bg: 'from-purple-950/30' },
  legendary: { badge: 'text-amber-300 bg-amber-950/60 border-amber-500/50', border: 'border-amber-400/80', bg: 'from-amber-950/40' },
};

export default function RelicsSanctuary() {
  const { profile, updateProfile } = useGame();

  const handleEquipRelic = (relicId: string) => {
    audioEngine.playRelicEquip();
    updateProfile({
      equippedRelicId: profile.equippedRelicId === relicId ? null : relicId,
    });
  };

  const handleUnlockRelic = (relic: Relic) => {
    if (profile.wisdomCoins < relic.cost) return;

    audioEngine.playLevelComplete();
    updateProfile({
      wisdomCoins: profile.wisdomCoins - relic.cost,
      relics: { ...profile.relics, [relic.id]: true },
      equippedRelicId: relic.id, // Auto-equip newly acquired relic
    });
  };

  const equippedRelic = MASTER_RELICS.find((r) => r.id === profile.equippedRelicId);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER CREST */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-amber-500/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
          <Shield className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          DIVINE <span className="gold-gradient-text">RELICS SANCTUARY</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Equip sacred biblical artifacts to grant powerful passive perks during battle trials.
        </p>

        {/* ACTIVE LOADOUT SUMMARY */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              {equippedRelic ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5 text-slate-500" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 block">Equipped Relic Loadout</span>
              <h4 className="text-sm font-black text-white">
                {equippedRelic ? equippedRelic.name : 'No Relic Equipped'}
              </h4>
              <p className="text-xs text-slate-300">
                {equippedRelic ? equippedRelic.perkDescription : 'Select and equip an unlocked relic below.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>🪙 {profile.wisdomCoins.toLocaleString()} Coins Available</span>
          </div>
        </div>
      </div>

      {/* RELICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MASTER_RELICS.map((relic) => {
          const isUnlocked = !!profile.relics?.[relic.id];
          const isEquipped = profile.equippedRelicId === relic.id;
          const IconComp = RELIC_ICONS[relic.icon] || Shield;
          const rarity = RARITY_COLORS[relic.rarity] || RARITY_COLORS.rare;
          const canAfford = profile.wisdomCoins >= relic.cost;

          return (
            <div
              key={relic.id}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between space-y-4 shadow-lg transition-all ${
                isEquipped
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/30 to-[#131d33] ring-2 ring-amber-400/50'
                  : isUnlocked
                  ? `border-slate-700 bg-gradient-to-b ${rarity.bg} to-[#11192e]`
                  : 'border-slate-800/80 bg-slate-950/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-12 h-12 rounded-xl bg-slate-900 border flex items-center justify-center shadow-md ${
                      isUnlocked ? 'border-amber-400/60 text-amber-300' : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${rarity.badge}`}>
                    {relic.rarity}
                  </span>
                </div>

                <h3 className="text-base font-black text-white">{relic.name}</h3>
                <span className="text-[11px] font-bold text-amber-300/80 block">{relic.title}</span>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{relic.description}</p>

                {/* PASSIVE PERK BOX */}
                <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-slate-700/60 text-xs">
                  <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Passive Blessing:
                  </span>
                  <p className="text-slate-200 mt-0.5 font-medium">{relic.perkDescription}</p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                {!isUnlocked ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-amber-300">Cost: 🪙 {relic.cost}</span>
                    <button
                      onClick={() => handleUnlockRelic(relic)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                        canAfford
                          ? 'btn-game-primary text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Consecrate & Unlock' : 'Need Coins'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEquipRelic(relic.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                      isEquipped
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isEquipped ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                    {isEquipped ? 'EQUIPPED IN LOADOUT' : 'EQUIP RELIC'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
