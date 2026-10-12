import React, { useState, useEffect } from 'react';
import { UserProgress, UnitData, RewardItem } from './types';
import { GLOBAL_SUCCESS_GRADE_5_UNITS, INITIAL_USER_PROGRESS, MOCK_LEADERBOARD } from './data/globalSuccessUnits';
import { Navbar } from './components/Navbar';
import { MascotBanner } from './components/MascotBanner';
import { LessonUnitsView } from './components/LessonUnitsView';
import { InteractiveGamesView } from './components/InteractiveGamesView';
import { LeaderboardView } from './components/LeaderboardView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { TeacherCustomizeView } from './components/TeacherCustomizeView';
import { AIPronunciationModal } from './components/AIPronunciationModal';
import { FlashcardModal } from './components/FlashcardModal';
import { FlashcardsExplorerView } from './components/FlashcardsExplorerView';
import { PracticeQuizModal } from './components/PracticeQuizModal';
import { VisualLessonModal } from './components/VisualLessonModal';
import { RewardsShopModal } from './components/RewardsShopModal';
import { AITutorChatModal } from './components/AITutorChatModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { soundEffects, triggerCelebration } from './utils/soundAndSpeech';
import { hasConfiguredApiKey } from './services/geminiClient';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'student' | 'flashcards' | 'games' | 'leaderboard' | 'parent' | 'teacher'>('student');

  // Modal states for API Key & Settings
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isInitialApiKeyRequired, setIsInitialApiKeyRequired] = useState(false);

  // Student Registration Modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('globalkids_grade5_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !parsed.isRegistered;
      }
    } catch {
      // ignore
    }
    return !INITIAL_USER_PROGRESS.isRegistered;
  });

  // User progress with local storage sync
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('globalkids_grade5_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('globalkids_grade5_progress', JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Modal states
  const [pronunciationUnit, setPronunciationUnit] = useState<UnitData | null>(null);
  const [flashcardUnit, setFlashcardUnit] = useState<UnitData | null>(null);
  const [quizUnit, setQuizUnit] = useState<UnitData | null>(null);
  const [visualLessonUnit, setVisualLessonUnit] = useState<UnitData | null>(null);
  const [rewardsModalTab, setRewardsModalTab] = useState<'shop' | 'wheel' | null>(null);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // Leaderboard data
  const [leaderboardPlayers] = useState(MOCK_LEADERBOARD);

  // Award coins and stars helper
  const handleAwardCoinsAndStars = (
    coinsToAdd: number,
    starsToAdd: number,
    activityName: string,
    score?: number
  ) => {
    setProgress((prev) => {
      const newHistory = score !== undefined && pronunciationUnit
        ? [
            ...prev.pronunciationHistory,
            {
              date: new Date().toLocaleDateString('vi-VN'),
              target: activityName,
              score,
            },
          ]
        : prev.pronunciationHistory;

      return {
        ...prev,
        coins: prev.coins + coinsToAdd,
        stars: prev.stars + starsToAdd,
        pronunciationHistory: newHistory,
        dailyQuests: (prev.dailyQuests || []).map((q) => {
          if (activityName.toLowerCase().includes('phát âm') && q.id === 'q2') {
            return { ...q, current: Math.min(q.target, q.current + 1), completed: q.current + 1 >= q.target };
          }
          if (activityName.toLowerCase().includes('đấu trường') && q.id === 'q3') {
            return { ...q, current: Math.min(q.target, q.current + 1), completed: q.current + 1 >= q.target };
          }
          return q;
        }),
      };
    });
  };

  // Toggle mastered vocab word
  const handleToggleMastered = (vocabId: string) => {
    setProgress((prev) => {
      const alreadyMastered = prev.masteredWords.includes(vocabId);
      const updatedWords = alreadyMastered
        ? prev.masteredWords.filter((id) => id !== vocabId)
        : [...prev.masteredWords, vocabId];

      return {
        ...prev,
        masteredWords: updatedWords,
        stars: alreadyMastered ? prev.stars : prev.stars + 1,
        coins: alreadyMastered ? prev.coins : prev.coins + 10,
        dailyQuests: (prev.dailyQuests || []).map((q) => {
          if (q.id === 'q1') {
            const nextVal = q.current + 1;
            return { ...q, current: Math.min(q.target, nextVal), completed: nextVal >= q.target };
          }
          return q;
        }),
      };
    });
  };

  // Buy item from rewards shop
  const handleBuyRewardItem = (item: RewardItem) => {
    if (progress.coins < item.cost) return;
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins - item.cost,
      unlockedItems: [...prev.unlockedItems, item.id],
      equippedMascot: item.category === 'mascot' ? item.id : prev.equippedMascot,
    }));
    triggerCelebration();
  };

  // Equip mascot
  const handleEquipMascot = (itemId: string) => {
    setProgress((prev) => ({
      ...prev,
      equippedMascot: itemId,
    }));
    soundEffects.playLevelUp();
  };

  // Complete quiz
  const handleCompleteQuiz = (score: number, starsEarned: number) => {
    if (quizUnit) {
      setProgress((prev) => {
        const completed = prev.completedUnits.includes(quizUnit.id)
          ? prev.completedUnits
          : [...prev.completedUnits, quizUnit.id];

        return {
          ...prev,
          completedUnits: completed,
          stars: prev.stars + starsEarned,
          coins: prev.coins + 25,
        };
      });
    }
  };

  // Handle student registration
  const handleStudentRegister = (data: {
    fullName: string;
    gradeClass: string;
    schoolName: string;
    commune: string;
    province: string;
    avatar: string;
  }) => {
    setProgress((prev) => ({
      ...prev,
      name: data.fullName,
      avatar: data.avatar,
      gradeClass: data.gradeClass,
      schoolName: data.schoolName,
      commune: data.commune,
      province: data.province,
      classGroup: `Lớp ${data.gradeClass} - ${data.schoolName}`,
      isRegistered: true,
    }));
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-slate-50 to-indigo-50/30 text-slate-800 font-sans selection:bg-amber-300 selection:text-amber-900 pb-16">
      {/* Navigation Bar */}
      <Navbar
        progress={progress}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          soundEffects.playGentleBeep();
        }}
        onOpenShop={() => setRewardsModalTab('shop')}
        onOpenWheel={() => setRewardsModalTab('wheel')}
        onOpenApiKeyModal={() => {
          setIsApiKeyModalOpen(true);
          setIsInitialApiKeyRequired(false);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 space-y-6">
        {/* Mascot & Daily Quest Banner (Shown on student tabs) */}
        {(activeTab === 'student' || activeTab === 'games' || activeTab === 'flashcards') && (
          <MascotBanner
            progress={progress}
            onQuickPracticeVoice={() => setPronunciationUnit(GLOBAL_SUCCESS_GRADE_5_UNITS[0])}
            onOpenWheel={() => setRewardsModalTab('wheel')}
            onOpenFlashcards={() => setActiveTab('flashcards')}
          />
        )}

        {/* TAB 1: CURRICULUM LESSON UNITS */}
        {activeTab === 'student' && (
          <LessonUnitsView
            units={GLOBAL_SUCCESS_GRADE_5_UNITS}
            progress={progress}
            onOpenFlashcards={(unit: UnitData) => setFlashcardUnit(unit)}
            onOpenPronunciation={(unit: UnitData) => setPronunciationUnit(unit)}
            onOpenPracticeQuiz={(unit: UnitData) => setQuizUnit(unit)}
            onOpenVisualLesson={(unit: UnitData) => setVisualLessonUnit(unit)}
          />
        )}

        {/* TAB 1.5: FLASHCARDS EXPLORER (20 UNITS) */}
        {activeTab === 'flashcards' && (
          <FlashcardsExplorerView
            units={GLOBAL_SUCCESS_GRADE_5_UNITS}
            progress={progress}
            onToggleMastered={handleToggleMastered}
            onAwardCoinsAndStars={handleAwardCoinsAndStars}
          />
        )}

        {/* TAB 2: INTERACTIVE GAMES & SPEED ARENA */}
        {activeTab === 'games' && (
          <InteractiveGamesView
            units={GLOBAL_SUCCESS_GRADE_5_UNITS}
            progress={progress}
            onAwardCoinsAndStars={handleAwardCoinsAndStars}
          />
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            players={leaderboardPlayers}
            progress={progress}
          />
        )}

        {/* TAB 4: PARENT DASHBOARD & SMART REMINDER */}
        {activeTab === 'parent' && (
          <ParentDashboardView
            progress={progress}
          />
        )}

        {/* TAB 5: TEACHER CUSTOMIZER */}
        {activeTab === 'teacher' && (
          <TeacherCustomizeView
            units={GLOBAL_SUCCESS_GRADE_5_UNITS}
          />
        )}
      </main>

      {/* FLOATING ACTION BUTTON: AI TUTOR MASCOT */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          id="btn-floating-ai-tutor"
          onClick={() => {
            setIsAITutorOpen(true);
            soundEffects.playGentleBeep();
          }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/50"
        >
          <span className="text-xl animate-bounce">🦉</span>
          <div className="text-left hidden sm:block">
            <span className="block text-[10px] text-purple-200 uppercase tracking-wider font-extrabold leading-none">
              Trợ lý AI Lớp 5
            </span>
            <span className="block text-xs font-black">Hỏi Thầy Cú BiBo</span>
          </div>
        </button>
      </div>

      {/* MODALS */}
      {/* 1. AI Pronunciation Evaluation Modal */}
      {pronunciationUnit && (
        <AIPronunciationModal
          unit={pronunciationUnit}
          onClose={() => setPronunciationUnit(null)}
          onAwardCoinsAndStars={handleAwardCoinsAndStars}
          onOpenSettings={() => {
            setIsApiKeyModalOpen(true);
            setIsInitialApiKeyRequired(false);
          }}
        />
      )}

      {/* 2. 3D Flashcards Modal */}
      {flashcardUnit && (
        <FlashcardModal
          unit={flashcardUnit}
          masteredWords={progress.masteredWords}
          onClose={() => setFlashcardUnit(null)}
          onToggleMastered={handleToggleMastered}
        />
      )}

      {/* 3. Practice Quiz Modal */}
      {quizUnit && (
        <PracticeQuizModal
          unit={quizUnit}
          onClose={() => setQuizUnit(null)}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}

      {/* 4. Visual Lesson Modal */}
      {visualLessonUnit && (
        <VisualLessonModal
          unit={visualLessonUnit}
          onClose={() => setVisualLessonUnit(null)}
        />
      )}

      {/* 5. Rewards Shop & Lucky Wheel Modal */}
      {rewardsModalTab && (
        <RewardsShopModal
          progress={progress}
          initialTab={rewardsModalTab}
          onClose={() => setRewardsModalTab(null)}
          onBuyItem={handleBuyRewardItem}
          onEquipMascot={handleEquipMascot}
        />
      )}

      {/* 6. AI Tutor BiBo Chat Modal */}
      {isAITutorOpen && (
        <AITutorChatModal
          studentName={progress.name}
          onClose={() => setIsAITutorOpen(false)}
          onOpenSettings={() => {
            setIsApiKeyModalOpen(true);
            setIsInitialApiKeyRequired(false);
          }}
        />
      )}

      {/* 7. Gemini Model & API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        isInitialRequired={isInitialApiKeyRequired}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={() => setIsApiKeyModalOpen(false)}
      />

      {/* 8. Student Registration Modal (Bắt buộc nhập Họ tên, Lớp, Trường, Xã, Tỉnh) */}
      <StudentRegisterModal
        isOpen={isRegisterModalOpen}
        onRegister={handleStudentRegister}
      />
    </div>
  );
}
