import React, { useState } from 'react';
import { UnitData, UserProgress } from '../types';
import { Mic, BookOpen, Layers, CheckCircle2, ChevronRight, PlayCircle, Star, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { soundEffects } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface LessonUnitsViewProps {
  units: UnitData[];
  progress: UserProgress;
  onOpenFlashcards: (unit: UnitData) => void;
  onOpenPronunciation: (unit: UnitData) => void;
  onOpenPracticeQuiz: (unit: UnitData) => void;
  onOpenVisualLesson: (unit: UnitData) => void;
}

export const LessonUnitsView: React.FC<LessonUnitsViewProps> = ({
  units,
  progress,
  onOpenFlashcards,
  onOpenPronunciation,
  onOpenPracticeQuiz,
  onOpenVisualLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'completed' | 'in_progress'>('all');

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.vocabulary.some(v => v.word.toLowerCase().includes(searchQuery.toLowerCase()) || v.meaningVi.toLowerCase().includes(searchQuery.toLowerCase()));

    const isCompleted = progress.completedUnits.includes(unit.id);
    if (filterState === 'completed') return matchesSearch && isCompleted;
    if (filterState === 'in_progress') return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-units"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học, từ vựng (ví dụ: address, pilot, karate...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            id="filter-all"
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterState === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({units.length} Unit)
          </button>
          <button
            id="filter-completed"
            onClick={() => setFilterState('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterState === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đã học ({progress.completedUnits.length})
          </button>
          <button
            id="filter-in-progress"
            onClick={() => setFilterState('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterState === 'in_progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đang học ({units.length - progress.completedUnits.length})
          </button>
        </div>
      </div>

      {/* Grid of Unit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredUnits.map((unit) => {
          const isCompleted = progress.completedUnits.includes(unit.id);
          const masteredCount = unit.vocabulary.filter(v => progress.masteredWords.includes(v.id)).length;
          const vocabCompletionPercent = Math.round((masteredCount / unit.vocabulary.length) * 100);

          return (
            <div
              key={unit.id}
              className="group relative bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${unit.themeColor} text-white flex items-center justify-center text-2xl shadow-sm`}>
                      {unit.badgeIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-600 tracking-wider uppercase">
                          Unit {unit.unitNumber}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                        {unit.titleEn}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {unit.titleVi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-800 font-extrabold text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>3 / 3</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Tiến độ từ vựng SGK</span>
                    <span className="text-amber-700 font-black">
                      {masteredCount}/{unit.vocabulary.length} từ ({vocabCompletionPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${vocabCompletionPercent}%` }}
                    />
                  </div>
                </div>

                {/* Visual Vocabulary Preview with Images */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                    {unit.vocabulary.slice(0, 4).map((vocab) => {
                      const imageSrc = vocab.imageUrl || getVocabularyImage(vocab.word, vocab.id);
                      return (
                        <div
                          key={vocab.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/80 transition-all text-xs font-semibold shrink-0 group"
                          title={`${vocab.word}: ${vocab.meaningVi}`}
                        >
                          <div className="w-5 h-5 rounded-md overflow-hidden bg-white shrink-0 border border-slate-200">
                            <VisualImage
                              src={imageSrc}
                              alt={vocab.word}
                              fallbackEmoji={vocab.imageEmoji}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[80px]">{vocab.word}</span>
                        </div>
                      );
                    })}
                    {unit.vocabulary.length > 4 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shrink-0">
                        <ImageIcon className="w-3 h-3 text-amber-600" />
                        +{unit.vocabulary.length - 4} ảnh
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Interactive Feature Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {/* 1. Flashcards */}
                <button
                  id={`btn-flashcard-${unit.id}`}
                  onClick={() => {
                    soundEffects.playGentleBeep();
                    onOpenFlashcards(unit);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-xs hover:bg-amber-100 active:scale-95 transition-all border border-amber-200"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Flashcard (3D)</span>
                </button>

                {/* 2. AI Pronunciation Coach */}
                <button
                  id={`btn-pronounce-${unit.id}`}
                  onClick={() => {
                    soundEffects.playGentleBeep();
                    onOpenPronunciation(unit);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-50 text-purple-800 font-extrabold text-xs hover:bg-purple-100 active:scale-95 transition-all border border-purple-200"
                >
                  <Mic className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sửa phát âm AI</span>
                </button>

                {/* 3. Practice Exercises */}
                <button
                  id={`btn-quiz-${unit.id}`}
                  onClick={() => {
                    soundEffects.playGentleBeep();
                    onOpenPracticeQuiz(unit);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bài tập SGK</span>
                </button>

                {/* 4. Visual Lesson */}
                <button
                  id={`btn-lesson-${unit.id}`}
                  onClick={() => {
                    soundEffects.playGentleBeep();
                    onOpenVisualLesson(unit);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-xs hover:bg-blue-100 active:scale-95 transition-all border border-blue-200"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bài giảng trực quan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
