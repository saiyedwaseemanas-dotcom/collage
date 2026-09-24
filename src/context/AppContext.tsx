import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  Teacher,
  SubjectSyllabus,
  ActiveTab,
  AttendanceStatus,
  WebhookLog,
  InstitutionProfile,
  DispatchModalConfig,
  AcademicClass,
  SubjectItem,
  FacultyAttendanceLog,
  FacultySalarySlip,
} from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_SYLLABUS, INITIAL_WEBHOOK_LOGS, INITIAL_FACULTY_LOGS } from '../data/mockData';
import { DEFAULT_INSTITUTION, CLIENT_PRESETS } from '../data/brandingPresets';
import { INITIAL_CLASSES, INITIAL_SUBJECTS } from '../data/classesAndSubjectsData';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & Role
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  userRole: 'Admin' | 'Teacher' | 'Principal';
  setUserRole: (role: 'Admin' | 'Teacher' | 'Principal') => void;
  academicSession: string;
  setAcademicSession: (session: string) => void;

  // Institution / Multi-School Management (CRUD)
  institutions: InstitutionProfile[];
  institution: InstitutionProfile;
  addInstitution: (inst: InstitutionProfile) => void;
  updateInstitution: (id: string, updates: Partial<InstitutionProfile>) => void;
  deleteInstitution: (id: string) => void;
  switchInstitution: (id: string) => void;
  applyClientPreset: (presetId: string) => void;

  // Classes Management (Senior KG to PhD Level)
  classes: AcademicClass[];
  addClass: (newCls: AcademicClass) => void;
  updateClass: (id: string, updates: Partial<AcademicClass>) => void;
  deleteClass: (id: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  isClassModalOpen: boolean;
  setIsClassModalOpen: (open: boolean) => void;

  // Subjects Management (Mapped by Class Level from Senior KG to PhD)
  subjects: SubjectItem[];
  addSubject: (newSubj: SubjectItem) => void;
  updateSubject: (id: string, updates: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;
  getSubjectsForClass: (classNameOrLevel: string) => SubjectItem[];
  selectedSubject: string;
  setSelectedSubject: (subj: string) => void;
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (open: boolean) => void;

  // Students & Database CRUD
  students: Student[];
  currentDateLabel: string;
  shiftDate: (dir: number) => void;
  updateStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
  markAllPresent: () => void;
  filterDefaultersOnly: boolean;
  setFilterDefaultersOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
  addStudent: (student: Omit<Student, 'id'> | Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Marks & Grading CRUD
  selectedExam: 'UT-1' | 'UT-2' | 'Mid-Term' | 'Final';
  setSelectedExam: (exam: 'UT-1' | 'UT-2' | 'Mid-Term' | 'Final') => void;
  updateStudentMark: (studentId: string, subject: 'math' | 'sci' | 'eng', score: number) => void;
  saveAllMarks: () => void;

  // Teachers & Faculty CRUD
  teachers: Teacher[];
  updateTeacherStatus: (id: string, status: Teacher['status']) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'> | Teacher) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Faculty Attendance Sheet & Principal Authorization Portal
  facultyAttendanceLogs: FacultyAttendanceLog[];
  recordFacultyAttendance: (
    teacherId: string,
    status: 'P' | 'A' | 'L' | 'HD' | 'OD',
    note: string,
    isAuthorized: boolean,
    principalName?: string
  ) => void;
  calculateFacultySalary: (teacher: Teacher, totalWorkingDays?: number, monthYear?: string) => FacultySalarySlip;
  selectedFacultyForSlip: FacultySalarySlip | null;
  setSelectedFacultyForSlip: (slip: FacultySalarySlip | null) => void;

  // Syllabus & Curriculum CRUD
  syllabus: SubjectSyllabus;
  updateChapter: (chapterId: string, updates: Partial<SubjectSyllabus['chapters'][0]>, notify?: boolean) => void;
  addChapter: (chapter: Omit<SubjectSyllabus['chapters'][0], 'id'>) => void;
  deleteChapter: (chapterId: string) => void;
  sendTeacherReminder: (teacherName: string, subject: string, classSec: string) => void;

  // Sheets Sync & Webhook
  isMasterSheetConnected: boolean;
  setIsMasterSheetConnected: (connected: boolean) => void;
  isTwoWaySyncActive: boolean;
  setIsTwoWaySyncActive: (active: boolean) => void;
  lastSyncTime: string;
  triggerManualSync: () => Promise<void>;
  isSyncing: boolean;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  importRecords: () => Promise<void>;
  isImporting: boolean;
  importProgress: number;
  exportAllTabs: () => Promise<void>;
  isExporting: boolean;
  webhookLogs: WebhookLog[];
  fireMockWebhook: () => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: ToastInfo['type']) => void;

  // Modals & Active Selections
  activeStudentForReport: Student | null;
  setActiveStudentForReport: (student: Student | null) => void;
  scheduleSyncModalData: { teacherName: string; subject: string; classSec: string } | null;
  setScheduleSyncModalData: (data: { teacherName: string; subject: string; classSec: string } | null) => void;
  editingChapterModalData: SubjectSyllabus['chapters'][0] | null;
  setEditingChapterModalData: (chap: SubjectSyllabus['chapters'][0] | null) => void;
  isApkModalOpen: boolean;
  setIsApkModalOpen: (open: boolean) => void;

  // Push Button Document & WhatsApp / Email Dispatch Modal
  dispatchModalConfig: DispatchModalConfig;
  openDispatchModal: (config: Partial<DispatchModalConfig>) => void;
  closeDispatchModal: () => void;

  // Real-Time Reactive Analytics Helper
  metricsKey: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Teacher' | 'Principal'>('Admin');
  const [academicSession, setAcademicSession] = useState('2024 - 2025 (Term 2)');
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // 1. Multi-School / Institutions CRUD (Stored in localStorage)
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_institutions_list');
      return saved ? JSON.parse(saved) : CLIENT_PRESETS;
    } catch {
      return CLIENT_PRESETS;
    }
  });

  const [activeInstitutionId, setActiveInstitutionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('edutrack_active_institution_id');
      return saved || DEFAULT_INSTITUTION.id;
    } catch {
      return DEFAULT_INSTITUTION.id;
    }
  });

  const institution = useMemo(() => {
    return institutions.find(inst => inst.id === activeInstitutionId) || institutions[0] || DEFAULT_INSTITUTION;
  }, [institutions, activeInstitutionId]);

  // 2. Classes Management (Senior KG to PhD Level)
  const [classes, setClasses] = useState<AcademicClass[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_classes_list');
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // 3. Subjects Management (Mapped per Class / Level)
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_subjects_list');
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // 4. Students Database
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [currentDateLabel, setCurrentDateLabel] = useState('Today: Oct 24, 2024');
  const [filterDefaultersOnly, setFilterDefaultersOnly] = useState(false);
  const [selectedExam, setSelectedExam] = useState<'UT-1' | 'UT-2' | 'Mid-Term' | 'Final'>('UT-2');

  // 5. Teachers Database
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_teachers');
      return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // 6. Faculty Attendance Logs & Principal Authorization Audit
  const [facultyAttendanceLogs, setFacultyAttendanceLogs] = useState<FacultyAttendanceLog[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_faculty_attendance_logs');
      return saved ? JSON.parse(saved) : INITIAL_FACULTY_LOGS;
    } catch {
      return INITIAL_FACULTY_LOGS;
    }
  });

  const [selectedFacultyForSlip, setSelectedFacultyForSlip] = useState<FacultySalarySlip | null>(null);

  // 7. Syllabus
  const [syllabus, setSyllabus] = useState<SubjectSyllabus>(() => {
    try {
      const saved = localStorage.getItem('edutrack_syllabus');
      return saved ? JSON.parse(saved) : INITIAL_SYLLABUS;
    } catch {
      return INITIAL_SYLLABUS;
    }
  });

  // Metrics trigger
  const [metricsKey, setMetricsKey] = useState(Date.now());

  // Google Sheets & Webhooks
  const [isMasterSheetConnected, setIsMasterSheetConnected] = useState(true);
  const [isTwoWaySyncActive, setIsTwoWaySyncActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Today at 09:42 AM');
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1X9_EDUTrack_DPS4_Roster_2024/edit');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>(INITIAL_WEBHOOK_LOGS);

  // Toast
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Modals
  const [activeStudentForReport, setActiveStudentForReport] = useState<Student | null>(null);
  const [scheduleSyncModalData, setScheduleSyncModalData] = useState<{ teacherName: string; subject: string; classSec: string } | null>(null);
  const [editingChapterModalData, setEditingChapterModalData] = useState<SubjectSyllabus['chapters'][0] | null>(null);

  // Push Button Document / WhatsApp / Email Dispatch Modal
  const [dispatchModalConfig, setDispatchModalConfig] = useState<DispatchModalConfig>({
    isOpen: false,
    title: 'Push Report & Dispatch',
    defaultFormat: 'pdf',
    defaultRecipientType: 'principal',
    reportCategory: 'master-audit',
  });

  // Save to localStorage automatically
  useEffect(() => {
    localStorage.setItem('edutrack_institutions_list', JSON.stringify(institutions));
    localStorage.setItem('edutrack_active_institution_id', activeInstitutionId);
  }, [institutions, activeInstitutionId]);

  useEffect(() => {
    localStorage.setItem('edutrack_classes_list', JSON.stringify(classes));
    setMetricsKey(Date.now());
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('edutrack_subjects_list', JSON.stringify(subjects));
    setMetricsKey(Date.now());
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('edutrack_students', JSON.stringify(students));
    setMetricsKey(Date.now());
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edutrack_teachers', JSON.stringify(teachers));
    setMetricsKey(Date.now());
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('edutrack_faculty_attendance_logs', JSON.stringify(facultyAttendanceLogs));
    setMetricsKey(Date.now());
  }, [facultyAttendanceLogs]);

  useEffect(() => {
    localStorage.setItem('edutrack_syllabus', JSON.stringify(syllabus));
    setMetricsKey(Date.now());
  }, [syllabus]);

  const showToast = (message: string, type: ToastInfo['type'] = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Multi-Institution CRUD Methods
  const addInstitution = (newInst: InstitutionProfile) => {
    setInstitutions(prev => [newInst, ...prev]);
    setActiveInstitutionId(newInst.id);
    setAcademicSession(newInst.academicSession);
    showToast(`School / College "${newInst.name}" added and activated!`);
  };

  const updateInstitution = (id: string, updates: Partial<InstitutionProfile>) => {
    setInstitutions(prev =>
      prev.map(inst => (inst.id === id ? { ...inst, ...updates } : inst))
    );
    showToast('Institution profile and branding updated successfully!');
  };

  const deleteInstitution = (id: string) => {
    if (institutions.length <= 1) {
      showToast('Cannot remove the only remaining institution profile', 'warning');
      return;
    }
    const remaining = institutions.filter(inst => inst.id !== id);
    setInstitutions(remaining);
    if (activeInstitutionId === id) {
      setActiveInstitutionId(remaining[0].id);
      setAcademicSession(remaining[0].academicSession);
    }
    showToast('Institution removed from database');
  };

  const switchInstitution = (id: string) => {
    const target = institutions.find(inst => inst.id === id);
    if (target) {
      setActiveInstitutionId(target.id);
      setAcademicSession(target.academicSession);
      showToast(`Switched active school to ${target.shortName}`);
    }
  };

  const applyClientPreset = (presetId: string) => {
    const preset = CLIENT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const exists = institutions.find(i => i.id === preset.id);
      if (!exists) {
        setInstitutions(prev => [preset, ...prev]);
      }
      setActiveInstitutionId(preset.id);
      setAcademicSession(preset.academicSession);
      showToast(`Applied preset: ${preset.shortName}`);
    }
  };

  // Class Management CRUD Methods (Senior KG to PhD)
  const addClass = (newCls: AcademicClass) => {
    setClasses(prev => [newCls, ...prev]);
    setSelectedClass(newCls.name);
    showToast(`Added new class: ${newCls.name} (${newCls.category})`);
  };

  const updateClass = (id: string, updates: Partial<AcademicClass>) => {
    setClasses(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Class details updated');
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    showToast('Class removed from academic list');
  };

  // Subject Management CRUD Methods (Mapped by Class Level)
  const addSubject = (newSubj: SubjectItem) => {
    setSubjects(prev => [newSubj, ...prev]);
    setSelectedSubject(newSubj.name);
    showToast(`Added subject "${newSubj.name}" (${newSubj.code})`);
  };

  const updateSubject = (id: string, updates: Partial<SubjectItem>) => {
    setSubjects(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Subject configuration saved');
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    showToast('Subject removed from curriculum list');
  };

  const getSubjectsForClass = (classNameOrLevel: string): SubjectItem[] => {
    const normalized = classNameOrLevel.toLowerCase();
    return subjects.filter(subj => {
      if (subj.specificClassName && subj.specificClassName.toLowerCase() === normalized) {
        return true;
      }
      if (normalized.includes('kg') && subj.classCategory === 'Pre-Primary / Kindergarten') return true;
      if ((normalized.includes('class 9') || normalized.includes('class 10')) && subj.classCategory === 'Secondary (9-10)') return true;
      if ((normalized.includes('class 11') || normalized.includes('class 12')) && subj.classCategory === 'Higher Secondary (11-12)') return true;
      if ((normalized.includes('b.tech') || normalized.includes('b.sc') || normalized.includes('bca') || normalized.includes('b.com')) && subj.classCategory === 'Undergraduate (UG)') return true;
      if ((normalized.includes('m.tech') || normalized.includes('m.sc') || normalized.includes('mba') || normalized.includes('mca')) && subj.classCategory === 'Postgraduate (PG)') return true;
      if (normalized.includes('ph.d') && subj.classCategory === 'Doctorate (Ph.D)') return true;
      return false;
    });
  };

  // Faculty Attendance Sheet with Principal Authorization & Notes
  const recordFacultyAttendance = (
    teacherId: string,
    status: 'P' | 'A' | 'L' | 'HD' | 'OD',
    note: string,
    isAuthorized: boolean,
    principalName?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const teacher = teachers.find(t => t.id === teacherId);
    const teacherName = teacher ? teacher.name : 'Faculty Member';
    const authName = principalName || `${institution.principalName} (${institution.principalDesignation})`;

    const newLog: FacultyAttendanceLog = {
      id: `flog-${Date.now()}`,
      teacherId,
      teacherName,
      date: today,
      status,
      inTime: status === 'P' || status === 'HD' || status === 'OD' ? '08:00 AM' : undefined,
      outTime: status === 'P' || status === 'OD' ? '02:30 PM' : status === 'HD' ? '12:30 PM' : undefined,
      authorizedByPrincipal: isAuthorized,
      principalName: authName,
      principalNote: note || (isAuthorized ? `Authorized by ${authName}` : 'Self-marked attendance'),
      timestamp: new Date().toLocaleString(),
    };

    setFacultyAttendanceLogs(prev => [newLog, ...prev]);

    // Map into teacher object
    setTeachers(prev =>
      prev.map(t => {
        if (t.id === teacherId) {
          const statusText =
            status === 'P'
              ? 'In Campus'
              : status === 'OD'
              ? 'On Duty (Exam)'
              : status === 'L'
              ? 'On Leave'
              : status === 'HD'
              ? 'In Campus'
              : 'On Leave';

          return {
            ...t,
            status: statusText as Teacher['status'],
            monthlyAttendanceHistory: {
              ...(t.monthlyAttendanceHistory || {}),
              [today]: {
                status,
                note: note || (isAuthorized ? `Authorized by ${authName}` : 'Attendance log'),
                authorized: isAuthorized,
                authorizedBy: authName,
                timestamp: new Date().toLocaleString(),
              },
            },
          };
        }
        return t;
      })
    );

    showToast(`Faculty attendance recorded for ${teacherName} (${status}) - Authorized by Principal`);
  };

  // Salary Calculation based on faculty attendance
  const calculateFacultySalary = (
    teacher: Teacher,
    totalWorkingDays: number = 26,
    monthYear: string = 'October 2024'
  ): FacultySalarySlip => {
    const baseSalary = teacher.baseSalary || 60000;
    const perDayRate = parseFloat((baseSalary / totalWorkingDays).toFixed(2));

    // Calculate logs for this teacher
    const history = teacher.monthlyAttendanceHistory || {};
    let presentDays = 0;
    let onDutyDays = 0;
    let halfDays = 0;
    let paidLeavesCount = 0;
    let unpaidAbsences = 0;

    const values = Object.values(history);
    if (values.length > 0) {
      values.forEach(rec => {
        if (rec.status === 'P') presentDays++;
        else if (rec.status === 'OD') onDutyDays++;
        else if (rec.status === 'HD') halfDays++;
        else if (rec.status === 'L') {
          if (rec.authorized) paidLeavesCount++;
          else unpaidAbsences++;
        } else if (rec.status === 'A') {
          unpaidAbsences++;
        }
      });
    } else {
      // Default baseline estimate if no explicit logs
      presentDays = totalWorkingDays - 2;
      onDutyDays = 1;
      paidLeavesCount = 1;
      halfDays = 0;
      unpaidAbsences = 0;
    }

    // LOP deduction (unpaid absences + half day reduction)
    const lopDays = unpaidAbsences + halfDays * 0.5;
    const lopDeduction = parseFloat((lopDays * perDayRate).toFixed(2));

    // Duty Allowance for exam duties / seminars
    const dutyAllowance = onDutyDays * 800; // Special duty allowance
    const grossPayable = baseSalary + dutyAllowance;
    const netPayableSalary = Math.max(0, Math.round(grossPayable - lopDeduction));

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      designation: teacher.designation,
      subject: teacher.subject,
      monthYear,
      baseMonthlySalary: baseSalary,
      totalWorkingDays,
      presentDays,
      onDutyDays,
      halfDays,
      paidLeavesCount,
      unpaidAbsences,
      perDayRate,
      grossPayable,
      lopDeduction,
      dutyAllowance,
      netPayableSalary,
      isAuthorizedByPrincipal: true,
      principalApprovalDate: new Date().toLocaleDateString(),
    };
  };

  const openDispatchModal = (config: Partial<DispatchModalConfig>) => {
    setDispatchModalConfig({
      isOpen: true,
      title: config.title || 'Push & Dispatch Report',
      defaultFormat: config.defaultFormat || 'pdf',
      defaultRecipientType: config.defaultRecipientType || 'principal',
      targetStudent: config.targetStudent,
      targetClass: config.targetClass || selectedClass,
      reportCategory: config.reportCategory || 'master-audit',
    });
  };

  const closeDispatchModal = () => {
    setDispatchModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const shiftDate = (dir: number) => {
    if (dir === -1) {
      setCurrentDateLabel('Yesterday: Oct 23, 2024');
      showToast('Switched to previous date attendance ledger');
    } else {
      setCurrentDateLabel('Today: Oct 24, 2024');
      showToast('Returned to current active register');
    }
  };

  const updateStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const wasPresent = s.todayStatus === 'P' || s.todayStatus === 'HD';
          const isNowPresent = status === 'P' || status === 'HD';
          const newPresentCount = isNowPresent
            ? wasPresent ? s.totalPresent : s.totalPresent + 1
            : wasPresent ? Math.max(0, s.totalPresent - 1) : s.totalPresent;
          const newPct = parseFloat(((newPresentCount / s.totalWorkingDays) * 100).toFixed(1));
          return {
            ...s,
            todayStatus: status,
            totalPresent: newPresentCount,
            attendancePct: newPct,
          };
        }
        return s;
      })
    );
    showToast(`Attendance marked as ${status}`);
  };

  const markAllPresent = () => {
    setStudents(prev =>
      prev.map(s => {
        if (s.classSec === selectedClass || s.gradeLevel === selectedClass.replace('Class ', '') || selectedClass === 'ALL') {
          return {
            ...s,
            todayStatus: 'P',
            totalPresent: s.todayStatus !== 'P' ? s.totalPresent + 1 : s.totalPresent,
            attendancePct: parseFloat((((s.todayStatus !== 'P' ? s.totalPresent + 1 : s.totalPresent) / s.totalWorkingDays) * 100).toFixed(1)),
          };
        }
        return s;
      })
    );
    showToast(`Marked all ${selectedClass} students as Present`);
  };

  const addStudent = (studentData: Omit<Student, 'id'> | Student) => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      ...studentData,
    } as Student;
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const updateStudentMark = (studentId: string, subject: 'math' | 'sci' | 'eng', score: number) => {
    const clampedScore = Math.max(0, Math.min(50, score));
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            marks: {
              ...s.marks,
              ut2: {
                ...s.marks.ut2,
                [subject]: clampedScore,
              },
            },
          };
        }
        return s;
      })
    );
  };

  const saveAllMarks = () => {
    showToast('All marks updated, recalculated & saved in database!');
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'> | Teacher) => {
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      ...teacherData,
      baseSalary: (teacherData as Teacher).baseSalary || 60000,
    } as Teacher;
    setTeachers(prev => [newTeacher, ...prev]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const updateTeacherStatus = (id: string, status: Teacher['status']) => {
    setTeachers(prev =>
      prev.map(t => (t.id === id ? { ...t, status } : t))
    );
    showToast(`Teacher status updated: ${status}`);
  };

  const updateChapter = (chapterId: string, updates: Partial<SubjectSyllabus['chapters'][0]>, notify = false) => {
    setSyllabus(prev => {
      const updatedChapters = prev.chapters.map(c => (c.id === chapterId ? { ...c, ...updates } : c));
      const completedCount = updatedChapters.filter(c => c.status === 'Completed').length;
      const completionPct = parseFloat(((completedCount / updatedChapters.length) * 100).toFixed(1));
      return {
        ...prev,
        chapters: updatedChapters,
        completedChapters: completedCount,
        overallCompletion: completionPct,
        statusText: completionPct >= prev.targetMidTerm ? 'On Track' : 'Behind Schedule',
      };
    });
    if (notify) {
      showToast('Progress saved & notification dispatched to parents & students!');
    } else {
      showToast('Chapter details updated successfully');
    }
  };

  const addChapter = (chapterData: Omit<SubjectSyllabus['chapters'][0], 'id'>) => {
    const newId = `chap-${Date.now()}`;
    setSyllabus(prev => {
      const newChapters = [...prev.chapters, { ...chapterData, id: newId }];
      const completedCount = newChapters.filter(c => c.status === 'Completed').length;
      const completionPct = parseFloat(((completedCount / newChapters.length) * 100).toFixed(1));
      return {
        ...prev,
        totalChapters: newChapters.length,
        chapters: newChapters,
        completedChapters: completedCount,
        overallCompletion: completionPct,
      };
    });
    showToast(`New unit "${chapterData.name}" added to curriculum.`);
  };

  const deleteChapter = (chapterId: string) => {
    setSyllabus(prev => {
      const newChapters = prev.chapters.filter(c => c.id !== chapterId);
      const completedCount = newChapters.filter(c => c.status === 'Completed').length;
      const completionPct = newChapters.length > 0 ? parseFloat(((completedCount / newChapters.length) * 100).toFixed(1)) : 0;
      return {
        ...prev,
        totalChapters: newChapters.length,
        chapters: newChapters,
        completedChapters: completedCount,
        overallCompletion: completionPct,
      };
    });
    showToast('Chapter removed from syllabus');
  };

  const sendTeacherReminder = (teacherName: string, subject: string, classSec: string) => {
    showToast(`Urgent reminder successfully dispatched to ${teacherName} (${classSec} ${subject})`);
  };

  const triggerManualSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSyncing(false);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(`Today at ${timeStr}`);
    showToast('All Master Google Sheets successfully synced!');
  };

  const importRecords = async () => {
    setIsImporting(true);
    setImportProgress(0);
    for (let p = 25; p <= 100; p += 25) {
      await new Promise(r => setTimeout(r, 220));
      setImportProgress(p);
    }
    setIsImporting(false);
    showToast(`${students.length} Student records successfully validated and imported!`);
  };

  const exportAllTabs = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1400));
    setIsExporting(false);
    showToast('Students, Attendance, Marks, Faculty & Syllabus exported to Google Drive & Sheets!');
  };

  const fireMockWebhook = () => {
    const newLog: WebhookLog = {
      id: `wh-${Date.now()}`,
      timestamp: 'Just now',
      event: 'onEdit:Students_Roster',
      source: 'Google Apps Script Sandbox Ping',
      status: '200 OK',
      responseTimeMs: Math.floor(Math.random() * 30) + 15,
      payloadSummary: 'Handshake payload parsed successfully. 200 OK.',
    };
    setWebhookLogs(prev => [newLog, ...prev]);
    showToast('Sandbox Mock Webhook ping received! 200 OK');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDrawerOpen,
        setIsDrawerOpen,
        userRole,
        setUserRole,
        academicSession,
        setAcademicSession,

        // Multi-School CRUD
        institutions,
        institution,
        addInstitution,
        updateInstitution,
        deleteInstitution,
        switchInstitution,
        applyClientPreset,

        // Classes Management
        classes,
        addClass,
        updateClass,
        deleteClass,
        selectedClass,
        setSelectedClass,
        isClassModalOpen,
        setIsClassModalOpen,

        // Subjects Management
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        getSubjectsForClass,
        selectedSubject,
        setSelectedSubject,
        isSubjectModalOpen,
        setIsSubjectModalOpen,

        // Students
        students,
        currentDateLabel,
        shiftDate,
        updateStudentAttendance,
        markAllPresent,
        filterDefaultersOnly,
        setFilterDefaultersOnly,
        addStudent,
        updateStudent,
        deleteStudent,
        selectedExam,
        setSelectedExam,
        updateStudentMark,
        saveAllMarks,

        // Teachers & Faculty
        teachers,
        updateTeacherStatus,
        addTeacher,
        updateTeacher,
        deleteTeacher,

        // Faculty Attendance Sheet & Salary
        facultyAttendanceLogs,
        recordFacultyAttendance,
        calculateFacultySalary,
        selectedFacultyForSlip,
        setSelectedFacultyForSlip,

        // Syllabus
        syllabus,
        updateChapter,
        addChapter,
        deleteChapter,
        sendTeacherReminder,

        // Google Sheets
        isMasterSheetConnected,
        setIsMasterSheetConnected,
        isTwoWaySyncActive,
        setIsTwoWaySyncActive,
        lastSyncTime,
        triggerManualSync,
        isSyncing,
        sheetUrl,
        setSheetUrl,
        importRecords,
        isImporting,
        importProgress,
        exportAllTabs,
        isExporting,
        webhookLogs,
        fireMockWebhook,

        toast,
        showToast,
        activeStudentForReport: activeStudentForReport || students[0] || null,
        setActiveStudentForReport,
        scheduleSyncModalData,
        setScheduleSyncModalData,
        editingChapterModalData,
        setEditingChapterModalData,
        isApkModalOpen,
        setIsApkModalOpen,
        dispatchModalConfig,
        openDispatchModal,
        closeDispatchModal,
        metricsKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
