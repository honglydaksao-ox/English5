import React, { useState, useEffect } from 'react';
import { UnitData, VocabularyItem } from '../types';
import {
  X,
  Volume2,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Play,
  Pause,
  Filter,
  Layers,
  Layout,
  Shuffle
} from 'lucide-react';
import { speakEnglish, soundEffects, triggerCelebration } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';
import { WindyFlashcardCard } from './WindyFlashcardCard';
import { Interactive3DFlipCard } from './Interactive3DFlipCard';

interface FlashcardModalProps {
  unit: UnitData;
  masteredWords: string[];
  onClose: () => void;
  onToggleMastered: (vocabId: string) => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  unit,
  masteredWords,
  onClose,
  onToggleMastered,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayMode, setDisplayMode] = useState<'windy_pdf' | 'card_3d'>('windy_pdf');
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Filter words
  const allVocab = unit.vocabulary;
  const filteredVocab = allVocab.filter((v) => {
    const isM = masteredWords.includes(v.id);
    if (filterMode === 'mastered') return isM;
    if (filterMode === 'unmastered') return !isM;
    return true;
  });

  const vocabList = filteredVocab.length > 0 ? filteredVocab : allVocab;
  const currentVocab = vocabList[currentIndex] || vocabList[0];
  const isMastered = currentVocab ? masteredWords.includes(currentVocab.id) : false;

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isAutoPlay && currentVocab) {
      speakEnglish(currentVocab.word, 0.85);
      timer = setTimeout(() => {
        if (currentIndex < vocabList.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        } else {
          setIsAutoPlay(false);
          triggerCelebration();
          soundEffects.playSuccess();
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlay, currentIndex, currentVocab, vocabList.length]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentVocab) {
      speakEnglish(currentVocab.word, 0.85);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      soundEffects.playGentleBeep();
    } else {
      triggerCelebration();
      soundEffects.playSuccess();
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      soundEffects.playGentleBeep();
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * vocabList.length);
    setCurrentIndex(randomIndex);
    soundEffects.playGentleBeep();
  };

  if (!currentVocab) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Modal Top bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-3.5 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              🗂️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Flashcard Chuẩn SGK
                </span>
                <span className="text-xs font-bold text-amber-100">Unit {unit.unitNumber}</span>
              </div>
              <h3 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md">
                {unit.titleEn} - {unit.titleVi}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Mode Bar */}
        <div className="bg-amber-50/80 px-3 sm:px-5 py-2.5 border-b border-amber-200/80 flex items-center justify-between gap-2 flex-wrap">
          {/* Layout Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setDisplayMode('windy_pdf')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                displayMode === 'windy_pdf'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Phong cách Flashcard chuẩn SGK (PDF)"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Chuẩn SGK (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('card_3d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                displayMode === 'card_3d'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Thẻ lật 3D tương tác"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Thẻ lật 3D</span>
            </button>
          </div>

          {/* Autoplay & Shuffle & Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Auto-play button */}
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                isAutoPlay
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlay ? 'Tạm dừng' : 'Tự động chạy'}</span>
            </button>

            {/* Shuffle button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="p-1.5 rounded-xl bg-white text-slate-600 border border-amber-200 hover:bg-amber-100 transition-colors"
              title="Trộn ngẫu nhiên thẻ"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Filter */}
            <div className="flex items-center bg-white rounded-xl border border-amber-200 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg ${
                  filterMode === 'all' ? 'bg-amber-100 text-amber-900 font-black' : 'text-slate-500'
                }`}
              >
                Tất cả ({allVocab.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('unmastered');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg ${
                  filterMode === 'unmastered' ? 'bg-amber-100 text-amber-900 font-black' : 'text-slate-500'
                }`}
              >
                Cần ôn
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="font-extrabold text-amber-800">
              Thẻ {currentIndex + 1} / {vocabList.length}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-28 sm:w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* MAIN CARD VIEW */}
          {displayMode === 'windy_pdf' ? (
            /* WINDY BUI PDF CARD STYLE */
            <WindyFlashcardCard
              vocab={currentVocab}
              unitNumber={unit.unitNumber}
              unitTitle={unit.titleEn}
              isMastered={isMastered}
              onToggleMastered={onToggleMastered}
            />
          ) : (
            /* 3D FLIPPING CARD STYLE */
            <Interactive3DFlipCard
              key={currentVocab.id}
              vocab={currentVocab}
              unitNumber={unit.unitNumber}
              unitTitle={unit.titleEn}
              isMastered={isMastered}
              onToggleMastered={onToggleMastered}
            />
          )}

          {/* Bottom Carousel / Thumbnail Ribbon to jump to any word */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>Danh sách từ trong bài:</span>
              <span className="text-amber-700">Chạm để chuyển nhanh</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {vocabList.map((item, idx) => {
                const isSelected = idx === currentIndex;
                const isItemMastered = masteredWords.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsFlipped(false);
                      soundEffects.playGentleBeep();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0 transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                      <VisualImage
                        src={item.imageUrl || getVocabularyImage(item.word, item.id)}
                        alt={item.word}
                        fallbackEmoji={item.imageEmoji}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="leading-tight">
                      <span className="text-xs font-black block truncate max-w-[85px]">{item.word}</span>
                      <span className={`text-[10px] block truncate max-w-[85px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                        {item.meaningVi}
                      </span>
                    </div>
                    {isItemMastered && (
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Từ trước</span>
            </button>

            {/* Mastered toggle button */}
            <button
              id={`btn-master-word-${currentVocab.id}`}
              onClick={() => {
                onToggleMastered(currentVocab.id);
                soundEffects.playCoin();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                isMastered
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isMastered ? 'Đã thuộc từ này (+10 XP)' : 'Đánh dấu: Đã thuộc từ này'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === vocabList.length - 1}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
            >
              <span>Từ tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
