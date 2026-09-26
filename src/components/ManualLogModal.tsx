import React, { useState } from 'react';
import { Subject, StudyMaterial, StudyLog } from '../types';
import { X, Plus, AlertCircle } from 'lucide-react';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  materials: StudyMaterial[];
  onSaveLog: (log: Omit<StudyLog, 'id' | 'timestamp'>) => void;
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  subjects,
  materials,
  onSaveLog,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [range, setRange] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  const availableMaterials = materials.filter((m) => m.subjectId === selectedSubjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    const mat = materials.find((m) => m.id === selectedMaterialId);

    onSaveLog({
      date,
      subjectId: selectedSubjectId || 'general',
      subjectName: subj?.name || '学習',
      materialId: mat?.id,
      materialTitle: mat?.title,
      durationMinutes: Number(durationMinutes) || 30,
      range: range.trim() || undefined,
      memo: memo.trim() || '自習演習を実施。',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">勉強時間の手動記録</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subjects.length === 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>先に「科目・参考書」タブから科目を登録してください。</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">実施日</label>
              <input
                type="date"
                value={date}
                max={todayStr}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">勉強時間 (分)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1200"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono tabular-nums"
                />
                <span className="text-slate-500 whitespace-nowrap">
                  ({(durationMinutes / 60).toFixed(1)}h)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">科目</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedMaterialId('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">参考書 / 教材</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">(自由演習 / 過去問 / 学校授業など)</option>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              学習範囲 / 問題番号
            </label>
            <input
              type="text"
              placeholder="例: p.54〜p.62 例題8〜14、過去問2024本試など"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">学習メモ</label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="間違えた箇所の原因や、次回解き直すポイントなど..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              記録を追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
