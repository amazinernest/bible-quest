'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import ToastContainer from '@/components/ui/ToastContainer';
import OnboardingModal from '@/components/modals/OnboardingModal';
import SettingsModal from '@/components/modals/SettingsModal';
import HomeOverhaul from '@/components/home/HomeOverhaul';
import WorldMap2D from '@/components/world2d/WorldMap2D';
import SlingshotStrike from '@/components/minigames/SlingshotStrike';
import RedSeaSwipe from '@/components/minigames/RedSeaSwipe';
import JerichoRhythm from '@/components/minigames/JerichoRhythm';
import CovenantWordle from '@/components/minigames/CovenantWordle';
import LeaguesView from '@/components/leagues/LeaguesView';
import LeaderboardView from '@/components/leaderboard/LeaderboardView';
import AchievementsView from '@/components/achievements/AchievementsView';
import SanctuaryShop from '@/components/shop/SanctuaryShop';
import ProfileView from '@/components/profile/ProfileView';
import AdminDashboard from '@/components/admin/AdminDashboard';
import GameHub from '@/components/game/GameHub';
import RelicsSanctuary from '@/components/relics/RelicsSanctuary';
import CodexView from '@/components/codex/CodexView';
import ArcadeRushHub from '@/components/arcade/ArcadeRushHub';
import DailyWheelModal from '@/components/modals/DailyWheelModal';
import { decodeFriendChallenge } from '@/lib/gameEngine';
import { GameMode } from '@/types/game';

function MainGameApp() {
  const {
    activeRound,
    startModeRound,
    startStageRound,
    profile,
  } = useGame();

  const [currentView, setCurrentView] = useState<string>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);
  const searchParams = useSearchParams();

  // Check URL challenge parameter
  useEffect(() => {
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      const challengeData = decodeFriendChallenge(challengeParam);
      if (challengeData) {
        startModeRound(challengeData.gameMode || 'blitz');
      }
    }
  }, [searchParams, startModeRound]);

  const handleStartMode = (mode: GameMode) => {
    startModeRound(mode);
  };

  const handleReturnToJourney = () => {
    setCurrentView('map');
  };

  const handleGoToShop = () => {
    setCurrentView('shop');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1D] text-slate-100 selection:bg-amber-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* HUD Header (Hidden during active question rounds for immersive focus) */}
      {!activeRound && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          openSettings={() => setIsSettingsOpen(true)}
          openWheel={() => setIsWheelOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {activeRound ? (
          <GameHub
            onReturnToJourney={handleReturnToJourney}
            onGoToShop={handleGoToShop}
          />
        ) : (
          <>
            {currentView === 'home' && (
              <HomeOverhaul
                onNavigate={setCurrentView}
                onStartMode={handleStartMode}
                onOpenWheel={() => setIsWheelOpen(true)}
                onOpenMiniGame={(gameId) => setCurrentView(gameId)}
              />
            )}
            {currentView === 'map' && (
              <WorldMap2D
                onSelectStage={(lvl, stg, isBoss) => startStageRound(lvl, stg, isBoss)}
                onOpenMiniGame={(gameId) => setCurrentView(gameId)}
              />
            )}
            {currentView === 'slingshot' && (
              <SlingshotStrike onBack={() => setCurrentView('home')} />
            )}
            {currentView === 'redsea' && (
              <RedSeaSwipe onBack={() => setCurrentView('home')} />
            )}
            {currentView === 'jericho' && (
              <JerichoRhythm onBack={() => setCurrentView('home')} />
            )}
            {currentView === 'wordle' && (
              <CovenantWordle onBack={() => setCurrentView('home')} />
            )}
            {currentView === 'leagues' && <LeaguesView />}
            {currentView === 'relics' && <RelicsSanctuary />}
            {currentView === 'arcade' && <ArcadeRushHub onBack={() => setCurrentView('home')} />}
            {currentView === 'codex' && <CodexView />}
            {currentView === 'leaderboard' && <LeaderboardView />}
            {currentView === 'achievements' && <AchievementsView />}
            {currentView === 'shop' && <SanctuaryShop />}
            {currentView === 'profile' && <ProfileView />}
            {currentView === 'admin' && (
              <AdminDashboard onBack={() => setCurrentView('home')} />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible when not in active round) */}
      {!activeRound && currentView !== 'admin' && (
        <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

      {/* Toast Popups (XP, Coins, Streaks, Achievements) */}
      <ToastContainer />

      {/* First-Time Player Onboarding */}
      <OnboardingModal />

      {/* Daily Wheel of Providence */}
      <DailyWheelModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center text-amber-400 font-black">Loading Word Quest...</div>}>
      <MainGameApp />
    </Suspense>
  );
}
