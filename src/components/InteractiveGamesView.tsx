import React, { useState, useEffect } from 'react';
import { UnitData, UserProgress } from '../types';
import { Sparkles, Swords, Zap, Trophy, Timer, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import { soundEffects, triggerCelebration, speakEnglish } from '../utils/soundAndSpeech';
import { VisualImage } from './VisualImage';
import { getVocabularyImage } from '../data/vocabularyImages';

interface InteractiveGamesViewProps {
  units: UnitData[];
  progress: UserProgress;
  onAwardCoinsAndStars: (coins: number, stars: number, activity: string, score?: number) => void;
}

export const InteractiveGamesView: React.FC<InteractiveGamesViewProps> = ({
  units,
  progress,
  onAwardCoinsAndStars,
}) => {
  const [selectedGame, setSelectedGame] = useState<'arena' | 'builder' | 'memory'>('arena');

  // ARENA STATE
  const [arenaState, setArenaState] = useState<'lobby' | 'matching' | 'playing' | 'result'>('lobby');
  const [opponent, setOpponent] = useState<{ name: string; avatar: string; school: string } | null>(null);
  const [arenaQuestionIdx, setArenaQuestionIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [arenaTimer, setArenaTimer] = useState(8);

  // BUILDER GAME STATE
  const [builderRound, setBuilderRound] = useState(0);
  const [builderUserSelection, setBuilderUserSelection] = useState<string[]>([]);
  const [builderScore, setBuilderScore] = useState(0);
  const [builderDone, setBuilderDone] = useState(false);

  // MEMORY MATCH STATE
  const [cards, setCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Pre-prepared questions for Arena based on Global Success 5
  const arenaQuestions = [
    {
      q: "Where is your hometown? - It is ________ Da Nang.",
      options: ["in", "on", "at", "to"],
      answer: "in",
    },
    {
      q: "What would you like to be in the future? - I'd like to be a ________.",
      options: ["pilot", "quiet", "crowded", "balcony"],
      answer: "pilot",
    },
    {
      q: "Did they enjoy the school trip? - Yes, ________ did.",
      options: ["they", "we", "he", "she"],
      answer: "they",
    },
    {
      q: "What do you do in your free time? - I often ________ karate.",
      options: ["do", "play", "go", "make"],
      answer: "do",
    },
    {
      q: "What is your address? - It's Flat 8 ________ the third floor.",
      options: ["on", "in", "under", "for"],
      answer: "on",
    },
  ];

  // Sentence builder challenges
  const builderChallenges = [
    {
      sentence: ["What", "would", "you", "like", "to", "be", "in", "the", "future?"],
      meaningVi: "Bạn muốn làm nghề gì trong tương lai?",
    },
    {
      sentence: ["I", "live", "on", "the", "second", "floor", "of", "City", "Tower."],
      meaningVi: "Tớ sống ở tầng hai của toà tháp City Tower.",
    },
    {
      sentence: ["My", "favourite", "sport", "is", "badminton."],
      meaningVi: "Môn thể thao yêu thích của tớ là cầu lông.",
    },
  ];

  // Start Arena Matchmaking
  const handleStartArena = () => {
    setArenaState('matching');
    soundEffects.playGentleBeep();

    const opponentsList = [
      { name: 'Nguyễn Thảo Mai', avatar: '🌸', school: 'Lớp 5B, TH Thực Nghiệm' },
      { name: 'Tony (Úc)', avatar: '🐨', school: 'Lớp 5A, TH Quốc Tế' },
      { name: 'Trần Văn Nam', avatar: '🦁', school: 'Lớp 5C, TH Chu Văn An' },
      { name: 'Linda (Anh Quốc)', avatar: '🦄', school: 'Lớp 5A, TH Kim Đồng' },
    ];

    setTimeout(() => {
      const picked = opponentsList[Math.floor(Math.random() * opponentsList.length)];
      setOpponent(picked);
      setArenaState('playing');
      setArenaQuestionIdx(0);
      setUserScore(0);
      setOpponentScore(0);
      setArenaTimer(8);
      soundEffects.playLevelUp();
    }, 1500);
  };

  // Arena timer
  useEffect(() => {
    if (arenaState !== 'playing') return;
    const interval = setInterval(() => {
      setArenaTimer((t) => {
        if (t <= 1) {
          // Time's up for current question
          handleArenaAnswer('');
          return 8;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [arenaState, arenaQuestionIdx]);

  const handleArenaAnswer = (chosen: string) => {
    const currentQ = arenaQuestions[arenaQuestionIdx];
    const isCorrect = chosen === currentQ.answer;

    // Simulate opponent response
    const opponentCorrect = Math.random() > 0.35;
    const addedUser = isCorrect ? arenaTimer * 15 + 50 : 0;
    const addedOpponent = opponentCorrect ? Math.floor(Math.random() * 4 + 4) * 15 + 50 : 0;

    setUserScore((prev) => prev + addedUser);
    setOpponentScore((prev) => prev + addedOpponent);

    if (isCorrect) soundEffects.playSuccess();
    else soundEffects.playGentleBeep();

    if (arenaQuestionIdx < arenaQuestions.length - 1) {
      setArenaQuestionIdx((prev) => prev + 1);
      setArenaTimer(8);
    } else {
      setArenaState('result');
      const won = userScore + addedUser >= opponentScore + addedOpponent;
      if (won) {
        soundEffects.playLevelUp();
        triggerCelebration();
        onAwardCoinsAndStars(50, 5, 'Chiến thắng Đấu trường Tốc độ');
      } else {
        onAwardCoinsAndStars(20, 2, 'Tham gia Đấu trường Tốc độ');
      }
    }
  };

  // Memory card game init
  useEffect(() => {
    if (selectedGame === 'memory') {
      const sampleVocab = units[0].vocabulary.concat(units[1].vocabulary).slice(0, 4);
      const pairCards: any[] = [];
      sampleVocab.forEach((v) => {
        const imgUrl = v.imageUrl || getVocabularyImage(v.word, v.id);
        pairCards.push({
          id: `${v.id}-en`,
          matchKey: v.id,
          type: 'en',
          content: v.word,
          emoji: v.imageEmoji,
          imageUrl: imgUrl,
        });
        pairCards.push({
          id: `${v.id}-vi`,
          matchKey: v.id,
          type: 'vi',
          content: v.meaningVi,
          emoji: '🇻🇳',
          imageUrl: imgUrl,
        });
      });
      // Shuffle
      pairCards.sort(() => Math.random() - 0.5);
      setCards(pairCards);
      setFlippedCards([]);
      setMatchedIds([]);
      setMemoryMoves(0);
    }
  }, [selectedGame, units]);

  const handleFlipCard = (index: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(index)) return;
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);
    soundEffects.playGentleBeep();

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.matchKey === card2.matchKey) {
        // Matched
        soundEffects.playCoin();
        setMatchedIds((prev) => [...prev, card1.matchKey]);
        setFlippedCards([]);
        if (matchedIds.length + 1 === cards.length / 2) {
          triggerCelebration();
          soundEffects.playLevelUp();
          onAwardCoinsAndStars(30, 3, 'Hoàn thành Lật thẻ trí nhớ');
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Đấu Trường & Trò Chơi Tương Tác
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Học mà chơi, chơi mà học - Rèn luyện kiến thức SGK Global Success 5 vui nhộn!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="tab-game-arena"
            onClick={() => setSelectedGame('arena')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              selectedGame === 'arena'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Đấu trường Tốc độ</span>
          </button>

          <button
            id="tab-game-builder"
            onClick={() => setSelectedGame('builder')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              selectedGame === 'builder'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Xếp ngọc Ngữ pháp</span>
          </button>

          <button
            id="tab-game-memory"
            onClick={() => setSelectedGame('memory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
              selectedGame === 'memory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Lật thẻ Trí nhớ</span>
          </button>
        </div>
      </div>

      {/* GAME 1: SPEED ARENA (Thi đấu trực tuyến) */}
      {selectedGame === 'arena' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          {arenaState === 'lobby' && (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg animate-pulse">
                ⚔️
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  Đấu Trường Tranh Tài Lớp 5
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Ghép trận thời gian thực cùng bạn bè khối 5. Trả lời nhanh trong 8 giây để ghi điểm tối đa và nhận 50 xu!
                </p>
              </div>

              <div className="pt-3">
                <button
                  id="btn-start-arena-match"
                  onClick={handleStartArena}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Bắt đầu tìm đối thủ ngay
                </button>
              </div>
            </div>
          )}

          {arenaState === 'matching' && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-black text-slate-800">
                Đang tìm đối thủ khối 5 trên toàn quốc...
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Chuẩn bị sẵn sàng tinh thần chiến đấu nhé!
              </p>
            </div>
          )}

          {arenaState === 'playing' && opponent && (
            <div className="space-y-6">
              {/* Scoreboard VS bar */}
              <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-2xl flex items-center justify-center">
                    🦉
                  </div>
                  <div>
                    <span className="text-xs text-amber-300 font-extrabold">Bé: {progress.name}</span>
                    <p className="text-xl font-black text-white">{userScore} pts</p>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-rose-500 flex items-center justify-center text-lg font-black text-rose-400 bg-rose-950/40">
                    {arenaTimer}s
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    Câu {arenaQuestionIdx + 1}/5
                  </span>
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-xs text-rose-300 font-extrabold">{opponent.name}</span>
                    <p className="text-xl font-black text-white">{opponentScore} pts</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-rose-500 text-2xl flex items-center justify-center">
                    {opponent.avatar}
                  </div>
                </div>
              </div>

              {/* Arena Question */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                  Thử thách tốc độ
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
                  {arenaQuestions[arenaQuestionIdx].q}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {arenaQuestions[arenaQuestionIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleArenaAnswer(opt)}
                    className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 font-black text-sm sm:text-base text-slate-800 active:scale-95 transition-all shadow-xs"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {arenaState === 'result' && opponent && (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
              <div className="text-5xl">
                {userScore >= opponentScore ? '👑' : '👏'}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {userScore >= opponentScore ? 'Chiến Thắng Vang Dội!' : 'Trận Đấu Cực Kỳ Kịch Tính!'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Điểm của bạn: <strong className="text-rose-600">{userScore}</strong> vs Đối thủ ({opponent.name}): <strong className="text-slate-700">{opponentScore}</strong>
              </p>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 inline-block">
                🪙 Phần thưởng: +{userScore >= opponentScore ? '50' : '20'} Xu & +{userScore >= opponentScore ? '5' : '2'} Sao
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setArenaState('lobby')}
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-xs"
                >
                  Đấu trận tiếp theo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: SENTENCE BUILDER */}
      {selectedGame === 'builder' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
              Vòng {builderRound + 1} / {builderChallenges.length}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Điểm: {builderScore}
            </span>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
            <p className="text-xs font-bold text-indigo-700 uppercase">Nghĩa tiếng Việt gợi ý:</p>
            <h3 className="text-lg font-black text-slate-800 mt-0.5">
              "{builderChallenges[builderRound].meaningVi}"
            </h3>
          </div>

          {/* Word Dropzone */}
          <div className="min-h-[70px] p-4 bg-slate-50 border-2 border-dashed border-indigo-300 rounded-2xl flex flex-wrap gap-2 items-center">
            {builderUserSelection.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Bấm vào các viên ngọc từ vựng bên dưới để xếp theo đúng ngữ pháp...
              </span>
            ) : (
              builderUserSelection.map((w, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    setBuilderUserSelection(builderUserSelection.filter((_, i) => i !== idx));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-xs cursor-pointer hover:bg-rose-600"
                >
                  {w} ✕
                </span>
              ))
            )}
          </div>

          {/* Available Word Gems */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[...builderChallenges[builderRound].sentence]
              .sort(() => 0.5 - Math.random())
              .map((word, i) => {
                const isChosen = builderUserSelection.includes(word);
                return (
                  <button
                    key={i}
                    disabled={isChosen}
                    onClick={() => {
                      setBuilderUserSelection([...builderUserSelection, word]);
                      soundEffects.playGentleBeep();
                    }}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
                      isChosen
                        ? 'bg-slate-100 text-slate-300 opacity-40'
                        : 'bg-white border-2 border-indigo-200 text-indigo-950 hover:bg-indigo-50 shadow-xs'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
          </div>

          {/* Action Check */}
          <div className="flex justify-end pt-3">
            <button
              onClick={() => {
                const target = builderChallenges[builderRound].sentence.join(' ');
                const user = builderUserSelection.join(' ');
                if (target === user) {
                  soundEffects.playSuccess();
                  setBuilderScore((s) => s + 30);
                  if (builderRound < builderChallenges.length - 1) {
                    setBuilderRound((r) => r + 1);
                    setBuilderUserSelection([]);
                  } else {
                    setBuilderDone(true);
                    triggerCelebration();
                    onAwardCoinsAndStars(40, 4, 'Hoàn thành Xếp ngọc Ngữ pháp');
                  }
                } else {
                  soundEffects.playGentleBeep();
                  alert('Chưa chính xác rồi bé ơi! Hãy thử sắp xếp lại thứ tự từ nhé.');
                }
              }}
              disabled={builderUserSelection.length === 0}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
            >
              Kiểm tra câu
            </button>
          </div>
        </div>
      )}

      {/* GAME 3: MEMORY MATCH */}
      {selectedGame === 'memory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Số lượt lật thẻ: {memoryMoves}</span>
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Đã ghép đúng: {matchedIds.length} / {cards.length / 2} cặp
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((card, idx) => {
              const isFlipped = flippedCards.includes(idx) || matchedIds.includes(card.matchKey);
              const isMatched = matchedIds.includes(card.matchKey);

              return (
                <div
                  key={card.id}
                  onClick={() => !isFlipped && handleFlipCard(idx)}
                  className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center cursor-pointer select-none transition-all duration-300 ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 opacity-80'
                      : isFlipped
                      ? 'bg-white border-indigo-400 shadow-md text-slate-800 scale-105'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-xs hover:brightness-105'
                  }`}
                >
                  {isFlipped ? (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      {card.imageUrl ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden mb-1 border border-indigo-200 shrink-0 bg-white">
                          <VisualImage
                            src={card.imageUrl}
                            alt={card.content}
                            fallbackEmoji={card.emoji}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-2xl mb-1">{card.emoji}</span>
                      )}
                      <span className="font-extrabold text-xs sm:text-sm line-clamp-1">{card.content}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black opacity-80">❓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
