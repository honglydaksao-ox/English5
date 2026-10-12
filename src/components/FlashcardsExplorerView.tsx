import React, { useState, useEffect } from 'react';
import { UnitData, UserProgress, VocabularyItem } from '../types';
import {
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shuffle,
  CheckCircle2,
  Check,
  BookOpen,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  Layers,
  Volume2,
  Grid,
  Printer,
  FileText
} from 'lucide-react';
import { WindyFlashcardCard } from './WindyFlashcardCard';
import { Interactive3DFlipCard } from './Interactive3DFlipCard';
import { speakEnglish, soundEffects, triggerCelebration } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface FlashcardsExplorerViewProps {
  units: UnitData[];
  progress: UserProgress;
  onToggleMastered: (vocabId: string) => void;
  onAwardCoinsAndStars: (coins: number, stars: number, activity: string) => void;
}

export const FlashcardsExplorerView: React.FC<FlashcardsExplorerViewProps> = ({
  units,
  progress,
  onToggleMastered,
  onAwardCoinsAndStars,
}) => {
  const [selectedUnitNum, setSelectedUnitNum] = useState<number>(1);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [viewLayout, setViewLayout] = useState<'flip_3d' | 'single_card' | 'grid_cards'>('flip_3d');
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const selectedUnit = units.find((u) => u.unitNumber === selectedUnitNum) || units[0];

  // Search across all units if searchTerm exists, else use current unit
  const isSearching = searchTerm.trim().length > 0;

  const displayList: { vocab: VocabularyItem; unitNum: number; unitTitle: string }[] = isSearching
    ? units.flatMap((u) =>
        u.vocabulary
          .filter(
            (v) =>
              v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.meaningVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.phonetic.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((vocab) => ({ vocab, unitNum: u.unitNumber, unitTitle: u.titleEn }))
      )
    : selectedUnit.vocabulary
        .filter((v) => {
          const isM = progress.masteredWords.includes(v.id);
          if (filterMode === 'mastered') return isM;
          if (filterMode === 'unmastered') return !isM;
          return true;
        })
        .map((vocab) => ({ vocab, unitNum: selectedUnit.unitNumber, unitTitle: selectedUnit.titleEn }));

  const activeItem = displayList[currentWordIndex] || displayList[0];
  const activeVocab = activeItem?.vocab;
  const isMastered = activeVocab ? progress.masteredWords.includes(activeVocab.id) : false;

  // Reset index when switching unit or filter
  useEffect(() => {
    setCurrentWordIndex(0);
    setIsAutoPlay(false);
    setIsQuizActive(false);
  }, [selectedUnitNum, filterMode, searchTerm]);

  // Auto-play loop
  useEffect(() => {
    let timer: any;
    if (isAutoPlay && activeVocab && displayList.length > 0 && viewLayout === 'single_card') {
      speakEnglish(activeVocab.word, 0.85);
      timer = setTimeout(() => {
        if (currentWordIndex < displayList.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
        } else {
          setIsAutoPlay(false);
          triggerCelebration();
          soundEffects.playSuccess();
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlay, currentWordIndex, activeVocab, displayList.length, viewLayout]);

  // Keyboard navigation (ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (viewLayout !== 'single_card') return;
      if (e.key === 'ArrowRight' && currentWordIndex < displayList.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        soundEffects.playGentleBeep();
      } else if (e.key === 'ArrowLeft' && currentWordIndex > 0) {
        setCurrentWordIndex((prev) => prev - 1);
        soundEffects.playGentleBeep();
      } else if (e.key === ' ' && activeVocab) {
        e.preventDefault();
        speakEnglish(activeVocab.word, 0.85);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWordIndex, displayList.length, activeVocab, viewLayout]);

  const handleNext = () => {
    if (currentWordIndex < displayList.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      soundEffects.playGentleBeep();
    } else {
      triggerCelebration();
      soundEffects.playSuccess();
    }
  };

  const handlePrev = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
      soundEffects.playGentleBeep();
    }
  };

  const handleShuffle = () => {
    if (displayList.length > 1) {
      const randomIndex = Math.floor(Math.random() * displayList.length);
      setCurrentWordIndex(randomIndex);
      soundEffects.playGentleBeep();
    }
  };

  // Generate quiz options
  const quizOptions = React.useMemo(() => {
    if (!activeVocab) return [];
    const correct = activeVocab.meaningVi;
    const pool = selectedUnit.vocabulary
      .filter((v) => v.id !== activeVocab.id)
      .map((v) => v.meaningVi);
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correct, ...shuffledPool].sort(() => 0.5 - Math.random());
    return options;
  }, [activeVocab, selectedUnit]);

  const handleQuizAnswer = (chosen: string) => {
    if (!activeVocab) return;
    if (chosen === activeVocab.meaningVi) {
      soundEffects.playSuccess();
      setQuizScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      setQuizFeedback('Chính xác! Xuất sắc! 🎉');
      onAwardCoinsAndStars(5, 1, `Nhớ Flashcard: ${activeVocab.word}`);
      setTimeout(() => {
        setQuizFeedback(null);
        handleNext();
      }, 1200);
    } else {
      soundEffects.playError();
      setQuizScore((prev) => ({ ...prev, total: prev.total + 1 }));
      setQuizFeedback(`Chưa đúng rồi! "${activeVocab.word}" có nghĩa là: ${activeVocab.meaningVi}`);
      setTimeout(() => setQuizFeedback(null), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-5 sm:p-7 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                Thư Viện Flashcard SGK
              </span>
              <span className="text-amber-100 text-xs font-bold">20 Units Global Success 5</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Bộ Flashcard Chuẩn SGK Tiếng Anh 5 Global Success
            </h2>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Toàn bộ từ vựng theo từng bài học bám sát chương trình sách giáo khoa Tiếng Anh 5 Global Success, tích hợp hình ảnh trực quan, phiên âm chuẩn quốc tế và âm thanh bản xứ.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-white/30 flex items-center gap-2">
            <Search className="w-4 h-4 text-white/80 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm từ vựng, nghĩa tiếng Việt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white placeholder-white/70 text-xs sm:text-sm font-semibold outline-none w-full pr-2"
            />
            {isSearching && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg text-white font-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unit Selector Bar (Units 1 to 20) */}
      {!isSearching && (
        <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-amber-200/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {units.map((u) => {
              const isSelected = u.unitNumber === selectedUnitNum;
              const unitMasteredCount = u.vocabulary.filter((v) => progress.masteredWords.includes(v.id)).length;
              const isUnitDone = unitMasteredCount === u.vocabulary.length && u.vocabulary.length > 0;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUnitNum(u.unitNumber)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 select-none ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}
                >
                  <span>{u.badgeIcon}</span>
                  <span className="font-extrabold whitespace-nowrap">Unit {u.unitNumber}</span>
                  {isUnitDone ? (
                    <span className="text-emerald-400 font-black text-xs">✓</span>
                  ) : (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                      {unitMasteredCount}/{u.vocabulary.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SGK Tiếng Anh 5 Global Success Unit Information Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-pink-50 border border-amber-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-800">
                Unit {selectedUnit.unitNumber}: {selectedUnit.titleEn} ({selectedUnit.titleVi})
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                SGK Tiếng Anh 5 Global Success
              </span>
              {selectedUnit.unitNumber === 1 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-300 animate-pulse">
                  ✨ 7 Từ vựng & Hình ảnh thực tế từ Unit1.pdf
                </span>
              )}
              {selectedUnit.unitNumber === 2 && (
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-black border border-blue-300 animate-pulse">
                  ✨ 8 Từ vựng & Hình ảnh SGK từ Unit 2.pdf
                </span>
              )}
              {selectedUnit.unitNumber === 3 && (
                <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-black border border-teal-300 animate-pulse">
                  ✨ 8 Từ vựng & Hình ảnh SGK từ vocabulary.pdf
                </span>
              )}
              {selectedUnit.unitNumber === 7 && (
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-black border border-orange-300 animate-pulse">
                  ✨ 8 Từ vựng & Hình ảnh SGK từ vocabulary.pdf
                </span>
              )}
              {selectedUnit.unitNumber === 8 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-300 animate-pulse">
                  ✨ 7 Flashcard SGK chuẩn hình ảnh (set square, in front of, glue stick, sharpener, above, beside, under)
                </span>
              )}
              {selectedUnit.unitNumber === 9 && (
                <span className="text-[10px] bg-lime-100 text-lime-800 px-2 py-0.5 rounded-md font-black border border-lime-300 animate-pulse">
                  ✨ Toàn bộ từ vựng & hình ảnh SGK chuẩn từ vocabulary.pdf
                </span>
              )}
              {selectedUnit.unitNumber === 10 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-black border border-amber-300 animate-pulse">
                  ✨ 8 Flashcard SGK chuẩn hình ảnh từ vocabulary.pdf (Ba Na Hills, Bai Dinh Pagoda, Suoi Tien...)
                </span>
              )}
              {selectedUnit.unitNumber === 11 && (
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md font-black border border-cyan-300 animate-pulse">
                  ✨ 8 Flashcard SGK chuẩn hình ảnh từ vocabulary.pdf (buy souvenirs, collect seashells, eat seafood...)
                </span>
              )}
              {selectedUnit.unitNumber === 12 && (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-black border border-rose-300 animate-pulse">
                  ✨ 10 Flashcard SGK chuẩn hình ảnh từ vocabulary.pdf (make banh chung, make spring rolls, decorate the house...)
                </span>
              )}
              {selectedUnit.unitNumber === 13 && (
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-black border border-purple-300 animate-pulse">
                  ✨ 8 Flashcard SGK chuẩn hình ảnh từ vocabulary.pdf (on Children’s Day, on Teachers’ Day, milk tea, pizza...)
                </span>
              )}
              {selectedUnit.unitNumber === 14 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-300 animate-pulse">
                  ✨ 10 Flashcard SGK chuẩn hình ảnh từ vocabulary.pdf (do yoga, play sports, drink fresh juice, eat vegetables...)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedUnit.unitNumber === 1
                ? 'Bộ từ vựng chuẩn từ Unit1.pdf kết hợp đầy đủ 7 hình ảnh thực tế: city (thành phố), class (lớp học 5B), countryside (nông thôn), dolphin (cá heo), pink (màu hồng), sandwich (bánh mì kẹp), table tennis (bóng bàn).'
                : selectedUnit.unitNumber === 2
                ? 'Bộ từ vựng chuẩn từ Unit 2.pdf kết hợp đầy đủ 8 hình ảnh SGK: building (Sunset Building), flat (căn hộ 305), house (căn nhà), ninety-three (93), one one six (116 Hoa Binh Street), thirty-eight (38), tower (King Tower), twenty-three (23 Queen Street).'
                : selectedUnit.unitNumber === 3
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 8 hình ảnh SGK: active (năng động), American (nước Mĩ), Australian (nước Úc), clever (thông minh), friendly (thân thiện), helpful (tốt bụng), Malaysian (nước Ma-lai-xi-a), Japanese (nước Nhật Bản).'
                : selectedUnit.unitNumber === 7
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 8 hình ảnh SGK: do projects (làm bài tập dự án), fun (sự vui thích), good for group work (tốt cho hoạt động nhóm), interesting (thú vị), play games (chơi trò chơi), read books (đọc sách), solve maths problems (giải các bài toán), useful (có ích).'
                : selectedUnit.unitNumber === 8
                ? 'Bộ từ vựng chuẩn SGK Unit 8 kết hợp đầy đủ hình ảnh thực tế: set square (thước ê-ke của bạn Nam), in front of (bút ở đằng trước đồng hồ), glue stick (thỏi keo dán), pencil sharpener (cái gọt bút chì), above (ở phía trên - tranh trên cửa sổ), beside (bên cạnh - bút chì cạnh sách), under (ở phía dưới - tẩy dưới bàn), cùng đồ dùng & hoạt động lớp học.'
                : selectedUnit.unitNumber === 9
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ hình ảnh thực tế SGK Unit 9: aquarium (thuỷ cung), campsite (địa điểm cắm trại), dance around the campfire (nhảy múa quanh đống lửa trại), funfair (hội chợ giải trí), listen to music (nghe nhạc), play chess (chơi cờ), theatre (nhà hát), watch the fish (xem cá).'
                : selectedUnit.unitNumber === 10
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 8 hình ảnh thực tế SGK Unit 10: Bai Dinh Pagoda (Chùa Bái Đính), Ba Na Hills (Khu du lịch Bà Nà Hills - Cầu Vàng), Hoan Kiem Lake (Hồ Hoàn Kiếm - Tháp Rùa), plant trees (trồng cây), play games (chơi trò chơi công viên nước), Suoi Tien Theme Park (Công viên văn hóa Suối Tiên), visit the buildings (thăm những tòa nhà cổ), walk around the lake (đi bộ vòng quanh hồ).'
                : selectedUnit.unitNumber === 11
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 8 hình ảnh thực tế SGK Unit 11: buy souvenirs (mua quà lưu niệm), collect seashells (thu lượm, đi lấy vỏ sò), eat seafood (ăn hải sản), see some interesting places (thăm những nơi thú vị), take a boat trip around the bay (đi du lịch bằng tàu thuỷ vòng quanh vịnh), walk on the beach (đi bộ trên bãi biển), swim in the sea (bơi ở biển), take photos (chụp ảnh).'
                : selectedUnit.unitNumber === 12
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 10 hình ảnh thực tế SGK Unit 12: buy roses (mua hoa hồng), buy a branch of peach blossoms (mua một cành hoa đào), decorate the house (trang trí nhà), do the shopping (đi mua sắm), fireworks show (sự trình diễn pháo hoa), flower festival (hội chợ hoa), make banh chung (làm bánh chưng), make spring rolls (làm nem), New Year party (tiệc năm mới), visit grandparents (thăm ông bà ngày Tết).'
                : selectedUnit.unitNumber === 13
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 8 hình ảnh thực tế SGK Unit 13: apple juice (nước ép táo), at Mid-Autumn Festival (vào Tết Trung thu), burgers (những bánh mì kẹp thịt), on Children’s Day (vào ngày Quốc tế Thiếu nhi), on Sports Day (vào ngày hội thể thao), on Teachers’ Day (vào ngày Nhà giáo Việt Nam), milk tea (trà sữa), pizza (bánh pizza).'
                : selectedUnit.unitNumber === 14
                ? 'Bộ từ vựng chuẩn từ vocabulary.pdf kết hợp đầy đủ 10 hình ảnh thực tế SGK Unit 14: do morning exercise (tập thể dục buổi sáng), do yoga (tập yoga), drink fresh juice (nước ép tươi), eat healthy food (thức ăn tốt sức khỏe), eat vegetables (ăn rau), play sports (chơi thể thao), và các flashcard tần suất kèm hình ảnh lịch có dấu tick trực quan: every day (lịch 7 ngày có dấu tick), once a week (lịch 1 dấu tick), twice a week (lịch 2 dấu tick), three times a week (lịch 3 dấu tick).'
                : 'Bộ từ vựng chuẩn bám sát sách giáo khoa Tiếng Anh 5 Global Success (Bộ Giáo dục và Đào tạo).'}
            </p>
          </div>
        </div>
      </div>

      {/* Flashcard Work Area */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-amber-200 shadow-xs space-y-3">
          <div className="text-4xl">🔍</div>
          <h4 className="text-base font-black text-slate-700">Không tìm thấy từ vựng phù hợp</h4>
          <p className="text-xs text-slate-500">Hãy thử tìm từ khác hoặc chuyển chế độ lọc từ vựng.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterMode('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs"
          >
            Xem lại tất cả từ vựng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Stage (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action controls header */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">
                  Thẻ {currentWordIndex + 1} / {displayList.length}
                </span>

                {/* View Layout Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewLayout('flip_3d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      viewLayout === 'flip_3d' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${viewLayout === 'flip_3d' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                    <span>Thẻ lật 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('single_card')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewLayout === 'single_card' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chuẩn SGK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('grid_cards')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewLayout === 'grid_cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lưới thẻ</span>
                  </button>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-1.5">
                {/* Slideshow button */}
                {viewLayout !== 'grid_cards' && (
                  <button
                    type="button"
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      isAutoPlay
                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                    title="Tự động lật và đọc thẻ liên tục"
                  >
                    {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoPlay ? 'Dừng' : 'Trình chiếu'}</span>
                  </button>
                )}

                {/* Shuffle */}
                {viewLayout !== 'grid_cards' && (
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="p-1.5 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 transition-colors"
                    title="Trộn ngẫu nhiên"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                )}

                {/* Quiz Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsQuizActive(!isQuizActive)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    isQuizActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isQuizActive ? 'Xem thẻ gốc' : 'Đố vui'}</span>
                </button>
              </div>
            </div>

            {/* 3D FLIP CARD MODE (XOAY LẬT TƯƠNG TÁC) */}
            {viewLayout === 'flip_3d' && activeVocab && !isQuizActive && (
              <div className="space-y-4">
                <Interactive3DFlipCard
                  key={activeVocab.id}
                  vocab={activeVocab}
                  unitNumber={activeItem.unitNum}
                  unitTitle={activeItem.unitTitle}
                  isMastered={isMastered}
                  onToggleMastered={onToggleMastered}
                />

                {/* Prev / Next Bottom Navigation */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handlePrev}
                    disabled={currentWordIndex === 0}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thẻ trước (←)</span>
                  </button>

                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline-block">
                    💡 Chạm vào thẻ để lật 180° xem nghĩa tiếng Việt & ví dụ
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentWordIndex === displayList.length - 1}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                  >
                    <span>Thẻ tiếp (→)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SINGLE CARD MODE (WINDY BUI SGK) */}
            {viewLayout === 'single_card' && activeVocab && !isQuizActive && (
              <div className="space-y-4">
                <WindyFlashcardCard
                  vocab={activeVocab}
                  unitNumber={activeItem.unitNum}
                  unitTitle={activeItem.unitTitle}
                  isMastered={isMastered}
                  onToggleMastered={onToggleMastered}
                />

                {/* Prev / Next Bottom Navigation */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handlePrev}
                    disabled={currentWordIndex === 0}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Thẻ trước (←)</span>
                  </button>

                  <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
                    Dùng phím mũi tên ← → hoặc bấm vào thẻ để học
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentWordIndex === displayList.length - 1}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                  >
                    <span>Thẻ tiếp (→)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* GRID OF FLASHCARDS MODE (ALL WORDS AT A GLANCE) */}
            {viewLayout === 'grid_cards' && !isQuizActive && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayList.map((item, idx) => {
                  const isItemMastered = progress.masteredWords.includes(item.vocab.id);
                  return (
                    <div
                      key={item.vocab.id}
                      className="bg-white rounded-3xl border-2 border-amber-200/90 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 relative">
                          <VisualImage
                            src={item.vocab.imageUrl || getVocabularyImage(item.vocab.word, item.vocab.id)}
                            alt={item.vocab.word}
                            fallbackEmoji={item.vocab.imageEmoji}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {(item.vocab.word === 'ninety-three' || item.vocab.id === 'u2-v4') && (
                            <div className="absolute top-1 right-1 z-10 pointer-events-none">
                              <svg
                                className="w-6 h-6 text-red-600 filter drop-shadow-sm transform -rotate-45 animate-bounce"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2L4 11h5v9h6v-9h5L12 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {item.vocab.partOfSpeech}
                            </span>
                            {isItemMastered && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                ✓ Đã thuộc
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <h4 className="text-xl font-black text-red-600 truncate">
                              {item.vocab.word}
                            </h4>
                            {(item.vocab.word === 'ninety-three' || item.vocab.id === 'u2-v4') && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-600 text-white font-black text-xs rounded-md shadow-xs shrink-0">
                                ➔ 93
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700 font-mono">
                            {item.vocab.phonetic}
                          </p>
                          <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                            {item.vocab.meaningVi}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => speakEnglish(item.vocab.word, 0.85)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs transition-transform active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe đọc</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleMastered(item.vocab.id);
                            soundEffects.playCoin();
                          }}
                          className={`p-1.5 rounded-xl transition-colors ${
                            isItemMastered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-400 hover:text-emerald-600'
                          }`}
                          title={isItemMastered ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* QUICK QUIZ MODE */}
            {activeVocab && isQuizActive && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-6 sm:p-8 rounded-3xl border-2 border-indigo-200 shadow-lg text-center space-y-5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Thử thách trí nhớ Flashcard
                  </span>
                  <span>Điểm: {quizScore.correct}/{quizScore.total}</span>
                </div>

                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md">
                  <VisualImage
                    src={activeVocab.imageUrl || getVocabularyImage(activeVocab.word, activeVocab.id)}
                    alt={activeVocab.word}
                    fallbackEmoji={activeVocab.imageEmoji}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-3xl font-black text-slate-800">{activeVocab.word}</h3>
                  <p className="text-base font-mono text-indigo-700 font-semibold mt-1">{activeVocab.phonetic}</p>
                  <button
                    onClick={() => speakEnglish(activeVocab.word, 0.85)}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-black text-indigo-600 hover:text-indigo-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Nghe phát âm
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chọn nghĩa tiếng Việt chính xác:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {quizOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(opt)}
                      className="p-3.5 rounded-2xl bg-white hover:bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-400 text-slate-800 font-extrabold text-sm shadow-2xs hover:shadow-sm transition-all text-left"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className="p-3 rounded-xl bg-white border border-indigo-200 text-sm font-black text-indigo-900 animate-in zoom-in duration-200">
                    {quizFeedback}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Quick Word List & Filter (1 Col on lg) */}
          <div className="space-y-4">
            {/* Filter mode */}
            <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">Bộ lọc:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    filterMode === 'all'
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('unmastered')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    filterMode === 'unmastered'
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Chưa thuộc
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('mastered')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    filterMode === 'mastered'
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Đã thuộc
                </button>
              </div>
            </div>

            {/* List of vocabulary cards with thumbnails */}
            <div className="bg-white rounded-3xl border border-amber-200/80 p-3.5 shadow-xs space-y-2 max-h-[580px] overflow-y-auto">
              <div className="flex items-center justify-between px-1 pb-1 text-xs font-bold text-slate-500 border-b border-slate-100">
                <span>Danh mục từ ({displayList.length})</span>
                <span className="text-amber-700">Unit {selectedUnitNum}</span>
              </div>

              <div className="space-y-1.5">
                {displayList.map((item, idx) => {
                  const isSelected = idx === currentWordIndex && viewLayout === 'single_card';
                  const isItemMastered = progress.masteredWords.includes(item.vocab.id);

                  return (
                    <div
                      key={item.vocab.id}
                      onClick={() => {
                        setCurrentWordIndex(idx);
                        if (viewLayout === 'grid_cards') setViewLayout('single_card');
                        soundEffects.playGentleBeep();
                      }}
                      className={`flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-amber-50/60 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 relative">
                          <VisualImage
                            src={item.vocab.imageUrl || getVocabularyImage(item.vocab.word, item.vocab.id)}
                            alt={item.vocab.word}
                            fallbackEmoji={item.vocab.imageEmoji}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs text-slate-800 truncate">{item.vocab.word}</span>
                            <span className="text-[10px] text-amber-700 font-mono">{item.vocab.phonetic}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.vocab.meaningVi}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglish(item.vocab.word, 0.85);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                          title="Phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleMastered(item.vocab.id);
                            soundEffects.playCoin();
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            isItemMastered ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500'
                          }`}
                          title={isItemMastered ? 'Đã thuộc' : 'Chưa thuộc'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Success Sentence Pattern Card for Reference */}
            {selectedUnit.sentencePatterns && selectedUnit.sentencePatterns.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-3.5 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Mẫu câu ngữ pháp SGK Unit {selectedUnit.unitNumber}:</span>
                </div>
                <div className="space-y-2">
                  {selectedUnit.sentencePatterns.map((pat, idx) => (
                    <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                      <p className="font-extrabold text-slate-800">
                        {pat.pattern}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {pat.meaningVi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
