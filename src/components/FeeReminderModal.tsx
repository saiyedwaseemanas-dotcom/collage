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
  DollarSign,
  Smartphone,
  Calendar,
  GraduationCap,
  Sparkles,
  Layers,
  Phone,
  MessageSquare,
  Building2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
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
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [activePreviewType, setActivePreviewType] = useState<'parent-whatsapp' | 'student-popup' | 'teacher-roster'>('parent-whatsapp');
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);

  if (!isFeeReminderModalOpen) return null;

  // Filter students based on class and fee status
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

  const activeRemindersList = classStudents.filter(s => !excludedStudentIds.includes(s.id));
  const totalClassDue = activeRemindersList.reduce((acc, s) => acc + getFeeForStudent(s.id, s.classSec).balanceDue, 0);

  const sampleStudent = classStudents[0] || students[0];
  const sampleFee = sampleStudent ? getFeeForStudent(sampleStudent.id, sampleStudent.classSec) : { totalBilled: 45000, totalPaid: 15000, balanceDue: 30000, status: 'Overdue' };

  const handleBulkDispatch = async () => {
    if (activeRemindersList.length === 0) {
      showToast('No active students selected for fee reminder dispatch', 'warning');
      return;
    }

    setIsSendingBulk(true);
    setBulkProgress(15);
    showToast(`Preparing ${feeReminderTargetRole} fee reminder broadcast for ${activeRemindersList.length} students in ${feeReminderClass}...`, 'info');

    await new Promise(r => setTimeout(r, 600));
    setBulkProgress(60);
    await new Promise(r => setTimeout(r, 600));
    setBulkProgress(100);

    await new Promise(r => setTimeout(r, 400));
    setIsSendingBulk(false);
    showToast(
      `Dispatched fee reminder popups & WhatsApp notices to ${activeRemindersList.length} ${feeReminderTargetRole} in ${feeReminderClass}!`,
      'success'
    );
  };

  const handleSendSingleReminder = (studentName: string, phone: string, balance: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `*URGENT: FEE PAYMENT REMINDER - ${institution.name.toUpperCase()}*\n` +
      `Dear Parent of *${studentName}*,\n` +
      `This is a kind reminder that an outstanding academic balance of *${institution.currencySymbol}${balance.toLocaleString()}* is pending for the current term.\n` +
      `Please clear the dues to ensure uninterrupted examination access.\n` +
      `UPI ID: accounts@${institution.shortName.toLowerCase()}.org\n` +
      `Thank you,\n` +
      `Accounts Bursar, ${institution.shortName}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
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
                <h3 className="font-bold text-base sm:text-lg truncate">Class-Wise Fee Reminder Popup & Dispatch</h3>
                <span className="text-[10px] font-bold bg-[#bdffdb] text-[#002113] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Real-Time Due Alerts
                </span>
              </div>
              <p className="text-xs text-white/80 truncate">
                Automated reminder popups for Students, Parents & Teachers across all academic tiers (KG to PhD).
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
            {/* Class Selector */}
            <div className="bg-white p-3 rounded-2xl border border-[#dae2fd] shadow-xs space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#737686] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#004ac6]" />
                Target Class & Tier
              </label>
              <select
                value={feeReminderClass}
                onChange={e => setFeeReminderClass(e.target.value)}
                className="w-full h-9 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] px-2.5 border border-[#dae2fd] focus:bg-white"
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
                Reminder Target Audience
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
                Filter Defaulters
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
                    onClick={() => setStatusFilter(item.id as any)}
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

          {/* Quick Class Due Summary Card */}
          <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center font-bold text-lg shrink-0">
                {classStudents.length}
              </div>
              <div>
                <span className="text-xs font-bold text-[#131b2e]">
                  {classStudents.length} Students with Pending Dues in {feeReminderClass}
                </span>
                <p className="text-[11px] text-[#737686] mt-0.5">
                  Total Outstanding Balance: <strong className="text-[#ba1a1a]">{institution.currencySymbol}{totalClassDue.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSimulatedPopup(true)}
                className="px-3 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate User Popup</span>
              </button>

              <button
                type="button"
                onClick={handleBulkDispatch}
                disabled={isSendingBulk || classStudents.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingBulk ? 'animate-spin' : ''}`} />
                <span>{isSendingBulk ? `Dispatching (${bulkProgress}%)...` : `Dispatch to All (${classStudents.length})`}</span>
              </button>
            </div>
          </div>

          {/* Preview Tabs: Student In-App Alert / Parent WhatsApp / Teacher Roster */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-[#eaedff] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#131b2e]">Live Template Preview</span>
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
            {activePreviewType === 'parent-whatsapp' && (
              <div className="bg-[#e7f8ef] p-3.5 rounded-2xl border border-[#b2e8ca] text-xs font-mono text-[#002113] space-y-1.5 leading-relaxed">
                <div className="flex items-center justify-between border-b border-[#007d55]/20 pb-1 text-[#007d55] font-bold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Parent WhatsApp Broadcast Payload
                  </span>
                  <span className="text-[10px]">Instant 1-Click Dispatch</span>
                </div>
                <p className="font-bold text-[#131b2e]">{institution.name.toUpperCase()} - ACADEMIC FEES ADVISORY</p>
                <p>Dear {sampleStudent?.parentName || 'Parent'} ({sampleStudent?.parentRelation || 'Guardian'}),</p>
                <p>
                  This is to notify you that the academic fee installment for *{sampleStudent?.name || 'Student'}* (Roll #{sampleStudent?.rollNo || '01'}, {sampleStudent?.classSec || feeReminderClass}) has a pending balance of *{institution.currencySymbol}{sampleFee.balanceDue.toLocaleString()}*.
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#007d55]/30 space-y-0.5 text-[11px]">
                  <div>• Total Billed: {institution.currencySymbol}{sampleFee.totalBilled.toLocaleString()}</div>
                  <div>• Total Paid: {institution.currencySymbol}{sampleFee.totalPaid.toLocaleString()}</div>
                  <div>• <strong className="text-[#ba1a1a]">Balance Outstanding: {institution.currencySymbol}{sampleFee.balanceDue.toLocaleString()}</strong></div>
                  <div>• Due Date: End of Current Month</div>
                </div>
                <p className="text-[11px] text-[#007d55]">
                  💳 Online UPI Payment: <strong>accounts@{institution.shortName.toLowerCase()}.org</strong>
                </p>
                <p className="text-[10px] text-[#737686]">- Accounts & Bursar Office, {institution.shortName}</p>
              </div>
            )}

            {/* Preview Box 2: Student In-App Alert Card */}
            {activePreviewType === 'student-popup' && (
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
                      Dear {sampleStudent?.name}, your fee payment of {institution.currencySymbol}{sampleFee.balanceDue.toLocaleString()} is due. Please request your guardian to complete the online clearance before the upcoming examination hall ticket generation.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#ffdad6]/60 text-[11px]">
                  <span className="text-[#737686]">Status: <strong className="text-[#ba1a1a]">{sampleFee.status}</strong></span>
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
                    <GraduationCap className="w-4 h-4" />
                    Class Incharge Action Roster ({feeReminderClass})
                  </span>
                  <span className="text-[10px] bg-[#dbe1ff] px-2 py-0.5 rounded text-[#00174b]">Principal Circular</span>
                </div>
                <p className="text-[11px] text-[#434655]">
                  Class mentors are requested to gently counsel the parents during this week's PTM regarding pending tuition dues for {classStudents.length} students.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Total In Class</span>
                    <span className="text-xs font-bold text-[#131b2e]">{students.length}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#ba1a1a] block">Unpaid Dues</span>
                    <span className="text-xs font-bold text-[#ba1a1a]">{classStudents.length}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#737686] block">Class Due Total</span>
                    <span className="text-xs font-bold text-[#131b2e]">{institution.currencySymbol}{totalClassDue.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl text-center border border-[#dae2fd]">
                    <span className="text-[10px] text-[#007d55] block">Mentor Support</span>
                    <span className="text-xs font-bold text-[#007d55]">Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs">
            <div className="p-3 sm:p-4 border-b border-[#eaedff] flex items-center justify-between">
              <span className="text-xs font-bold text-[#131b2e]">
                Students Roster & Reminder Batch ({activeRemindersList.length} / {classStudents.length} Selected)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExcludedStudentIds([])}
                  className="text-[10px] font-bold text-[#004ac6] hover:underline"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setExcludedStudentIds(classStudents.map(s => s.id))}
                  className="text-[10px] font-bold text-[#ba1a1a] hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#faf8ff] border-b border-[#eaedff] text-[10px] uppercase font-bold text-[#737686]">
                    <th className="py-2.5 px-3 text-center w-10">Include</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Parent & Contact</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {classStudents.map(student => {
                    const fee = getFeeForStudent(student.id, student.classSec);
                    const isIncluded = !excludedStudentIds.includes(student.id);

                    return (
                      <tr key={student.id} className={`hover:bg-[#f2f3ff]/50 transition-colors ${!isIncluded ? 'opacity-50 bg-gray-50' : ''}`}>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => {
                              if (isIncluded) {
                                setExcludedStudentIds(prev => [...prev, student.id]);
                              } else {
                                setExcludedStudentIds(prev => prev.filter(id => id !== student.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-[#004ac6] cursor-pointer"
                            title="Add or remove student from fee reminder batch"
                          />
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fee.status === 'Overdue' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#fff3c4] text-[#7a5900]'
                            }`}
                          >
                            {fee.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSendSingleReminder(student.name, student.parentWhatsApp, fee.balanceDue)}
                            className="px-2.5 py-1 bg-[#007d55] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 ml-auto shadow-xs active:scale-95"
                          >
                            <Send className="w-3 h-3" />
                            <span>Remind</span>
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
            Total Targets: <strong>{classStudents.length} recipients</strong> across {feeReminderClass}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFeeReminderModalOpen(false)}
              className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleBulkDispatch}
              disabled={isSendingBulk || classStudents.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Fee Reminders Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Simulated In-App Popup Overlay */}
      {showSimulatedPopup && (
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
                  {institution.currencySymbol}{sampleFee.balanceDue.toLocaleString()}
                </strong>{' '}
                for {sampleStudent?.name} ({sampleStudent?.classSec}) is pending clearance.
              </p>
            </div>

            <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#dae2fd] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#737686]">Student Roll:</span>
                <span className="font-bold text-[#131b2e]">#{sampleStudent?.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737686]">Class / Section:</span>
                <span className="font-bold text-[#131b2e]">{sampleStudent?.classSec}</span>
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
