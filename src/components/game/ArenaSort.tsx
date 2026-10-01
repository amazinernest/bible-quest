'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Question, SortItem, SortCategory } from '@/types/game';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, Layers, MoveRight } from 'lucide-react';

interface ArenaSortProps {
  question: Question;
  onSubmitSort: () => void;
  onNext: () => void;
}

export default function ArenaSort({ question, onSubmitSort, onNext }: ArenaSortProps) {
  const { activeRound, updateSortedItems } = useGame();
  const [selectedItem, setSelectedItem] = useState<SortItem | null>(null);

  if (!activeRound) return null;

  const isSubmitted = activeRound.isAnswerSubmitted;
  const categories: SortCategory[] = question.sortCategories || [];
  const availableItems: SortItem[] = activeRound.availableSortItems || [];
  const sortedItems: Record<string, SortItem[]> = activeRound.userSortedItems || {};

  const handleSelectItem = (item: SortItem) => {
    if (isSubmitted) return;
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const handleAssignToCategory = (catId: string) => {
    if (!selectedItem || isSubmitted) return;
    updateSortedItems(catId, selectedItem);
    setSelectedItem(null);
  };

  const allItemsAssigned = availableItems.length === 0;

  return (
    <div className="w-full space-y-6">
      {/* HEADER CARD */}
      <div className="game-panel rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Bible Sort Trial
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {question.category}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
          {question.question}
        </h2>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Tap an item below, then tap the target category bucket to sort it.
        </p>
      </div>

      {/* CATEGORY BUCKETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const itemsInCat = sortedItems[cat.id] || [];

          return (
            <div
              key={cat.id}
              onClick={() => selectedItem && handleAssignToCategory(cat.id)}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col min-h-[140px] ${
                selectedItem
                  ? 'border-amber-400 bg-amber-950/20 ring-2 ring-amber-400/40 cursor-pointer shadow-lg'
                  : 'border-slate-700 bg-slate-900/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2">
                <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                  {cat.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                  {itemsInCat.length} items
                </span>
              </div>

              {/* Sorted Chips in this bucket */}
              <div className="flex flex-wrap gap-1.5 flex-1 items-start">
                {itemsInCat.length === 0 ? (
                  <span className="text-xs text-slate-500 italic m-auto">
                    {selectedItem ? 'Tap here to place selected item' : 'Bucket empty'}
                  </span>
                ) : (
                  itemsInCat.map((chip) => {
                    const isCorrectCat = chip.categoryId === cat.id;
                    let chipStyle = 'bg-slate-800 border-slate-700 text-slate-200';
                    if (isSubmitted) {
                      chipStyle = isCorrectCat
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                        : 'bg-red-950/80 border-red-500 text-red-200';
                    }

                    return (
                      <span
                        key={chip.id}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 ${chipStyle}`}
                      >
                        {chip.text}
                        {isSubmitted && (
                          isCorrectCat ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )
                        )}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REMAINING ITEMS POOL */}
      {!isSubmitted && availableItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Items to Sort ({availableItems.length} remaining):
          </span>
          <div className="flex flex-wrap gap-2">
            {availableItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105 ring-2 ring-amber-400/60'
                      : 'bg-[#16233d] hover:bg-[#1f3254] text-slate-200 border-slate-700'
                  }`}
                >
                  <span>{item.text}</span>
                  {isSelected && <MoveRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VERIFY / NEXT BUTTON */}
      {!isSubmitted ? (
        <button
          onClick={onSubmitSort}
          disabled={!allItemsAssigned}
          className={`w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-xl transition ${
            allItemsAssigned
              ? 'btn-game-primary'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {allItemsAssigned ? 'Verify Categories 🎯' : 'Place All Items Into Categories First'}
        </button>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e172a] border-2 border-amber-500/40 shadow-xl space-y-3 animate-pop text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Scripture Context: {question.reference}
              </span>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                activeRound.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {activeRound.isCorrect ? '✓ PERFECTLY SORTED' : '✗ SOME ITEMS MISPLACED'}
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
