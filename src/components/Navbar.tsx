import React from 'react';
import { ActiveTab, TargetSchool } from '../types';
import { Play, PlusCircle, Settings, Flame, User as UserIcon, LogIn, LogOut, Image as ImageIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  target: TargetSchool;
  streakDays: number;
  user: User | null;
  hasCustomWallpaper: boolean;
  onOpenTimer: () => void;
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
  onOpenTimer,
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
    { id: 'plan', label: '逆算計画' },
    { id: 'schedule', label: '予定・TODO' },
    { id: 'materials', label: '科目・参考書' },
    { id: 'diary', label: '学習日誌' },
    { id: 'mock-exams', label: '模試成績' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                PassRoute
              </span>
            </button>

            {/* Target indicator */}
            {target.name ? (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
                <button
                  onClick={onOpenSettings}
                  className="font-medium text-slate-700 hover:text-indigo-600 cursor-pointer"
                >
                  {target.name} {target.faculty}
                </button>
                {daysLeft > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-indigo-600 font-semibold">
                      共テまであと {daysLeft} 日
                    </span>
                  </>
                )}
                {streakDays > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {streakDays}日連続
                    </span>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenSettings}
                className="hidden lg:inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
              >
                ＋志望校・目標を設定
              </button>
            )}
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === item.id
                    ? 'text-indigo-600 border-indigo-600 font-semibold'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions + Wallpaper + User Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenManualLog}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="過去の勉強時間を手動入力"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              手動記録
            </button>

            <button
              onClick={onOpenTimer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              タイマー計測
            </button>

            {/* Custom Wallpaper Button */}
            <button
              onClick={onOpenWallpaper}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                hasCustomWallpaper
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="背景壁紙の設定・ぼかし調整"
              aria-label="背景壁紙"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="志望校設定"
              aria-label="設定"
            >
              <Settings className="w-5 h-5" />
            </button>

            {user ? (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2 bg-white/90 backdrop-blur-md px-2 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === item.id
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
