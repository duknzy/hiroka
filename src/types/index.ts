export interface Subject {
  id: string;
  name: string;
  color: string;
  targetHours?: number;
  idealWeight?: number;
}

export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  subjectId: string;
  subjectName: string;
  materialId?: string;
  materialTitle?: string;
  durationMinutes: number;
  range?: string; // e.g. "p.40-p.55" or "15問"
  memo: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subjectId: string;
  totalUnits: number;
  currentUnit: number;
  unitType: 'ページ' | '問' | '単語' | '章';
  currentLap: number;
  targetLaps: number;
  priority: '高' | '中' | '低';
  notes?: string;
}

export interface TargetSchool {
  name: string;
  faculty: string;
  type: string;
  stream: string;
  grade: string;
  examDateKyotsu: string; // YYYY-MM-DD
  examDateSecondary: string; // YYYY-MM-DD
  targetDeviation: number;
  targetTotalHours: number;
  subjectWeightPercent: Record<string, number>;
}

export interface StudyPlan {
  weeklyTargetHours: number;
  dailyWeekdayHours: number;
  dailyWeekendHours: number;
  subjectTargetHours: Record<string, number>;
  monthlyGoal: string;
  focusTheme: string;
}

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectId: string;
  title: string;
  isCompleted: boolean;
  category: '自習' | '学校' | '予備校/塾' | '模試' | '復習';
}

export interface TodoTask {
  id: string;
  title: string;
  subjectId: string;
  priority: 'urgent' | 'high' | 'normal';
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  estimatedMinutes: number;
}

export interface MockExamRecord {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  overallDeviation: number;
  overallScore: number;
  maxScore: number;
  judgment: 'A' | 'B' | 'C' | 'D' | 'E';
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  goodPoints: string;
  improvements: string;
  tomorrowCommitment: string;
  rating?: number;
}

export type ActiveTab = 'dashboard' | 'plan' | 'schedule' | 'materials' | 'diary' | 'mock-exams';
