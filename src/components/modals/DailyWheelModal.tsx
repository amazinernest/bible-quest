'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, X, Gift, Flame, Trophy, Check, Compass } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

interface DailyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHEEL_PRIZES = [
  { id: 'p1', label: '100 Coins', type: 'coins', value: 100, color: '#f59e0b', textColor: '#000' },
  { id: 'p2', label: '300 XP', type: 'xp', value: 300, color: '#3b82f6', textColor: '#fff' },
  { id: 'p3', label: '50/50 Pack', type: 'item_fiftyFifty', value: 2, color: '#10b981', textColor: '#fff' },
  { id: 'p4', label: '250 Coins', type: 'coins', value: 250, color: '#eab308', textColor: '#000' },
  { id: 'p5', label: 'Time Boost', type: 'item_timeFreeze', value: 2, color: '#8b5cf6', textColor: '#fff' },
  { id: 'p6', label: '500 Coins!', type: 'coins', value: 500, color: '#ef4444', textColor: '#fff' },
  { id: 'p7', label: 'Full Hearts', type: 'hearts', value: 5, color: '#ec4899', textColor: '#fff' },
  { id: 'p8', label: 'JACKPOT 1000', type: 'coins', value: 1000, color: '#f97316', textColor: '#fff' },
];

export default function DailyWheelModal({ isOpen, onClose }: DailyWheelModalProps) {
  const { profile, updateProfile } = useGame();
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<typeof WHEEL_PRIZES[0] | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = profile.stats.lastSpinDate === todayStr;

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Random prize index
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[prizeIndex];

    // Degrees per slice
    const sliceDeg = 360 / WHEEL_PRIZES.length;
    // Extra full spins (5 to 8 full revolutions)
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    // Calculate target angle to land on prize
    const targetDeg = extraSpins + (360 - (prizeIndex * sliceDeg + sliceDeg / 2));

    setRotation(targetDeg);

    // Tick sound intervals
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      audioEngine.playWheelTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonPrize(prize);
      audioEngine.playLevelComplete();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Apply prize to profile
      if (prize.type === 'coins') {
        updateProfile({
          wisdomCoins: profile.wisdomCoins + prize.value,
          stats: { ...profile.stats, lastSpinDate: todayStr },
        });
      } else if (prize.type === 'xp') {
        updateProfile({
          xp: profile.xp + prize.value,
          stats: { ...profile.stats, lastSpinDate: todayStr },
        });
      } else if (prize.type === 'hearts') {
        updateProfile({
          lives: profile.maxLives,
          stats: { ...profile.stats, lastSpinDate: todayStr },
        });
      } else if (prize.type === 'item_fiftyFifty') {
        updateProfile({
          inventory: { ...profile.inventory, fiftyFifty: profile.inventory.fiftyFifty + prize.value },
          stats: { ...profile.stats, lastSpinDate: todayStr },
        });
      } else if (prize.type === 'item_timeFreeze') {
        updateProfile({
          inventory: { ...profile.inventory, timeFreeze: profile.inventory.timeFreeze + prize.value },
          stats: { ...profile.stats, lastSpinDate: todayStr },
        });
      }
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md game-panel rounded-3xl p-6 text-center space-y-5 border-2 border-amber-500/50 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            Daily Blessing
          </div>
          <h3 className="text-2xl font-black text-white tracking-wide">
            WHEEL OF <span className="gold-gradient-text">PROVIDENCE</span>
          </h3>
          <p className="text-xs text-slate-300">
            Spin daily to receive Wisdom Coins, holy items, and miraculous blessings!
          </p>
        </div>

        {/* WHEEL CONTAINER */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Wheel Pointer Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-6 h-8 flex flex-col items-center">
            <div className="w-4 h-4 bg-amber-400 rotate-45 border-2 border-slate-950 shadow-lg" />
          </div>

          {/* ROTATING WHEEL CANVAS */}
          <div
            className="w-60 h-60 rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                #f59e0b 0deg 45deg,
                #3b82f6 45deg 90deg,
                #10b981 90deg 135deg,
                #eab308 135deg 180deg,
                #8b5cf6 180deg 225deg,
                #ef4444 225deg 270deg,
                #ec4899 270deg 315deg,
                #f97316 315deg 360deg
              )`,
            }}
          >
            {WHEEL_PRIZES.map((p, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={p.id}
                  className="absolute w-full h-full flex items-start justify-center pt-3"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <span
                    className="text-[10px] font-black uppercase tracking-tight"
                    style={{ color: p.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}

            {/* Inner Golden Hub */}
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg text-amber-300 font-black text-xs">
              👑
            </div>
          </div>
        </div>

        {/* PRIZE NOTIFICATION OR SPIN CTA */}
        {wonPrize ? (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-center space-y-1 animate-pop">
            <span className="text-xs font-bold text-emerald-300 uppercase">You Claimed:</span>
            <h4 className="text-lg font-black text-white">{wonPrize.label}</h4>
            <button
              onClick={onClose}
              className="mt-2 py-2 px-6 rounded-xl font-black text-xs uppercase bg-emerald-500 text-slate-950 shadow-md"
            >
              Collect & Continue
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleSpin}
              disabled={isSpinning || hasSpunToday}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 transition flex items-center justify-center gap-2 ${
                hasSpunToday
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'btn-game-primary shadow-xl shadow-amber-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              {hasSpunToday ? 'Next Free Spin Tomorrow' : isSpinning ? 'Blessing In Motion...' : 'SPIN FREE TODAY!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
