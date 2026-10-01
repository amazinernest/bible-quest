'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Question, TimelineItem } from '@/types/game';
import { ArrowUp, ArrowDown, CheckCircle2, XCircle, BookOpen, ArrowRight, Clock, Shuffle } from 'lucide-react';

interface ArenaTimelineProps {
  question: Question;
  onSubmitTimeline: () => void;
  onNext: () => void;
}

export default function ArenaTimeline({ question, onSubmitTimeline, onNext }: ArenaTimelineProps) {
  const { activeRound, updateTimelineOrder } = useGame();
  if (!activeRound) return null;

  const isSubmitted = activeRound.isAnswerSubmitted;
  const userOrder = activeRound.userTimelineOrder || [];
  const correctOrder = question.timelineItems || [];

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= userOrder.length) return;

    const newOrder = [...userOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    updateTimelineOrder(newOrder);
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER CARD */}
      <div className="game-panel rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Bible Timeline Challenge
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {question.category}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
          {question.question}
        </h2>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Use the <strong>Up & Down arrows</strong> to arrange the events from <strong>Earliest (Top)</strong> to <strong>Latest (Bottom)</strong>.
        </p>
      </div>

      {/* TIMELINE ITEMS LIST */}
      <div className="space-y-2.5">
        {userOrder.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === userOrder.length - 1;

          // If submitted, check if this item matches correct position
          const expectedItem = correctOrder.find((c) => c.order === idx + 1);
          const isItemCorrect = expectedItem?.id === item.id;

          let cardBorder = 'border-slate-700 bg-slate-900/80';
          if (isSubmitted) {
            cardBorder = isItemCorrect
              ? 'border-emerald-500/70 bg-emerald-950/40 text-emerald-100'
              : 'border-red-500/70 bg-red-950/40 text-red-100';
          }

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 shadow-md transition-all ${cardBorder}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                  {item.title}
                </span>
              </div>

              {/* REORDER CONTROLS OR FEEDBACK */}
              {!isSubmitted ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={isFirst}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                    title="Move Earlier"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={isLast}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                    title="Move Later"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="shrink-0">
                  {isItemCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMIT BUTTON */}
      {!isSubmitted ? (
        <button
          onClick={onSubmitTimeline}
          className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 btn-game-primary flex items-center justify-center gap-2 shadow-xl"
        >
          Verify Chronological Order ⏳
        </button>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e172a] border-2 border-amber-500/40 shadow-xl space-y-3 animate-pop text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Timeline Reference: {question.reference}
              </span>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                activeRound.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {activeRound.isCorrect ? '✓ PERFECT TIMELINE' : '✗ TIMELINE MISALIGNED'}
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
