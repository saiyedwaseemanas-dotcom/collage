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
    ut1?: { math: number; sci: number; eng: number; [key: string]: number | undefined };
    ut2: { math: number; sci: number; eng: number; [key: string]: number | undefined };
    midTerm?: { math: number; sci: number; eng: number; [key: string]: number | undefined };
    finalExam?: { math: number; sci: number; eng: number; [key: string]: number | undefined };
    [examKey: string]: { [subjectKey: string]: number | undefined } | undefined;
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
    | 'fee-receipt'
    | 'fee-defaulters'
    | 'master-audit';
}

export type ActiveTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'fees'
  | 'syllabus' 
  | 'exams' 
  | 'calendar'
  | 'notices'
  | 'sync' 
  | 'students' 
  | 'teachers' 
  | 'branding'
  | 'settings';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'sunday' | 'exam' | 'event' | 'ptm' | 'fee-due';
  description?: string;
  isGazetted?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'Urgent' | 'Fees' | 'Holiday' | 'Exams' | 'PTM' | 'General';
  targetAudience: 'All Parents' | 'Class-Specific' | 'All Teachers' | 'All Students';
  targetClass?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  publishedAt: string;
  publishedBy: string;
  isPinned?: boolean;
  broadcastSent?: boolean;
  broadcastRecipientsCount?: number;
}

export interface CustomExam {
  id: string;
  name: string;
  code: string;
  maxMarksPerSubject: number;
  startDate?: string;
  endDate?: string;
}

export interface FeeStructure {
  id: string;
  className: string;
  category: ClassLevelCategory;
  tuitionFee: number;
  labActivityFee: number;
  examFee: number;
  transportFee: number;
  totalAnnualFee: number;
  frequency: 'Annual' | 'Quarterly' | 'Semester';
}

export interface FeePaymentTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classSec: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Net Banking' | 'Cheque';
  transactionRef: string;
  date: string;
  receivedBy: string;
  note?: string;
}

export interface StudentFeeDetails {
  studentId: string;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Overdue';
  lastPaymentDate?: string;
  lastPaymentMode?: string;
}

export type TeacherLeaveType =
  | 'Casual Leave (CL)'
  | 'Sick Leave (SL)'
  | 'Earned Leave (EL)'
  | 'Half Day (HD)'
  | 'On Duty (OD)';

export interface TeacherLeaveApplication {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherSubject: string;
  leaveType: TeacherLeaveType;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason: string;
  substituteTeacherName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  reviewedBy?: string;
  principalRemarks?: string;
  reviewedAt?: string;
}
