import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import {
  saveUserProfile,
  saveSubjectDoc,
  deleteSubjectDoc,
  saveMaterialDoc,
  deleteMaterialDoc,
  saveLogDoc,
  deleteLogDoc,
  saveDiaryDoc,
  deleteDiaryDoc,
  saveTodoDoc,
  deleteTodoDoc,
  saveScheduleDoc,
  deleteScheduleDoc,
  saveMockExamDoc,
  deleteMockExamDoc,
  logoutUser,
  loginAsGuest,
  getLocalFallbackData,
  saveLocalFallbackData,
  DEFAULT_EMPTY_TARGET,
  DEFAULT_EMPTY_PLAN,
} from './firebase/service';
import {
  ActiveTab,
  Subject,
  StudyLog,
  StudyMaterial,
  TargetSchool,
  StudyPlan,
  ScheduleItem,
  TodoTask,
  MockExamRecord,
  DiaryEntry,
} from './types';
import {
  WallpaperSettings,
  loadWallpaperSettings,
  saveWallpaperSettings,
  clearWallpaperSettings,
  DEFAULT_WALLPAPER_SETTINGS,
} from './utils/wallpaperStorage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TimerView } from './components/TimerView';
import { ActiveTimerDock } from './components/ActiveTimerDock';
import { SaveSessionModal } from './components/SaveSessionModal';
import { PlanView } from './components/PlanView';
import { ScheduleView } from './components/ScheduleView';
import { MaterialsView } from './components/MaterialsView';
import { DiaryView } from './components/DiaryView';
import { MockExamsView } from './components/MockExamsView';
import { ManualLogModal } from './components/ManualLogModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { WallpaperModal } from './components/WallpaperModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App data state
  const [target, setTarget] = useState<TargetSchool>(() => {
    const fb = getLocalFallbackData();
    return fb.target || DEFAULT_EMPTY_TARGET;
  });
  const [plan, setPlan] = useState<StudyPlan>(() => {
    const fb = getLocalFallbackData();
    return fb.plan || DEFAULT_EMPTY_PLAN;
  });
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const fb = getLocalFallbackData();
    return fb.subjects || [];
  });
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    const fb = getLocalFallbackData();
    return fb.materials || [];
  });
  const [logs, setLogs] = useState<StudyLog[]>(() => {
    const fb = getLocalFallbackData();
    return fb.logs || [];
  });
  const [diary, setDiary] = useState<DiaryEntry[]>(() => {
    const fb = getLocalFallbackData();
    return fb.diary || [];
  });
  const [todos, setTodos] = useState<TodoTask[]>(() => {
    const fb = getLocalFallbackData();
    return fb.todos || [];
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const fb = getLocalFallbackData();
    return fb.schedule || [];
  });
  const [mockExams, setMockExams] = useState<MockExamRecord[]>(() => {
    const fb = getLocalFallbackData();
    return fb.mockExams || [];
  });

  // Wallpaper settings
  const [wallpaperSettings, setWallpaperSettings] = useState<WallpaperSettings>(() =>
    loadWallpaperSettings()
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals
  const [isManualLogOpen, setIsManualLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);

  // Global Continuous Timer State (persists across all tabs!)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerBreak, setIsTimerBreak] = useState(false);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro' | 'countdown'>('stopwatch');
  const [pomodoroTargetSec, setPomodoroTargetSec] = useState(25 * 60);
  const [countdownInitialSec, setCountdownInitialSec] = useState(60 * 60);

  const [timerSubjectId, setTimerSubjectId] = useState<string>('');
  const [timerMaterialId, setTimerMaterialId] = useState<string>('');
  const [timerUnitNote, setTimerUnitNote] = useState<string>('');

  const timerIntervalRef = useRef<number | null>(null);

  // Auto pick first subject if not selected
  useEffect(() => {
    if (!timerSubjectId && subjects.length > 0) {
      setTimerSubjectId(subjects[0].id);
    }
  }, [subjects, timerSubjectId]);

  // Global continuous timer interval
  useEffect(() => {
    if (isTimerActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              handleTimerAutoFinish();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive, timerMode, isTimerBreak]);

  const handleTimerAutoFinish = () => {
    setIsTimerActive(false);
    if (timerMode === 'pomodoro') {
      if (!isTimerBreak) {
        const studiedMins = Math.round(pomodoroTargetSec / 60);
        setCompletedMinutes(studiedMins);
        setIsSavePromptOpen(true);
        setIsTimerBreak(true);
        setTimerSeconds(5 * 60);
      } else {
        setIsTimerBreak(false);
        setTimerSeconds(pomodoroTargetSec);
      }
    } else {
      const studiedMins = Math.round(countdownInitialSec / 60);
      setCompletedMinutes(studiedMins);
      setIsSavePromptOpen(true);
    }
  };

  const handleManualTimerFinish = () => {
    setIsTimerActive(false);
    let studiedMins = 0;
    if (timerMode === 'stopwatch') {
      studiedMins = Math.max(1, Math.round(timerSeconds / 60));
    } else if (timerMode === 'pomodoro') {
      studiedMins = Math.max(1, Math.round((pomodoroTargetSec - timerSeconds) / 60));
    } else {
      studiedMins = Math.max(1, Math.round((countdownInitialSec - timerSeconds) / 60));
    }
    setCompletedMinutes(studiedMins);
    setIsSavePromptOpen(true);
  };

  const handleToggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    if (timerMode === 'stopwatch') {
      setTimerSeconds(0);
    } else if (timerMode === 'pomodoro') {
      setTimerSeconds(isTimerBreak ? 5 * 60 : pomodoroTargetSec);
    } else {
      setTimerSeconds(countdownInitialSec);
    }
  };

  const handleChangeTimerMode = (newMode: 'stopwatch' | 'pomodoro' | 'countdown') => {
    setIsTimerActive(false);
    setTimerMode(newMode);
    setIsTimerBreak(false);
    if (newMode === 'stopwatch') {
      setTimerSeconds(0);
    } else if (newMode === 'pomodoro') {
      setTimerSeconds(25 * 60);
      setPomodoroTargetSec(25 * 60);
    } else {
      setTimerSeconds(60 * 60);
      setCountdownInitialSec(60 * 60);
    }
  };

  const handleSetCustomCountdown = (mins: number) => {
    setIsTimerActive(false);
    setTimerMode('countdown');
    setCountdownInitialSec(mins * 60);
    setTimerSeconds(mins * 60);
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        try {
          await loginAsGuest();
        } catch (e) {
          setUser(null);
          setAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore listeners
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.target) setTarget(data.target);
          if (data.plan) setPlan(data.plan);
        }
      },
      () => {}
    );

    const subjectsRef = collection(db, 'users', uid, 'subjects');
    const unsubSubjects = onSnapshot(
      subjectsRef,
      (snap) => {
        const items: Subject[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setSubjects(items);
        saveLocalFallbackData('subjects', items);
      },
      () => {}
    );

    const materialsRef = collection(db, 'users', uid, 'materials');
    const unsubMaterials = onSnapshot(
      materialsRef,
      (snap) => {
        const items: StudyMaterial[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setMaterials(items);
        saveLocalFallbackData('materials', items);
      },
      () => {}
    );

    const logsRef = collection(db, 'users', uid, 'logs');
    const logsQuery = query(logsRef, orderBy('timestamp', 'desc'));
    const unsubLogs = onSnapshot(
      logsQuery,
      (snap) => {
        const items: StudyLog[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setLogs(items);
        saveLocalFallbackData('logs', items);
      },
      () => {}
    );

    const diaryRef = collection(db, 'users', uid, 'diary');
    const unsubDiary = onSnapshot(
      diaryRef,
      (snap) => {
        const items: DiaryEntry[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setDiary(items);
        saveLocalFallbackData('diary', items);
      },
      () => {}
    );

    const todosRef = collection(db, 'users', uid, 'todos');
    const unsubTodos = onSnapshot(
      todosRef,
      (snap) => {
        const items: TodoTask[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setTodos(items);
        saveLocalFallbackData('todos', items);
      },
      () => {}
    );

    const scheduleRef = collection(db, 'users', uid, 'schedule');
    const unsubSchedule = onSnapshot(
      scheduleRef,
      (snap) => {
        const items: ScheduleItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setSchedule(items);
        saveLocalFallbackData('schedule', items);
      },
      () => {}
    );

    const mockRef = collection(db, 'users', uid, 'mockExams');
    const unsubMock = onSnapshot(
      mockRef,
      (snap) => {
        const items: MockExamRecord[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        setMockExams(items);
        saveLocalFallbackData('mockExams', items);
      },
      () => {}
    );

    return () => {
      unsubUser();
      unsubSubjects();
      unsubMaterials();
      unsubLogs();
      unsubDiary();
      unsubTodos();
      unsubSchedule();
      unsubMock();
    };
  }, [user]);

  const effectiveUid = user?.uid || 'local_session';

  // CRUD Actions
  const handleSaveLog = async (logData: Omit<StudyLog, 'id' | 'timestamp'>) => {
    const id = `log_${Date.now()}`;
    const newLog: StudyLog = {
      ...logData,
      id,
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev]);
    await saveLogDoc(effectiveUid, newLog);
  };

  const handleConfirmSaveSession = async (
    logData: Omit<StudyLog, 'id' | 'timestamp'>,
    advanceAmount: number
  ) => {
    await handleSaveLog(logData);

    // Update material progress if requested
    if (advanceAmount > 0 && logData.materialId) {
      const mat = materials.find((m) => m.id === logData.materialId);
      if (mat) {
        const newUnit = Math.min(mat.totalUnits, mat.currentUnit + advanceAmount);
        let newLap = mat.currentLap;
        if (newUnit >= mat.totalUnits && mat.currentLap < mat.targetLaps) {
          newLap += 1;
        }
        await handleUpdateMaterial({
          ...mat,
          currentUnit: newUnit,
          currentLap: newLap,
        });
      }
    }

    // Reset timer
    setTimerSeconds(0);
    setIsTimerActive(false);
  };

  const handleDeleteLog = async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    await deleteLogDoc(effectiveUid, id);
  };

  const handleUpdateTarget = async (newTarget: TargetSchool) => {
    setTarget(newTarget);
    await saveUserProfile(effectiveUid, newTarget, plan);
  };

  const handleUpdatePlan = async (newPlan: StudyPlan) => {
    setPlan(newPlan);
    await saveUserProfile(effectiveUid, target, newPlan);
  };

  const handleAddSubject = async (sub: Omit<Subject, 'id'>) => {
    const id = `sub_${Date.now()}`;
    const newSub: Subject = { ...sub, id };
    setSubjects((prev) => [...prev, newSub]);
    await saveSubjectDoc(effectiveUid, newSub);
  };

  const handleDeleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await deleteSubjectDoc(effectiveUid, id);
  };

  const handleAddMaterial = async (mat: Omit<StudyMaterial, 'id'>) => {
    const id = `mat_${Date.now()}`;
    const newMat: StudyMaterial = { ...mat, id };
    setMaterials((prev) => [...prev, newMat]);
    await saveMaterialDoc(effectiveUid, newMat);
  };

  const handleUpdateMaterial = async (mat: StudyMaterial) => {
    setMaterials((prev) => prev.map((m) => (m.id === mat.id ? mat : m)));
    await saveMaterialDoc(effectiveUid, mat);
  };

  const handleDeleteMaterial = async (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    await deleteMaterialDoc(effectiveUid, id);
  };

  const handleAddTodo = async (task: Omit<TodoTask, 'id'>) => {
    const id = `todo_${Date.now()}`;
    const newTodo: TodoTask = { ...task, id };
    setTodos((prev) => [...prev, newTodo]);
    await saveTodoDoc(effectiveUid, newTodo);
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteTodoDoc(effectiveUid, id);
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = { ...todo, completed: !todo.completed };
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await saveTodoDoc(effectiveUid, updated);
  };

  const handleAddScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    const id = `sch_${Date.now()}`;
    const newItem: ScheduleItem = { ...item, id };
    setSchedule((prev) => [...prev, newItem]);
    await saveScheduleDoc(effectiveUid, newItem);
  };

  const handleDeleteScheduleItem = async (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    await deleteScheduleDoc(effectiveUid, id);
  };

  const handleToggleScheduleItem = async (id: string) => {
    const item = schedule.find((s) => s.id === id);
    if (!item) return;
    const updated = { ...item, isCompleted: !item.isCompleted };
    setSchedule((prev) => prev.map((s) => (s.id === id ? updated : s)));
    await saveScheduleDoc(effectiveUid, updated);
  };

  const handleSaveDiary = async (entry: Omit<DiaryEntry, 'id'>) => {
    const existing = diary.find((d) => d.date === entry.date);
    const id = existing?.id || `diary_${entry.date}`;
    const newEntry: DiaryEntry = { ...entry, id };
    setDiary((prev) => {
      const idx = prev.findIndex((d) => d.date === entry.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newEntry;
        return copy;
      }
      return [newEntry, ...prev];
    });
    await saveDiaryDoc(effectiveUid, newEntry);
  };

  const handleDeleteDiary = async (id: string) => {
    setDiary((prev) => prev.filter((d) => d.id !== id));
    await deleteDiaryDoc(effectiveUid, id);
  };

  const handleAddMockExam = async (record: Omit<MockExamRecord, 'id'>) => {
    const id = `mock_${Date.now()}`;
    const newMock: MockExamRecord = { ...record, id };
    setMockExams((prev) => [newMock, ...prev]);
    await saveMockExamDoc(effectiveUid, newMock);
  };

  const handleDeleteMockExam = async (id: string) => {
    setMockExams((prev) => prev.filter((m) => m.id !== id));
    await deleteMockExamDoc(effectiveUid, id);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // Launch contextual timer from material or recent log
  const handleStartTimerForMaterial = (subjectId: string, materialId: string) => {
    setTimerSubjectId(subjectId);
    setTimerMaterialId(materialId);
    setActiveTab('timer');
    // If not active, start right away for maximum responsiveness
    if (!isTimerActive) {
      setIsTimerActive(true);
    }
  };

  // Launch manual log modal for material
  const handleManualLogForMaterial = (subjectId: string, materialId: string) => {
    setTimerSubjectId(subjectId);
    setTimerMaterialId(materialId);
    setIsManualLogOpen(true);
  };

  // Wallpaper Handlers
  const handleUpdateWallpaper = (newSettings: WallpaperSettings) => {
    setWallpaperSettings(newSettings);
    saveWallpaperSettings(newSettings);
  };

  const handleClearWallpaper = () => {
    const cleared = { ...DEFAULT_WALLPAPER_SETTINGS, imageUrl: null };
    setWallpaperSettings(cleared);
    clearWallpaperSettings();
  };

  // Calculate streak
  const uniqueDates = Array.from(new Set(logs.map((l) => l.date)));
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let streakDays = 0;
  if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
    let check = new Date();
    if (!uniqueDates.includes(todayStr)) check.setDate(check.getDate() - 1);
    while (uniqueDates.includes(check.toISOString().split('T')[0])) {
      streakDays++;
      check.setDate(check.getDate() - 1);
    }
  }

  const activeSubjectObj = subjects.find((s) => s.id === timerSubjectId);
  const activeMaterialObj = materials.find((m) => m.id === timerMaterialId);

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-slate-50 transition-colors">
      {/* Custom Wallpaper Background Layer (Local storage) */}
      {wallpaperSettings.imageUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{
              backgroundImage: `url(${wallpaperSettings.imageUrl})`,
              opacity: wallpaperSettings.opacity,
              filter: `blur(${wallpaperSettings.blur}px)`,
              transform: 'scale(1.05)',
            }}
          />
          <div
            className={`absolute inset-0 ${
              wallpaperSettings.overlay === 'dark' ? 'bg-slate-950/25' : 'bg-white/20'
            }`}
          />
        </div>
      )}

      {/* Main App Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          target={target}
          streakDays={streakDays}
          user={user}
          hasCustomWallpaper={!!wallpaperSettings.imageUrl}
          isTimerActive={isTimerActive}
          timerSeconds={timerSeconds}
          onOpenTimerTab={() => setActiveTab('timer')}
          onOpenManualLog={() => setIsManualLogOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWallpaper={() => setIsWallpaperOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              subjects={subjects}
              materials={materials}
              logs={logs}
              target={target}
              plan={plan}
              todos={todos}
              schedule={schedule}
              diary={diary}
              onOpenTimer={() => setActiveTab('timer')}
              onOpenManualLog={() => setIsManualLogOpen(true)}
              onOpenPlan={() => setActiveTab('plan')}
              onOpenDiaryTab={() => setActiveTab('diary')}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenMaterialsTab={() => setActiveTab('materials')}
              onStartTimerForMaterial={handleStartTimerForMaterial}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteLog={handleDeleteLog}
              onSaveDiary={handleSaveDiary}
            />
          )}

          {activeTab === 'timer' && (
            <TimerView
              subjects={subjects}
              materials={materials}
              selectedSubjectId={timerSubjectId}
              setSelectedSubjectId={setTimerSubjectId}
              selectedMaterialId={timerMaterialId}
              setSelectedMaterialId={setTimerMaterialId}
              unitNote={timerUnitNote}
              setUnitNote={setTimerUnitNote}
              seconds={timerSeconds}
              isActive={isTimerActive}
              isBreak={isTimerBreak}
              mode={timerMode}
              toggleTimer={handleToggleTimer}
              resetTimer={handleResetTimer}
              changeMode={handleChangeTimerMode}
              setCustomCountdown={handleSetCustomCountdown}
              onFinishTimer={handleManualTimerFinish}
              onAddMaterial={handleAddMaterial}
              onOpenDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'plan' && (
            <PlanView
              target={target}
              plan={plan}
              subjects={subjects}
              logs={logs}
              onUpdatePlan={handleUpdatePlan}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              schedule={schedule}
              todos={todos}
              subjects={subjects}
              target={target}
              onAddScheduleItem={handleAddScheduleItem}
              onDeleteScheduleItem={handleDeleteScheduleItem}
              onToggleScheduleItem={handleToggleScheduleItem}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onToggleTodo={handleToggleTodo}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsView
              materials={materials}
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onStartTimerForMaterial={handleStartTimerForMaterial}
              onManualLogForMaterial={handleManualLogForMaterial}
            />
          )}

          {activeTab === 'diary' && (
            <DiaryView
              diary={diary}
              onSaveDiary={handleSaveDiary}
              onDeleteDiary={handleDeleteDiary}
            />
          )}

          {activeTab === 'mock-exams' && (
            <MockExamsView
              mockExams={mockExams}
              target={target}
              onAddMockExam={handleAddMockExam}
              onDeleteMockExam={handleDeleteMockExam}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">PassRoute</span>
              <span>·</span>
              <span>大学受験 学習計画＆学習時間マネージャー</span>
            </div>
            <div className="text-slate-400">
              「志望校への最も確実な近道は、日々の1問を正確に解き切ること」
            </div>
          </div>
        </footer>
      </div>

      {/* Persistent Active Timer Dock: Appears on any tab other than 'timer' when running or paused */}
      {activeTab !== 'timer' && (isTimerActive || timerSeconds > 0) && (
        <ActiveTimerDock
          seconds={timerSeconds}
          isActive={isTimerActive}
          subject={activeSubjectObj}
          material={activeMaterialObj}
          unitNote={timerUnitNote}
          onToggleTimer={handleToggleTimer}
          onFinishTimer={handleManualTimerFinish}
          onExpandToTimerTab={() => setActiveTab('timer')}
        />
      )}

      {/* Save Session Modal (Completion prompt) */}
      <SaveSessionModal
        isOpen={isSavePromptOpen}
        onClose={() => setIsSavePromptOpen(false)}
        completedMinutes={completedMinutes}
        subject={activeSubjectObj}
        material={activeMaterialObj}
        unitNote={timerUnitNote}
        onConfirmSave={handleConfirmSaveSession}
      />

      {/* Manual Study Log Modal */}
      <ManualLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        subjects={subjects}
        materials={materials}
        initialSubjectId={timerSubjectId}
        initialMaterialId={timerMaterialId}
        onSaveLog={handleSaveLog}
        onAddMaterial={handleAddMaterial}
        onUpdateMaterial={handleUpdateMaterial}
      />

      {/* Target Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        target={target}
        subjects={subjects}
        user={user}
        onUpdateTarget={handleUpdateTarget}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Wallpaper Customizer Modal */}
      <WallpaperModal
        isOpen={isWallpaperOpen}
        onClose={() => setIsWallpaperOpen(false)}
        settings={wallpaperSettings}
        onUpdateSettings={handleUpdateWallpaper}
        onClearWallpaper={handleClearWallpaper}
      />
    </div>
  );
}
