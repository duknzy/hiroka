import React, { useState } from 'react';
import {
  Subject,
  StudyLog,
  StudyPlan,
  TargetSchool,
  TodoTask,
  ScheduleItem,
  DiaryEntry,
  StudyMaterial,
} from '../types';
import { CountdownBanner } from './CountdownBanner';
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  Clock,
  Smile,
  BookOpen,
  Trash2,
  BookMarked,
  Play,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  subjects: Subject[];
  materials: StudyMaterial[];
  logs: StudyLog[];
  target: TargetSchool;
  plan: StudyPlan;
  todos: TodoTask[];
  schedule: ScheduleItem[];
  diary: DiaryEntry[];
  onOpenTimer: () => void;
  onOpenManualLog: () => void;
  onOpenPlan: () => void;
  onOpenDiaryTab: () => void;
  onOpenSettings: () => void;
  onOpenMaterialsTab: () => void;
  onStartTimerForMaterial: (subjectId: string, materialId: string) => void;
  onToggleTodo: (id: string) => void;
  onAddTodo: (task: Omit<TodoTask, 'id'>) => void;
  onDeleteLog: (id: string) => void;
  onSaveDiary: (entry: Omit<DiaryEntry, 'id'>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  materials,
  logs,
  target,
  plan,
  todos,
  schedule,
  diary,
  onOpenTimer,
  onOpenManualLog,
  onOpenPlan,
  onOpenDiaryTab,
  onOpenSettings,
  onOpenMaterialsTab,
  onStartTimerForMaterial,
  onToggleTodo,
  onAddTodo,
  onDeleteLog,
  onSaveDiary,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoSubject, setNewTodoSubject] = useState(subjects[0]?.id || '');

  // Diary inline state
  const [isEditingDiary, setIsEditingDiary] = useState(false);
  const todayDiary = diary.find((d) => d.date === todayStr);
  const [goodPoints, setGoodPoints] = useState(todayDiary?.goodPoints || '');
  const [improvements, setImprovements] = useState(todayDiary?.improvements || '');
  const [tomorrowCommitment, setTomorrowCommitment] = useState(todayDiary?.tomorrowCommitment || '');

  // Stats calculation
  const totalMinutesStudied = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHoursStudied = totalMinutesStudied / 60;

  const todayLogs = logs.filter((log) => log.date === todayStr);
  const todayMinutesStudied = todayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const todayHoursStudied = todayMinutesStudied / 60;

  const streakDays = calculateStreak(logs);

  // Weekly study data (last 7 days)
  const last7Days = getLast7Days();
  const weeklyData = last7Days.map((day) => {
    const dayLogs = logs.filter((l) => l.date === day.dateStr);
    const mins = dayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    return {
      label: day.label,
      dateStr: day.dateStr,
      hours: Number((mins / 60).toFixed(1)),
      isToday: day.dateStr === todayStr,
    };
  });
  const weekTotalHours = weeklyData.reduce((acc, d) => acc + d.hours, 0);

  // Subject breakdown
  const subjectBreakdown: Record<string, { mins: number; hours: number; color: string; name: string }> = {};
  subjects.forEach((s) => {
    subjectBreakdown[s.id] = { mins: 0, hours: 0, color: s.color, name: s.name };
  });

  logs.forEach((log) => {
    if (subjectBreakdown[log.subjectId]) {
      subjectBreakdown[log.subjectId].mins += log.durationMinutes;
    } else {
      subjectBreakdown[log.subjectId] = {
        mins: log.durationMinutes,
        hours: 0,
        color: '#64748B',
        name: log.subjectName || 'その他',
      };
    }
  });

  Object.keys(subjectBreakdown).forEach((id) => {
    subjectBreakdown[id].hours = Number((subjectBreakdown[id].mins / 60).toFixed(1));
  });

  const activeSubjects = Object.values(subjectBreakdown).filter((s) => s.mins > 0);

  // Heatmap: past 35 days
  const heatmapDays = getPastNDays(35);
  const heatmapData = heatmapDays.map((dateStr) => {
    const dayMins = logs
      .filter((l) => l.date === dateStr)
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    return {
      dateStr,
      mins: dayMins,
      level: getHeatmapLevel(dayMins),
    };
  });

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    onAddTodo({
      title: newTodoTitle.trim(),
      subjectId: newTodoSubject || (subjects[0]?.id || 'general'),
      priority: 'high',
      dueDate: todayStr,
      completed: false,
      estimatedMinutes: 45,
    });
    setNewTodoTitle('');
  };

  const handleSaveDiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDiary({
      date: todayStr,
      goodPoints,
      improvements,
      tomorrowCommitment,
    });
    setIsEditingDiary(false);
  };

  const maxWeeklyHour = Math.max(6, ...weeklyData.map((d) => d.hours));

  return (
    <div className="space-y-6">
      {/* 1. Countdown & Target Banner */}
      <CountdownBanner
        target={target}
        plan={plan}
        totalHoursStudied={totalHoursStudied}
        todayHoursStudied={todayHoursStudied}
        streakDays={streakDays}
        onOpenPlan={onOpenPlan}
        onOpenSettings={onOpenSettings}
      />

      {/* Quick Launch Active Materials Strip */}
      {materials.length > 0 && (
        <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5 tracking-wide">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              学習中の参考書から即スタート
            </h2>
            <button
              onClick={onOpenMaterialsTab}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
            >
              参考書一覧 ({materials.length}) →
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {materials.slice(0, 5).map((mat) => {
              const sub = subjects.find((s) => s.id === mat.subjectId);
              const percent = Math.min(100, Math.round((mat.currentUnit / mat.totalUnits) * 100));
              return (
                <div
                  key={mat.id}
                  className="bg-slate-900/90 hover:bg-slate-800/90 rounded-xl border border-white/5 hover:border-indigo-500/40 p-3 min-w-[200px] shrink-0 transition-all flex flex-col justify-between shadow-inner shadow-black/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-[11px]">
                      <span
                        className="font-semibold px-2 py-0.5 rounded-full border border-white/10"
                        style={{
                          backgroundColor: `${sub?.color || '#3B82F6'}20`,
                          color: sub?.color || '#60A5FA',
                        }}
                      >
                        {sub?.name}
                      </span>
                      <span className="font-mono text-slate-400 font-semibold">{percent}%</span>
                    </div>
                    <div className="font-bold text-xs text-white truncate mb-2.5">
                      {mat.title}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartTimerForMaterial(mat.subjectId, mat.id)}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    この教材を計測
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Top Analytics: Weekly Bar Chart + Subject Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                直近7日間の学習推移
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                過去7日間合計:{' '}
                <span className="font-mono tabular-nums font-bold text-cyan-400">
                  {weekTotalHours.toFixed(1)}時間
                </span>{' '}
                <span className="text-slate-600">/</span> 週目標: <span className="font-mono text-slate-300 font-semibold">{plan.weeklyTargetHours}時間</span>
              </p>
            </div>
            <button
              onClick={onOpenTimer}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              今すぐ計測 →
            </button>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {weeklyData.map((day) => {
              const heightPercent = Math.min(100, Math.round((day.hours / maxWeeklyHour) * 100));
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-400">
                    {day.hours > 0 ? `${day.hours}h` : '-'}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-900/90 border border-white/5 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-md shadow-cyan-400/40'
                          : day.hours >= 4
                          ? 'bg-gradient-to-t from-indigo-700 to-indigo-500'
                          : 'bg-indigo-600/70'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      day.isToday ? 'text-cyan-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                科目別学習バランス
              </h2>
              <span className="text-xs text-slate-400">累計時間比率</span>
            </div>

            {activeSubjects.length > 0 ? (
              <>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex mb-4 border border-white/5">
                  {activeSubjects.map((sub) => {
                    const percent = totalMinutesStudied > 0 ? (sub.mins / totalMinutesStudied) * 100 : 0;
                    return (
                      <div
                        key={sub.name}
                        style={{ width: `${percent}%`, backgroundColor: sub.color }}
                        className="h-full transition-all duration-300"
                        title={`${sub.name}: ${percent.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                  {activeSubjects.map((sub) => {
                    const percent = totalMinutesStudied > 0 ? (sub.mins / totalMinutesStudied) * 100 : 0;
                    return (
                      <div key={sub.name} className="flex items-center justify-between text-xs py-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: sub.color }} />
                          <span className="font-medium text-slate-200">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums text-slate-400">{sub.hours}h</span>
                          <span className="font-mono tabular-nums font-bold text-white w-10 text-right">
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                学習時間が記録されると、ここに科目別比率が表示されます。
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>志望校配点との比較</span>
            <button
              onClick={onOpenPlan}
              className="text-indigo-400 font-semibold hover:text-indigo-300 cursor-pointer transition-colors"
            >
              配点分析 →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Heatmap */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">学習継続ヒートマップ (過去5週間)</h2>
            <span className="text-xs text-slate-400">· 継続こそ合格の最短ルート</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>少</span>
            <span className="w-3 h-3 rounded-xs bg-slate-900 border border-white/5" />
            <span className="w-3 h-3 rounded-xs bg-indigo-900/80 border border-indigo-700/50" />
            <span className="w-3 h-3 rounded-xs bg-indigo-700 border border-indigo-500/50" />
            <span className="w-3 h-3 rounded-xs bg-indigo-500 border border-indigo-400/60" />
            <span className="w-3 h-3 rounded-xs bg-cyan-400 border border-cyan-300" />
            <span>多</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {heatmapData.map((d) => (
            <div
              key={d.dateStr}
              title={`${d.dateStr}: ${(d.mins / 60).toFixed(1)}時間`}
              className={`w-6 h-6 rounded-xs transition-all cursor-default ${
                d.level === 0
                  ? 'bg-slate-900/90 border border-white/5'
                  : d.level === 1
                  ? 'bg-indigo-950 border border-indigo-800/60'
                  : d.level === 2
                  ? 'bg-indigo-800 border border-indigo-600/60'
                  : d.level === 3
                  ? 'bg-indigo-600 border border-indigo-400/60 shadow-xs shadow-indigo-600/40'
                  : 'bg-cyan-400 border border-cyan-300 shadow-xs shadow-cyan-400/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 4. Action Center: Tasks + Today's Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: TODOs */}
        <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              本日の学習TODO・タスク
            </h2>
            <span className="text-xs font-mono text-slate-400">
              完了 {todos.filter((t) => t.completed).length}/{todos.length}
            </span>
          </div>

          <form onSubmit={handleCreateTodo} className="flex gap-2 mb-4">
            {subjects.length > 0 && (
              <select
                value={newTodoSubject}
                onChange={(e) => setNewTodoSubject(e.target.value)}
                className="text-xs bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="新しいTODOを追加 (例: シス単 100語復習)"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              className="flex-1 text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
            >
              追加
            </button>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
            {todos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                登録されているTODOはありません。上のフォームから追加してください。
              </p>
            ) : (
              todos.map((todo) => {
                const sub = subjects.find((s) => s.id === todo.subjectId);
                return (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      todo.completed
                        ? 'bg-slate-900/30 border-white/5 opacity-50'
                        : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/30'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTodo(todo.id)}
                      className="mt-0.5 text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium text-slate-200 ${
                          todo.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        {sub && <span style={{ color: sub.color }}>{sub.name}</span>}
                        <span>·</span>
                        <span>約{todo.estimatedMinutes}分</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Today's Reflection */}
        <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-400" />
                本日の学習振り返り日誌
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenDiaryTab}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  過去の日誌を見る
                </button>
                {!isEditingDiary && (
                  <button
                    onClick={() => setIsEditingDiary(true)}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {todayDiary ? '編集' : '書く'}
                  </button>
                )}
              </div>
            </div>

            {isEditingDiary ? (
              <form onSubmit={handleSaveDiarySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    良かった点・成長を感じたこと
                  </label>
                  <input
                    type="text"
                    value={goodPoints}
                    onChange={(e) => setGoodPoints(e.target.value)}
                    placeholder="例: 数学の微積分を集中して解き切った。"
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    改善点・反省したこと
                  </label>
                  <input
                    type="text"
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="例: 途中でスマホを見てしまった。明日は別室に置く。"
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    明日の絶対コミットメント
                  </label>
                  <input
                    type="text"
                    value={tomorrowCommitment}
                    onChange={(e) => setTomorrowCommitment(e.target.value)}
                    placeholder="例: 朝7時からシス単100個＋物理の演習2題をやる！"
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingDiary(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-all"
                  >
                    日誌を保存
                  </button>
                </div>
              </form>
            ) : todayDiary ? (
              <div className="space-y-2.5 bg-slate-900/90 p-4 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    ◎ 良かった点
                  </span>
                  <p className="text-slate-300 leading-relaxed">{todayDiary.goodPoints || '未記入'}</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-400 block mb-0.5">
                    ▲ 改善点・課題
                  </span>
                  <p className="text-slate-300 leading-relaxed">{todayDiary.improvements || '未記入'}</p>
                </div>
                <div>
                  <span className="font-semibold text-indigo-300 block mb-0.5">
                    ★ 明日のコミットメント
                  </span>
                  <p className="text-white font-medium leading-relaxed">
                    {todayDiary.tomorrowCommitment || '未記入'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-dashed border-white/10">
                <p className="text-xs text-slate-400 mb-2.5">まだ今日の振り返りが書かれていません。</p>
                <button
                  onClick={() => setIsEditingDiary(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 rounded-xl hover:bg-indigo-900/60 shadow-xs cursor-pointer transition-all"
                >
                  今日の振り返りを書く
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>今日の学習記録: <strong className="text-slate-200">{todayLogs.length}件</strong></span>
            <button
              onClick={onOpenManualLog}
              className="text-indigo-400 font-medium hover:text-indigo-300 cursor-pointer transition-colors"
            >
              ＋手動追加
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Study Logs Table (WITH DIRECT RE-LAUNCH ACTION!) */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              直近の学習ログ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              記録からワンクリックで同じ教材のタイマーを即座に再開できます
            </p>
          </div>
          <button
            onClick={onOpenManualLog}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
          >
            ＋手動記録
          </button>
        </div>

        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              まだ学習ログがありません。タイマー計測または手動記録から追加しましょう。
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">日付</th>
                  <th className="py-2.5 px-3 font-semibold">科目</th>
                  <th className="py-2.5 px-3 font-semibold">参考書 / 範囲</th>
                  <th className="py-2.5 px-3 font-semibold text-right">勉強時間</th>
                  <th className="py-2.5 px-3 font-semibold">メモ</th>
                  <th className="py-2.5 px-3 font-semibold text-right">クイックアクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.slice(0, 10).map((log) => {
                  const sub = subjects.find((s) => s.id === log.subjectId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className="font-medium px-2 py-0.5 rounded-full text-[11px] border border-white/10"
                          style={{
                            backgroundColor: `${sub?.color || '#3B82F6'}20`,
                            color: sub?.color || '#60A5FA',
                          }}
                        >
                          {log.subjectName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px] truncate">
                        <span className="font-semibold text-white">{log.materialTitle || '自習'}</span>
                        {log.range && <span className="text-slate-400 text-[11px] ml-1.5">({log.range})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-cyan-400 whitespace-nowrap">
                        {log.durationMinutes}分
                      </td>
                      <td className="py-2.5 px-3 max-w-[240px] truncate text-slate-400">
                        {log.memo || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Launch: Record from Log! */}
                          <button
                            onClick={() => onStartTimerForMaterial(log.subjectId, log.materialId || '')}
                            className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                            title="この教材の続きを計測"
                          >
                            <Play className="w-3 h-3 fill-indigo-400" />
                            続きを計測
                          </button>
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

function calculateStreak(logs: StudyLog[]): number {
  if (logs.length === 0) return 0;
  const uniqueDates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date();
  if (!uniqueDates.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getLast7Days() {
  const days = [];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      label: `${d.getMonth() + 1}/${d.getDate()}(${weekDays[d.getDay()]})`,
    });
  }
  return days;
}

function getPastNDays(n: number): string[] {
  const list = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    list.push(d.toISOString().split('T')[0]);
  }
  return list;
}

function getHeatmapLevel(mins: number): number {
  if (mins === 0) return 0;
  if (mins < 90) return 1;
  if (mins < 210) return 2;
  if (mins < 360) return 3;
  return 4;
}
