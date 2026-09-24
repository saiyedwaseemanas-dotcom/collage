import React from 'react';

export type AttendanceStatus = 'P' | 'A' | 'L' | 'HD';

export type ClassLevelCategory =
  | 'Pre-Primary / Kindergarten'
  | 'Primary (1-5)'
  | 'Middle School (6-8)'
  | 'Secondary (9-10)'
  | 'Higher Secondary (11-12)'
  | 'Undergraduate (UG)'
  | 'Postgraduate (PG)'
  | 'Doctorate (Ph.D)';

export interface AcademicClass {
  id: string;
  name: string; // e.g. 'Senior KG', 'Class 10-A', 'B.Tech (CSE)', 'Ph.D (Research)'
  category: ClassLevelCategory;
  section?: string;
  department?: string;
  roomNo?: string;
  mentorTeacherId?: string;
  mentorTeacherName?: string;
  capacity?: number;
  totalEnrolled?: number;
}

export interface SubjectItem {
  id: string;
  name: string; // e.g. 'Phonics & Numeracy', 'Mathematics', 'Data Structures', 'Research Methodology'
  code: string; // e.g. 'SKG-NUM', 'MATH-10', 'CSE-301', 'PHD-901'
  classCategory: ClassLevelCategory;
  specificClassName?: string; // e.g. 'Senior KG' or 'All Secondary' or 'Class 10-A'
  creditHours?: number;
  maxMarks: number;
  passMarks: number;
  teacherName?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  classSec: string;
  gradeLevel: string; // e.g., 'Senior KG', '10-A', 'B.Tech (CSE)', 'Ph.D'
  parentName: string;
  parentRelation: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentWhatsApp: string;
  parentEmail?: string;
  attendancePct: number;
  totalPresent: number;
  totalWorkingDays: number;
  todayStatus: AttendanceStatus;
  note?: string;
  avatarUrl: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  marks: {
    ut1: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    ut2: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    midTerm: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
    finalExam?: { math: number; sci: number; eng: number; sst?: number; hindi?: number };
  };
}

export interface FacultyAttendanceLog {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  status: 'P' | 'A' | 'L' | 'HD' | 'OD'; // Present, Absent, Leave, Half Day, On Duty
  inTime?: string;
  outTime?: string;
  authorizedByPrincipal: boolean;
  principalName?: string;
  principalNote?: string;
  timestamp: string;
}

export interface FacultySalarySlip {
  teacherId: string;
  teacherName: string;
  designation: string;
  subject: string;
  monthYear: string;
  baseMonthlySalary: number;
  totalWorkingDays: number;
  presentDays: number;
  onDutyDays: number;
  halfDays: number;
  paidLeavesCount: number;
  unpaidAbsences: number;
  perDayRate: number;
  grossPayable: number;
  lopDeduction: number;
  dutyAllowance: number;
  netPayableSalary: number;
  isAuthorizedByPrincipal: boolean;
  principalApprovalDate?: string;
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
  baseSalary: number; // Monthly base salary in institution currency
  leaveBalance: {
    cl: number; // Casual Leave
    sl: number; // Sick Leave
    el: number; // Earned Leave
  };
  classesAssigned: string[];
  department?: string;
  monthlyAttendanceHistory?: {
    [dateStr: string]: {
      status: 'P' | 'A' | 'L' | 'HD' | 'OD';
      note?: string;
      authorized: boolean;
      authorizedBy?: string;
      timestamp?: string;
    };
  };
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
  gradeLevel: string; // e.g., 'Senior KG', '10-A', 'B.Tech (CSE)', 'Ph.D'
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

export interface InstitutionProfile {
  id: string;
  name: string;
  shortName: string;
  category: 'School' | 'College' | 'University' | 'Academy';
  tagline: string;
  affiliationCode: string;
  boardName: string; // e.g. "CBSE", "ICSE", "State Board", "NAAC / UGC Autonomous"
  logoUrl: string;
  stampUrl?: string;
  principalName: string;
  principalDesignation: 'Principal' | 'Dean' | 'Director' | 'Headmaster' | 'President';
  principalEmail: string;
  principalWhatsApp: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  academicSession: string;
  primaryColor: string;
  accentColor: string;
  defaulterThreshold: number;
  currencySymbol: string;
  whatsappTemplate?: string;
}

export interface DispatchModalConfig {
  isOpen: boolean;
  title: string;
  defaultFormat: 'pdf' | 'excel' | 'sheets';
  defaultRecipientType: 'principal' | 'parent' | 'all-parents';
  targetStudent?: Student;
  targetClass?: string;
  reportCategory:
    | 'student-report'
    | 'attendance-register'
    | 'marks-ledger'
    | 'marks-summary'
    | 'faculty-summary'
    | 'faculty-payslip'
    | 'syllabus-progress'
    | 'syllabus-audit'
    | 'master-audit';
}

export type ActiveTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'syllabus' 
  | 'exams' 
  | 'sync' 
  | 'students' 
  | 'teachers' 
  | 'branding'
  | 'settings';
