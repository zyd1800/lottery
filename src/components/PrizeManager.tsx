import React from 'react';
import { Plus, Trash2, Gift, Edit3 } from 'lucide-react';
import { Prize, PrizeType } from '../types';
import { generateId } from '../lib/utils';

interface PrizeManagerProps {
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  selectedPrizeId: string | null;
  onSelect: (id: string) => void;
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({
  prizes,
  setPrizes,
  selectedPrizeId,
  onSelect
}) => {
  const addPrize = () => {
    const newPrize: Prize = {
      id: generateId(),
      type: PrizeType.SPECIAL,
      title: "新奖项",
      count: 1,
      remaining: 1,
    };
    setPrizes([...prizes, newPrize]);
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/10 h-full flex flex-col shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Gift className="text-yellow-500 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold dark:text-white text-gray-800">奖项管理</h3>
        </div>
        <button
          onClick={addPrize}
          className="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-all hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-yellow-500/20"
          title="新增奖项"
        >
          <Plus className="w-5 h-5 transition-transform hover:rotate-90" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {prizes.map((prize) => (
          <div
            key={prize.id}
            onClick={() => onSelect(prize.id)}
            className={`
              group p-4 rounded-xl border transition-all cursor-pointer
              ${selectedPrizeId === prize.id 
                ? 'bg-yellow-500/20 border-yellow-500/50' 
                : 'bg-black/5 dark:bg-white/5 border-transparent dark:border-white/10 hover:border-yellow-500/30'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <select
                    className="bg-white dark:bg-black/40 text-[10px] text-yellow-500 uppercase px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 outline-none"
                    value={prize.type}
                    onChange={(e) => updatePrize(prize.id, { type: e.target.value as PrizeType })}
                  >
                    {Object.values(PrizeType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-xs text-gray-400 dark:text-white/40">名额: {prize.remaining}/{prize.count}</span>
                </div>
                <input
                  className="bg-transparent dark:text-white text-gray-800 font-bold w-full outline-none focus:text-yellow-500"
                  value={prize.title}
                  onChange={(e) => updatePrize(prize.id, { title: e.target.value })}
                />
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-white/40">总量:</span>
                    <input
                      type="number"
                      className="bg-white dark:bg-black/40 dark:text-white text-gray-800 w-12 px-1 text-center rounded text-xs border border-gray-200 dark:border-white/10"
                      value={prize.count}
                      min={1}
                      onChange={(e) => {
                         const val = parseInt(e.target.value) || 1;
                         updatePrize(prize.id, { count: val, remaining: val });
                      }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removePrize(prize.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
