'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import { ArrowLeft, Sparkles, Clock, Flame, Shield, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GridTile {
  r: number;
  c: number;
  isWater: boolean;
  isPath: boolean;
  isObstacle: boolean;
  hasWordSeal: boolean;
  word: string;
}

const RED_SEA_WORDS = ['FAITH', 'EXODUS', 'MOSES', 'STAFF', 'FREEDOM'];

export default function RedSeaSwipe({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();
  const [grid, setGrid] = useState<GridTile[][]>([]);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 2, c: 0 });
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);

  // 5x7 Grid
  const ROWS = 5;
  const COLS = 7;

  const initGame = () => {
    const newGrid: GridTile[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: GridTile[] = [];
      for (let c = 0; c < COLS; c++) {
        const isStart = r === 2 && c === 0;
        const isEnd = r === 2 && c === COLS - 1;
        const isObstacle = !isStart && !isEnd && Math.random() < 0.2;
        const hasSeal = !isStart && !isEnd && !isObstacle && Math.random() < 0.35;
        const word = hasSeal ? RED_SEA_WORDS[Math.floor(Math.random() * RED_SEA_WORDS.length)] : '';

        row.push({
          r,
          c,
          isWater: true,
          isPath: isStart,
          isObstacle,
          hasWordSeal: hasSeal,
          word,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setPlayerPos({ r: 2, c: 0 });
    setTimeLeft(30);
    setScore(0);
    setCollectedWords([]);
    setIsWon(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isWon || isGameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsGameOver(true);
          audioEngine.playWrong();
          return 0;
        }
        if (t <= 5) audioEngine.playTick(true);
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isWon, isGameOver]);

  const movePlayer = (dr: number, dc: number) => {
    if (isWon || isGameOver) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;

    if (newR < 0 || newR >= ROWS || newC < 0 || newC >= COLS) return;
    const targetTile = grid[newR][newC];
    if (targetTile.isObstacle) {
      audioEngine.playWrong();
      return;
    }

    // Move success!
    audioEngine.playWheelTick();
    setPlayerPos({ r: newR, c: newC });

    // Mark as parted dry seabed path
    const updated = grid.map((row, r) =>
      row.map((tile, c) => {
        if (r === newR && c === newC) {
          if (tile.hasWordSeal && !collectedWords.includes(tile.word)) {
            setCollectedWords((prev) => [...prev, tile.word]);
            setScore((s) => s + 150);
            audioEngine.playCorrect(2);
          }
          return { ...tile, isPath: true, isWater: false };
        }
        return tile;
      })
    );
    setGrid(updated);

    // Check Victory
    if (newC === COLS - 1) {
      setIsWon(true);
      audioEngine.playLevelComplete();
      confetti({ particleCount: 90, spread: 70 });
      updateProfile({
        wisdomCoins: profile.wisdomCoins + 200,
        xp: profile.xp + 450,
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-4 animate-fade-in text-slate-100 text-center">
      {/* HEADER HUD */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-cyan-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div>
          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">
            Gesture Puzzle Trial
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            PARTING OF THE RED SEA
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl text-xs font-black text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeLeft}s</span>
          </div>
          <div className="bg-slate-800 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            Score: {score}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300">
        Guide the <strong>Pillar of Fire 🔥</strong> across the waters to open a dry seabed path for the Israelites!
      </p>

      {/* PUZZLE GRID */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0e2238] via-[#091b30] to-[#061224] border-2 border-cyan-500/40 shadow-2xl space-y-3">
        <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
          {grid.map((row, r) =>
            row.map((tile, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isStart = r === 2 && c === 0;
              const isExit = r === 2 && c === COLS - 1;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => {
                    const dr = r - playerPos.r;
                    const dc = c - playerPos.c;
                    if (Math.abs(dr) + Math.abs(dc) === 1) {
                      movePlayer(dr, dc);
                    }
                  }}
                  className={`h-14 sm:h-16 rounded-xl border flex flex-col items-center justify-center transition-all relative ${
                    isPlayer
                      ? 'bg-amber-400 text-slate-950 font-black ring-4 ring-yellow-200 animate-pop scale-105 z-20 shadow-lg'
                      : tile.isPath
                      ? 'bg-amber-200/20 border-amber-400 text-amber-300 shadow-inner'
                      : tile.isObstacle
                      ? 'bg-red-950/70 border-red-500/60 text-red-400 cursor-not-allowed'
                      : 'bg-cyan-950/60 border-cyan-500/30 hover:border-cyan-400 text-cyan-300'
                  }`}
                >
                  {isPlayer ? (
                    <span className="text-xl animate-bounce">🔥</span>
                  ) : tile.isObstacle ? (
                    <span className="text-base">⚔️</span>
                  ) : isExit ? (
                    <span className="text-xs font-black text-emerald-400 uppercase">EXIT ➔</span>
                  ) : tile.hasWordSeal ? (
                    <span className="text-[9px] font-black text-amber-300 uppercase">
                      {tile.word}
                    </span>
                  ) : (
                    <span className="text-xs opacity-60">🌊</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* D-PAD CONTROLS */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <button
            onClick={() => movePlayer(-1, 0)}
            className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 text-white font-black text-lg"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => movePlayer(0, -1)}
              className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 text-white font-black text-lg"
            >
              ◀
            </button>
            <button
              onClick={() => movePlayer(1, 0)}
              className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 text-white font-black text-lg"
            >
              ▼
            </button>
            <button
              onClick={() => movePlayer(0, 1)}
              className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-cyan-600 border border-slate-700 text-white font-black text-lg"
            >
              ▶
            </button>
          </div>
        </div>

        {/* VICTORY MODAL */}
        {isWon && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400 text-center space-y-2 animate-pop">
            <h3 className="text-xl font-black text-white">THE WATERS PARTED!</h3>
            <p className="text-xs text-slate-200">
              The Israelites reached the opposite shore safely! Claimed <strong>+200 Coins</strong> and <strong>+450 XP</strong>.
            </p>
            <button
              onClick={onBack}
              className="py-2.5 px-6 rounded-xl font-black text-xs uppercase bg-emerald-500 text-slate-950 shadow-md"
            >
              Continue Adventure
            </button>
          </div>
        )}

        {/* GAME OVER MODAL */}
        {isGameOver && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-center space-y-2 animate-pop">
            <h3 className="text-xl font-black text-red-400">THE CHARIOTS CAUGHT UP!</h3>
            <p className="text-xs text-slate-200">Time ran out before reaching the shore.</p>
            <button
              onClick={initGame}
              className="py-2.5 px-6 rounded-xl font-black text-xs uppercase bg-red-500 text-white shadow-md"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
