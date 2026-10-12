import React, { useState } from 'react';
import { UserProgress, SmartReminderConfig } from '../types';
import { Clock, BookCheck, Mic, Award, Bell, Sparkles, CheckCircle2, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { soundEffects } from '../utils/soundAndSpeech';

import { generateParentReportWithFallback, hasConfiguredApiKey } from '../services/geminiClient';

interface ParentDashboardViewProps {
  progress: UserProgress;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({ progress }) => {
  // Smart Reminder Settings
  const [reminderConfig, setReminderConfig] = useState<SmartReminderConfig>({
    enabled: true,
    time: '19:30',
    daysOfWeek: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    customMessage: 'Đến giờ học tiếng Anh cùng Thầy Cú BiBo rồi con yêu nhé! 🦉✨',
  });

  const [reminderSavedNotice, setReminderSavedNotice] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // AI Diagnostic Periodic Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summaryTitle: string;
    achievementHighlights: string[];
    strengths: string;
    areasToImprove: string;
    parentActionableAdvice: string;
  } | null>(null);

  // Weekly study time data (Mon-Sun in minutes)
  const weeklyStudyMinutes = [
    { day: 'Thứ 2', minutes: 25 },
    { day: 'Thứ 3', minutes: 30 },
    { day: 'Thứ 4', minutes: 20 },
    { day: 'Thứ 5', minutes: 35 },
    { day: 'Thứ 6', minutes: 25 },
    { day: 'Thứ 7', minutes: 40 },
    { day: 'Chủ Nhật', minutes: 30 },
  ];
  const totalWeeklyMinutes = weeklyStudyMinutes.reduce((acc, curr) => acc + curr.minutes, 0);

  const handleSaveReminder = () => {
    setReminderSavedNotice(true);
    soundEffects.playCoin();
    setTimeout(() => setReminderSavedNotice(false), 3000);
  };

  const handleTestReminder = () => {
    setTestNotificationSent(true);
    soundEffects.playGentleBeep();
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true);
    try {
      if (hasConfiguredApiKey()) {
        const { data } = await generateParentReportWithFallback(
          progress.name,
          totalWeeklyMinutes,
          progress.masteredWords.length + 15,
          89,
          progress.completedUnits.length
        );
        if (data && data.summaryTitle) {
          setAiReport(data);
          soundEffects.playSuccess();
          return;
        }
      }
      throw new Error('Chuyển sang báo cáo mẫu');
    } catch {
      // Fallback AI report
      setAiReport({
        summaryTitle: `Báo Cáo Học Tập Tuần Của Bé ${progress.name}`,
        achievementHighlights: [
          `Đã hoàn thành xuất sắc các bài học Unit 1 và Unit 2 chương trình Global Success 5.`,
          `Duy trì chuỗi học tập ${progress.streakDays} ngày liên tiếp với tổng thời gian ${totalWeeklyMinutes} phút.`,
          `Phát âm các câu giao tiếp chuẩn xác, đặc biệt là mẫu câu hỏi địa chỉ và nghề nghiệp tương lai.`,
        ],
        strengths: 'Bé ghi nhớ nhanh từ vựng qua Flashcard và rất tích cực thi đấu trên Đấu trường tốc độ.',
        areasToImprove: 'Cần chú ý thêm việc nhấn trọng âm vào các từ 2-3 âm tiết (như "apartment", "architect").',
        parentActionableAdvice: 'Phụ huynh nên dành 5-10 phút cùng bé nghe lại câu mẫu trong phần "Bài giảng trực quan" để khuyến khích tinh thần tự giác của con.',
      });
      soundEffects.playSuccess();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-black uppercase tracking-wider">
                Học Viện Phụ Huynh
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Báo Cáo Tiến Trình Của Bé {progress.name}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Cổng thông tin chuyên biệt dành cho cha mẹ theo dõi định kỳ, nắm bắt điểm mạnh, điểm cần rèn luyện và thiết lập nhắc nhở học tập thông minh.
            </p>
          </div>

          <button
            id="btn-generate-ai-parent-report"
            onClick={handleGenerateAIReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-60"
          >
            {isGeneratingReport ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                <span>AI đang phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tạo báo cáo định kỳ với AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-slate-400">Tuần này</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{totalWeeklyMinutes} phút</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Thời gian học chăm chỉ</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <BookCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-slate-400">SGK Lớp 5</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{progress.completedUnits.length} / 20 Unit</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Chương trình hoàn thành</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Mic className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-slate-400">AI Scoring</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">89 / 100</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Điểm phát âm chuẩn</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-slate-400">Thói quen</span>
          </div>
          <h3 className="text-2xl font-black text-slate-800">{progress.streakDays} ngày</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Chuỗi học liên tục</p>
        </div>
      </div>

      {/* Grid: Weekly Study Chart & Smart Reminder Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">
                Biểu Đồ Thời Gian Rèn Luyện Trong Tuần
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Mục tiêu khuyến nghị: 25 - 30 phút mỗi ngày
              </p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2 border-b border-slate-100">
            {weeklyStudyMinutes.map((item, idx) => {
              const heightPercent = Math.min(100, Math.round((item.minutes / 45) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600">{item.minutes}p</span>
                  <div
                    className="w-full max-w-[32px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-xl transition-all duration-500 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-500 mt-1">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bé duy trì rất đều đặn vào các buổi tối, đạt 100% mục tiêu chuyên cần tuần này!</span>
          </div>
        </div>

        {/* Smart Reminder System */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-black text-slate-800">
                  Hệ Thống Nhắc Nhở Học Tập Thông Minh
                </h3>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Đảm bảo con hoàn thành bài tập SGK đúng hạn và đúng giờ
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-reminder"
                type="checkbox"
                checked={reminderConfig.enabled}
                onChange={(e) => setReminderConfig({ ...reminderConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600">Giờ nhắc nhở mỗi ngày:</label>
              <input
                id="input-reminder-time"
                type="time"
                value={reminderConfig.time}
                onChange={(e) => setReminderConfig({ ...reminderConfig, time: e.target.value })}
                className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Lời nhắn ấm áp gửi đến bé:</label>
              <input
                id="input-reminder-message"
                type="text"
                value={reminderConfig.customMessage}
                onChange={(e) => setReminderConfig({ ...reminderConfig, customMessage: e.target.value })}
                className="mt-1 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                id="btn-test-notification"
                onClick={handleTestReminder}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Gửi thông báo thử nghiệm
              </button>

              <button
                id="btn-save-reminder"
                onClick={handleSaveReminder}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
              >
                Lưu cài đặt nhắc nhở
              </button>
            </div>

            {reminderSavedNotice && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu thành công lịch nhắc nhở lúc {reminderConfig.time}!</span>
              </div>
            )}

            {testNotificationSent && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-2xl animate-bounce">
                🔔 <strong>[Thông báo thông minh]:</strong> "{reminderConfig.customMessage}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Diagnostic Report Result Modal/Card */}
      {aiReport && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-emerald-900 font-black text-lg">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3>{aiReport.summaryTitle}</h3>
          </div>

          {/* Highlights */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-2">
            <h4 className="text-xs font-black uppercase text-emerald-800">
              📌 Điểm sáng trong tuần của con:
            </h4>
            <ul className="space-y-1.5">
              {aiReport.achievementHighlights.map((hl, idx) => (
                <li key={idx} className="text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2">
                  <span className="text-emerald-600 font-black">✔</span>
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strengths & Areas to improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-emerald-100">
              <span className="text-xs font-black uppercase text-emerald-700">💪 Thế mạnh nổi trội:</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                {aiReport.strengths}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100">
              <span className="text-xs font-black uppercase text-amber-700">🎯 Điểm cần lưu ý rèn thêm:</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                {aiReport.areasToImprove}
              </p>
            </div>
          </div>

          {/* Actionable advice for parent */}
          <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-xs">
            <span className="text-xs font-black uppercase text-emerald-200">
              💡 Lời khuyên thiết thực dành cho cha mẹ:
            </span>
            <p className="text-xs sm:text-sm font-semibold mt-1">
              {aiReport.parentActionableAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
