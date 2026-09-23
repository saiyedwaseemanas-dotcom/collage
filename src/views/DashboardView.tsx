import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Chart, registerables } from 'chart.js';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { Student } from '../types';

Chart.register(...registerables);

export const DashboardView: React.FC = () => {
  const {
    students,
    teachers,
    syllabus,
    institution,
    academicSession,
    setActiveTab,
    showToast,
    setScheduleSyncModalData,
    userRole,
    openDispatchModal,
    metricsKey,
  } = useApp();

  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  const attendanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const syllabusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const syllabusChartInstance = useRef<Chart | null>(null);

  // Dynamic real-time metrics calculations (recalculates within < 1 second upon ANY data entry)
  const totalEnrolled = students.length;
  const activeFaculty = teachers.filter(t => t.status === 'In Campus' || t.status === 'On Duty (Exam)').length;
  const presentCount = students.filter(s => s.todayStatus === 'P').length;
  const absentCount = students.filter(s => s.todayStatus === 'A').length;
  const leaveCount = students.filter(s => s.todayStatus === 'L').length;
  const halfDayCount = students.filter(s => s.todayStatus === 'HD').length;
  const presencePct = totalEnrolled > 0 ? ((presentCount + halfDayCount * 0.5) / totalEnrolled) * 100 : 0;

  const defaultersList = students.filter(s => s.attendancePct < institution.defaulterThreshold);

  // Class 10-A, 10-B, 9-A averages calculated reactively
  const classStats = ['10-A', '10-B', '9-A'].map(cls => {
    const classStudents = students.filter(s => s.gradeLevel === cls);
    const avgAtt = classStudents.length > 0
      ? classStudents.reduce((acc, s) => acc + s.attendancePct, 0) / classStudents.length
      : 0;
    return { class: `Class ${cls}`, avgAtt: parseFloat(avgAtt.toFixed(1)), count: classStudents.length };
  });

  // Re-render Charts Reactively on metricsKey, students, syllabus, or teachers change
  useEffect(() => {
    // 1. Real-time Attendance Trend Chart
    if (attendanceCanvasRef.current) {
      if (attendanceChartInstance.current) {
        attendanceChartInstance.current.destroy();
      }
      
      const todayPct = parseFloat(presencePct.toFixed(1));
      const trendData = [91.5, 93.0, 90.8, 94.2, 95.0, 93.4, todayPct];

      attendanceChartInstance.current = new Chart(attendanceCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today (Live)'],
          datasets: [
            {
              label: 'Attendance %',
              data: trendData,
              borderColor: institution.primaryColor || '#004ac6',
              backgroundColor: 'rgba(0, 74, 198, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointBackgroundColor: institution.primaryColor || '#004ac6',
              pointRadius: 4,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Live Attendance: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              min: 70,
              max: 100,
              grid: { color: 'rgba(115, 118, 134, 0.1)' },
              ticks: {
                font: { size: 10, family: 'Inter' },
                color: '#737686',
                callback: v => `${v}%`,
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, family: 'Inter' }, color: '#737686' },
            },
          },
        },
      });
    }

    // 2. Syllabus & Class Attendance Bar Chart
    if (syllabusCanvasRef.current) {
      if (syllabusChartInstance.current) {
        syllabusChartInstance.current.destroy();
      }

      syllabusChartInstance.current = new Chart(syllabusCanvasRef.current, {
        type: 'bar',
        data: {
          labels: classStats.map(c => c.class),
          datasets: [
            {
              label: 'Attendance Average %',
              data: classStats.map(c => c.avgAtt),
              backgroundColor: [
                classStats[0]?.avgAtt >= institution.defaulterThreshold ? '#004ac6' : '#ba1a1a',
                classStats[1]?.avgAtt >= institution.defaulterThreshold ? '#007d55' : '#ba1a1a',
                classStats[2]?.avgAtt >= institution.defaulterThreshold ? '#4648d4' : '#ba1a1a',
              ],
              borderRadius: 8,
              barThickness: 32,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Class Average: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              min: 50,
              max: 100,
              grid: { color: 'rgba(115, 118, 134, 0.1)' },
              ticks: {
                font: { size: 10, family: 'Inter' },
                color: '#737686',
                callback: v => `${v}%`,
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 11, family: 'Inter', weight: 'bold' }, color: '#131b2e' },
            },
          },
        },
      });
    }

    return () => {
      if (attendanceChartInstance.current) attendanceChartInstance.current.destroy();
      if (syllabusChartInstance.current) syllabusChartInstance.current.destroy();
    };
  }, [metricsKey, students, syllabus, teachers, presencePct, institution]);

  return (
    <div className="flex flex-col w-full px-4 space-y-4 py-3 max-w-7xl mx-auto text-left">
      {/* Welcome Banner with Dynamic Institution Branding & Quick Push Button */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#f2f3ff] via-[#faf8ff] to-[#e8edff] rounded-3xl p-4 sm:p-5 shadow-sm border border-[#dae2fd]/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-pulse"></span>
                {userRole} Mode
              </span>
              <span className="text-[11px] font-bold text-[#007d55] bg-[#bdffdb]/50 px-2 py-0.5 rounded-full">
                {institution.boardName.split(' ')[0]} Verified
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight truncate">
              {institution.name}
            </h1>
            <p className="text-xs text-[#737686] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#004ac6]">verified_user</span>
              {institution.principalDesignation}: <strong className="text-[#131b2e]">{institution.principalName}</strong> • {academicSession}
            </p>
          </div>

          {/* Quick Push Document & WhatsApp Trigger Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() =>
                openDispatchModal({
                  title: `Executive Master Audit - ${institution.shortName}`,
                  reportCategory: 'master-audit',
                  defaultFormat: 'pdf',
                  defaultRecipientType: 'principal',
                })
              }
              className="flex-1 sm:flex-initial h-11 px-4 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span>Push PDF / Excel / WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Stat Metric Cards (Reactive within < 1 second of any entry) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat 1: Total Enrolled */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#004ac6]/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-[#f2f3ff] flex items-center justify-center text-[#004ac6] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#004ac6] text-[10px] font-bold">
              + Manage
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{totalEnrolled}</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Pupils in Database</span>
          </div>
          <p className="text-[11px] text-[#737686] mt-2 pt-2 bg-[#f2f3ff] px-2.5 py-1 rounded-xl truncate">
            {classStats.map(c => `${c.class.replace('Class ', '')}: ${c.count}`).join(' • ')}
          </p>
        </div>

        {/* Stat 2: Active Faculty */}
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#007d55]/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">co_present</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
              {teachers.length} Faculty
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{activeFaculty}</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Faculty on Duty</span>
          </div>
          <p className="text-[11px] text-[#007d55] font-semibold mt-2 pt-2 bg-[#f2f3ff] px-2.5 py-1 rounded-xl flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007d55]"></span>
            {activeFaculty === teachers.length ? 'Zero Staff Absences' : `${teachers.length - activeFaculty} on Leave`}
          </p>
        </div>

        {/* Stat 3: Live Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#004ac6]/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-[#eaedff] flex items-center justify-center text-[#004ac6] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
              Live Real-Time
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{presencePct.toFixed(1)}%</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Today's Presence</span>
          </div>
          <p className="text-[11px] text-[#737686] mt-2 pt-2 bg-[#f2f3ff] px-2.5 py-1 rounded-xl truncate">
            {presentCount} P • {absentCount} A • {leaveCount} L • {halfDayCount} HD
          </p>
        </div>

        {/* Stat 4: Syllabus Term Completion */}
        <div
          onClick={() => setActiveTab('syllabus')}
          className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#4648d4]/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-[#e1e0ff] flex items-center justify-center text-[#4648d4] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#434655] text-[10px] font-bold">
              {syllabus.completedChapters}/{syllabus.totalChapters} Units
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{syllabus.overallCompletion}%</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Curriculum Delivery</span>
          </div>
          <div className="mt-2 pt-1">
            <div className="w-full bg-[#eaedff] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#6063ee] h-full rounded-full transition-all duration-300"
                style={{ width: `${syllabus.overallCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Hub */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-sm text-[#131b2e]">Database Actions & Shortcuts</span>
          <span className="text-xs text-[#004ac6] font-medium">Instant Synced</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex items-center gap-2.5 p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all hover:border-[#004ac6]/30"
            type="button"
          >
            <div className="w-9 h-9 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-[#131b2e] block truncate">Daily Register</span>
              <span className="text-[10px] text-[#737686] truncate block">Take roll & mark</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className="flex items-center gap-2.5 p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all hover:border-[#4648d4]/30"
            type="button"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e1e0ff] flex items-center justify-center text-[#4648d4] shrink-0">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-[#131b2e] block truncate">Marks & Exams</span>
              <span className="text-[10px] text-[#737686] truncate block">Grades & reports</span>
            </div>
          </button>

          <button
            onClick={() =>
              openDispatchModal({
                title: 'Export Full Database',
                reportCategory: 'master-audit',
                defaultFormat: 'excel',
                defaultRecipientType: 'principal',
              })
            }
            className="flex items-center gap-2.5 p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all hover:border-[#007d55]/30"
            type="button"
          >
            <div className="w-9 h-9 rounded-xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55] shrink-0">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-[#131b2e] block truncate">Push PDF / Excel</span>
              <span className="text-[10px] text-[#737686] truncate block">Export & send</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className="flex items-center gap-2.5 p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all hover:border-[#004ac6]/30"
            type="button"
          >
            <div className="w-9 h-9 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#004ac6] shrink-0">
              <span className="material-symbols-outlined text-[20px]">branding_watermark</span>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-[#131b2e] block truncate">Client Branding</span>
              <span className="text-[10px] text-[#737686] truncate block">Custom logo & details</span>
            </div>
          </button>
        </div>
      </div>

      {/* Real-time Reactive Charts (Update within 1 second of any mark/attendance entry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Attendance Trend Chart */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Attendance Trend (Live Synced)</h2>
              <p className="text-xs text-[#737686]">Updates within 1s of register modification</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> {presencePct.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-full h-44">
            <canvas ref={attendanceCanvasRef}></canvas>
          </div>
        </div>

        {/* Class Breakdown Attendance Chart */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Class Performance Ledger</h2>
              <p className="text-xs text-[#737686]">Average compliance across sections</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#004ac6] text-xs font-bold">
              Threshold: {institution.defaulterThreshold}%
            </span>
          </div>
          <div className="relative w-full h-44">
            <canvas ref={syllabusCanvasRef}></canvas>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#f2f3ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#007d55]"></span>
              <span className="text-xs text-[#131b2e] font-medium">
                {classStats.filter(c => c.avgAtt >= institution.defaulterThreshold).length} of {classStats.length} Classes Above Compliance
              </span>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-[#004ac6] text-xs font-bold hover:underline"
              type="button"
            >
              Take Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Defaulters Card & One-Click WhatsApp Push to Parents */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person_alert</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#131b2e]">
                Attendance Defaulters (&lt;{institution.defaulterThreshold}%)
              </h3>
              <p className="text-[11px] text-[#737686]">
                {defaultersList.length} students require mandatory parent notification
              </p>
            </div>
          </div>
          {defaultersList.length > 0 && (
            <button
              onClick={() =>
                openDispatchModal({
                  title: 'Defaulters Compliance Dispatch',
                  reportCategory: 'attendance-register',
                  defaultFormat: 'pdf',
                  defaultRecipientType: 'all-parents',
                })
              }
              className="h-8 px-3 bg-[#007d55] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Notify All Defaulters
            </button>
          )}
        </div>

        {defaultersList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#bdffdb]/30 text-center text-xs text-[#002113] font-semibold">
            All students are currently above the {institution.defaulterThreshold}% compliance threshold!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {defaultersList.map(student => (
              <div
                key={student.id}
                className="bg-[#f2f3ff] p-3 rounded-2xl flex items-center justify-between gap-2 border border-[#dae2fd]/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-[#ba1a1a]/30"
                    alt={student.name}
                    src={student.avatarUrl}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#131b2e] truncate">{student.name}</p>
                    <p className="text-[11px] text-[#ba1a1a] font-semibold">
                      {student.attendancePct}% Attendance ({student.classSec})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      openDispatchModal({
                        title: `Parent Report: ${student.name}`,
                        reportCategory: 'student-report',
                        defaultFormat: 'pdf',
                        defaultRecipientType: 'parent',
                        targetStudent: student,
                      })
                    }
                    className="h-8 px-2.5 bg-[#007d55] text-white rounded-xl text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">chat</span>
                    <span>Send WA</span>
                  </button>
                  <button
                    onClick={() => setInspectStudent(student)}
                    className="h-8 w-8 bg-white border border-[#dae2fd] rounded-xl text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff]"
                    type="button"
                    title="View Profile"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Inspector Modal */}
      <StudentDetailModal
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
      />
    </div>
  );
};
