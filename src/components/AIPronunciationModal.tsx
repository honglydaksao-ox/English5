import React, { useState, useEffect, useRef } from 'react';
import { UnitData, PronunciationEvaluation, GeminiModelId } from '../types';
import { X, Mic, MicOff, Volume2, Sparkles, Star, Award, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, KeyRound, AlertTriangle } from 'lucide-react';
import { speakEnglish, soundEffects, triggerCelebration } from '../utils/soundAndSpeech';
import {
  evaluatePronunciationWithFallback,
  hasConfiguredApiKey,
  getStoredModel,
} from '../services/geminiClient';

interface AIPronunciationModalProps {
  unit: UnitData;
  onClose: () => void;
  onAwardCoinsAndStars: (coins: number, stars: number, target: string, score: number) => void;
  onOpenSettings?: () => void;
}

export const AIPronunciationModal: React.FC<AIPronunciationModalProps> = ({
  unit,
  onClose,
  onAwardCoinsAndStars,
  onOpenSettings,
}) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const currentTarget = unit.pronunciationTargets[selectedTargetIndex] || unit.pronunciationTargets[0];

  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // AI execution and fallback tracking
  const [attemptedModel, setAttemptedModel] = useState<string>(getStoredModel());
  const [isFallbackAttempt, setIsFallbackAttempt] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'analyzing' | 'completed' | 'error'>('idle');

  // Web Speech Recognition reference
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Reset state when target changes
    setRecordedText('');
    setEvaluation(null);
    setErrorMessage('');
    setApiError(null);
    setExecutionStatus('idle');
  }, [selectedTargetIndex]);

  const handlePlaySampleAudio = () => {
    speakEnglish(currentTarget.text, 0.82);
  };

  const startRecording = () => {
    setErrorMessage('');
    setApiError(null);
    setRecordedText('');
    setEvaluation(null);
    setExecutionStatus('idle');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecordedText(currentTarget.text);
      soundEffects.playGentleBeep();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        soundEffects.playGentleBeep();
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setRecordedText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Vui lòng cho phép quyền truy cập Micro trên trình duyệt để ghi âm.');
        } else {
          setRecordedText(currentTarget.text);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setRecordedText(currentTarget.text);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleAnalyzeWithAI = async () => {
    if (!recordedText.trim()) {
      setErrorMessage('Bé chưa nói gì nè! Hãy nhấn vào nút Micro và đọc to câu tiếng Anh nhé.');
      return;
    }

    if (!hasConfiguredApiKey()) {
      setApiError('Chưa có API Key. Vui lòng bấm vào nút [Lấy API Key] trên Header hoặc nút bên dưới để nhập mã API Key Gemini.');
      setExecutionStatus('error');
      soundEffects.playWrong();
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setApiError(null);
    setExecutionStatus('analyzing');
    setIsFallbackAttempt(false);

    try {
      const { result, modelUsed } = await evaluatePronunciationWithFallback(
        currentTarget.text,
        recordedText,
        `Unit ${unit.unitNumber}: ${unit.titleEn} (Global Success 5)`,
        (model, isFallback) => {
          setAttemptedModel(model);
          setIsFallbackAttempt(isFallback);
        }
      );

      setEvaluation(result);
      setExecutionStatus('completed');
      setAttemptedModel(modelUsed);

      if (result.score >= 80) {
        soundEffects.playSuccess();
        triggerCelebration();
      } else {
        soundEffects.playCoin();
      }

      onAwardCoinsAndStars(result.bonusCoins || 20, result.stars || 2, currentTarget.text, result.score);
    } catch (err: any) {
      console.error('Lỗi phân tích phát âm AI:', err);
      setExecutionStatus('error');
      setApiError(err.message || 'Lỗi kết nối với dịch vụ Gemini AI');
      soundEffects.playWrong();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-purple-400/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Trợ lý AI Luyện Phát Âm
                </span>
                <span className="text-xs text-purple-200">Unit {unit.unitNumber}</span>
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
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {unit.pronunciationTargets.map((target, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTargetIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTargetIndex === idx
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mẫu {idx + 1}: "{target.text.slice(0, 20)}..."
              </button>
            ))}
          </div>

          {/* Practice Card */}
          <div className="bg-purple-50/70 border-2 border-purple-200 rounded-3xl p-5 sm:p-6 text-center relative overflow-hidden">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-200 text-purple-800 text-xs font-extrabold mb-3">
              🎯 Trọng tâm phát âm: {currentTarget.soundFocus}
            </span>

            {/* Target English Sentence */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1">
              "{currentTarget.text}"
            </h2>
            <p className="text-sm font-semibold text-purple-700 font-mono mb-3">
              {currentTarget.phonetic}
            </p>

            <p className="text-xs text-slate-600 italic bg-white/70 inline-block px-3 py-1.5 rounded-xl border border-purple-100">
              💡 Mẹo từ SGK: {currentTarget.sampleTips}
            </p>

            {/* Audio Listen Button */}
            <div className="mt-4 flex justify-center">
              <button
                id="btn-listen-sample-audio"
                onClick={handlePlaySampleAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-700 font-bold text-xs sm:text-sm shadow-xs border border-purple-200 hover:bg-purple-100 transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span>Nghe cô giáo đọc mẫu</span>
              </button>
            </div>
          </div>

          {/* Recording & Voice Capture Area */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Giọng nói của bé
            </p>

            <div className="min-h-[50px] flex items-center justify-center px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
              {recordedText ? (
                <span className="text-purple-900 font-bold">"{recordedText}"</span>
              ) : (
                <span className="text-slate-400 italic">
                  {isRecording ? 'Đang lắng nghe... Bé hãy nói to rõ nhé!' : 'Bấm nút Micro màu tím bên dưới để bắt đầu nói...'}
                </span>
              )}
            </div>

            {/* Micro Record Control */}
            <div className="mt-4 flex flex-col items-center justify-center gap-2">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75 pointer-events-none" />
                )}
                <button
                  id="btn-record-voice"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90 ${
                    isRecording
                      ? 'bg-rose-500 scale-105 ring-4 ring-rose-300'
                      : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7 animate-bounce" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <span className="text-xs font-bold text-slate-600">
                {isRecording ? 'Đang thu âm... Bấm để dừng lại' : 'Nhấn Micro để nói'}
              </span>
            </div>

            {/* Quick manual typing fallback option */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => setRecordedText(currentTarget.text)}
                className="text-[11px] text-purple-600 hover:underline font-semibold"
              >
                (Thử câu nói mẫu chuẩn của bé)
              </button>
            </div>
          </div>

          {/* Local Micro warning if any */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fallback Notice Bar */}
          {isAnalyzing && isFallbackAttempt && (
            <div className="flex items-center justify-center gap-2 p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Đang tự động chuyển sang model dự phòng ({attemptedModel})...</span>
            </div>
          )}

          {/* ERROR DISPLAY (Strict compliance with AI_INSTRUCTIONS.md) */}
          {executionStatus === 'error' && apiError && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                      Đã dừng do lỗi
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800">
                      Model: {attemptedModel}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-rose-900 leading-relaxed font-mono">
                    {apiError}
                  </p>
                </div>
              </div>

              {onOpenSettings && (
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700 font-medium">
                    Hết hạn mức hoặc chưa cấu hình API key?
                  </span>
                  <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Mở Cài đặt API Key</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Pronunciation Evaluation Results (Only when actually succeeded) */}
          {executionStatus === 'completed' && evaluation && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-3xl p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                    {evaluation.score}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-600 uppercase">Điểm phát âm AI</span>
                    <h4 className="text-lg font-black text-slate-800">{evaluation.rating}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300 text-amber-900 font-extrabold text-xs">
                    {Array.from({ length: evaluation.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                    ))}
                    <span>+{evaluation.stars} Sao</span>
                  </div>

                  <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300 text-yellow-900 font-extrabold text-xs">
                    <span>🪙 +{evaluation.bonusCoins} Xu</span>
                  </div>
                </div>
              </div>

              {/* AI Mascot Feedback */}
              <div className="bg-white p-4 rounded-2xl border border-purple-200 flex items-start gap-3">
                <span className="text-3xl">🦉</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-purple-700 uppercase">Nhận xét từ Thầy Cú BiBo:</p>
                    <span className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      Model: {attemptedModel}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{evaluation.feedbackVi}</p>
                </div>
              </div>

              {/* Sound Tips */}
              {evaluation.soundTips && evaluation.soundTips.length > 0 && (
                <div className="bg-white/80 p-3.5 rounded-2xl border border-purple-100">
                  <p className="text-xs font-bold text-indigo-900 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Mẹo phát âm để đạt 100 điểm:
                  </p>
                  <ul className="space-y-1">
                    {evaluation.soundTips.map((tip, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-700 flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setRecordedText('');
                setEvaluation(null);
                setApiError(null);
                setExecutionStatus('idle');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>

            <button
              id="btn-evaluate-pronunciation"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || !recordedText.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isFallbackAttempt
                      ? `Đang thử model dự phòng (${attemptedModel})...`
                      : 'Thầy Cú AI đang chấm điểm...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Chấm điểm & Nhận xét với AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
