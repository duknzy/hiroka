import React, { useState } from 'react';
import { MockExamRecord, TargetSchool } from '../types';
import { Award, Plus, Trash2, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

interface MockExamsViewProps {
  mockExams: MockExamRecord[];
  target: TargetSchool;
  onAddMockExam: (record: Omit<MockExamRecord, 'id'>) => void;
  onDeleteMockExam: (id: string) => void;
}

export const MockExamsView: React.FC<MockExamsViewProps> = ({
  mockExams,
  target,
  onAddMockExam,
  onDeleteMockExam,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [overallDeviation, setOverallDeviation] = useState(65);
  const [overallScore, setOverallScore] = useState(650);
  const [maxScore, setMaxScore] = useState(900);
  const [judgment, setJudgment] = useState<MockExamRecord['judgment']>('B');
  const [notes, setNotes] = useState('');

  const sortedMocks = [...mockExams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMockExam({
      name: name.trim(),
      date,
      overallDeviation: Number(overallDeviation) || 60,
      overallScore: Number(overallScore) || 500,
      maxScore: Number(maxScore) || 900,
      judgment,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setIsAdding(false);
  };

  const getJudgmentBadge = (judg: MockExamRecord['judgment']) => {
    const colors: Record<string, string> = {
      A: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      B: 'bg-blue-100 text-blue-800 border-blue-300',
      C: 'bg-amber-100 text-amber-800 border-amber-300',
      D: 'bg-orange-100 text-orange-800 border-orange-300',
      E: 'bg-rose-100 text-rose-800 border-rose-300',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${colors[judg] || ''}`}>
        {judg}判定
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            模試成績・志望校判定トラッカー
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            目標偏差値 <strong className="text-slate-800">{target.targetDeviation.toFixed(1)}</strong> ({target.name} {target.faculty}) に向けた偏差値推移と課題分析
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          模試結果を登録
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs space-y-3 text-xs"
        >
          <h2 className="font-bold text-slate-900 text-sm">新規模試結果の入力</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">模試名</label>
              <input
                type="text"
                placeholder="例: 第2回 全統記述模試"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">受験日</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">総合偏差値</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="90"
                value={overallDeviation}
                onChange={(e) => setOverallDeviation(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">志望校判定</label>
              <select
                value={judgment}
                onChange={(e) => setJudgment(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
              >
                <option value="A">A判定 (合格可能性 80%以上)</option>
                <option value="B">B判定 (合格可能性 60%以上)</option>
                <option value="C">C判定 (合格可能性 40%〜60%)</option>
                <option value="D">D判定 (合格可能性 20%〜40%)</option>
                <option value="E">E判定 (合格可能性 20%未満)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">総得点</label>
              <input
                type="number"
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">配点満点</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 900)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">反省点・次回への課題メモ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例: 数学微積分で計算ミス。英語は時間配分成功。"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              登録する
            </button>
          </div>
        </form>
      )}

      {/* Visual Chart: Deviation Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            総合偏差値の推移
          </h2>
          <span className="text-xs text-slate-500">
            目標ライン: 偏差値 {target.targetDeviation.toFixed(1)}
          </span>
        </div>

        {/* Deviation Trend Points */}
        {sortedMocks.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            まだ登録された模試成績がありません。上の「模試結果を登録」から全統模試や駿台模試などの結果を記録しましょう。
          </div>
        ) : (
          <div className="relative pt-6 pb-2 px-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[160px] flex items-center justify-around overflow-x-auto">
            {sortedMocks.map((mock) => {
              const dev = mock.overallDeviation;
              return (
                <div key={mock.id} className="flex flex-col items-center gap-2 z-10 min-w-[100px]">
                  <div className="bg-white border-2 border-indigo-600 text-indigo-700 font-mono tabular-nums font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                    {dev.toFixed(1)}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">{mock.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{mock.date}</p>
                  </div>
                  {getJudgmentBadge(mock.judgment)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mock Exam Details Cards */}
      <div className="space-y-3">
        {sortedMocks.map((mock) => (
          <div
            key={mock.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-base">{mock.name}</span>
                {getJudgmentBadge(mock.judgment)}
                <span className="text-xs font-mono text-slate-400">{mock.date}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                <span>
                  総合得点:{' '}
                  <strong className="text-slate-900 font-mono">
                    {mock.overallScore} / {mock.maxScore}点
                  </strong>
                </span>
                <span>·</span>
                <span>
                  偏差値:{' '}
                  <strong className="text-indigo-600 font-mono text-sm">
                    {mock.overallDeviation.toFixed(1)}
                  </strong>
                </span>
              </div>
              {mock.notes && (
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {mock.notes}
                </p>
              )}
            </div>

            <button
              onClick={() => onDeleteMockExam(mock.id)}
              className="self-end md:self-center p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
