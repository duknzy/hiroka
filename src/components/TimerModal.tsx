import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyMaterial, StudyLog } from '../types';
import { ambientSound, AmbientSoundType } from '../utils/audioSynthesizer';
import {
  X,
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
} from 'lucide-react';

interface TimerModalProps {
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

type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';

export const TimerModal: React.FC<TimerModalProps> = ({
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

  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || ''
  );
  const [unitNote, setUnitNote] = useState<string>('');

  // Quick inline add material state
  const [showInlineAddMat, setShowInlineAddMat] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatTotal, setNewMatTotal] = useState(150);
  const [newMatUnitType, setNewMatUnitType] = useState<StudyMaterial['unitType']>('問');

  // Timer state
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [pomodoroTargetSec, setPomodoroTargetSec] = useState<number>(25 * 60);
  const [countdownInitialSec, setCountdownInitialSec] = useState<number>(60 * 60);

  // Audio state
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.5);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Complete modal state
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  const [completedMinutes, setCompletedMinutes] = useState<number>(0);
  const [sessionMemo, setSessionMemo] = useState<string>('');
  const [shouldUpdateMaterialProgress, setShouldUpdateMaterialProgress] = useState<boolean>(true);
  const [progressAdvancement, setProgressAdvancement] = useState<number>(10);

  const timerRef = useRef<number | null>(null);

  // Sync initial ids when opened from external links
  useEffect(() => {
    if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
    if (initialMaterialId) setSelectedMaterialId(initialMaterialId);
  }, [initialSubjectId, initialMaterialId]);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const availableMaterials = materials.filter((m) => m.subjectId === selectedSubjectId);

  useEffect(() => {
    if (availableMaterials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(availableMaterials[0].id);
    }
  }, [selectedSubjectId, availableMaterials]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, isBreak]);

  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const handleSoundChange = (sound: AmbientSoundType) => {
    setCurrentSound(sound);
    ambientSound.play(sound);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'stopwatch') {
      setSeconds(0);
    } else if (mode === 'pomodoro') {
      setSeconds(isBreak ? 5 * 60 : pomodoroTargetSec);
    } else {
      setSeconds(countdownInitialSec);
    }
  };

  const changeMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setIsBreak(false);
    if (newMode === 'stopwatch') {
      setSeconds(0);
    } else if (newMode === 'pomodoro') {
      setSeconds(25 * 60);
      setPomodoroTargetSec(25 * 60);
    } else {
      setSeconds(60 * 60);
      setCountdownInitialSec(60 * 60);
    }
  };

  const setCustomCountdown = (mins: number) => {
    setIsActive(false);
    setMode('countdown');
    setCountdownInitialSec(mins * 60);
    setSeconds(mins * 60);
  };

  const handleTimerFinish = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      if (!isBreak) {
        const studiedMins = Math.round(pomodoroTargetSec / 60);
        setCompletedMinutes(studiedMins);
        setShowSavePrompt(true);
        setIsBreak(true);
        setSeconds(5 * 60);
      } else {
        setIsBreak(false);
        setSeconds(pomodoroTargetSec);
      }
    } else if (mode === 'countdown') {
      const studiedMins = Math.round(countdownInitialSec / 60);
      setCompletedMinutes(studiedMins);
      setShowSavePrompt(true);
    }
  };

  const handleManualFinish = () => {
    setIsActive(false);
    let studiedMins = 0;
    if (mode === 'stopwatch') {
      studiedMins = Math.max(1, Math.round(seconds / 60));
    } else if (mode === 'pomodoro') {
      studiedMins = Math.max(1, Math.round((pomodoroTargetSec - seconds) / 60));
    } else {
      studiedMins = Math.max(1, Math.round((countdownInitialSec - seconds) / 60));
    }
    setCompletedMinutes(studiedMins);
    setShowSavePrompt(true);
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

  const confirmSaveLog = () => {
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    const mat = materials.find((m) => m.id === selectedMaterialId);
    const todayStr = new Date().toISOString().split('T')[0];

    onSaveLog({
      date: todayStr,
      subjectId: selectedSubjectId || 'general',
      subjectName: subj?.name || '自習',
      materialId: mat?.id,
      materialTitle: mat?.title,
      durationMinutes: completedMinutes,
      range: unitNote.trim() || undefined,
      memo: sessionMemo.trim() || '集中して学習を完了。',
    });

    // Optionally update material progress directly from log
    if (shouldUpdateMaterialProgress && mat && onUpdateMaterial && progressAdvancement > 0) {
      const newUnit = Math.min(mat.totalUnits, mat.currentUnit + progressAdvancement);
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

    ambientSound.stop();
    setShowSavePrompt(false);
    onClose();
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentMaterial = materials.find((m) => m.id === selectedMaterialId);
  const themeColor = currentSubject?.color || '#6366F1';

  // Circular progress calculations
  let progressRatio = 0;
  if (mode === 'stopwatch') {
    // 60-second cycle or smooth fill
    progressRatio = (seconds % 3600) / 3600;
  } else if (mode === 'pomodoro') {
    const total = isBreak ? 5 * 60 : pomodoroTargetSec;
    progressRatio = Math.max(0, Math.min(1, (total - seconds) / total));
  } else {
    progressRatio = Math.max(0, Math.min(1, (countdownInitialSec - seconds) / countdownInitialSec));
  }

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${
        isFullscreen ? 'bg-slate-950 text-white' : 'bg-slate-900/60 backdrop-blur-md'
      }`}
    >
      <div
        className={`w-full transition-all rounded-3xl overflow-hidden shadow-2xl relative ${
          isFullscreen
            ? 'max-w-4xl h-[92vh] bg-slate-900 border border-slate-800 flex flex-col justify-between p-8'
            : 'max-w-xl bg-white/95 backdrop-blur-xl border border-slate-200'
        }`}
      >
        {/* Glow ambient background behind clock */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: themeColor }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Flame className="w-4 h-4" style={{ color: themeColor }} />
              {isBreak ? '☕ 休憩タイム' : '集中フォーカスタイマー'}
            </span>
            {currentSubject && (
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
              >
                {currentSubject.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              title={isFullscreen ? '通常表示に戻す' : 'フルスクリーン集中モード'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                ambientSound.stop();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 relative z-10">
          {subjects.length === 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>科目が未登録です。「科目・参考書」タブから科目を追加してください。</span>
            </div>
          )}

          {/* Mode Switcher Pills */}
          {!isFullscreen && (
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => changeMode('stopwatch')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    mode === 'stopwatch'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ストップウォッチ
                </button>
                <button
                  onClick={() => changeMode('pomodoro')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    mode === 'pomodoro'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ポモドーロ (25分)
                </button>
                <button
                  onClick={() => changeMode('countdown')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    mode === 'countdown'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  カウントダウン
                </button>
              </div>

              {/* Countdown Quick Presets */}
              {mode === 'countdown' && (
                <div className="flex items-center gap-1.5 text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">目標設定:</span>
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
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        countdownInitialSec === p.mins * 60
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subject & Book Selectors */}
          {!isFullscreen && subjects.length > 0 && (
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 mb-5 text-xs space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">学習科目</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedMaterialId('');
                    }}
                    className="w-full font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
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
                      ＋ここから教材を追加
                    </button>
                  </div>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
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

              {/* Inline quick add material form */}
              {showInlineAddMat && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 animate-in fade-in duration-150">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    新しい参考書を即座に追加
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="参考書名 (例: 英文読解の透視図)"
                      value={newMatTitle}
                      onChange={(e) => setNewMatTitle(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                    />
                    <input
                      type="number"
                      placeholder="総量"
                      value={newMatTotal}
                      onChange={(e) => setNewMatTotal(Number(e.target.value) || 100)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono"
                    />
                    <select
                      value={newMatUnitType}
                      onChange={(e) => setNewMatUnitType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
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
                placeholder="実施予定のページや問題番号 (例: p.45〜52 例題12〜15)"
                value={unitNote}
                onChange={(e) => setUnitNote(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Aesthetic Circular Clock Display */}
          <div className="relative flex flex-col items-center justify-center my-3">
            <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                {/* Background Ring */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-800"
                  fill="none"
                />
                {/* Animated Progress Dial */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke={themeColor}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-linear"
                  fill="none"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 8px ${themeColor}60)` : undefined,
                  }}
                />
              </svg>

              {/* Center Digital Clock Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {isFullscreen && (
                  <div className="mb-2 text-sm text-slate-400 font-medium">
                    {currentSubject?.name || '自習'} · {currentMaterial ? currentMaterial.title : '演習'}
                    {unitNote && ` (${unitNote})`}
                  </div>
                )}

                <div
                  className={`font-mono tabular-nums font-extrabold tracking-tight select-none transition-all ${
                    isFullscreen ? 'text-7xl text-white' : 'text-5xl text-slate-900'
                  }`}
                  style={{
                    textShadow: isActive ? `0 0 24px ${themeColor}30` : undefined,
                  }}
                >
                  {hrs > 0 && `${String(hrs).padStart(2, '0')}:`}
                  {String(mins).padStart(2, '0')}
                  <span className="text-3xl text-slate-400 font-normal">:</span>
                  {String(secs).padStart(2, '0')}
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`w-2 h-2 rounded-full transition-opacity ${
                      isActive ? 'animate-ping opacity-75' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: themeColor }}
                  />
                  <p className="text-xs font-medium text-slate-400">
                    {isBreak
                      ? '休憩中 · 深呼吸'
                      : isActive
                      ? '極限集中中...'
                      : '準備完了 · スタートを押す'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls with modern elevated buttons */}
          <div className="flex items-center justify-center gap-5 my-3">
            <button
              onClick={resetTimer}
              className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
              title="リセット"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`p-5 rounded-full text-white shadow-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-600 ring-8 ring-amber-100 dark:ring-amber-900/30'
                  : 'hover:opacity-95 ring-8 ring-indigo-50 dark:ring-indigo-900/20'
              }`}
              style={{
                backgroundColor: isActive ? '#F59E0B' : themeColor,
              }}
            >
              {isActive ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={handleManualFinish}
              disabled={seconds === 0}
              className="p-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="終了して学習記録を保存"
            >
              <CheckCircle2 className="w-6 h-6" />
            </button>
          </div>

          {/* Ambient Noise Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                集中BGM・環境音 (オフライン合成音)
              </span>
              {currentSound !== 'none' && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-indigo-600 cursor-pointer"
                />
              )}
            </div>

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
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal Dialog with automatic material progress advance! */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-3 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">お疲れ様でした！</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              <span className="font-mono tabular-nums font-bold text-slate-900 text-base">
                {completedMinutes}分
              </span>{' '}
              の学習が完了しました。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  科目 / 参考書
                </label>
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                  <span className="font-bold text-indigo-600">
                    {currentSubject?.name || '自習'}
                  </span>
                  {currentMaterial && <span> · {currentMaterial.title}</span>}
                  {unitNote && <span className="text-slate-500"> ({unitNote})</span>}
                </div>
              </div>

              {/* Direct integration: Update material progress checkbox */}
              {currentMaterial && onUpdateMaterial && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-indigo-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shouldUpdateMaterialProgress}
                      onChange={(e) => setShouldUpdateMaterialProgress(e.target.checked)}
                      className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    「{currentMaterial.title}」の進捗も一緒に進める
                  </label>

                  {shouldUpdateMaterialProgress && (
                    <div className="flex items-center gap-2 text-xs pl-6">
                      <span className="text-slate-600">今回進んだ量:</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={progressAdvancement}
                        onChange={(e) => setProgressAdvancement(Number(e.target.value) || 0)}
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-center"
                      />
                      <span className="text-slate-500 font-semibold">{currentMaterial.unitType}</span>
                      <span className="text-slate-400 text-[11px]">
                        (現在: {currentMaterial.currentUnit} → 新: {currentMaterial.currentUnit + progressAdvancement})
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
                  onClick={() => setShowSavePrompt(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  破棄
                </button>
                <button
                  type="button"
                  onClick={confirmSaveLog}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
                >
                  学習記録に保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
