import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher } from '../types';
import { TeacherEditModal } from '../components/TeacherEditModal';
import { FacultySalaryModal } from '../components/FacultySalaryModal';
import {
  Send,
  UserPlus,
  Edit2,
  Fingerprint,
  Phone,
  Mail,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export const TeachersRegisterView: React.FC = () => {
  const {
    teachers,
    updateTeacherStatus,
    showToast,
    openDispatchModal,
    recordFacultyAttendance,
    facultyAttendanceLogs,
    calculateFacultySalary,
    setSelectedFacultyForSlip,
    institution,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'payroll'>('roster');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(false);

  // Principal Authorization state for altering attendance
  const [isPrincipalAuthorized, setIsPrincipalAuthorized] = useState(true);
  const [authNote, setAuthNote] = useState('');
  const [selectedFacultyForAuth, setSelectedFacultyForAuth] = useState<Teacher | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<'P' | 'A' | 'L' | 'HD' | 'OD' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAddNew = () => {
    setEditingTeacher(null);
    setIsNewTeacher(true);
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsNewTeacher(false);
    setIsModalOpen(true);
  };

  const handleCallTeacher = (phone: string, name: string) => {
    showToast(`Connecting direct line to ${name} (${phone})`);
  };

  const handleEmailTeacher = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const initiateAttendanceChange = (teacher: Teacher, status: 'P' | 'A' | 'L' | 'HD' | 'OD') => {
    setSelectedFacultyForAuth(teacher);
    setPendingStatusChange(status);
    setAuthNote(
      status === 'P'
        ? 'Biometric check-in verified at campus gate'
        : status === 'OD'
        ? 'Deputed on official examination / university duty'
        : status === 'L'
        ? 'Casual / Medical leave sanctioned by Principal'
        : status === 'HD'
        ? 'Half-day gate pass authorized'
        : 'Unapproved absence logged'
    );
    setIsAuthModalOpen(true);
  };

  const confirmAttendanceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyForAuth || !pendingStatusChange) return;

    recordFacultyAttendance(
      selectedFacultyForAuth.id,
      pendingStatusChange,
      authNote,
      isPrincipalAuthorized,
      `${institution.principalName} (${institution.principalDesignation})`
    );

    setIsAuthModalOpen(false);
    setSelectedFacultyForAuth(null);
    setPendingStatusChange(null);
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Faculty & Staff Roster</h2>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#bdffdb] text-[#002113] font-bold text-[10px] sm:text-xs rounded-full">
              {teachers.length} Active Staff
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Principal-authorized attendance register, biometric shifts, and automated payroll calculations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Faculty Attendance & Payroll Report',
                reportCategory: 'faculty-summary',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
              })
            }
            className="h-10 px-3 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#131b2e] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            type="button"
          >
            <Send className="w-3.5 h-3.5 text-[#007d55]" />
            <span className="truncate">Push Roster</span>
          </button>

          <button
            onClick={handleAddNew}
            className="h-10 px-3.5 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="truncate">+ Faculty</span>
          </button>
        </div>
      </div>

      {/* Segmented View Mode Controller */}
      <div className="p-1 bg-[#eaedff] rounded-xl sm:rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'roster'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <CalendarCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Faculty Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'attendance'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Attendance Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'payroll'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Wallet className="w-4 h-4 shrink-0" />
          <span className="truncate">Salary & Payroll</span>
        </button>
      </div>

      {/* TAB 1: FACULTY DIRECTORY & ROSTER */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {teachers.map(teacher => (
            <div
              key={teacher.id}
              className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5 sm:space-y-3 flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl object-cover ring-2 ring-[#007d55]/20 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-base text-[#131b2e] truncate">{teacher.name}</h4>
                    <p className="text-[11px] sm:text-xs text-[#007d55] font-semibold truncate">{teacher.designation} • {teacher.subject}</p>
                    <span className="text-[10px] sm:text-[11px] text-[#737686] block mt-0.5 truncate">{teacher.qualification}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                      teacher.status === 'In Campus'
                        ? 'bg-[#bdffdb]/40 text-[#002113] border-[#007d55]/30'
                        : teacher.status === 'On Duty (Exam)'
                        ? 'bg-[#dbe1ff] text-[#004ac6] border-[#004ac6]/30'
                        : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                    }`}
                  >
                    {teacher.status}
                  </span>
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="text-[10px] sm:text-[11px] font-bold text-[#004ac6] hover:underline flex items-center gap-0.5 active:scale-95"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Timetable & Biometric Info */}
              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs text-[#131b2e] border border-[#dae2fd]/50">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block font-bold uppercase">Biometric Check-In</span>
                  <span className="font-bold font-mono text-[#007d55] flex items-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                    <Fingerprint className="w-3.5 h-3.5" />
                    {teacher.biometricCheckIn}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block font-bold uppercase">Scheduled Out</span>
                  <span className="font-bold font-mono text-[#434655] mt-0.5 block text-[11px] sm:text-xs">{teacher.scheduledOut}</span>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] text-[#737686] font-medium">Assigned:</span>
                {teacher.classesAssigned.map(cls => (
                  <span
                    key={cls}
                    className="bg-[#eaedff] text-[#004ac6] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  >
                    {cls}
                  </span>
                ))}
              </div>

              {/* Leave Balance & Contact Buttons */}
              <div className="flex items-center justify-between pt-1.5 border-t border-[#f2f3ff]">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                  <span className="text-[#737686]">Leaves:</span>
                  <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">CL:{teacher.leaveBalance.cl}</span>
                  <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">SL:{teacher.leaveBalance.sl}</span>
                  <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">EL:{teacher.leaveBalance.el}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCallTeacher(teacher.phone, teacher.name)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#004ac6] transition-colors border border-[#dae2fd] active:scale-95"
                    type="button"
                    title="Call Faculty"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEmailTeacher(teacher.email)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#007d55] transition-colors border border-[#dae2fd] active:scale-95"
                    type="button"
                    title="Email Faculty"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FACULTY ATTENDANCE SHEET & PRINCIPAL AUTHORIZATION */}
      {activeTab === 'attendance' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Principal Gate Indicator Banner */}
          <div className="bg-[#f2f3ff] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#dae2fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#007d55] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Principal Authorization Gateway Active</h3>
                <p className="text-[10px] sm:text-xs text-[#737686]">
                  Every attendance alteration (Present, Leave, Absent, On-Duty) requires Principal approval and mandatory audit notes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-[#bdffdb] text-[#002113] text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#007d55]" />
                {institution.principalDesignation} Sign-off Verified
              </span>
            </div>
          </div>

          {/* Faculty Attendance Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] overflow-hidden">
            <div className="p-3 sm:p-4 bg-[#faf8ff] border-b border-[#dae2fd] flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-[#131b2e]">Daily Faculty Attendance Register</span>
              <span className="text-[10px] font-mono text-[#737686]">{new Date().toDateString()}</span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f3ff] text-[#737686] font-bold uppercase text-[10px] border-b border-[#dae2fd]">
                  <tr>
                    <th className="py-3 px-3">Faculty Member</th>
                    <th className="py-3 px-2">Designation / Dept</th>
                    <th className="py-3 px-2">Biometric Punch</th>
                    <th className="py-3 px-2 text-center">Status / Duty</th>
                    <th className="py-3 px-3 text-right">Principal Alter Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f3ff]">
                  {teachers.map(t => (
                    <tr key={t.id} className="hover:bg-[#f2f3ff]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={t.avatarUrl}
                            alt={t.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#004ac6]/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-[#131b2e] block truncate">{t.name}</span>
                            <span className="text-[10px] text-[#737686] block truncate">{t.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-semibold text-xs text-[#131b2e] block truncate">{t.designation}</span>
                        <span className="text-[10px] text-[#007d55] block truncate">{t.subject}</span>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-mono font-semibold text-xs text-[#007d55] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {t.biometricCheckIn}
                        </span>
                        <span className="text-[10px] text-[#737686]">Out: {t.scheduledOut}</span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                            t.status === 'In Campus'
                              ? 'bg-[#bdffdb] text-[#002113]'
                              : t.status === 'On Duty (Exam)'
                              ? 'bg-[#dbe1ff] text-[#00174b]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'P')}
                            className="px-2 py-1 bg-[#bdffdb]/60 hover:bg-[#bdffdb] text-[#002113] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Mark Present with Principal Note"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'OD')}
                            className="px-2 py-1 bg-[#dbe1ff] hover:bg-[#c7d2fe] text-[#004ac6] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Mark On-Duty (Exam / External)"
                          >
                            OD
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'HD')}
                            className="px-2 py-1 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] border border-[#dae2fd] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Mark Half Day"
                          >
                            HD
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'L')}
                            className="px-2 py-1 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Sanction Leave"
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-[#131b2e] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#007d55]" />
                <span>Principal Authorization Audit Trail</span>
              </span>
              <span className="text-[10px] text-[#737686]">{facultyAttendanceLogs.length} Records Logged</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {facultyAttendanceLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] flex items-start justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#131b2e] truncate">{log.teacherName}</span>
                      <span className="px-1.5 py-0.2 bg-[#dbe1ff] text-[#004ac6] text-[9px] font-bold rounded">
                        {log.status === 'P' ? 'Present' : log.status === 'OD' ? 'On Duty' : log.status === 'L' ? 'Leave' : log.status}
                      </span>
                      <span className="text-[9px] text-[#737686]">{log.date}</span>
                    </div>
                    <p className="text-[11px] text-[#434655] italic truncate">
                      "{log.principalNote}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 text-[9px] text-[#007d55] font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.principalName?.split(' ')[0] || 'Principal'}
                    </span>
                    <span className="text-[#737686] font-mono">{log.timestamp.split(',')[1] || log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE-BASED SALARY & PAYROLL LEDGER */}
      {activeTab === 'payroll' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Payroll Header Info Banner */}
          <div className="bg-[#f2f3ff] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#dae2fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Automated Attendance-Based Faculty Payroll</h3>
                <p className="text-[10px] sm:text-xs text-[#737686]">
                  Calculated automatically based on working days, biometric punches, approved leaves, and loss-of-pay (LOP).
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                openDispatchModal({
                  title: 'Monthly Faculty Payroll Matrix',
                  reportCategory: 'faculty-summary',
                  defaultFormat: 'excel',
                  defaultRecipientType: 'principal',
                })
              }
              className="h-9 px-3.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              type="button"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Payroll (Excel)</span>
            </button>
          </div>

          {/* Salary Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f3ff] text-[#737686] font-bold uppercase text-[10px] border-b border-[#dae2fd]">
                  <tr>
                    <th className="py-3 px-3">Faculty & Subject</th>
                    <th className="py-3 px-2 text-center">Base Salary</th>
                    <th className="py-3 px-2 text-center">Attendance Log</th>
                    <th className="py-3 px-2 text-center">LOP Deduction</th>
                    <th className="py-3 px-2 text-center">Duty Allowance</th>
                    <th className="py-3 px-2 text-center">Net Payable</th>
                    <th className="py-3 px-3 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f3ff]">
                  {teachers.map(teacher => {
                    const slip = calculateFacultySalary(teacher, 26, 'October 2024');
                    return (
                      <tr key={teacher.id} className="hover:bg-[#f2f3ff]/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#004ac6]/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[#131b2e] block truncate">{teacher.name}</span>
                              <span className="text-[10px] text-[#737686] block truncate">{teacher.designation}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-semibold text-xs text-[#131b2e]">
                          {institution.currencySymbol}{slip.baseMonthlySalary.toLocaleString()}
                        </td>

                        <td className="py-3 px-2 text-center">
                          <span className="font-bold text-[#007d55] text-xs font-mono">{slip.presentDays}P</span>
                          {slip.onDutyDays > 0 && <span className="text-[#004ac6] font-bold text-xs font-mono"> + {slip.onDutyDays}OD</span>}
                          {slip.unpaidAbsences > 0 && <span className="text-[#ba1a1a] font-bold text-xs font-mono"> - {slip.unpaidAbsences}A</span>}
                          <span className="text-[10px] text-[#737686] block">/ {slip.totalWorkingDays} days</span>
                        </td>

                        <td className="py-3 px-2 text-center font-mono text-xs text-[#ba1a1a] font-semibold">
                          {slip.lopDeduction > 0 ? `-${institution.currencySymbol}${slip.lopDeduction.toLocaleString()}` : '₹0'}
                        </td>

                        <td className="py-3 px-2 text-center font-mono text-xs text-[#007d55] font-semibold">
                          {slip.dutyAllowance > 0 ? `+${institution.currencySymbol}${slip.dutyAllowance.toLocaleString()}` : '₹0'}
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-bold text-sm text-[#004ac6]">
                          {institution.currencySymbol}{slip.netPayableSalary.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedFacultyForSlip(slip)}
                            className="h-8 px-3 bg-[#eaedff] hover:bg-[#dbe1ff] text-[#004ac6] text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
                          >
                            View Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Principal Authorization & Note Alteration Modal */}
      {isAuthModalOpen && selectedFacultyForAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#007d55] text-white p-3.5 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm">Principal Attendance Authorization</h3>
                  <p className="text-[10px] text-white/80">{selectedFacultyForAuth.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={confirmAttendanceChange} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#737686] uppercase">Selected Action:</span>
                <p className="font-bold text-[#131b2e] text-xs">
                  Change Status to <span className="text-[#007d55] font-mono font-bold">[{pendingStatusChange}]</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#737686] uppercase">
                  Mandatory Authorization Note / Reason:
                </label>
                <textarea
                  required
                  rows={3}
                  value={authNote}
                  onChange={e => setAuthNote(e.target.value)}
                  placeholder="e.g. Sanctioned by Principal Dr. Anita Roy for external board exam evaluation"
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#bdffdb]/40 p-2.5 rounded-xl border border-[#007d55]/20">
                <CheckCircle2 className="w-4 h-4 text-[#007d55] shrink-0" />
                <span className="text-[11px] text-[#002113]">
                  Authorized by <strong>{institution.principalName} ({institution.principalDesignation})</strong>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="h-9 px-3 bg-white border border-[#dae2fd] rounded-xl text-xs font-bold text-[#434655]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorize & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Edit Modal */}
      <TeacherEditModal
        teacher={editingTeacher}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isNew={isNewTeacher}
      />

      {/* Faculty Salary Payslip Modal */}
      <FacultySalaryModal />
    </div>
  );
};
