import React, { useState } from 'react';
import { MockExamRecord, TargetSchool } from '../types';
import { Award, Plus, Trash2, TrendingUp, Calendar, CheckCircle2, X } from 'lucide-react';

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
    const badges: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      A: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
      B: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
      C: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
      D: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
      E: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
    };
    const b = badges[judg] || badges.C;
    return (
      <span className={`px-2.5 py-0.5 rounded-lg font-bold text-xs border ${b.bg} ${b.text} ${b.border} shadow-sm ${b.glow} uppercase tracking-wider`}>
        {judg}判定
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PERFORMANCE ANALYTICS
            </span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            模試成績・志望校判定トラッカー
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            目標偏差値 <strong className="text-cyan-400 font-mono">{target.targetDeviation.toFixed(1)}</strong> ({target.name} {target.faculty}) に向けた偏差値推移と課題分析
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-600/25 transition-all cursor-pointer ring-1 ring-white/15"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'フォームを閉じる' : '模試結果を登録'}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1322]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/40 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              新規模試結果の入力
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">模試名</label>
              <input
                type="text"
                placeholder="例: 第2回 全統記述模試 / 駿台全国模試"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">受験日</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">総合偏差値</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="90"
                value={overallDeviation}
                onChange={(e) => setOverallDeviation(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">志望校判定</label>
              <select
                value={judgment}
                onChange={(e) => setJudgment(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="A">A判定 (合格可能性 80%以上)</option>
                <option value="B">B判定 (合格可能性 60%以上)</option>
                <option value="C">C判定 (合格可能性 40%〜60%)</option>
                <option value="D">D判定 (合格可能性 20%〜40%)</option>
                <option value="E">E判定 (合格可能性 20%未満)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">総得点</label>
              <input
                type="number"
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">配点満点</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 900)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">反省点・次回への課題メモ</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例: 数学微積分で計算ミス。英語は時間配分成功。"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              登録する
            </button>
          </div>
        </form>
      )}

      {/* Visual Chart: Deviation Trend */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            総合偏差値の推移
          </h2>
          <span className="text-xs text-slate-400">
            目標ライン: <strong className="text-cyan-400 font-mono">偏差値 {target.targetDeviation.toFixed(1)}</strong>
          </span>
        </div>

        {/* Deviation Trend Points */}
        {sortedMocks.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-white/10 text-xs text-slate-500">
            まだ登録された模試成績がありません。上の「模試結果を登録」から全統模試や駿台模試などの結果を記録しましょう。
          </div>
        ) : (
          <div className="relative pt-6 pb-4 px-4 bg-slate-900/60 rounded-xl border border-white/5 min-h-[170px] flex items-center justify-around overflow-x-auto">
            {sortedMocks.map((mock) => {
              const dev = mock.overallDeviation;
              const isTargetAchieved = dev >= target.targetDeviation;
              return (
                <div key={mock.id} className="flex flex-col items-center gap-2.5 z-10 min-w-[120px]">
                  <div className={`border font-mono tabular-nums font-bold text-xs px-3 py-1 rounded-full shadow-lg transition-all ${
                    isTargetAchieved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
                      : 'bg-indigo-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20'
                  }`}>
                    偏差値 {dev.toFixed(1)}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-200">{mock.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{mock.date}</p>
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
            className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl shadow-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="font-bold text-white text-base">{mock.name}</span>
                {getJudgmentBadge(mock.judgment)}
                <span className="text-xs font-mono text-slate-400">{mock.date}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span>
                  総合得点:{' '}
                  <strong className="text-white font-mono">
                    {mock.overallScore} / {mock.maxScore}点
                  </strong>
                </span>
                <span className="text-slate-600">·</span>
                <span>
                  偏差値:{' '}
                  <strong className="text-cyan-400 font-mono text-sm font-bold">
                    {mock.overallDeviation.toFixed(1)}
                  </strong>
                </span>
              </div>
              {mock.notes && (
                <p className="text-xs text-slate-300 mt-2 bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                  {mock.notes}
                </p>
              )}
            </div>

            <button
              onClick={() => onDeleteMockExam(mock.id)}
              className="self-end md:self-center p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
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
