'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { GameMode } from '@/types/game';
import { encodeFriendChallenge } from '@/lib/gameEngine';
import { Share2, Copy, Check, Users, Sparkles, X } from 'lucide-react';

interface FriendChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  mode: GameMode;
}

export default function FriendChallengeModal({ isOpen, onClose, score, mode }: FriendChallengeModalProps) {
  const { profile } = useGame();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const challengeData = {
    challengerName: profile.displayName || 'Word Pilgrim',
    challengerAvatar: profile.avatar || 'Sparkles',
    challengerScore: score || 1500,
    challengerAccuracy: 85,
    gameMode: mode || 'blitz',
    levelId: 1,
    stageId: '1-1',
    seed: Math.random().toString(36).substring(2, 8),
    timestamp: Date.now(),
  };

  const token = encodeFriendChallenge(challengeData);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?challenge=${token}` : '';
  const shareText = `⚔️ ${profile.displayName} scored ${score.toLocaleString()} points in Word Quest! Can you beat this Bible score? Play now: ${shareUrl}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md game-panel rounded-3xl p-6 sm:p-8 text-center space-y-6 border border-amber-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Users className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white tracking-wide">Challenge a Friend</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Share this custom challenge link with your youth group, family, or friends!
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-400">Target to Beat</span>
          <p className="text-sm font-black text-white">
            {profile.displayName}: <span className="text-amber-300">{score.toLocaleString()} Points</span>
          </p>
        </div>

        {/* LINK BOX */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-slate-300 focus:outline-none px-2 font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
