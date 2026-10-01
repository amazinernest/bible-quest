'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Question } from '@/types/game';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, ShieldAlert, Check, X } from 'lucide-react';

interface ArenaBibleOrNotProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
  onNext: () => void;
}

export default function ArenaBibleOrNot({ question, onAnswer, onNext }: ArenaBibleOrNotProps) {
  const { activeRound } = useGame();
  if (!activeRound) return null;

  const isSubmitted = activeRound.isAnswerSubmitted;
  const selected = activeRound.selectedOption;
  const correctBool = question.correctAnswer === true;

  return (
    <div className="w-full space-y-6">
      {/* STATEMENT CARD */}
      <div className="parchment-panel rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/10 text-amber-900 border border-amber-900/20">
            {question.category}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-100">
            Bible or Not?
          </span>
        </div>

        <h3 className="text-xs font-bold text-amber-900/70 uppercase tracking-widest mb-2 font-serif">
          Statement Trial
        </h3>

        <p className="text-lg sm:text-2xl font-serif font-black text-slate-900 leading-relaxed italic">
          “{question.question.replace(/^Is this actually.*?:\s*/i, '').replace(/\n+/g, ' ')}”
        </p>

        <p className="text-xs text-slate-600 mt-4 font-sans font-semibold">
          Is this actual Scripture, or a popular myth / cultural saying?
        </p>
      </div>

      {/* TRUE / FALSE BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        {/* TRUE BUTTON */}
        {(() => {
          const isSelected = selected === true;
          let btnStyle = 'bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/40 text-emerald-300';
          if (isSubmitted) {
            if (correctBool) {
              btnStyle = 'btn-option-correct text-white';
            } else if (isSelected && !correctBool) {
              btnStyle = 'btn-option-wrong text-white';
            } else {
              btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
            }
          }

          return (
            <button
              onClick={() => !isSubmitted && onAnswer(true)}
              disabled={isSubmitted}
              className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-2 font-black transition-all shadow-lg ${btnStyle}`}
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[3] text-emerald-400" />
              </div>
              <span className="text-base sm:text-lg uppercase tracking-wider">IN THE BIBLE (TRUE)</span>
            </button>
          );
        })()}

        {/* FALSE BUTTON */}
        {(() => {
          const isSelected = selected === false;
          let btnStyle = 'bg-slate-900/90 hover:bg-slate-800 border-2 border-red-500/40 text-red-300';
          if (isSubmitted) {
            if (!correctBool) {
              btnStyle = 'btn-option-correct text-white';
            } else if (isSelected && correctBool) {
              btnStyle = 'btn-option-wrong text-white';
            } else {
              btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
            }
          }

          return (
            <button
              onClick={() => !isSubmitted && onAnswer(false)}
              disabled={isSubmitted}
              className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-2 font-black transition-all shadow-lg ${btnStyle}`}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center">
                <X className="w-7 h-7 stroke-[3] text-red-400" />
              </div>
              <span className="text-base sm:text-lg uppercase tracking-wider">NOT IN BIBLE (FALSE)</span>
            </button>
          );
        })()}
      </div>

      {/* EXPLANATION */}
      {isSubmitted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e172a] border-2 border-amber-500/40 shadow-xl space-y-3 animate-pop text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Scripture Fact Check: {question.reference}
              </span>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                activeRound.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {correctBool ? 'TRUE (In Scripture)' : 'FALSE (Myth/Secular)'}
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
