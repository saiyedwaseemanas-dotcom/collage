import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, TeacherLeaveType, TeacherLeaveApplication } from '../types';
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
  FileText,
  Plus,
  XCircle,
  Calendar,
  Check,
  Building2,
  Users,
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
    leaveApplications,
    submitLeaveApplication,
    reviewLeaveApplication,
    institution,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'leaves' | 'payroll'>('roster');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(false);

  // Principal Authorization state for altering attendance
  const [isPrincipalAuthorized, setIsPrincipalAuthorized] = useState(true);
  const [authNote, setAuthNote] = useState('');
  const [selectedFacultyForAuth, setSelectedFacultyForAuth] = useState<Teacher | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<'P' | 'A' | 'L' | 'HD' | 'OD' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Leave Management State
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveApplicantId, setLeaveApplicantId] = useState(teachers[0]?.id || '');
  const [selectedLeaveType, setSelectedLeaveType] = useState<TeacherLeaveType>('Casual Leave (CL)');
  const [leaveFromDate, setLeaveFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [leaveToDate, setLeaveToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [leaveDaysCount, setLeaveDaysCount] = useState<number>(1);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubstitute, setLeaveSubstitute] = useState('');

  // Review Leave Modal State
  const [reviewingApp, setReviewingApp] = useState<TeacherLeaveApplication | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const pendingLeaves = leaveApplications.filter(a => a.status === 'Pending');
  const approvedLeaves = leaveApplications.filter(a => a.status === 'Approved');

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

  const handleOpenApplyLeave = (teacher?: Teacher) => {
    if (teacher) {
      setLeaveApplicantId(teacher.id);
    } else if (teachers.length > 0) {
      setLeaveApplicantId(teachers[0].id);
    }
    setLeaveReason('');
    setLeaveSubstitute(teachers[1]?.name || 'Department Colleague');
    setIsApplyLeaveModalOpen(true);
  };

  const handleFormSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const applicant = teachers.find(t => t.id === leaveApplicantId) || teachers[0];
    if (!applicant) return;

    if (!leaveReason.trim()) {
      showToast('Please provide a reason for the leave application', 'warning');
      return;
    }

    submitLeaveApplication({
      teacherId: applicant.id,
      teacherName: applicant.name,
      teacherSubject: applicant.subject,
      leaveType: selectedLeaveType,
      fromDate: leaveFromDate,
      toDate: leaveToDate,
      daysCount: Math.max(1, leaveDaysCount),
      reason: leaveReason,
      substituteTeacherName: leaveSubstitute,
    });

    setIsApplyLeaveModalOpen(false);
  };

  const handleOpenReview = (app: TeacherLeaveApplication, decision: 'Approved' | 'Rejected') => {
    setReviewingApp(app);
    setReviewDecision(decision);
    setReviewRemarks(decision === 'Approved' ? 'Leave sanctioned with official duty cover' : 'Leave application could not be sanctioned due to ongoing examinations');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;

    reviewLeaveApplication(reviewingApp.id, reviewDecision, reviewRemarks);
    setIsReviewModalOpen(false);
    setReviewingApp(null);
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
            Principal-authorized attendance register, biometric shifts, teacher leave approval workflow, and automated payroll calculations.
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

        {/* TEACHER LEAVE APPROVAL TAB */}
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'leaves'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">Leave Portal</span>
          {pendingLeaves.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center ml-0.5 animate-pulse">
              {pendingLeaves.length}
            </span>
          )}
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

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${
                      teacher.status === 'In Campus'
                        ? 'bg-[#bdffdb] text-[#002113]'
                        : teacher.status === 'On Duty (Exam)'
                        ? 'bg-[#dbe1ff] text-[#00174b]'
                        : teacher.status === 'On Leave'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#eaedff] text-[#434655]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    <span className="truncate">{teacher.status}</span>
                  </span>

                  <button
                    onClick={() => handleEdit(teacher)}
                    className="p-1 sm:p-1.5 text-[#737686] hover:text-[#004ac6] hover:bg-[#f2f3ff] rounded-lg transition-colors"
                    title="Edit Faculty Record"
                    type="button"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Shift & Biometric Telemetry */}
              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2.5 rounded-xl sm:rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-[#737686] font-semibold block">Biometric Punch</span>
                  <div className="flex items-center gap-1 text-[#007d55] font-bold font-mono text-[11px] sm:text-xs mt-0.5">
                    <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                    <span>{teacher.biometricCheckIn}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#737686] font-semibold block">Scheduled Dep.</span>
                  <div className="flex items-center gap-1 text-[#434655] font-mono text-[11px] sm:text-xs mt-0.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{teacher.scheduledOut}</span>
                  </div>
                </div>
              </div>

              {/* Leave Balances Pill Matrix */}
              <div className="flex items-center justify-between text-[11px] bg-[#faf8ff] p-2 rounded-xl border border-[#eaedff]">
                <span className="text-[#737686] font-semibold text-[10px] uppercase">Leave Balances:</span>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[#004ac6]">
                    CL: {teacher.leaveBalance?.cl ?? 8}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[#007d55]">
                    SL: {teacher.leaveBalance?.sl ?? 6}
                  </span>
                  <span className="bg-[#f2f3ff] px-2 py-0.5 rounded text-[#434655]">
                    EL: {teacher.leaveBalance?.el ?? 10}
                  </span>
                </div>
              </div>

              {/* Footer Quick Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#eaedff]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCallTeacher(teacher.phone, teacher.name)}
                    className="p-1.5 bg-[#f2f3ff] text-[#004ac6] hover:bg-[#eaedff] rounded-xl transition-colors"
                    title={`Call ${teacher.phone}`}
                    type="button"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleEmailTeacher(teacher.email)}
                    className="p-1.5 bg-[#f2f3ff] text-[#004ac6] hover:bg-[#eaedff] rounded-xl transition-colors"
                    title={`Email ${teacher.email}`}
                    type="button"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenApplyLeave(teacher)}
                    className="h-8 px-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-xl text-[11px] font-bold flex items-center gap-1"
                    type="button"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Apply Leave</span>
                  </button>

                  <button
                    onClick={() => {
                      const slip = calculateFacultySalary(teacher);
                      setSelectedFacultyForSlip(slip);
                    }}
                    className="h-8 px-3 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    type="button"
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Payslip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PRINCIPAL AUTHORIZED ATTENDANCE SHEET */}
      {activeTab === 'attendance' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[#f2f3ff] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#dae2fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#007d55] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Daily Faculty Attendance Register</h3>
                <p className="text-[10px] sm:text-xs text-[#737686]">
                  Attendance alter/update requires Principal authorization with logged audit note.
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-white text-[#007d55] px-3 py-1 rounded-full border border-[#dae2fd]">
              Auth: {institution.principalName} ({institution.principalDesignation})
            </span>
          </div>

          {/* Daily Attendance Sheet Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[10px] sm:text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4">Faculty Member</th>
                    <th className="py-3 px-2">Designation</th>
                    <th className="py-3 px-2">Today's Status</th>
                    <th className="py-3 px-2">Punch Time</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Alter Attendance (Principal Auth)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {teachers.map(t => (
                    <tr key={t.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-bold text-[#131b2e] flex items-center gap-2">
                        <img
                          src={t.avatarUrl}
                          alt={t.name}
                          className="w-7 h-7 rounded-xl object-cover ring-1 ring-[#dae2fd] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="truncate block font-bold">{t.name}</span>
                          <span className="text-[10px] text-[#737686] font-normal">{t.subject}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#434655] font-medium">{t.designation}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'In Campus'
                              ? 'bg-[#bdffdb] text-[#002113]'
                              : t.status === 'On Duty (Exam)'
                              ? 'bg-[#dbe1ff] text-[#00174b]'
                              : t.status === 'On Leave'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : 'bg-[#eaedff] text-[#434655]'
                          }`}
                        >
                          {t.status === 'In Campus' ? 'Present (P)' : t.status === 'On Duty (Exam)' ? 'On Duty (OD)' : 'On Leave (L)'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-[#007d55] font-semibold">
                        {t.biometricCheckIn || '08:00 AM'}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'P')}
                            className="px-2 py-1 bg-[#bdffdb] hover:bg-[#a0f7c8] text-[#002113] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Mark Present"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateAttendanceChange(t, 'OD')}
                            className="px-2 py-1 bg-[#dbe1ff] hover:bg-[#c4d2ff] text-[#00174b] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                            title="Mark On Duty"
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

      {/* TAB 3: TEACHER LEAVE APPLICATION & APPROVAL PORTAL */}
      {activeTab === 'leaves' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Header Summary Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider">Pending Approvals</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-extrabold text-[#ba1a1a]">{pendingLeaves.length}</span>
                <span className="text-[10px] text-[#737686]">Requires Principal Sign</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#007d55] uppercase tracking-wider">Approved Leaves</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-extrabold text-[#007d55]">{approvedLeaves.length}</span>
                <span className="text-[10px] text-[#737686]">This Session</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">Staff On Leave Today</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-extrabold text-[#004ac6]">
                  {teachers.filter(t => t.status === 'On Leave').length}
                </span>
                <span className="text-[10px] text-[#737686]">Authorized</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider">Total Faculty</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-extrabold text-[#131b2e]">{teachers.length}</span>
                <button
                  onClick={() => handleOpenApplyLeave()}
                  className="text-xs font-bold text-[#004ac6] hover:underline"
                >
                  + Apply Leave
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">Teacher Leave Management & Sanctions</h3>
              <p className="text-xs text-[#737686]">
                Sanctioned leaves automatically deduct from leave balances and update daily attendance logs.
              </p>
            </div>
            <button
              onClick={() => handleOpenApplyLeave()}
              className="h-9 px-4 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>+ Apply for Leave</span>
            </button>
          </div>

          {/* PENDING APPROVALS QUEUE (FOR PRINCIPAL) */}
          {pendingLeaves.length > 0 && (
            <div className="bg-amber-500/5 rounded-2xl sm:rounded-3xl p-4 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pending Principal Authorizations ({pendingLeaves.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingLeaves.map(app => (
                  <div key={app.id} className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#131b2e]">{app.teacherName}</h4>
                        <span className="text-xs text-[#004ac6] font-semibold">{app.teacherSubject}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {app.leaveType}
                      </span>
                    </div>

                    <div className="bg-[#faf8ff] p-2.5 rounded-xl space-y-1 text-xs text-[#434655]">
                      <div className="flex justify-between">
                        <span className="text-[#737686]">Dates:</span>
                        <span className="font-semibold text-[#131b2e]">{app.fromDate} to {app.toDate} ({app.daysCount} days)</span>
                      </div>
                      <div>
                        <span className="text-[#737686] block text-[10px] uppercase font-bold">Reason:</span>
                        <p className="text-[#131b2e] italic mt-0.5">"{app.reason}"</p>
                      </div>
                      {app.substituteTeacherName && (
                        <div className="flex justify-between pt-1 border-t border-[#eaedff] text-[11px]">
                          <span className="text-[#737686]">Substitute:</span>
                          <span className="font-semibold text-[#007d55]">{app.substituteTeacherName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#eaedff]">
                      <button
                        onClick={() => handleOpenReview(app, 'Rejected')}
                        className="h-8 px-3 rounded-xl bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] text-xs font-bold transition-all"
                        type="button"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenReview(app, 'Approved')}
                        className="h-8 px-3.5 rounded-xl bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                        type="button"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sanction & Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALL LEAVE APPLICATIONS REGISTER */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-[#eaedff] flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-[#131b2e]">All Leave Applications & Decision History</h4>
              <span className="text-xs text-[#737686]">{leaveApplications.length} Recorded Requests</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[10px] sm:text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4">Applicant</th>
                    <th className="py-3 px-2">Leave Type</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">Reason</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Principal Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {leaveApplications.map(app => (
                    <tr key={app.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="py-3 px-3 sm:px-4">
                        <span className="font-bold text-[#131b2e] block">{app.teacherName}</span>
                        <span className="text-[10px] text-[#737686]">{app.teacherSubject}</span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-[#004ac6]">{app.leaveType}</td>
                      <td className="py-3 px-2 font-mono text-[11px]">
                        {app.fromDate} ({app.daysCount}d)
                      </td>
                      <td className="py-3 px-2 text-[#434655] max-w-xs truncate" title={app.reason}>
                        {app.reason}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            app.status === 'Approved'
                              ? 'bg-[#bdffdb] text-[#002113]'
                              : app.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#ffdad6] text-[#93000a]'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right text-[11px]">
                        {app.reviewedBy ? (
                          <div>
                            <span className="text-[#007d55] font-bold block">{app.reviewedBy.split(' ')[0]}</span>
                            <span className="text-[10px] text-[#737686] italic truncate block max-w-[150px] ml-auto">
                              "{app.principalRemarks}"
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#737686] italic">Pending Decision</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FACULTY LEAVE BALANCES MATRIX */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#007d55]" />
                <span>Annual Leave Balance Matrix (CL / SL / EL)</span>
              </h4>
              <span className="text-xs text-[#737686]">Academic Year Quota</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {teachers.map(t => (
                <div key={t.id} className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={t.avatarUrl} alt={t.name} className="w-7 h-7 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[#131b2e] block truncate">{t.name}</span>
                      <span className="text-[10px] text-[#737686] truncate block">{t.designation}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-white p-1.5 rounded-xl border border-[#dae2fd]">
                      <span className="text-[9px] text-[#737686] block">CL</span>
                      <span className="text-xs font-bold text-[#004ac6]">{t.leaveBalance?.cl ?? 8}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-[#dae2fd]">
                      <span className="text-[9px] text-[#737686] block">SL</span>
                      <span className="text-xs font-bold text-[#007d55]">{t.leaveBalance?.sl ?? 6}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-[#dae2fd]">
                      <span className="text-[9px] text-[#737686] block">EL</span>
                      <span className="text-xs font-bold text-[#434655]">{t.leaveBalance?.el ?? 10}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE-BASED SALARY & PAYROLL LEDGER */}
      {activeTab === 'payroll' && (
        <div className="space-y-3 sm:space-y-4">
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

          {/* Payroll Matrix Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[10px] sm:text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4">Faculty Member</th>
                    <th className="py-3 px-2 text-right">Base Salary</th>
                    <th className="py-3 px-2 text-center">Attendance Log (P / OD / L)</th>
                    <th className="py-3 px-2 text-right">LOP Deduction</th>
                    <th className="py-3 px-2 text-right">Duty Allowance</th>
                    <th className="py-3 px-2 text-right font-bold text-[#007d55]">Net Payable</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {teachers.map(teacher => {
                    const slip = calculateFacultySalary(teacher);
                    return (
                      <tr key={teacher.id} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-bold text-[#131b2e]">
                          <span className="block">{teacher.name}</span>
                          <span className="text-[10px] text-[#737686] font-normal">{teacher.subject} • {teacher.designation}</span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-[#131b2e]">
                          {institution.currencySymbol}{slip.baseMonthlySalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[11px]">
                          <span className="text-[#007d55] font-bold">{slip.presentDays}P</span> /{' '}
                          <span className="text-[#004ac6] font-bold">{slip.onDutyDays}OD</span> /{' '}
                          <span className="text-[#ba1a1a] font-bold">{slip.unpaidAbsences}LOP</span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-[#ba1a1a]">
                          {slip.lopDeduction > 0 ? `-${institution.currencySymbol}${slip.lopDeduction.toLocaleString()}` : '₹0'}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-[#004ac6]">
                          {slip.dutyAllowance > 0 ? `+${institution.currencySymbol}${slip.dutyAllowance.toLocaleString()}` : '₹0'}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-extrabold text-[#007d55] text-sm">
                          {institution.currencySymbol}{slip.netPayableSalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <button
                            onClick={() => setSelectedFacultyForSlip(slip)}
                            className="h-8 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl font-bold text-xs active:scale-95 transition-all"
                            type="button"
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

      {/* MODAL 1: TEACHER LEAVE APPLICATION MODAL */}
      {isApplyLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Teacher Leave Application</h3>
                  <p className="text-xs text-white/80">Submit leave request for Principal's sanction</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmitLeave} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Select Faculty Member</label>
                <select
                  value={leaveApplicantId}
                  onChange={e => setLeaveApplicantId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation} - {t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Leave Category</label>
                <select
                  value={selectedLeaveType}
                  onChange={e => setSelectedLeaveType(e.target.value as TeacherLeaveType)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                  <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                  <option value="Half Day (HD)">Half Day (HD)</option>
                  <option value="On Duty (OD)">On Duty (OD - University / Exam Duty)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[#737686]">From Date</label>
                  <input
                    type="date"
                    required
                    value={leaveFromDate}
                    onChange={e => setLeaveFromDate(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[#737686]">To Date</label>
                  <input
                    type="date"
                    required
                    value={leaveToDate}
                    onChange={e => setLeaveToDate(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Reason for Leave</label>
                <textarea
                  required
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="e.g. Attending sister's wedding / Urgent medical consultation"
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Class Handover / Substitute Teacher</label>
                <input
                  type="text"
                  value={leaveSubstitute}
                  onChange={e => setLeaveSubstitute(e.target.value)}
                  placeholder="e.g. Ms. Preeti Sharma (Assigned substitution periods)"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyLeaveModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-[#737686]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINCIPAL LEAVE APPROVAL / REJECTION MODAL */}
      {isReviewModalOpen && reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
              reviewDecision === 'Approved' ? 'bg-[#007d55]' : 'bg-[#ba1a1a]'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-base sm:text-lg">
                  {reviewDecision === 'Approved' ? 'Sanction Teacher Leave' : 'Reject Leave Application'}
                </h3>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-4 sm:p-5 space-y-3 text-xs">
              <div className="p-3 bg-[#f2f3ff] rounded-xl space-y-1">
                <div className="font-bold text-[#131b2e] text-sm">{reviewingApp.teacherName}</div>
                <div className="text-[#004ac6]">{reviewingApp.leaveType} • {reviewingApp.fromDate} to {reviewingApp.toDate}</div>
                <p className="text-[#737686] italic">"{reviewingApp.reason}"</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Principal Authorization Note / Remarks</label>
                <textarea
                  required
                  rows={3}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="h-9 px-3 rounded-xl text-xs font-bold text-[#737686]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`h-9 px-4 rounded-xl text-xs font-bold text-white shadow-xs ${
                    reviewDecision === 'Approved' ? 'bg-[#007d55] hover:bg-[#006644]' : 'bg-[#ba1a1a] hover:bg-[#93000a]'
                  }`}
                >
                  Confirm {reviewDecision}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ATTENDANCE STATUS CHANGE AUTHORIZATION */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#004ac6] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6ffbbe]" />
                <h3 className="font-bold text-sm sm:text-base">
                  Authorize Status: {selectedFacultyForAuth?.name}
                </h3>
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
                  placeholder="e.g. Sanctioned by Principal for external university board evaluation"
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
