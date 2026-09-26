import React, { useState } from 'react';
import { TargetSchool, StudyPlan, Subject, StudyLog } from '../types';
import {
  Compass,
  Calculator,
  Sliders,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PlanViewProps {
  target: TargetSchool;
  plan: StudyPlan;
  subjects: Subject[];
  logs: StudyLog[];
  onUpdatePlan: (updatedPlan: StudyPlan) => void;
  onOpenSettings: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  target,
  plan,
  subjects,
  logs,
  onUpdatePlan,
  onOpenSettings,
}) => {
  const [weeklyHours, setWeeklyHours] = useState(plan.weeklyTargetHours || 35);
  const [dailyWeekday, setDailyWeekday] = useState(plan.dailyWeekdayHours || 4);
  const [dailyWeekend, setDailyWeekend] = useState(plan.dailyWeekendHours || 7.5);
  const [monthlyGoal, setMonthlyGoal] = useState(plan.monthlyGoal || '');
  const [focusTheme, setFocusTheme] = useState(plan.focusTheme || '');
  const [subjectHours, setSubjectHours] = useState<Record<string, number>>(plan.subjectTargetHours || {});
  const [isSaved, setIsSaved] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysToKyotsu = 0;
  if (target.examDateKyotsu) {
    const kyotsuDate = new Date(target.examDateKyotsu);
    kyotsuDate.setHours(0, 0, 0, 0);
    daysToKyotsu = Math.max(0, Math.ceil((kyotsuDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const weeksLeft = daysToKyotsu / 7;
  const totalEstimatedAvailableHours = Math.round(weeksLeft * (dailyWeekday * 5 + dailyWeekend * 2));

  // Past 14 days actual breakdown
  const past14DaysLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    const diff = (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14;
  });
  const past14DaysTotalMins = past14DaysLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  const actualSubjectPercentages: Record<string, number> = {};
  subjects.forEach((s) => {
    const mins = past14DaysLogs
      .filter((l) => l.subjectId === s.id)
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    actualSubjectPercentages[s.id] =
      past14DaysTotalMins > 0 ? Math.round((mins / past14DaysTotalMins) * 100) : 0;
  });

  const handleAutoDistributeByWeights = () => {
    const newHours: Record<string, number> = {};
    let totalAssigned = 0;
    const weights = target.subjectWeightPercent || {};

    subjects.forEach((s) => {
      const weight = weights[s.id] !== undefined ? weights[s.id] : s.idealWeight || 0;
      if (weight > 0) {
        const assigned = Math.round(((weeklyHours * weight) / 100) * 2) / 2;
        newHours[s.id] = assigned;
        totalAssigned += assigned;
      } else {
        newHours[s.id] = 0;
      }
    });

    const diff = weeklyHours - totalAssigned;
    const topSubject = subjects[0]?.id;
    if (topSubject && newHours[topSubject] !== undefined) {
      newHours[topSubject] = Math.max(0, Number((newHours[topSubject] + diff).toFixed(1)));
    }

    setSubjectHours(newHours);
  };

  const handleSave = () => {
    onUpdatePlan({
      weeklyTargetHours: weeklyHours,
      dailyWeekdayHours: dailyWeekday,
      dailyWeekendHours: dailyWeekend,
      subjectTargetHours: subjectHours,
      monthlyGoal,
      focusTheme,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Backcast Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Compass className="w-4 h-4" />
              合格逆算ルートシミュレータ
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {target.name ? `${target.name} ${target.faculty} 合格への戦略学習計画` : '志望校合格への戦略学習計画'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              入試本番までの残り日数から、必要な時間と最適な科目バランスを逆算設計します
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              志望校・配点を編集
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <CheckCircle className="w-4 h-4" /> : null}
              {isSaved ? '保存完了！' : '計画を保存・適用'}
            </button>
          </div>
        </div>

        {/* Backcast Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
            <span className="text-xs font-medium text-indigo-900 block mb-1">
              共通テスト本番まで
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-indigo-600">
                {daysToKyotsu}
              </span>
              <span className="text-xs font-semibold text-indigo-900">日 (約{weeksLeft.toFixed(1)}週)</span>
            </div>
            <p className="text-[11px] text-indigo-700/80 mt-1">
              本番日: {target.examDateKyotsu || '未設定'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-600 block mb-1">
              本番までに確保できる総勉強時間
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-slate-900">
                {totalEstimatedAvailableHours}
              </span>
              <span className="text-xs font-semibold text-slate-600">時間</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              平日 {dailyWeekday}h + 休日 {dailyWeekend}h のペース維持時
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-600 block mb-1">
              週間目標ペース
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono tabular-nums text-3xl font-extrabold text-emerald-600">
                {weeklyHours}
              </span>
              <span className="text-xs font-semibold text-slate-600">時間 / 週</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              1日平均 {(weeklyHours / 7).toFixed(1)}時間の学習が必要
            </p>
          </div>
        </div>
      </div>

      {/* 2. Gap Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              志望校配点比率 vs 現在の実績バランス（ギャップ分析）
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              配点が高い科目に十分な時間を投資できているかを可視化します
            </p>
          </div>
          {subjects.length > 0 && (
            <button
              onClick={handleAutoDistributeByWeights}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              配点に合わせて自動配分
            </button>
          )}
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            まだ科目が登録されていません。「科目・参考書」タブで科目を登録すると、配点ギャップ分析が行えます。
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((sub) => {
              const idealWeight = target.subjectWeightPercent[sub.id] !== undefined
                ? target.subjectWeightPercent[sub.id]
                : sub.idealWeight || 0;
              const actualRatio = actualSubjectPercentages[sub.id] || 0;
              const diff = actualRatio - idealWeight;
              const isDeficit = diff < -5;
              const isExcess = diff > 8;

              return (
                <div key={sub.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="font-bold text-slate-800">{sub.name}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">
                        目標配点: <strong className="text-slate-800">{idealWeight}%</strong>
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500">
                        直近14日実績: <strong className="text-slate-800">{actualRatio}%</strong>
                      </span>
                    </div>

                    <div>
                      {idealWeight > 0 && (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            isDeficit
                              ? 'bg-rose-100 text-rose-700'
                              : isExcess
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isDeficit
                            ? `要補強 (${diff}%不足)`
                            : isExcess
                            ? `やや過多 (+${diff}%)`
                            : '適正バランス'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span>理想の配点目標</span>
                        <span className="font-mono">{idealWeight}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, idealWeight)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span>直近の実績比率</span>
                        <span className="font-mono">{actualRatio}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isDeficit ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, actualRatio)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Target Hours Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-600" />
          週間学習時間 & 科目別目標の配分設定
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              週間合計目標 (時間)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value) || 0)}
              className="w-full text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              平日目標 / 1日あたり (時間)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="18"
              value={dailyWeekday}
              onChange={(e) => setDailyWeekday(Number(e.target.value) || 0)}
              className="w-full text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              休日目標 / 1日あたり (時間)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="18"
              value={dailyWeekend}
              onChange={(e) => setDailyWeekend(Number(e.target.value) || 0)}
              className="w-full text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Subject target sliders */}
        {subjects.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800 mb-3">各科目の週間目標時間</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((sub) => {
                const currentHours = subjectHours[sub.id] || 0;
                return (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold text-slate-800">{sub.name}</span>
                      <span className="font-mono tabular-nums font-bold text-indigo-600">
                        {currentHours}h/週
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="0.5"
                      value={currentHours}
                      onChange={(e) =>
                        setSubjectHours({
                          ...subjectHours,
                          [sub.id]: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 mt-6 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              今期の月間重点ゴール
            </label>
            <input
              type="text"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              placeholder="例: 数学重要問題集を1周完了し、単語帳を完全定着させる"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              今週の集中テーマ・心得
            </label>
            <input
              type="text"
              value={focusTheme}
              onChange={(e) => setFocusTheme(e.target.value)}
              placeholder="例: 朝自習で必ず1時間解き、スマホを見ない"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
