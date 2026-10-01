export type GameMode =
  | 'blitz'
  | 'who_am_i'
  | 'bible_or_not'
  | 'verse_match'
  | 'who_said_it'
  | 'timeline'
  | 'sort'
  | 'daily'
  | 'arcade_rush'
  | 'boss_duel';

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
  order: number;
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
  clues?: string[];
  timelineItems?: TimelineItem[];
  sortCategories?: SortCategory[];
  sortItems?: SortItem[];
  explanation: string;
  reference: string;
  translation?: string;
  difficulty: Difficulty;
  category: string;
  level: number;
  stage: number;
  timeLimit: number;
  xpReward: number;
  points: number;
  tags?: string[];
}

export interface Relic {
  id: string;
  name: string;
  title: string;
  icon: string;
  description: string;
  perkDescription: string;
  perkType: 'shield' | 'time_boost' | 'xp_boost' | 'free_hint' | 'combo_boost' | 'critical_strike';
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  equipped: boolean;
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
  bossName?: string;
  bossTitle?: string;
  bossAvatar?: string;
  bossHp?: number;
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
  date: string;
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

export interface CodexEntry {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  book: string;
  icon: string;
  unlocked: boolean;
  summary: string;
  hebrewGreekInsight: string;
  archaeologyFact: string;
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
  lastSpinDate: string | null;
  arcadeRushHighScore: number;
  bossesDefeated: number;
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
  lastLifeRegenTime: number;
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
  relics: Record<string, boolean>; // relicId -> isUnlocked
  equippedRelicId: string | null;
  unlockedCodexIds: string[];
  stats: PlayerStats;
  hasCompletedOnboarding: boolean;
  selectedTranslation: string;
}

export interface BossFightState {
  bossName: string;
  bossTitle: string;
  bossAvatar: string;
  bossMaxHp: number;
  bossCurrentHp: number;
  playerMaxHp: number;
  playerCurrentHp: number;
  lastPlayerDamage: number;
  lastBossDamage: number;
  bossDialogue: string;
  isDefeated: boolean;
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
  isCriticalStrike?: boolean;
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
  bossState?: BossFightState;
  arcadeRushTime?: number;
}
