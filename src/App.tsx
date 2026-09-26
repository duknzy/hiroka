import React, { useState, useEffect } from 'react';
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
import { PlanView } from './components/PlanView';
import { ScheduleView } from './components/ScheduleView';
import { MaterialsView } from './components/MaterialsView';
import { DiaryView } from './components/DiaryView';
import { MockExamsView } from './components/MockExamsView';
import { TimerModal } from './components/TimerModal';
import { ManualLogModal } from './components/ManualLogModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { WallpaperModal } from './components/WallpaperModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App data state (Clean slate per user, saved to Firebase)
  const [target, setTarget] = useState<TargetSchool>(DEFAULT_EMPTY_TARGET);
  const [plan, setPlan] = useState<StudyPlan>(DEFAULT_EMPTY_PLAN);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [mockExams, setMockExams] = useState<MockExamRecord[]>([]);

  // Wallpaper settings (Saved to local storage per user's request)
  const [wallpaperSettings, setWallpaperSettings] = useState<WallpaperSettings>(() =>
    loadWallpaperSettings()
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isManualLogOpen, setIsManualLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);

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
          console.warn('Anonymous login fallback:', e);
          setUser(null);
          setAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore listeners for current user
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setMaterials([]);
      setLogs([]);
      setDiary([]);
      setTodos([]);
      setSchedule([]);
      setMockExams([]);
      setTarget(DEFAULT_EMPTY_TARGET);
      setPlan(DEFAULT_EMPTY_PLAN);
      return;
    }

    const uid = user.uid;

    const userDocRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.target) setTarget(data.target);
        if (data.plan) setPlan(data.plan);
      }
    });

    const subjectsRef = collection(db, 'users', uid, 'subjects');
    const unsubSubjects = onSnapshot(subjectsRef, (snap) => {
      const items: Subject[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setSubjects(items);
    });

    const materialsRef = collection(db, 'users', uid, 'materials');
    const unsubMaterials = onSnapshot(materialsRef, (snap) => {
      const items: StudyMaterial[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setMaterials(items);
    });

    const logsRef = collection(db, 'users', uid, 'logs');
    const logsQuery = query(logsRef, orderBy('timestamp', 'desc'));
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      const items: StudyLog[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setLogs(items);
    });

    const diaryRef = collection(db, 'users', uid, 'diary');
    const unsubDiary = onSnapshot(diaryRef, (snap) => {
      const items: DiaryEntry[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setDiary(items);
    });

    const todosRef = collection(db, 'users', uid, 'todos');
    const unsubTodos = onSnapshot(todosRef, (snap) => {
      const items: TodoTask[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setTodos(items);
    });

    const scheduleRef = collection(db, 'users', uid, 'schedule');
    const unsubSchedule = onSnapshot(scheduleRef, (snap) => {
      const items: ScheduleItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setSchedule(items);
    });

    const mockRef = collection(db, 'users', uid, 'mockExams');
    const unsubMock = onSnapshot(mockRef, (snap) => {
      const items: MockExamRecord[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setMockExams(items);
    });

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

  // CRUD Actions
  const handleSaveLog = async (logData: Omit<StudyLog, 'id' | 'timestamp'>) => {
    if (!user) return;
    const id = `log_${Date.now()}`;
    await saveLogDoc(user.uid, {
      ...logData,
      id,
      timestamp: Date.now(),
    });
  };

  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    await deleteLogDoc(user.uid, id);
  };

  const handleUpdateTarget = async (newTarget: TargetSchool) => {
    if (!user) return;
    setTarget(newTarget);
    await saveUserProfile(user.uid, newTarget, plan);
  };

  const handleUpdatePlan = async (newPlan: StudyPlan) => {
    if (!user) return;
    setPlan(newPlan);
    await saveUserProfile(user.uid, target, newPlan);
  };

  const handleAddSubject = async (sub: Omit<Subject, 'id'>) => {
    if (!user) return;
    const id = `sub_${Date.now()}`;
    await saveSubjectDoc(user.uid, { ...sub, id });
  };

  const handleDeleteSubject = async (id: string) => {
    if (!user) return;
    await deleteSubjectDoc(user.uid, id);
  };

  const handleAddMaterial = async (mat: Omit<StudyMaterial, 'id'>) => {
    if (!user) return;
    const id = `mat_${Date.now()}`;
    await saveMaterialDoc(user.uid, { ...mat, id });
  };

  const handleUpdateMaterial = async (mat: StudyMaterial) => {
    if (!user) return;
    await saveMaterialDoc(user.uid, mat);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!user) return;
    await deleteMaterialDoc(user.uid, id);
  };

  const handleAddTodo = async (task: Omit<TodoTask, 'id'>) => {
    if (!user) return;
    const id = `todo_${Date.now()}`;
    await saveTodoDoc(user.uid, { ...task, id });
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;
    await deleteTodoDoc(user.uid, id);
  };

  const handleToggleTodo = async (id: string) => {
    if (!user) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await saveTodoDoc(user.uid, { ...todo, completed: !todo.completed });
  };

  const handleAddScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
    if (!user) return;
    const id = `sch_${Date.now()}`;
    await saveScheduleDoc(user.uid, { ...item, id });
  };

  const handleDeleteScheduleItem = async (id: string) => {
    if (!user) return;
    await deleteScheduleDoc(user.uid, id);
  };

  const handleToggleScheduleItem = async (id: string) => {
    if (!user) return;
    const item = schedule.find((s) => s.id === id);
    if (!item) return;
    await saveScheduleDoc(user.uid, { ...item, isCompleted: !item.isCompleted });
  };

  const handleSaveDiary = async (entry: Omit<DiaryEntry, 'id'>) => {
    if (!user) return;
    const existing = diary.find((d) => d.date === entry.date);
    const id = existing?.id || `diary_${entry.date}`;
    await saveDiaryDoc(user.uid, { ...entry, id });
  };

  const handleDeleteDiary = async (id: string) => {
    if (!user) return;
    await deleteDiaryDoc(user.uid, id);
  };

  const handleAddMockExam = async (record: Omit<MockExamRecord, 'id'>) => {
    if (!user) return;
    const id = `mock_${Date.now()}`;
    await saveMockExamDoc(user.uid, { ...record, id });
  };

  const handleDeleteMockExam = async (id: string) => {
    if (!user) return;
    await deleteMockExamDoc(user.uid, id);
  };

  const handleLogout = async () => {
    await logoutUser();
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
              transform: 'scale(1.05)', // Prevent blur edge clipping
            }}
          />
          {/* Tone overlay tint */}
          <div
            className={`absolute inset-0 ${
              wallpaperSettings.overlay === 'dark' ? 'bg-slate-950/20' : 'bg-white/20'
            }`}
          />
        </div>
      )}

      {/* Main App Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          target={target}
          streakDays={streakDays}
          user={user}
          hasCustomWallpaper={!!wallpaperSettings.imageUrl}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenManualLog={() => setIsManualLogOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWallpaper={() => setIsWallpaperOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* Views Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              subjects={subjects}
              logs={logs}
              target={target}
              plan={plan}
              todos={todos}
              schedule={schedule}
              diary={diary}
              onOpenTimer={() => setIsTimerOpen(true)}
              onOpenManualLog={() => setIsManualLogOpen(true)}
              onOpenPlan={() => setActiveTab('plan')}
              onOpenDiaryTab={() => setActiveTab('diary')}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteLog={handleDeleteLog}
              onSaveDiary={handleSaveDiary}
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

      {/* Floating Modals */}
      <TimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        subjects={subjects}
        materials={materials}
        onSaveLog={handleSaveLog}
      />

      <ManualLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        subjects={subjects}
        materials={materials}
        onSaveLog={handleSaveLog}
      />

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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

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
