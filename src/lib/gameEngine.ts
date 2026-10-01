import { Difficulty, GameMode, Question, DailyChallengeConfig, FriendChallengeData, LeaderboardUser } from '@/types/game';
import { MASTER_QUESTIONS } from './questionBank';
import { LEVELS_CONFIG } from './levelDefinitions';

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  expert: 3.0,
};

export const COMBO_THRESHOLDS = [
  { minStreak: 10, multiplier: 3.0, label: '3.0x ULTRA COMBO!' },
  { minStreak: 5, multiplier: 2.0, label: '2.0x SUPER COMBO!' },
  { minStreak: 3, multiplier: 1.5, label: '1.5x COMBO!' },
  { minStreak: 2, multiplier: 1.2, label: '1.2x COMBO' },
  { minStreak: 0, multiplier: 1.0, label: '1.0x' },
];

export function getComboMultiplier(currentStreak: number): number {
  for (const item of COMBO_THRESHOLDS) {
    if (currentStreak >= item.minStreak) {
      return item.multiplier;
    }
  }
  return 1.0;
}

export function getComboLabel(currentStreak: number): string {
  for (const item of COMBO_THRESHOLDS) {
    if (currentStreak >= item.minStreak) {
      return item.label;
    }
  }
  return '1.0x';
}

/**
 * Calculate dynamic score for an answered question
 */
export function calculateScore(
  isCorrect: boolean,
  timeRemaining: number,
  totalTime: number,
  difficulty: Difficulty,
  currentStreak: number,
  revealedCluesCount: number = 4
): { scoreGained: number; fastBonus: number; streakBonus: number } {
  if (!isCorrect) return { scoreGained: 0, fastBonus: 0, streakBonus: 0 };

  const baseScore = 100;
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const comboMult = getComboMultiplier(currentStreak);

  // Fast answer bonus (up to 50 pts based on fraction of time remaining)
  const timeRatio = Math.max(0, Math.min(1, timeRemaining / (totalTime || 15)));
  const fastBonus = Math.round(timeRatio * 50);

  // Streak bonus: +25 per streak count
  const streakBonus = Math.min(250, currentStreak * 25);

  // Clue penalty/reward for Who Am I: 4 clues max. Answering at clue 1 = 1.5x bonus
  let clueMultiplier = 1.0;
  if (revealedCluesCount === 1) clueMultiplier = 1.5;
  else if (revealedCluesCount === 2) clueMultiplier = 1.25;
  else if (revealedCluesCount === 3) clueMultiplier = 1.1;

  const totalRaw = (baseScore + fastBonus + streakBonus) * diffMultiplier * comboMult * clueMultiplier;
  const scoreGained = Math.round(totalRaw);

  return { scoreGained, fastBonus, streakBonus };
}

/**
 * Calculate XP gained for a round or action
 */
export function calculateXpForQuestion(isCorrect: boolean, isFast: boolean, difficulty: Difficulty): number {
  if (!isCorrect) return 10; // Encouragement XP for participating
  const base = 100;
  const fast = isFast ? 50 : 0;
  const diffBonus = difficulty === 'expert' ? 50 : difficulty === 'hard' ? 30 : difficulty === 'medium' ? 15 : 0;
  return base + fast + diffBonus;
}

/**
 * Calculate player level from total XP
 * Level curve: Level 1 = 0 XP, Level 2 = 500 XP, Level 3 = 1200 XP, Level 4 = 2100 XP, Level 5 = 3200 XP...
 */
export function getLevelFromXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, xp);
  // Quadratic level progression formula
  // XP to reach Level N: 250 * (N - 1)^1.6
  let level = 1;
  while (getXpRequiredForLevel(level + 1) <= safeXp) {
    level++;
  }

  const currentLevelFloor = getXpRequiredForLevel(level);
  const nextLevelCeil = getXpRequiredForLevel(level + 1);
  const currentProgressXp = safeXp - currentLevelFloor;
  const neededForNext = nextLevelCeil - currentLevelFloor;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgressXp / neededForNext) * 100)));

  return {
    level,
    currentLevelXp: safeXp,
    nextLevelXp: nextLevelCeil,
    progressPercent,
  };
}

export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(250 * Math.pow(level - 1, 1.6));
}

export function getPlayerTitle(level: number): string {
  if (level >= 30) return 'Word Grandmaster';
  if (level >= 25) return 'High Priest of Truth';
  if (level >= 20) return 'Apostolic Sage';
  if (level >= 15) return 'Prophetic Scholar';
  if (level >= 10) return 'Berean Scribe';
  if (level >= 7) return 'Disciple of the Word';
  if (level >= 5) return 'Scripture Explorer';
  if (level >= 3) return 'Faithful Pilgrim';
  return 'Seeker of Wisdom';
}

/**
 * Calculate stars awarded based on round accuracy
 */
export function calculateStars(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  const accuracy = (correctCount / totalQuestions) * 100;
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

/**
 * Smart Question Selector based on Mode, Level, Stage, or Random Challenge
 */
export function getQuestionsForStage(levelNumber: number, stageNumber: number): Question[] {
  // Find stage definition
  const levelDef = LEVELS_CONFIG.find((l) => l.levelNumber === levelNumber);
  const stageDef = levelDef?.stages.find((s) => s.stageNumber === stageNumber);

  // Filter bank
  let matching = MASTER_QUESTIONS.filter((q) => q.level === levelNumber && q.stage === stageNumber);

  // If stage questions in bank are fewer than needed, fill with same level or general questions
  if (matching.length === 0) {
    matching = MASTER_QUESTIONS.filter((q) => q.level === levelNumber);
  }
  if (matching.length === 0) {
    matching = MASTER_QUESTIONS;
  }

  // If specific gameMode requested
  if (stageDef) {
    const modeQuestions = matching.filter((q) => {
      if (stageDef.gameMode === 'blitz') return q.type === 'multiple_choice';
      if (stageDef.gameMode === 'who_am_i') return q.type === 'clues';
      if (stageDef.gameMode === 'bible_or_not') return q.type === 'true_false';
      if (stageDef.gameMode === 'verse_match') return q.type === 'fill_blank';
      if (stageDef.gameMode === 'who_said_it') return q.type === 'quote';
      if (stageDef.gameMode === 'timeline') return q.type === 'timeline';
      if (stageDef.gameMode === 'sort') return q.type === 'category_sort';
      return true;
    });

    if (modeQuestions.length >= (stageDef.questionCount || 4)) {
      return shuffleArray([...modeQuestions]).slice(0, stageDef.questionCount);
    }
  }

  const count = stageDef?.questionCount || 5;
  return shuffleArray([...matching]).slice(0, count);
}

export function getQuestionsForMode(mode: GameMode, count: number = 8): Question[] {
  let filtered: Question[] = [];

  switch (mode) {
    case 'blitz':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'multiple_choice');
      break;
    case 'who_am_i':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'clues');
      break;
    case 'bible_or_not':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'true_false');
      break;
    case 'verse_match':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'fill_blank');
      break;
    case 'who_said_it':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'quote');
      break;
    case 'timeline':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'timeline');
      break;
    case 'sort':
      filtered = MASTER_QUESTIONS.filter((q) => q.type === 'category_sort');
      break;
    case 'daily':
    default:
      filtered = MASTER_QUESTIONS;
      break;
  }

  if (filtered.length === 0) filtered = MASTER_QUESTIONS;
  return shuffleArray([...filtered]).slice(0, Math.min(count, filtered.length));
}

/**
 * Generate Today's Daily Challenge
 */
export function getDailyChallenge(): DailyChallengeConfig {
  const today = new Date().toISOString().split('T')[0];
  const modes: GameMode[] = ['blitz', 'verse_match', 'who_am_i', 'bible_or_not', 'who_said_it'];
  
  // Deterministic daily index based on day string
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const modeIndex = Math.abs(hash) % modes.length;
  const chosenMode = modes[modeIndex];

  return {
    id: `daily-${today}`,
    date: today,
    title: 'Daily Scripture Trial',
    description: 'Can you conquer today’s 10-question Scripture challenge without losing your streak?',
    targetCount: 10,
    gameMode: chosenMode,
    xpReward: 500,
    coinReward: 200,
    streakBonus: 100,
    questionIds: [],
  };
}

/**
 * Seed Leaderboard Data
 */
export const SEED_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u1', displayName: 'ScriptureKing', avatar: 'Crown', title: 'Word Grandmaster', level: 28, score: 48520, streak: 34, stars: 182 },
  { id: 'u2', displayName: 'WordWalker', avatar: 'Compass', title: 'High Priest of Truth', level: 24, score: 44210, streak: 28, stars: 165 },
  { id: 'u3', displayName: 'GraceSeeker', avatar: 'Sparkles', title: 'Apostolic Sage', level: 22, score: 42980, streak: 21, stars: 154 },
  { id: 'u4', displayName: 'BereanScholar', avatar: 'BookOpen', title: 'Prophetic Scholar', level: 19, score: 38400, streak: 19, stars: 139 },
  { id: 'u5', displayName: 'FaithfulLion', avatar: 'Shield', title: 'Berean Scribe', level: 16, score: 33150, streak: 14, stars: 118 },
  { id: 'u6', displayName: 'LivingWater', avatar: 'Droplets', title: 'Disciple of the Word', level: 14, score: 29800, streak: 12, stars: 102 },
  { id: 'u7', displayName: 'PillarOfFire', avatar: 'Flame', title: 'Scripture Explorer', level: 11, score: 24300, streak: 10, stars: 85 },
  { id: 'u8', displayName: 'ZionHerald', avatar: 'Sun', title: 'Faithful Pilgrim', level: 8, score: 18900, streak: 7, stars: 62 },
];

/**
 * Encode / Decode Friend Challenges
 */
export function encodeFriendChallenge(data: FriendChallengeData): string {
  try {
    const jsonStr = JSON.stringify(data);
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(jsonStr));
    }
    return Buffer.from(jsonStr).toString('base64');
  } catch (e) {
    return '';
  }
}

export function decodeFriendChallenge(token: string): FriendChallengeData | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      jsonStr = decodeURIComponent(atob(token));
    } else {
      jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    }
    return JSON.parse(jsonStr) as FriendChallengeData;
  } catch (e) {
    return null;
  }
}

/**
 * Array shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const AVATAR_OPTIONS = [
  { id: 'Sparkles', name: 'The Seeker', icon: 'Sparkles', color: 'from-amber-400 to-yellow-600', description: 'Searching for divine wisdom' },
  { id: 'BookOpen', name: 'The Scribe', icon: 'BookOpen', color: 'from-blue-500 to-indigo-700', description: 'Guardian of holy manuscripts' },
  { id: 'Flame', name: 'The Prophet', icon: 'Flame', color: 'from-orange-500 to-red-600', description: 'Burning with holy zeal' },
  { id: 'Crown', name: 'The Ruler', icon: 'Crown', color: 'from-yellow-400 to-amber-600', description: 'Leading with justice and humility' },
  { id: 'Shield', name: 'The Overcomer', icon: 'Shield', color: 'from-emerald-500 to-teal-700', description: 'Equipped with the armor of God' },
  { id: 'Sun', name: 'Child of Light', icon: 'Sun', color: 'from-amber-300 to-orange-500', description: 'Walking in radiant grace' },
  { id: 'Compass', name: 'The Pilgrim', icon: 'Compass', color: 'from-cyan-500 to-blue-600', description: 'Journeying to the Promised Land' },
  { id: 'HeartHandshake', name: 'The Disciple', icon: 'HeartHandshake', color: 'from-rose-400 to-red-600', description: 'Rooted in Christ’s love' },
];
