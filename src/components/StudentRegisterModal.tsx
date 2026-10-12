import React, { useState } from 'react';
import { User, School, MapPin, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { soundEffects, triggerCelebration } from '../utils/soundAndSpeech';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onRegister: (data: {
    fullName: string;
    gradeClass: string;
    schoolName: string;
    commune: string;
    province: string;
    avatar: string;
  }) => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🦉', name: 'Cú Thông Thái', desc: 'Thầy Cú BiBo hướng dẫn phát âm' },
  { emoji: '🐯', name: 'Hổ Dũng Cảm', desc: 'Thử thách thi đấu và đấu trường' },
  { emoji: '🐬', name: 'Cá Heo Vui Vẻ', desc: 'Học từ vựng siêu nhanh' },
  { emoji: '🚀', name: 'Phi Hành Gia', desc: 'Khám phá thế giới Tiếng Anh' },
];

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onRegister,
}) => {
  const [fullName, setFullName] = useState('');
  const [gradeClass, setGradeClass] = useState('5A1');
  const [schoolName, setSchoolName] = useState('');
  const [commune, setCommune] = useState('');
  const [province, setProvince] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦉');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên của em nhé!');
      soundEffects.playWrong();
      return;
    }
    if (!gradeClass.trim()) {
      setErrorMessage('Vui lòng nhập Tên lớp (Ví dụ: 5A, 5A1, 5B)!');
      soundEffects.playWrong();
      return;
    }
    if (!schoolName.trim()) {
      setErrorMessage('Vui lòng nhập Tên trường tiểu học của em!');
      soundEffects.playWrong();
      return;
    }
    if (!commune.trim()) {
      setErrorMessage('Vui lòng nhập Xã hoặc Phường nơi em sinh sống!');
      soundEffects.playWrong();
      return;
    }
    if (!province.trim()) {
      setErrorMessage('Vui lòng nhập Tỉnh hoặc Thành phố!');
      soundEffects.playWrong();
      return;
    }

    setErrorMessage('');
    soundEffects.playLevelUp();
    triggerCelebration();

    onRegister({
      fullName: fullName.trim(),
      gradeClass: gradeClass.trim(),
      schoolName: schoolName.trim(),
      commune: commune.trim(),
      province: province.trim(),
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-3 text-4xl opacity-20 select-none">🎒</div>
          <div className="absolute bottom-1 left-3 text-4xl opacity-20 select-none">⭐</div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-100 text-xs font-black uppercase tracking-wider mb-2 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Chào Mừng Học Sinh Lớp 5</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            Đăng Ký Hồ Sơ Học Tập
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Nhập thông tin của em để tham gia thi đấu, tích sao đổi quà và lưu tiến độ SGK Global Success 5 nhé!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Chọn Linh vật */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              1. Chọn Linh Vật Đại Diện Của Em:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(item.emoji);
                      soundEffects.playGentleBeep();
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-200 scale-102'
                        : 'border-slate-200 hover:border-amber-300 bg-slate-50/60'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="font-extrabold text-xs text-slate-800">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Thông tin học sinh */}
          <div className="space-y-3.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              2. Thông Tin Cá Nhân (Bắt buộc):
            </label>

            {/* Họ và tên & Lớp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Bảo Nam"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-hidden font-bold text-sm text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lớp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  placeholder="Ví dụ: 5A1"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-hidden font-bold text-sm text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Trường */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Trường Tiểu Học <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Ví dụ: Tiểu học Thăng Long / Lê Quý Đôn"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-hidden font-bold text-sm text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Xã / Phường & Tỉnh / Thành phố */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Xã / Phường <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Ví dụ: Phường Hoàng Liệt"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-hidden font-bold text-sm text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tỉnh / Thành phố <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ví dụ: Hà Nội / TP. Hồ Chí Minh"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-hidden font-bold text-sm text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Hoàn Tất Đăng Ký & Bắt Đầu Học Ngay</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
              ✨ Thông tin của em được lưu an toàn trên máy để theo dõi tiến độ và xếp hạng
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
