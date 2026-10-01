'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import { Sparkles, RotateCcw, ArrowLeft, Trophy, Target, Shield, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlingshotTarget {
  id: number;
  text: string;
  isCorrect: boolean;
  x: number; // percentage 10-90
  y: number; // percentage 15-55
  hit: boolean;
}

const SLINGSHOT_LEVELS = [
  {
    question: "Where did David strike Goliath with his sling?",
    reference: "1 Samuel 17:49",
    targets: [
      { id: 1, text: "Forehead", isCorrect: true, x: 50, y: 25, hit: false },
      { id: 2, text: "Chest", isCorrect: false, x: 22, y: 40, hit: false },
      { id: 3, text: "Shield", isCorrect: false, x: 78, y: 40, hit: false },
    ],
  },
  {
    question: "How many smooth stones did David choose from the brook?",
    reference: "1 Samuel 17:40",
    targets: [
      { id: 1, text: "7 Stones", isCorrect: false, x: 25, y: 30, hit: false },
      { id: 2, text: "5 Stones", isCorrect: true, x: 50, y: 20, hit: false },
      { id: 3, text: "3 Stones", isCorrect: false, x: 75, y: 35, hit: false },
      { id: 4, text: "12 Stones", isCorrect: false, x: 50, y: 48, hit: false },
    ],
  },
  {
    question: "What brook did David visit to gather his stones?",
    reference: "1 Samuel 17:40",
    targets: [
      { id: 1, text: "Brook of Elah", isCorrect: true, x: 50, y: 22, hit: false },
      { id: 2, text: "River Jordan", isCorrect: false, x: 20, y: 42, hit: false },
      { id: 3, text: "Brook Cherith", isCorrect: false, x: 80, y: 42, hit: false },
    ],
  },
];

export default function SlingshotStrike({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();
  const [levelIdx, setLevelIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [stonesLeft, setStonesLeft] = useState<number>(5);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [slingshotPos, setSlingshotPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stoneFlight, setStoneFlight] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  const currentLevel = SLINGSHOT_LEVELS[levelIdx];
  const [targets, setTargets] = useState<SlingshotTarget[]>(currentLevel.targets);

  useEffect(() => {
    setTargets(SLINGSHOT_LEVELS[levelIdx].targets.map((t) => ({ ...t, hit: false })));
  }, [levelIdx]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (stonesLeft <= 0 || stoneFlight?.active || isGameOver || isWon) return;
    setIsAiming(true);
    updateAimPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAiming) return;
    updateAimPos(e);
  };

  const updateAimPos = (e: React.PointerEvent) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height - 80;

    const pullX = Math.max(-100, Math.min(100, e.clientX - rect.left - centerX));
    const pullY = Math.max(0, Math.min(100, e.clientY - rect.top - centerY));

    setSlingshotPos({ x: pullX, y: pullY });
  };

  const handlePointerUp = () => {
    if (!isAiming) return;
    setIsAiming(false);

    if (Math.abs(slingshotPos.x) < 10 && slingshotPos.y < 10) {
      setSlingshotPos({ x: 0, y: 0 });
      return;
    }

    // Launch Stone!
    audioEngine.playCorrect(1);
    setStonesLeft((s) => s - 1);

    // Calculate trajectory angle & speed
    const launchVx = -slingshotPos.x * 0.8;
    const launchVy = -slingshotPos.y * 1.2 - 20;

    // Simulate stone flight
    let curX = 50;
    let curY = 85;
    let step = 0;

    setStoneFlight({ x: curX, y: curY, active: true });
    setSlingshotPos({ x: 0, y: 0 });

    const flightInterval = setInterval(() => {
      step++;
      curX += launchVx * 0.08;
      curY += launchVy * 0.08 + step * 0.4;

      setStoneFlight({ x: curX, y: curY, active: true });

      // Check collision with targets
      targets.forEach((target) => {
        if (!target.hit) {
          const dist = Math.hypot(curX - target.x, curY - target.y);
          if (dist < 8) {
            clearInterval(flightInterval);
            setStoneFlight(null);

            // HIT!
            setTargets((prev) =>
              prev.map((t) => (t.id === target.id ? { ...t, hit: true } : t))
            );

            if (target.isCorrect) {
              audioEngine.playLevelComplete();
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.4 } });
              setScore((s) => s + 300);

              setTimeout(() => {
                if (levelIdx + 1 < SLINGSHOT_LEVELS.length) {
                  setLevelIdx((l) => l + 1);
                } else {
                  setIsWon(true);
                  updateProfile({
                    wisdomCoins: profile.wisdomCoins + 250,
                    xp: profile.xp + 500,
                  });
                }
              }, 1000);
            } else {
              audioEngine.playWrong();
              if (stonesLeft <= 1) {
                setIsGameOver(true);
              }
            }
          }
        }
      });

      if (curY < 5 || curY > 95 || curX < 5 || curX > 95) {
        clearInterval(flightInterval);
        setStoneFlight(null);
        if (stonesLeft <= 1) {
          setIsGameOver(true);
        }
      }
    }, 30);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4 animate-fade-in text-slate-100">
      {/* TOP HEADER HUD */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
            Mini-Game Trial
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            DAVID’S SLINGSHOT STRIKE
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300">
            <span>🪨 {stonesLeft} Stones</span>
          </div>
        </div>
      </div>

      {/* QUESTION BANNER */}
      <div className="game-panel rounded-2xl p-4 text-center border border-amber-500/30">
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400 inline-block mb-1">
          {currentLevel.reference}
        </span>
        <h3 className="text-base sm:text-lg font-black text-white">
          {currentLevel.question}
        </h3>
        <p className="text-[11px] text-slate-300 mt-1 font-medium">
          Drag back the slingshot pouch and release to strike the correct target!
        </p>
      </div>

      {/* INTERACTIVE 2.5D SLINGSHOT ARENA */}
      <div
        ref={arenaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[420px] rounded-3xl bg-gradient-to-b from-[#131d38] via-[#1a1429] to-[#0c101d] border-2 border-amber-500/40 shadow-2xl overflow-hidden cursor-crosshair touch-none select-none"
      >
        {/* Valley of Elah Background Silhouette & Goliath */}
        <div className="absolute inset-0 opacity-25 pointer-events-none flex items-center justify-center">
          <div className="text-8xl select-none">🛡️</div>
        </div>

        {/* TARGET CLOUDS / SHIELDS */}
        {targets.map((target) => (
          <div
            key={target.id}
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl border-2 transition-all shadow-xl text-center pointer-events-none ${
              target.hit
                ? target.isCorrect
                  ? 'bg-emerald-500/80 border-emerald-300 scale-125 animate-pop text-slate-950 font-black'
                  : 'bg-red-600/60 border-red-400 opacity-40 line-through'
                : 'bg-slate-900/90 border-amber-400/80 text-white font-bold hover:scale-105'
            }`}
          >
            <div className="w-7 h-7 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-1 text-xs">
              🎯
            </div>
            <span className="text-xs sm:text-sm font-black whitespace-nowrap">
              {target.text}
            </span>
          </div>
        ))}

        {/* FLYING STONE */}
        {stoneFlight?.active && (
          <div
            style={{ left: `${stoneFlight.x}%`, top: `${stoneFlight.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 border-2 border-white shadow-xl shadow-amber-400/60 z-30"
          />
        )}

        {/* SLINGSHOT RIG AT BOTTOM */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          {/* Elastic Rubber Bands */}
          <svg className="w-48 h-28 overflow-visible">
            {/* Left band */}
            <line
              x1="30"
              y1="40"
              x2={96 + slingshotPos.x}
              y2={40 + slingshotPos.y}
              stroke="#d97706"
              strokeWidth="5"
            />
            {/* Right band */}
            <line
              x1="162"
              y1="40"
              x2={96 + slingshotPos.x}
              y2={40 + slingshotPos.y}
              stroke="#d97706"
              strokeWidth="5"
            />
          </svg>

          {/* Leather Pouch / Stone */}
          <div
            style={{
              transform: `translate(${slingshotPos.x}px, ${slingshotPos.y - 65}px)`,
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-2xl transition-transform ${
              isAiming
                ? 'bg-amber-400 ring-4 ring-yellow-200 scale-110'
                : 'bg-slate-800 border-2 border-amber-400'
            }`}
          >
            🪨
          </div>

          {/* Wooden Fork Slingshot Post */}
          <div className="w-16 h-12 border-b-8 border-l-8 border-r-8 border-[#78350f] rounded-b-2xl shadow-2xl mt-[-40px]" />
          <div className="w-6 h-10 bg-[#78350f] rounded-b-lg shadow-lg" />
        </div>

        {/* AIM HELPER TEXT */}
        {!isAiming && !stoneFlight?.active && !isGameOver && !isWon && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center pointer-events-none animate-pulse">
            <span className="text-xs font-black uppercase text-amber-300 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-400/40 shadow-lg">
              👇 Pull down stone & aim upwards
            </span>
          </div>
        )}

        {/* VICTORY OVERLAY */}
        {isWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pop">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl">
              👑
            </div>
            <h3 className="text-2xl font-black text-white">GOLIATH HAS FALLEN!</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              You triumphed through faith and precision. Claimed <strong>+250 Coins</strong> and <strong>+500 XP</strong>!
            </p>
            <button
              onClick={onBack}
              className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
            >
              Back to World Map
            </button>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pop">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-2xl font-black text-red-400">OUT OF SMOOTH STONES!</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              The giant withstood the trial. Gather your faith and try again!
            </p>
            <button
              onClick={() => {
                setStonesLeft(5);
                setIsGameOver(false);
                setScore(0);
                setLevelIdx(0);
              }}
              className="py-3 px-8 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
