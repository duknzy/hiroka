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
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <Compass className="w-4 h-4" />
              合格逆算スタート
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              志望大学・学部・目標偏差値を登録しましょう
            </h2>
            <p className="text-xs text-slate-500">
              目指す大学や共通テスト・2次試験本番日、目標勉強時間を設定すると、自動で入試までの逆算日数がカウントダウンされます。
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            志望校・目標を設定する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Target University and Days Count */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600">{target.type || '国公立'}</span>
            <span aria-hidden="true">·</span>
            <span>{target.grade || '高3'} ({target.stream || '理系'})</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700">目標偏差値 {target.targetDeviation?.toFixed(1) || '65.0'}</span>
            <button
              onClick={onOpenSettings}
              className="text-slate-400 hover:text-indigo-600 ml-1 p-0.5 cursor-pointer"
              title="志望校・目標偏差値を編集"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {target.name} <span className="text-lg font-semibold text-slate-600">{target.faculty}</span>
            </h1>
            <button
              onClick={onOpenPlan}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              逆算計画を見る →
            </button>
          </div>

          {plan.monthlyGoal && (
            <p className="text-xs text-slate-600 mt-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
              <span className="font-bold text-slate-800 shrink-0">今期の重点目標:</span>
              <span className="truncate">{plan.monthlyGoal}</span>
            </p>
          )}
        </div>

        {/* Right: Key Exam Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
          {/* 共通テストカウントダウン */}
          <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 min-w-[120px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              共通テスト本番
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-slate-900">
                {kyotsuDays > 0 ? kyotsuDays : 0}
              </span>
              <span className="text-xs font-medium text-slate-500">日</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{target.examDateKyotsu}</div>
          </div>

          {/* 2次試験カウントダウン */}
          <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 min-w-[120px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              個別・2次本番
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-slate-900">
                {secondaryDays > 0 ? secondaryDays : 0}
              </span>
              <span className="text-xs font-medium text-slate-500">日</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{target.examDateSecondary}</div>
          </div>

          {/* 今日の勉強時間 */}
          <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 min-w-[120px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              今日の勉強
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-emerald-600">
                {todayHoursStudied.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500">/ {todayTargetHours}h</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          </div>

          {/* 累計時間 & ストリーク */}
          <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 min-w-[120px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              連続学習
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-2xl font-bold text-amber-600">
                {streakDays}
              </span>
              <span className="text-xs font-medium text-slate-500">日</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">
              累計: {Math.round(totalHoursStudied)}h ({totalProgressPercent}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
