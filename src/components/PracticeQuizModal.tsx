import React, { useState } from 'react';
import { UnitData, PracticeQuestion } from '../types';
import { X, CheckCircle2, XCircle, ArrowRight, HelpCircle, Trophy, RotateCcw } from 'lucide-react';
import { soundEffects, triggerCelebration } from '../utils/soundAndSpeech';

interface PracticeQuizModalProps {
  unit: UnitData;
  onClose: () => void;
  onCompleteQuiz: (score: number, starsEarned: number) => void;
}

export const PracticeQuizModal: React.FC<PracticeQuizModalProps> = ({
  unit,
  onClose,
  onCompleteQuiz,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // For sentence ordering type
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  const questions = unit.practiceQuestions;
  const currentQuestion = questions[currentIdx] || questions[0];

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer && currentQuestion.type === 'multiple_choice') return;
    if (currentQuestion.type === 'sentence_order' && orderedWords.length === 0) return;

    setIsAnswerChecked(true);

    let isCorrect = false;
    if (currentQuestion.type === 'multiple_choice') {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'sentence_order') {
      const studentSentence = orderedWords.join(' ').trim().toLowerCase();
      const expectedSentence = Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.join(' ').trim().toLowerCase()
        : String(currentQuestion.correctAnswer).trim().toLowerCase();
      isCorrect = (JSON.stringify(orderedWords) === JSON.stringify(currentQuestion.correctAnswer)) || (studentSentence === expectedSentence);
    }

    if (isCorrect) {
      soundEffects.playSuccess();
      setScoreCount(prev => prev + 1);
    } else {
      soundEffects.playGentleBeep();
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setOrderedWords([]);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
      const finalScore = Math.round((scoreCount / questions.length) * 100);
      const starsEarned = finalScore >= 80 ? 3 : finalScore >= 50 ? 2 : 1;
      soundEffects.playLevelUp();
      triggerCelebration();
      onCompleteQuiz(finalScore, starsEarned);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setOrderedWords([]);
    setIsAnswerChecked(false);
    setScoreCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-emerald-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Bài Tập SGK Global Success 5
                </span>
                <span className="text-xs text-emerald-100">Unit {unit.unitNumber}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black">{unit.titleEn}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {!isFinished ? (
            <div className="space-y-5">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Câu hỏi {currentIdx + 1} / {questions.length}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Điểm hiện tại: {scoreCount} / {questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {currentIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800">
                      {currentQuestion.question}
                    </h3>
                    {currentQuestion.questionVi && (
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        {currentQuestion.questionVi}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Multiple Choice Options */}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentQuestion.correctAnswer;

                    let btnStyle = 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50';
                    if (isSelected && !isAnswerChecked) {
                      btnStyle = 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300';
                    } else if (isAnswerChecked) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-extrabold ring-2 ring-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-300';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt)}
                        disabled={isAnswerChecked}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isAnswerChecked && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswerChecked && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sentence Order Type */}
              {currentQuestion.type === 'sentence_order' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="min-h-[50px] p-3 bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-wrap gap-2 items-center">
                    {orderedWords.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        Bấm vào các từ bên dưới để xếp theo đúng trật tự ngữ pháp
                      </span>
                    ) : (
                      orderedWords.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          onClick={() => {
                            if (isAnswerChecked) return;
                            setOrderedWords(orderedWords.filter((_, idx) => idx !== wIdx));
                          }}
                          className="px-3 py-1.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-xs border border-emerald-200 cursor-pointer hover:bg-rose-50 hover:text-rose-700"
                        >
                          {word} ✕
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.options.map((opt, i) => {
                      const isUsed = orderedWords.includes(opt);
                      return (
                        <button
                          key={i}
                          disabled={isUsed || isAnswerChecked}
                          onClick={() => setOrderedWords([...orderedWords, opt])}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isUsed
                              ? 'bg-slate-100 text-slate-400 opacity-50'
                              : 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation Box */}
              {isAnswerChecked && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-900">Giải thích chi tiết:</p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {currentQuestion.explanationVi}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {!isAnswerChecked ? (
                  <button
                    id="btn-check-quiz-answer"
                    onClick={handleCheckAnswer}
                    disabled={!selectedAnswer && orderedWords.length === 0}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    id="btn-next-quiz-question"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Finished Summary screen */
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
                🏆
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Xuất sắc hoàn thành bài tập!
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Bé đã đạt <span className="text-emerald-600 font-extrabold">{scoreCount} / {questions.length}</span> câu đúng ({Math.round((scoreCount / questions.length) * 100)}%) trong Unit {unit.unitNumber}!
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[100px]">
                  <span className="text-emerald-600 text-xl font-black">🎯</span>
                  <p className="text-xs font-bold text-slate-600 mt-1">Kết quả</p>
                  <p className="text-base font-black text-emerald-800">{scoreCount}/{questions.length} câu</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[100px]">
                  <span className="text-amber-500 text-xl">⭐</span>
                  <p className="text-xs font-bold text-slate-600 mt-1">Sao đạt được</p>
                  <p className="text-base font-black text-amber-800">+{scoreCount >= 8 ? 3 : scoreCount >= 5 ? 2 : 1} Sao</p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-200 text-center min-w-[100px]">
                  <span className="text-xl">🪙</span>
                  <p className="text-xs font-bold text-slate-600 mt-1">Xu thưởng</p>
                  <p className="text-base font-black text-yellow-800">+{scoreCount * 5} Xu</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs"
                >
                  Hoàn tất bài học
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
