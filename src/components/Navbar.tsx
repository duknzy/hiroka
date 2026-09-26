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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Zone 1: Wordmark & Optional Target Pill */}
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus-visible:outline-none shrink-0"
            >
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                PassRoute
              </span>
            </button>

            {/* Target indicator - only on very wide screens so it never squishes tabs */}
            {target.name ? (
              <div className="hidden 2xl:flex items-center gap-2 text-xs bg-slate-100/80 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 text-slate-600">
                <button
                  onClick={onOpenSettings}
                  className="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer whitespace-nowrap"
                >
                  {target.name} {target.faculty}
                </button>
                {daysLeft > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">|</span>
                    <span className="font-mono tabular-nums text-indigo-600 font-bold whitespace-nowrap">
                      共テまで {daysLeft} 日
                    </span>
                  </>
                )}
                {streakDays > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold whitespace-nowrap">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {streakDays}日連続
                    </span>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Zone 2: Navigation Links (Never wrap character by character!) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3.5 text-sm font-medium text-slate-600 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-2 px-2 xl:px-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs xl:text-sm tracking-normal ${
                  activeTab === item.id
                    ? 'text-indigo-600 border-indigo-600 font-bold'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'timer' && isTimerActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions + Wallpaper + User Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenManualLog}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="過去の勉強時間を手動入力"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              手動記録
            </button>

            {/* Quick Timer trigger / indicator */}
            <button
              onClick={onOpenTimerTab}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'timer'
                  ? 'bg-indigo-700 text-white'
                  : isTimerActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                hasCustomWallpaper
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="背景壁紙の設定・ぼかし調整"
              aria-label="背景壁紙"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="志望校設定"
              aria-label="設定"
            >
              <Settings className="w-4 h-4" />
            </button>

            {user ? (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-start border-t border-slate-200 py-2 bg-white/95 backdrop-blur-md px-3 overflow-x-auto text-xs gap-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 font-medium ${
              activeTab === item.id
                ? 'text-indigo-600 font-bold bg-indigo-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
            {item.id === 'timer' && isTimerActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
};
