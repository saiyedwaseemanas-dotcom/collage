import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Student, Teacher, SubjectSyllabus, ActiveTab, AttendanceStatus, WebhookLog, InstitutionProfile, DispatchModalConfig } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_SYLLABUS, INITIAL_WEBHOOK_LOGS } from '../data/mockData';
import { DEFAULT_INSTITUTION, CLIENT_PRESETS } from '../data/brandingPresets';

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

  // Institution / White-Label Client Rebranding
  institution: InstitutionProfile;
  updateInstitution: (profile: Partial<InstitutionProfile>) => void;
  applyClientPreset: (presetId: string) => void;

  // Students & Database CRUD
  students: Student[];
  selectedClass: 'Class 10-A' | 'Class 10-B' | 'Class 9-A' | 'Class 11-Sci' | 'Class 12-Sci' | string;
  setSelectedClass: (cls: 'Class 10-A' | 'Class 10-B' | 'Class 9-A' | 'Class 11-Sci' | 'Class 12-Sci' | string) => void;
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

  // Institution Profile (Stored in localStorage for persistence)
  const [institution, setInstitution] = useState<InstitutionProfile>(() => {
    try {
      const saved = localStorage.getItem('edutrack_institution');
      return saved ? JSON.parse(saved) : DEFAULT_INSTITUTION;
    } catch {
      return DEFAULT_INSTITUTION;
    }
  });

  // Students Database (Stored in localStorage for persistence)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [selectedClass, setSelectedClass] = useState<string>('Class 10-A');
  const [currentDateLabel, setCurrentDateLabel] = useState('Today: Oct 24, 2024');
  const [filterDefaultersOnly, setFilterDefaultersOnly] = useState(false);

  // Marks & Grading
  const [selectedExam, setSelectedExam] = useState<'UT-1' | 'UT-2' | 'Mid-Term' | 'Final'>('UT-2');

  // Teachers Database (Stored in localStorage)
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem('edutrack_teachers');
      return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // Syllabus (Stored in localStorage)
  const [syllabus, setSyllabus] = useState<SubjectSyllabus>(() => {
    try {
      const saved = localStorage.getItem('edutrack_syllabus');
      return saved ? JSON.parse(saved) : INITIAL_SYLLABUS;
    } catch {
      return INITIAL_SYLLABUS;
    }
  });

  // Metrics trigger timestamp for instant chart re-renders
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

  // Save to localStorage automatically on changes
  useEffect(() => {
    localStorage.setItem('edutrack_institution', JSON.stringify(institution));
  }, [institution]);

  useEffect(() => {
    localStorage.setItem('edutrack_students', JSON.stringify(students));
    setMetricsKey(Date.now());
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edutrack_teachers', JSON.stringify(teachers));
    setMetricsKey(Date.now());
  }, [teachers]);

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

  const updateInstitution = (profile: Partial<InstitutionProfile>) => {
    setInstitution(prev => ({ ...prev, ...profile }));
  };

  const applyClientPreset = (presetId: string) => {
    const preset = CLIENT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setInstitution(preset);
      setAcademicSession(preset.academicSession);
    }
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
        const gradeKey = selectedClass.replace('Class ', '');
        if (s.gradeLevel === gradeKey || selectedClass === 'ALL') {
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
    showToast('All UT-2 marks updated, recalculated & saved in database!');
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'> | Teacher) => {
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      ...teacherData,
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
    showToast('Students, Attendance, Marks & Syllabus exported to Google Drive & Sheets!');
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
        institution,
        updateInstitution,
        applyClientPreset,
        students,
        selectedClass,
        setSelectedClass,
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
        teachers,
        updateTeacherStatus,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        syllabus,
        updateChapter,
        addChapter,
        deleteChapter,
        sendTeacherReminder,
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
