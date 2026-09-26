import React from 'react';
import { Subject, StudyMaterial } from '../types';
import { Play, Pause, CheckCircle2, Maximize2, Flame } from 'lucide-react';

interface ActiveTimerDockProps {
  seconds: number;
  isActive: boolean;
  subject?: Subject;
  material?: StudyMaterial;
  unitNote?: string;
  onToggleTimer: () => void;
  onFinishTimer: () => void;
  onExpandToTimerTab: () => void;
}

export const ActiveTimerDock: React.FC<ActiveTimerDockProps> = ({
  seconds,
  isActive,
  subject,
  material,
  unitNote,
  onToggleTimer,
  onFinishTimer,
  onExpandToTimerTab,
}) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const themeColor = subject?.color || '#6366F1';

  return (
    <aside aria-label="現在計測中のタイマー" className="fixed bottom-5 right-5 sm:right-8 z-40 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xl border border-slate-700/60 flex items-center gap-3.5 ring-1 ring-white/10">
        {/* Glow indicator */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              isActive ? 'animate-ping opacity-80' : 'opacity-40'
            }`}
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: themeColor }}
          />
        </div>

        {/* Info */}
        <div
          onClick={onExpandToTimerTab}
          className="flex-1 min-w-[130px] cursor-pointer group"
          title="クリックして全画面タイマーを開く"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span
              className="font-bold text-white px-1.5 py-0.2 rounded"
              style={{ backgroundColor: `${themeColor}40` }}
            >
              {subject?.name || '自習'}
            </span>
            <span className="truncate text-slate-400 max-w-[110px]">
              {material ? material.title : unitNote || '計測中'}
            </span>
          </div>

          <div className="font-mono tabular-nums font-bold text-base sm:text-lg text-white group-hover:text-indigo-400 transition-colors">
            {hrs > 0 && `${String(hrs).padStart(2, '0')}:`}
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            <span className="text-[10px] text-slate-400 ml-1.5 font-sans font-normal">
              {isActive ? '計測中' : '一時停止'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleTimer}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title={isActive ? '一時停止' : '再開'}
          >
            {isActive ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onFinishTimer}
            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-xl transition-colors cursor-pointer"
            title="計測を終了して記録を保存"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>

          <button
            onClick={onExpandToTimerTab}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="タイマー画面を全画面で開く"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
