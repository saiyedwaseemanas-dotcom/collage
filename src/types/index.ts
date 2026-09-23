import React from 'react';

export type AttendanceStatus = 'P' | 'A' | 'L' | 'HD';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  classSec: string;
  gradeLevel: '10-A' | '10-B' | '9-A' | '11-Sci' | '12-Sci' | string;
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
  gradeLevel: '10-A' | '10-B' | '9-A' | '11-Sci' | '12-Sci' | string;
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
