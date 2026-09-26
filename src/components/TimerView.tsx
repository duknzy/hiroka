import React, { useState, useEffect } from 'react';
import { Subject, StudyMaterial } from '../types';
import { ambientSound, AmbientSoundType } from '../utils/audioSynthesizer';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
  BookOpen,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface TimerViewProps {
  subjects: Subject[];
  materials: StudyMaterial[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedMaterialId: string;
  setSelectedMaterialId: (id: string) => void;
  unitNote: string;
  setUnitNote: (note: string) => void;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  mode: 'stopwatch' | 'pomodoro' | 'countdown';
  toggleTimer: () => void;
  resetTimer: () => void;
  changeMode: (newMode: 'stopwatch' | 'pomodoro' | 'countdown') => void;
  setCustomCountdown: (mins: number) => void;
  onFinishTimer: () => void;
  onAddMaterial?: (mat: Omit<StudyMaterial, 'id'>) => void;
  onOpenDashboard: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  subjects,
  materials,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedMaterialId,
  setSelectedMaterialId,
  unitNote,
  setUnitNote,
  seconds,
  isActive,
  isBreak,
  mode,
  toggleTimer,
  resetTimer,
  changeMode,
  setCustomCountdown,
  onFinishTimer,
  onAddMaterial,
  onOpenDashboard,
}) => {
  // Audio state
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inline add material state
  const [showInlineAddMat, setShowInlineAddMat] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatTotal, setNewMatTotal] = useState(150);
  const [newMatUnitType, setNewMatUnitType] = useState<StudyMaterial['unitType']>('問');

  const availableMaterials = materials.filter((m) => m.subjectId === selectedSubjectId);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentMaterial = materials.find((m) => m.id === selectedMaterialId);
  const themeColor = currentSubject?.color || '#6366F1';

  const handleSoundChange = (sound: AmbientSoundType) => {
    setCurrentSound(sound);
    ambientSound.play(sound);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

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

  // Circular progress calculations
  let progressRatio = 0;
  if (mode === 'stopwatch') {
    progressRatio = (seconds % 3600) / 3600;
  } else if (mode === 'pomodoro') {
    const total = isBreak ? 5 * 60 : 25 * 60;
    progressRatio = Math.max(0, Math.min(1, (total - seconds) / total));
  } else {
    // arbitrary standard 60 min loop if countdown
    progressRatio = Math.max(0, Math.min(1, seconds / (60 * 60)));
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div
      className={`min-h-[80vh] flex flex-col justify-between rounded-3xl transition-all duration-300 relative overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 text-white p-6 sm:p-12 flex flex-col justify-between'
          : 'bg-white/90 backdrop-blur-md border border-slate-200 p-6 sm:p-8 shadow-xs'
      }`}
    >
      {/* Ambient background glow according to selected subject */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Bar inside View */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              {currentSubject?.name || '科目未選択'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {currentMaterial ? currentMaterial.title : '自由演習 / 過去問'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: themeColor }} />
            {isBreak ? '☕ 休憩中 · リフレッシュ' : '極限集中フォーカスタイマー'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Info pill: free navigation */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            計測中も他の画面（TODOや計画など）へ自由に移動できます
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            title={isFullscreen ? '通常表示に戻す' : 'フルスクリーン集中モード'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Focus Area */}
      <div className="relative z-10 py-6 flex flex-col items-center">
        {subjects.length === 0 && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2 max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>科目が登録されていません。「科目・参考書」タブから科目を登録してください。</span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="flex flex-col items-center gap-2.5 mb-6">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => changeMode('stopwatch')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ストップウォッチ
            </button>
            <button
              onClick={() => changeMode('pomodoro')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ポモドーロ (25分)
            </button>
            <button
              onClick={() => changeMode('countdown')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'countdown'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              カウントダウン
            </button>
          </div>

          {/* Quick presets for countdown */}
          {mode === 'countdown' && (
            <div className="flex items-center gap-1.5 text-xs pt-1">
              <span className="text-slate-400 text-[11px]">本番目標:</span>
              {[
                { label: '30分', mins: 30 },
                { label: '45分', mins: 45 },
                { label: '60分', mins: 60 },
                { label: '80分 (共テ)', mins: 80 },
                { label: '90分', mins: 90 },
              ].map((p) => (
                <button
                  key={p.mins}
                  onClick={() => setCustomCountdown(p.mins)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Circular Progress & Huge Digital Clock */}
        <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
            {/* Background Ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-100 dark:text-slate-800"
              fill="none"
            />
            {/* Progress Arc */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={themeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
              fill="none"
              style={{
                filter: isActive ? `drop-shadow(0 0 10px ${themeColor}70)` : undefined,
              }}
            />
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <div
              className={`font-mono tabular-nums font-black tracking-tight transition-all ${
                isFullscreen ? 'text-7xl sm:text-8xl text-white' : 'text-6xl sm:text-7xl text-slate-900'
              }`}
              style={{
                textShadow: isActive ? `0 0 28px ${themeColor}30` : undefined,
              }}
            >
              {hrs > 0 && `${String(hrs).padStart(2, '0')}:`}
              {String(mins).padStart(2, '0')}
              <span className="text-4xl text-slate-400 font-normal">:</span>
              {String(secs).padStart(2, '0')}
            </div>

            <div className="flex items-center justify-center mt-3">
              <p className="text-xs font-semibold text-slate-400">
                {isBreak
                  ? '深呼吸をして脳を休めましょう'
                  : isActive
                  ? '集中モード稼働中 · スマホを視界から外す'
                  : '準備完了 · スタートボタンを押してください'}
              </p>
            </div>
          </div>
        </div>

        {/* Big Action Controls */}
        <div className="flex items-center justify-center gap-6 my-6">
          <button
            onClick={resetTimer}
            className="p-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            title="リセット"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={toggleTimer}
            className="p-6 rounded-full text-white shadow-2xl transition-all active:scale-95 cursor-pointer ring-8 hover:scale-105"
            style={{
              backgroundColor: isActive ? '#F59E0B' : themeColor,
              boxShadow: `0 10px 30px ${isActive ? '#F59E0B60' : themeColor + '60'}`,
            }}
          >
            {isActive ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onFinishTimer}
            disabled={seconds === 0}
            className="p-3.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="学習を終了して記録に保存"
          >
            <CheckCircle2 className="w-7 h-7" />
          </button>
        </div>

        {/* Subject & Book Selectors directly under the clock */}
        <div className="w-full max-w-xl bg-slate-50/90 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                学習科目
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedMaterialId('');
                }}
                className="w-full font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
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
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  参考書 / 教材
                </label>
                <button
                  type="button"
                  onClick={() => setShowInlineAddMat(!showInlineAddMat)}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  ＋ここから教材を追加
                </button>
              </div>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">(選択なし / 自由演習・過去問)</option>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.currentUnit}/{m.totalUnits} {m.unitType} · {m.currentLap}周目)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showInlineAddMat && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in duration-150">
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                参考書を即座に追加
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="参考書名"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-100"
                />
                <input
                  type="number"
                  placeholder="総量"
                  value={newMatTotal}
                  onChange={(e) => setNewMatTotal(Number(e.target.value) || 100)}
                  className="w-16 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 font-mono"
                />
                <select
                  value={newMatUnitType}
                  onChange={(e) => setNewMatUnitType(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1"
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
                  追加
                </button>
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="予定しているページや問題番号 (例: p.50〜p.62 例題8〜14)"
            value={unitNote}
            onChange={(e) => setUnitNote(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Bottom Audio Synthesizer Bar */}
      <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            集中BGM環境音:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'none', label: 'OFF' },
              { id: 'rain', label: '🌧️ 雨音' },
              { id: 'whitenoise', label: '📻 ホワイトノイズ' },
              { id: 'campfire', label: '🔥 焚き火' },
              { id: 'cafe', label: '☕ カフェ音' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleSoundChange(s.id as AmbientSoundType)}
                className={`px-2.5 py-1 text-xs rounded-xl transition-colors cursor-pointer ${
                  currentSound === s.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentSound !== 'none' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={onOpenDashboard}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer ml-auto"
          >
            ダッシュボードを見る
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
