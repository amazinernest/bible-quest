'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { MASTER_CODEX } from '@/lib/codex';
import { CodexEntry } from '@/types/game';
import { BookOpen, Scroll, Sparkles, Lock, MapPin, Languages, Compass, ArrowRight } from 'lucide-react';

export default function CodexView() {
  const { profile } = useGame();
  const [selectedEntry, setSelectedEntry] = useState<CodexEntry>(MASTER_CODEX[0]);

  // Unlock codex entries based on stages completed or levels reached
  const unlockedEntries = MASTER_CODEX.map((entry, idx) => ({
    ...entry,
    unlocked: idx === 0 || profile.stats.stagesCompleted >= idx * 2 || profile.unlockedCodexIds.includes(entry.id),
  }));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100">
      {/* HEADER */}
      <div className="game-panel rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden border border-amber-500/30">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
          <BookOpen className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          SCRIPTURE <span className="gold-gradient-text">LORE CODEX</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Historical, linguistic, and archaeological insights unlocked through your pilgrimage progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CODEX SCROLL LIST */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider text-left px-1">
            Manuscript Library ({unlockedEntries.filter((e) => e.unlocked).length}/{unlockedEntries.length} Unlocked)
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {unlockedEntries.map((entry) => {
              const isSelected = selectedEntry.id === entry.id;

              return (
                <button
                  key={entry.id}
                  disabled={!entry.unlocked}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : entry.unlocked
                      ? 'bg-[#121c32] hover:bg-[#182645] border-slate-800'
                      : 'bg-slate-950/60 border-slate-900 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {entry.unlocked ? <Scroll className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-400/80 block uppercase leading-none mb-1">
                      {entry.book}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug truncate">
                      {entry.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                      {entry.unlocked ? entry.era : 'Complete more stages to unseal'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CODEX DETAILED READER */}
        <div className="md:col-span-2 parchment-panel rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-2xl relative">
          <div className="border-b border-[#d4c5a9] pb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/10 text-amber-900 border border-amber-900/20">
                {selectedEntry.book} • {selectedEntry.era}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-tight">
              {selectedEntry.title}
            </h2>
            <p className="text-xs font-serif italic text-amber-900 font-bold mt-0.5">
              {selectedEntry.subtitle}
            </p>
          </div>

          {/* HISTORICAL SUMMARY */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 font-serif">
              <BookOpen className="w-4 h-4 text-amber-800" />
              Scripture Context & Narrative
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed">
              {selectedEntry.summary}
            </p>
          </div>

          {/* HEBREW & GREEK ROOT WORDS */}
          <div className="p-3.5 rounded-2xl bg-amber-950/10 border border-amber-900/20 space-y-1">
            <h4 className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-amber-800" />
              Hebrew / Greek Linguistic Insight
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-serif">
              {selectedEntry.hebrewGreekInsight}
            </p>
          </div>

          {/* ARCHAEOLOGICAL DISCOVERY */}
          <div className="p-3.5 rounded-2xl bg-amber-900/5 border border-amber-900/20 space-y-1">
            <h4 className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-800" />
              Archaeological Confirmation
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-serif">
              {selectedEntry.archaeologyFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
