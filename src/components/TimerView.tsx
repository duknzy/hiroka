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
  countdownInitialSec?: number;
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
  countdownInitialSec = 60 * 60,
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

  // Circular progress calculations - Expansive roomy dial (radius 160, diameter 320 in 360x360 box)
  let progressRatio = 0;
  if (mode === 'stopwatch') {
    // 1 hour per lap, advances smoothly clockwise (to the right)
    progressRatio = (seconds % 3600) / 3600;
  } else if (mode === 'pomodoro') {
    const total = isBreak ? 5 * 60 : 25 * 60;
    const elapsed = Math.max(0, total - seconds);
    progressRatio = Math.max(0, Math.min(1, elapsed / total));
  } else {
    // Countdown: advances clockwise (to the right) as study time progresses
    const total = countdownInitialSec || 60 * 60;
    const elapsed = Math.max(0, total - seconds);
    progressRatio = Math.max(0, Math.min(1, elapsed / total));
  }

  const radius = 160;
  const circumference = 2 * Math.PI * radius;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div
      className={`min-h-[82vh] flex flex-col justify-between rounded-3xl transition-all duration-300 relative overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070b14] text-white p-6 sm:p-12 flex flex-col justify-between'
          : 'bg-[#0d1322]/85 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/50'
      }`}
    >
      {/* Ambient background glow according to selected subject */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Bar inside View */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/10"
              style={{ backgroundColor: `${themeColor}25`, color: themeColor }}
            >
              {currentSubject?.name || '科目未選択'}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-medium text-slate-300">
              {currentMaterial ? currentMaterial.title : '自由演習 / 過去問'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: themeColor }} />
            {isBreak ? '☕ 休憩中 · リフレッシュ' : '極限集中フォーカスタイマー'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Info pill: free navigation */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            計測中も他の画面（TODOや計画など）へ自由に移動できます
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors"
            title={isFullscreen ? '通常表示に戻す' : 'フルスクリーン集中モード'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Focus Area */}
      <div className="relative z-10 py-4 sm:py-6 flex flex-col items-center">
        {subjects.length === 0 && (
          <div className="mb-6 p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center gap-2 max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>科目が登録されていません。「科目・参考書」タブから科目を登録してください。</span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="flex flex-col items-center gap-2.5 mb-5 sm:mb-6">
          <div className="inline-flex p-1 bg-slate-950/90 border border-white/10 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => changeMode('stopwatch')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ストップウォッチ
            </button>
            <button
              onClick={() => changeMode('pomodoro')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ポモドーロ (25分)
            </button>
            <button
              onClick={() => changeMode('countdown')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'countdown'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              カウントダウン
            </button>
          </div>

          {/* Quick presets for countdown */}
          {mode === 'countdown' && (
            <div className="flex items-center gap-1.5 text-xs pt-1 flex-wrap justify-center">
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
                  className="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expansive Circular Progress & Perfectly Scaled Digital Clock */}
        <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 360 360">
            {/* Background Ring */}
            <circle
              cx="180"
              cy="180"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-800/80"
              fill="none"
            />
            {/* Progress Arc: starts at 12 o'clock and fills clockwise (to the right) */}
            <circle
              cx="180"
              cy="180"
              r={radius}
              stroke={themeColor}
              strokeWidth="10"
              strokeDasharray={`${progressRatio * circumference} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
              fill="none"
              style={{
                filter: isActive ? `drop-shadow(0 0 14px ${themeColor})` : undefined,
              }}
            />
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-6">
            <div
              className={`font-mono tabular-nums font-black tracking-tight transition-all flex items-baseline justify-center text-white ${
                isFullscreen
                  ? hrs > 0
                    ? 'text-6xl sm:text-7xl md:text-8xl'
                    : 'text-7xl sm:text-8xl md:text-9xl'
                  : hrs > 0
                  ? 'text-4xl sm:text-5xl md:text-6xl'
                  : 'text-5xl sm:text-6xl md:text-7xl'
              }`}
              style={{
                textShadow: isActive ? `0 0 30px ${themeColor}` : '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {hrs > 0 && (
                <>
                  <span>{String(hrs).padStart(2, '0')}</span>
                  <span className="text-slate-600 font-light mx-0.5">:</span>
                </>
              )}
              <span>{String(mins).padStart(2, '0')}</span>
              <span className="text-slate-600 font-light mx-0.5">:</span>
              <span>{String(secs).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center justify-center mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm font-medium text-slate-400">
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
        <div className="flex items-center justify-center gap-6 my-5 sm:my-6">
          <button
            onClick={resetTimer}
            className="p-3.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-full transition-all cursor-pointer shadow-md"
            title="リセット"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={toggleTimer}
            className="p-6 rounded-full text-white shadow-2xl transition-all active:scale-95 cursor-pointer ring-8 ring-white/10 hover:ring-white/20 hover:scale-105"
            style={{
              backgroundColor: isActive ? '#F59E0B' : themeColor,
              boxShadow: `0 0 35px ${isActive ? '#F59E0B80' : themeColor + '80'}`,
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
            className="p-3.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed shadow-md"
            title="学習を終了して記録に保存"
          >
            <CheckCircle2 className="w-7 h-7" />
          </button>
        </div>

        {/* Subject & Book Selectors directly under the clock */}
        <div className="w-full max-w-xl bg-slate-950/80 p-4 rounded-2xl border border-white/10 text-xs space-y-3 shadow-xl shadow-black/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                学習科目
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedMaterialId('');
                }}
                className="w-full font-semibold bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  参考書 / 教材
                </label>
                <button
                  type="button"
                  onClick={() => setShowInlineAddMat(!showInlineAddMat)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  ＋ここから教材を追加
                </button>
              </div>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full font-semibold bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="" className="bg-slate-900 text-slate-400">(選択なし / 自由演習・過去問)</option>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.title} ({m.currentUnit}/{m.totalUnits} {m.unitType} · {m.currentLap}周目)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showInlineAddMat && (
            <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 space-y-2 animate-in fade-in duration-150">
              <span className="font-bold text-white block text-[11px]">
                参考書を即座に追加
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="参考書名"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-white placeholder-slate-500"
                />
                <input
                  type="number"
                  placeholder="総量"
                  value={newMatTotal}
                  onChange={(e) => setNewMatTotal(Number(e.target.value) || 100)}
                  className="w-16 bg-slate-950 border border-white/10 rounded-lg px-2 py-1 font-mono text-white"
                />
                <select
                  value={newMatUnitType}
                  onChange={(e) => setNewMatUnitType(e.target.value as any)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-white"
                >
                  <option value="問">問</option>
                  <option value="ページ">頁</option>
                  <option value="単語">単語</option>
                  <option value="章">章</option>
                </select>
                <button
                  type="button"
                  onClick={handleCreateInlineMaterial}
                  className="px-3 py-1 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 cursor-pointer shadow-xs transition-all"
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
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Bottom Audio Synthesizer Bar */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
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
                className={`px-2.5 py-1 text-xs rounded-xl transition-all cursor-pointer ${
                  currentSound === s.id
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40 border border-indigo-400/50'
                    : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentSound !== 'none' && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1.5 accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={onOpenDashboard}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer ml-auto transition-colors"
          >
            ダッシュボードを見る
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
