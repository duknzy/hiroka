import React, { useState } from 'react';
import { Subject, StudyMaterial, StudyLog } from '../types';
import { CheckCircle2, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="text-lg font-bold">お疲れ様でした！</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 my-4">
          <span className="font-mono tabular-nums font-extrabold text-slate-900 text-lg">
            {completedMinutes}分
          </span>{' '}
          の学習が完了しました。記録を保存しましょう。
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              科目 / 参考書
            </label>
            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
              <span className="font-bold text-indigo-600">{subject?.name || '自習'}</span>
              {material && <span> · {material.title}</span>}
              {unitNote && <span className="text-slate-500"> ({unitNote})</span>}
            </div>
          </div>

          {material && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldUpdateMaterialProgress}
                  onChange={(e) => setShouldUpdateMaterialProgress(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                「{material.title}」の進捗も一緒に進める
              </label>

              {shouldUpdateMaterialProgress && (
                <div className="flex items-center gap-2 text-xs pl-6">
                  <span className="text-slate-600">今回進んだ量:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={progressAdvancement}
                    onChange={(e) => setProgressAdvancement(Number(e.target.value) || 0)}
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-center"
                  />
                  <span className="text-slate-500 font-semibold">{material.unitType}</span>
                  <span className="text-slate-400 text-[11px]">
                    (現在: {material.currentUnit} → 新: {material.currentUnit + progressAdvancement})
                  </span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              学習メモ・解法ポイント
            </label>
            <textarea
              rows={3}
              value={sessionMemo}
              onChange={(e) => setSessionMemo(e.target.value)}
              placeholder="間違えた箇所の原因や、次回解き直すポイントなど..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              破棄
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
            >
              学習記録に保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
