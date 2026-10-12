import React, { useState } from 'react';
import { X, KeyRound, Sparkles, ExternalLink, Check, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, RefreshCw, CheckCircle } from 'lucide-react';
import { GeminiModelId } from '../types';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  getStoredModel,
  setStoredApiKey,
  setStoredModel,
  testGeminiApiKey,
  SYSTEM_KEY_POOL,
  getSystemKeyInfo,
} from '../services/geminiClient';
import { soundEffects } from '../utils/soundAndSpeech';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isInitialRequired?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isInitialRequired = false,
}) => {
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(() => getStoredModel());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; modelUsed?: string } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const keyInfo = getSystemKeyInfo();

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    soundEffects.playGentleBeep();

    try {
      // Test either custom key or rotating system key
      const keyToTest = apiKey.trim() || SYSTEM_KEY_POOL[0];
      const res = await testGeminiApiKey(keyToTest, selectedModel);
      setTestResult(res);
      if (res.success) {
        soundEffects.playCorrect();
      } else {
        soundEffects.playWrong();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối với Google AI.',
      });
      soundEffects.playWrong();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSaveSuccessNotice(true);
    soundEffects.playLevelUp();

    setTimeout(() => {
      setSaveSuccessNotice(false);
      onSaved?.();
      onClose();
    }, 700);
  };

  const handleResetToSystemPool = () => {
    setApiKey('');
    setStoredApiKey('');
    setTestResult(null);
    soundEffects.playGentleBeep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-md">
                  AI Hub Lớp 5
                </span>
                <span className="text-xs text-emerald-100">4 Key Quay Vòng Tự Động</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                Thiết Lập Model & API Key
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Thông báo nhóm Key quay vòng tự động cho học sinh */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Học sinh dùng App hoàn toàn miễn phí & không cần nhập Key!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Ứng dụng đã được tích hợp sẵn <strong>{SYSTEM_KEY_POOL.length} Google Gemini API Key chất lượng cao</strong> hoạt động theo cơ chế quay vòng tự động (Round-Robin). Nếu một key đạt giới hạn tạm thời, hệ thống sẽ tự động chuyển sang key kế tiếp ngay lập tức.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-emerald-700">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300">
                🔄 {SYSTEM_KEY_POOL.length} Key Hệ Thống Sẵn Sàng
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-800">
                ⚡ Tự động Fallback khi đầy tải
              </span>
            </div>
          </div>

          {/* 1. Chọn Model AI (Cards) */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              1. Chọn Model AI Hoạt Động (Ưu tiên):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      soundEffects.playGentleBeep();
                    }}
                    className={`relative cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${model.badgeColor}`}>
                          {model.tag}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mb-1">
                        {model.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {model.description}
                      </p>
                    </div>

                    {model.isDefault && (
                      <span className="mt-3 inline-block text-[10px] font-bold text-indigo-700">
                        ⭐ Khuyên Dùng
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-700 italic">
              * Hệ thống có cơ chế <span className="font-bold text-slate-800">Tự động Fallback</span>: Nếu model được chọn gặp lỗi hoặc đầy tải (429), app sẽ lập tức tự động thử lại với các model dự phòng và các key trong pool.
            </p>
          </div>

          {/* 2. Nhập API Key riêng (Tùy chọn) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                2. API Key Cá Nhân (Tùy chọn dành cho Giáo viên / Admin):
              </label>
              {apiKey.trim() && (
                <button
                  type="button"
                  onClick={handleResetToSystemPool}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Dùng lại Key hệ thống</span>
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Để trống để dùng 4 Key hệ thống quay vòng tự động..."
                className="w-full pl-10 pr-20 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden font-mono text-xs sm:text-sm text-slate-800 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Để trống: Hệ thống sẽ tự động dùng 4 Key quay vòng.</span>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Lấy key Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Test result status feedback */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 font-medium animate-in fade-in duration-150 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  {testResult.success && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Model thử nghiệm: {testResult.modelUsed || selectedModel}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
          >
            {isTesting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <span>Kiểm tra kết nối AI</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-600 text-xs font-bold transition-all"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              {saveSuccessNotice ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <span>Lưu Thiết Lập</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
