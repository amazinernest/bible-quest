'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Volume2, VolumeX, Music, RotateCcw, X, Sparkles, BookOpen } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    profile,
    updateProfile,
    toggleSound,
    toggleMusic,
    setSoundVolume,
    setMusicVolume,
    resetAllProgress,
  } = useGame();

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const translations = ['NIV', 'ESV', 'KJV', 'CSB', 'NLT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#16233d] to-[#0c1322] rounded-2xl border border-amber-500/30 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Game Settings
        </h3>

        <div className="space-y-6">
          {/* AUDIO CONTROLS */}
          <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Sound & Music</h4>

            {/* Sound FX */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                {profile.isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Sound FX</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={profile.soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  disabled={!profile.isSoundEnabled}
                  className="w-20 accent-amber-400"
                />
                <button
                  onClick={toggleSound}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    profile.isSoundEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {profile.isSoundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Music */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Music className="w-4 h-4 text-emerald-400" />
                <span>Ambient Music</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={profile.musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  disabled={!profile.isMusicEnabled}
                  className="w-20 accent-amber-400"
                />
                <button
                  onClick={toggleMusic}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    profile.isMusicEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {profile.isMusicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* SCRIPTURE TRANSLATION */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Preferred Bible Translation
            </h4>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {translations.map((trans) => (
                <button
                  key={trans}
                  onClick={() => updateProfile({ selectedTranslation: trans })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                    profile.selectedTranslation === trans
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {trans}
                </button>
              ))}
            </div>
          </div>

          {/* RESET PROGRESS */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Local Progress
              </button>
            ) : (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl space-y-2 text-center">
                <p className="text-xs text-red-200 font-bold">Are you sure? This erases all stars, level progress, and coins.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetAllProgress();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white font-bold"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
