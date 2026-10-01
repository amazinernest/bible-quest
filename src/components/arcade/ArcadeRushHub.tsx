'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { MASTER_QUESTIONS } from '@/lib/questionBank';
import { Question } from '@/types/game';
import { Flame, Clock, Zap, Trophy, RotateCcw, ArrowRight, BookOpen, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

interface ArcadeRushHubProps {
  onBack: () => void;
}

export default function ArcadeRushHub({ onBack }: ArcadeRushHubProps) {
  const { profile, updateProfile } = useGame();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const startRushGame = () => {
    const shuffled = [...MASTER_QUESTIONS.filter((q) => q.type === 'multiple_choice' || q.type === 'fill_blank' || q.type === 'quote')].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setTimeRemaining(60);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIsGameOver(false);
    setFeedback(null);
    setIsPlaying(true);
    audioEngine.playLevelComplete();
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          audioEngine.playWrong();
          // Update high score
          if (score > (profile.stats.arcadeRushHighScore || 0)) {
            updateProfile({
              stats: { ...profile.stats, arcadeRushHighScore: score },
              wisdomCoins: profile.wisdomCoins + 150,
            });
            confetti({ particleCount: 100, spread: 70 });
          }
          return 0;
        }
        if (prev <= 5) audioEngine.playTick(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, score, profile, updateProfile]);

  const handleAnswer = (option: string) => {
    if (!isPlaying || isGameOver || feedback) return;

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = String(option).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      const nextStreak = streak + 1;
      const streakMultiplier = nextStreak >= 10 ? 3.0 : nextStreak >= 5 ? 2.0 : nextStreak >= 3 ? 1.5 : 1.0;
      const pointsEarned = Math.round(150 * streakMultiplier);

      audioEngine.playCorrect(nextStreak);
      setScore((s) => s + pointsEarned);
      setStreak(nextStreak);
      setCorrectCount((c) => c + 1);
      setTimeRemaining((t) => Math.min(90, t + 3)); // Add +3 seconds!
      setFeedback({ isCorrect: true, text: `+${pointsEarned} (+3s)` });
    } else {
      audioEngine.playWrong();
      setStreak(0);
      setTimeRemaining((t) => Math.max(0, t - 5)); // Penalty -5 seconds!
      setFeedback({ isCorrect: false, text: `-5s PENALTY` });
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    }, 350);
  };

  const currentQ = questions[currentQuestionIndex];
  const highScore = profile.stats.arcadeRushHighScore || 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in text-slate-100 text-center">
      {!isPlaying && !isGameOver ? (
        /* INTRO LOBBY */
        <div className="game-panel rounded-3xl p-8 space-y-6 border-2 border-orange-500/40 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
            <Zap className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-wide">
              ARCADE <span className="gold-gradient-text">SPEED RUSH</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              60 seconds on the clock. Correct answers add <strong>+3s</strong>. Wrong answers penalize <strong>-5s</strong>. How high can you climb?
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-around text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Your Best High Score</span>
              <span className="text-xl font-black text-amber-300">{highScore.toLocaleString()} pts</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Starting Time</span>
              <span className="text-xl font-black text-white">60 Seconds</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={startRushGame}
              className="w-full py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              START SPEED RUSH TRIAL
            </button>
            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : isGameOver ? (
        /* GAME OVER RESULTS */
        <div className="game-panel rounded-3xl p-8 space-y-6 border-2 border-amber-500/40 shadow-2xl animate-pop">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white">TIME’S UP!</h2>
            <p className="text-xs text-slate-300">You survived the frantic Scripture gauntlet.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Final Score</span>
              <span className="text-lg font-black text-amber-300">{score.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Answered</span>
              <span className="text-lg font-black text-emerald-400">{correctCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Best Streak</span>
              <span className="text-lg font-black text-orange-400">{streak}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={startRushGame}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase text-slate-950 btn-game-primary flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Exit to Hub
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE SPEED RUSH ARENA */
        currentQ && (
          <div className="space-y-4">
            {/* TOP RUSH HUD */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-orange-500/40">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
                <span className={`text-xl font-mono font-black ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeRemaining}s
                </span>
              </div>

              {streak >= 2 && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs animate-pop">
                  <Flame className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{streak >= 10 ? '3.0x' : streak >= 5 ? '2.0x' : '1.5x'}</span>
                </div>
              )}

              <div className="text-right">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Score</span>
                <span className="text-lg font-black text-amber-300">{score.toLocaleString()}</span>
              </div>
            </div>

            {/* FLOATING FEEDBACK POPUP */}
            {feedback && (
              <div
                className={`py-1.5 px-4 rounded-full text-xs font-black uppercase inline-flex items-center gap-1 animate-pop ${
                  feedback.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-red-600 text-white'
                }`}
              >
                {feedback.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {feedback.text}
              </div>
            )}

            {/* QUESTION CARD */}
            <div className="game-panel rounded-2xl p-6 text-center border border-amber-500/30">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400 block w-max mx-auto mb-2">
                {currentQ.reference}
              </span>
              <h2 className="text-base sm:text-xl font-black text-white leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(currentQ.options || []).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="p-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 text-white transition active:scale-95 text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
