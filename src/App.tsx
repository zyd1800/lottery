/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Award, Github, Sun, Moon } from 'lucide-react';
import { Employee, Prize, Winner, PrizeType } from './types';
import { DEFAULT_PRIZES, APP_CONFIG } from './constants';
import { ImportModule } from './components/ImportModule';
import { LotteryStage } from './components/LotteryStage';
import { PrizeManager } from './components/PrizeManager';
import { WinnerList } from './components/WinnerList';
import { LogoUpload } from './components/LogoUpload';
import { cn } from './lib/utils';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Persistence
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem(APP_CONFIG.LS_KEY_EMPLOYEES);
      const savedPrizes = localStorage.getItem(APP_CONFIG.LS_KEY_PRIZES);
      const savedWinners = localStorage.getItem(APP_CONFIG.LS_KEY_WINNERS);
      const savedLogo = localStorage.getItem(APP_CONFIG.LS_KEY_LOGO);
      const savedBackground = localStorage.getItem(APP_CONFIG.LS_KEY_BACKGROUND);
      const savedTheme = localStorage.getItem('luckydraw_theme') as 'dark' | 'light';

      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
      if (savedWinners) setWinners(JSON.parse(savedWinners));
      if (savedLogo) setLogo(savedLogo);
      if (savedBackground) setBackground(savedBackground);
      if (savedTheme) setTheme(savedTheme);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.LS_KEY_EMPLOYEES, JSON.stringify(employees));
      localStorage.setItem(APP_CONFIG.LS_KEY_PRIZES, JSON.stringify(prizes));
      localStorage.setItem(APP_CONFIG.LS_KEY_WINNERS, JSON.stringify(winners));
      localStorage.setItem('luckydraw_theme', theme);
      if (logo) {
        // Check if logo data is too large for localStorage
        if (logo.length > 5 * 1024 * 1024) { // 5MB limit
          console.warn('Logo data too large for localStorage, skipping storage');
        } else {
          localStorage.setItem(APP_CONFIG.LS_KEY_LOGO, logo);
        }
      } else {
        localStorage.removeItem(APP_CONFIG.LS_KEY_LOGO);
      }
      if (background) {
        // Check if background data is too large for localStorage
        if (background.length > 5 * 1024 * 1024) { // 5MB limit
          console.warn('Background data too large for localStorage, skipping storage');
        } else {
          localStorage.setItem(APP_CONFIG.LS_KEY_BACKGROUND, background);
        }
      } else {
        localStorage.removeItem(APP_CONFIG.LS_KEY_BACKGROUND);
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [employees, prizes, winners, logo, background, theme]);

  const currentPrize = useMemo(() => 
    prizes.find(p => p.id === selectedPrizeId) || null
  , [prizes, selectedPrizeId]);

  const availableEmployees = useMemo(() => {
    const winnerIds = new Set(winners.map(w => w.employee.id));
    return employees.filter(e => !winnerIds.has(e.id));
  }, [employees, winners]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleWin = (newWinners: Employee[]) => {
    if (!currentPrize) return;

    const winnerRecords: Winner[] = newWinners.map(e => ({
      employee: e,
      prize: currentPrize,
      timestamp: Date.now()
    }));

    setWinners(prev => [...prev, ...winnerRecords]);
    setPrizes(prev => prev.map(p => 
      p.id === currentPrize.id 
        ? { ...p, remaining: Math.max(0, p.remaining - newWinners.length) } 
        : p
    ));
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 font-sans",
      theme === 'dark' ? "dark bg-[#0a0502] text-white" : "bg-gray-50 text-gray-900",
      "p-4 md:p-8"
    )}>
      {/* Background with decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ 
        backgroundImage: background ? `url(${background})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {!background && (
          <>
            {theme === 'dark' ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#3a1510_0%,transparent_60%),radial-gradient(circle_at_10%_80%,#ff4e00_0%,transparent_50%)] opacity-30" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0a0502] to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#fef2f2_0%,transparent_50%),radial-gradient(circle_at_90%_90%,#fff7ed_0%,transparent_50%)] opacity-100" />
            )}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/silk.png')] opacity-5" />
          </>
        )}
      </div>

      <div className={cn(
        "relative z-10 mx-auto h-full flex flex-col transition-all duration-500",
        "max-w-[1600px] gap-8"
      )}>
        {/* Header */}
        <header className={cn(
          "flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 backdrop-blur-md p-6 rounded-2xl border",
          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm",
          "opacity-100"
        )}>
          <div className="flex items-center gap-6">
            {logo ? (
              <img src={logo} alt="Company Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                  Lucky<span className="text-yellow-500">Draw</span>
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded not-italic tracking-normal align-top">2026</span>
                </h1>
              </div>
            )}
            <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-white/10" />
            <p className={cn(
              "hidden lg:block text-xs max-w-[200px] leading-tight",
              theme === 'dark' ? "text-white/40" : "text-gray-400"
            )}>
              专业的年会抽奖系统，动态视效。
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-xl border transition-all",
                theme === 'dark' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
              )}
              title="切换主题"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <LogoUpload 
              logo={logo} 
              onUpload={setLogo} 
              background={background} 
              onBackgroundUpload={setBackground} 
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className={cn(
          "flex-1 grid gap-8",
          "grid-cols-1 lg:grid-cols-12"
        )}>
          {/* Left Column: Config */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="lg:col-span-3 space-y-6 flex flex-col"
          >
            <ImportModule onImport={setEmployees} count={employees.length} />
            <div className="flex-1 min-h-0">
              <PrizeManager 
                prizes={prizes} 
                setPrizes={setPrizes} 
                selectedPrizeId={selectedPrizeId}
                onSelect={setSelectedPrizeId}
              />
            </div>
          </motion.div>

          {/* Center Column: Lottery Stage */}
          <div className={cn(
            "transition-all duration-700",
            "lg:col-span-6"
          )}>
            <div className={cn(
              "relative h-full flex flex-col"
            )}>
              <LotteryStage 
                employees={availableEmployees}
                currentPrize={currentPrize}
                onWin={handleWin}
                isRolling={isRolling}
                setIsRolling={setIsRolling}
              />
            </div>
          </div>

          {/* Right Column: Winners */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="lg:col-span-3 flex flex-col"
          >
            <WinnerList 
              winners={winners} 
              onClear={() => {
                if(confirm('确定要清空所有中奖记录吗？')) setWinners([]);
              }} 
            />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className={cn(
          "mt-auto pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs",
          theme === 'dark' ? "border-white/5 text-white/20" : "border-gray-200 text-gray-400"
        )}>
          <div className="flex items-center gap-6">
            <span>&copy; 2026 LuckyDraw Pro. 仅供内部年会使用。</span>
            <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 在库: <b className={theme === 'dark' ? "text-white" : "text-gray-900"}>{employees.length}</b> 人</span>
            <span className="flex items-center gap-1.5"><Award className="w-3 h-3" /> 已中奖: <b className={theme === 'dark' ? "text-white" : "text-gray-900"}>{winners.length}</b> 人</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-yellow-500 transition-colors uppercase tracking-widest">操作指南</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
              <Github className="w-3 h-3" /> 源代码
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

