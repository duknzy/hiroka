import React from 'react';
import { ActiveTab, TargetSchool } from '../types';
import { Play, PlusCircle, Settings, Flame, LogIn, LogOut, Image as ImageIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  target: TargetSchool;
  streakDays: number;
  user: User | null;
  hasCustomWallpaper: boolean;
  isTimerActive: boolean;
  timerSeconds: number;
  onOpenTimerTab: () => void;
  onOpenManualLog: () => void;
  onOpenSettings: () => void;
  onOpenWallpaper: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  target,
  streakDays,
  user,
  hasCustomWallpaper,
  isTimerActive,
  timerSeconds,
  onOpenTimerTab,
  onOpenManualLog,
  onOpenSettings,
  onOpenWallpaper,
  onOpenAuth,
  onLogout,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysLeft = 0;
  if (target.examDateKyotsu) {
    const kyotsuDate = new Date(target.examDateKyotsu);
    kyotsuDate.setHours(0, 0, 0, 0);
    daysLeft = Math.ceil((kyotsuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'timer', label: '集中タイマー' },
    { id: 'plan', label: '逆算計画' },
    { id: 'schedule', label: '予定・TODO' },
    { id: 'materials', label: '科目・参考書' },
    { id: 'diary', label: '学習日誌' },
    { id: 'mock-exams', label: '模試成績' },
  ];

  const formatMiniTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Zone 1: Wordmark & Optional Target Pill */}
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus-visible:outline-none shrink-0"
            >
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity whitespace-nowrap">
                PassRoute
              </span>
            </button>

            {/* Target indicator - only on very wide screens so it never squishes tabs */}
            {target.name ? (
              <div className="hidden 2xl:flex items-center gap-2 text-xs bg-slate-900/80 px-2.5 py-1 rounded-full whitespace-nowrap border border-white/10 text-slate-300">
                <button
                  onClick={onOpenSettings}
                  className="font-semibold text-slate-200 hover:text-indigo-400 cursor-pointer whitespace-nowrap transition-colors"
                >
                  {target.name} {target.faculty}
                </button>
                {daysLeft > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">|</span>
                    <span className="font-mono tabular-nums text-indigo-400 font-bold whitespace-nowrap">
                      共テまで {daysLeft} 日
                    </span>
                  </>
                )}
                {streakDays > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">|</span>
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold whitespace-nowrap">
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {streakDays}日連続
                    </span>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 text-sm font-medium shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-2 px-2.5 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs xl:text-sm tracking-normal rounded-t-lg ${
                  activeTab === item.id
                    ? 'text-indigo-400 border-indigo-500 font-bold bg-indigo-500/10 shadow-xs'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5 hover:border-slate-700'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'timer' && isTimerActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions + Wallpaper + User Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenManualLog}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="過去の勉強時間を手動入力"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              手動記録
            </button>

            {/* Quick Timer trigger / indicator */}
            <button
              onClick={onOpenTimerTab}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'timer'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400'
                  : isTimerActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50'
              }`}
            >
              {isTimerActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                  <span className="font-mono tabular-nums">{formatMiniTime(timerSeconds)}</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white shrink-0" />
                  タイマー
                </>
              )}
            </button>

            {/* Custom Wallpaper Button */}
            <button
              onClick={onOpenWallpaper}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 border ${
                hasCustomWallpaper
                  ? 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40 hover:bg-indigo-900/60'
                  : 'text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="背景壁紙の設定・ぼかし調整"
              aria-label="背景壁紙"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
              title="志望校設定"
              aria-label="設定"
            >
              <Settings className="w-4 h-4" />
            </button>

            {user ? (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-start border-t border-white/10 py-2 bg-[#0b0f19]/95 backdrop-blur-xl px-3 overflow-x-auto text-xs gap-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 font-medium ${
              activeTab === item.id
                ? 'text-indigo-400 font-bold bg-indigo-500/15 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{item.label}</span>
            {item.id === 'timer' && isTimerActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
};
