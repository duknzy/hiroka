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
} from 'lucide-react';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  materials: StudyMaterial[];
  onSaveLog: (log: Omit<StudyLog, 'id' | 'timestamp'>) => void;
}

type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  materials,
  onSaveLog,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [unitNote, setUnitNote] = useState<string>('');

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

  const timerRef = useRef<number | null>(null);

  // Update selected subject if subject list changes
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

    ambientSound.stop();
    setShowSavePrompt(false);
    onClose();
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentMaterial = materials.find((m) => m.id === selectedMaterialId);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${
        isFullscreen ? 'bg-slate-950 text-white' : 'bg-slate-900/60 backdrop-blur-sm'
      }`}
    >
      <div
        className={`w-full transition-all rounded-2xl overflow-hidden shadow-2xl ${
          isFullscreen
            ? 'max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 flex flex-col justify-between p-8'
            : 'max-w-xl bg-white border border-slate-200'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {isBreak ? '☕ 休憩タイム' : '集中タイマー計測'}
            </span>
            {currentSubject && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: `${currentSubject.color}20`, color: currentSubject.color }}
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

        {/* Content Body */}
        <div className="p-6">
          {subjects.length === 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>まだ科目が登録されていません。「科目・参考書」タブから科目を登録してください。</span>
            </div>
          )}

          {/* Mode Switcher */}
          {!isFullscreen && (
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
                <button
                  onClick={() => changeMode('stopwatch')}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    mode === 'stopwatch'
                      ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ストップウォッチ
                </button>
                <button
                  onClick={() => changeMode('pomodoro')}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    mode === 'pomodoro'
                      ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ポモドーロ (25分)
                </button>
                <button
                  onClick={() => changeMode('countdown')}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    mode === 'countdown'
                      ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  カウントダウン
                </button>
              </div>
            </div>
          )}

          {/* Subject & Book Selectors */}
          {!isFullscreen && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">学習科目</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedMaterialId('');
                  }}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">参考書 / 教材</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">(選択なし / 過去問・演習)</option>
                  {availableMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.currentLap}周目)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="実施予定のページや問題番号 (例: p.45〜52 例題12〜15)"
                  value={unitNote}
                  onChange={(e) => setUnitNote(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Time Display */}
          <div className="text-center py-6">
            {isFullscreen && (
              <div className="mb-4 text-sm text-slate-400">
                {currentSubject?.name || '自習'} · {currentMaterial ? currentMaterial.title : '演習'}
                {unitNote && ` (${unitNote})`}
              </div>
            )}

            <div
              className={`font-mono tabular-nums font-bold tracking-tight select-none ${
                isFullscreen ? 'text-7xl sm:text-9xl text-indigo-400' : 'text-6xl text-slate-900'
              }`}
            >
              {formatTime(seconds)}
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {isBreak
                ? '水分補給をして目を休めましょう'
                : mode === 'stopwatch'
                ? '自習時間計測中'
                : mode === 'pomodoro'
                ? '25分間の極限集中'
                : '目標時間までのカウントダウン'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 my-4">
            <button
              onClick={resetTimer}
              className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              title="リセット"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`p-5 rounded-full text-white shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-100 dark:ring-amber-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100 dark:ring-indigo-900/30'
              }`}
            >
              {isActive ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white translate-x-0.5" />}
            </button>

            <button
              onClick={handleManualFinish}
              disabled={seconds === 0}
              className="p-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="終了して記録を保存"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* Ambient Noise Selector */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                集中環境音 (オフライン合成)
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
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    currentSound === s.id
                      ? 'bg-indigo-600 text-white font-medium'
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

      {/* Save Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-3 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">お疲れ様でした！</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              <span className="font-mono tabular-nums font-bold text-slate-900 text-base">
                {completedMinutes}分
              </span>{' '}
              の学習が完了しました。記録を保存しましょう。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  科目 / 参考書
                </label>
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                  <span className="font-semibold text-indigo-600">
                    {currentSubject?.name || '自習'}
                  </span>
                  {currentMaterial && <span> · {currentMaterial.title}</span>}
                  {unitNote && <span className="text-slate-500"> ({unitNote})</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  学習メモ・気づき
                </label>
                <textarea
                  rows={3}
                  value={sessionMemo}
                  onChange={(e) => setSessionMemo(e.target.value)}
                  placeholder="解いた問題、つまずいた解法、次回へのメモなど..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSavePrompt(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  破棄
                </button>
                <button
                  type="button"
                  onClick={confirmSaveLog}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
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
