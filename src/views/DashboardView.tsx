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
    setActiveTab,
    showToast,
    setScheduleSyncModalData,
    userRole,
  } = useApp();

  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  const attendanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const syllabusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const attendanceChartInstance = useRef<Chart | null>(null);
  const syllabusChartInstance = useRef<Chart | null>(null);

  // Dynamic metrics calculations
  const totalEnrolled = students.length;
  const activeFaculty = teachers.filter(t => t.status === 'In Campus' || t.status === 'On Duty (Exam)').length;
  const presentCount = students.filter(s => s.todayStatus === 'P').length;
  const absentCount = students.filter(s => s.todayStatus === 'A').length;
  const leaveCount = students.filter(s => s.todayStatus === 'L').length;
  const halfDayCount = students.filter(s => s.todayStatus === 'HD').length;
  const presencePct = ((presentCount + halfDayCount * 0.5) / (totalEnrolled || 1)) * 100;

  // Render Charts
  useEffect(() => {
    // 7-day trend line chart
    if (attendanceCanvasRef.current) {
      if (attendanceChartInstance.current) {
        attendanceChartInstance.current.destroy();
      }
      attendanceChartInstance.current = new Chart(attendanceCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
          datasets: [
            {
              label: 'Attendance %',
              data: [92.0, 95.0, 91.0, 94.0, 96.0, 93.0, 94.2],
              borderColor: '#004ac6',
              backgroundColor: 'rgba(0, 74, 198, 0.08)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointBackgroundColor: '#004ac6',
              pointRadius: 3,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Attendance: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              min: 85,
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

    // Syllabus completion bar chart
    if (syllabusCanvasRef.current) {
      if (syllabusChartInstance.current) {
        syllabusChartInstance.current.destroy();
      }
      syllabusChartInstance.current = new Chart(syllabusCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['Class 10-A', 'Class 10-B', 'Class 9-A'],
          datasets: [
            {
              label: 'Completed %',
              data: [76, 64, 78],
              backgroundColor: ['#004ac6', '#ba1a1a', '#007d55'],
              borderRadius: 6,
              barThickness: 28,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Completion: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
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
  }, []);

  const handleDefaulterWhatsApp = (studentName: string, phone: string, pct: number) => {
    const text = encodeURIComponent(
      `URGENT ATTENDANCE NOTICE - DPS Sector 4: ${studentName}'s attendance is currently at ${pct}%, which is critically below the 75% CBSE requirement. Kindly visit the school or contact the class teacher.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-4 py-3 max-w-7xl mx-auto text-left">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-[#f2f3ff] rounded-2xl p-4 shadow-sm border border-[#dae2fd]/60">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]"></span>
              {userRole} Mode
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight truncate">
              Good morning, Dr. Anita Roy
            </h1>
            <p className="text-xs text-[#737686] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              Thursday, Oct 24 • Academic Term 2024-25
            </p>
          </div>
          <div className="shrink-0">
            <img
              className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white"
              alt="Dr. Anita Roy Principal"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHjnfW0yD4P0JPB3pCJ8PvHI9VdRb2yr8Uaoib1V1D0SD7h-f1dSFY2rMXl9PP58IK3jJXKMqNrYLuXFSvhtN82V_qaE3gNo89VF9f9JuAuoDjW2OORZ1NI3KkSPLZ05a3hTO6XuiqShgR-PLjxuBOd5a16_0RtINVa0xAbUuhvnKk-UkbEEN2UZFFY7Dluql-5eL0SGWewPuxfBKozgrYjH8eTqaryMyeRomqQ_-p_6F8LHOlQgau"
            />
          </div>
        </div>
      </div>

      {/* Primary Stat Metric Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat 1: Total Enrolled */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#004ac6]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#004ac6] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#004ac6] text-[10px] font-bold">+2 New</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{totalEnrolled}</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Total Enrolled</span>
          </div>
          <p className="text-[11px] text-[#737686] mt-2 pt-2 bg-[#f2f3ff] px-2 py-1 rounded-lg">
            10-A: 15 • 10-B: 14 • 9-A: 11
          </p>
        </div>

        {/* Stat 2: Active Teachers */}
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#007d55]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">co_present</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">100% Duty</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{activeFaculty}</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Faculty on Duty</span>
          </div>
          <p className="text-[11px] text-[#007d55] font-semibold mt-2 pt-2 bg-[#f2f3ff] px-2 py-1 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007d55]"></span>
            Zero Staff Absences
          </p>
        </div>

        {/* Stat 3: Today's Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#004ac6]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#004ac6] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">+1.4%</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{presencePct.toFixed(1)}%</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Today's Presence</span>
          </div>
          <p className="text-[11px] text-[#737686] mt-2 pt-2 bg-[#f2f3ff] px-2 py-1 rounded-lg">
            {presentCount} P • {absentCount} A • {leaveCount} L • {halfDayCount} HD
          </p>
        </div>

        {/* Stat 4: Syllabus Completion */}
        <div
          onClick={() => setActiveTab('syllabus')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] flex flex-col justify-between cursor-pointer hover:border-[#4648d4]/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-xl bg-[#e1e0ff] flex items-center justify-center text-[#4648d4] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#434655] text-[10px] font-bold">4 Core Sub</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#131b2e] leading-none block">{syllabus.overallCompletion}%</span>
            <span className="text-xs text-[#737686] font-medium block mt-1">Term Completion</span>
          </div>
          <div className="mt-2 pt-1">
            <div className="w-full bg-[#eaedff] rounded-full h-2 overflow-hidden">
              <div className="bg-[#6063ee] h-full rounded-full transition-all duration-500" style={{ width: `${syllabus.overallCompletion}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Hub */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-sm text-[#131b2e]">Quick Actions</span>
          <span className="text-xs text-[#004ac6] font-medium">Direct Shortcuts</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all text-center space-y-1.5 hover:shadow"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <span className="text-[11px] leading-tight text-[#131b2e] font-semibold">Take Roll</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all text-center space-y-1.5 hover:shadow"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e1e0ff] flex items-center justify-center text-[#4648d4]">
              <span className="material-symbols-outlined text-[20px]">edit_document</span>
            </div>
            <span className="text-[11px] leading-tight text-[#131b2e] font-semibold">Add Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all text-center space-y-1.5 hover:shadow"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55]">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
            <span className="text-[11px] leading-tight text-[#131b2e] font-semibold">Sync Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#eaedff] active:scale-95 transition-all text-center space-y-1.5 hover:shadow"
            type="button"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#131b2e]">
              <span className="material-symbols-outlined text-[20px]">summarize</span>
            </div>
            <span className="text-[11px] leading-tight text-[#131b2e] font-semibold">Reports</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Attendance Trend Chart */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">7-Day Attendance Trend</h2>
              <p className="text-xs text-[#737686]">Class average across secondary wing</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 94.2%
            </span>
          </div>
          <div className="relative w-full h-44">
            <canvas ref={attendanceCanvasRef}></canvas>
          </div>
        </div>

        {/* Syllabus Completion by Class */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#131b2e]">Syllabus Completion</h2>
              <p className="text-xs text-[#737686]">Class breakdown vs target</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span> 10-B Lagging
            </span>
          </div>
          <div className="relative w-full h-44">
            <canvas ref={syllabusCanvasRef}></canvas>
          </div>
          <div className="p-2.5 rounded-xl bg-[#f2f3ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
              <span className="text-xs text-[#131b2e] font-medium">Class 10-B at 64% (&lt;80% target deadline)</span>
            </div>
            <button
              onClick={() => setActiveTab('syllabus')}
              className="text-[#004ac6] text-xs font-bold hover:underline"
              type="button"
            >
              Inspect
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Administrative Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            <h2 className="text-sm font-bold text-[#131b2e]">Urgent Administrative Alerts</h2>
          </div>
          <span className="text-xs text-[#ba1a1a] font-bold bg-[#ffdad6] px-2 py-0.5 rounded-full">2 Critical</span>
        </div>

        {/* Attendance Defaulters Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">person_alert</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#131b2e]">Attendance Defaulters (&lt;75%)</h3>
                <p className="text-[11px] text-[#737686]">2 students require mandatory parent call</p>
              </div>
            </div>
          </div>

          {/* Student 1: Kabir Mehta */}
          <div className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-[#dae2fd]/50">
            <div className="flex items-center gap-2 min-w-0">
              <img
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-[#ba1a1a]/30"
                alt="Kabir Mehta"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwPRUkPExYzwOFERZnY0PqJsBp6UKVM8Lij9IAbKL4YBOciP-RwOUQX18-vyh68J11aJjlDIZXU7oVf2y1GqzxXbLHBz8aVkx8GU6VqN4TnqTjY38Himiooh9kbC-3j8TQETCJh9Xi4fMLN7OG1CaVIP5g2MLVpIV7K5YADd9ZgfNE8mbekYmARcrD34ZTIo46C_-D3OS5-0joKdmlBDSKJGZsLmFlBdm7gwoRMz2NzQGTC0z-hHT2"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131b2e] truncate">Kabir Mehta</p>
                <p className="text-[11px] text-[#ba1a1a] font-semibold">71.4% Attendance (Class 10-B)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleDefaulterWhatsApp('Kabir Mehta', '919876543212', 71.4)}
                className="h-8 px-2.5 bg-[#007d55] text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setInspectStudent(students.find(s => s.name === 'Kabir Mehta') || students[2])}
                className="h-8 w-8 bg-white border border-[#dae2fd] rounded-lg text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff]"
                type="button"
                title="View Full Profile"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>
          </div>

          {/* Student 2: Riya Sen */}
          <div className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between gap-2 border border-[#dae2fd]/50">
            <div className="flex items-center gap-2 min-w-0">
              <img
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-[#ba1a1a]/30"
                alt="Riya Sen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSXJDTOzKh7tCmnOqQKtUuk1W4a1FI5lFpSOdKJEYbE2J5LgiO20W5T_KJiVSKWUDcex8Kv6Q0_Viow_WEMb89dcsBjgT9Mw08PqEot2nqN2qveskfFkS-gWJDrlqUMvr7LjTATrA6xDz9VYQJko8d8fJbD75SVqzrzEOciEcdjm3xehw7tVAbHzbTNjbUXybnEc6nQdTX4fjzQWgDxN7mx2jMYrEHYmKgm5jCbp1Kjlbd3vZpaPhX"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131b2e] truncate">Riya Sen</p>
                <p className="text-[11px] text-[#ba1a1a] font-semibold">68.0% Attendance (Class 9-A)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleDefaulterWhatsApp('Riya Sen', '919876543220', 68.0)}
                className="h-8 px-2.5 bg-[#007d55] text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setInspectStudent(students.find(s => s.name === 'Riya Sen') || students[0])}
                className="h-8 w-8 bg-white border border-[#dae2fd] rounded-lg text-[#131b2e] flex items-center justify-center hover:bg-[#eaedff]"
                type="button"
                title="View Full Profile"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
              </button>
            </div>
          </div>
        </div>

        {/* Syllabus Behind Alert Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#dae2fd] text-[#004ac6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">history_edu</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#131b2e]">Curriculum Delay Identified</h3>
                <p className="text-[11px] text-[#737686]">Class 10-B • Physics by Ms. Preeti Sharma</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold">Lagging</span>
          </div>

          <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1 border border-[#dae2fd]/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#131b2e] font-semibold">Chapter 4: Magnetic Effects of Electric Current</span>
              <span className="text-[#ba1a1a] font-bold">12 Days Pending</span>
            </div>
            <p className="text-[11px] text-[#737686]">
              Target completion was Oct 12. Pre-board exam scheduled in 3 weeks.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() =>
                setScheduleSyncModalData({
                  teacherName: 'Ms. Preeti Sharma',
                  subject: 'Physics',
                  classSec: 'Class 10-B',
                })
              }
              className="flex-1 h-9 rounded-xl bg-[#004ac6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Schedule Teacher Sync
            </button>
            <button
              onClick={() => {
                setActiveTab('syllabus');
                showToast('Reviewing Class 10-B Syllabus Plan');
              }}
              className="h-9 px-3 rounded-xl bg-[#eaedff] text-[#131b2e] text-xs font-semibold hover:bg-[#dae2fd]"
              type="button"
            >
              Review Plan
            </button>
          </div>
        </div>
      </div>

      {/* Student Inspector Modal */}
      <StudentDetailModal
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
      />
    </div>
  );
};
