'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Question } from '@/types/game';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, Scroll, Sparkles } from 'lucide-react';

interface ArenaVerseMatchProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export default function ArenaVerseMatch({ question, onAnswer, onNext }: ArenaVerseMatchProps) {
  const { activeRound } = useGame();
  if (!activeRound) return null;

  const isSubmitted = activeRound.isAnswerSubmitted;
  const selected = activeRound.selectedOption;
  const options = question.options || [];

  return (
    <div className="w-full space-y-6">
      {/* SCRIPTURE SCROLL CARD */}
      <div className="game-panel rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden border-2 border-amber-500/30">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Scroll className="w-3 h-3" />
            Complete the Verse
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {question.reference}
          </span>
        </div>

        <h2 className="text-lg sm:text-2xl font-serif font-black text-amber-100 leading-relaxed italic">
          {question.question.replace(/^Complete.*:\s*/i, '')}
        </h2>

        <p className="text-xs text-amber-300/80 font-mono mt-3">
          Select the exact biblical word or phrase that completes this verse.
        </p>
      </div>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isFiftyDisabled = activeRound.activeFiftyFiftyOptions.includes(option);
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
          } else if (isFiftyDisabled) {
            btnStyle = 'opacity-25 bg-slate-900/40 border-slate-800 line-through text-slate-600 cursor-not-allowed';
          }

          return (
            <button
              key={idx}
              onClick={() => !isSubmitted && !isFiftyDisabled && onAnswer(option)}
              disabled={isSubmitted || isFiftyDisabled}
              className={`p-4 rounded-xl text-left font-bold text-sm sm:text-base flex items-center justify-between gap-3 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center text-xs font-black text-amber-300 shrink-0">
                  {letter}
                </span>
                <span className="font-serif font-bold text-base">{option}</span>
              </div>

              {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-200 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* VERSE REVEAL & EXPLANATION */}
      {isSubmitted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e172a] border-2 border-amber-500/40 shadow-xl space-y-3 animate-pop text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Full Scripture: {question.reference} ({question.translation || 'NIV'})
              </span>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                activeRound.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {activeRound.isCorrect ? '✓ MEMORIZED' : '✗ PRACTICE AGAIN'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-100 font-serif italic leading-relaxed border-l-2 border-amber-500/50 pl-3">
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
