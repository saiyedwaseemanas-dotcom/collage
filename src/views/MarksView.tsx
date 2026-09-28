import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import {
  Award,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Info,
  Table,
  TrendingUp,
  UserCheck,
  Sparkles,
  Save,
  Check,
  FileText,
  Trophy,
  PenTool,
  CheckSquare,
  Mail,
  ArrowUp,
  Plus,
  BookOpen,
  Layers,
  X,
  Printer,
  Download,
  Share2,
  MessageSquare,
  QrCode,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Ban,
  AlertCircle,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Camera,
  Upload,
  RefreshCw,
} from 'lucide-react';

const STUDENT_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

const REMARK_PRESETS = [
  'Exemplary student! Consistently demonstrates exceptional discipline and academic rigor.',
  'Shows strong analytical reasoning, leadership, and proactive classroom participation.',
  'Hardworking and diligent. Shows steady, commendable progress across all subjects.',
  'Polite, respectful, and attentive. Active participant in scholastic and sports activities.',
];

export const MarksView: React.FC = () => {
  const {
    students,
    classes,
    setIsClassModalOpen,
    selectedClass,
    setSelectedClass,
    selectedExam,
    setSelectedExam,
    customExams,
    addCustomExam,
    examSubjects,
    addExamSubject,
    updateStudentMark,
    updateStudentCustomMark,
    saveAllMarks,
    showToast,
    activeStudentForReport,
    setActiveStudentForReport,
    institution,
    openDispatchModal,
    setActiveTab,
    removeStudentFromExam,
    restoreStudentToExam,
    addStudent,
    updateStudent,
    academicSessions,
    activeAcademicYear,
    setActiveAcademicYear,
    setIsAcademicSessionModalOpen,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'marksheet' | 'analytics' | 'report'>('marksheet');
  const [selectedSubjectScope, setSelectedSubjectScope] = useState<string>('All');
  const [examStatusFilter, setExamStatusFilter] = useState<'all' | 'active' | 'excluded'>('all');
  
  // Custom Exam & Subject Modal States
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamMaxMarks, setNewExamMaxMarks] = useState<number>(100);

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Report Card Session & Student Options State
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [reportClassFilter, setReportClassFilter] = useState('ALL');
  const [customRemarksMap, setCustomRemarksMap] = useState<{ [id: string]: string }>({});

  // Add Student in Examination / Report Card Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddStudentCameraOpen, setIsAddStudentCameraOpen] = useState(false);
  const [newStudentSession, setNewStudentSession] = useState(activeAcademicYear);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Class 10-A'));
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentWhatsApp, setNewParentWhatsApp] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState(STUDENT_AVATAR_PRESETS[0]);
  const [newStudentAttendance, setNewStudentAttendance] = useState(96);
  const [newStudentRemarks, setNewStudentRemarks] = useState(REMARK_PRESETS[0]);
  const [newStudentInitialMarks, setNewStudentInitialMarks] = useState<{ [subjectKey: string]: number }>({});

  // Edit Student Modal State
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isEditStudentCameraOpen, setIsEditStudentCameraOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState<Partial<Student>>({});
  const [editStudentRemark, setEditStudentRemark] = useState('');

  // Editing marks buffer for current view
  const [editedMarksBuffer, setEditedMarksBuffer] = useState<{ [key: string]: number }>({});
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Normalize selected class filter
  const classStudents = useMemo(() => {
    if (selectedClass === 'ALL') return students;
    return students.filter(s => {
      const targetGrade = selectedClass.replace(/^class\s*/i, '').trim().toLowerCase();
      const sGrade = s.gradeLevel ? s.gradeLevel.toLowerCase() : '';
      const sClass = s.classSec ? s.classSec.toLowerCase() : '';
      return sGrade === targetGrade || sClass === selectedClass.toLowerCase() || sClass.includes(targetGrade);
    });
  }, [students, selectedClass]);

  // Active subjects to display in table
  const activeSubjects = useMemo(() => {
    if (selectedSubjectScope === 'All') return examSubjects;
    return [selectedSubjectScope];
  }, [selectedSubjectScope, examSubjects]);

  // Normalized exam key (e.g. 'ut1', 'ut2', 'midterm', 'final')
  const examKey = useMemo(() => {
    return selectedExam.toLowerCase().replace(/[^a-z0-9]/g, '');
  }, [selectedExam]);

  // Helper to extract student mark for a given subject & exam
  const getScore = (student: Student, subjectName: string): number => {
    const subKey = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bufferKey = `${student.id}_${examKey}_${subKey}`;
    if (editedMarksBuffer[bufferKey] !== undefined) {
      return editedMarksBuffer[bufferKey];
    }

    // Check dynamic marks first
    const dynamicExamMarks = (student.marks as any)[examKey] || (student.marks as any)[selectedExam];
    if (dynamicExamMarks && dynamicExamMarks[subKey] !== undefined) {
      return dynamicExamMarks[subKey];
    }

    // Check fallback built-in marks (ut1, ut2, midTerm, finalExam)
    const builtInExam = (student.marks as any)[examKey === 'ut1' ? 'ut1' : examKey === 'ut2' ? 'ut2' : examKey === 'midterm' ? 'midTerm' : 'ut2'];
    if (builtInExam) {
      if (subKey === 'math' || subKey === 'mathematics') return builtInExam.math ?? 45;
      if (subKey === 'sci' || subKey === 'science') return builtInExam.sci ?? 46;
      if (subKey === 'eng' || subKey === 'english') return builtInExam.eng ?? 44;
      if (subKey === 'sst' || subKey === 'socialstudies') return builtInExam.sst ?? 42;
      if (subKey === 'hindi') return builtInExam.hindi ?? 40;
    }

    return 40;
  };

  // Compute student aggregates with exclusion awareness
  const studentStats = useMemo(() => {
    return classStudents.map(student => {
      const isExcluded = Boolean(
        student.excludedFromExams?.includes(examKey) ||
        student.excludedFromExams?.includes(selectedExam)
      );

      if (isExcluded) {
        return {
          student,
          total: 0,
          pct: 0,
          grade: 'EXCLUDED',
          gradeBadgeClass: 'bg-red-50 text-red-600 border border-red-200',
          isExcluded: true,
        };
      }

      let total = 0;
      examSubjects.forEach(sub => {
        total += getScore(student, sub);
      });

      const maxTotal = examSubjects.length * 50;
      const pct = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : 0;

      let grade = 'Fail';
      let gradeBadgeClass = 'bg-[#ffdad6] text-[#ba1a1a]';
      if (pct >= 90) {
        grade = 'A+';
        gradeBadgeClass = 'bg-[#bdffdb] text-[#002113]';
      } else if (pct >= 80) {
        grade = 'A';
        gradeBadgeClass = 'bg-[#dbe1ff] text-[#00174b]';
      } else if (pct >= 70) {
        grade = 'B';
        gradeBadgeClass = 'bg-[#eaedff] text-[#131b2e]';
      } else if (pct >= 50) {
        grade = 'C';
        gradeBadgeClass = 'bg-[#f2f3ff] text-[#434655]';
      }

      return {
        student,
        total,
        pct,
        grade,
        gradeBadgeClass,
        isExcluded: false,
      };
    });
  }, [classStudents, examSubjects, examKey, selectedExam, editedMarksBuffer]);

  // Sort only non-excluded students by total descending to compute fair ranks
  const sortedByRank = useMemo(() => {
    return [...studentStats.filter(s => !s.isExcluded)].sort((a, b) => b.total - a.total);
  }, [studentStats]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedByRank.forEach((item, index) => {
      map.set(item.student.id, index + 1);
    });
    return map;
  }, [sortedByRank]);

  const topper = sortedByRank[0] || studentStats.find(s => !s.isExcluded);

  // Filtered view by active / excluded status
  const visibleStudentStats = useMemo(() => {
    if (examStatusFilter === 'active') return studentStats.filter(s => !s.isExcluded);
    if (examStatusFilter === 'excluded') return studentStats.filter(s => s.isExcluded);
    return studentStats;
  }, [studentStats, examStatusFilter]);

  const activeCount = studentStats.filter(s => !s.isExcluded).length;
  const excludedCount = studentStats.filter(s => s.isExcluded).length;

  // Filtered students for Report Card session (supporting Class filter & live Search)
  const reportFilteredStudents = useMemo(() => {
    let list = students;
    if (reportClassFilter !== 'ALL') {
      const targetGrade = reportClassFilter.replace(/^class\s*/i, '').trim().toLowerCase();
      list = list.filter(s => {
        const sGrade = s.gradeLevel ? s.gradeLevel.toLowerCase() : '';
        const sClass = s.classSec ? s.classSec.toLowerCase() : '';
        return sGrade === targetGrade || sClass === reportClassFilter.toLowerCase() || sClass.includes(targetGrade);
      });
    }
    if (searchStudentTerm.trim()) {
      const q = searchStudentTerm.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
    }
    return list;
  }, [students, reportClassFilter, searchStudentTerm]);

  const reportTargetStudent = useMemo(() => {
    if (activeStudentForReport && reportFilteredStudents.some(s => s.id === activeStudentForReport.id)) {
      return activeStudentForReport;
    }
    return reportFilteredStudents[0] || students[0];
  }, [activeStudentForReport, reportFilteredStudents, students]);

  const reportStats = (reportTargetStudent && studentStats.find(s => s.student.id === reportTargetStudent.id)) || {
    student: reportTargetStudent,
    total: 240,
    pct: 80,
    grade: 'A',
    gradeBadgeClass: 'bg-[#dbe1ff] text-[#00174b]',
  };
  const reportRank = reportTargetStudent ? (rankMap.get(reportTargetStudent.id) || 1) : 1;

  // Previous & Next navigation across reportFilteredStudents
  const currentStudentIdx = reportFilteredStudents.findIndex(s => s.id === reportTargetStudent?.id);
  const handlePrevStudent = () => {
    if (reportFilteredStudents.length <= 1) return;
    const newIdx = currentStudentIdx <= 0 ? reportFilteredStudents.length - 1 : currentStudentIdx - 1;
    setActiveStudentForReport(reportFilteredStudents[newIdx]);
  };
  const handleNextStudent = () => {
    if (reportFilteredStudents.length <= 1) return;
    const newIdx = currentStudentIdx >= reportFilteredStudents.length - 1 ? 0 : currentStudentIdx + 1;
    setActiveStudentForReport(reportFilteredStudents[newIdx]);
  };

  const handleScoreChange = (studentId: string, subjectName: string, value: string) => {
    const num = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
    const subKey = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bufferKey = `${studentId}_${examKey}_${subKey}`;
    setEditedMarksBuffer(prev => ({ ...prev, [bufferKey]: num }));
  };

  const handleSaveMarks = () => {
    Object.entries(editedMarksBuffer).forEach(([key, score]) => {
      const [studentId, examCode, subKey] = key.split('_');
      updateStudentCustomMark(studentId, examCode, subKey, score);
    });
    setEditedMarksBuffer({});
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
    showToast('All examination marks successfully saved and recalculated!', 'success');
  };

  const handleCreateNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamCode.trim()) {
      showToast('Please enter examination name and code', 'warning');
      return;
    }

    addCustomExam({
      id: `exam-${Date.now()}`,
      name: newExamName,
      code: newExamCode,
      maxMarksPerSubject: newExamMaxMarks,
    });

    setSelectedExam(newExamCode as any);
    setIsAddExamModalOpen(false);
    setNewExamName('');
    setNewExamCode('');
  };

  const handleCreateNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      showToast('Please enter subject title', 'warning');
      return;
    }
    addExamSubject(newSubjectName.trim());
    setIsAddSubjectModalOpen(false);
    setNewSubjectName('');
  };

  const handleOpenAddStudentModal = () => {
    setNewStudentName('');
    setNewStudentRoll(`DPS-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewStudentClass(selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Class 10-A'));
    setNewStudentSession(activeAcademicYear);
    setNewStudentAvatar(STUDENT_AVATAR_PRESETS[Math.floor(Math.random() * STUDENT_AVATAR_PRESETS.length)]);
    setNewStudentAttendance(96);
    setNewStudentRemarks(REMARK_PRESETS[0]);
    setNewParentName('');
    setNewParentPhone('');
    setNewParentWhatsApp('');
    const marksObj: { [subjectKey: string]: number } = {};
    examSubjects.forEach((sub, idx) => {
      const subKey = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
      marksObj[subKey] = 40 + (idx % 8);
    });
    setNewStudentInitialMarks(marksObj);
    setIsAddStudentModalOpen(true);
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRoll.trim()) {
      showToast('Please provide student name and roll number', 'warning');
      return;
    }

    const targetClassClean = newStudentClass;
    const targetGradeClean = targetClassClean.replace(/^Class\s*/i, '');
    const newStudentId = `std-${Date.now()}`;

    // Dynamic marks for all active subjects
    const dynamicExamMarks: { [key: string]: number } = {};
    examSubjects.forEach(sub => {
      const subKey = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
      dynamicExamMarks[subKey] = newStudentInitialMarks[subKey] !== undefined ? newStudentInitialMarks[subKey] : 42;
    });

    const newStudentObj: Student = {
      id: newStudentId,
      name: newStudentName.trim(),
      rollNo: newStudentRoll.trim(),
      classSec: targetClassClean,
      gradeLevel: targetGradeClean,
      parentName: newParentName.trim() || 'Parent/Guardian',
      parentRelation: 'Father',
      parentPhone: newParentPhone.trim() || '9876543210',
      parentWhatsApp: newParentWhatsApp.trim() || newParentPhone.trim() || '9876543210',
      attendancePct: newStudentAttendance,
      totalPresent: Math.round((newStudentAttendance / 100) * 25),
      totalWorkingDays: 25,
      todayStatus: 'P',
      avatarUrl: newStudentAvatar || STUDENT_AVATAR_PRESETS[0],
      academicYear: newStudentSession || activeAcademicYear,
      marks: {
        ut1: { math: 42, sci: 44, eng: 45 },
        ut2: { math: 44, sci: 46, eng: 45 },
        [examKey]: dynamicExamMarks,
      },
    };

    addStudent(newStudentObj);
    if (newStudentRemarks.trim()) {
      setCustomRemarksMap(prev => ({ ...prev, [newStudentId]: newStudentRemarks.trim() }));
    }
    setActiveStudentForReport(newStudentObj);
    if (selectedClass !== 'ALL' && selectedClass !== targetClassClean) {
      setSelectedClass(targetClassClean);
    }
    setActiveSubView('report');
    setIsAddStudentModalOpen(false);
    showToast(`Enrolled ${newStudentName} into ${targetClassClean} (${newStudentSession}) & generated Report Card!`, 'success');
  };

  // Open Edit Student Modal
  const handleOpenEditStudentModal = () => {
    if (!reportTargetStudent) return;
    setEditStudentData({
      name: reportTargetStudent.name,
      rollNo: reportTargetStudent.rollNo,
      classSec: reportTargetStudent.classSec,
      gradeLevel: reportTargetStudent.gradeLevel,
      parentName: reportTargetStudent.parentName,
      parentPhone: reportTargetStudent.parentPhone,
      parentWhatsApp: reportTargetStudent.parentWhatsApp,
      attendancePct: reportTargetStudent.attendancePct,
      avatarUrl: reportTargetStudent.avatarUrl,
      academicYear: reportTargetStudent.academicYear || activeAcademicYear,
    });
    setEditStudentRemark(
      customRemarksMap[reportTargetStudent.id] ||
      reportTargetStudent.note ||
      REMARK_PRESETS[0]
    );
    setIsEditStudentModalOpen(true);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetStudent || !editStudentData.name || !editStudentData.rollNo) {
      showToast('Name and Roll number are required', 'warning');
      return;
    }

    updateStudent(reportTargetStudent.id, {
      ...editStudentData,
      note: editStudentRemark.trim(),
    });

    if (editStudentRemark.trim()) {
      setCustomRemarksMap(prev => ({ ...prev, [reportTargetStudent.id]: editStudentRemark.trim() }));
    }

    // Refresh active student
    setActiveStudentForReport({
      ...reportTargetStudent,
      ...editStudentData,
      note: editStudentRemark.trim(),
    } as Student);

    setIsEditStudentModalOpen(false);
    showToast(`Updated student profile for ${editStudentData.name}!`, 'success');
  };

  const handleSendReportCardWhatsApp = (student: Student) => {
    const parentPhone = student.parentWhatsApp || student.parentPhone || '919876543210';
    const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `*OFFICIAL REPORT CARD - ${institution.name.toUpperCase()}*\n` +
      `Academic Session: *${student.academicYear || activeAcademicYear}*\n` +
      `Student: *${student.name}* (Roll #${student.rollNo})\n` +
      `Class: *${student.classSec}* | Exam: *${selectedExam}*\n` +
      `Aggregate: *${reportStats.total}/${examSubjects.length * 50} (${reportStats.pct}%)*\n` +
      `Grade: *${reportStats.grade}* | Class Rank: *#${reportRank}*\n` +
      `Attendance: *${student.attendancePct}%*\n` +
      `Remarks: "${customRemarksMap[student.id] || student.note || REMARK_PRESETS[0]}"\n` +
      `Principal: ${institution.principalName} (${institution.affiliationCode})\n\n` +
      `Downloaded official digitally signed report card via EduTrack Pro.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Breadcrumb & Term Context Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#004ac6] shrink-0" />
          <div>
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-[#131b2e]">Examinations & Grading Ledger</h2>
            <p className="text-[10px] sm:text-xs text-[#737686]">{institution.name} • {institution.boardName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              openDispatchModal({
                title: `${selectedExam} Terminal Ledger - ${selectedClass}`,
                reportCategory: 'marks-summary',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
                targetClass: selectedClass,
              })
            }
            className="h-9 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Push Master Ledger</span>
          </button>
        </div>
      </div>

      {/* Dynamic Exam Selector Strip with + Add Exam */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        {customExams.map(exam => {
          const isSelected = selectedExam === exam.code || selectedExam === exam.name;
          return (
            <button
              key={exam.id}
              onClick={() => {
                setSelectedExam(exam.code as any);
                showToast(`Switched active examination to ${exam.name}`);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-white text-[#434655] border border-[#dae2fd] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              <span>{exam.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsAddExamModalOpen(true)}
          className="px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-dashed border-[#004ac6]/40 flex items-center gap-1 shrink-0"
          type="button"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Exam</span>
        </button>
      </div>

      {/* Class & Subject Options Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Class Option (Universal Dropdown + Manage Classes) */}
          <div className="flex flex-col bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#004ac6]" />
                Class Option ({classes.length} Classes)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddStudentModal}
                  className="text-[10px] font-bold text-[#007d55] hover:underline"
                >
                  + Add Student
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(true)}
                  className="text-[10px] font-bold text-[#004ac6] hover:underline"
                >
                  + Add Class
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">All Enrolled Classes ({students.length} Students)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Option (Dynamic Subjects + Add Subject) */}
          <div className="flex flex-col bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#007d55]" />
                Subject Option ({examSubjects.length} Active)
              </span>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="text-[10px] font-bold text-[#007d55] hover:underline"
              >
                + Add Subject
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <select
                value={selectedSubjectScope}
                onChange={e => setSelectedSubjectScope(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="All">All Subjects ({examSubjects.length})</option>
                {examSubjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Buffer Button */}
          <div className="flex items-center justify-between bg-[#faf8ff] p-2.5 rounded-2xl border border-[#dae2fd] sm:col-span-2 lg:col-span-1">
            <div className="text-xs">
              <span className="text-[10px] text-[#737686] block">Unsaved Marks Buffer:</span>
              <strong className="text-[#131b2e]">{Object.keys(editedMarksBuffer).length} Edits Pending</strong>
            </div>
            <button
              type="button"
              onClick={handleSaveMarks}
              className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all ${
                Object.keys(editedMarksBuffer).length > 0 || isSavedRecently
                  ? 'bg-[#007d55] text-white'
                  : 'bg-[#f2f3ff] text-[#737686]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavedRecently ? 'Saved!' : 'Save All Marks'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segmented View Mode Controller */}
      <div className="bg-[#eaedff] p-1 rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setActiveSubView('marksheet')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'marksheet'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Table className="w-4 h-4 shrink-0" />
          <span>Marksheet Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubView('analytics')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'analytics'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>Analytics & Top Performers</span>
        </button>

        <button
          onClick={() => setActiveSubView('report')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'report'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Report Card Session</span>
          <span className="hidden md:inline-block px-1.5 py-0.5 bg-[#dbe1ff] text-[#00174b] text-[9px] font-bold rounded-full">
            Student Option
          </span>
        </button>
      </div>

      {/* VIEW 1: Marksheet Table */}
      {activeSubView === 'marksheet' && (
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs space-y-3">
          <div className="p-3 sm:p-4 border-b border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">
                  {selectedExam} Results Matrix — {selectedClass}
                </h3>
                <span className="text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff] px-2.5 py-0.5 rounded-full">
                  Max Marks: 50 / Subject
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#737686] mt-0.5">
                {activeCount} active participants • {excludedCount} excluded from this examination.
              </p>
            </div>

            {/* Filter: All / Active / Excluded */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f2f3ff] rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setExamStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  examStatusFilter === 'all'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#737686] hover:text-[#131b2e]'
                }`}
              >
                All ({studentStats.length})
              </button>
              <button
                type="button"
                onClick={() => setExamStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  examStatusFilter === 'active'
                    ? 'bg-white text-[#007d55] shadow-xs'
                    : 'text-[#737686] hover:text-[#131b2e]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setExamStatusFilter('excluded')}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  examStatusFilter === 'excluded'
                    ? 'bg-white text-[#ba1a1a] shadow-xs'
                    : 'text-[#737686] hover:text-[#131b2e]'
                }`}
              >
                Excluded ({excludedCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#faf8ff] border-b border-[#eaedff] text-[10px] uppercase font-bold text-[#737686]">
                  <th className="py-3 px-3 sticky left-0 bg-[#faf8ff] z-20">Roll & Student</th>
                  <th className="py-3 px-3">Class</th>
                  {activeSubjects.map(sub => (
                    <th key={sub} className="py-3 px-3 text-center">
                      {sub} (50)
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">%</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-3 text-center">Exam Status</th>
                  <th className="py-3 px-3 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {visibleStudentStats.length === 0 ? (
                  <tr>
                    <td colSpan={activeSubjects.length + 6} className="text-center py-8 text-[#737686]">
                      No students match the current exam filter.
                    </td>
                  </tr>
                ) : (
                  visibleStudentStats.map(({ student, total, pct, grade, gradeBadgeClass, isExcluded }) => {
                    const rank = rankMap.get(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${
                          isExcluded ? 'bg-red-50/30 text-gray-500' : 'hover:bg-[#f2f3ff]/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#dae2fd]"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-[#131b2e] block truncate max-w-[130px]">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-[#737686]">Roll #{student.rollNo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#434655]">{student.classSec}</td>

                        {/* Subject Marks Input Fields */}
                        {activeSubjects.map(sub => {
                          const currentScore = getScore(student, sub);
                          return (
                            <td key={sub} className="py-2.5 px-2 text-center">
                              {isExcluded ? (
                                <span className="text-[11px] text-gray-400 font-mono italic">Excl.</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={currentScore}
                                  onChange={e => handleScoreChange(student.id, sub, e.target.value)}
                                  className="w-14 h-8 text-center font-bold text-xs bg-[#f2f3ff] rounded-lg border border-[#dae2fd] focus:bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                                />
                              )}
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-3 text-center font-bold text-[#131b2e]">
                          {isExcluded ? '-' : total}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#004ac6]">
                          {isExcluded ? '-' : `${pct}%`}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeBadgeClass}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#131b2e]">
                          {isExcluded ? '-' : rank ? `#${rank}` : '-'}
                        </td>

                        {/* Exam Status & Remove/Restore Action */}
                        <td className="py-2.5 px-3 text-center">
                          {isExcluded ? (
                            <button
                              type="button"
                              onClick={() => {
                                restoreStudentToExam(student.id, examKey);
                                showToast(`${student.name} restored back to ${selectedExam}`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#bdffdb] text-[#002113] hover:bg-[#a6fcd0] rounded-lg text-[10px] font-bold transition-all active:scale-95"
                              title="Restore student back into this exam"
                            >
                              <UserPlus className="w-3 h-3 text-[#007d55]" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${student.name} from ${selectedExam}?`)) {
                                  removeStudentFromExam(student.id, examKey);
                                  showToast(`${student.name} excluded from ${selectedExam}`, 'warning');
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffdad6] text-[#93000a] hover:bg-[#ffc2bb] rounded-lg text-[10px] font-bold transition-all active:scale-95"
                              title="Exclude / Remove student from this exam"
                            >
                              <UserMinus className="w-3 h-3 text-[#ba1a1a]" />
                              <span>Remove</span>
                            </button>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudentForReport(student);
                              setActiveSubView('report');
                            }}
                            className="px-2.5 py-1 bg-[#004ac6] text-white rounded-lg text-[10px] font-bold active:scale-95"
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* VIEW 2: Analytics & Top Performers */}
      {activeSubView === 'analytics' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Class Topper Card */}
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#bdffdb] text-[#002113] flex items-center justify-center font-bold text-xl shrink-0">
                <Trophy className="w-6 h-6 text-[#007d55]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#007d55]">Valedictorian / Rank #1</span>
                <h4 className="text-sm font-bold text-[#131b2e] truncate">{topper?.student.name}</h4>
                <p className="text-xs text-[#737686]">
                  {topper?.total} Marks ({topper?.pct}%) • Grade {topper?.grade}
                </p>
              </div>
            </div>

            {/* Class Average */}
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center font-bold text-xl shrink-0">
                <TrendingUp className="w-6 h-6 text-[#004ac6]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#004ac6]">Class Average</span>
                <h4 className="text-sm font-bold text-[#131b2e]">
                  {studentStats.length > 0 ? (studentStats.reduce((a, b) => a + b.pct, 0) / studentStats.length).toFixed(1) : 0}%
                </h4>
                <p className="text-xs text-[#737686]">Across {examSubjects.length} subjects</p>
              </div>
            </div>

            {/* Total Assessed */}
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#131b2e] flex items-center justify-center font-bold text-xl shrink-0">
                <UserCheck className="w-6 h-6 text-[#131b2e]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">Total Assessed</span>
                <h4 className="text-sm font-bold text-[#131b2e]">{classStudents.length} Students</h4>
                <p className="text-xs text-[#737686]">100% Marksheets Generated</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: Report Card Session & Generator */}
      {activeSubView === 'report' && (
        <section className="space-y-4">
          {/* STUDENT OPTION COMMAND BAR */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs space-y-3">
            {/* Top Row: Academic Session, Class Option Filter, Search & Quick Action Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Academic Session Option */}
                <div className="flex items-center gap-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-xl border border-[#dae2fd]">
                  <Calendar className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                  <span className="text-[10px] font-bold text-[#737686] uppercase">Session:</span>
                  <select
                    value={activeAcademicYear}
                    onChange={e => {
                      setActiveAcademicYear(e.target.value);
                      showToast(`Switched Academic Session to ${e.target.value}`, 'info');
                    }}
                    className="bg-transparent text-xs font-bold text-[#004ac6] focus:outline-none cursor-pointer"
                  >
                    {academicSessions.map(sess => (
                      <option key={sess.id} value={sess.name}>
                        {sess.name} ({sess.status})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAcademicSessionModalOpen(true)}
                    className="text-[10px] text-[#004ac6] hover:underline font-bold"
                    title="Manage Academic Sessions"
                  >
                    Manage
                  </button>
                </div>

                {/* Class Option Filter */}
                <div className="flex items-center gap-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-xl border border-[#dae2fd]">
                  <Layers className="w-3.5 h-3.5 text-[#007d55] shrink-0" />
                  <span className="text-[10px] font-bold text-[#737686] uppercase">Class:</span>
                  <select
                    value={reportClassFilter}
                    onChange={e => setReportClassFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Classes ({students.length})</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Student Search Filter */}
                <div className="relative min-w-[170px] flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-[#737686] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student / roll..."
                    value={searchStudentTerm}
                    onChange={e => setSearchStudentTerm(e.target.value)}
                    className="w-full h-8.5 pl-8 pr-7 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] placeholder:text-[#737686] outline-none focus:bg-white"
                  />
                  {searchStudentTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchStudentTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons: Add Student Option, Edit Student Option, Print, WhatsApp */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenAddStudentModal}
                  className="h-8.5 px-3 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  title="Enroll new student and generate official report card"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Student Option</span>
                </button>

                {reportTargetStudent && (
                  <button
                    type="button"
                    onClick={handleOpenEditStudentModal}
                    className="h-8.5 px-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    title="Edit selected student profile, remarks and attendance"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Student</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => reportTargetStudent && handleSendReportCardWhatsApp(reportTargetStudent)}
                  className="h-8.5 px-2.5 bg-[#007d55] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
                  title="WhatsApp official report card to parent"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-8.5 px-2.5 bg-[#004ac6] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
                  title="Print or Save PDF Report Card"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Student Selector with Prev / Next Navigation and Quick Stats */}
            <div className="pt-2 border-t border-[#eaedff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Prev & Next Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevStudent}
                    disabled={reportFilteredStudents.length <= 1}
                    className="w-8 h-8 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] disabled:opacity-40 flex items-center justify-center text-[#131b2e] border border-[#dae2fd]"
                    title="Previous Student Report Card"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    disabled={reportFilteredStudents.length <= 1}
                    className="w-8 h-8 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] disabled:opacity-40 flex items-center justify-center text-[#131b2e] border border-[#dae2fd]"
                    title="Next Student Report Card"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-bold text-[#737686] px-1.5">
                    {reportFilteredStudents.length > 0 ? `${currentStudentIdx + 1} of ${reportFilteredStudents.length}` : '0 of 0'}
                  </span>
                </div>

                {/* Student Select Dropdown */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <select
                    value={reportTargetStudent?.id || ''}
                    onChange={e => {
                      const s = students.find(x => x.id === e.target.value);
                      if (s) setActiveStudentForReport(s);
                    }}
                    className="h-8.5 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#004ac6] border border-[#dae2fd] max-w-[280px] sm:max-w-[340px] truncate"
                  >
                    {reportFilteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        Roll #{s.rollNo} — {s.name} ({s.classSec})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Summary Pill for Selected Student */}
              {reportTargetStudent && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2 py-0.5 bg-[#bdffdb] text-[#002113] rounded-full text-[10px] font-bold">
                    Class Rank #{reportRank}
                  </span>
                  <span className="text-[11px] font-bold text-[#131b2e]">
                    Total: {reportStats.total}/{examSubjects.length * 50} ({reportStats.pct}%)
                  </span>
                  <span className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded-full text-[10px] font-bold">
                    Grade {reportStats.grade}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Official Report Card Printable Canvas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-lg max-w-4xl mx-auto space-y-6 text-left">
            {/* Report Card Header */}
            <div className="border-b-2 border-[#004ac6] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={institution.logoUrl}
                  alt={institution.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#dae2fd]"
                />
                <div>
                  <h1 className="text-xl font-extrabold text-[#131b2e] tracking-tight">{institution.name.toUpperCase()}</h1>
                  <p className="text-xs text-[#737686]">{institution.boardName} • Affiliation #{institution.affiliationCode}</p>
                  <p className="text-[11px] text-[#737686]">{institution.address}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="px-3 py-1 bg-[#004ac6] text-white font-bold text-xs rounded-xl uppercase">
                  Progress Report Card
                </span>
                <p className="text-xs font-bold text-[#004ac6] mt-1.5">
                  Academic Session: {reportTargetStudent?.academicYear || activeAcademicYear || institution.academicSession}
                </p>
                <p className="text-[10px] text-[#737686]">Exam: {selectedExam}</p>
              </div>
            </div>

            {/* Student Profile Strip with Student Photo & Edit Option */}
            <div className="bg-[#faf8ff] p-4 rounded-2xl border border-[#dae2fd] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group shrink-0">
                  <img
                    src={reportTargetStudent?.avatarUrl || STUDENT_AVATAR_PRESETS[0]}
                    alt={reportTargetStudent?.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#004ac6] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleOpenEditStudentModal}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#004ac6] text-white flex items-center justify-center shadow-xs hover:scale-105"
                    title="Change Student Photo / Details"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#131b2e] truncate">{reportTargetStudent?.name}</h3>
                    <button
                      type="button"
                      onClick={handleOpenEditStudentModal}
                      className="text-[#004ac6] hover:underline text-[10px] font-bold"
                    >
                      (Edit)
                    </button>
                  </div>
                  <p className="text-xs text-[#737686]">
                    Roll No: <strong className="text-[#131b2e]">#{reportTargetStudent?.rollNo}</strong> • Class: <strong className="text-[#131b2e]">{reportTargetStudent?.classSec}</strong>
                  </p>
                  <p className="text-xs text-[#737686]">
                    Parent: {reportTargetStudent?.parentName} ({reportTargetStudent?.parentRelation || 'Father'}) • Contact: {reportTargetStudent?.parentPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs w-full md:w-auto">
                <div className="bg-white p-2.5 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Class Rank</span>
                  <span className="font-extrabold text-base text-[#004ac6]">#{reportRank}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Attendance</span>
                  <span className="font-extrabold text-base text-[#007d55]">{reportTargetStudent?.attendancePct || 96}%</span>
                </div>
              </div>
            </div>

            {/* Subject Marks Breakdown Table */}
            <div className="overflow-hidden rounded-2xl border border-[#eaedff]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#131b2e] font-bold text-[11px] uppercase border-b border-[#eaedff]">
                    <th className="py-2.5 px-4">Subject Name</th>
                    <th className="py-2.5 px-4 text-center">Max Marks</th>
                    <th className="py-2.5 px-4 text-center">Pass Marks</th>
                    <th className="py-2.5 px-4 text-center">Marks Obtained</th>
                    <th className="py-2.5 px-4 text-center">Percentage</th>
                    <th className="py-2.5 px-4 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {examSubjects.map(sub => {
                    const score = reportTargetStudent ? getScore(reportTargetStudent, sub) : 45;
                    const subPct = (score / 50) * 100;
                    return (
                      <tr key={sub}>
                        <td className="py-2.5 px-4 font-bold text-[#131b2e]">{sub}</td>
                        <td className="py-2.5 px-4 text-center text-[#737686]">50</td>
                        <td className="py-2.5 px-4 text-center text-[#737686]">17</td>
                        <td className="py-2.5 px-4 text-center font-bold text-[#004ac6]">{score}</td>
                        <td className="py-2.5 px-4 text-center font-medium text-[#434655]">{subPct.toFixed(0)}%</td>
                        <td className="py-2.5 px-4 text-center font-bold text-[#007d55]">
                          {subPct >= 90 ? 'A1' : subPct >= 80 ? 'A2' : subPct >= 70 ? 'B1' : 'B2'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#faf8ff] font-bold border-t-2 border-[#dae2fd]">
                    <td className="py-3 px-4 text-sm text-[#131b2e]">Aggregate Total</td>
                    <td className="py-3 px-4 text-center text-sm">{examSubjects.length * 50}</td>
                    <td className="py-3 px-4 text-center text-sm">{examSubjects.length * 17}</td>
                    <td className="py-3 px-4 text-center text-sm text-[#004ac6]">{reportStats.total}</td>
                    <td className="py-3 px-4 text-center text-sm text-[#007d55]">{reportStats.pct}%</td>
                    <td className="py-3 px-4 text-center text-sm font-extrabold text-[#004ac6]">{reportStats.grade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Co-Scholastic & Discipline Assessment */}
            <div className="bg-[#faf8ff] p-3.5 rounded-2xl border border-[#eaedff] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] block">
                Co-Scholastic & Discipline Assessment
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd] text-center">
                  <span className="text-[10px] text-[#737686] block">Work Education</span>
                  <span className="font-bold text-[#007d55]">Grade A+</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd] text-center">
                  <span className="text-[10px] text-[#737686] block">Art & Culture</span>
                  <span className="font-bold text-[#007d55]">Grade A</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd] text-center">
                  <span className="text-[10px] text-[#737686] block">Health & Sports</span>
                  <span className="font-bold text-[#007d55]">Grade A+</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd] text-center">
                  <span className="text-[10px] text-[#737686] block">Discipline & Conduct</span>
                  <span className="font-bold text-[#007d55]">Grade A+</span>
                </div>
              </div>
            </div>

            {/* Remarks & Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#eaedff]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#737686]">Class Teacher Remarks:</span>
                  <button
                    type="button"
                    onClick={handleOpenEditStudentModal}
                    className="text-[10px] text-[#004ac6] hover:underline font-bold"
                  >
                    Edit Remarks
                  </button>
                </div>
                <p className="text-xs text-[#434655] italic bg-[#faf8ff] p-3 rounded-xl border border-[#dae2fd]">
                  "{customRemarksMap[reportTargetStudent?.id || ''] || reportTargetStudent?.note || REMARK_PRESETS[0]}"
                </p>
                {/* Quick remark templates */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[9px] font-bold text-[#737686]">Quick templates:</span>
                  {REMARK_PRESETS.slice(0, 2).map((rem, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (reportTargetStudent) {
                          setCustomRemarksMap(prev => ({ ...prev, [reportTargetStudent.id]: rem }));
                          showToast('Teacher remark updated!', 'info');
                        }
                      }}
                      className="text-[9px] px-2 py-0.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-full border border-[#dae2fd]"
                    >
                      Template {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end justify-end">
                <div className="text-center">
                  <div className="w-36 h-10 border-b border-dashed border-[#737686] mb-1 flex items-center justify-center">
                    <span className="text-xs font-serif italic text-[#004ac6]">{institution.principalName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#737686] uppercase block">
                    {institution.principalDesignation} Signature & Stamp
                  </span>
                  <span className="text-[9px] text-[#737686]">Affiliation: #{institution.affiliationCode}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Exam Modal */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#eaedff] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-base text-[#131b2e]">Create New Examination</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExamModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewExam} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Exam Name</label>
                <input
                  type="text"
                  required
                  value={newExamName}
                  onChange={e => setNewExamName(e.target.value)}
                  placeholder="e.g. Unit Test 3, Pre-Board Exam, Semester 1"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Code / Abbreviation</label>
                  <input
                    type="text"
                    required
                    value={newExamCode}
                    onChange={e => setNewExamCode(e.target.value)}
                    placeholder="e.g. UT-3, PRE-BOARD"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold text-[#004ac6] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Max Marks / Subject</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={200}
                    value={newExamMaxMarks}
                    onChange={e => setNewExamMaxMarks(parseInt(e.target.value, 10) || 50)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#004ac6] text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#eaedff] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#007d55]" />
                <h3 className="font-bold text-base text-[#131b2e]">Add Subject to Examination</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSubject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Subject Title</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Computer Science, Physics, Chemistry, Hindi"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#007d55] text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student to Examination & Report Card Session Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Add Student to Report Card Session</h3>
                  <p className="text-xs text-white/80">Enroll student into academic session, configure marks & report card</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStudent} className="p-4 sm:p-5 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              {/* Academic Session Selector & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Academic Session *</label>
                  <select
                    value={newStudentSession}
                    onChange={e => setNewStudentSession(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#004ac6] focus:bg-white outline-none"
                  >
                    {academicSessions.map(sess => (
                      <option key={sess.id} value={sess.name}>
                        {sess.name} ({sess.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Assigned Class *</label>
                  <select
                    value={newStudentClass}
                    onChange={e => setNewStudentClass(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Name & Roll Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold uppercase text-[10px] text-[#737686]">Roll Number *</label>
                    <button
                      type="button"
                      onClick={() => setNewStudentRoll(`DPS-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] font-bold text-[#004ac6] hover:underline"
                    >
                      Auto-Gen Roll
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newStudentRoll}
                    onChange={e => setNewStudentRoll(e.target.value)}
                    placeholder="DPS-1024"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Student Photo & Camera Studio */}
              <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-[10px] text-[#737686] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#004ac6]" />
                    Student Photo & Profile Picture
                  </label>
                  <span className="text-[10px] text-[#004ac6] font-semibold">Camera, Upload or Presets</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Photo Preview with quick snap button */}
                  <div className="relative group shrink-0">
                    <img
                      src={newStudentAvatar}
                      alt="Student Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#004ac6] shadow-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddStudentCameraOpen(true)}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#004ac6] hover:bg-[#003899] text-white flex items-center justify-center shadow active:scale-95 transition-all"
                      title="Take Photo with Camera"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Camera Snap & Upload Actions */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddStudentCameraOpen(true)}
                        className="flex-1 h-8 px-2.5 bg-gradient-to-r from-[#004ac6] to-[#007d55] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                      </button>

                      <label className="flex-1 h-8 px-2.5 bg-white hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setNewStudentAvatar(reader.result);
                                  showToast('Student photo uploaded!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const rand = STUDENT_AVATAR_PRESETS[Math.floor(Math.random() * STUDENT_AVATAR_PRESETS.length)];
                          setNewStudentAvatar(rand);
                        }}
                        className="h-8 px-2.5 bg-white hover:bg-[#eaedff] text-[#434655] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1"
                        title="Random Avatar"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {STUDENT_AVATAR_PRESETS.map((url, idx) => {
                        const isSelected = newStudentAvatar === url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewStudentAvatar(url)}
                            className={`relative rounded-lg p-0.5 transition-all shrink-0 ${
                              isSelected ? 'ring-2 ring-[#004ac6] scale-105' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${idx + 1}`} className="w-7 h-7 rounded-md object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Details & Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={newParentName}
                    onChange={e => setNewParentName(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent WhatsApp / Phone</label>
                  <input
                    type="tel"
                    value={newParentPhone}
                    onChange={e => {
                      setNewParentPhone(e.target.value);
                      setNewParentWhatsApp(e.target.value);
                    }}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Attendance Percentage</label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={newStudentAttendance}
                    onChange={e => setNewStudentAttendance(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#007d55] text-center focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Subject Marks for Current Exam with live calculation */}
              <div className="pt-2 border-t border-[#eaedff]">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">
                    Subject Marks for {selectedExam} (Max 50)
                  </label>
                  <span className="text-[10px] text-[#004ac6] font-semibold">Pre-filled with passing scores</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {examSubjects.map(sub => {
                    const subKey = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const currentVal = newStudentInitialMarks[subKey] !== undefined ? newStudentInitialMarks[subKey] : 42;
                    return (
                      <div key={sub} className="bg-[#f2f3ff] p-2 rounded-xl border border-[#dae2fd]">
                        <span className="text-[10px] font-bold text-[#131b2e] block truncate mb-1">{sub}</span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={currentVal}
                          onChange={e => {
                            const val = Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0));
                            setNewStudentInitialMarks(prev => ({ ...prev, [subKey]: val }));
                          }}
                          className="w-full h-8 px-2 bg-white rounded-lg border border-[#dae2fd] text-center font-bold text-xs outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Remarks for Report Card */}
              <div className="pt-2 border-t border-[#eaedff]">
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                  Class Teacher Remark on Report Card
                </label>
                <textarea
                  rows={2}
                  value={newStudentRemarks}
                  onChange={e => setNewStudentRemarks(e.target.value)}
                  placeholder="Enter remarks about student's performance..."
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs text-[#131b2e] focus:bg-white outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[9px] font-bold text-[#737686]">Suggestions:</span>
                  {REMARK_PRESETS.map((rem, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewStudentRemarks(rem)}
                      className="text-[9px] px-2 py-0.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-full border border-[#dae2fd]"
                    >
                      {idx === 0 ? 'Exemplary' : idx === 1 ? 'Analytical' : idx === 2 ? 'Hardworking' : 'Attentive'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enroll & Generate Report Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Details & Report Card Modal */}
      {isEditStudentModalOpen && reportTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Edit Student Profile & Report Card</h3>
                  <p className="text-xs text-white/80">{reportTargetStudent.name} (Roll #{reportTargetStudent.rollNo})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="p-4 sm:p-5 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentData.name || ''}
                    onChange={e => setEditStudentData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={editStudentData.rollNo || ''}
                    onChange={e => setEditStudentData(prev => ({ ...prev, rollNo: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Class & Academic Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Assigned Class</label>
                  <select
                    value={editStudentData.classSec || classes[0]?.name}
                    onChange={e => setEditStudentData(prev => ({
                      ...prev,
                      classSec: e.target.value,
                      gradeLevel: e.target.value.replace(/^Class\s*/i, ''),
                    }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Academic Session</label>
                  <select
                    value={editStudentData.academicYear || activeAcademicYear}
                    onChange={e => setEditStudentData(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#004ac6] focus:bg-white outline-none"
                  >
                    {academicSessions.map(sess => (
                      <option key={sess.id} value={sess.name}>
                        {sess.name} ({sess.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Photo & Camera Studio */}
              <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-[10px] text-[#737686] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#004ac6]" />
                    Student Photo & Profile Picture
                  </label>
                  <span className="text-[10px] text-[#004ac6] font-semibold">Camera, Upload or Presets</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Photo Preview with quick snap button */}
                  <div className="relative group shrink-0">
                    <img
                      src={editStudentData.avatarUrl || STUDENT_AVATAR_PRESETS[0]}
                      alt="Student Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#004ac6] shadow-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditStudentCameraOpen(true)}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#004ac6] hover:bg-[#003899] text-white flex items-center justify-center shadow active:scale-95 transition-all"
                      title="Take Photo with Camera"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Camera Snap & Upload Actions */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditStudentCameraOpen(true)}
                        className="flex-1 h-8 px-2.5 bg-gradient-to-r from-[#004ac6] to-[#007d55] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera</span>
                      </button>

                      <label className="flex-1 h-8 px-2.5 bg-white hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setEditStudentData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                                  showToast('Student photo updated!');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const rand = STUDENT_AVATAR_PRESETS[Math.floor(Math.random() * STUDENT_AVATAR_PRESETS.length)];
                          setEditStudentData(prev => ({ ...prev, avatarUrl: rand }));
                        }}
                        className="h-8 px-2.5 bg-white hover:bg-[#eaedff] text-[#434655] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1"
                        title="Random Avatar"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {STUDENT_AVATAR_PRESETS.map((url, idx) => {
                        const isSelected = editStudentData.avatarUrl === url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditStudentData(prev => ({ ...prev, avatarUrl: url }))}
                            className={`relative rounded-lg p-0.5 transition-all shrink-0 ${
                              isSelected ? 'ring-2 ring-[#004ac6] scale-105' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Preset ${idx + 1}`} className="w-7 h-7 rounded-md object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Details & Attendance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={editStudentData.parentName || ''}
                    onChange={e => setEditStudentData(prev => ({ ...prev, parentName: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={editStudentData.parentPhone || ''}
                    onChange={e => setEditStudentData(prev => ({
                      ...prev,
                      parentPhone: e.target.value,
                      parentWhatsApp: e.target.value,
                    }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Attendance %</label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={editStudentData.attendancePct || 96}
                    onChange={e => setEditStudentData(prev => ({ ...prev, attendancePct: parseInt(e.target.value, 10) || 96 }))}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#007d55] text-center focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Class Teacher Remark */}
              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                  Report Card Class Teacher Remarks
                </label>
                <textarea
                  rows={2}
                  value={editStudentRemark}
                  onChange={e => setEditStudentRemark(e.target.value)}
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs text-[#131b2e] focus:bg-white outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[9px] font-bold text-[#737686]">Templates:</span>
                  {REMARK_PRESETS.map((rem, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditStudentRemark(rem)}
                      className="text-[9px] px-2 py-0.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-full border border-[#dae2fd]"
                    >
                      {idx === 0 ? 'Exemplary' : idx === 1 ? 'Analytical' : idx === 2 ? 'Hardworking' : 'Attentive'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Student Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Camera Modal */}
      <CameraCaptureModal
        isOpen={isAddStudentCameraOpen}
        onClose={() => setIsAddStudentCameraOpen(false)}
        onCapture={(photoDataUrl) => {
          setNewStudentAvatar(photoDataUrl);
          showToast('Student photo captured via camera!');
        }}
        title={`Camera: ${newStudentName || 'New Student Photo'}`}
        subtitle={`${newStudentClass} • Roll #${newStudentRoll || 'TBD'}`}
      />

      {/* Edit Student Camera Modal */}
      <CameraCaptureModal
        isOpen={isEditStudentCameraOpen}
        onClose={() => setIsEditStudentCameraOpen(false)}
        onCapture={(photoDataUrl) => {
          setEditStudentData((prev) => ({ ...prev, avatarUrl: photoDataUrl }));
          showToast('Student photo captured via camera!');
        }}
        title={`Camera: ${editStudentData.name || 'Edit Student Photo'}`}
        subtitle={`${editStudentData.classSec || 'Class'} • Roll #${editStudentData.rollNo || 'N/A'}`}
      />
    </div>
  );
};
