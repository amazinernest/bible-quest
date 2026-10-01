'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Question } from '@/types/game';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, HelpCircle, Eye } from 'lucide-react';

interface ArenaWhoAmIProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export default function ArenaWhoAmI({ question, onAnswer, onNext }: ArenaWhoAmIProps) {
  const { activeRound, revealNextClue } = useGame();
  if (!activeRound) return null;

  const isSubmitted = activeRound.isAnswerSubmitted;
  const selected = activeRound.selectedOption;
  const clues = question.clues || [];
  const revealedCount = activeRound.revealedCluesCount;
  const options = question.options || [];

  return (
    <div className="w-full space-y-6">
      {/* HEADER & CLUE SCORE BONUS NOTICE */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Who Am I? Mystery Trial
        </span>
        <span className="text-[11px] font-bold text-slate-400">
          Clue {revealedCount} of {clues.length} (Earlier guess = Higher Bonus!)
        </span>
      </div>

      {/* CLUES CARDS */}
      <div className="space-y-2.5">
        {clues.map((clue, idx) => {
          const isRevealed = idx < revealedCount;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all text-left ${
                isRevealed
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-md animate-pop'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                    isRevealed
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed">
                  {isRevealed ? clue : '•••••••••••••••••••••••••••••••••••••••••••••••••• (Hidden Clue)'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* REVEAL NEXT CLUE BUTTON (if clues remain and not submitted) */}
      {!isSubmitted && revealedCount < clues.length && (
        <button
          onClick={revealNextClue}
          className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          Reveal Next Clue ({revealedCount + 1}/{clues.length})
        </button>
      )}

      {/* ANSWER CANDIDATES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {options.map((option, idx) => {
          const isSelected = selected === option;
          const isCorrect = String(option).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

          let btnStyle = 'btn-game-option text-slate-100';
          if (isSubmitted) {
            if (isCorrect) {
              btnStyle = 'btn-option-correct';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'btn-option-wrong';
            } else {
              btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-400';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !isSubmitted && onAnswer(option)}
              disabled={isSubmitted}
              className={`p-4 rounded-xl text-left font-bold text-sm sm:text-base flex items-center justify-between gap-3 ${btnStyle}`}
            >
              <span>{option}</span>
              {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-200" />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-200" />}
            </button>
          );
        })}
      </div>

      {/* EXPLANATION */}
      {isSubmitted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e172a] border-2 border-amber-500/40 shadow-xl space-y-3 animate-pop text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {question.reference}
              </span>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                activeRound.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              Answer: {String(question.correctAnswer)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {question.explanation}
          </p>

          <button
            onClick={onNext}
            className="w-full py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2 shadow-lg"
          >
            {activeRound.currentQuestionIndex + 1 === activeRound.questions.length ? 'View Round Summary' : 'Next Question'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
