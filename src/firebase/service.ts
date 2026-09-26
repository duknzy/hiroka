import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { auth, db } from './config';
import {
  Subject,
  StudyMaterial,
  StudyLog,
  TargetSchool,
  StudyPlan,
  ScheduleItem,
  TodoTask,
  MockExamRecord,
  DiaryEntry,
} from '../types';

export const DEFAULT_EMPTY_TARGET: TargetSchool = {
  name: '',
  faculty: '',
  type: '国公立',
  stream: '理系',
  grade: '高3',
  examDateKyotsu: '2027-01-16',
  examDateSecondary: '2027-02-25',
  targetDeviation: 65,
  targetTotalHours: 3000,
  subjectWeightPercent: {},
};

export const DEFAULT_EMPTY_PLAN: StudyPlan = {
  weeklyTargetHours: 35,
  dailyWeekdayHours: 4,
  dailyWeekendHours: 7.5,
  subjectTargetHours: {},
  monthlyGoal: '',
  focusTheme: '',
};

// Local storage fallback helpers for resilience
const FALLBACK_KEY = 'passroute_local_fallback_v1';

export function getLocalFallbackData() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    target: DEFAULT_EMPTY_TARGET,
    plan: DEFAULT_EMPTY_PLAN,
    subjects: [],
    materials: [],
    logs: [],
    diary: [],
    todos: [],
    schedule: [],
    mockExams: [],
  };
}

export function saveLocalFallbackData(key: string, data: any) {
  try {
    const current = getLocalFallbackData();
    current[key] = data;
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(current));
  } catch (e) {}
}

// Auth helpers
export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function loginAsGuest() {
  return await signInAnonymously(auth);
}

export async function logoutUser() {
  return await signOut(auth);
}

// User Profile & Settings
export async function saveUserProfile(
  userId: string,
  target: TargetSchool,
  plan: StudyPlan
) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        target,
        plan,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Saving to local fallback due to Firestore error:', err);
    saveLocalFallbackData('target', target);
    saveLocalFallbackData('plan', plan);
  }
}

// Subjects
export async function saveSubjectDoc(userId: string, subject: Subject) {
  try {
    const ref = doc(db, 'users', userId, 'subjects', subject.id);
    await setDoc(ref, { ...subject, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: Subject[] = fallback.subjects || [];
    const index = list.findIndex((s) => s.id === subject.id);
    if (index >= 0) list[index] = subject;
    else list.push(subject);
    saveLocalFallbackData('subjects', list);
  }
}

export async function deleteSubjectDoc(userId: string, subjectId: string) {
  try {
    const ref = doc(db, 'users', userId, 'subjects', subjectId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.subjects || []).filter((s: Subject) => s.id !== subjectId);
    saveLocalFallbackData('subjects', list);
  }
}

// Materials
export async function saveMaterialDoc(userId: string, material: StudyMaterial) {
  try {
    const ref = doc(db, 'users', userId, 'materials', material.id);
    await setDoc(ref, { ...material, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: StudyMaterial[] = fallback.materials || [];
    const index = list.findIndex((m) => m.id === material.id);
    if (index >= 0) list[index] = material;
    else list.push(material);
    saveLocalFallbackData('materials', list);
  }
}

export async function deleteMaterialDoc(userId: string, materialId: string) {
  try {
    const ref = doc(db, 'users', userId, 'materials', materialId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.materials || []).filter((m: StudyMaterial) => m.id !== materialId);
    saveLocalFallbackData('materials', list);
  }
}

// Study Logs
export async function saveLogDoc(userId: string, log: StudyLog) {
  try {
    const ref = doc(db, 'users', userId, 'logs', log.id);
    await setDoc(ref, { ...log, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: StudyLog[] = fallback.logs || [];
    const index = list.findIndex((l) => l.id === log.id);
    if (index >= 0) list[index] = log;
    else list.unshift(log);
    saveLocalFallbackData('logs', list);
  }
}

export async function deleteLogDoc(userId: string, logId: string) {
  try {
    const ref = doc(db, 'users', userId, 'logs', logId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.logs || []).filter((l: StudyLog) => l.id !== logId);
    saveLocalFallbackData('logs', list);
  }
}

// Diary Entries
export async function saveDiaryDoc(userId: string, diary: DiaryEntry) {
  try {
    const ref = doc(db, 'users', userId, 'diary', diary.id);
    await setDoc(ref, { ...diary, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: DiaryEntry[] = fallback.diary || [];
    const index = list.findIndex((d) => d.id === diary.id);
    if (index >= 0) list[index] = diary;
    else list.unshift(diary);
    saveLocalFallbackData('diary', list);
  }
}

export async function deleteDiaryDoc(userId: string, diaryId: string) {
  try {
    const ref = doc(db, 'users', userId, 'diary', diaryId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.diary || []).filter((d: DiaryEntry) => d.id !== diaryId);
    saveLocalFallbackData('diary', list);
  }
}

// Todos
export async function saveTodoDoc(userId: string, todo: TodoTask) {
  try {
    const ref = doc(db, 'users', userId, 'todos', todo.id);
    await setDoc(ref, { ...todo, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: TodoTask[] = fallback.todos || [];
    const index = list.findIndex((t) => t.id === todo.id);
    if (index >= 0) list[index] = todo;
    else list.push(todo);
    saveLocalFallbackData('todos', list);
  }
}

export async function deleteTodoDoc(userId: string, todoId: string) {
  try {
    const ref = doc(db, 'users', userId, 'todos', todoId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.todos || []).filter((t: TodoTask) => t.id !== todoId);
    saveLocalFallbackData('todos', list);
  }
}

// Schedule Items
export async function saveScheduleDoc(userId: string, item: ScheduleItem) {
  try {
    const ref = doc(db, 'users', userId, 'schedule', item.id);
    await setDoc(ref, { ...item, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: ScheduleItem[] = fallback.schedule || [];
    const index = list.findIndex((s) => s.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    saveLocalFallbackData('schedule', list);
  }
}

export async function deleteScheduleDoc(userId: string, scheduleId: string) {
  try {
    const ref = doc(db, 'users', userId, 'schedule', scheduleId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.schedule || []).filter((s: ScheduleItem) => s.id !== scheduleId);
    saveLocalFallbackData('schedule', list);
  }
}

// Mock Exams
export async function saveMockExamDoc(userId: string, record: MockExamRecord) {
  try {
    const ref = doc(db, 'users', userId, 'mockExams', record.id);
    await setDoc(ref, { ...record, userId }, { merge: true });
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list: MockExamRecord[] = fallback.mockExams || [];
    const index = list.findIndex((m) => m.id === record.id);
    if (index >= 0) list[index] = record;
    else list.push(record);
    saveLocalFallbackData('mockExams', list);
  }
}

export async function deleteMockExamDoc(userId: string, mockId: string) {
  try {
    const ref = doc(db, 'users', userId, 'mockExams', mockId);
    await deleteDoc(ref);
  } catch (err) {
    const fallback = getLocalFallbackData();
    const list = (fallback.mockExams || []).filter((m: MockExamRecord) => m.id !== mockId);
    saveLocalFallbackData('mockExams', list);
  }
}
