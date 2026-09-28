import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BellRing,
  X,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
  Layers,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';

export const FeeReminderModal: React.FC = () => {
  const {
    isFeeReminderModalOpen,
    setIsFeeReminderModalOpen,
    feeReminderTargetRole,
    setFeeReminderTargetRole,
    feeReminderClass,
    setFeeReminderClass,
    classes,
    students,
    getFeeForStudent,
    institution,
    showToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'partial'>('all');
  const [currentQueueIdx, setCurrentQueueIdx] = useState(0);
  const [sentStudentIds, setSentStudentIds] = useState<string[]>([]);
  const [activePreviewType, setActivePreviewType] = useState<'parent-whatsapp' | 'student-popup' | 'teacher-roster'>('parent-whatsapp');
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);

  if (!isFeeReminderModalOpen) return null;

  // Class-wise students with pending dues
  const classStudents = students.filter(s => {
    if (feeReminderClass !== 'ALL') {
      const match = s.classSec === feeReminderClass || s.gradeLevel === feeReminderClass.replace('Class ', '');
      if (!match) return false;
    }
    const fee = getFeeForStudent(s.id, s.classSec);
    if (fee.balanceDue <= 0) return false;
    if (statusFilter === 'overdue' && fee.status !== 'Overdue') return false;
    if (statusFilter === 'partial' && fee.status !== 'Partial') return false;
    return true;
  });

  const totalClassDue = classStudents.reduce((acc, s) => acc + getFeeForStudent(s.id, s.classSec).balanceDue, 0);
  
  // Safe index within classStudents
  const safeIdx = classStudents.length > 0 ? Math.min(currentQueueIdx, classStudents.length - 1) : 0;
  const currentStudent = classStudents[safeIdx];
  const currentStudentFee = currentStudent
    ? getFeeForStudent(currentStudent.id, currentStudent.classSec)
    : { totalBilled: 0, totalPaid: 0, balanceDue: 0, status: 'Paid' as const };

  const isCurrentSent = currentStudent ? sentStudentIds.includes(currentStudent.id) : false;

  const handleSendSingleReminder = (studentId: string, studentName: string, phone: string, balance: number, rollNo: string, classSec: string) => {
    const cleanPhone = (phone || '919876543210').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `*URGENT: ACADEMIC FEE REMINDER - ${institution.name.toUpperCase()}*\n` +
      `Dear Parent of *${studentName}* (Roll #${rollNo}, ${classSec}),\n\n` +
      `This is an official advisory regarding the pending academic fee installment of *${institution.currencySymbol}${balance.toLocaleString()}*.\n` +
      `Please clear the balance to ensure seamless access to examinations and student portal services.\n\n` +
      `💳 Online Payment UPI ID: accounts@${institution.shortName.toLowerCase()}.org\n` +
      `For queries, contact Accounts & Bursar Office.\n\n` +
      `Warm regards,\n` +
      `Accounts & Bursar, ${institution.shortName}`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    
    // Mark as sent in state
    if (!sentStudentIds.includes(studentId)) {
      setSentStudentIds(prev => [...prev, studentId]);
    }
    
    showToast(`Dispatched 1-by-1 fee reminder for ${studentName} (${safeIdx + 1} of ${classStudents.length})`, 'success');

    // Automatically step to next student if available
    if (safeIdx + 1 < classStudents.length) {
      setCurrentQueueIdx(safeIdx + 1);
    }
  };

  const handleResetQueue = () => {
    setSentStudentIds([]);
    setCurrentQueueIdx(0);
    showToast('Class fee reminder queue reset to first student', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#004ac6] via-[#1e3a8a] to-[#002113] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg truncate">Class-Wise Fee Reminder (One-by-One Dispatch)</h3>
                <span className="text-[10px] font-bold bg-[#bdffdb] text-[#002113] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  1-by-1 Verified
                </span>
              </div>
              <p className="text-xs text-white/80 truncate">
                Individual student-by-student verification & direct dispatch for {feeReminderClass}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFeeReminderModalOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-[#faf8ff]">
          {/* Target Class & Audience Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Class Selector (Class-Wise Focus) */}
            <div className="bg-white p-3 rounded-2xl border border-[#dae2fd] shadow-xs space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#004ac6]" />
                1. Select Specific Class
              </label>
              <select
                value={feeReminderClass}
                onChange={e => {
                  setFeeReminderClass(e.target.value);
                  setCurrentQueueIdx(0);
                }}
                className="w-full h-9 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] px-2.5 border border-[#dae2fd] focus:bg-white cursor-pointer"
              >
                <option value="ALL">All Classes & Sections ({classes.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role Selector */}
            <div className="bg-white p-3 rounded-2xl border border-[#dae2fd] shadow-xs space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#007d55]" />
                2. Reminder Recipient Role
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#f2f3ff] p-0.5 rounded-xl border border-[#dae2fd]">
                {(['parents', 'students', 'teachers'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setFeeReminderTargetRole(role);
                      setActivePreviewType(
                        role === 'parents' ? 'parent-whatsapp' : role === 'students' ? 'student-popup' : 'teacher-roster'
                      );
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      feeReminderTargetRole === role
                        ? 'bg-[#004ac6] text-white shadow-xs'
                        : 'text-[#434655] hover:text-[#131b2e]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Status Filter */}
            <div className="bg-white p-3 rounded-2xl border border-[#dae2fd] shadow-xs space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                3. Defaulter Status Filter
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#f2f3ff] p-0.5 rounded-xl border border-[#dae2fd]">
                {[
                  { id: 'all', label: 'All Unpaid' },
                  { id: 'overdue', label: 'Overdue' },
                  { id: 'partial', label: 'Partial' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.id as any);
                      setCurrentQueueIdx(0);
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      statusFilter === item.id
                        ? 'bg-white text-[#131b2e] shadow-xs border border-[#dae2fd]'
                        : 'text-[#737686] hover:text-[#131b2e]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CLASS-WISE ONE-BY-ONE INTERACTIVE DISPATCHER CARD */}
          {classStudents.length > 0 && currentStudent ? (
            <div className="bg-gradient-to-br from-white via-[#fcfdff] to-[#f2f6ff] rounded-2xl sm:rounded-3xl border-2 border-[#004ac6]/30 shadow-md p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedff] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#004ac6] text-white text-[11px] font-bold rounded-lg shadow-xs">
                    One-by-One Queue: {safeIdx + 1} of {classStudents.length}
                  </span>
                  <span className="text-xs font-bold text-[#131b2e]">
                    Class: <strong className="text-[#004ac6]">{currentStudent.classSec}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentQueueIdx(prev => Math.max(0, prev - 1))}
                    disabled={safeIdx === 0}
                    className="p-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] disabled:opacity-40 border border-[#dae2fd]"
                    title="Previous student in class"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentQueueIdx(prev => Math.min(classStudents.length - 1, prev + 1))}
                    disabled={safeIdx === classStudents.length - 1}
                    className="p-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] disabled:opacity-40 border border-[#dae2fd]"
                    title="Next student in class"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetQueue}
                    className="p-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#737686] border border-[#dae2fd] text-xs font-bold flex items-center gap-1 ml-1"
                    title="Reset class dispatch queue"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Reset</span>
                  </button>
                </div>
              </div>

              {/* Active Student Profile & Fee Breakdown */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#dae2fd]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#004ac6]/30 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-base text-[#131b2e] truncate">
                        {currentStudent.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f2f3ff] text-[#004ac6] rounded-md border border-[#dae2fd]">
                        Roll #{currentStudent.rollNo}
                      </span>
                      {isCurrentSent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#bdffdb] text-[#002113] rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Sent (1-by-1)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fff3c4] text-[#7a5900] rounded-md">
                          Pending Dispatch
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#737686] mt-0.5">
                      Parent: <strong className="text-[#131b2e]">{currentStudent.parentName || 'Parent'}</strong> ({currentStudent.parentRelation || 'Guardian'}) • WhatsApp: <span className="font-mono text-[#007d55] font-bold">{currentStudent.parentWhatsApp || currentStudent.parentPhone}</span>
                    </p>
                  </div>
                </div>

                {/* Amount Due & Primary One-by-One Action */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold uppercase text-[#737686] block">Outstanding Balance</span>
                    <span className="text-lg font-extrabold text-[#ba1a1a]">
                      {institution.currencySymbol}{currentStudentFee.balanceDue.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSendSingleReminder(
                        currentStudent.id,
                        currentStudent.name,
                        currentStudent.parentWhatsApp || currentStudent.parentPhone,
                        currentStudentFee.balanceDue,
                        currentStudent.rollNo,
                        currentStudent.classSec
                      )
                    }
                    className="h-11 px-4 bg-gradient-to-r from-[#007d55] to-[#004ac6] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all hover:opacity-95"
                    title="Send reminder to this specific student (one-by-one)"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reminder (1-by-1)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#dae2fd] text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#007d55] mx-auto" />
              <h4 className="text-sm font-bold text-[#131b2e]">All Dues Cleared in {feeReminderClass}!</h4>
              <p className="text-xs text-[#737686]">There are no students with pending fee balances matching this filter.</p>
            </div>
          )}

          {/* Preview Tabs: WhatsApp / Student In-App Alert / Teacher Roster */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-[#eaedff] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#131b2e]">Live Template Preview (Individual Student Payload)</span>
                <span className="text-[10px] text-[#737686]">Role: {feeReminderTargetRole.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#f2f3ff] p-0.5 rounded-lg border border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setActivePreviewType('parent-whatsapp')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activePreviewType === 'parent-whatsapp' ? 'bg-[#007d55] text-white' : 'text-[#737686]'
                  }`}
                >
                  WhatsApp Format
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewType('student-popup')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activePreviewType === 'student-popup' ? 'bg-[#004ac6] text-white' : 'text-[#737686]'
                  }`}
                >
                  Student Modal Alert
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewType('teacher-roster')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    activePreviewType === 'teacher-roster' ? 'bg-[#131b2e] text-white' : 'text-[#737686]'
                  }`}
                >
                  Class Teacher Brief
                </button>
              </div>
            </div>

            {/* Preview Box 1: Parent WhatsApp Message */}
            {activePreviewType === 'parent-whatsapp' && currentStudent && (
              <div className="bg-[#e7f8ef] p-3.5 rounded-2xl border border-[#b2e8ca] text-xs font-mono text-[#002113] space-y-1.5 leading-relaxed">
                <div className="flex items-center justify-between border-b border-[#007d55]/20 pb-1 text-[#007d55] font-bold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Parent WhatsApp 1-by-1 Message Preview
                  </span>
                  <span className="text-[10px]">{currentStudent.name}</span>
                </div>
                <p className="font-bold text-[#131b2e]">{institution.name.toUpperCase()} - ACADEMIC FEES ADVISORY</p>
                <p>Dear {currentStudent.parentName || 'Parent'} ({currentStudent.parentRelation || 'Guardian'}),</p>
                <p>
                  This is to notify you that the academic fee installment for *{currentStudent.name}* (Roll #{currentStudent.rollNo}, {currentStudent.classSec}) has a pending balance of *{institution.currencySymbol}{currentStudentFee.balanceDue.toLocaleString()}*.
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#007d55]/30 space-y-0.5 text-[11px]">
                  <div>• Total Billed: {institution.currencySymbol}{currentStudentFee.totalBilled.toLocaleString()}</div>
                  <div>• Total Paid: {institution.currencySymbol}{currentStudentFee.totalPaid.toLocaleString()}</div>
                  <div>• <strong className="text-[#ba1a1a]">Balance Outstanding: {institution.currencySymbol}{currentStudentFee.balanceDue.toLocaleString()}</strong></div>
                  <div>• Due Date: End of Current Month</div>
                </div>
                <p className="text-[11px] text-[#007d55]">
                  💳 Online UPI Payment: <strong>accounts@{institution.shortName.toLowerCase()}.org</strong>
                </p>
                <p className="text-[10px] text-[#737686]">- Accounts & Bursar Office, {institution.shortName}</p>
              </div>
            )}

            {/* Preview Box 2: Student In-App Alert Card */}
            {activePreviewType === 'student-popup' && currentStudent && (
              <div className="bg-[#fff8f6] p-4 rounded-2xl border border-[#ffdad6] text-xs space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider block">
                      Student Dashboard Reminder Notice
                    </span>
                    <h4 className="text-sm font-bold text-[#131b2e]">Term Fee Clearance Pending</h4>
                    <p className="text-[11px] text-[#737686] mt-0.5">
                      Dear {currentStudent.name}, your fee payment of {institution.currencySymbol}{currentStudentFee.balanceDue.toLocaleString()} is due. Please request your guardian to complete the online clearance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#ffdad6]/60 text-[11px]">
                  <span className="text-[#737686]">Status: <strong className="text-[#ba1a1a]">{currentStudentFee.status}</strong></span>
                  <button
                    type="button"
                    onClick={() => showToast('Redirected to Online Fee Payment Portal')}
                    className="px-3 py-1 bg-[#004ac6] text-white font-bold rounded-lg"
                  >
                    Pay Now (UPI / QR)
                  </button>
                </div>
              </div>
            )}

            {/* Preview Box 3: Teacher Roster Brief */}
            {activePreviewType === 'teacher-roster' && (
              <div className="bg-[#f2f3ff] p-3.5 rounded-2xl border border-[#dae2fd] text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#004ac6]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Class Incharge Action Roster ({feeReminderClass})
                  </span>
                  <span className="text-[10px] bg-[#dbe1ff] px-2 py-0.5 rounded text-[#00174b]">Principal Circular</span>
                </div>
                <p className="text-[11px] text-[#434655]">
                  Class mentors are requested to gently counsel the parents during this week's PTM regarding pending tuition dues for {classStudents.length} students.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Unpaid Dues</span>
                    <span className="text-xs font-bold text-[#ba1a1a]">{classStudents.length} Students</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Class Due Total</span>
                    <span className="text-xs font-bold text-[#131b2e]">{institution.currencySymbol}{totalClassDue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Sent (1-by-1)</span>
                    <span className="text-xs font-bold text-[#007d55]">{sentStudentIds.length} Sent</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Pending Queue</span>
                    <span className="text-xs font-bold text-[#ba1a1a]">{Math.max(0, classStudents.length - sentStudentIds.length)} Remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Roster Table (One-by-One Trigger per Row) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs">
            <div className="p-3 sm:p-4 border-b border-[#eaedff] flex items-center justify-between">
              <span className="text-xs font-bold text-[#131b2e]">
                Class Roster: Individual Student Verification ({sentStudentIds.length} / {classStudents.length} Sent)
              </span>
              <span className="text-[11px] font-bold text-[#737686]">
                Click any row to load into 1-by-1 sender
              </span>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf8ff] border-b border-[#eaedff] text-[10px] uppercase font-bold text-[#737686]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Parent Contact</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">One-by-One Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {classStudents.map((student, idx) => {
                    const fee = getFeeForStudent(student.id, student.classSec);
                    const isSent = sentStudentIds.includes(student.id);
                    const isSelected = safeIdx === idx;

                    return (
                      <tr
                        key={student.id}
                        onClick={() => setCurrentQueueIdx(idx)}
                        className={`hover:bg-[#f2f3ff]/50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#dbe1ff]/30 ring-1 ring-[#004ac6]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-[#737686]">
                          {idx + 1}
                        </td>
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
                        <td className="py-2.5 px-3">
                          <div>
                            <span className="font-medium text-[#131b2e]">{student.parentName}</span>
                            <span className="text-[10px] text-[#737686] block font-mono">{student.parentWhatsApp}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#ba1a1a]">
                          {institution.currencySymbol}{fee.balanceDue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isSent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bdffdb] text-[#002113] inline-flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Sent
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                fee.status === 'Overdue' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#fff3c4] text-[#7a5900]'
                              }`}
                            >
                              {fee.status}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSendSingleReminder(
                                student.id,
                                student.name,
                                student.parentWhatsApp,
                                fee.balanceDue,
                                student.rollNo,
                                student.classSec
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ml-auto shadow-xs active:scale-95 ${
                              isSent
                                ? 'bg-[#f2f3ff] text-[#007d55] border border-[#bdffdb]'
                                : 'bg-[#007d55] text-white hover:bg-[#006041]'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSent ? 'Resend (1-by-1)' : 'Remind (1-by-1)'}</span>
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

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#eaedff] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#737686]">
            Class-wise Progress: <strong>{sentStudentIds.length} of {classStudents.length} sent individually</strong> in {feeReminderClass}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFeeReminderModalOpen(false)}
              className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
            {currentStudent && (
              <button
                type="button"
                onClick={() =>
                  handleSendSingleReminder(
                    currentStudent.id,
                    currentStudent.name,
                    currentStudent.parentWhatsApp || currentStudent.parentPhone,
                    currentStudentFee.balanceDue,
                    currentStudent.rollNo,
                    currentStudent.classSec
                  )
                }
                className="px-5 py-2 bg-gradient-to-r from-[#007d55] to-[#004ac6] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Next Reminder (1-by-1)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Simulated In-App Popup Overlay */}
      {showSimulatedPopup && currentStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in zoom-in-95 duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#ffdad6] text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatedPopup(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ba1a1a]">
                Official Institution Notification
              </span>
              <h3 className="text-lg font-bold text-[#131b2e] mt-0.5">
                Fee Clearance Reminder ({institution.shortName})
              </h3>
              <p className="text-xs text-[#737686] mt-1 leading-relaxed">
                Dear Parent / Student, the term tuition balance of{' '}
                <strong className="text-[#ba1a1a]">
                  {institution.currencySymbol}{currentStudentFee.balanceDue.toLocaleString()}
                </strong>{' '}
                for {currentStudent.name} ({currentStudent.classSec}) is pending clearance.
              </p>
            </div>

            <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#dae2fd] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#737686]">Student Roll:</span>
                <span className="font-bold text-[#131b2e]">#{currentStudent.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737686]">Class / Section:</span>
                <span className="font-bold text-[#131b2e]">{currentStudent.classSec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737686]">UPI ID:</span>
                <span className="font-mono font-bold text-[#004ac6]">accounts@{institution.shortName.toLowerCase()}.org</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedPopup(false);
                  showToast('Fee reminder acknowledged.');
                }}
                className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
              >
                Acknowledge
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedPopup(false);
                  showToast('Opened instant fee clearance gateway!');
                }}
                className="flex-1 h-10 bg-[#004ac6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Pay Online</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
