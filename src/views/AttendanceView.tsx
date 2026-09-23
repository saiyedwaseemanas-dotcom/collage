import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, Student } from '../types';
import { StudentDetailModal } from '../components/StudentDetailModal';

export const AttendanceView: React.FC = () => {
  const {
    students,
    teachers,
    selectedClass,
    setSelectedClass,
    currentDateLabel,
    shiftDate,
    updateStudentAttendance,
    markAllPresent,
    filterDefaultersOnly,
    setFilterDefaultersOnly,
    lastSyncTime,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'student' | 'faculty'>('student');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  // Filter students by selected class
  const classGradeKey = selectedClass.replace('Class ', '') as '10-A' | '10-B' | '9-A';
  const filteredByClass = students.filter(s => s.gradeLevel === classGradeKey);
  const displayStudents = filterDefaultersOnly
    ? filteredByClass.filter(s => s.attendancePct < 75)
    : filteredByClass;

  // Realtime counts for current class
  const countP = filteredByClass.filter(s => s.todayStatus === 'P').length;
  const countA = filteredByClass.filter(s => s.todayStatus === 'A').length;
  const countL = filteredByClass.filter(s => s.todayStatus === 'L').length;
  const countHD = filteredByClass.filter(s => s.todayStatus === 'HD').length;
  const defaulterCount = filteredByClass.filter(s => s.attendancePct < 75).length;

  const handlePushSheet = async () => {
    setIsPushing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsPushing(false);
    showToast(`Sync Successful! ${filteredByClass.length} Attendance rows written to Google Sheet`);
  };

  const handleOpenWhatsApp = (phone: string, name: string, status: string) => {
    const text = encodeURIComponent(
      `EduTrack Pro Alert: Daily attendance update for ${name}. Status: ${status}. Date: ${currentDateLabel}. DPS Sector 4.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleDefaulterAlert = (phone: string, name: string, pct: number) => {
    const text = encodeURIComponent(
      `URGENT ATTENDANCE WARNING from DPS Sector 4: ${name} has an aggregate attendance of ${pct}%, which is below the mandatory 75% CBSE requirement. Please contact the class teacher immediately.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full text-left max-w-7xl mx-auto">
      {/* Top Controls Banner */}
      <div className="px-4 py-3 bg-[#f2f3ff] flex flex-col gap-3 border-b border-[#dae2fd]/60">
        {/* View Switcher Segmented Control */}
        <div className="p-1 bg-[#eaedff] rounded-2xl flex items-center justify-between shadow-inner">
          <button
            onClick={() => setActiveSubTab('student')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'student'
                ? 'bg-white text-[#004ac6] shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Student Roster</span>
          </button>
          <button
            onClick={() => setActiveSubTab('faculty')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'faculty'
                ? 'bg-white text-[#004ac6] shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Faculty Log</span>
          </button>
        </div>

        {/* Date Strip & Shift Navigator */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[#eaedff]">
          <button
            onClick={() => shiftDate(-1)}
            className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:text-[#004ac6] transition-colors"
            type="button"
            title="Previous Day"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">calendar_today</span>
            <span className="font-bold text-xs sm:text-sm text-[#131b2e]">{currentDateLabel}</span>
            <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse"></span>
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:text-[#004ac6] transition-colors"
            type="button"
            title="Next Day"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* Class Selector Filter Pills (when student tab active) */}
        {activeSubTab === 'student' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['Class 10-A', 'Class 10-B', 'Class 9-A'] as const).map(cls => {
              const isSelected = selectedClass === cls;
              const count = students.filter(s => s.gradeLevel === cls.replace('Class ', '')).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#004ac6] text-white shadow-sm'
                      : 'text-[#434655] bg-white border border-[#dae2fd] hover:bg-[#eaedff]'
                  }`}
                  type="button"
                >
                  <span>{cls}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-[#dbe1ff] text-[#00174b]' : 'bg-[#f2f3ff] text-[#737686]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeSubTab === 'student' ? (
        <div className="flex flex-col w-full pb-28">
          {/* Realtime Metric Ticker */}
          <div className="px-4 pt-3 pb-2 grid grid-cols-4 gap-2">
            <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-[#eaedff]">
              <span className="text-[11px] font-semibold text-[#737686]">Present</span>
              <span className="text-lg font-bold text-[#007d55]">{countP}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-[#eaedff]">
              <span className="text-[11px] font-semibold text-[#737686]">Absent</span>
              <span className="text-lg font-bold text-[#ba1a1a]">{countA}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-[#eaedff]">
              <span className="text-[11px] font-semibold text-[#737686]">Leave</span>
              <span className="text-lg font-bold text-[#4648d4]">{countL}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-[#eaedff]">
              <span className="text-[11px] font-semibold text-[#737686]">Half-Day</span>
              <span className="text-lg font-bold text-[#004ac6]">{countHD}</span>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div className="px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={markAllPresent}
              className="whitespace-nowrap px-3.5 py-2 bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => setFilterDefaultersOnly(prev => !prev)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                filterDefaultersOnly
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6]/80'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Defaulters (&lt;75%)</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterDefaultersOnly ? 'bg-white text-[#ba1a1a]' : 'bg-[#ba1a1a] text-white'
                }`}
              >
                {defaulterCount}
              </span>
            </button>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => showToast('Exported Attendance ledger to Excel (XLSX)')}
                className="h-9 px-2.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#007d55]">table_view</span>
                <span>Excel</span>
              </button>
              <button
                onClick={() => showToast('Generated Attendance PDF report')}
                className="h-9 px-2.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">picture_as_pdf</span>
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Student Roster Cards */}
          <div className="px-4 py-2 flex flex-col gap-2.5">
            {displayStudents.map(student => {
              const isDefaulter = student.attendancePct < 75;
              return (
                <div
                  key={student.id}
                  className={`bg-white p-3.5 rounded-2xl shadow-sm border transition-all flex flex-col gap-3 ${
                    isDefaulter
                      ? 'border-[#ba1a1a]/40 bg-[#ffdad6]/10'
                      : 'border-[#eaedff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => setInspectStudent(student)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDefaulter
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#dbe1ff] text-[#004ac6]'
                        }`}
                      >
                        {student.rollNo}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#131b2e] truncate">{student.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              isDefaulter ? 'bg-[#ba1a1a] text-white' : 'bg-[#f2f3ff] text-[#737686]'
                            }`}
                          >
                            {student.attendancePct}%
                          </span>
                        </div>
                        <span className={`text-[11px] truncate ${isDefaulter ? 'text-[#ba1a1a] font-semibold' : 'text-[#737686]'}`}>
                          {isDefaulter
                            ? 'Critical Defaulter Warning'
                            : `${student.classSec} • ${student.parentRelation}: ${student.parentName}`}
                        </span>
                      </div>
                    </div>

                    {isDefaulter ? (
                      <button
                        onClick={() => handleDefaulterAlert(student.parentWhatsApp, student.name, student.attendancePct)}
                        className="px-3 py-1.5 rounded-full bg-[#ba1a1a] text-white flex items-center gap-1 text-xs font-bold shadow-sm active:scale-95 transition-transform"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">priority_high</span>
                        <span>Alert Parent</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenWhatsApp(student.parentWhatsApp, student.name, student.todayStatus)}
                        className="w-9 h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#007d55] hover:bg-[#bdffdb] transition-colors"
                        type="button"
                        title="WhatsApp Parent"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                    )}
                  </div>

                  {/* Segmented Buttons (P / A / L / HD) */}
                  <div className="grid grid-cols-4 bg-[#f2f3ff] p-1 rounded-xl gap-1 border border-[#dae2fd]/50">
                    {(['P', 'A', 'L', 'HD'] as const).map(code => {
                      const isActive = student.todayStatus === code;
                      let activeClass = 'bg-[#007d55] text-white font-bold shadow-sm';
                      if (code === 'A') activeClass = 'bg-[#ba1a1a] text-white font-bold shadow-sm';
                      if (code === 'L') activeClass = 'bg-[#4648d4] text-white font-bold shadow-sm';
                      if (code === 'HD') activeClass = 'bg-[#004ac6] text-white font-bold shadow-sm';

                      return (
                        <button
                          key={code}
                          onClick={() => updateStudentAttendance(student.id, code)}
                          className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            isActive
                              ? activeClass
                              : 'text-[#434655] hover:bg-white/80'
                          }`}
                          type="button"
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Save & Sync Dock */}
          <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-2 bg-[#faf8ff]/90 backdrop-blur-md">
            <div className="max-w-xl mx-auto bg-[#283044] text-[#eef0ff] p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-white/10">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse"></span>
                  <span className="text-xs font-bold text-white truncate">Auto-saved 2 mins ago</span>
                </div>
                <span className="text-[10px] text-[#c3c6d7] truncate">Connected: DPS_Attendance_Sync_2024</span>
              </div>
              <button
                onClick={handlePushSheet}
                disabled={isPushing}
                className="px-3.5 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${isPushing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isPushing ? 'Pushing...' : 'Push Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Faculty Log View */
        <div className="px-4 py-3 flex flex-col gap-3 pb-24">
          {teachers.map(tch => (
            <div key={tch.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={tch.avatarUrl}
                    alt={tch.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#004ac6]/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#131b2e]">{tch.name}</h4>
                    <span className="text-xs text-[#737686]">{tch.designation}</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    tch.status === 'In Campus'
                      ? 'bg-[#bdffdb] text-[#002113]'
                      : tch.status === 'On Duty (Exam)'
                      ? 'bg-[#dbe1ff] text-[#00174b]'
                      : 'bg-[#ffdad6] text-[#93000a]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {tch.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e]">
                <div>
                  <span className="text-[10px] text-[#737686] block">Biometric Check-In</span>
                  <span className="font-bold font-mono flex items-center gap-1 text-[#007d55]">
                    <span className="material-symbols-outlined text-[15px]">login</span>
                    {tch.biometricCheckIn}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#737686] block">Scheduled Out</span>
                  <span className="font-bold font-mono flex items-center gap-1 text-[#737686]">
                    <span className="material-symbols-outlined text-[15px]">logout</span>
                    {tch.scheduledOut}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-[#737686] font-medium">Leave Balances:</span>
                <div className="flex items-center gap-2">
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[11px] font-semibold text-[#131b2e]">
                    CL: {tch.leaveBalance.cl}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[11px] font-semibold text-[#131b2e]">
                    SL: {tch.leaveBalance.sl}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[11px] font-semibold text-[#131b2e]">
                    EL: {tch.leaveBalance.el}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      <StudentDetailModal student={inspectStudent} onClose={() => setInspectStudent(null)} />
    </div>
  );
};
