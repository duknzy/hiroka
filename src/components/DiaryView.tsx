import React, { useState } from 'react';
import { DiaryEntry } from '../types';
import { BookMarked, Calendar, ChevronLeft, ChevronRight, Sparkles, Smile, Trash2, CheckCircle2 } from 'lucide-react';

interface DiaryViewProps {
  diary: DiaryEntry[];
  onSaveDiary: (entry: Omit<DiaryEntry, 'id'>) => void;
  onDeleteDiary: (id: string) => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  diary,
  onSaveDiary,
  onDeleteDiary,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const currentEntry = diary.find((d) => d.date === selectedDate);
  const [goodPoints, setGoodPoints] = useState(currentEntry?.goodPoints || '');
  const [improvements, setImprovements] = useState(currentEntry?.improvements || '');
  const [tomorrowCommitment, setTomorrowCommitment] = useState(currentEntry?.tomorrowCommitment || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // When selected date changes, populate state
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const entry = diary.find((d) => d.date === newDate);
    setGoodPoints(entry?.goodPoints || '');
    setImprovements(entry?.improvements || '');
    setTomorrowCommitment(entry?.tomorrowCommitment || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDiary({
      date: selectedDate,
      goodPoints: goodPoints.trim(),
      improvements: improvements.trim(),
      tomorrowCommitment: tomorrowCommitment.trim(),
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const shiftDay = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    handleDateChange(cur.toISOString().split('T')[0]);
  };

  const sortedDiaryList = [...diary].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              GROWTH ARCHIVE
            </span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-400" />
            学習日誌・振り返りアーカイブ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            日々の「良かった点」「改善点」「明日への決意」を記録し、過去の合格軌跡をさかのぼって自己客観視します
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateChange(todayStr)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
            }`}
          >
            今日の日誌を書く
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Selected Date Reflection Form */}
        <div className="lg:col-span-7 bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
          {/* Date Selector Navigation */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="前日へ"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-baseline gap-2">
                <span className="font-mono tabular-nums font-bold text-lg text-white">
                  {selectedDate}
                </span>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    TODAY
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => shiftDay(1)}
                disabled={selectedDate === todayStr}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="翌日へ"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
              <label className="block font-bold text-emerald-400 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                良かった点・成長を感じたこと
              </label>
              <textarea
                rows={3}
                value={goodPoints}
                onChange={(e) => setGoodPoints(e.target.value)}
                placeholder="例: 数学の微積分を予定通り3時間解き切った。計算ミスを検算する習慣がついた。"
                className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20">
              <label className="block font-bold text-amber-400 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                改善すべき課題・反省点
              </label>
              <textarea
                rows={3}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="例: 昼食後に眠気で集中が途切れた。明日は15分仮眠を取ってから午後自習に入る。"
                className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-500/20">
              <label className="block font-bold text-indigo-300 mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                明日の絶対コミットメント（最優先事項）
              </label>
              <textarea
                rows={2}
                value={tomorrowCommitment}
                onChange={(e) => setTomorrowCommitment(e.target.value)}
                placeholder="例: 朝7時から英単語100語チェック＋物理の単振動2題を必ず完答する！"
                className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                {isSavedNotice && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                    クラウドと同期しました！
                  </>
                )}
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer ring-1 ring-white/15"
              >
                この日の日誌を保存
              </button>
            </div>
          </form>
        </div>

        {/* Right (5 cols): Past Reflections History Archive */}
        <div className="lg:col-span-5 bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              過去の振り返りログ ({sortedDiaryList.length}日分)
            </h2>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {sortedDiaryList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                まだ振り返り日誌が登録されていません。<br />
                左のフォームから日々の成長を記録しましょう。
              </div>
            ) : (
              sortedDiaryList.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleDateChange(entry.date)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedDate === entry.date
                      ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-900 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono tabular-nums font-bold text-xs text-white">
                      {entry.date}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDiary(entry.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded cursor-pointer transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {entry.goodPoints && (
                    <p className="text-[11px] text-slate-300 truncate mb-1">
                      <strong className="text-emerald-400">良:</strong> {entry.goodPoints}
                    </p>
                  )}
                  {entry.improvements && (
                    <p className="text-[11px] text-slate-300 truncate mb-1">
                      <strong className="text-amber-400">改:</strong> {entry.improvements}
                    </p>
                  )}
                  {entry.tomorrowCommitment && (
                    <p className="text-[11px] text-slate-200 font-medium truncate">
                      <strong className="text-indigo-400">決:</strong> {entry.tomorrowCommitment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
