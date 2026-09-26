import React, { useState } from 'react';
import { Subject, StudyMaterial, StudyLog } from '../types';
import { CheckCircle2, X, Sparkles, BookOpen } from 'lucide-react';

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedMinutes: number;
  subject?: Subject;
  material?: StudyMaterial;
  unitNote?: string;
  onConfirmSave: (log: Omit<StudyLog, 'id' | 'timestamp'>, advanceAmount: number) => void;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({
  isOpen,
  onClose,
  completedMinutes,
  subject,
  material,
  unitNote,
  onConfirmSave,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [sessionMemo, setSessionMemo] = useState<string>('');
  const [shouldUpdateMaterialProgress, setShouldUpdateMaterialProgress] = useState<boolean>(true);
  const [progressAdvancement, setProgressAdvancement] = useState<number>(10);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave(
      {
        date: todayStr,
        subjectId: subject?.id || 'general',
        subjectName: subject?.name || '自習',
        materialId: material?.id,
        materialTitle: material?.title,
        durationMinutes: completedMinutes,
        range: unitNote?.trim() || undefined,
        memo: sessionMemo.trim() || '集中して学習を完了。',
      },
      shouldUpdateMaterialProgress && material ? progressAdvancement : 0
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1322] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 shadow-sm shadow-emerald-400" />
            <h3 className="text-lg font-bold text-white">学習セッション達成！</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-900 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">完了した集中時間</span>
            <span className="font-mono tabular-nums font-black text-white text-3xl">
              {completedMinutes}
              <span className="text-sm font-normal text-slate-400 ml-1">分</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              科目 / 参考書
            </label>
            <div className="text-xs bg-slate-900 p-3 rounded-xl border border-white/10 text-slate-200">
              <span className="font-bold text-cyan-400">{subject?.name || '自習'}</span>
              {material && <span> · {material.title}</span>}
              {unitNote && <span className="text-slate-400"> ({unitNote})</span>}
            </div>
          </div>

          {material && (
            <div className="p-3.5 bg-slate-900/80 border border-indigo-500/30 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldUpdateMaterialProgress}
                  onChange={(e) => setShouldUpdateMaterialProgress(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
                「{material.title}」の進捗も一緒に進める
              </label>

              {shouldUpdateMaterialProgress && (
                <div className="flex items-center gap-2 text-xs pl-6 flex-wrap">
                  <span className="text-slate-400">今回進んだ量:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={progressAdvancement}
                    onChange={(e) => setProgressAdvancement(Number(e.target.value) || 0)}
                    className="w-16 bg-slate-950 border border-white/10 rounded-lg px-2 py-1 font-mono text-center text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-slate-300 font-semibold">{material.unitType}</span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    (新: {material.currentUnit + progressAdvancement}/{material.totalUnits})
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              学習メモ・解法ポイント
            </label>
            <textarea
              rows={3}
              value={sessionMemo}
              onChange={(e) => setSessionMemo(e.target.value)}
              placeholder="間違えた箇所の原因や、次回解き直すポイントなど..."
              className="w-full text-xs p-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              破棄
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-emerald-600/25 cursor-pointer ring-1 ring-white/15"
            >
              学習記録に保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
