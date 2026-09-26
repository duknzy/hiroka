import React from 'react';
import { TargetSchool, StudyPlan } from '../types';
import { Target, Flame, Calendar, Clock, Edit3, Compass } from 'lucide-react';

interface CountdownBannerProps {
  target: TargetSchool;
  plan: StudyPlan;
  totalHoursStudied: number;
  todayHoursStudied: number;
  streakDays: number;
  onOpenSettings: () => void;
  onOpenPlan: () => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  target,
  plan,
  totalHoursStudied,
  todayHoursStudied,
  streakDays,
  onOpenSettings,
  onOpenPlan,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let kyotsuDays = 0;
  if (target.examDateKyotsu) {
    const kyotsuDate = new Date(target.examDateKyotsu);
    kyotsuDate.setHours(0, 0, 0, 0);
    kyotsuDays = Math.ceil((kyotsuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  let secondaryDays = 0;
  if (target.examDateSecondary) {
    const secondaryDate = new Date(target.examDateSecondary);
    secondaryDate.setHours(0, 0, 0, 0);
    secondaryDays = Math.ceil((secondaryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const todayTargetHours = isWeekend ? plan.dailyWeekendHours || 7.5 : plan.dailyWeekdayHours || 4;
  const todayProgressPercent = Math.min(
    100,
    Math.round((todayHoursStudied / (todayTargetHours || 5)) * 100)
  );

  const totalTargetHours = target.targetTotalHours || 3000;
  const totalProgressPercent = Math.min(
    100,
    Math.round((totalHoursStudied / totalTargetHours) * 100)
  );

  // If no target university is set yet, show an inviting setup card
  if (!target.name) {
    return (
      <div className="bg-gradient-to-r from-[#0d1527]/90 via-[#11192e]/90 to-[#0d1527]/90 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-6 shadow-xl shadow-black/40 mb-6 relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wide uppercase">
              <Compass className="w-4 h-4 text-indigo-400 animate-pulse" />
              合格逆算スタート
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              志望大学・学部・目標偏差値を登録しましょう
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              目指す大学や共通テスト・2次試験本番日、目標勉強時間を設定すると、自動で入試までの逆算日数がカウントダウンされます。
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            志望校・目標を設定する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/40 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-60 h-20 bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Target University and Days Count */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">{target.type || '国公立'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">{target.grade || '高3'} ({target.stream || '理系'})</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-medium text-slate-300">目標偏差値 <strong className="text-white font-mono">{target.targetDeviation?.toFixed(1) || '65.0'}</strong></span>
            <button
              onClick={onOpenSettings}
              className="text-slate-500 hover:text-indigo-400 ml-1 p-0.5 cursor-pointer transition-colors"
              title="志望校・目標偏差値を編集"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {target.name} <span className="text-lg font-medium text-slate-300">{target.faculty}</span>
            </h1>
            <button
              onClick={onOpenPlan}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              逆算計画を見る →
            </button>
          </div>

          {plan.monthlyGoal && (
            <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
              <span className="font-bold text-indigo-300 shrink-0 bg-indigo-950/80 px-1.5 py-0.5 rounded text-[11px]">重点目標</span>
              <span className="truncate text-slate-300">{plan.monthlyGoal}</span>
            </p>
          )}
        </div>

        {/* Right: Key Exam Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
          {/* 共通テストカウントダウン */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 min-w-[120px] shadow-inner shadow-black/20">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              共通テスト本番
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-white">
                {kyotsuDays > 0 ? kyotsuDays : 0}
              </span>
              <span className="text-xs font-medium text-slate-400">日</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{target.examDateKyotsu}</div>
          </div>

          {/* 2次試験カウントダウン */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 min-w-[120px] shadow-inner shadow-black/20">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              個別・2次本番
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-white">
                {secondaryDays > 0 ? secondaryDays : 0}
              </span>
              <span className="text-xs font-medium text-slate-400">日</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{target.examDateSecondary}</div>
          </div>

          {/* 今日の勉強時間 */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 min-w-[120px] shadow-inner shadow-black/20">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              今日の勉強
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-emerald-400">
                {todayHoursStudied.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-400">/ {todayTargetHours}h</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-emerald-400/50"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          </div>

          {/* 累計時間 & ストリーク */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 min-w-[120px] shadow-inner shadow-black/20">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              連続学習
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-amber-400">
                {streakDays}
              </span>
              <span className="text-xs font-medium text-slate-400">日</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono tabular-nums">
              累計: {Math.round(totalHoursStudied)}h ({totalProgressPercent}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
