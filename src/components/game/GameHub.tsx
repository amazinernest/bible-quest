'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import ArenaHeader from './ArenaHeader';
import ArenaBlitz from './ArenaBlitz';
import ArenaWhoAmI from './ArenaWhoAmI';
import ArenaBibleOrNot from './ArenaBibleOrNot';
import ArenaVerseMatch from './ArenaVerseMatch';
import ArenaWhoSaidIt from './ArenaWhoSaidIt';
import ArenaTimeline from './ArenaTimeline';
import ArenaSort from './ArenaSort';
import RoundResults from './RoundResults';
import GameOverModal from './GameOverModal';
import FriendChallengeModal from '../modals/FriendChallengeModal';

interface GameHubProps {
  onReturnToJourney: () => void;
  onGoToShop: () => void;
}

export default function GameHub({ onReturnToJourney, onGoToShop }: GameHubProps) {
  const {
    activeRound,
    submitAnswer,
    submitTimelineOrSortAnswer,
    nextQuestion,
    quitRound,
    startStageRound,
  } = useGame();

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  if (!activeRound) return null;

  const currentQ = activeRound.questions[activeRound.currentQuestionIndex];

  const handlePlayAgain = () => {
    if (activeRound.levelNumber && activeRound.stageId) {
      const [, stgStr] = activeRound.stageId.split('-');
      startStageRound(activeRound.levelNumber, parseInt(stgStr, 10), activeRound.isPracticeMode);
    } else {
      quitRound();
    }
  };

  const handleContinue = () => {
    quitRound();
    onReturnToJourney();
  };

  const handleRetryPractice = () => {
    if (activeRound.levelNumber && activeRound.stageId) {
      const [, stgStr] = activeRound.stageId.split('-');
      startStageRound(activeRound.levelNumber, parseInt(stgStr, 10), true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6 flex flex-col items-center">
      {/* ARENA HEADER HUD */}
      {!activeRound.isRoundComplete && !activeRound.isGameOver && (
        <ArenaHeader onQuit={quitRound} />
      )}

      {/* GAME OVER MODAL */}
      {activeRound.isGameOver && (
        <GameOverModal
          onQuit={quitRound}
          onRetryPractice={handleRetryPractice}
          onGoToShop={onGoToShop}
        />
      )}

      {/* ROUND COMPLETE RESULTS SCREEN */}
      {activeRound.isRoundComplete ? (
        <RoundResults
          onPlayAgain={handlePlayAgain}
          onContinue={handleContinue}
          onShare={() => setIsShareModalOpen(true)}
        />
      ) : (
        /* ACTIVE QUESTION ARENA BASED ON QUESTION TYPE */
        currentQ && !activeRound.isGameOver && (
          <div className="w-full animate-fade-in">
            {currentQ.type === 'multiple_choice' && (
              <ArenaBlitz
                question={currentQ}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'clues' && (
              <ArenaWhoAmI
                question={currentQ}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'true_false' && (
              <ArenaBibleOrNot
                question={currentQ}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'fill_blank' && (
              <ArenaVerseMatch
                question={currentQ}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'quote' && (
              <ArenaWhoSaidIt
                question={currentQ}
                onAnswer={submitAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'timeline' && (
              <ArenaTimeline
                question={currentQ}
                onSubmitTimeline={submitTimelineOrSortAnswer}
                onNext={nextQuestion}
              />
            )}

            {currentQ.type === 'category_sort' && (
              <ArenaSort
                question={currentQ}
                onSubmitSort={submitTimelineOrSortAnswer}
                onNext={nextQuestion}
              />
            )}
          </div>
        )
      )}

      {/* FRIEND CHALLENGE SHARE MODAL */}
      <FriendChallengeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        score={activeRound.score}
        mode={activeRound.mode}
      />
    </div>
  );
}
