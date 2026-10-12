import React, { useState } from 'react';
import { UnitData, VocabularyItem } from '../types';
import { X, Volume2, MessageSquare, BookOpen, Sparkles, CheckCircle2, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';
import { speakEnglish, soundEffects } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface VisualLessonModalProps {
  unit: UnitData;
  onClose: () => void;
}

export const VisualLessonModal: React.FC<VisualLessonModalProps> = ({ unit, onClose }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-blue-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Bài Giảng Trực Quan Sinh Động
                </span>
                <span className="text-xs text-blue-100">Unit {unit.unitNumber}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black">{unit.titleEn} ({unit.titleVi})</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Core Sentence Patterns */}
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-black text-sm mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. Mẫu câu trọng tâm (Sentence Patterns)</span>
            </div>

            <div className="space-y-3">
              {unit.sentencePatterns.map((sp, idx) => (
                <div key={sp.id || idx} className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-blue-900 text-sm sm:text-base">
                        {sp.pattern}
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        👉 Dùng để: {sp.meaningVi}
                      </p>
                    </div>
                    <button
                      onClick={() => speakEnglish(sp.pattern.replace(/\[.*?\]/g, 'Hanoi'), 0.85)}
                      className="p-2 rounded-xl bg-white text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-xs active:scale-95 transition-all"
                      title="Nghe mẫu câu"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Let's Talk Comic / Interactive Dialogue */}
          <div>
            <div className="flex items-center gap-2 text-indigo-900 font-black text-sm mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>2. Hội thoại mẫu sinh động (Let's Talk)</span>
            </div>

            {unit.sentencePatterns.map((sp) => (
              <div key={sp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                {/* Speaker A */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-900 flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                    {sp.dialogue.speakerA}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-700">{sp.dialogue.speakerA}:</span>
                      <button
                        onClick={() => speakEnglish(sp.dialogue.textA, 0.85)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">"{sp.dialogue.textA}"</p>
                    <p className="text-xs font-medium text-slate-500 italic mt-0.5">({sp.dialogue.textAVi})</p>
                  </div>
                </div>

                {/* Speaker B */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-200 shadow-xs text-right">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => speakEnglish(sp.dialogue.textB, 0.85)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-blue-700">{sp.dialogue.speakerB}:</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">"{sp.dialogue.textB}"</p>
                    <p className="text-xs font-medium text-slate-500 italic mt-0.5">({sp.dialogue.textBVi})</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                    {sp.dialogue.speakerB}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: SGK Vocabulary Highlights */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>3. Bảng từ vựng hình ảnh minh họa ({unit.vocabulary.length} từ)</span>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Thẻ ảnh sinh động</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Danh sách</span>
                </button>
              </div>
            </div>

            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {unit.vocabulary.map((vocab) => {
                  const imageSrc = vocab.imageUrl || getVocabularyImage(vocab.word, vocab.id);
                  return (
                    <div
                      key={vocab.id}
                      className="bg-white border-2 border-slate-200/80 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Image header with fallback emoji badge */}
                      <div className="relative w-full h-32 bg-slate-100 overflow-hidden">
                        <VisualImage
                          src={imageSrc}
                          alt={vocab.word}
                          fallbackEmoji={vocab.imageEmoji}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-xs rounded-lg text-white text-xs font-black flex items-center gap-1">
                          <span>{vocab.imageEmoji}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs rounded-lg text-white text-[11px] font-black uppercase">
                          {vocab.partOfSpeech}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="text-base font-black text-slate-800 tracking-tight">
                              {vocab.word}
                            </h5>
                            <button
                              onClick={() => speakEnglish(vocab.word, 0.85)}
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs font-bold text-amber-700 font-mono">
                            {vocab.phonetic}
                          </p>
                          <p className="text-xs font-black text-emerald-800 mt-1">
                            {vocab.meaningVi}
                          </p>
                        </div>

                        {vocab.exampleEn && (
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                            <p className="font-extrabold text-slate-700 leading-tight">
                              "{vocab.exampleEn}"
                            </p>
                            <p className="text-slate-500 italic">
                              "{vocab.exampleVi}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unit.vocabulary.map((vocab) => {
                  const imageSrc = vocab.imageUrl || getVocabularyImage(vocab.word, vocab.id);
                  return (
                    <div
                      key={vocab.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-emerald-300 transition-all gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 relative bg-slate-100">
                          <VisualImage
                            src={imageSrc}
                            alt={vocab.word}
                            fallbackEmoji={vocab.imageEmoji}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate">{vocab.word}</span>
                            <span className="text-[10px] text-amber-700 font-mono">{vocab.phonetic}</span>
                          </div>
                          <span className="text-xs text-emerald-800 font-bold block truncate">{vocab.meaningVi}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => speakEnglish(vocab.word, 0.85)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors shrink-0"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            Đã nắm rõ bài học
          </button>
        </div>
      </div>
    </div>
  );
};
