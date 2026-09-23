export type AttendanceStatus = 'P' | 'A' | 'L' | 'HD';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  classSec: string;
  gradeLevel: '10-A' | '10-B' | '9-A';
  parentName: string;
  parentRelation: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentWhatsApp: string;
  attendancePct: number;
  totalPresent: number;
  totalWorkingDays: number;
  todayStatus: AttendanceStatus;
  note?: string;
  avatarUrl: string;
  marks: {
    ut1: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    ut2: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    midTerm: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    finalExam?: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
  };
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  subject: string;
  qualification: string;
  avatarUrl: string;
  phone: string;
  email: string;
  status: 'In Campus' | 'On Duty (Exam)' | 'On Leave' | 'Field Work';
  biometricCheckIn: string;
  scheduledOut: string;
  leaveBalance: {
    cl: number; // Casual Leave
    sl: number; // Sick Leave
    el: number; // Earned Leave
  };
  classesAssigned: string[];
}

export interface CurriculumChapter {
  id: string;
  unitNumber: number;
  name: string;
  allottedPeriods: number;
  completedPeriods: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionDate?: string;
  scheduledDate?: string;
  lessonNotes: string;
  assignedHomework: string;
  prerequisites?: string;
}

export interface SubjectSyllabus {
  subject: string;
  gradeLevel: '10-A' | '10-B' | '9-A';
  teacherName: string;
  teacherQualification: string;
  overallCompletion: number;
  targetMidTerm: number;
  periodsHeld: number;
  totalPeriods: number;
  totalChapters: number;
  completedChapters: number;
  statusText: 'Ahead of Schedule' | 'On Track' | 'Behind Schedule' | 'Critical Lag';
  chapters: CurriculumChapter[];
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  source: string;
  status: '200 OK' | 'Error';
  responseTimeMs: number;
  payloadSummary: string;
}

export type ActiveTab = 'dashboard' | 'attendance' | 'syllabus' | 'exams' | 'sync' | 'students' | 'teachers' | 'settings';
