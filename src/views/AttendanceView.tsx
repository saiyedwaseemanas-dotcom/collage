import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { StudentEditModal } from '../components/StudentEditModal';
import {
  GraduationCap,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Send,
  Plus,
  CheckCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Edit3,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';

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
    showToast,
    institution,
    openDispatchModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'student' | 'faculty'>('student');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Filter students by selected class
  const classGradeKey = selectedClass.replace('Class ', '');
  const filteredByClass = selectedClass === 'ALL' 
    ? students 
    : students.filter(s => s.gradeLevel === classGradeKey);

  const displayStudents = filterDefaultersOnly
    ? filteredByClass.filter(s => s.attendancePct < institution.defaulterThreshold)
    : filteredByClass;

  // Realtime counts
  const countP = filteredByClass.filter(s => s.todayStatus === 'P').length;
  const countA = filteredByClass.filter(s => s.todayStatus === 'A').length;
  const countL = filteredByClass.filter(s => s.todayStatus === 'L').length;
  const countHD = filteredByClass.filter(s => s.todayStatus === 'HD').length;
  const defaulterCount = filteredByClass.filter(s => s.attendancePct < institution.defaulterThreshold).length;

  const handlePushSheet = async () => {
    setIsPushing(true);
    await new Promise(r => setTimeout(r, 800));
    setIsPushing(false);
    showToast(`Instant Saved & Synced! ${filteredByClass.length} Daily Attendance rows registered in Master Database`);
  };

  const handleOpenWhatsApp = (student: Student) => {
    openDispatchModal({
      title: `Daily Attendance Update: ${student.name}`,
      reportCategory: 'attendance-register',
      defaultFormat: 'pdf',
      defaultRecipientType: 'parent',
      targetStudent: student,
    });
  };

  const handleDefaulterAlert = (student: Student) => {
    openDispatchModal({
      title: `Urgent Defaulter Warning: ${student.name}`,
      reportCategory: 'attendance-register',
      defaultFormat: 'pdf',
      defaultRecipientType: 'parent',
      targetStudent: student,
    });
  };

  return (
    <div className="flex flex-col w-full text-left max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Controls Banner */}
      <div className="py-2.5 sm:py-3 flex flex-col gap-2.5">
        {/* View Switcher Segmented Control */}
        <div className="p-1 bg-[#eaedff] rounded-2xl flex items-center justify-between shadow-inner">
          <button
            onClick={() => setActiveSubTab('student')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeSubTab === 'student'
                ? 'bg-white text-[#004ac6] shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">Student Register</span>
          </button>
          <button
            onClick={() => setActiveSubTab('faculty')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeSubTab === 'faculty'
                ? 'bg-white text-[#004ac6] shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Faculty Biometric</span>
          </button>
        </div>

        {/* Date Strip & Shift Navigator + Push Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl shadow-xs border border-[#eaedff] gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => shiftDate(-1)}
              className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:text-[#004ac6] transition-colors shrink-0 active:scale-95"
              type="button"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="w-4 h-4 text-[#004ac6] shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{currentDateLabel}</span>
              <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse shrink-0"></span>
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="w-9 h-9 rounded-xl bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:text-[#004ac6] transition-colors shrink-0 active:scale-95"
              type="button"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              onClick={() =>
                openDispatchModal({
                  title: `Attendance Register: ${selectedClass}`,
                  reportCategory: 'attendance-register',
                  defaultFormat: 'pdf',
                  defaultRecipientType: 'principal',
                  targetClass: selectedClass,
                })
              }
              className="h-10 sm:h-9 px-3 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Push Report</span>
            </button>

            <button
              onClick={() => {
                setEditingStudent(null);
                setIsNewStudent(true);
                setIsEditModalOpen(true);
              }}
              className="h-10 sm:h-9 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
              type="button"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Add Student</span>
            </button>
          </div>
        </div>

        {/* Class Selector Filter Pills */}
        {activeSubTab === 'student' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
            {(['ALL', 'Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 11-Sci', 'Class 12-Sci'] as const).map(cls => {
              const isSelected = selectedClass === cls;
              const count = cls === 'ALL'
                ? students.length
                : students.filter(s => s.gradeLevel === cls.replace('Class ', '')).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'text-[#434655] bg-white border border-[#dae2fd] hover:bg-[#eaedff]'
                  }`}
                  type="button"
                >
                  <span>{cls === 'ALL' ? 'All Classes' : cls}</span>
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
        <div className="flex flex-col w-full pb-32">
          {/* Realtime Metric Ticker (Updates in <1s) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-xs border border-[#eaedff]">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">Present</span>
              <span className="text-base sm:text-lg font-bold text-[#007d55]">{countP}</span>
            </div>
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-xs border border-[#eaedff]">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">Absent</span>
              <span className="text-base sm:text-lg font-bold text-[#ba1a1a]">{countA}</span>
            </div>
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-xs border border-[#eaedff]">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">Leave</span>
              <span className="text-base sm:text-lg font-bold text-[#4648d4]">{countL}</span>
            </div>
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-xs border border-[#eaedff]">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">Half-Day</span>
              <span className="text-base sm:text-lg font-bold text-[#004ac6]">{countHD}</span>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={markAllPresent}
                className="flex-1 sm:flex-initial h-10 px-3.5 bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <CheckCheck className="w-4 h-4 shrink-0" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => setFilterDefaultersOnly(prev => !prev)}
                className={`flex-1 sm:flex-initial h-10 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                  filterDefaultersOnly
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6]/80'
                }`}
                type="button"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">&lt;{institution.defaulterThreshold}%</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    filterDefaultersOnly ? 'bg-white text-[#ba1a1a]' : 'bg-[#ba1a1a] text-white'
                  }`}
                >
                  {defaulterCount}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto sm:ml-auto">
              <button
                onClick={() =>
                  openDispatchModal({
                    title: 'Attendance Register Spreadsheet',
                    reportCategory: 'attendance-register',
                    defaultFormat: 'excel',
                    defaultRecipientType: 'principal',
                  })
                }
                className="h-9 px-2.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#f2f3ff] active:scale-95 transition-all"
                type="button"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#007d55]" />
                <span>Excel</span>
              </button>
              <button
                onClick={() =>
                  openDispatchModal({
                    title: 'Official Attendance Register PDF',
                    reportCategory: 'attendance-register',
                    defaultFormat: 'pdf',
                    defaultRecipientType: 'principal',
                  })
                }
                className="h-9 px-2.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#f2f3ff] active:scale-95 transition-all"
                type="button"
              >
                <FileText className="w-4 h-4 text-[#ba1a1a]" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Student Roster Cards */}
          <div className="flex flex-col gap-2.5">
            {displayStudents.map(student => {
              const isDefaulter = student.attendancePct < institution.defaulterThreshold;
              return (
                <div
                  key={student.id}
                  className={`bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border transition-all flex flex-col gap-2.5 ${
                    isDefaulter
                      ? 'border-[#ba1a1a]/40 bg-[#fffbfa]'
                      : 'border-[#eaedff]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      onClick={() => setInspectStudent(student)}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDefaulter
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#dbe1ff] text-[#004ac6]'
                        }`}
                      >
                        {student.rollNo}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{student.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] sm:text-[10px] font-bold shrink-0 ${
                              isDefaulter ? 'bg-[#ba1a1a] text-white' : 'bg-[#f2f3ff] text-[#737686]'
                            }`}
                          >
                            {student.attendancePct}%
                          </span>
                        </div>
                        <span className={`text-[10px] sm:text-[11px] truncate ${isDefaulter ? 'text-[#ba1a1a] font-semibold' : 'text-[#737686]'}`}>
                          {isDefaulter
                            ? 'Below Minimum Requirement'
                            : `${student.classSec} • ${student.parentName}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDefaulter ? (
                        <button
                          onClick={() => handleDefaulterAlert(student)}
                          className="h-8 px-2.5 rounded-xl bg-[#ba1a1a] text-white flex items-center gap-1 text-[11px] sm:text-xs font-bold shadow-xs active:scale-95 transition-transform"
                          type="button"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Alert</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenWhatsApp(student)}
                          className="h-8 px-2.5 rounded-xl bg-[#007d55] text-white flex items-center gap-1 text-[11px] sm:text-xs font-bold hover:bg-[#006644] transition-colors active:scale-95"
                          type="button"
                          title="WhatsApp Parent"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">WA</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setIsNewStudent(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#004ac6] border border-[#dae2fd] shrink-0 active:scale-95 transition-all"
                        title="Edit Student"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Segmented Buttons (P / A / L / HD) - 40px touch height on mobile */}
                  <div className="grid grid-cols-4 bg-[#f2f3ff] p-1 rounded-xl sm:rounded-2xl gap-1 border border-[#dae2fd]/50">
                    {(['P', 'A', 'L', 'HD'] as const).map(code => {
                      const isActive = student.todayStatus === code;
                      let activeClass = 'bg-[#007d55] text-white font-bold shadow-xs';
                      if (code === 'A') activeClass = 'bg-[#ba1a1a] text-white font-bold shadow-xs';
                      if (code === 'L') activeClass = 'bg-[#4648d4] text-white font-bold shadow-xs';
                      if (code === 'HD') activeClass = 'bg-[#004ac6] text-white font-bold shadow-xs';

                      return (
                        <button
                          key={code}
                          onClick={() => updateStudentAttendance(student.id, code)}
                          className={`h-9 sm:h-8 rounded-lg sm:rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center active:scale-95 ${
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
          <div className="fixed bottom-14 sm:bottom-16 left-0 right-0 z-30 px-3 sm:px-4 py-2 bg-[#faf8ff]/90 backdrop-blur-md">
            <div className="max-w-xl mx-auto bg-[#1e293b] text-[#eef0ff] p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center justify-between gap-2 border border-white/10">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse shrink-0"></span>
                  <span className="text-xs font-bold text-white truncate">Auto-saved to Local Storage</span>
                </div>
                <span className="text-[10px] text-[#c3c6d7] truncate">{institution.shortName} Database</span>
              </div>
              <button
                onClick={handlePushSheet}
                disabled={isPushing}
                className="h-9 px-3.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
                type="button"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                <span>{isPushing ? 'Saving...' : 'Save & Sync'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Faculty Log View */
        <div className="flex flex-col gap-2.5 pb-28">
          {teachers.map(tch => (
            <div key={tch.id} className="bg-white p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={tch.avatarUrl}
                    alt={tch.name}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{tch.name}</h4>
                    <span className="text-[11px] text-[#737686] truncate block">{tch.designation}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shrink-0 ${
                    tch.status === 'In Campus'
                      ? 'bg-[#bdffdb] text-[#002113]'
                      : tch.status === 'On Duty (Exam)'
                      ? 'bg-[#dbe1ff] text-[#00174b]'
                      : 'bg-[#ffdad6] text-[#93000a]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span className="truncate">{tch.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2 rounded-2xl text-xs text-[#131b2e]">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block">Biometric In</span>
                  <span className="font-bold font-mono flex items-center gap-1 text-[#007d55] text-xs">
                    <LogIn className="w-3.5 h-3.5 shrink-0" />
                    <span>{tch.biometricCheckIn}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block">Scheduled Out</span>
                  <span className="font-bold font-mono flex items-center gap-1 text-[#737686] text-xs">
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>{tch.scheduledOut}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#737686] font-medium">Leave Balances:</span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[10px] font-semibold text-[#131b2e]">
                    CL: {tch.leaveBalance.cl}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[10px] font-semibold text-[#131b2e]">
                    SL: {tch.leaveBalance.sl}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[10px] font-semibold text-[#131b2e]">
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

      {/* Student Edit Modal */}
      <StudentEditModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isNew={isNewStudent}
      />
    </div>
  );
};
