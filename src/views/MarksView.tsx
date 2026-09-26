import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
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
} from 'lucide-react';

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
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'marksheet' | 'analytics' | 'report'>('marksheet');
  const [selectedSubjectScope, setSelectedSubjectScope] = useState<string>('All');
  
  // Custom Exam & Subject Modal States
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamMaxMarks, setNewExamMaxMarks] = useState<number>(100);

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

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

  // Compute student aggregates
  const studentStats = useMemo(() => {
    return classStudents.map(student => {
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
      };
    });
  }, [classStudents, examSubjects, examKey, editedMarksBuffer]);

  // Sort by total descending to compute ranks
  const sortedByRank = useMemo(() => {
    return [...studentStats].sort((a, b) => b.total - a.total);
  }, [studentStats]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedByRank.forEach((item, index) => {
      map.set(item.student.id, index + 1);
    });
    return map;
  }, [sortedByRank]);

  const topper = sortedByRank[0] || studentStats[0];

  const reportTargetStudent = activeStudentForReport || topper?.student || students[0];
  const reportStats = (reportTargetStudent && studentStats.find(s => s.student.id === reportTargetStudent.id)) || {
    student: reportTargetStudent,
    total: 240,
    pct: 80,
    grade: 'A',
    gradeBadgeClass: 'bg-[#dbe1ff] text-[#00174b]',
  };
  const reportRank = reportTargetStudent ? (rankMap.get(reportTargetStudent.id) || 1) : 1;

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

  const handleSendReportCardWhatsApp = (student: Student) => {
    const parentPhone = student.parentWhatsApp || student.parentPhone || '919876543210';
    const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `*OFFICIAL REPORT CARD - ${institution.name.toUpperCase()}*\n` +
      `Student: *${student.name}* (Roll #${student.rollNo})\n` +
      `Class: *${student.classSec}* | Exam: *${selectedExam}*\n` +
      `Aggregate: *${reportStats.total}/${examSubjects.length * 50} (${reportStats.pct}%)*\n` +
      `Grade: *${reportStats.grade}* | Class Rank: *#${reportRank}*\n` +
      `Attendance: *${student.attendancePct}%*\n` +
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
                  onClick={() => {
                    setActiveTab('students');
                    showToast(`Navigate to Students directory to add student for ${selectedClass}`);
                  }}
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
          <span>Report Card Generator</span>
        </button>
      </div>

      {/* VIEW 1: Marksheet Table */}
      {activeSubView === 'marksheet' && (
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs space-y-3">
          <div className="p-3 sm:p-4 border-b border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">
                {selectedExam} Results Matrix — {selectedClass}
              </h3>
              <p className="text-[10px] sm:text-xs text-[#737686]">
                Editing {classStudents.length} student scores across {activeSubjects.length} subjects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff] px-2.5 py-1 rounded-full">
                Max Marks: 50 / Subject
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faf8ff] border-b border-[#eaedff] text-[10px] uppercase font-bold text-[#737686]">
                  <th className="py-3 px-3">Roll & Student</th>
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
                  <th className="py-3 px-3 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                {studentStats.map(({ student, total, pct, grade, gradeBadgeClass }) => {
                  const rank = rankMap.get(student.id) || 1;
                  return (
                    <tr key={student.id} className="hover:bg-[#f2f3ff]/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#dae2fd]"
                          />
                          <div>
                            <span className="font-bold text-[#131b2e] block">{student.name}</span>
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
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={currentScore}
                              onChange={e => handleScoreChange(student.id, sub, e.target.value)}
                              className="w-14 h-8 text-center font-bold text-xs bg-[#f2f3ff] rounded-lg border border-[#dae2fd] focus:bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
                            />
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-center font-bold text-[#131b2e]">{total}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#004ac6]">{pct}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeBadgeClass}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#131b2e]">#{rank}</td>
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
                })}
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

      {/* VIEW 3: Report Card Generator */}
      {activeSubView === 'report' && (
        <section className="space-y-4">
          {/* Student Selector Ribbon */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#737686]">Select Student for Report Card:</span>
              <select
                value={reportTargetStudent?.id || ''}
                onChange={e => {
                  const s = students.find(x => x.id === e.target.value);
                  if (s) setActiveStudentForReport(s);
                }}
                className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#004ac6] border border-[#dae2fd]"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    Roll #{s.rollNo} — {s.name} ({s.classSec})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('students');
                  showToast(`Navigate to Students directory to add student for class "${selectedClass}"`);
                }}
                className="h-9 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                title={`Add student to class ${selectedClass}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Student to {selectedClass === 'ALL' ? 'Institution' : selectedClass}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => reportTargetStudent && handleSendReportCardWhatsApp(reportTargetStudent)}
                className="h-9 px-3 bg-[#007d55] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Parent</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="h-9 px-3 bg-[#004ac6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Official Report Card Printable Canvas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedff] shadow-lg max-w-4xl mx-auto space-y-6 text-left">
            {/* Report Card Header */}
            <div className="border-b-2 border-[#004ac6] pb-4 flex items-center justify-between gap-4">
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
              <div className="text-right">
                <span className="px-3 py-1 bg-[#004ac6] text-white font-bold text-xs rounded-xl uppercase">
                  Progress Report Card
                </span>
                <p className="text-[10px] text-[#737686] mt-1">Session: {institution.academicSession}</p>
              </div>
            </div>

            {/* Student Profile Strip with Student Photo */}
            <div className="bg-[#faf8ff] p-4 rounded-2xl border border-[#dae2fd] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={reportTargetStudent?.avatarUrl}
                  alt={reportTargetStudent?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#004ac6] shadow-sm"
                />
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-[#131b2e]">{reportTargetStudent?.name}</h3>
                  <p className="text-xs text-[#737686]">
                    Roll No: <strong className="text-[#131b2e]">#{reportTargetStudent?.rollNo}</strong> • Class: <strong className="text-[#131b2e]">{reportTargetStudent?.classSec}</strong>
                  </p>
                  <p className="text-xs text-[#737686]">
                    Parent: {reportTargetStudent?.parentName} ({reportTargetStudent?.parentRelation}) • Contact: {reportTargetStudent?.parentPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Class Rank</span>
                  <span className="font-extrabold text-base text-[#004ac6]">#{reportRank}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Attendance</span>
                  <span className="font-extrabold text-base text-[#007d55]">{reportTargetStudent?.attendancePct}%</span>
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

            {/* Remarks & Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#eaedff]">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#737686] block mb-1">Class Teacher Remarks:</span>
                <p className="text-xs text-[#434655] italic bg-[#faf8ff] p-3 rounded-xl border border-[#dae2fd]">
                  "{reportTargetStudent?.name} exhibits exceptional analytical diligence and leadership in classroom discussions."
                </p>
              </div>

              <div className="flex flex-col items-end justify-end">
                <div className="text-center">
                  <div className="w-32 h-10 border-b border-dashed border-[#737686] mb-1 flex items-center justify-center">
                    <span className="text-xs font-serif italic text-[#004ac6]">{institution.principalName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#737686] uppercase">
                    {institution.principalDesignation} Signature & Official Stamp
                  </span>
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
    </div>
  );
};
