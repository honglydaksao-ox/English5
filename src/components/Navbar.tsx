import React from 'react';
import { Sparkles, Flame, Coins, Trophy, ShoppingBag, BookOpen, Users, GraduationCap, KeyRound, Settings } from 'lucide-react';
import { UserProgress } from '../types';
import { hasConfiguredApiKey, getStoredModel, hasCustomApiKey } from '../services/geminiClient';

interface NavbarProps {
  progress: UserProgress;
  activeTab: 'student' | 'flashcards' | 'games' | 'leaderboard' | 'parent' | 'teacher';
  setActiveTab: (tab: 'student' | 'flashcards' | 'games' | 'leaderboard' | 'parent' | 'teacher') => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  activeTab,
  setActiveTab,
  onOpenShop,
  onOpenWheel,
  onOpenApiKeyModal,
}) => {
  const isKeyConfigured = hasConfiguredApiKey();
  const currentModel = getStoredModel();
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('student')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-xl text-slate-800 tracking-tight">
                GlobalKids
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                Lớp 5
              </span>
            </div>
            <p className="text-[11px] font-medium text-amber-700 hidden sm:block">
              Chuẩn SGK Global Success 5
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            id="nav-tab-student"
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'student'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Bài học SGK</span>
          </button>

          <button
            id="nav-tab-flashcards"
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'flashcards'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🗂️</span>
            <span>Flashcard SGK</span>
          </button>

          <button
            id="nav-tab-games"
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'games'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Đấu trường & Game</span>
          </button>

          <button
            id="nav-tab-leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span>Bảng vàng</span>
          </button>

          <button
            id="nav-tab-parent"
            onClick={() => setActiveTab('parent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'parent'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Phụ huynh</span>
          </button>

          <button
            id="nav-tab-teacher"
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'teacher'
                ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Giáo viên</span>
          </button>
        </nav>

        {/* User Stats & Rewards Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Streak badge */}
          <div 
            title="Chuỗi ngày học liên tục!"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-xs"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{progress.streakDays}d</span>
          </div>

          {/* Stars */}
          <div 
            title="Tổng số sao đạt được"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs"
          >
            <span className="text-amber-500 text-sm">⭐</span>
            <span>{progress.stars}</span>
          </div>

          {/* Coins */}
          <div 
            title="Số xu tích lũy để đổi quà"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 font-extrabold text-xs"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-600" />
            <span>{progress.coins}</span>
          </div>

          {/* Wheel Button */}
          <button
            id="btn-lucky-wheel"
            onClick={onOpenWheel}
            title="Vòng quay may mắn nhận quà mỗi ngày"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
          >
            <span className="text-sm">🎡</span>
            <span className="hidden md:inline">Vòng quay</span>
          </button>

          {/* Rewards Shop Button */}
          <button
            id="btn-rewards-shop"
            onClick={onOpenShop}
            title="Cửa hàng phần thưởng ảo"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đổi quà</span>
          </button>

          {/* Settings (API Key) Button - Always accessible on Header */}
          <button
            id="btn-settings-api-key"
            onClick={onOpenApiKeyModal}
            title="Cấu hình Google Gemini Model & API Key (Đang tự động quay vòng 4 Key hệ thống)"
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-black text-xs transition-all shadow-xs border bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100 hover:scale-105 active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[11px] sm:text-xs text-slate-800">
                  AI Hub
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 whitespace-nowrap">
                {hasCustomApiKey() ? 'Key cá nhân' : '4 Key quay vòng sẵn sàng'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
