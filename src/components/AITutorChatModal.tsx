import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Volume2, Bot, User, CornerDownLeft, KeyRound, AlertTriangle } from 'lucide-react';
import { speakEnglish, soundEffects } from '../utils/soundAndSpeech';
import {
  chatWithTutorWithFallback,
  hasConfiguredApiKey,
  getStoredModel,
} from '../services/geminiClient';
import { GeminiModelId } from '../types';

interface AITutorChatModalProps {
  onClose: () => void;
  studentName: string;
  onOpenSettings?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

export const AITutorChatModal: React.FC<AITutorChatModalProps> = ({
  onClose,
  studentName,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Chào bé ${studentName}! 🦉 Thầy Cú BiBo đây! Thầy luôn sẵn sàng giải đáp mọi thắc mắc về từ vựng, ngữ pháp tiếng Anh lớp 5 Global Success cho bé nhé. Hôm nay bé cần thầy hỗ trợ gì nào?`,
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttemptModel, setCurrentAttemptModel] = useState<string>(getStoredModel());
  const [isFallbackAttempt, setIsFallbackAttempt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Khi nào dùng "in the future" và "would like to be"?',
    'Chỉ cho em cách phân biệt "on the floor" và "in the tower"?',
    'Kể cho em nghe 1 câu đố vui tiếng Anh lớp 5 nhé!',
    'Làm sao để phát âm âm /s/ và /t/ ở cuối câu cho chuẩn?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputQuery;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);
    setIsFallbackAttempt(false);
    soundEffects.playGentleBeep();

    if (!hasConfiguredApiKey()) {
      setTimeout(() => {
        const noKeyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Chào bé! Thầy Cú đang cần được kích hoạt API Key để trả lời trực tiếp câu hỏi này. Bé hoặc phụ huynh hãy bấm vào nút "Cài đặt API Key" bên dưới để nhập mã miễn phí nhé! 🔑',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, noKeyMsg]);
        setIsLoading(false);
        soundEffects.playWrong();
      }, 400);
      return;
    }

    try {
      const { reply, modelUsed } = await chatWithTutorWithFallback(
        messageText,
        'Tiếng Anh Lớp 5 - Global Success (Bộ GD&ĐT Việt Nam)',
        (model, isFallback) => {
          setCurrentAttemptModel(model);
          setIsFallbackAttempt(isFallback);
        }
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed,
      };
      setMessages((prev) => [...prev, aiMsg]);
      soundEffects.playCoin();
    } catch (err: any) {
      console.error('Lỗi gia sư AI:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Đã dừng do lỗi: ${err.message || 'Không thể kết nối đến máy chủ Google AI'}. Bé hãy thử kiểm tra lại API Key hoặc đổi model nhé!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      soundEffects.playWrong();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col h-[85vh] max-h-[640px] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-indigo-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Trợ Lý Gia Sư AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-base font-black">Thầy Cú BiBo - Gia Sư Lớp 5</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-1">
            Gợi ý hỏi:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-all whitespace-nowrap shadow-2xs hover:scale-102 shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    isAI
                      ? msg.isError
                        ? 'bg-rose-500 text-white'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isAI ? (msg.isError ? <AlertTriangle className="w-4 h-4" /> : '🦉') : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAI
                        ? msg.isError
                          ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                          : 'bg-white border border-indigo-100 text-slate-800 shadow-2xs rounded-tl-xs'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-xs'
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>

                    {/* Quick action button inside error message */}
                    {msg.isError && onOpenSettings && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200 flex justify-end">
                        <button
                          onClick={onOpenSettings}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] transition-colors"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Cài đặt API Key</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-400 font-semibold">{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="text-[10px] text-indigo-500 font-mono font-medium">
                        • {msg.modelUsed}
                      </span>
                    )}
                    {isAI && !msg.isError && (
                      <button
                        onClick={() => speakEnglish(msg.text, 0.85)}
                        title="Đọc văn bản"
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0 animate-bounce">
                🦉
              </div>
              <div className="bg-white border border-indigo-100 p-3 rounded-2xl rounded-tl-xs shadow-2xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse delay-75" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-150" />
                  <span className="text-xs text-slate-500 font-semibold ml-1">
                    Thầy Cú đang suy nghĩ...
                  </span>
                </div>
                {isFallbackAttempt && (
                  <span className="text-[10px] text-amber-700 font-mono font-bold">
                    (Thử model dự phòng: {currentAttemptModel})
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Bé hỏi Thầy Cú về từ vựng, ngữ pháp tiếng Anh lớp 5..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden text-xs sm:text-sm text-slate-800 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
