export type GameMode =
  | 'blitz'
  | 'who_am_i'
  | 'bible_or_not'
  | 'verse_match'
  | 'who_said_it'
  | 'timeline'
  | 'sort'
  | 'daily';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestionType =
  | 'multiple_choice'
  | 'clues'
  | 'true_false'
  | 'fill_blank'
  | 'quote'
  | 'timeline'
  | 'category_sort';

export interface TimelineItem {
  id: string;
  title: string;
  order: number; // 1-based chronological order
  dateOrEra?: string;
}

export interface SortItem {
  id: string;
  text: string;
  categoryId: string;
}

export interface SortCategory {
  id: string;
  title: string;
  description?: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | boolean | string[];
  clues?: string[]; // For Who Am I mode (e.g. 4 progressive clues)
  timelineItems?: TimelineItem[]; // For Bible Timeline mode
  sortCategories?: SortCategory[]; // For Bible Sort mode
  sortItems?: SortItem[]; // For Bible Sort mode
  explanation: string;
  reference: string; // e.g. "Genesis 1:1"
  translation?: string; // e.g. "NIV", "ESV", "KJV"
  difficulty: Difficulty;
  category: string;
  level: number; // 1 to 10
  stage: number; // 1 to 9
  timeLimit: number; // in seconds
  xpReward: number;
  points: number;
  tags?: string[];
}

export interface Stage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  gameMode: GameMode;
  difficulty: Difficulty;
  questionCount: number;
  requiredStarsToUnlock: number;
  xpReward: number;
  coinReward: number;
  isBossStage?: boolean;
}

export interface Level {
  id: number;
  levelNumber: number;
  title: string;
  theme: string;
  era: string;
  bookCoverage: string;
  description: string;
  iconName: string;
  stages: Stage[];
  unlockLevelRequirement: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'mastery' | 'speed' | 'dedication';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  target: number;
  currentProgress?: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  coinReward: number;
}

export interface LeaderboardUser {
  id: string;
  displayName: string;
  avatar: string;
  title: string;
  level: number;
  score: number;
  streak: number;
  stars: number;
  isCurrentPlayer?: boolean;
}

export interface DailyChallengeConfig {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetCount: number;
  gameMode: GameMode;
  xpReward: number;
  coinReward: number;
  streakBonus: number;
  questionIds: string[];
}

export interface FriendChallengeData {
  challengerName: string;
  challengerAvatar: string;
  challengerScore: number;
  challengerAccuracy: number;
  gameMode: GameMode;
  levelId: number;
  stageId: string;
  seed: string;
  timestamp: number;
}

export interface PlayerStats {
  totalGames: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  lifetimeScore: number;
  longestStreak: number;
  currentStreak: number;
  dailyStreak: number;
  lastDailyChallengeDate: string | null;
  lastLoginDate: string;
  stagesCompleted: number;
  starsEarned: number;
  hintsUsed: number;
  perfectRounds: number;
  categoryAccuracy: Record<string, { total: number; correct: number }>;
}

export interface PowerupInventory {
  fiftyFifty: number;
  timeFreeze: number;
  secondChance: number;
  clueReveal: number;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  wisdomCoins: number;
  lives: number;
  maxLives: number;
  lastLifeRegenTime: number; // timestamp ms
  isSoundEnabled: boolean;
  isMusicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
  unlockedLevels: number[];
  unlockedStages: string[];
  stageProgress: Record<string, { stars: number; highScore: number; completed: boolean }>;
  completedDailyDates: string[];
  achievements: Record<string, { unlocked: boolean; unlockedAt: string; progress: number }>;
  inventory: PowerupInventory;
  stats: PlayerStats;
  hasCompletedOnboarding: boolean;
  selectedTranslation: string;
}

export interface GameRoundState {
  mode: GameMode;
  levelNumber?: number;
  stageId?: string;
  stageTitle?: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  comboMultiplier: number;
  currentStreak: number;
  roundStreakMax: number;
  correctCount: number;
  wrongCount: number;
  startTime: number;
  questionStartTime: number;
  timeRemaining: number;
  isTimerActive: boolean;
  isAnswerSubmitted: boolean;
  selectedOption: any;
  isCorrect: boolean | null;
  revealedCluesCount: number;
  activeFiftyFiftyOptions: string[];
  userTimelineOrder: TimelineItem[];
  userSortedItems: Record<string, SortItem[]>;
  availableSortItems: SortItem[];
  isGameOver: boolean;
  isRoundComplete: boolean;
  gainedXp: number;
  gainedCoins: number;
  earnedStars: number;
  isDailyChallenge?: boolean;
  isPracticeMode?: boolean;
}
