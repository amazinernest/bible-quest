'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import { ArrowLeft, Sparkles, Trophy, RotateCcw, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const BIBLE_WORDS = [
  { word: 'FAITH', hint: 'Now faith is confidence in what we hope for and assurance about what we do not see.', ref: 'Hebrews 11:1' },
  { word: 'GRACE', hint: 'For by grace you have been saved through faith.', ref: 'Ephesians 2:8' },
  { word: 'MOSES', hint: 'Led the Israelites out of Egyptian bondage across the parted sea.', ref: 'Exodus 14:21' },
  { word: 'DAVID', hint: 'A man after God’s own heart, who defeated Goliath and ruled Israel.', ref: '1 Samuel 16:7' },
  { word: 'PEACE', hint: 'Peace I leave with you; my peace I give you.', ref: 'John 14:27' },
  { word: 'CROSS', hint: 'He humbled himself by becoming obedient to death—even death on a cross!', ref: 'Philippians 2:8' },
  { word: 'GLORY', hint: 'The heavens declare the glory of God; the skies proclaim the work of his hands.', ref: 'Psalm 19:1' },
  { word: 'MERCY', hint: 'The Lord is compassionate and gracious, slow to anger, abounding in love.', ref: 'Psalm 103:8' },
];

export default function CovenantWordle({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();
  const [targetItem, setTargetItem] = useState(BIBLE_WORDS[0]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [invalidShake, setInvalidShake] = useState<boolean>(false);

  useEffect(() => {
    // Pick word of the day based on date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const wordObj = BIBLE_WORDS[dayOfYear % BIBLE_WORDS.length];
    setTargetItem(wordObj);
  }, []);

  const handleKeyPress = (letter: string) => {
    if (isGameOver || isWon) return;

    if (letter === 'ENTER') {
      if (currentGuess.length !== 5) {
        setInvalidShake(true);
        audioEngine.playWrong();
        setTimeout(() => setInvalidShake(false), 500);
        return;
      }

      const nextGuesses = [...guesses, currentGuess];
      setGuesses(nextGuesses);
      audioEngine.playWheelTick();

      if (currentGuess === targetItem.word) {
        setIsWon(true);
        audioEngine.playLevelComplete();
        confetti({ particleCount: 100, spread: 70 });
        updateProfile({
          wisdomCoins: profile.wisdomCoins + 150,
          xp: profile.xp + 350,
        });
      } else if (nextGuesses.length >= 6) {
        setIsGameOver(true);
        audioEngine.playWrong();
      }

      setCurrentGuess('');
      return;
    }

    if (letter === 'BACKSPACE') {
      setCurrentGuess((g) => g.slice(0, -1));
      return;
    }

    if (currentGuess.length < 5) {
      setCurrentGuess((g) => g + letter);
    }
  };

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetItem.word[index] === letter) return 'correct'; // green
    if (targetItem.word.includes(letter)) return 'present'; // yellow
    return 'absent'; // dark
  };

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4 animate-fade-in text-slate-100 text-center">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div>
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
            Daily Scripture Wordle
          </span>
          <h2 className="text-sm sm:text-base font-black text-white">
            COVENANT CIPHER
          </h2>
        </div>

        <div className="bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-black text-emerald-300">
          5-Letter Trial
        </div>
      </div>

      <p className="text-xs text-slate-300">
        Guess the 5-letter biblical keyword in 6 tries. Green = correct spot, Gold = in word.
      </p>

      {/* 6 GUESS ROWS */}
      <div className={`space-y-2 max-w-xs mx-auto ${invalidShake ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
          const guess = guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((colIdx) => {
                const char = guess[colIdx] || '';
                const isSubmitted = rowIdx < guesses.length;
                const status = isSubmitted ? getLetterStatus(char, colIdx, guess) : '';

                return (
                  <div
                    key={colIdx}
                    className={`w-12 h-12 rounded-xl font-black text-lg flex items-center justify-center border-2 transition-all select-none ${
                      isSubmitted
                        ? status === 'correct'
                          ? 'bg-emerald-600 border-emerald-400 text-white animate-pop'
                          : status === 'present'
                          ? 'bg-amber-500 border-amber-300 text-slate-950'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                        : char
                        ? 'bg-slate-900 border-amber-400 text-white scale-105'
                        : 'bg-slate-950/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* VIRTUAL KEYBOARD */}
      <div className="space-y-1.5 pt-2 max-w-md mx-auto">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`py-3 px-2 sm:px-3 rounded-lg font-black text-xs uppercase shadow transition active:scale-95 ${
                  key === 'ENTER' || key === 'BACKSPACE'
                    ? 'bg-amber-500 text-slate-950 font-black text-[10px]'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* VICTORY OVERLAY */}
      {isWon && (
        <div className="p-5 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 text-center space-y-3 animate-pop">
          <h3 className="text-xl font-black text-white">COVENANT UNSEALED!</h3>
          <p className="text-sm font-serif italic text-emerald-200">
            “{targetItem.hint}”
          </p>
          <span className="text-xs font-bold text-amber-300 block">{targetItem.ref}</span>
          <button
            onClick={onBack}
            className="py-2.5 px-6 rounded-xl font-black text-xs uppercase bg-emerald-500 text-slate-950 shadow-md"
          >
            Claim Rewards & Return
          </button>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {isGameOver && (
        <div className="p-5 rounded-3xl bg-red-950/90 border-2 border-red-400 text-center space-y-3 animate-pop">
          <h3 className="text-xl font-black text-red-400">CIPHER REMAINED SEALED</h3>
          <p className="text-xs text-slate-300">
            The word was <strong>{targetItem.word}</strong>. Return tomorrow for a new Covenant word!
          </p>
          <button
            onClick={onBack}
            className="py-2.5 px-6 rounded-xl font-black text-xs uppercase bg-slate-800 text-slate-200"
          >
            Back to Hub
          </button>
        </div>
      )}
    </div>
  );
}
