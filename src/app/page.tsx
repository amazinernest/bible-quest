'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import ToastContainer from '@/components/ui/ToastContainer';
import OnboardingModal from '@/components/modals/OnboardingModal';
import SettingsModal from '@/components/modals/SettingsModal';
import HomeView from '@/components/home/HomeView';
import JourneyMap from '@/components/journey/JourneyMap';
import LeaderboardView from '@/components/leaderboard/LeaderboardView';
import AchievementsView from '@/components/achievements/AchievementsView';
import SanctuaryShop from '@/components/shop/SanctuaryShop';
import ProfileView from '@/components/profile/ProfileView';
import AdminDashboard from '@/components/admin/AdminDashboard';
import GameHub from '@/components/game/GameHub';
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
  const searchParams = useSearchParams();

  // Check URL challenge parameter
  useEffect(() => {
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      const challengeData = decodeFriendChallenge(challengeParam);
      if (challengeData) {
        // Automatically start the friend's mode challenge!
        startModeRound(challengeData.gameMode || 'blitz');
      }
    }
  }, [searchParams, startModeRound]);

  const handleStartMode = (mode: GameMode) => {
    startModeRound(mode);
  };

  const handleReturnToJourney = () => {
    setCurrentView('journey');
  };

  const handleGoToShop = () => {
    setCurrentView('shop');
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1D] text-slate-100 selection:bg-amber-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* HUD Header (Hidden during active question rounds for immersive focus) */}
      {!activeRound && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          openSettings={() => setIsSettingsOpen(true)}
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
              <HomeView
                onNavigate={setCurrentView}
                onStartMode={handleStartMode}
              />
            )}
            {currentView === 'journey' && <JourneyMap />}
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
