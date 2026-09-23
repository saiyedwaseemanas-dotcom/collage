import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Teacher, SubjectSyllabus, ActiveTab, AttendanceStatus, WebhookLog } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_SYLLABUS, INITIAL_WEBHOOK_LOGS } from '../data/mockData';

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

  // Students & Attendance
  students: Student[];
  selectedClass: 'Class 10-A' | 'Class 10-B' | 'Class 9-A';
  setSelectedClass: (cls: 'Class 10-A' | 'Class 10-B' | 'Class 9-A') => void;
  currentDateLabel: string;
  shiftDate: (dir: number) => void;
  updateStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
  markAllPresent: () => void;
  filterDefaultersOnly: boolean;
  setFilterDefaultersOnly: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Marks & Grading
  selectedExam: 'UT-1' | 'UT-2' | 'Mid-Term' | 'Final';
  setSelectedExam: (exam: 'UT-1' | 'UT-2' | 'Mid-Term' | 'Final') => void;
  updateStudentMark: (studentId: string, subject: 'math' | 'sci' | 'eng', score: number) => void;
  saveAllMarks: () => void;

  // Teachers
  teachers: Teacher[];
  updateTeacherStatus: (id: string, status: Teacher['status']) => void;

  // Syllabus
  syllabus: SubjectSyllabus;
  updateChapter: (chapterId: string, updates: Partial<SubjectSyllabus['chapters'][0]>, notify?: boolean) => void;
  addChapter: (chapter: Omit<SubjectSyllabus['chapters'][0], 'id'>) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Teacher' | 'Principal'>('Admin');
  const [academicSession, setAcademicSession] = useState('2024 - 2025 (Term 2)');
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Students & Attendance
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedClass, setSelectedClass] = useState<'Class 10-A' | 'Class 10-B' | 'Class 9-A'>('Class 10-A');
  const [currentDateLabel, setCurrentDateLabel] = useState('Today: Oct 24, 2024');
  const [filterDefaultersOnly, setFilterDefaultersOnly] = useState(false);

  // Marks & Grading
  const [selectedExam, setSelectedExam] = useState<'UT-1' | 'UT-2' | 'Mid-Term' | 'Final'>('UT-2');

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);

  // Syllabus
  const [syllabus, setSyllabus] = useState<SubjectSyllabus>(INITIAL_SYLLABUS);

  // Sheets Sync
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
  const [activeStudentForReport, setActiveStudentForReport] = useState<Student | null>(INITIAL_STUDENTS[0]);
  const [scheduleSyncModalData, setScheduleSyncModalData] = useState<{ teacherName: string; subject: string; classSec: string } | null>(null);
  const [editingChapterModalData, setEditingChapterModalData] = useState<SubjectSyllabus['chapters'][0] | null>(null);

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
        if (s.gradeLevel === gradeKey) {
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
    showToast('All UT-2 marks updated & synced with master spreadsheet!');
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
      showToast('Progress saved & broadcast notification sent to parents & students!');
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
    showToast('All 4 Master Google Sheets successfully synced!');
  };

  const importRecords = async () => {
    setIsImporting(true);
    setImportProgress(0);

    for (let p = 25; p <= 100; p += 25) {
      await new Promise(r => setTimeout(r, 220));
      setImportProgress(p);
    }

    setIsImporting(false);
    showToast('40 Student records successfully validated and imported!');
  };

  const exportAllTabs = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1400));
    setIsExporting(false);
    showToast('Students, Attendance, Marks & Syllabus exported to Google Drive!');
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
        students,
        selectedClass,
        setSelectedClass,
        currentDateLabel,
        shiftDate,
        updateStudentAttendance,
        markAllPresent,
        filterDefaultersOnly,
        setFilterDefaultersOnly,
        selectedExam,
        setSelectedExam,
        updateStudentMark,
        saveAllMarks,
        teachers,
        updateTeacherStatus,
        syllabus,
        updateChapter,
        addChapter,
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
        activeStudentForReport,
        setActiveStudentForReport,
        scheduleSyncModalData,
        setScheduleSyncModalData,
        editingChapterModalData,
        setEditingChapterModalData,
        isApkModalOpen,
        setIsApkModalOpen,
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
