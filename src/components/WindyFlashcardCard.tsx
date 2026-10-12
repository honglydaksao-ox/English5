import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import { Volume2, Volume1, Check, RefreshCw, BookOpen, Sparkles, Maximize2 } from 'lucide-react';
import { speakEnglish, soundEffects } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface WindyFlashcardCardProps {
  vocab: VocabularyItem;
  unitNumber: number;
  unitTitle?: string;
  isMastered: boolean;
  onToggleMastered: (vocabId: string) => void;
  showBackDefault?: boolean;
}

export const WindyFlashcardCard: React.FC<WindyFlashcardCardProps> = ({
  vocab,
  unitNumber,
  unitTitle,
  isMastered,
  onToggleMastered,
  showBackDefault = false,
}) => {
  const [showMeaning, setShowMeaning] = useState(showBackDefault);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  const imageSrc = vocab.imageUrl || getVocabularyImage(vocab.word, vocab.id);

  const handlePronounce = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakEnglish(vocab.word, speechSpeed);
    soundEffects.playGentleBeep();
  };

  const handlePronounceSentence = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakEnglish(vocab.exampleEn, speechSpeed);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border-2 border-amber-200/90 transition-all select-none">
      {/* Background: Dreamy pastel starry sky inspired directly by the PDF */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-sky-50 to-pink-50 opacity-95" />

      {/* Decorative Pastel Clouds & Stars */}
      <div className="absolute top-2 left-3 flex items-center gap-1.5 opacity-90 pointer-events-none">
        <div className="text-2xl animate-bounce duration-1000">☁️</div>
        <span className="text-[10px] font-black text-amber-600/80 bg-white/70 px-2 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
          Unit {unitNumber}
        </span>
      </div>

      {/* Floating stars and hearts */}
      <div className="absolute bottom-2 left-4 text-xs opacity-70 pointer-events-none">⭐</div>
      <div className="absolute top-8 left-1/3 text-xs opacity-70 pointer-events-none">✨</div>
      <div className="absolute bottom-3 right-8 text-xs opacity-70 pointer-events-none">💖</div>
      <div className="absolute top-1/2 right-3 text-xs opacity-60 pointer-events-none">🌟</div>

      {/* Main Flashcard Container: Split Layout (Illustration on Left + Dashed Card on Right) */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-7 pt-11 sm:pt-12 flex flex-col md:flex-row items-center gap-5 lg:gap-8">
        {/* LEFT: Cartoon Illustration with rounded frame */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div
            onClick={() => setIsFullscreenImage(true)}
            className="relative w-full max-w-[320px] sm:max-w-[360px] h-48 sm:h-56 md:h-64 rounded-3xl overflow-hidden shadow-md border-3 border-white bg-white group cursor-pointer"
          >
            <VisualImage
              src={imageSrc}
              alt={vocab.word}
              fallbackEmoji={vocab.imageEmoji}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Big red arrow pointing to number 93 for ninety-three */}
            {(vocab.word === 'ninety-three' || vocab.id === 'u2-v4') && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 pointer-events-none flex items-center gap-1.5 animate-bounce">
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-lg border-2 border-white tracking-wider flex items-center gap-1">
                  🎯 Số 93
                </span>
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transform -rotate-45"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L4 11h5v9h6v-9h5L12 2z" />
                </svg>
              </div>
            )}

            {/* Corner emoji badge */}
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-xl text-white text-sm font-black flex items-center gap-1.5 shadow-xs">
              <span className="text-base">{vocab.imageEmoji}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">{vocab.partOfSpeech}</span>
            </div>

            {/* Fullscreen hover hint */}
            <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* RIGHT: Signature White Card with Dashed Red Border (Windy Bui layout) */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-3xl border-3 border-dashed border-red-400/90 shadow-lg p-5 sm:p-7 flex flex-col items-center justify-between min-h-[220px] sm:min-h-[260px] transition-all">
            {/* Top mini header */}
            <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 pb-1">
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-500" /> Chuẩn Global Success 5
              </span>
              {isMastered && (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-extrabold">
                  <Check className="w-3 h-3" /> Đã thuộc
                </span>
              )}
            </div>

            {/* Main Word + Phonetics OR Meaning side */}
            {!showMeaning ? (
              <div className="my-auto py-3 text-center space-y-2">
                {/* Bold Red English Word (Signature PDF Style) */}
                <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-red-600 tracking-tight leading-tight drop-shadow-2xs">
                  {vocab.word}
                </h3>

                {/* Phonetic Transcription */}
                <p className="text-base sm:text-xl font-bold text-slate-800 font-mono tracking-wider">
                  {vocab.phonetic}
                </p>

                {/* Big red arrow pointing to 93 */}
                {(vocab.word === 'ninety-three' || vocab.id === 'u2-v4') && (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Chỉ số:</span>
                    <svg
                      className="w-9 h-9 text-red-600 animate-pulse drop-shadow-md"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 11h9.17l-3.59-3.59L12 6l6 6-6 6-1.41-1.41L14.17 13H5v-2z" />
                    </svg>
                    <span className="px-3.5 py-1 bg-red-600 text-white font-black text-2xl rounded-2xl shadow-lg border-2 border-white tracking-tight">
                      93
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto py-2 text-center space-y-2.5 w-full">
                <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    Nghĩa Tiếng Việt
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
                    {vocab.meaningVi}
                  </h4>
                </div>

                {vocab.exampleEn && (
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-600" /> Ví dụ SGK:
                      </span>
                      <button
                        onClick={handlePronounceSentence}
                        className="text-amber-700 hover:text-amber-900 transition-colors"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-extrabold text-slate-800 leading-snug">
                      "{vocab.exampleEn}"
                    </p>
                    <p className="text-slate-500 italic">
                      "{vocab.exampleVi}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions: Audio & Flip */}
            <div className="w-full flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              {/* Audio Listen Button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePronounce}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs border border-red-200 transition-transform active:scale-95 shadow-2xs"
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 className="w-4 h-4 text-red-600" />
                  <span>Nghe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeechSpeed(prev => prev === 0.85 ? 0.7 : 0.85)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                    speechSpeed < 0.85
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Đổi tốc độ phát âm (chậm / vừa)"
                >
                  {speechSpeed < 0.85 ? '🐢 Chậm' : '🐇 Chuẩn'}
                </button>
              </div>

              {/* Flip / Show Meaning Button */}
              <button
                type="button"
                onClick={() => {
                  setShowMeaning(!showMeaning);
                  soundEffects.playGentleBeep();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-black text-xs border border-slate-200 hover:border-emerald-300 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{showMeaning ? 'Xem từ Anh' : 'Xem nghĩa'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Mastered Status */}
      <div className="relative z-10 px-4 sm:px-6 py-2 bg-white/70 backdrop-blur-xs border-t border-amber-200/60 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-semibold truncate max-w-[200px] sm:max-w-xs">
          {unitTitle || `Unit ${unitNumber}`}
        </span>
        <button
          type="button"
          onClick={() => {
            onToggleMastered(vocab.id);
            soundEffects.playCoin();
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold transition-all active:scale-95 ${
            isMastered
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isMastered ? 'Đã thuộc từ này' : 'Chưa thuộc'}</span>
        </button>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isFullscreenImage && (
        <div
          onClick={() => setIsFullscreenImage(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-3xl overflow-hidden p-3 shadow-2xl">
            <VisualImage
              src={imageSrc}
              alt={vocab.word}
              fallbackEmoji={vocab.imageEmoji}
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
            <div className="p-3 text-center">
              <h4 className="text-2xl font-black text-red-600">{vocab.word}</h4>
              <p className="text-base font-bold text-slate-700 font-mono">{vocab.phonetic}</p>
              <p className="text-sm font-semibold text-emerald-700">{vocab.meaningVi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
