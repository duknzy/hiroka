import React, { useState } from 'react';
import { ScheduleItem, TodoTask, Subject, TargetSchool } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  todos: TodoTask[];
  subjects: Subject[];
  target: TargetSchool;
  onAddScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  onDeleteScheduleItem: (id: string) => void;
  onToggleScheduleItem: (id: string) => void;
  onAddTodo: (task: Omit<TodoTask, 'id'>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  todos,
  subjects,
  target,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onToggleScheduleItem,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // New Schedule Block form
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('18:30');
  const [newBlockSubject, setNewBlockSubject] = useState(subjects[0]?.id || 'math');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockCategory, setNewBlockCategory] = useState<ScheduleItem['category']>('自習');

  // New Todo form
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoSubject, setNewTodoSubject] = useState(subjects[0]?.id || 'math');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoTask['priority']>('high');
  const [newTodoEstimated, setNewTodoEstimated] = useState(60);

  // Filter items for selected day
  const daySchedule = schedule
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayTodos = todos.filter((t) => t.dueDate === selectedDate || !t.dueDate);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim()) return;

    onAddScheduleItem({
      date: selectedDate,
      startTime: newStartTime,
      endTime: newEndTime,
      subjectId: newBlockSubject,
      title: newBlockTitle.trim(),
      isCompleted: false,
      category: newBlockCategory,
    });

    setNewBlockTitle('');
    setIsAddingBlock(false);
  };

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    onAddTodo({
      title: newTodoTitle.trim(),
      subjectId: newTodoSubject,
      priority: newTodoPriority,
      dueDate: selectedDate,
      completed: false,
      estimatedMinutes: Number(newTodoEstimated) || 45,
    });

    setNewTodoTitle('');
    setIsAddingTodo(false);
  };

  const changeDateBy = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            title="前日"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
              {selectedDate}
            </span>
            {selectedDate === todayStr && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                今日
              </span>
            )}
          </div>
          <button
            onClick={() => changeDateBy(1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
            title="翌日"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            今日へ戻る
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Day Timetable (バーチカル時間割) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                1日のタイムスケジュール (時間割)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                計画した学習コマを確実に実行していきましょう
              </p>
            </div>
            <button
              onClick={() => setIsAddingBlock(!isAddingBlock)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              予定コマ追加
            </button>
          </div>

          {/* Add Schedule Block Form */}
          {isAddingBlock && (
            <form
              onSubmit={handleCreateBlock}
              className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">開始時刻</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">終了時刻</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">科目</label>
                  <select
                    value={newBlockSubject}
                    onChange={(e) => setNewBlockSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">分類</label>
                  <select
                    value={newBlockCategory}
                    onChange={(e) => setNewBlockCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                  >
                    <option value="自習">自習</option>
                    <option value="復習">復習</option>
                    <option value="予備校/塾">予備校/塾</option>
                    <option value="模試">模試</option>
                    <option value="学校">学校</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">内容・学習予定</label>
                <input
                  type="text"
                  placeholder="例: 青チャート数ⅡB 微分例題 演習"
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingBlock(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  スケジュールに追加
                </button>
              </div>
            </form>
          )}

          {/* Schedule Timeline List */}
          <div className="space-y-2.5">
            {daySchedule.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">この日の予定コマはまだありません。</p>
                <button
                  onClick={() => setIsAddingBlock(true)}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  ＋最初の予定を追加
                </button>
              </div>
            ) : (
              daySchedule.map((item) => {
                const sub = subjects.find((s) => s.id === item.subjectId);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      item.isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleScheduleItem(item.id)}
                        className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums font-bold text-slate-900">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span
                            className="font-medium px-2 py-0.5 rounded text-[10px]"
                            style={{
                              backgroundColor: `${sub?.color || '#3B82F6'}15`,
                              color: sub?.color || '#3B82F6',
                            }}
                          >
                            {sub?.name || '学習'}
                          </span>
                          <span className="text-slate-400 text-[10px]">· {item.category}</span>
                        </div>
                        <p
                          className={`mt-1 font-medium text-slate-800 ${
                            item.isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteScheduleItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded cursor-pointer"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right (5 cols): TODO Checklist & Exam Milestones */}
        <div className="lg:col-span-5 space-y-6">
          {/* Day TODOs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                タスク・TODO一覧
              </h2>
              <button
                onClick={() => setIsAddingTodo(!isAddingTodo)}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                ＋タスク追加
              </button>
            </div>

            {isAddingTodo && (
              <form onSubmit={handleCreateTodo} className="mb-3 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="やるべきタスク名"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newTodoSubject}
                    onChange={(e) => setNewTodoSubject(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-1.5"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg p-1.5"
                  >
                    <option value="urgent">最重要 (赤)</option>
                    <option value="high">重要 (黄)</option>
                    <option value="normal">通常</option>
                  </select>
                  <input
                    type="number"
                    placeholder="所要分"
                    value={newTodoEstimated}
                    onChange={(e) => setNewTodoEstimated(Number(e.target.value) || 30)}
                    className="bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTodo(false)}
                    className="text-slate-500 px-2 py-1"
                  >
                    閉じる
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 font-semibold text-white bg-indigo-600 rounded-lg"
                  >
                    保存
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {dayTodos.map((todo) => {
                const sub = subjects.find((s) => s.id === todo.subjectId);
                return (
                  <div
                    key={todo.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      todo.completed
                        ? 'bg-slate-50 border-slate-100 opacity-60'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTodo(todo.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-slate-800 ${
                            todo.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          {sub && <span style={{ color: sub.color }}>{sub.name}</span>}
                          <span>·</span>
                          <span>約{todo.estimatedMinutes}分</span>
                          {todo.priority === 'urgent' && (
                            <span className="text-rose-600 font-semibold">【最重要】</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Milestone Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              入試重要イベントマイルストーン
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-medium text-slate-800">大学入学共通テスト 本番</span>
                <span className="font-mono tabular-nums text-indigo-600 font-semibold">
                  {target.examDateKyotsu}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-medium text-slate-800">国公立2次 / 個別日程</span>
                <span className="font-mono tabular-nums text-rose-600 font-semibold">
                  {target.examDateSecondary}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-medium text-slate-800">出願書類準備・共通テスト利用</span>
                <span className="text-slate-500">12月中旬〜1月上旬</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
