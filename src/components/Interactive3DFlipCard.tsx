import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import { Volume2, Check, RefreshCw, BookOpen, Sparkles, Maximize2, Zap } from 'lucide-react';
import { speakEnglish, soundEffects } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface Interactive3DFlipCardProps {
  vocab: VocabularyItem;
  unitNumber: number;
  unitTitle?: string;
  isMastered: boolean;
  onToggleMastered: (vocabId: string) => void;
  autoFlipped?: boolean;
}

// Frequency percentage helper for Unit 4 frequency adverbs
function getFrequencyBadge(word: string): { percent: number; label: string; color: string } | null {
  const lower = word.toLowerCase().trim();
  switch (lower) {
    case 'always':
      return { percent: 100, label: '100% - Luôn luôn (10/10 lần)', color: 'bg-emerald-600 text-white' };
    case 'usually':
      return { percent: 90, label: '90% - Thường thường (9/10 lần)', color: 'bg-lime-600 text-white' };
    case 'often':
      return { percent: 70, label: '70% - Hay, thường (7/10 lần)', color: 'bg-teal-600 text-white' };
    case 'sometimes':
      return { percent: 30, label: '30% - Thỉnh thoảng (3/10 lần)', color: 'bg-amber-500 text-white' };
    case 'rarely':
      return { percent: 10, label: '10% - Hiếm khi (1/10 lần)', color: 'bg-rose-500 text-white' };
    case 'never':
      return { percent: 0, label: '0% - Không bao giờ (0/10 lần)', color: 'bg-red-600 text-white' };
    default:
      return null;
  }
}

// Location and floor badge helper for Unit 6 school rooms & directions
function getUnit6LocationBadge(word: string): { label: string; color: string } | null {
  const lower = word.toLowerCase().trim();
  if (lower.includes('ground floor')) {
    return { label: 'Tầng trệt (Tầng dưới cùng)', color: 'bg-amber-600 text-white' };
  }
  if (lower.includes('first floor')) {
    return { label: 'Tầng 1 (Tầng trên tầng trệt)', color: 'bg-blue-600 text-white' };
  }
  if (lower.includes('second floor')) {
    return { label: 'Tầng 2 (Lầu hai)', color: 'bg-indigo-600 text-white' };
  }
  if (lower.includes('third floor')) {
    return { label: 'Tầng 3 (Lầu ba)', color: 'bg-purple-600 text-white' };
  }
  if (lower.includes('upstairs')) {
    return { label: 'Lên gác / Lên lầu (↑)', color: 'bg-emerald-600 text-white' };
  }
  if (lower.includes('downstairs')) {
    return { label: 'Xuống gác / Xuống lầu (↓)', color: 'bg-teal-600 text-white' };
  }
  if (lower.includes('go along')) {
    return { label: 'Đi dọc hành lang (→)', color: 'bg-cyan-700 text-white' };
  }
  if (lower.includes('past')) {
    return { label: 'Đi ngang qua (↷)', color: 'bg-sky-600 text-white' };
  }
  return null;
}

// Activity badge helper for Unit 7 school activities & reasons
function getUnit7ActivityBadge(word: string): { label: string; color: string } | null {
  const lower = word.toLowerCase().trim();
  if (lower.includes('do project')) {
    return { label: 'Hoạt động: Làm dự án học tập (Teamwork)', color: 'bg-blue-600 text-white' };
  }
  if (lower.includes('read book')) {
    return { label: 'Hoạt động: Đọc sách (Reading)', color: 'bg-emerald-600 text-white' };
  }
  if (lower.includes('solve maths')) {
    return { label: 'Hoạt động: Giải các bài toán (Maths)', color: 'bg-indigo-600 text-white' };
  }
  if (lower.includes('play game')) {
    return { label: 'Hoạt động: Chơi trò chơi (Games)', color: 'bg-amber-600 text-white' };
  }
  if (lower === 'fun') {
    return { label: 'Tính từ: Vui vẻ, sự vui thích', color: 'bg-rose-600 text-white' };
  }
  if (lower.includes('group work')) {
    return { label: 'Lợi ích: Rất tốt cho hoạt động nhóm', color: 'bg-violet-600 text-white' };
  }
  if (lower.includes('interesting')) {
    return { label: 'Tính từ: Thú vị, cuốn hút', color: 'bg-cyan-700 text-white' };
  }
  if (lower.includes('useful')) {
    return { label: 'Tính từ: Hữu ích, có ích', color: 'bg-teal-600 text-white' };
  }
  return null;
}

export const Interactive3DFlipCard: React.FC<Interactive3DFlipCardProps> = ({
  vocab,
  unitNumber,
  unitTitle,
  isMastered,
  onToggleMastered,
  autoFlipped = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(autoFlipped);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  const imageSrc = vocab.imageUrl || getVocabularyImage(vocab.word, vocab.id);
  const frequencyInfo = getFrequencyBadge(vocab.word);
  const locationInfo = getUnit6LocationBadge(vocab.word);
  const activityInfo = getUnit7ActivityBadge(vocab.word);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    soundEffects.playGentleBeep();
  };

  const handlePronounce = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakEnglish(vocab.word, speechSpeed);
    soundEffects.playGentleBeep();
  };

  const handlePronounceSentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakEnglish(vocab.exampleEn, speechSpeed);
  };

  const handleToggleMaster = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMastered(vocab.id);
    soundEffects.playCoin();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto [perspective:1200px] select-none">
      {/* 3D Rotating Container */}
      <div
        id={`flip-card-${vocab.id}`}
        onClick={handleFlip}
        className="relative w-full h-[460px] sm:h-[490px] rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer shadow-xl hover:shadow-2xl"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ======================================================== */}
        {/* FRONT SIDE (MẶT TRƯỚC: HÌNH ẢNH + TỪ ANH + PHIÊN ÂM)   */}
        {/* ======================================================== */}
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-amber-50 via-white to-sky-50 border-3 border-amber-300 p-5 sm:p-6 flex flex-col justify-between [backface-visibility:hidden] overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-sky-200/40 rounded-full blur-xl pointer-events-none" />

          {/* Top Bar: Badges & Quick Flip Action */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                Unit {unitNumber}
              </span>
              <span className="text-xs font-extrabold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200 uppercase">
                {vocab.partOfSpeech}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isMastered && (
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã thuộc
                </span>
              )}
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-white/90 border border-amber-200 px-2.5 py-1 rounded-full shadow-2xs animate-pulse">
                <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Chạm để lật</span>
              </div>
            </div>
          </div>

          {/* Center Content: Large Visual + English Word + Phonetic */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 gap-3">
            {/* Visual Image Frame */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenImage(true);
              }}
              className="relative w-full max-w-[320px] h-44 sm:h-52 rounded-2xl overflow-hidden bg-white border-2 border-amber-200/80 shadow-md group cursor-zoom-in"
            >
              <VisualImage
                src={imageSrc}
                alt={vocab.word}
                fallbackEmoji={vocab.imageEmoji}
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Emoji badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded-lg text-white text-xs font-black flex items-center gap-1">
                <span>{vocab.imageEmoji}</span>
              </div>

              {/* Fullscreen icon */}
              <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Word Typography */}
            <div className="text-center space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight drop-shadow-2xs">
                {vocab.word}
              </h2>
              <p className="text-base sm:text-lg font-bold text-slate-700 font-mono tracking-wide">
                {vocab.phonetic}
              </p>

              {/* Unit 4 Frequency Indicator Badge (if applicable) */}
              {frequencyInfo && (
                <div className="pt-1 flex items-center justify-center">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 ${frequencyInfo.color}`}>
                    <Zap className="w-3 h-3" />
                    <span>{frequencyInfo.label}</span>
                  </span>
                </div>
              )}

              {/* Unit 6 Floor & Direction Indicator Badge (if applicable) */}
              {locationInfo && (
                <div className="pt-1 flex items-center justify-center">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 ${locationInfo.color}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{locationInfo.label}</span>
                  </span>
                </div>
              )}

              {/* Unit 7 School Activity & Benefit Badge (if applicable) */}
              {activityInfo && (
                <div className="pt-1 flex items-center justify-center">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 ${activityInfo.color}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{activityInfo.label}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="relative z-10 pt-3 border-t border-amber-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePronounce}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-transform active:scale-95 shadow-sm"
                title="Nghe phát âm chuẩn tiếng Anh"
              >
                <Volume2 className="w-4 h-4" />
                <span>Nghe</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeechSpeed((prev) => (prev === 0.85 ? 0.65 : 0.85));
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  speechSpeed < 0.85
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-black'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Tốc độ phát âm (chậm / chuẩn)"
              >
                {speechSpeed < 0.85 ? '🐢 Chậm' : '🐇 Chuẩn'}
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700">
              <span>Xem mặt sau</span>
              <RefreshCw className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BACK SIDE (MẶT SAU: NGHĨA TIẾNG VIỆT + CÂU VÍ DỤ + THUỘC)*/}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-3 border-emerald-400 p-5 sm:p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-200/40 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />

          {/* Top Bar: Back header + flip back button */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Mặt sau: Nghĩa & Ví dụ
            </span>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/90 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs">
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>Chạm để lật lại</span>
            </div>
          </div>

          {/* Center Content: Meaning + Example + Mini Preview */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 gap-3 w-full">
            {/* Vietnamese Meaning Banner */}
            <div className="w-full bg-white/90 border-2 border-emerald-300 rounded-2xl p-4 text-center shadow-xs">
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                Nghĩa Tiếng Việt
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                {vocab.meaningVi}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Từ gốc: <span className="font-extrabold text-red-600">{vocab.word}</span>{' '}
                <span className="font-mono text-slate-600">({vocab.phonetic})</span>
              </p>

              {activityInfo && (
                <div className="pt-2 flex items-center justify-center">
                  <span className={`text-[11px] font-black px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5 ${activityInfo.color}`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{activityInfo.label}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Example Sentence Box */}
            {vocab.exampleEn && (
              <div className="w-full bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-900 uppercase flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Ví dụ SGK chuẩn:
                  </span>
                  <button
                    type="button"
                    onClick={handlePronounceSentence}
                    className="p-1 rounded-lg bg-white border border-amber-200 text-amber-700 hover:text-amber-900 transition-colors shadow-2xs flex items-center gap-1 text-[10px] font-bold"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nghe câu</span>
                  </button>
                </div>
                <p className="font-extrabold text-slate-800 text-sm leading-snug">
                  "{vocab.exampleEn}"
                </p>
                <p className="text-slate-600 italic text-xs">
                  "{vocab.exampleVi}"
                </p>
              </div>
            )}

            {/* Frequency Progress Bar for Frequency Words */}
            {frequencyInfo && (
              <div className="w-full bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Mức độ thường xuyên:</span>
                  <span className="font-extrabold text-emerald-700">{frequencyInfo.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-600 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(frequencyInfo.percent, 3)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Mastered Status Toggle */}
          <div className="relative z-10 pt-3 border-t border-emerald-200/80 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 truncate max-w-[160px] sm:max-w-xs">
              {unitTitle || `Unit ${unitNumber}`}
            </span>

            <button
              type="button"
              onClick={handleToggleMaster}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm ${
                isMastered
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white text-slate-700 border-2 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Check className="w-4 h-4 text-current" />
              <span>{isMastered ? 'Đã thuộc từ này ⭐' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenImage && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreenImage(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden p-4 shadow-2xl">
            <VisualImage
              src={imageSrc}
              alt={vocab.word}
              fallbackEmoji={vocab.imageEmoji}
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl bg-white"
            />
            <div className="p-3 text-center space-y-1">
              <h4 className="text-2xl font-black text-red-600">{vocab.word}</h4>
              <p className="text-sm font-bold text-slate-700 font-mono">{vocab.phonetic}</p>
              <p className="text-base font-extrabold text-emerald-700">{vocab.meaningVi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
