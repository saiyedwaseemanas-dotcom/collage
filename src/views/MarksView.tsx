import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';

export const MarksView: React.FC = () => {
  const {
    students,
    selectedClass,
    setSelectedClass,
    selectedExam,
    setSelectedExam,
    updateStudentMark,
    saveAllMarks,
    showToast,
    activeStudentForReport,
    setActiveStudentForReport,
    institution,
    openDispatchModal,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'marksheet' | 'analytics' | 'report'>('marksheet');
  const [selectedSubjectScope, setSelectedSubjectScope] = useState<'All' | 'Math' | 'Sci' | 'Eng'>('All');

  const classGradeKey = selectedClass.replace('Class ', '');
  const classStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.gradeLevel === classGradeKey);

  // Compute total, percentage, grade, rank for each student
  const studentStats = classStudents.map(student => {
    const marks = student.marks.ut2;
    const total = marks.math + marks.sci + marks.eng;
    const pct = parseFloat(((total / 150) * 100).toFixed(1));

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

  // Sort by percentage descending to compute ranks
  const sortedByRank = [...studentStats].sort((a, b) => b.total - a.total);
  const rankMap = new Map<string, number>();
  sortedByRank.forEach((item, index) => {
    rankMap.set(item.student.id, index + 1);
  });

  // Valedictorian / Topper
  const topper = sortedByRank[0] || studentStats[0];

  // Averages
  const avgPct = studentStats.length > 0 ? studentStats.reduce((acc, curr) => acc + curr.pct, 0) / studentStats.length : 0;
  const mathAvg = studentStats.length > 0 ? studentStats.reduce((acc, curr) => acc + curr.student.marks.ut2.math, 0) / studentStats.length : 0;
  const sciAvg = studentStats.length > 0 ? studentStats.reduce((acc, curr) => acc + curr.student.marks.ut2.sci, 0) / studentStats.length : 0;
  const engAvg = studentStats.length > 0 ? studentStats.reduce((acc, curr) => acc + curr.student.marks.ut2.eng, 0) / studentStats.length : 0;

  const reportTargetStudent = activeStudentForReport || topper?.student || students[0];
  const reportStats = (reportTargetStudent && studentStats.find(s => s.student.id === reportTargetStudent.id)) || {
    student: reportTargetStudent,
    total: reportTargetStudent ? (reportTargetStudent.marks.ut2.math + reportTargetStudent.marks.ut2.sci + reportTargetStudent.marks.ut2.eng) : 120,
    pct: reportTargetStudent ? parseFloat((((reportTargetStudent.marks.ut2.math + reportTargetStudent.marks.ut2.sci + reportTargetStudent.marks.ut2.eng) / 150) * 100).toFixed(1)) : 80,
    grade: 'A',
    gradeBadgeClass: 'bg-[#dbe1ff] text-[#00174b]',
  };
  const reportRank = reportTargetStudent ? (rankMap.get(reportTargetStudent.id) || 1) : 1;

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
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
            className="w-full sm:w-auto h-9 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Push Master Ledger (PDF/WA)</span>
          </button>
        </div>
      </div>

      {/* Exam Selection Horizontal Scroll Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        {(['UT-1', 'UT-2', 'Mid-Term', 'Final'] as const).map(exam => {
          const isSelected = selectedExam === exam;
          return (
            <button
              key={exam}
              onClick={() => {
                setSelectedExam(exam);
                showToast(`Switched active view to ${exam} examination`);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-white text-[#434655] border border-[#dae2fd] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              <span>{exam === 'UT-1' ? 'Unit Test 1' : exam === 'UT-2' ? 'Unit Test 2' : exam === 'Mid-Term' ? 'Mid-Term Exam' : 'Final Exam'}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Configuration Strip */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Class Selector */}
          <div className="flex flex-col bg-[#f2f3ff] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-[#dae2fd]/50">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#737686]">Class & Section</span>
            <div className="flex items-center justify-between mt-0.5">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer w-full"
              >
                <option value="Class 10-A">Class 10-A</option>
                <option value="Class 10-B">Class 10-B</option>
                <option value="Class 9-A">Class 9-A</option>
                <option value="Class 11-Sci">Class 11-Sci</option>
                <option value="Class 12-Sci">Class 12-Sci</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#737686] shrink-0" />
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex flex-col bg-[#f2f3ff] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-[#dae2fd]/50">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#737686]">Subject Scope</span>
            <div className="flex items-center justify-between mt-0.5">
              <select
                value={selectedSubjectScope}
                onChange={e => setSelectedSubjectScope(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer w-full truncate"
              >
                <option value="All">All Subjects (3)</option>
                <option value="Math">Mathematics</option>
                <option value="Sci">Science</option>
                <option value="Eng">English</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#737686] shrink-0" />
            </div>
          </div>
        </div>

        {/* Max Marks & Grading Scheme Tagline */}
        <div className="flex items-center justify-between px-1 pt-0.5">
          <div className="flex items-center gap-1.5 text-[#737686]">
            <Info className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
            <span className="text-[10px] sm:text-xs truncate">
              Max: <strong className="text-[#131b2e]">50/Sub</strong> (Total: 150)
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded-full text-[9px] sm:text-[10px] font-bold shrink-0">
            Scale: A+ (≥90%)
          </span>
        </div>
      </div>

      {/* Segmented View Mode Controller */}
      <div className="bg-[#eaedff] p-1 rounded-xl sm:rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setActiveSubView('marksheet')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'marksheet'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Table className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Marksheet</span>
        </button>

        <button
          onClick={() => setActiveSubView('analytics')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'analytics'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubView('report')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 ${
            activeSubView === 'report'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Report Card</span>
        </button>
      </div>

      {/* VIEW 1: Marksheet Table */}
      {activeSubView === 'marksheet' && (
        <section className="space-y-3 flex flex-col">
          {/* Quick Actions Banner */}
          <div className="flex items-center justify-between bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0 font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#131b2e] truncate">Auto-Calculation Engine</span>
                <span className="text-[10px] sm:text-[11px] text-[#737686] truncate">Updates total, % & rank dynamically</span>
              </div>
            </div>
            <button
              onClick={saveAllMarks}
              className="px-3 sm:px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] rounded-xl text-white text-xs font-bold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5 shrink-0"
              type="button"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Marks</span>
            </button>
          </div>

          {/* Interactive Table Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#737686] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b border-[#dae2fd]">
                    <th className="py-2.5 sm:py-3 px-2.5 sm:px-3">Roll</th>
                    <th className="py-2.5 sm:py-3 px-2 sm:px-3 min-w-[120px] sm:min-w-[140px]">Student</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">Math</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">Sci</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">Eng</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">Total</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">%</th>
                    <th className="py-2.5 sm:py-3 px-1 text-center">Grade</th>
                    <th className="py-2.5 sm:py-3 px-2 text-center">Rank</th>
                    <th className="py-2.5 sm:py-3 px-1.5 text-center">Push</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#f2f3ff]">
                  {studentStats.map(({ student, total, pct, grade, gradeBadgeClass }) => {
                    const rank = rankMap.get(student.id) || 1;
                    const isRank1 = rank === 1;

                    return (
                      <tr key={student.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                        <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 font-mono font-bold text-[#004ac6]">{student.rollNo}</td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3 min-w-[120px] sm:min-w-[140px]">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setActiveStudentForReport(student);
                              setActiveSubView('report');
                            }}
                          >
                            <img
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 ring-1 ring-[#004ac6]/20"
                              src={student.avatarUrl}
                              alt={student.name}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-[#131b2e] leading-snug truncate hover:text-[#004ac6]">
                                {student.name}
                              </span>
                              {isRank1 ? (
                                <span className="text-[9px] sm:text-[10px] text-[#007d55] font-bold flex items-center gap-0.5">
                                  <Trophy className="w-2.5 h-2.5" /> Rank #1
                                </span>
                              ) : (
                                <span className="text-[9px] sm:text-[10px] text-[#737686]">{student.classSec}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Math Input */}
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.math}
                            onChange={e => updateStudentMark(student.id, 'math', parseInt(e.target.value) || 0)}
                            className="w-11 sm:w-12 h-8 sm:h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-xs text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Sci Input */}
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.sci}
                            onChange={e => updateStudentMark(student.id, 'sci', parseInt(e.target.value) || 0)}
                            className="w-11 sm:w-12 h-8 sm:h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-xs text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Eng Input */}
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.eng}
                            onChange={e => updateStudentMark(student.id, 'eng', parseInt(e.target.value) || 0)}
                            className="w-11 sm:w-12 h-8 sm:h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-xs text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Total */}
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-bold text-xs text-[#131b2e]">{total}</td>

                        {/* Pct */}
                        <td className="py-1.5 sm:py-2 px-1 text-center font-mono font-bold text-xs text-[#004ac6]">{pct}%</td>

                        {/* Grade */}
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] ${gradeBadgeClass}`}>
                            {grade}
                          </span>
                        </td>

                        {/* Rank */}
                        <td className="py-1.5 sm:py-2 px-1.5 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[11px] font-bold shadow-xs ${
                              isRank1 ? 'bg-[#e1e0ff] text-[#4648d4] ring-2 ring-[#4648d4]' : 'bg-[#f2f3ff] text-[#131b2e]'
                            }`}
                          >
                            {rank}
                          </div>
                        </td>

                        {/* Push Action */}
                        <td className="py-1.5 sm:py-2 px-1 text-center">
                          <button
                            onClick={() =>
                              openDispatchModal({
                                title: `Report Card: ${student.name}`,
                                reportCategory: 'student-report',
                                defaultFormat: 'pdf',
                                defaultRecipientType: 'parent',
                                targetStudent: student,
                              })
                            }
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#007d55] hover:bg-[#006644] text-white inline-flex items-center justify-center shadow-xs active:scale-95 transition-all"
                            title="Push Report Card to Parents (WhatsApp/PDF)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Guidance Footer */}
            <div className="bg-[#f2f3ff] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[#737686] text-[10px] sm:text-[11px] border-t border-[#dae2fd]">
              <span className="flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-[#007d55]" />
                Formula active: Marks ÷ 150 × 100
              </span>
              <span className="font-mono">{studentStats.length} Records</span>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: Analytics */}
      {activeSubView === 'analytics' && (
        <section className="space-y-3 sm:space-y-4">
          {/* Topper Spotlight Banner */}
          <div className="bg-gradient-to-r from-[#004ac6] to-[#4648d4] p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-xs relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1 sm:space-y-1.5">
                <span className="px-2.5 py-0.5 bg-[#6ffbbe] text-[#002113] rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                  Class Valedictorian
                </span>
                <h2 className="text-lg sm:text-2xl font-bold">{topper?.student.name}</h2>
                <p className="text-[11px] sm:text-xs text-white/80 font-medium">
                  Rank #1 • {topper?.pct}% Overall ({topper?.total} / 150)
                </p>
              </div>
              <div className="relative shrink-0">
                <img
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg ring-3 ring-[#6ffbbe]"
                  src={topper?.student.avatarUrl}
                  alt={topper?.student.name}
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#6063ee] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow">
                  #1
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Bento */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
              <TrendingUp className="w-5 h-5 text-[#004ac6] mb-1" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-[#737686]">Average</span>
              <span className="text-base sm:text-lg font-bold text-[#131b2e] mt-0.5 font-mono">{avgPct.toFixed(1)}%</span>
              <span className="text-[10px] sm:text-[11px] text-[#007d55] font-semibold flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" /> +3.4%
              </span>
            </div>

            <div className="bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
              <Trophy className="w-5 h-5 text-[#4648d4] mb-1" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-[#737686]">Highest</span>
              <span className="text-base sm:text-lg font-bold text-[#131b2e] mt-0.5 font-mono">{topper?.pct}%</span>
              <span className="text-[9px] sm:text-[10px] text-[#737686] truncate max-w-[80px]">{topper?.student.name}</span>
            </div>

            <div className="bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] flex flex-col items-center text-center">
              <CheckCircle2 className="w-5 h-5 text-[#007d55] mb-1" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-[#737686]">Passing</span>
              <span className="text-base sm:text-lg font-bold text-[#131b2e] mt-0.5 font-mono">100%</span>
              <span className="text-[9px] sm:text-[10px] text-[#007d55] font-bold">All Cleared</span>
            </div>
          </div>

          {/* Subject Performance Breakdown */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">Subject Averages</h3>
              <span className="text-[10px] sm:text-xs text-[#737686]">Out of 50 Marks</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#131b2e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span> Mathematics
                  </span>
                  <span className="font-mono">
                    {mathAvg.toFixed(1)} / 50 ({((mathAvg / 50) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#004ac6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(mathAvg / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#131b2e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007d55]"></span> Science
                  </span>
                  <span className="font-mono">
                    {sciAvg.toFixed(1)} / 50 ({((sciAvg / 50) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#007d55] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(sciAvg / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#131b2e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4648d4]"></span> English
                  </span>
                  <span className="font-mono">
                    {engAvg.toFixed(1)} / 50 ({((engAvg / 50) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#eaedff] h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4648d4] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(engAvg / 50) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: Report Card Preview */}
      {activeSubView === 'report' && (
        <section className="space-y-3 sm:space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs p-3.5 sm:p-5 space-y-3 sm:space-y-4 border border-[#eaedff]">
            {/* Dynamic Institution Header */}
            <div className="flex items-center justify-between pb-2.5 bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#dae2fd]/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={institution.logoUrl}
                  alt={institution.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#dae2fd] shadow-xs shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[#131b2e] truncate">{institution.name}</span>
                  <span className="text-[10px] sm:text-[11px] text-[#737686] truncate">{institution.boardName} • Report Card</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-white text-[#131b2e] rounded-full text-[11px] sm:text-xs font-bold shadow-xs border border-[#dae2fd] shrink-0">
                {selectedExam}
              </span>
            </div>

            {/* Student Selector Dropdown for Report */}
            <div className="flex items-center justify-between bg-[#faf8ff] p-2.5 rounded-xl sm:rounded-2xl border border-[#eaedff]">
              <span className="text-xs text-[#737686] font-medium">Select Student:</span>
              <select
                value={reportTargetStudent?.id}
                onChange={e => {
                  const target = students.find(s => s.id === e.target.value);
                  if (target) setActiveStudentForReport(target);
                }}
                className="bg-white px-2.5 py-1 rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    Roll #{s.rollNo}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Bio Details Strip */}
            {reportTargetStudent && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl sm:rounded-2xl border border-[#eaedff]">
                <img
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-xs ring-1 ring-[#004ac6]/20 shrink-0"
                  src={reportTargetStudent.avatarUrl}
                  alt={reportTargetStudent.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-[#131b2e] truncate">{reportTargetStudent.name}</h4>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#bdffdb] text-[#002113] text-[9px] sm:text-[10px] font-extrabold shrink-0">
                      Rank #{reportRank}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[11px] text-[#737686]">
                    <span>Roll: <strong className="text-[#131b2e]">{reportTargetStudent.rollNo}</strong></span>
                    <span>Class: <strong className="text-[#131b2e]">{reportTargetStudent.classSec}</strong></span>
                    <span>Attendance: <strong className="text-[#007d55]">{reportTargetStudent.attendancePct}%</strong></span>
                    <span>Status: <strong className="text-[#004ac6]">{reportStats.pct >= 75 ? 'Passed (Distinction)' : 'Passed'}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Marks Table */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-[#dae2fd]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eaedff] text-[#737686] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-2 text-center">Max</th>
                    <th className="py-2.5 px-2 text-center">Scored</th>
                    <th className="py-2.5 px-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f3ff]">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Mathematics</td>
                    <td className="py-2 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#004ac6]">{reportTargetStudent?.marks.ut2.math}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">A+</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Science</td>
                    <td className="py-2 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#004ac6]">{reportTargetStudent?.marks.ut2.sci}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">A+</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">English</td>
                    <td className="py-2 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#004ac6]">{reportTargetStudent?.marks.ut2.eng}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">A+</span>
                    </td>
                  </tr>
                  <tr className="bg-[#f2f3ff] font-bold text-[#131b2e]">
                    <td className="py-2 px-3">Aggregate Grand Total</td>
                    <td className="py-2 px-2 text-center">150</td>
                    <td className="py-2 px-2 text-center font-mono text-[#004ac6]">{reportStats.total} ({reportStats.pct}%)</td>
                    <td className="py-2 px-2 text-center text-[#007d55]">{reportStats.grade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Teacher Remarks Box */}
            <div className="bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl space-y-1 border border-[#dae2fd]/50">
              <div className="flex items-center gap-1.5 text-[#004ac6]">
                <PenTool className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Faculty Remarks</span>
              </div>
              <p className="text-xs text-[#131b2e] italic">
                “Outstanding academic dedication and exemplary performance across all disciplines.”
              </p>
            </div>

            {/* Signatures & Authority Stamps */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <div className="flex flex-col items-center bg-[#f2f3ff] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center border border-[#dae2fd]/50">
                <PenTool className="w-4 h-4 text-[#737686] mb-0.5" />
                <span className="text-xs font-bold text-[#131b2e]">Senior Faculty</span>
                <span className="text-[10px] text-[#737686]">Class Teacher</span>
              </div>
              <div className="flex flex-col items-center bg-[#f2f3ff] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-center border border-[#dae2fd]/50">
                <CheckSquare className="w-4 h-4 text-[#004ac6] mb-0.5" />
                <span className="text-xs font-bold text-[#131b2e] truncate">{institution.principalName}</span>
                <span className="text-[10px] text-[#737686] truncate">{institution.principalDesignation}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Instant Push to Parents / Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (reportTargetStudent) {
                  openDispatchModal({
                    title: `Report Card: ${reportTargetStudent.name}`,
                    reportCategory: 'student-report',
                    defaultFormat: 'pdf',
                    defaultRecipientType: 'parent',
                    targetStudent: reportTargetStudent,
                  });
                }
              }}
              className="h-10 sm:h-11 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <Send className="w-4 h-4" />
              <span>Push PDF & WhatsApp to Parent</span>
            </button>

            <button
              onClick={() => {
                if (reportTargetStudent) {
                  openDispatchModal({
                    title: `Audit Report Card: ${reportTargetStudent.name}`,
                    reportCategory: 'student-report',
                    defaultFormat: 'pdf',
                    defaultRecipientType: 'principal',
                    targetStudent: reportTargetStudent,
                  });
                }
              }}
              className="h-10 sm:h-11 bg-white border border-[#dae2fd] text-[#131b2e] hover:bg-[#eaedff] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <Mail className="w-4 h-4 text-[#004ac6]" />
              <span>Send Copy to Principal</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
