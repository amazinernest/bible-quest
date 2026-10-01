'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import { ArrowLeft, Sparkles, Trophy, Flame, Music, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingNote {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // 0 to 100
  hit: boolean;
}

export default function JerichoRhythm({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();
  const [wallHealth, setWallHealth] = useState<number>(100);
  const [combo, setCombo] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [notes, setNotes] = useState<FallingNote[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextNoteId = useRef<number>(1);

  // Note generation loop
  useEffect(() => {
    if (!isPlaying || isWon) return;

    const noteSpawner = setInterval(() => {
      const lane = Math.floor(Math.random() * 3);
      setNotes((prev) => [
        ...prev,
        { id: nextNoteId.current++, lane, y: 0, hit: false },
      ]);
    }, 800);

    return () => clearInterval(noteSpawner);
  }, [isPlaying, isWon]);

  // Note movement loop
  useEffect(() => {
    if (!isPlaying || isWon) return;

    const gameLoop = setInterval(() => {
      setNotes((prev) =>
        prev
          .map((n) => ({ ...n, y: n.y + 2.5 }))
          .filter((n) => {
            if (n.y > 105 && !n.hit) {
              setCombo(0);
              return false;
            }
            return n.y <= 110 && !n.hit;
          })
      );
    }, 30);

    return () => clearInterval(gameLoop);
  }, [isPlaying, isWon]);

  const handleTapLane = (laneIdx: number) => {
    if (!isPlaying || isWon) return;

    // Find note closest to strike zone (y between 75 and 95)
    const targetNote = notes.find(
      (n) => n.lane === laneIdx && !n.hit && n.y >= 70 && n.y <= 98
    );

    if (targetNote) {
      // Perfect or Good hit!
      const isPerfect = targetNote.y >= 80 && targetNote.y <= 92;
      const dmg = isPerfect ? 8 : 5;
      const pts = isPerfect ? 200 : 100;
      const nextCombo = combo + 1;

      audioEngine.playCorrect(nextCombo);
      setCombo(nextCombo);
      setScore((s) => s + pts);
      setFeedback(isPerfect ? '⭐ PERFECT SHOFAR BLAST!' : '👍 GOOD BLAST!');

      // Damage the wall!
      setWallHealth((h) => {
        const nextH = Math.max(0, h - dmg);
        if (nextH <= 0 && !isWon) {
          setIsWon(true);
          audioEngine.playLevelComplete();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          updateProfile({
            wisdomCoins: profile.wisdomCoins + 300,
            xp: profile.xp + 600,
          });
        }
        return nextH;
      });

      // Mark note hit
      setNotes((prev) =>
        prev.map((n) => (n.id === targetNote.id ? { ...n, hit: true } : n))
      );

      setTimeout(() => setFeedback(null), 400);
    } else {
      audioEngine.playWrong();
      setCombo(0);
      setFeedback('MISS!');
      setTimeout(() => setFeedback(null), 300);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-4 animate-fade-in text-slate-100 text-center">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
            Rhythm & Timing Trial
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            JERICHO TRUMPET BLAST
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            Score: {score}
          </div>
        </div>
      </div>

      {/* WALL COLLAPSE PROGRESS BAR */}
      <div className="game-panel rounded-2xl p-4 text-left space-y-2 border border-amber-500/30">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300 uppercase flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            Walls of Jericho Integrity
          </span>
          <span className={`font-mono ${wallHealth <= 25 ? 'text-emerald-400 animate-pulse' : 'text-amber-300'}`}>
            {wallHealth}%
          </span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-950 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-300 ${
              wallHealth <= 30
                ? 'bg-gradient-to-r from-red-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${wallHealth}%` }}
          />
        </div>
      </div>

      {/* RHYTHM TRACK (3 LANES) */}
      <div className="relative w-full max-w-md mx-auto h-[400px] rounded-3xl bg-gradient-to-b from-[#181124] via-[#101426] to-[#0a0d17] border-2 border-amber-500/50 shadow-2xl overflow-hidden flex flex-col justify-between p-3 select-none">
        {/* Combo Badge */}
        {combo >= 3 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-full text-xs animate-pop shadow-lg">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>{combo} COMBO!</span>
          </div>
        )}

        {/* Floating Feedback */}
        {feedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-xs font-black uppercase text-amber-300 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-400/50 animate-pop">
            {feedback}
          </div>
        )}

        {/* 3 Falling Lanes Area */}
        <div className="relative w-full h-[290px] grid grid-cols-3 border-b-2 border-dashed border-amber-400/40">
          {[0, 1, 2].map((laneIdx) => (
            <div key={laneIdx} className="border-r last:border-r-0 border-slate-800/80 relative">
              {/* Strike zone ring */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-12 rounded-2xl border-2 border-amber-400/60 bg-amber-500/10 pointer-events-none animate-pulse" />

              {/* Falling Notes in this lane */}
              {notes
                .filter((n) => n.lane === laneIdx && !n.hit)
                .map((n) => (
                  <div
                    key={n.id}
                    style={{ top: `${n.y}%` }}
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center text-lg shadow-xl shadow-amber-400/40 pointer-events-none"
                  >
                    🎺
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* 3 SHOFAR TAP BUTTONS */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[0, 1, 2].map((laneIdx) => (
            <button
              key={laneIdx}
              onClick={() => handleTapLane(laneIdx)}
              className="py-4 rounded-2xl bg-gradient-to-t from-slate-900 to-slate-800 hover:from-amber-600 hover:to-amber-400 active:scale-95 border-2 border-amber-500/60 text-white font-black text-sm uppercase shadow-xl flex flex-col items-center justify-center gap-1 transition-all"
            >
              <Music className="w-5 h-5 text-amber-400" />
              <span>BLAST</span>
            </button>
          ))}
        </div>

        {/* VICTORY MODAL */}
        {isWon && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pop z-30">
            <div className="text-5xl">🏰💥</div>
            <h3 className="text-2xl font-black text-white">THE WALLS CAME TUMBLING DOWN!</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Faith and perseverance crumbled the fortress of Jericho. Claimed <strong>+300 Coins</strong> and <strong>+600 XP</strong>!
            </p>
            <button
              onClick={onBack}
              className="py-3 px-8 rounded-xl font-black text-xs uppercase bg-amber-500 text-slate-950 shadow-xl"
            >
              Back to World Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
