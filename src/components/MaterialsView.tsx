import React, { useState } from 'react';
import { StudyMaterial, Subject } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  FolderPlus,
  CheckCircle,
  AlertCircle,
  Palette,
} from 'lucide-react';

interface MaterialsViewProps {
  materials: StudyMaterial[];
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onAddMaterial: (mat: Omit<StudyMaterial, 'id'>) => void;
  onUpdateMaterial: (mat: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
}

const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#64748B', // Slate
];

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  subjects,
  onAddSubject,
  onDeleteSubject,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  // New Subject form
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState(COLOR_PALETTE[0]);
  const [newSubWeight, setNewSubWeight] = useState(25);

  // New Material form
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatSubjectId, setNewMatSubjectId] = useState(subjects[0]?.id || '');
  const [newMatTotal, setNewMatTotal] = useState(200);
  const [newMatCurrent, setNewMatCurrent] = useState(0);
  const [newMatUnitType, setNewMatUnitType] = useState<StudyMaterial['unitType']>('問');
  const [newMatTargetLaps, setNewMatTargetLaps] = useState(3);
  const [newMatPriority, setNewMatPriority] = useState<StudyMaterial['priority']>('高');

  const filteredMaterials = materials.filter(
    (m) => filterSubject === 'all' || m.subjectId === filterSubject
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    onAddSubject({
      name: newSubName.trim(),
      color: newSubColor,
      idealWeight: Number(newSubWeight) || 20,
    });

    setNewSubName('');
    setIsAddingSubject(false);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;
    const subId = newMatSubjectId || subjects[0]?.id;
    if (!subId) {
      alert('先に科目を追加してください。');
      return;
    }

    onAddMaterial({
      title: newMatTitle.trim(),
      subjectId: subId,
      totalUnits: Number(newMatTotal) || 100,
      currentUnit: Number(newMatCurrent) || 0,
      unitType: newMatUnitType,
      currentLap: 1,
      targetLaps: Number(newMatTargetLaps) || 3,
      priority: newMatPriority,
    });

    setNewMatTitle('');
    setIsAddingMaterial(false);
  };

  const handleQuickAdvance = (mat: StudyMaterial, amount: number) => {
    const updatedUnit = Math.min(mat.totalUnits, mat.currentUnit + amount);
    let updatedLap = mat.currentLap;
    if (updatedUnit >= mat.totalUnits && mat.currentLap < mat.targetLaps) {
      updatedLap += 1;
    }
    onUpdateMaterial({
      ...mat,
      currentUnit: updatedUnit,
      currentLap: updatedLap,
    });
  };

  const handleLapAdvance = (mat: StudyMaterial) => {
    onUpdateMaterial({
      ...mat,
      currentLap: mat.currentLap + 1,
      currentUnit: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            科目・参考書マネージャー
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            あなたが学習する科目と参考書を一から登録し、進捗や周回数を管理します
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            科目を追加
          </button>
          <button
            onClick={() => {
              if (subjects.length === 0) {
                alert('先に科目を1つ以上登録してください。');
                setIsAddingSubject(true);
                return;
              }
              setIsAddingMaterial(!isAddingMaterial);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            参考書を追加
          </button>
        </div>
      </div>

      {/* 1. Subjects Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">登録済み科目一覧 ({subjects.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              学習時間を記録・集計するための科目です
            </p>
          </div>
          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            ＋科目を作成
          </button>
        </div>

        {/* Add Subject Inline Form */}
        {isAddingSubject && (
          <form
            onSubmit={handleCreateSubject}
            className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
          >
            <h3 className="font-bold text-slate-800">新しい科目の追加</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">科目名</label>
                <input
                  type="text"
                  placeholder="例: 数学、英語、物理、日本史..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">カラー</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewSubColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        newSubColor === c ? 'ring-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">志望校の目標配点比率 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newSubWeight}
                  onChange={(e) => setNewSubWeight(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                科目を登録
              </button>
            </div>
          </form>
        )}

        {/* Subjects Badges */}
        {subjects.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            登録されている科目がありません。上の「＋科目を作成」から学習したい科目を追加してください。
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                <span className="font-semibold text-slate-800">{sub.name}</span>
                {sub.idealWeight !== undefined && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({sub.idealWeight}%)
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteSubject(sub.id)}
                  className="text-slate-300 hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                  title="科目を削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Materials Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              登録参考書・問題集一覧 ({materials.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">教材ごとの周回数と進捗管理</p>
          </div>
          {subjects.length > 0 && (
            <button
              onClick={() => setIsAddingMaterial(!isAddingMaterial)}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              ＋参考書を登録
            </button>
          )}
        </div>

        {/* Add Material Form */}
        {isAddingMaterial && (
          <form
            onSubmit={handleCreateMaterial}
            className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
          >
            <h3 className="font-bold text-slate-800">新しい参考書・問題集の登録</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">参考書・問題集名</label>
                <input
                  type="text"
                  placeholder="例: 青チャート 数学Ⅱ+B、ターゲット1900、物理のエッセンス..."
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">対象科目</label>
                <select
                  value={newMatSubjectId || (subjects[0]?.id || '')}
                  onChange={(e) => setNewMatSubjectId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">総量 (全頁/全問)</label>
                <input
                  type="number"
                  min="1"
                  value={newMatTotal}
                  onChange={(e) => setNewMatTotal(Number(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">単位</label>
                <select
                  value={newMatUnitType}
                  onChange={(e) => setNewMatUnitType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                >
                  <option value="問">問</option>
                  <option value="ページ">ページ</option>
                  <option value="単語">単語</option>
                  <option value="章">章</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">目標周回数</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newMatTargetLaps}
                  onChange={(e) => setNewMatTargetLaps(Number(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">優先度</label>
                <select
                  value={newMatPriority}
                  onChange={(e) => setNewMatPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                >
                  <option value="高">高 (最優先)</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMaterial(false)}
                className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                参考書を登録
              </button>
            </div>
          </form>
        )}

        {/* Filter bar */}
        {subjects.length > 0 && materials.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setFilterSubject('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filterSubject === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              すべて ({materials.length})
            </button>
            {subjects.map((sub) => {
              const count = materials.filter((m) => m.subjectId === sub.id).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setFilterSubject(sub.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    filterSubject === sub.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Materials Grid */}
        {materials.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            登録されている参考書・教材はありません。<br />
            上の「＋参考書を追加」から手持ちの参考書を登録しましょう。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const sub = subjects.find((s) => s.id === mat.subjectId);
              const percent = Math.min(100, Math.round((mat.currentUnit / mat.totalUnits) * 100));
              const isFinished = mat.currentUnit >= mat.totalUnits;

              return (
                <div
                  key={mat.id}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${sub?.color || '#3B82F6'}15`,
                          color: sub?.color || '#3B82F6',
                        }}
                      >
                        {sub?.name || '科目'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {mat.currentLap}周目 / 全{mat.targetLaps}周
                        </span>
                        <button
                          onClick={() => onDeleteMaterial(mat.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">{mat.title}</h3>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-mono tabular-nums text-slate-600">
                          {mat.currentUnit} / {mat.totalUnits} {mat.unitType}
                        </span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickAdvance(mat, 5)}
                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium cursor-pointer"
                      >
                        +5{mat.unitType}
                      </button>
                      <button
                        onClick={() => handleQuickAdvance(mat, 20)}
                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium cursor-pointer"
                      >
                        +20{mat.unitType}
                      </button>
                    </div>

                    {isFinished && mat.currentLap < mat.targetLaps ? (
                      <button
                        onClick={() => handleLapAdvance(mat)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                      >
                        次周へ進む →
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        優先度: {mat.priority}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
