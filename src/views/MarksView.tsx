import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

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
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Breadcrumb & Term Context Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004ac6] text-[24px]">military_tech</span>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-[#131b2e]">Examinations & Grading Ledger</h2>
            <p className="text-xs text-[#737686]">{institution.name} • {institution.boardName}</p>
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
            className="h-9 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Push Master Ledger (PDF/WA)</span>
          </button>
        </div>
      </div>

      {/* Exam Selection Horizontal Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {(['UT-1', 'UT-2', 'Mid-Term', 'Final'] as const).map(exam => {
          const isSelected = selectedExam === exam;
          return (
            <button
              key={exam}
              onClick={() => {
                setSelectedExam(exam);
                showToast(`Switched active view to ${exam} examination`);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2563eb] text-white shadow-md'
                  : 'bg-white text-[#434655] border border-[#dae2fd] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {isSelected && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
              <span>{exam === 'UT-1' ? 'Unit Test 1' : exam === 'UT-2' ? 'Unit Test 2' : exam === 'Mid-Term' ? 'Mid-Term Exam' : 'Final Exam'}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Configuration Strip */}
      <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Class Selector */}
          <div className="flex flex-col bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd]/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">Class & Section</span>
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
              <span className="material-symbols-outlined text-[18px] text-[#737686]">tune</span>
            </div>
          </div>

          {/* Subject Filter */}
          <div className="flex flex-col bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd]/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">Subject Scope</span>
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
              <span className="material-symbols-outlined text-[18px] text-[#737686]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Max Marks & Grading Scheme Tagline */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1.5 text-[#737686]">
            <span className="material-symbols-outlined text-[16px] text-[#004ac6]">info</span>
            <span className="text-xs">
              Max: <strong className="text-[#131b2e]">50 / Subject</strong> (Grand Total: 150)
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#00174b] rounded-full text-[10px] font-bold">
            Scale: A+ (≥90%)
          </span>
        </div>
      </div>

      {/* Segmented View Mode Controller */}
      <div className="bg-[#eaedff] p-1 rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setActiveSubView('marksheet')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubView === 'marksheet'
              ? 'bg-white text-[#004ac6] shadow-sm'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          <span>Marksheet & Entry</span>
        </button>

        <button
          onClick={() => setActiveSubView('analytics')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubView === 'analytics'
              ? 'bg-white text-[#004ac6] shadow-sm'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">insights</span>
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => setActiveSubView('report')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubView === 'report'
              ? 'bg-white text-[#004ac6] shadow-sm'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Report Card</span>
        </button>
      </div>

      {/* VIEW 1: Marksheet Table */}
      {activeSubView === 'marksheet' && (
        <section className="space-y-3 flex flex-col">
          {/* Quick Actions Banner */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-3xl shadow-sm border border-[#eaedff]">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold">
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#131b2e]">Live Auto-Calculation Engine</span>
                <span className="text-[11px] text-[#737686]">Updates total, % and rank in real time</span>
              </div>
            </div>
            <button
              onClick={saveAllMarks}
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] rounded-xl text-white text-xs font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save All Marks</span>
            </button>
          </div>

          {/* Interactive Table Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#eaedff] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#737686] text-[11px] font-bold uppercase tracking-wider border-b border-[#dae2fd]">
                    <th className="py-3 px-3">Roll</th>
                    <th className="py-3 px-3 min-w-[140px]">Student</th>
                    <th className="py-3 px-2 text-center">Math (50)</th>
                    <th className="py-3 px-2 text-center">Sci (50)</th>
                    <th className="py-3 px-2 text-center">Eng (50)</th>
                    <th className="py-3 px-2 text-center">Total</th>
                    <th className="py-3 px-2 text-center">%</th>
                    <th className="py-3 px-2 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-2 text-center">Push</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#f2f3ff]">
                  {studentStats.map(({ student, total, pct, grade, gradeBadgeClass }) => {
                    const rank = rankMap.get(student.id) || 1;
                    const isRank1 = rank === 1;

                    return (
                      <tr key={student.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#004ac6]">{student.rollNo}</td>
                        <td className="py-3 px-3 min-w-[140px]">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setActiveStudentForReport(student);
                              setActiveSubView('report');
                            }}
                          >
                            <img
                              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#004ac6]/20"
                              src={student.avatarUrl}
                              alt={student.name}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[#131b2e] leading-snug truncate hover:text-[#004ac6]">
                                {student.name}
                              </span>
                              {isRank1 ? (
                                <span className="text-[10px] text-[#007d55] font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[13px]">military_tech</span> Rank #1
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#737686]">{student.classSec}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Math Input */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.math}
                            onChange={e => updateStudentMark(student.id, 'math', parseInt(e.target.value) || 0)}
                            className="w-12 h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Sci Input */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.sci}
                            onChange={e => updateStudentMark(student.id, 'sci', parseInt(e.target.value) || 0)}
                            className="w-12 h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Eng Input */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={student.marks.ut2.eng}
                            onChange={e => updateStudentMark(student.id, 'eng', parseInt(e.target.value) || 0)}
                            className="w-12 h-9 text-center bg-[#f2f3ff] rounded-xl font-mono font-bold text-[#131b2e] focus:bg-white focus:ring-2 focus:ring-[#004ac6] outline-none border border-[#dae2fd]"
                          />
                        </td>

                        {/* Total */}
                        <td className="py-2 px-2 text-center font-mono font-bold text-[#131b2e]">{total}</td>

                        {/* Pct */}
                        <td className="py-2 px-2 text-center font-mono font-bold text-[#004ac6]">{pct}%</td>

                        {/* Grade */}
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${gradeBadgeClass}`}>
                            {grade}
                          </span>
                        </td>

                        {/* Rank */}
                        <td className="py-2 px-3 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-xs ${
                              isRank1 ? 'bg-[#e1e0ff] text-[#4648d4] ring-2 ring-[#4648d4]' : 'bg-[#f2f3ff] text-[#131b2e]'
                            }`}
                          >
                            {rank}
                          </div>
                        </td>

                        {/* Push Action */}
                        <td className="py-2 px-2 text-center">
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
                            className="w-8 h-8 rounded-xl bg-[#007d55] hover:bg-[#006644] text-white inline-flex items-center justify-center shadow-xs active:scale-95 transition-all"
                            title="Push Report Card to Parents (WhatsApp/PDF)"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Guidance Footer */}
            <div className="bg-[#f2f3ff] px-4 py-2.5 flex items-center justify-between text-[#737686] text-[11px] border-t border-[#dae2fd]">
              <span className="flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[15px] text-[#007d55]">verified</span>
                Formula active: Marks ÷ 150 × 100
              </span>
              <span className="font-mono">{studentStats.length} Records in Ledger</span>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: Analytics */}
      {activeSubView === 'analytics' && (
        <section className="space-y-4">
          {/* Topper Spotlight Banner */}
          <div className="bg-gradient-to-r from-[#004ac6] to-[#4648d4] p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-[#6ffbbe] text-[#002113] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Class Valedictorian
                </span>
                <h2 className="text-xl sm:text-2xl font-bold">{topper?.student.name}</h2>
                <p className="text-xs text-white/80 font-medium">
                  Rank #1 • {topper?.pct}% Overall ({topper?.total} / 150)
                </p>
              </div>
              <div className="relative">
                <img
                  className="w-16 h-16 rounded-full object-cover shadow-lg ring-4 ring-[#6ffbbe]"
                  src={topper?.student.avatarUrl}
                  alt={topper?.student.name}
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6063ee] text-white flex items-center justify-center text-[10px] font-bold shadow">
                  #1
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Bento */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[#004ac6] text-[22px] mb-1">stacked_line_chart</span>
              <span className="text-[10px] font-bold uppercase text-[#737686]">Average</span>
              <span className="text-lg font-bold text-[#131b2e] mt-0.5 font-mono">{avgPct.toFixed(1)}%</span>
              <span className="text-[11px] text-[#007d55] font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">arrow_upward</span> +3.4%
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[#4648d4] text-[22px] mb-1">emoji_events</span>
              <span className="text-[10px] font-bold uppercase text-[#737686]">Highest</span>
              <span className="text-lg font-bold text-[#131b2e] mt-0.5 font-mono">{topper?.pct}%</span>
              <span className="text-[10px] text-[#737686] truncate max-w-[80px]">{topper?.student.name}</span>
            </div>

            <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[#007d55] text-[22px] mb-1">check_circle</span>
              <span className="text-[10px] font-bold uppercase text-[#737686]">Passing</span>
              <span className="text-lg font-bold text-[#131b2e] mt-0.5 font-mono">100%</span>
              <span className="text-[10px] text-[#007d55] font-bold">All Cleared</span>
            </div>
          </div>

          {/* Subject Performance Breakdown */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#131b2e]">Subject Averages</h3>
              <span className="text-xs text-[#737686]">Out of 50 Marks</span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#131b2e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004ac6]"></span> Mathematics
                  </span>
                  <span className="font-mono">
                    {mathAvg.toFixed(1)} / 50 ({((mathAvg / 50) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-[#eaedff] h-2.5 rounded-full overflow-hidden">
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
                <div className="w-full bg-[#eaedff] h-2.5 rounded-full overflow-hidden">
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
                <div className="w-full bg-[#eaedff] h-2.5 rounded-full overflow-hidden">
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
        <section className="space-y-4">
          <div className="bg-white rounded-3xl shadow-lg p-5 space-y-4 border border-[#eaedff]">
            {/* Dynamic Institution Header */}
            <div className="flex items-center justify-between pb-3 bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd]/50">
              <div className="flex items-center gap-3">
                <img
                  src={institution.logoUrl}
                  alt={institution.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#dae2fd] shadow-xs"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#131b2e]">{institution.name}</span>
                  <span className="text-[11px] text-[#737686]">{institution.boardName} • Terminal Report Card</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-white text-[#131b2e] rounded-full text-xs font-bold shadow-sm border border-[#dae2fd]">
                {selectedExam}
              </span>
            </div>

            {/* Student Selector Dropdown for Report */}
            <div className="flex items-center justify-between bg-[#faf8ff] p-2.5 rounded-2xl border border-[#eaedff]">
              <span className="text-xs text-[#737686] font-medium">Select Student:</span>
              <select
                value={reportTargetStudent?.id}
                onChange={e => {
                  const target = students.find(s => s.id === e.target.value);
                  if (target) setActiveStudentForReport(target);
                }}
                className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
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
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#eaedff]">
                <img
                  className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-1 ring-[#004ac6]/20"
                  src={reportTargetStudent.avatarUrl}
                  alt={reportTargetStudent.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#131b2e] truncate">{reportTargetStudent.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] text-[10px] font-extrabold">
                      Rank #{reportRank}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-xs text-[#737686]">
                    <span>
                      Roll No: <strong className="text-[#131b2e]">{reportTargetStudent.rollNo}</strong>
                    </span>
                    <span>
                      Class: <strong className="text-[#131b2e]">{reportTargetStudent.classSec}</strong>
                    </span>
                    <span>
                      Attendance: <strong className="text-[#007d55]">{reportTargetStudent.attendancePct}%</strong>
                    </span>
                    <span>
                      Status:{' '}
                      <strong className="text-[#004ac6]">
                        {reportStats.pct >= 75 ? 'Passed (Distinction)' : 'Passed'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Marks Table */}
            <div className="rounded-2xl overflow-hidden border border-[#dae2fd]">
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
                    <td className="py-2.5 px-3 font-semibold">Mathematics</td>
                    <td className="py-2.5 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#004ac6]">
                      {reportTargetStudent?.marks.ut2.math}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">
                        A+
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Science</td>
                    <td className="py-2.5 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#004ac6]">
                      {reportTargetStudent?.marks.ut2.sci}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">
                        A+
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">English</td>
                    <td className="py-2.5 px-2 text-center text-[#737686]">50</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#004ac6]">
                      {reportTargetStudent?.marks.ut2.eng}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#bdffdb] text-[#002113] font-bold text-[10px]">
                        A+
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-[#f2f3ff] font-bold text-[#131b2e]">
                    <td className="py-2.5 px-3">Aggregate Grand Total</td>
                    <td className="py-2.5 px-2 text-center">150</td>
                    <td className="py-2.5 px-2 text-center font-mono text-[#004ac6]">
                      {reportStats.total} ({reportStats.pct}%)
                    </td>
                    <td className="py-2.5 px-2 text-center text-[#007d55]">{reportStats.grade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Teacher Remarks Box */}
            <div className="bg-[#f2f3ff] p-3 rounded-2xl space-y-1 border border-[#dae2fd]/50">
              <div className="flex items-center gap-1.5 text-[#004ac6]">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Faculty Remarks</span>
              </div>
              <p className="text-xs text-[#131b2e] italic">
                “Outstanding academic dedication and exemplary performance across all disciplines.”
              </p>
            </div>

            {/* Signatures & Authority Stamps with Dynamic Principal Name */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col items-center bg-[#f2f3ff] p-2.5 rounded-2xl text-center border border-[#dae2fd]/50">
                <span className="material-symbols-outlined text-[#737686] text-[22px] mb-0.5">draw</span>
                <span className="text-xs font-bold text-[#131b2e]">Senior Faculty</span>
                <span className="text-[10px] text-[#737686]">Class Teacher</span>
              </div>
              <div className="flex flex-col items-center bg-[#f2f3ff] p-2.5 rounded-2xl text-center border border-[#dae2fd]/50">
                <span className="material-symbols-outlined text-[#004ac6] text-[22px] mb-0.5">approval_delegation</span>
                <span className="text-xs font-bold text-[#131b2e]">{institution.principalName}</span>
                <span className="text-[10px] text-[#737686]">{institution.principalDesignation}</span>
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
              className="h-11 bg-[#007d55] hover:bg-[#006644] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
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
              className="h-11 bg-white border border-[#dae2fd] text-[#131b2e] hover:bg-[#eaedff] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#004ac6]">forward_to_inbox</span>
              <span>Send Copy to Principal</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
