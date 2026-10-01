'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  PlayerProfile,
  GameMode,
  Question,
  GameRoundState,
  Achievement,
  TimelineItem,
  SortItem,
  DailyChallengeConfig,
} from '@/types/game';
import { MASTER_QUESTIONS } from '@/lib/questionBank';
import { LEVELS_CONFIG } from '@/lib/levelDefinitions';
import { MASTER_ACHIEVEMENTS } from '@/lib/achievements';
import {
  calculateScore,
  calculateXpForQuestion,
  getLevelFromXp,
  getPlayerTitle,
  calculateStars,
  getQuestionsForStage,
  getQuestionsForMode,
  getDailyChallenge,
} from '@/lib/gameEngine';
import { audioEngine } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'word_quest_player_profile_v1';
const QUESTIONS_STORAGE_KEY = 'word_quest_custom_questions_v1';

const INITIAL_PROFILE: PlayerProfile = {
  id: 'guest-' + Math.random().toString(36).substring(2, 9),
  displayName: 'Seeker',
  avatar: 'Sparkles',
  title: 'Seeker of Wisdom',
  level: 1,
  xp: 0,
  wisdomCoins: 200, // starting welcome bonus
  lives: 5,
  maxLives: 5,
  lastLifeRegenTime: Date.now(),
  isSoundEnabled: true,
  isMusicEnabled: false,
  soundVolume: 0.8,
  musicVolume: 0.4,
  reducedMotion: false,
  unlockedLevels: [1],
  unlockedStages: ['1-1'],
  stageProgress: {},
  completedDailyDates: [],
  achievements: {},
  inventory: {
    fiftyFifty: 2,
    timeFreeze: 2,
    secondChance: 1,
    clueReveal: 2,
  },
  relics: {},
  equippedRelicId: null,
  unlockedCodexIds: ['codex-creation-eden'],
  stats: {
    totalGames: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    lifetimeScore: 0,
    longestStreak: 0,
    currentStreak: 0,
    dailyStreak: 1,
    lastDailyChallengeDate: null,
    lastLoginDate: new Date().toISOString().split('T')[0],
    lastSpinDate: null,
    arcadeRushHighScore: 0,
    bossesDefeated: 0,
    stagesCompleted: 0,
    starsEarned: 0,
    hintsUsed: 0,
    perfectRounds: 0,
    categoryAccuracy: {},
  },
  hasCompletedOnboarding: false,
  selectedTranslation: 'NIV',
};

export interface ToastMessage {
  id: string;
  type: 'xp' | 'coin' | 'achievement' | 'level_up' | 'streak' | 'info';
  title: string;
  subtitle?: string;
  icon?: string;
}

interface GameContextType {
  profile: PlayerProfile;
  activeRound: GameRoundState | null;
  toasts: ToastMessage[];
  allQuestions: Question[];
  achievementsList: Achievement[];
  dailyChallenge: DailyChallengeConfig;
  updateProfile: (partial: Partial<PlayerProfile>) => void;
  setOnboardingComplete: (name: string, avatar: string) => void;
  startStageRound: (levelNumber: number, stageNumber: number, isPractice?: boolean) => void;
  startModeRound: (mode: GameMode, isPractice?: boolean) => void;
  startDailyChallenge: () => void;
  submitAnswer: (answer: any) => void;
  revealNextClue: () => void;
  updateTimelineOrder: (newItems: TimelineItem[]) => void;
  updateSortedItems: (targetCategory: string, item: SortItem) => void;
  submitTimelineOrSortAnswer: () => void;
  nextQuestion: () => void;
  quitRound: () => void;
  useFiftyFifty: () => boolean;
  useTimeFreeze: () => boolean;
  useClueReveal: () => boolean;
  useSecondChance: () => boolean;
  buyShopItem: (itemKey: keyof PlayerProfile['inventory'] | 'refill_lives', cost: number) => boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (val: number) => void;
  setMusicVolume: (val: number) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  importQuestionsFromCsv: (csvText: string) => { successCount: number; errors: string[] };
  removeToast: (id: string) => void;
  resetAllProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(INITIAL_PROFILE);
  const [activeRound, setActiveRound] = useState<GameRoundState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>(MASTER_QUESTIONS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load profile and custom questions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile((prev) => ({ ...prev, ...parsed }));
        }

        const savedQ = localStorage.getItem(QUESTIONS_STORAGE_KEY);
        if (savedQ) {
          const parsedQ = JSON.parse(savedQ);
          if (Array.isArray(parsedQ) && parsedQ.length > 0) {
            setAllQuestions(parsedQ);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
    }
  }, [profile, isLoaded]);

  // Audio settings sync
  useEffect(() => {
    audioEngine.setSoundMuted(!profile.isSoundEnabled);
    audioEngine.setMusicMuted(!profile.isMusicEnabled);
    audioEngine.setSoundVolume(profile.soundVolume);
    audioEngine.setMusicVolume(profile.musicVolume);
  }, [profile.isSoundEnabled, profile.isMusicEnabled, profile.soundVolume, profile.musicVolume]);

  // Life Regeneration Timer (1 life every 15 minutes)
  useEffect(() => {
    const checkRegen = () => {
      setProfile((prev) => {
        if (prev.lives >= prev.maxLives) return prev;
        const now = Date.now();
        const REGEN_INTERVAL = 15 * 60 * 1000; // 15 mins
        const elapsed = now - prev.lastLifeRegenTime;
        if (elapsed >= REGEN_INTERVAL) {
          const livesToAdd = Math.min(prev.maxLives - prev.lives, Math.floor(elapsed / REGEN_INTERVAL));
          if (livesToAdd > 0) {
            return {
              ...prev,
              lives: prev.lives + livesToAdd,
              lastLifeRegenTime: now - (elapsed % REGEN_INTERVAL),
            };
          }
        }
        return prev;
      });
    };

    const interval = setInterval(checkRegen, 30000); // check every 30s
    checkRegen();
    return () => clearInterval(interval);
  }, []);

  // Toast Helper
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check achievements after state change
  const evaluateAchievements = useCallback(
    (currentStats: PlayerProfile['stats'], currentProfile: PlayerProfile) => {
      MASTER_ACHIEVEMENTS.forEach((ach) => {
        const existing = currentProfile.achievements[ach.id];
        if (existing?.unlocked) return;

        let shouldUnlock = false;
        let progress = 0;

        switch (ach.id) {
          case 'ach-first-step':
            progress = currentStats.correctAnswers;
            shouldUnlock = currentStats.correctAnswers >= 1;
            break;
          case 'ach-streak-5':
            progress = currentStats.longestStreak;
            shouldUnlock = currentStats.longestStreak >= 5;
            break;
          case 'ach-streak-10':
            progress = currentStats.longestStreak;
            shouldUnlock = currentStats.longestStreak >= 10;
            break;
          case 'ach-streak-25':
            progress = currentStats.longestStreak;
            shouldUnlock = currentStats.longestStreak >= 25;
            break;
          case 'ach-scripture-explorer':
            progress = currentStats.totalQuestionsAnswered;
            shouldUnlock = currentStats.totalQuestionsAnswered >= 50;
            break;
          case 'ach-bible-scholar':
            progress = currentStats.totalQuestionsAnswered;
            shouldUnlock = currentStats.totalQuestionsAnswered >= 200;
            break;
          case 'ach-perfect-round':
            progress = currentStats.perfectRounds;
            shouldUnlock = currentStats.perfectRounds >= 1;
            break;
          case 'ach-daily-streak-7':
            progress = currentStats.dailyStreak;
            shouldUnlock = currentStats.dailyStreak >= 7;
            break;
          case 'ach-wisdom-hoarder':
            progress = currentProfile.wisdomCoins;
            shouldUnlock = currentProfile.wisdomCoins >= 1000;
            break;
          default:
            break;
        }

        if (shouldUnlock) {
          audioEngine.playAchievement();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          showToast({
            type: 'achievement',
            title: '🏆 Achievement Unlocked!',
            subtitle: `${ach.title} (+${ach.xpReward} XP, +${ach.coinReward} Coins)`,
          });

          setProfile((p) => ({
            ...p,
            xp: p.xp + ach.xpReward,
            wisdomCoins: p.wisdomCoins + ach.coinReward,
            achievements: {
              ...p.achievements,
              [ach.id]: { unlocked: true, unlockedAt: new Date().toISOString(), progress: ach.target },
            },
          }));
        }
      });
    },
    [showToast]
  );

  // In-Round Countdown Timer Hook
  useEffect(() => {
    if (!activeRound || !activeRound.isTimerActive || activeRound.isAnswerSubmitted || activeRound.isRoundComplete) {
      return;
    }

    const timer = setInterval(() => {
      setActiveRound((prev) => {
        if (!prev || !prev.isTimerActive || prev.isAnswerSubmitted) return prev;

        if (prev.timeRemaining <= 1) {
          // Time expired! Mark as wrong answer
          audioEngine.playWrong();
          const currentQ = prev.questions[prev.currentQuestionIndex];
          const isPractice = prev.isPracticeMode;

          if (!isPractice) {
            setProfile((p) => ({
              ...p,
              lives: Math.max(0, p.lives - 1),
            }));
          }

          return {
            ...prev,
            timeRemaining: 0,
            isTimerActive: false,
            isAnswerSubmitted: true,
            selectedOption: '__TIMEOUT__',
            isCorrect: false,
            wrongCount: prev.wrongCount + 1,
            currentStreak: 0,
            comboMultiplier: 1.0,
            isGameOver: !isPractice && profile.lives <= 1,
          };
        }

        const nextTime = prev.timeRemaining - 1;
        if (nextTime <= 4) {
          audioEngine.playTick(true);
        } else if (nextTime % 5 === 0) {
          audioEngine.playTick(false);
        }

        return {
          ...prev,
          timeRemaining: nextTime,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRound, profile.lives]);

  const updateProfile = useCallback((partial: Partial<PlayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  const setOnboardingComplete = useCallback((name: string, avatar: string) => {
    audioEngine.playLevelComplete();
    setProfile((prev) => ({
      ...prev,
      displayName: name.trim() || 'Seeker',
      avatar: avatar || 'Sparkles',
      hasCompletedOnboarding: true,
    }));
  }, []);

  // START ROUND HELPERS
  const startStageRound = useCallback(
    (levelNumber: number, stageNumber: number, isPractice: boolean = false) => {
      if (!isPractice && profile.lives <= 0) {
        showToast({
          type: 'info',
          title: 'Out of Lives! ❤️',
          subtitle: 'Wait for lives to recharge or buy more with Wisdom Coins.',
        });
        return;
      }

      const questions = getQuestionsForStage(levelNumber, stageNumber);
      if (questions.length === 0) return;

      const levelDef = LEVELS_CONFIG.find((l) => l.levelNumber === levelNumber);
      const stageDef = levelDef?.stages.find((s) => s.stageNumber === stageNumber);
      const firstQ = questions[0];

      // Prepare initial timeline or sort state
      let userTimelineOrder: TimelineItem[] = [];
      let availableSortItems: SortItem[] = [];
      let userSortedItems: Record<string, SortItem[]> = {};

      if (firstQ.type === 'timeline' && firstQ.timelineItems) {
        userTimelineOrder = [...firstQ.timelineItems].sort(() => Math.random() - 0.5);
      } else if (firstQ.type === 'category_sort' && firstQ.sortItems && firstQ.sortCategories) {
        availableSortItems = [...firstQ.sortItems].sort(() => Math.random() - 0.5);
        firstQ.sortCategories.forEach((cat) => {
          userSortedItems[cat.id] = [];
        });
      }

      // Relic Perks Integration
      let extraTime = 0;
      if (profile.equippedRelicId === 'relic-staff-moses') {
        extraTime = 5; // Staff of Moses passive
      }

      // Boss State
      let bossState = undefined;
      if (stageDef?.isBossStage) {
        const bossNames = [
          { name: 'Pharaoh of Egypt', title: 'Ruler of the Pyramids', dialogue: 'I will not let Israel go!' },
          { name: 'Goliath of Gath', title: 'Champion of the Philistines', dialogue: 'Who can stand against my bronze spear?' },
          { name: 'Prophets of Baal', title: 'Priests of Mount Carmel', dialogue: 'Our god will answer by fire!' },
          { name: 'Sanhedrin Council', title: 'Accusers of the Apostles', dialogue: 'You must cease speaking in this Name!' },
          { name: 'The Dragon of Patmos', title: 'Adversary of the Overcomers', dialogue: 'My wrath is fierce!' },
        ];
        const bossInfo = bossNames[levelNumber % bossNames.length];
        bossState = {
          bossName: bossInfo.name,
          bossTitle: bossInfo.title,
          bossAvatar: 'Skull',
          bossMaxHp: 600,
          bossCurrentHp: 600,
          playerMaxHp: 300,
          playerCurrentHp: 300,
          lastPlayerDamage: 0,
          lastBossDamage: 0,
          bossDialogue: bossInfo.dialogue,
          isDefeated: false,
        };
      }

      audioEngine.playClick();
      setActiveRound({
        mode: stageDef?.gameMode || 'blitz',
        levelNumber,
        stageId: `${levelNumber}-${stageNumber}`,
        stageTitle: stageDef ? `${stageDef.title}: ${stageDef.subtitle}` : `Stage ${stageNumber}`,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        comboMultiplier: 1.0,
        currentStreak: 0,
        roundStreakMax: 0,
        correctCount: 0,
        wrongCount: 0,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        timeRemaining: (firstQ.timeLimit || 15) + extraTime,
        isTimerActive: true,
        isAnswerSubmitted: false,
        selectedOption: null,
        isCorrect: null,
        revealedCluesCount: firstQ.type === 'clues' ? 1 : 4,
        activeFiftyFiftyOptions: [],
        userTimelineOrder,
        userSortedItems,
        availableSortItems,
        isGameOver: false,
        isRoundComplete: false,
        gainedXp: 0,
        gainedCoins: 0,
        earnedStars: 0,
        isPracticeMode: isPractice,
        bossState,
      });
    },
    [profile.lives, profile.equippedRelicId, showToast]
  );

  const startModeRound = useCallback(
    (mode: GameMode, isPractice: boolean = false) => {
      if (!isPractice && profile.lives <= 0) {
        showToast({
          type: 'info',
          title: 'Out of Lives! ❤️',
          subtitle: 'Wait for lives to recharge or buy more with Wisdom Coins.',
        });
        return;
      }

      const questions = getQuestionsForMode(mode, 6);
      if (questions.length === 0) return;

      const firstQ = questions[0];
      let userTimelineOrder: TimelineItem[] = [];
      let availableSortItems: SortItem[] = [];
      let userSortedItems: Record<string, SortItem[]> = {};

      if (firstQ.type === 'timeline' && firstQ.timelineItems) {
        userTimelineOrder = [...firstQ.timelineItems].sort(() => Math.random() - 0.5);
      } else if (firstQ.type === 'category_sort' && firstQ.sortItems && firstQ.sortCategories) {
        availableSortItems = [...firstQ.sortItems].sort(() => Math.random() - 0.5);
        firstQ.sortCategories.forEach((cat) => {
          userSortedItems[cat.id] = [];
        });
      }

      let extraTime = 0;
      if (profile.equippedRelicId === 'relic-staff-moses') {
        extraTime = 5;
      }

      audioEngine.playClick();
      setActiveRound({
        mode,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        comboMultiplier: 1.0,
        currentStreak: 0,
        roundStreakMax: 0,
        correctCount: 0,
        wrongCount: 0,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        timeRemaining: (firstQ.timeLimit || 15) + extraTime,
        isTimerActive: true,
        isAnswerSubmitted: false,
        selectedOption: null,
        isCorrect: null,
        revealedCluesCount: firstQ.type === 'clues' ? 1 : 4,
        activeFiftyFiftyOptions: [],
        userTimelineOrder,
        userSortedItems,
        availableSortItems,
        isGameOver: false,
        isRoundComplete: false,
        gainedXp: 0,
        gainedCoins: 0,
        earnedStars: 0,
        isPracticeMode: isPractice,
      });
    },
    [profile.lives, profile.equippedRelicId, showToast]
  );

  const startDailyChallenge = useCallback(() => {
    const challenge = getDailyChallenge();
    const questions = getQuestionsForMode(challenge.gameMode, challenge.targetCount);

    const firstQ = questions[0];
    let extraTime = profile.equippedRelicId === 'relic-staff-moses' ? 5 : 0;

    audioEngine.playClick();
    setActiveRound({
      mode: challenge.gameMode,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      comboMultiplier: 1.0,
      currentStreak: 0,
      roundStreakMax: 0,
      correctCount: 0,
      wrongCount: 0,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      timeRemaining: (firstQ.timeLimit || 15) + extraTime,
      isTimerActive: true,
      isAnswerSubmitted: false,
      selectedOption: null,
      isCorrect: null,
      revealedCluesCount: firstQ.type === 'clues' ? 1 : 4,
      activeFiftyFiftyOptions: [],
      userTimelineOrder: [],
      userSortedItems: {},
      availableSortItems: [],
      isGameOver: false,
      isRoundComplete: false,
      gainedXp: 0,
      gainedCoins: 0,
      earnedStars: 0,
      isDailyChallenge: true,
      isPracticeMode: false,
    });
  }, [profile.equippedRelicId]);

  // SUBMIT ANSWER
  const submitAnswer = useCallback(
    (userAnswer: any) => {
      if (!activeRound || activeRound.isAnswerSubmitted) return;

      const currentQ = activeRound.questions[activeRound.currentQuestionIndex];
      let isCorrect = false;

      if (currentQ.type === 'true_false') {
        isCorrect = userAnswer === currentQ.correctAnswer;
      } else if (currentQ.type === 'multiple_choice' || currentQ.type === 'clues' || currentQ.type === 'fill_blank' || currentQ.type === 'quote') {
        isCorrect = String(userAnswer).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
      }

      // Check Shield of Faith Relic Protection
      let shieldAbsorbed = false;
      if (!isCorrect && profile.equippedRelicId === 'relic-shield-faith' && !activeRound.isGameOver) {
        shieldAbsorbed = true;
        showToast({
          type: 'info',
          title: '🛡️ Shield of Faith Absorbed Blow!',
          subtitle: 'Protected life and streak from damage.',
        });
      }

      const nextStreak = isCorrect ? activeRound.currentStreak + 1 : (shieldAbsorbed ? activeRound.currentStreak : 0);
      const roundStreakMax = Math.max(activeRound.roundStreakMax, nextStreak);

      // Score calculation
      let { scoreGained } = calculateScore(
        isCorrect,
        activeRound.timeRemaining,
        currentQ.timeLimit || 15,
        currentQ.difficulty,
        nextStreak,
        activeRound.revealedCluesCount
      );

      // Check Relic Perks: Trumpet of Gideon (Critical Strike under 3s)
      const isFast = activeRound.timeRemaining >= (currentQ.timeLimit || 15) * 0.6;
      const elapsedSeconds = (Date.now() - activeRound.questionStartTime) / 1000;
      let isCriticalStrike = false;

      if (isCorrect && elapsedSeconds <= 3.0 && profile.equippedRelicId === 'relic-trumpet-gideon') {
        isCriticalStrike = true;
        scoreGained = Math.round(scoreGained * 2.5);
        audioEngine.playCriticalHit();
        showToast({
          type: 'streak',
          title: '⚡ CRITICAL DIVINE STRIKE! 2.5x',
          subtitle: 'Trumpet of Gideon boosted your score!',
        });
      }

      // Check Relic Perks: Harp of David (+50% XP)
      let questionXp = calculateXpForQuestion(isCorrect, isFast, currentQ.difficulty);
      if (profile.equippedRelicId === 'relic-harp-david') {
        questionXp = Math.round(questionXp * 1.5);
      }

      // Boss Battle Damage Logic
      let nextBossState = activeRound.bossState ? { ...activeRound.bossState } : undefined;
      if (nextBossState) {
        if (isCorrect) {
          const bossDmg = isCriticalStrike ? 250 : 150;
          nextBossState.bossCurrentHp = Math.max(0, nextBossState.bossCurrentHp - bossDmg);
          nextBossState.lastPlayerDamage = bossDmg;
          nextBossState.bossDialogue = 'Ugh! The light burns!';
          audioEngine.playBossHit();
        } else if (!shieldAbsorbed) {
          const playerDmg = 75;
          nextBossState.playerCurrentHp = Math.max(0, nextBossState.playerCurrentHp - playerDmg);
          nextBossState.lastBossDamage = playerDmg;
          nextBossState.bossDialogue = 'Your faith wavers, mortal!';
        }
      }

      if (isCorrect) {
        if (!isCriticalStrike) audioEngine.playCorrect(nextStreak);
        if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10 || nextStreak === 20) {
          audioEngine.playStreak(nextStreak);
          showToast({
            type: 'streak',
            title: `🔥 ${nextStreak} ANSWERS IN A ROW!`,
            subtitle: `Streak Multiplier Boosted!`,
          });
        }
      } else if (!shieldAbsorbed) {
        audioEngine.playWrong();
        if (!activeRound.isPracticeMode) {
          setProfile((p) => ({
            ...p,
            lives: Math.max(0, p.lives - 1),
          }));
        }
      }

      // Update category stats
      const cat = currentQ.category || 'General';
      setProfile((p) => {
        const catStats = p.stats.categoryAccuracy[cat] || { total: 0, correct: 0 };
        return {
          ...p,
          stats: {
            ...p.stats,
            totalQuestionsAnswered: p.stats.totalQuestionsAnswered + 1,
            correctAnswers: p.stats.correctAnswers + (isCorrect ? 1 : 0),
            categoryAccuracy: {
              ...p.stats.categoryAccuracy,
              [cat]: {
                total: catStats.total + 1,
                correct: catStats.correct + (isCorrect ? 1 : 0),
              },
            },
          },
        };
      });

      const isGameOver = !isCorrect && !shieldAbsorbed && !activeRound.isPracticeMode && profile.lives <= 1;

      setActiveRound((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isTimerActive: false,
          isAnswerSubmitted: true,
          selectedOption: userAnswer,
          isCorrect,
          isCriticalStrike,
          score: prev.score + scoreGained,
          currentStreak: nextStreak,
          roundStreakMax,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
          gainedXp: prev.gainedXp + questionXp,
          isGameOver,
          bossState: nextBossState,
        };
      });
    },
    [activeRound, profile.lives, profile.equippedRelicId, showToast]
  );

  // TIMELINE & SORT ANSWER SUBMISSION
  const submitTimelineOrSortAnswer = useCallback(() => {
    if (!activeRound || activeRound.isAnswerSubmitted) return;
    const currentQ = activeRound.questions[activeRound.currentQuestionIndex];
    let isCorrect = false;

    if (currentQ.type === 'timeline' && currentQ.timelineItems) {
      const correctOrder = [...currentQ.timelineItems].sort((a, b) => a.order - b.order).map((i) => i.id);
      const userOrder = activeRound.userTimelineOrder.map((i) => i.id);
      isCorrect = correctOrder.every((id, idx) => id === userOrder[idx]);
    } else if (currentQ.type === 'category_sort' && currentQ.sortItems) {
      isCorrect = currentQ.sortItems.every((item) => {
        const catList = activeRound.userSortedItems[item.categoryId] || [];
        return catList.some((s) => s.id === item.id);
      });
    }

    const nextStreak = isCorrect ? activeRound.currentStreak + 1 : 0;
    const roundStreakMax = Math.max(activeRound.roundStreakMax, nextStreak);
    const { scoreGained } = calculateScore(
      isCorrect,
      activeRound.timeRemaining,
      currentQ.timeLimit || 40,
      currentQ.difficulty,
      nextStreak
    );

    const questionXp = isCorrect ? 250 : 20;

    if (isCorrect) {
      audioEngine.playCorrect(nextStreak);
    } else {
      audioEngine.playWrong();
      if (!activeRound.isPracticeMode) {
        setProfile((p) => ({ ...p, lives: Math.max(0, p.lives - 1) }));
      }
    }

    setActiveRound((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isTimerActive: false,
        isAnswerSubmitted: true,
        selectedOption: isCorrect ? '__SORT_CORRECT__' : '__SORT_INCORRECT__',
        isCorrect,
        score: prev.score + scoreGained,
        currentStreak: nextStreak,
        roundStreakMax,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
        gainedXp: prev.gainedXp + questionXp,
      };
    });
  }, [activeRound]);

  const updateTimelineOrder = useCallback((newItems: TimelineItem[]) => {
    setActiveRound((prev) => {
      if (!prev) return null;
      return { ...prev, userTimelineOrder: newItems };
    });
  }, []);

  const updateSortedItems = useCallback((targetCategory: string, item: SortItem) => {
    setActiveRound((prev) => {
      if (!prev) return null;
      const remainingAvailable = prev.availableSortItems.filter((i) => i.id !== item.id);
      const updatedCategoryItems = [...(prev.userSortedItems[targetCategory] || []), item];
      return {
        ...prev,
        availableSortItems: remainingAvailable,
        userSortedItems: {
          ...prev.userSortedItems,
          [targetCategory]: updatedCategoryItems,
        },
      };
    });
  }, []);

  const revealNextClue = useCallback(() => {
    setActiveRound((prev) => {
      if (!prev) return null;
      audioEngine.playClick();
      return {
        ...prev,
        revealedCluesCount: Math.min(4, prev.revealedCluesCount + 1),
      };
    });
  }, []);

  // PROCEED TO NEXT QUESTION OR COMPLETE ROUND
  const nextQuestion = useCallback(() => {
    if (!activeRound) return;
    audioEngine.playClick();

    const nextIndex = activeRound.currentQuestionIndex + 1;
    if (nextIndex < activeRound.questions.length && !activeRound.isGameOver) {
      const nextQ = activeRound.questions[nextIndex];

      let userTimelineOrder: TimelineItem[] = [];
      let availableSortItems: SortItem[] = [];
      let userSortedItems: Record<string, SortItem[]> = {};

      if (nextQ.type === 'timeline' && nextQ.timelineItems) {
        userTimelineOrder = [...nextQ.timelineItems].sort(() => Math.random() - 0.5);
      } else if (nextQ.type === 'category_sort' && nextQ.sortItems && nextQ.sortCategories) {
        availableSortItems = [...nextQ.sortItems].sort(() => Math.random() - 0.5);
        nextQ.sortCategories.forEach((cat) => {
          userSortedItems[cat.id] = [];
        });
      }

      setActiveRound((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          isTimerActive: true,
          isAnswerSubmitted: false,
          selectedOption: null,
          isCorrect: null,
          timeRemaining: nextQ.timeLimit || 15,
          questionStartTime: Date.now(),
          revealedCluesCount: nextQ.type === 'clues' ? 1 : 4,
          activeFiftyFiftyOptions: [],
          userTimelineOrder,
          availableSortItems,
          userSortedItems,
        };
      });
    } else {
      // ROUND FINISHED!
      const totalQ = activeRound.questions.length;
      const stars = calculateStars(activeRound.correctCount, totalQ);
      const coinsEarned = Math.round(activeRound.correctCount * 15 + stars * 25);
      const isPerfect = activeRound.correctCount === totalQ && totalQ > 0;

      // Celebrate
      if (stars >= 2) {
        audioEngine.playLevelComplete();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } else {
        audioEngine.playClick();
      }

      // Update Profile & Progress
      setProfile((prev) => {
        const nextXp = prev.xp + activeRound.gainedXp;
        const nextCoins = prev.wisdomCoins + coinsEarned;
        const newStats = {
          ...prev.stats,
          totalGames: prev.stats.totalGames + 1,
          lifetimeScore: prev.stats.lifetimeScore + activeRound.score,
          longestStreak: Math.max(prev.stats.longestStreak, activeRound.roundStreakMax),
          starsEarned: prev.stats.starsEarned + stars,
          stagesCompleted: prev.stats.stagesCompleted + (stars > 0 ? 1 : 0),
          perfectRounds: prev.stats.perfectRounds + (isPerfect ? 1 : 0),
        };

        const currentStageId = activeRound.stageId;
        const newStageProgress = { ...prev.stageProgress };
        const unlockedStages = [...prev.unlockedStages];
        const unlockedLevels = [...prev.unlockedLevels];

        if (currentStageId && stars > 0) {
          const prevStageData = newStageProgress[currentStageId] || { stars: 0, highScore: 0, completed: false };
          newStageProgress[currentStageId] = {
            stars: Math.max(prevStageData.stars, stars),
            highScore: Math.max(prevStageData.highScore, activeRound.score),
            completed: true,
          };

          // Check next stage unlock
          const [lvlStr, stgStr] = currentStageId.split('-');
          const lvlNum = parseInt(lvlStr, 10);
          const stgNum = parseInt(stgStr, 10);
          const nextStageId = `${lvlNum}-${stgNum + 1}`;
          if (!unlockedStages.includes(nextStageId)) {
            unlockedStages.push(nextStageId);
          }

          // Check if next level should unlock
          if (stgNum >= 7 && !unlockedLevels.includes(lvlNum + 1) && lvlNum < 10) {
            unlockedLevels.push(lvlNum + 1);
            showToast({
              type: 'level_up',
              title: `🎉 NEW LEVEL UNLOCKED!`,
              subtitle: `Level ${lvlNum + 1} is now accessible in your Journey!`,
            });
          }
        }

        // Check if player leveled up
        const oldLevelInfo = getLevelFromXp(prev.xp);
        const newLevelInfo = getLevelFromXp(nextXp);
        if (newLevelInfo.level > oldLevelInfo.level) {
          audioEngine.playLevelComplete();
          showToast({
            type: 'level_up',
            title: `🌟 PLAYER LEVEL UP! Level ${newLevelInfo.level}`,
            subtitle: `New Title: ${getPlayerTitle(newLevelInfo.level)} (+200 Coins)`,
          });
        }

        const updatedProfile = {
          ...prev,
          xp: nextXp,
          level: newLevelInfo.level,
          title: getPlayerTitle(newLevelInfo.level),
          wisdomCoins: nextCoins + (newLevelInfo.level > oldLevelInfo.level ? 200 : 0),
          unlockedStages,
          unlockedLevels,
          stageProgress: newStageProgress,
          stats: newStats,
        };

        // Trigger achievements evaluation
        evaluateAchievements(newStats, updatedProfile);

        return updatedProfile;
      });

      setActiveRound((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isTimerActive: false,
          isRoundComplete: true,
          earnedStars: stars,
          gainedCoins: coinsEarned,
        };
      });
    }
  }, [activeRound, evaluateAchievements, showToast]);

  const quitRound = useCallback(() => {
    audioEngine.playClick();
    setActiveRound(null);
  }, []);

  // HINTS & POWERUPS
  const useFiftyFifty = useCallback(() => {
    if (!activeRound || activeRound.isAnswerSubmitted) return false;
    const currentQ = activeRound.questions[activeRound.currentQuestionIndex];
    if (currentQ.type !== 'multiple_choice' && currentQ.type !== 'fill_blank' && currentQ.type !== 'quote') {
      return false;
    }

    if (profile.inventory.fiftyFifty <= 0 && profile.wisdomCoins < 50) {
      showToast({ type: 'info', title: 'Need 50 Wisdom Coins for 50/50 hint!' });
      return false;
    }

    audioEngine.playPowerup();
    const wrongOptions = (currentQ.options || []).filter(
      (opt) => String(opt).toLowerCase() !== String(currentQ.correctAnswer).toLowerCase()
    );
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5);
    const toRemove = shuffledWrong.slice(0, 2);

    setProfile((p) => {
      const usesItem = p.inventory.fiftyFifty > 0;
      return {
        ...p,
        wisdomCoins: usesItem ? p.wisdomCoins : p.wisdomCoins - 50,
        inventory: {
          ...p.inventory,
          fiftyFifty: Math.max(0, p.inventory.fiftyFifty - (usesItem ? 1 : 0)),
        },
        stats: { ...p.stats, hintsUsed: p.stats.hintsUsed + 1 },
      };
    });

    setActiveRound((prev) => {
      if (!prev) return null;
      return { ...prev, activeFiftyFiftyOptions: toRemove };
    });

    return true;
  }, [activeRound, profile.inventory.fiftyFifty, profile.wisdomCoins, showToast]);

  const useTimeFreeze = useCallback(() => {
    if (!activeRound || activeRound.isAnswerSubmitted) return false;
    if (profile.inventory.timeFreeze <= 0 && profile.wisdomCoins < 150) {
      showToast({ type: 'info', title: 'Need 150 Wisdom Coins for +15s Time Boost!' });
      return false;
    }

    audioEngine.playPowerup();
    setProfile((p) => {
      const usesItem = p.inventory.timeFreeze > 0;
      return {
        ...p,
        wisdomCoins: usesItem ? p.wisdomCoins : p.wisdomCoins - 150,
        inventory: {
          ...p.inventory,
          timeFreeze: Math.max(0, p.inventory.timeFreeze - (usesItem ? 1 : 0)),
        },
        stats: { ...p.stats, hintsUsed: p.stats.hintsUsed + 1 },
      };
    });

    setActiveRound((prev) => {
      if (!prev) return null;
      return { ...prev, timeRemaining: prev.timeRemaining + 15 };
    });
    return true;
  }, [activeRound, profile.inventory.timeFreeze, profile.wisdomCoins, showToast]);

  const useClueReveal = useCallback(() => {
    if (!activeRound || activeRound.isAnswerSubmitted) return false;
    const currentQ = activeRound.questions[activeRound.currentQuestionIndex];
    if (currentQ.type !== 'clues') return false;

    if (profile.inventory.clueReveal <= 0 && profile.wisdomCoins < 100) {
      showToast({ type: 'info', title: 'Need 100 Wisdom Coins to reveal clue!' });
      return false;
    }

    audioEngine.playPowerup();
    setProfile((p) => {
      const usesItem = p.inventory.clueReveal > 0;
      return {
        ...p,
        wisdomCoins: usesItem ? p.wisdomCoins : p.wisdomCoins - 100,
        inventory: {
          ...p.inventory,
          clueReveal: Math.max(0, p.inventory.clueReveal - (usesItem ? 1 : 0)),
        },
        stats: { ...p.stats, hintsUsed: p.stats.hintsUsed + 1 },
      };
    });

    revealNextClue();
    return true;
  }, [activeRound, profile.inventory.clueReveal, profile.wisdomCoins, revealNextClue, showToast]);

  const useSecondChance = useCallback(() => {
    return true;
  }, []);

  const buyShopItem = useCallback(
    (itemKey: keyof PlayerProfile['inventory'] | 'refill_lives', cost: number): boolean => {
      if (profile.wisdomCoins < cost) {
        showToast({ type: 'info', title: 'Not enough Wisdom Coins!', subtitle: 'Complete stages to earn more coins.' });
        return false;
      }

      audioEngine.playCoin();
      setProfile((prev) => {
        if (itemKey === 'refill_lives') {
          return {
            ...prev,
            wisdomCoins: prev.wisdomCoins - cost,
            lives: prev.maxLives,
          };
        }
        return {
          ...prev,
          wisdomCoins: prev.wisdomCoins - cost,
          inventory: {
            ...prev.inventory,
            [itemKey]: prev.inventory[itemKey] + 1,
          },
        };
      });

      showToast({
        type: 'coin',
        title: 'Item Acquired!',
        subtitle: `Item added to your Sanctuary storage.`,
      });
      return true;
    },
    [profile.wisdomCoins, showToast]
  );

  const toggleSound = useCallback(() => {
    setProfile((prev) => {
      const next = !prev.isSoundEnabled;
      audioEngine.setSoundMuted(!next);
      return { ...prev, isSoundEnabled: next };
    });
  }, []);

  const toggleMusic = useCallback(() => {
    setProfile((prev) => {
      const next = !prev.isMusicEnabled;
      audioEngine.setMusicMuted(!next);
      return { ...prev, isMusicEnabled: next };
    });
  }, []);

  const setSoundVolume = useCallback((val: number) => {
    setProfile((prev) => ({ ...prev, soundVolume: val }));
    audioEngine.setSoundVolume(val);
  }, []);

  const setMusicVolume = useCallback((val: number) => {
    setProfile((prev) => ({ ...prev, musicVolume: val }));
    audioEngine.setMusicVolume(val);
  }, []);

  // ADMIN QUESTION CRUD & CSV IMPORT
  const addQuestion = useCallback((q: Question) => {
    setAllQuestions((prev) => {
      const updated = [q, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const updateQuestion = useCallback((q: Question) => {
    setAllQuestions((prev) => {
      const updated = prev.map((item) => (item.id === q.id ? q : item));
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setAllQuestions((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const importQuestionsFromCsv = useCallback((csvText: string) => {
    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) return { successCount: 0, errors: ['CSV file is empty or only has headers'] };

    const errors: string[] = [];
    const newQuestions: Question[] = [];

    // Header: question, optionA, optionB, optionC, optionD, correctAnswer, explanation, reference, category, difficulty, level, stage
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (row.length < 8) {
        errors.push(`Row ${i + 1}: Insufficient columns (expected at least 8).`);
        continue;
      }

      const [qText, optA, optB, optC, optD, correct, explanation, ref, cat, diff, lvl, stg] = row;
      if (!qText || !correct || !ref) {
        errors.push(`Row ${i + 1}: Missing required field (Question, Correct Answer, or Reference).`);
        continue;
      }

      const options = [optA, optB, optC, optD].filter(Boolean);
      newQuestions.push({
        id: `csv-${Date.now()}-${i}`,
        question: qText,
        type: options.length > 0 ? 'multiple_choice' : 'true_false',
        options: options.length > 0 ? options : undefined,
        correctAnswer: correct,
        explanation: explanation || 'Scripture truth.',
        reference: ref,
        category: cat || 'General',
        difficulty: (diff as any) || 'medium',
        level: parseInt(lvl, 10) || 1,
        stage: parseInt(stg, 10) || 1,
        timeLimit: 15,
        xpReward: 120,
        points: 120,
      });
    }

    if (newQuestions.length > 0) {
      setAllQuestions((prev) => {
        const merged = [...newQuestions, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      });
    }

    return { successCount: newQuestions.length, errors };
  }, []);

  const resetAllProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(INITIAL_PROFILE);
    setActiveRound(null);
  }, []);

  const dailyChallenge = getDailyChallenge();

  const achievementsList = MASTER_ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: !!profile.achievements[ach.id]?.unlocked,
    unlockedAt: profile.achievements[ach.id]?.unlockedAt,
    currentProgress: profile.achievements[ach.id]?.progress || 0,
  }));

  return (
    <GameContext.Provider
      value={{
        profile,
        activeRound,
        toasts,
        allQuestions,
        achievementsList,
        dailyChallenge,
        updateProfile,
        setOnboardingComplete,
        startStageRound,
        startModeRound,
        startDailyChallenge,
        submitAnswer,
        revealNextClue,
        updateTimelineOrder,
        updateSortedItems,
        submitTimelineOrSortAnswer,
        nextQuestion,
        quitRound,
        useFiftyFifty,
        useTimeFreeze,
        useClueReveal,
        useSecondChance,
        buyShopItem,
        toggleSound,
        toggleMusic,
        setSoundVolume,
        setMusicVolume,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestionsFromCsv,
        removeToast,
        resetAllProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
