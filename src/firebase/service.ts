import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User,
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
}

export async function loadUserProfile(
  userId: string
): Promise<{ target: TargetSchool; plan: StudyPlan } | null> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      target: data.target || DEFAULT_EMPTY_TARGET,
      plan: data.plan || DEFAULT_EMPTY_PLAN,
    };
  }
  return null;
}

// Subjects
export async function saveSubjectDoc(userId: string, subject: Subject) {
  const ref = doc(db, 'users', userId, 'subjects', subject.id);
  await setDoc(ref, { ...subject, userId }, { merge: true });
}

export async function deleteSubjectDoc(userId: string, subjectId: string) {
  const ref = doc(db, 'users', userId, 'subjects', subjectId);
  await deleteDoc(ref);
}

// Materials
export async function saveMaterialDoc(userId: string, material: StudyMaterial) {
  const ref = doc(db, 'users', userId, 'materials', material.id);
  await setDoc(ref, { ...material, userId }, { merge: true });
}

export async function deleteMaterialDoc(userId: string, materialId: string) {
  const ref = doc(db, 'users', userId, 'materials', materialId);
  await deleteDoc(ref);
}

// Study Logs
export async function saveLogDoc(userId: string, log: StudyLog) {
  const ref = doc(db, 'users', userId, 'logs', log.id);
  await setDoc(ref, { ...log, userId }, { merge: true });
}

export async function deleteLogDoc(userId: string, logId: string) {
  const ref = doc(db, 'users', userId, 'logs', logId);
  await deleteDoc(ref);
}

// Diary Entries
export async function saveDiaryDoc(userId: string, diary: DiaryEntry) {
  const ref = doc(db, 'users', userId, 'diary', diary.id);
  await setDoc(ref, { ...diary, userId }, { merge: true });
}

export async function deleteDiaryDoc(userId: string, diaryId: string) {
  const ref = doc(db, 'users', userId, 'diary', diaryId);
  await deleteDoc(ref);
}

// Todos
export async function saveTodoDoc(userId: string, todo: TodoTask) {
  const ref = doc(db, 'users', userId, 'todos', todo.id);
  await setDoc(ref, { ...todo, userId }, { merge: true });
}

export async function deleteTodoDoc(userId: string, todoId: string) {
  const ref = doc(db, 'users', userId, 'todos', todoId);
  await deleteDoc(ref);
}

// Schedule Items
export async function saveScheduleDoc(userId: string, item: ScheduleItem) {
  const ref = doc(db, 'users', userId, 'schedule', item.id);
  await setDoc(ref, { ...item, userId }, { merge: true });
}

export async function deleteScheduleDoc(userId: string, scheduleId: string) {
  const ref = doc(db, 'users', userId, 'schedule', scheduleId);
  await deleteDoc(ref);
}

// Mock Exams
export async function saveMockExamDoc(userId: string, record: MockExamRecord) {
  const ref = doc(db, 'users', userId, 'mockExams', record.id);
  await setDoc(ref, { ...record, userId }, { merge: true });
}

export async function deleteMockExamDoc(userId: string, mockId: string) {
  const ref = doc(db, 'users', userId, 'mockExams', mockId);
  await deleteDoc(ref);
}
