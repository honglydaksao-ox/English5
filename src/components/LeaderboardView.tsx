import React, { useState } from 'react';
import { LeaderboardPlayer, UserProgress } from '../types';
import { Trophy, Medal, Flame, Star, Crown, School, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  players: LeaderboardPlayer[];
  progress: UserProgress;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ players, progress }) => {
  const [scope, setScope] = useState<'nationwide' | 'classroom'>('nationwide');

  // Inject current user dynamic stats into player list
  const displayPlayers = players.map((p) => {
    if (p.isCurrentUser) {
      return {
        ...p,
        stars: progress.stars,
        streak: progress.streakDays,
        name: `${progress.name} (Bé)`,
      };
    }
    return p;
  }).sort((a, b) => b.stars - a.stars);

  const top3 = displayPlayers.slice(0, 3);
  const remaining = displayPlayers.slice(3);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-3xl p-6 text-slate-900 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-900" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-900/80">
                Vinh Danh & Thi Đua Lớp 5
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Bảng Vàng Học Sinh Xuất Sắc
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-1 max-w-xl">
              Cạnh tranh lành mạnh với hàng ngàn bạn bè lớp 5 trên toàn quốc. Học chăm mỗi ngày để bước lên bục vinh quang!
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white/40 p-1.5 rounded-2xl backdrop-blur-xs border border-white/50 self-start sm:self-auto">
            <button
              onClick={() => setScope('nationwide')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                scope === 'nationwide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-amber-950 hover:bg-white/30'
              }`}
            >
              Toàn quốc
            </button>
            <button
              onClick={() => setScope('classroom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                scope === 'classroom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-amber-950 hover:bg-white/30'
              }`}
            >
              Lớp 5A của bé
            </button>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 max-w-2xl mx-auto items-end">
        {/* Rank 2 (Silver) */}
        {top3[1] && (
          <div className="flex flex-col items-center bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs text-center">
            <div className="relative mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner border-2 border-slate-300">
                {top3[1].avatar}
              </div>
              <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                2
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">{top3[1].name}</h4>
            <div className="flex items-center gap-1 text-amber-600 font-black text-xs mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{top3[1].stars}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 line-clamp-1 mt-0.5">{top3[1].school}</span>
          </div>
        )}

        {/* Rank 1 (Gold Champion) */}
        {top3[0] && (
          <div className="flex flex-col items-center bg-gradient-to-b from-amber-50 to-white rounded-3xl p-4 sm:p-5 border-2 border-amber-400 shadow-md text-center transform -translate-y-2">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl shadow-md border-2 border-amber-400">
                {top3[0].avatar}
              </div>
              <span className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                1
              </span>
            </div>
            <h4 className="font-black text-sm sm:text-base text-slate-900 line-clamp-1">{top3[0].name}</h4>
            <div className="flex items-center gap-1 text-amber-600 font-black text-xs sm:text-sm mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{top3[0].stars} Sao</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mt-1">
              {top3[0].badge}
            </span>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {top3[2] && (
          <div className="flex flex-col items-center bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs text-center">
            <div className="relative mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-100/50 flex items-center justify-center text-3xl shadow-inner border-2 border-amber-600/50">
                {top3[2].avatar}
              </div>
              <span className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
                3
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">{top3[2].name}</h4>
            <div className="flex items-center gap-1 text-amber-600 font-black text-xs mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{top3[2].stars}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 line-clamp-1 mt-0.5">{top3[2].school}</span>
          </div>
        )}
      </div>

      {/* Rest of Leaderboard Table */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-2">
          Bảng xếp hạng chi tiết
        </h3>

        {displayPlayers.map((player, idx) => {
          const rank = idx + 1;
          const isMe = player.isCurrentUser;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all ${
                isMe
                  ? 'bg-amber-50/90 border-2 border-amber-300 ring-2 ring-amber-200 shadow-xs'
                  : 'hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className={`w-7 h-7 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center ${
                  rank === 1 ? 'bg-amber-400 text-white' :
                  rank === 2 ? 'bg-slate-300 text-slate-800' :
                  rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-500 bg-slate-100'
                }`}>
                  {rank}
                </span>

                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                  {player.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black text-xs sm:text-sm ${isMe ? 'text-amber-900' : 'text-slate-800'}`}>
                      {player.name}
                    </h4>
                    {isMe && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-black rounded-md">
                        BẠN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                    <School className="w-3 h-3 text-slate-400" />
                    <span>{player.school}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Streak */}
                <div className="flex items-center gap-1 text-orange-600 font-extrabold text-xs">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{player.streak}d</span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-700 font-black text-xs sm:text-sm min-w-[70px] justify-end">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{player.stars}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
