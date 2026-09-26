import React, { useState } from 'react';
import { Subject, StudyMaterial, StudyLog } from '../types';
import { X, Plus, AlertCircle, BookOpen } from 'lucide-react';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  materials: StudyMaterial[];
  initialSubjectId?: string;
  initialMaterialId?: string;
  onSaveLog: (log: Omit<StudyLog, 'id' | 'timestamp'>) => void;
  onAddMaterial?: (mat: Omit<StudyMaterial, 'id'>) => void;
  onUpdateMaterial?: (mat: StudyMaterial) => void;
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  subjects,
  materials,
  initialSubjectId,
  initialMaterialId,
  onSaveLog,
  onAddMaterial,
  onUpdateMaterial,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [range, setRange] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // Quick inline add material
  const [showInlineAddMat, setShowInlineAddMat] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatTotal, setNewMatTotal] = useState(150);
  const [newMatUnitType, setNewMatUnitType] = useState<StudyMaterial['unitType']>('問');

  // Advance material progress
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);

  const availableMaterials = materials.filter((m) => m.subjectId === selectedSubjectId);

  const handleCreateInlineMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;
    if (onAddMaterial) {
      onAddMaterial({
        title: newMatTitle.trim(),
        subjectId: selectedSubjectId || subjects[0]?.id,
        totalUnits: Number(newMatTotal) || 100,
        currentUnit: 0,
        unitType: newMatUnitType,
        currentLap: 1,
        targetLaps: 3,
        priority: '高',
      });
    }
    setNewMatTitle('');
    setShowInlineAddMat(false);
  };

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

    if (advanceAmount > 0 && mat && onUpdateMaterial) {
      const newUnit = Math.min(mat.totalUnits, mat.currentUnit + advanceAmount);
      let newLap = mat.currentLap;
      if (newUnit >= mat.totalUnits && mat.currentLap < mat.targetLaps) {
        newLap += 1;
      }
      onUpdateMaterial({
        ...mat,
        currentUnit: newUnit,
        currentLap: newLap,
      });
    }

    onClose();
  };

  const selectedMatObj = materials.find((m) => m.id === selectedMaterialId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono tabular-nums"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">参考書 / 教材</label>
                <button
                  type="button"
                  onClick={() => setShowInlineAddMat(!showInlineAddMat)}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  ＋ここから新規登録
                </button>
              </div>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
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

          {/* Inline add material */}
          {showInlineAddMat && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 block text-[11px]">
                参考書を新しく登録
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="参考書名"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                />
                <input
                  type="number"
                  placeholder="総量"
                  value={newMatTotal}
                  onChange={(e) => setNewMatTotal(Number(e.target.value) || 100)}
                  className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono"
                />
                <select
                  value={newMatUnitType}
                  onChange={(e) => setNewMatUnitType(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                >
                  <option value="問">問</option>
                  <option value="ページ">頁</option>
                  <option value="単語">単語</option>
                  <option value="章">章</option>
                </select>
                <button
                  type="button"
                  onClick={handleCreateInlineMaterial}
                  className="px-3 py-1 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  登録
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              学習範囲 / 問題番号
            </label>
            <input
              type="text"
              placeholder="例: p.54〜p.62 例題8〜14、過去問2024本試など"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick advancement of material progress */}
          {selectedMatObj && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-700">
                この教材の進捗も進める ({selectedMatObj.currentUnit}/{selectedMatObj.totalUnits} {selectedMatObj.unitType}):
              </span>
              <div className="flex items-center gap-1.5">
                {[0, 5, 10, 20].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAdvanceAmount(amt)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] cursor-pointer transition-colors ${
                      advanceAmount === amt
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {amt === 0 ? '進めない' : `+${amt}${selectedMatObj.unitType}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">学習メモ</label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="間違えた箇所の原因や、次回解き直すポイントなど..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              記録を追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
