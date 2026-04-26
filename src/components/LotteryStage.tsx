import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Gift, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee, Prize, Winner } from '../types';
import { playSound, startRollingSound, stopRollingSound } from '../lib/utils';

interface LotteryStageProps {
  employees: Employee[];
  currentPrize: Prize | null;
  onWin: (winners: Employee[]) => void;
  isRolling: boolean;
  setIsRolling: (val: boolean) => void;
}

export const LotteryStage: React.FC<LotteryStageProps> = ({
  employees,
  currentPrize,
  onWin,
  isRolling,
  setIsRolling
}) => {
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Smooth rolling effect
  useEffect(() => {
    if (isRolling && employees.length > 0) {
      playSound('click');
      startRollingSound();
      timerRef.current = window.setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % employees.length);
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRollingSound();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRollingSound();
    };
  }, [isRolling, employees]);

  const handleAction = useCallback(() => {
    if (!currentPrize || employees.length === 0) return;

    if (!isRolling) {
      if (currentPrize.remaining <= 0) {
        alert('当前奖项已抽完');
        return;
      }
      setIsRolling(true);
    } else {
      setIsRolling(false);
      
      // Determine winners (can handle multiple winners at once if prize count > 1)
      // For visual dramatic effect, we pick one or 'batch size'
      const batchSize = Math.min(1, currentPrize.remaining); 
      const winners: Employee[] = [];
      const tempEmployees = [...employees];
      
      for(let i=0; i<batchSize; i++) {
        const randomIndex = Math.floor(Math.random() * tempEmployees.length);
        winners.push(tempEmployees[randomIndex]);
        tempEmployees.splice(randomIndex, 1);
      }

      setTimeout(() => {
        onWin(winners);
        playSound('win');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF0000', '#FFFFFF']
        });
      }, 300);
    }
  }, [isRolling, currentPrize, employees, onWin, setIsRolling]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  if (!currentPrize) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/40">
        <Gift className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-xl">请先选择一个奖项</p>
      </div>
    );
  }

  const currentDisplayEmployee = employees[currentIndex] || { name: '准备开始', department: '' };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12">
      {/* Prize Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 mb-4 font-bold tracking-widest text-sm">
          <Trophy className="w-5 h-5" />
          <span className="uppercase">{currentPrize.type}</span>
        </div>
        <h2 className="text-5xl font-black dark:text-white text-gray-900 mb-2 drop-shadow-xl">{currentPrize.title}</h2>
        <p className="dark:text-white/60 text-gray-500 font-medium">
          剩余名额: <span className="text-red-500 dark:text-yellow-400 font-bold">{currentPrize.remaining}</span> / {currentPrize.count}
        </p>
      </motion.div>

      {/* Main Rolling Display */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-white/40 dark:bg-black/40 rounded-[2rem] border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-yellow-500/10 transition-all duration-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDisplayEmployee.name + (isRolling ? currentIndex : 'stopped')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center"
          >
            <span className="text-8xl md:text-[10rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-white dark:to-white/60">
              {currentDisplayEmployee.name}
            </span>
            {currentDisplayEmployee.department && (
              <span className="mt-4 text-2xl dark:text-white/40 text-gray-400 uppercase tracking-[0.5em] font-medium">
                {currentDisplayEmployee.department}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Decorative Particles */}
        {isRolling && (
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-12 group">
        <button
          onClick={handleAction}
          disabled={employees.length === 0}
          className={`
            relative overflow-hidden
            px-16 py-6 rounded-2xl text-2xl font-black uppercase tracking-widest transition-all duration-300
            ${isRolling 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30' 
              : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-105 text-black shadow-xl shadow-yellow-600/30 hover:shadow-yellow-600/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="relative z-10">{isRolling ? '停止' : '开始抽奖'}</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
        <p className="mt-4 text-center dark:text-white/30 text-gray-400 text-sm font-medium">按下 空格键 也可便捷控制</p>
      </div>
    </div>
  );
};
