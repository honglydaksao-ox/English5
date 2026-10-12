import React from 'react';
import { Mic, Sparkles, CheckCircle2, ChevronRight, Gift } from 'lucide-react';
import { UserProgress } from '../types';

interface MascotBannerProps {
  progress: UserProgress;
  onQuickPracticeVoice: () => void;
  onOpenWheel: () => void;
  onOpenFlashcards?: () => void;
}

export const MascotBanner: React.FC<MascotBannerProps> = ({
  progress,
  onQuickPracticeVoice,
  onOpenWheel,
  onOpenFlashcards,
}) => {
  // Get time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
  const greetingVi = hour < 12 ? 'Chào buổi sáng,' : hour < 18 ? 'Chào buổi chiều,' : 'Chào buổi tối,';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4 sm:p-6 text-white shadow-lg border border-amber-300/60 mb-6">
      {/* Decorative background shapes */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-600/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Mascot & Greeting */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-3xl sm:text-4xl animate-bounce duration-1000">
              {progress.avatar || (progress.equippedMascot === 'rew-2' ? '🐲' : progress.equippedMascot === 'rew-3' ? '🐼' : '🦉')}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
              Lv.{progress.level}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-amber-100 text-xs sm:text-sm font-bold tracking-wide uppercase">
                {greeting} {greetingVi}
              </span>
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-extrabold text-white shadow-2xs">
                {progress.name} • {progress.classGroup || 'Học sinh Lớp 5'} ✨
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Hôm nay hãy cùng BiBo luyện phát âm chuẩn nhé!
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm font-medium mt-1 max-w-xl">
              Chương trình Global Success Lớp 5: Bạn đang duy trì chuỗi{' '}
              <strong className="text-white font-extrabold underline decoration-wavy">
                {progress.streakDays} ngày học liên tiếp
              </strong>. Hãy nhận 30 xu thưởng hôm nay!
            </p>
          </div>
        </div>

        {/* Daily Quest Status & Quick Actions */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch md:items-center gap-2.5">
          {/* Daily Goal card */}
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-3 border border-white/20 text-xs">
            <div className="flex items-center justify-between gap-3 text-amber-100 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Mục tiêu hôm nay
              </span>
              <span className="text-white font-black">2 / 3 nhiệm vụ</span>
            </div>
            <div className="w-full sm:w-44 h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[66%]" />
            </div>
          </div>

          {/* Quick AI Speaking button */}
          <button
            id="btn-quick-voice"
            onClick={onQuickPracticeVoice}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-amber-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span>Luyện nói cùng AI</span>
            <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Flashcards Explorer */}
          {onOpenFlashcards && (
            <button
              id="btn-quick-flashcards"
              onClick={onOpenFlashcards}
              className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl bg-white/90 hover:bg-white text-rose-800 font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-base">🗂️</span>
              <span>Flashcard SGK</span>
            </button>
          )}

          {/* Daily Spin trigger */}
          <button
            id="btn-spin-reward"
            onClick={onOpenWheel}
            className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Gift className="w-4 h-4 animate-wiggle" />
            <span className="hidden sm:inline">Quà mỗi ngày</span>
          </button>
        </div>
      </div>
    </div>
  );
};
