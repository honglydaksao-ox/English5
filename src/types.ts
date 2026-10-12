export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  meaningVi: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleVi: string;
  imageEmoji: string;
  imageUrl?: string;
  audioKey?: string;
}

export interface SentencePattern {
  id?: string;
  pattern: string;
  meaningVi: string;
  dialogue: {
    speakerA: string;
    textA: string;
    textAVi: string;
    speakerB: string;
    textB: string;
    textBVi: string;
  };
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple_choice' | 'sentence_order' | 'fill_in_blank';
  question: string;
  questionVi?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanationVi: string;
}

export interface UnitData {
  id: string;
  unitNumber: number;
  titleEn: string;
  titleVi: string;
  themeColor: string;
  badgeIcon: string;
  vocabulary: VocabularyItem[];
  sentencePatterns: SentencePattern[];
  practiceQuestions: PracticeQuestion[];
  pronunciationTargets: {
    text: string;
    phonetic: string;
    soundFocus: string;
    sampleTips: string;
  }[];
}

export interface PronunciationEvaluation {
  score: number;
  rating: string;
  feedbackVi: string;
  soundTips: string[];
  wordsToImprove: string[];
  stars: number;
  bonusCoins: number;
  userSpokenText: string;
  targetText: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  icon: string;
}

export interface UserProgress {
  name: string;
  avatar: string;
  classGroup: string;
  gradeClass?: string;
  schoolName?: string;
  commune?: string;
  province?: string;
  isRegistered?: boolean;
  streakDays: number;
  coins: number;
  stars: number;
  level: number;
  experience: number;
  equippedMascot: string;
  completedUnits: string[];
  masteredWords: string[];
  wordsToReview: string[];
  pronunciationHistory: {
    date: string;
    target: string;
    score: number;
  }[];
  unlockedItems: string[];
  dailyTasksCompleted: number;
  dailyQuests: DailyQuest[];
  lastStudyDate: string;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  school: string;
  avatar: string;
  stars: number;
  streak: number;
  rank: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  category: 'mascot' | 'costume' | 'badge';
  cost: number;
  description: string;
  icon: string;
  rarity: 'rare' | 'epic' | 'legendary';
}

export interface SmartReminderConfig {
  enabled: boolean;
  time: string;
  daysOfWeek: string[];
  customMessage: string;
}

export type GeminiModelId = 'gemini-3-flash-preview' | 'gemini-3.8-flash' | 'gemini-3-pro-preview' | 'gemini-2.5-flash';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  tag: string;
  description: string;
  badgeColor: string;
  isDefault?: boolean;
}

export interface AIConfig {
  apiKey: string;
  selectedModel: GeminiModelId;
}
