import React, { useState } from 'react';
import { RewardItem, UserProgress } from '../types';
import { REWARDS_CATALOG } from '../data/globalSuccessUnits';
import { X, ShoppingBag, Coins, Check, Sparkles, Shield, Gift } from 'lucide-react';
import { soundEffects, triggerCelebration } from '../utils/soundAndSpeech';

interface RewardsShopModalProps {
  progress: UserProgress;
  onClose: () => void;
  onBuyItem: (item: RewardItem) => void;
  onEquipMascot: (itemId: string) => void;
  initialTab?: 'shop' | 'wheel';
}

export const RewardsShopModal: React.FC<RewardsShopModalProps> = ({
  progress,
  onClose,
  onBuyItem,
  onEquipMascot,
  initialTab = 'shop',
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'wheel'>(initialTab);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);

  const wheelPrizes = [
    { label: '+20 Xu', value: 20, type: 'coins' },
    { label: '+1 Sao ⭐', value: 1, type: 'stars' },
    { label: '+50 Xu 🪙', value: 50, type: 'coins' },
    { label: 'Hộp Quà Bí Ẩn 🎁', value: 30, type: 'coins' },
    { label: '+15 Xu', value: 15, type: 'coins' },
    { label: '+30 Xu Vàng ✨', value: 30, type: 'coins' },
  ];

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelPrize(null);
    soundEffects.playGentleBeep();

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    setWheelRotation((prev) => prev + randomDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      const prizeIndex = Math.floor(Math.random() * wheelPrizes.length);
      const won = wheelPrizes[prizeIndex];
      setWheelPrize(won.label);
      soundEffects.playLevelUp();
      triggerCelebration();

      // Trigger actual rewards
      if (won.type === 'coins') {
        progress.coins += won.value;
      } else {
        progress.stars += won.value;
      }
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Phần Thưởng Ảo Quy Đổi
                </span>
                <span className="text-xs text-amber-100 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {progress.coins} Xu của bé
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black">Cửa Hàng Quà Tặng & Vòng Quay</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cửa hàng đổi quà</span>
          </button>

          <button
            onClick={() => setActiveTab('wheel')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'wheel'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Vòng quay may mắn hàng ngày</span>
          </button>
        </div>

        {/* Tab 1: Shop Catalog */}
        {activeTab === 'shop' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {REWARDS_CATALOG.map((item) => {
                const isOwned = progress.unlockedItems.includes(item.id);
                const isEquipped = progress.equippedMascot === item.id;
                const canAfford = progress.coins >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                        : isOwned
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-xs">
                          {item.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.rarity === 'legendary' ? 'bg-amber-500 text-white' :
                          item.rarity === 'epic' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 font-black text-amber-700 text-xs">
                        <Coins className="w-3.5 h-3.5 text-yellow-600" />
                        <span>{item.cost} Xu</span>
                      </div>

                      {isOwned ? (
                        item.category === 'mascot' ? (
                          <button
                            onClick={() => onEquipMascot(item.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              isEquipped
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isEquipped ? 'Đang dùng' : 'Trang bị'}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đã sở hữu
                          </span>
                        )
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            soundEffects.playCoin();
                            onBuyItem(item);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all"
                        >
                          Đổi quà
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Lucky Wheel */}
        {activeTab === 'wheel' && (
          <div className="p-6 text-center space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Vòng Quay May Mắn Mỗi Ngày
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Bé đăng nhập học mỗi ngày sẽ nhận 1 lượt quay trúng Xu Vàng và Sao thưởng!
              </p>
            </div>

            {/* Wheel graphic */}
            <div className="relative w-64 h-64 mx-auto my-4">
              {/* Pointer indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-6 h-6 text-rose-600 font-black text-2xl animate-bounce">
                ▼
              </div>

              {/* Wheel disk */}
              <div
                className="w-full h-full rounded-full border-8 border-amber-400 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-3000 ease-out bg-gradient-to-tr from-amber-300 via-rose-300 to-yellow-300"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-amber-400/80 border border-white flex items-center justify-center font-black text-xs text-slate-900 p-2">
                    +50 Xu 🪙
                  </div>
                  <div className="bg-rose-400/80 border border-white flex items-center justify-center font-black text-xs text-white p-2">
                    +1 Sao ⭐
                  </div>
                  <div className="bg-indigo-400/80 border border-white flex items-center justify-center font-black text-xs text-white p-2">
                    +30 Xu ✨
                  </div>
                  <div className="bg-emerald-400/80 border border-white flex items-center justify-center font-black text-xs text-slate-900 p-2">
                    +20 Xu 🌟
                  </div>
                </div>

                <div className="w-16 h-16 rounded-full bg-white shadow-md z-10 flex items-center justify-center font-black text-xs text-amber-700 border-2 border-amber-400">
                  🎡
                </div>
              </div>
            </div>

            {wheelPrize && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-sm font-extrabold text-rose-700 animate-in fade-in duration-300">
                🎉 Chúc mừng bé đã trúng: <strong>{wheelPrize}</strong>!
              </div>
            )}

            <div className="pt-2">
              <button
                id="btn-spin-wheel-action"
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSpinning ? 'Đang quay...' : 'Quay Thưởng Miễn Phí'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
