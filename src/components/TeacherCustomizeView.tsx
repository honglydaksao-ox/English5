import React, { useState } from 'react';
import { UnitData } from '../types';
import { GraduationCap, Sparkles, Send, Plus, CheckCircle2, UserCheck, Layers, BookOpen } from 'lucide-react';
import { soundEffects } from '../utils/soundAndSpeech';

import { generateTeacherLessonWithFallback, hasConfiguredApiKey } from '../services/geminiClient';

interface TeacherCustomizeViewProps {
  units: UnitData[];
}

export const TeacherCustomizeView: React.FC<TeacherCustomizeViewProps> = ({ units }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(units[0].id);
  const [studentLevel, setStudentLevel] = useState<'easy' | 'standard' | 'advanced'>('standard');
  const [focusSkill, setFocusSkill] = useState<string>('Từ vựng & Mẫu câu giao tiếp');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssignment, setGeneratedAssignment] = useState<{
    unitTitle: string;
    level: string;
    questions: {
      id: number;
      question: string;
      options: string[];
      correctIndex: number;
      explanationVi: string;
    }[];
  } | null>(null);

  const [assignmentSentNotice, setAssignmentSentNotice] = useState(false);

  const currentUnitObj = units.find((u) => u.id === selectedUnit) || units[0];

  const handleGenerateTeacherLesson = async () => {
    setIsGenerating(true);
    const levelLabel = studentLevel === 'easy' ? 'Cần củng cố (Dễ)' : studentLevel === 'standard' ? 'Tiêu chuẩn (Khá)' : 'Nâng cao (Giỏi)';
    const unitTitle = `Unit ${currentUnitObj.unitNumber}: ${currentUnitObj.titleEn}`;

    try {
      if (hasConfiguredApiKey()) {
        const { data } = await generateTeacherLessonWithFallback(
          unitTitle,
          levelLabel,
          focusSkill
        );
        if (data && data.questions) {
          setGeneratedAssignment(data);
          soundEffects.playSuccess();
          return;
        }
      }
      throw new Error('Chuyển sang mẫu bài tập SGK tiêu chuẩn');
    } catch {
      // Fallback
      setGeneratedAssignment({
        unitTitle: `Unit ${currentUnitObj.unitNumber}: ${currentUnitObj.titleEn}`,
        level: studentLevel === 'easy' ? 'Cần củng cố' : studentLevel === 'standard' ? 'Tiêu chuẩn' : 'Nâng cao',
        questions: [
          {
            id: 1,
            question: `Where does she live? - She lives ________ a quiet cottage.`,
            options: ['in', 'on', 'at', 'with'],
            correctIndex: 0,
            explanationVi: 'Sống trong một ngôi nhà/cottage ta dùng giới từ "in".',
          },
          {
            id: 2,
            question: `What would you like to be? - I want to be an architect because I like ________ houses.`,
            options: ['designing', 'designs', 'designed', 'design'],
            correctIndex: 0,
            explanationVi: 'Sau động từ "like" dùng danh động từ V-ing (designing).',
          },
        ],
      });
      soundEffects.playSuccess();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendAssignment = () => {
    setAssignmentSentNotice(true);
    soundEffects.playLevelUp();
    setTimeout(() => setAssignmentSentNotice(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-black uppercase tracking-wider">
                Góc Giáo Viên & Tùy Biến Bài Giảng
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Phân Hóa Nội Dung Bài Học Theo Năng Lực Học Sinh
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Tùy chỉnh hệ thống bài tập và bài giảng theo năng lực từng nhóm học sinh lớp 5 với sự hỗ trợ của công nghệ AI.
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-base font-black text-slate-800">
          1. Thiết lập cấu hình bài tập phân hóa:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Unit */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">
              Chọn Unit SGK Global Success 5:
            </label>
            <select
              id="select-teacher-unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber}: {u.titleEn} - {u.titleVi}
                </option>
              ))}
            </select>
          </div>

          {/* Select Student Level */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">
              Phân nhóm năng lực học sinh:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setStudentLevel('easy')}
                className={`py-2 px-1 text-center rounded-xl font-extrabold text-xs transition-all ${
                  studentLevel === 'easy'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cần hỗ trợ
              </button>
              <button
                type="button"
                onClick={() => setStudentLevel('standard')}
                className={`py-2 px-1 text-center rounded-xl font-extrabold text-xs transition-all ${
                  studentLevel === 'standard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tiêu chuẩn
              </button>
              <button
                type="button"
                onClick={() => setStudentLevel('advanced')}
                className={`py-2 px-1 text-center rounded-xl font-extrabold text-xs transition-all ${
                  studentLevel === 'advanced'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Nâng cao
              </button>
            </div>
          </div>

          {/* Focus Skill */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">
              Kỹ năng trọng tâm:
            </label>
            <select
              id="select-teacher-skill"
              value={focusSkill}
              onChange={(e) => setFocusSkill(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="Từ vựng & Mẫu câu giao tiếp">Từ vựng & Mẫu câu giao tiếp</option>
              <option value="Luyện phát âm & Ngữ điệu câu">Luyện phát âm & Ngữ điệu câu</option>
              <option value="Ngữ pháp & Trật tự từ">Ngữ pháp & Trật tự từ</option>
              <option value="Đọc hiểu đoạn văn ngắn">Đọc hiểu đoạn văn ngắn</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="btn-teacher-generate-ai"
            onClick={handleGenerateTeacherLesson}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI đang biên soạn bài tập...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Biên soạn bài tập phân hóa tức thì với AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Lesson Preview */}
      {generatedAssignment && (
        <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-xs space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase text-blue-600">
                Bộ bài tập đã tạo sẵn sàng giao cho học sinh:
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {generatedAssignment.unitTitle} ({generatedAssignment.level})
              </h3>
            </div>

            <button
              id="btn-send-assignment-to-class"
              onClick={handleSendAssignment}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Giao bài tập về nhà cho nhóm này</span>
            </button>
          </div>

          {assignmentSentNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã gửi bài tập thành công đến danh sách học sinh thuộc nhóm {studentLevel}!</span>
            </div>
          )}

          <div className="space-y-3">
            {generatedAssignment.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-800">{q.question}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-8">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        oIdx === q.correctIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex && '✓ (Đáp án chuẩn)'}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500 pl-8 italic">
                  💡 Hướng dẫn giáo viên: {q.explanationVi}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Student Groups Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-800">
          2. Theo dõi năng lực học sinh Lớp 5A (Sĩ số: 32 em)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-black uppercase text-amber-800">Nhóm Cần hỗ trợ phát âm (5 em)</span>
            <p className="text-xs text-slate-600 mt-1 font-medium">Bảo Nam, Quốc Huy, Minh Trang, Hải Đăng, Quỳnh Chi</p>
            <span className="inline-block mt-2 text-[11px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md">
              Được giao bài tập củng cố âm đuôi
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-black uppercase text-blue-800">Nhóm Tiêu chuẩn (20 em)</span>
            <p className="text-xs text-slate-600 mt-1 font-medium">Theo sát tiến độ SGK Global Success 5 hàng tuần</p>
            <span className="inline-block mt-2 text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md">
              Tỷ lệ nộp bài: 95%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <span className="text-xs font-black uppercase text-purple-800">Nhóm Nâng cao & Hùng biện (7 em)</span>
            <p className="text-xs text-slate-600 mt-1 font-medium">Minh Quân, Thảo Linh, Quốc Bảo, Khánh An, Tuấn Kiệt...</p>
            <span className="inline-block mt-2 text-[11px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md">
              Luyện nói câu mở rộng & thuyết trình
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
