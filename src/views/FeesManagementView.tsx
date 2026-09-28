import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, FeeStructure, FeePaymentTransaction, ClassLevelCategory } from '../types';
import {
  Wallet,
  CreditCard,
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Send,
  MessageSquare,
  Calendar,
  Layers,
  FileSpreadsheet,
  Building2,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  BellRing,
  RefreshCw,
  UserPlus,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react';

export const FeesManagementView: React.FC = () => {
  const {
    students,
    classes,
    feeStructures,
    studentFees,
    feeTransactions,
    recordFeePayment,
    getFeeForStudent,
    selectedReceiptTx,
    setSelectedReceiptTx,
    institution,
    showToast,
    openDispatchModal,
    openFeeReminderModal,
    addStudent,
    deleteStudent,
    addClass,
    addFeeStructure,
    updateFeeStructure,
    transferAllDataToGoogleSheets,
    isTransferringAllToSheets,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ledger' | 'structures' | 'transactions'>('ledger');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Collect Fee Modal state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [targetStudentForFee, setTargetStudentForFee] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(15000);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Net Banking' | 'Cheque'>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('Term fee installment payment');

  // Receipt Modal state
  const [viewingReceipt, setViewingReceipt] = useState<FeePaymentTransaction | null>(null);

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(classes[0]?.name || 'Class 10-A');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentWhatsApp, setNewParentWhatsApp] = useState('');

  // Edit Fee Structure Modal State
  const [isEditStructureModalOpen, setIsEditStructureModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [editTuition, setEditTuition] = useState(0);
  const [editLab, setEditLab] = useState(0);
  const [editExam, setEditExam] = useState(0);
  const [editTransport, setEditTransport] = useState(0);

  // Add Class & Class-wise Fees Modal State
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassNameField, setNewClassNameField] = useState('');
  const [newClassCategory, setNewClassCategory] = useState<ClassLevelCategory>('Secondary (9-10)');
  const [newClassTuition, setNewClassTuition] = useState(25000);
  const [newClassLab, setNewClassLab] = useState(5000);
  const [newClassExam, setNewClassExam] = useState(3000);
  const [newClassTransport, setNewClassTransport] = useState(8000);

  // Calculate high-level summary KPIs
  const totalBilled = students.reduce((acc, s) => {
    const fee = getFeeForStudent(s.id, s.classSec);
    return acc + fee.totalBilled;
  }, 0);

  const totalCollected = students.reduce((acc, s) => {
    const fee = getFeeForStudent(s.id, s.classSec);
    return acc + fee.totalPaid;
  }, 0);

  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionPercentage = totalBilled > 0 ? parseFloat(((totalCollected / totalBilled) * 100).toFixed(1)) : 0;

  const defaultersCount = students.filter(s => {
    const fee = getFeeForStudent(s.id, s.classSec);
    return fee.balanceDue > 0;
  }).length;

  const fullyPaidCount = students.filter(s => {
    const fee = getFeeForStudent(s.id, s.classSec);
    return fee.balanceDue <= 0;
  }).length;

  // Filter students for the ledger
  const filteredStudents = students.filter(s => {
    if (selectedClassFilter !== 'ALL') {
      const matchName = s.classSec === selectedClassFilter || s.gradeLevel === selectedClassFilter.replace('Class ', '');
      if (!matchName) return false;
    }
    const fee = getFeeForStudent(s.id, s.classSec);
    if (statusFilter === 'pending' && fee.balanceDue <= 0) return false;
    if (statusFilter === 'paid' && fee.balanceDue > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery = s.name.toLowerCase().includes(q) || s.rollNo.includes(q) || (s.parentName && s.parentName.toLowerCase().includes(q));
      if (!matchQuery) return false;
    }
    return true;
  });

  const handleOpenAddStudent = () => {
    setNewStudentName('');
    setNewStudentRoll(`DPS-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewStudentClass(selectedClassFilter !== 'ALL' ? selectedClassFilter : (classes[0]?.name || 'Class 10-A'));
    setNewParentName('');
    setNewParentPhone('');
    setNewParentWhatsApp('');
    setIsAddStudentModalOpen(true);
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRoll.trim()) {
      showToast('Please provide student name and roll number', 'warning');
      return;
    }

    addStudent({
      id: `std-${Date.now()}`,
      name: newStudentName.trim(),
      rollNo: newStudentRoll.trim(),
      classSec: newStudentClass,
      gradeLevel: newStudentClass.replace(/^Class\s*/i, ''),
      parentName: newParentName.trim() || 'Parent/Guardian',
      parentRelation: 'Father',
      parentPhone: newParentPhone.trim() || '9876543210',
      parentWhatsApp: newParentWhatsApp.trim() || newParentPhone.trim() || '9876543210',
      attendancePct: 100,
      totalPresent: 1,
      totalWorkingDays: 1,
      todayStatus: 'P',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`,
      marks: {
        ut2: { math: 45, sci: 45, eng: 45 },
      },
    });

    setIsAddStudentModalOpen(false);
    showToast(`Student ${newStudentName} successfully enrolled into ${newStudentClass}!`);
  };

  const handleDeleteStudentPrompt = (student: Student) => {
    if (confirm(`Are you sure you want to remove ${student.name} (Roll #${student.rollNo}) from the student roster and fee ledger?`)) {
      deleteStudent(student.id);
      showToast(`${student.name} removed from active roster`, 'warning');
    }
  };

  const handleOpenEditStructure = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setEditTuition(structure.tuitionFee);
    setEditLab(structure.labActivityFee);
    setEditExam(structure.examFee);
    setEditTransport(structure.transportFee);
    setIsEditStructureModalOpen(true);
  };

  const handleSaveStructureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStructure) return;

    const total = editTuition + editLab + editExam + editTransport;
    updateFeeStructure(editingStructure.id, {
      tuitionFee: editTuition,
      labActivityFee: editLab,
      examFee: editExam,
      transportFee: editTransport,
      totalAnnualFee: total,
    });

    setIsEditStructureModalOpen(false);
    showToast(`Updated fee schedule for ${editingStructure.className} (${institution.currencySymbol}${total.toLocaleString()})`);
  };

  const handleSaveNewClassWithFees = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassNameField.trim()) {
      showToast('Please provide a class name', 'warning');
      return;
    }

    const classNameClean = newClassNameField.trim();
    // Add class to system
    addClass({
      id: `cls-${Date.now()}`,
      name: classNameClean,
      category: newClassCategory,
      totalEnrolled: 0,
      roomNo: 'Room TBA',
    });

    // Add corresponding fee structure
    const total = newClassTuition + newClassLab + newClassExam + newClassTransport;
    addFeeStructure({
      id: `fee-${Date.now()}`,
      className: classNameClean,
      category: newClassCategory,
      tuitionFee: newClassTuition,
      labActivityFee: newClassLab,
      examFee: newClassExam,
      transportFee: newClassTransport,
      totalAnnualFee: total,
      frequency: 'Annual',
    });

    setIsAddClassModalOpen(false);
    setNewClassNameField('');
    showToast(`Added ${classNameClean} with customized fee structure!`);
  };

  const handleOpenCollectFee = (student: Student) => {
    const fee = getFeeForStudent(student.id, student.classSec);
    setTargetStudentForFee(student);
    setPaymentAmount(fee.balanceDue > 0 ? fee.balanceDue : 10000);
    setPaymentRef(paymentMode === 'UPI' ? `UPI/${Math.floor(1000000000 + Math.random() * 9000000000)}` : 'COUNTER-CASH');
    setIsCollectModalOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentForFee) return;

    if (paymentAmount <= 0) {
      showToast('Please enter a valid payment amount', 'warning');
      return;
    }

    const newTx = recordFeePayment({
      studentId: targetStudentForFee.id,
      studentName: targetStudentForFee.name,
      rollNo: targetStudentForFee.rollNo,
      classSec: targetStudentForFee.classSec,
      amount: paymentAmount,
      paymentMode,
      transactionRef: paymentRef || `TXN-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      receivedBy: `${institution.principalName} (Cashier / Accounts)`,
      note: paymentNote,
    });

    setIsCollectModalOpen(false);
    setViewingReceipt(newTx);
  };

  const handleShareWhatsAppReceipt = (tx: FeePaymentTransaction) => {
    const student = students.find(s => s.id === tx.studentId);
    const parentPhone = student?.parentWhatsApp || student?.parentPhone || '919876543210';
    const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `*OFFICIAL FEE RECEIPT - ${institution.name}*\n` +
      `Receipt No: ${tx.receiptNo}\n` +
      `Student: ${tx.studentName} (Roll #${tx.rollNo})\n` +
      `Class: ${tx.classSec}\n` +
      `Amount Received: ${institution.currencySymbol}${tx.amount.toLocaleString()}\n` +
      `Mode: ${tx.paymentMode} (${tx.transactionRef})\n` +
      `Date: ${tx.date}\n` +
      `Note: ${tx.note || 'Academic fees installment'}\n\n` +
      `Thank you for the payment.\n` +
      `- Accounts & Bursar, ${institution.shortName}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Student Fees & Finance Ledger</h1>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#dbe1ff] text-[#00174b] font-bold text-[10px] sm:text-xs rounded-full">
              {institution.currencySymbol} INR Real-Time
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Class-wise fee structures from Kindergarten to Ph.D, fee collections, instant receipt generation & defaulters telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Module 7: Google Sheets Auto Sync */}
          <button
            onClick={async () => {
              await transferAllDataToGoogleSheets();
              showToast('Google Sheets fee ledger synchronized successfully!', 'success');
            }}
            disabled={isTransferringAllToSheets}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
            title="Auto sync all fee records and balances to Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isTransferringAllToSheets ? 'animate-spin' : ''}`} />
            <span>{isTransferringAllToSheets ? 'Syncing...' : 'Auto Sync Sheets'}</span>
          </button>

          <button
            onClick={() => openFeeReminderModal(selectedClassFilter !== 'ALL' ? selectedClassFilter : undefined, 'parents')}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-[#ffdad6] hover:bg-[#ffc2bb] text-[#ba1a1a] border border-[#ffdad6] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <BellRing className="w-4 h-4 text-[#ba1a1a]" />
            <span>🔔 Fee Reminder</span>
          </button>

          <button
            onClick={() =>
              openDispatchModal({
                title: 'Fee Collection & Defaulter Audit Report',
                reportCategory: 'fee-defaulters',
                defaultFormat: 'sheets',
                defaultRecipientType: 'principal',
              })
            }
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-white border border-[#dae2fd] text-[#131b2e] hover:bg-[#f2f3ff] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#007d55]" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={() => {
              if (students.length > 0) {
                handleOpenCollectFee(students[0]);
              }
            }}
            className="flex-1 sm:flex-initial h-10 px-4 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>+ Collect Fee</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Billed */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#737686] uppercase tracking-wider">Total Billed Fees</span>
            <div className="w-8 h-8 rounded-xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-extrabold text-[#131b2e]">
              {institution.currencySymbol}{totalBilled.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">{students.length} Enrolled Students</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#007d55] uppercase tracking-wider">Total Collected</span>
            <div className="w-8 h-8 rounded-xl bg-[#bdffdb] text-[#002113] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#007d55]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-extrabold text-[#007d55]">
              {institution.currencySymbol}{totalCollected.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-[#f2f3ff] rounded-full overflow-hidden">
                <div
                  className="bg-[#007d55] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, collectionPercentage)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#007d55]">{collectionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-wider">Pending Dues</span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-extrabold text-[#ba1a1a]">
              {institution.currencySymbol}{totalOutstanding.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#ba1a1a] font-semibold mt-0.5 block">
              {defaultersCount} Students with Balance
            </span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">Fee Receipts Issued</span>
            <div className="w-8 h-8 rounded-xl bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-2xl font-extrabold text-[#131b2e]">
              {feeTransactions.length} Receipts
            </div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">Last payment {feeTransactions[0]?.date || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="p-1 bg-[#eaedff] rounded-xl sm:rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'ledger'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Wallet className="w-4 h-4" />
          <span>Student Fee Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`flex-1 py-2 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'structures'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Layers className="w-4 h-4" />
          <span>Class Fee Structure</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            activeTab === 'transactions'
              ? 'bg-white text-[#004ac6] shadow-xs'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Receipt className="w-4 h-4" />
          <span>Receipts History ({feeTransactions.length})</span>
        </button>
      </div>

      {/* TAB 1: STUDENT FEE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {/* Controls: Class Selector, Status Filter, Add Student, Search */}
          <div className="bg-white p-3 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Class Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#f2f3ff] px-2.5 py-1.5 rounded-xl border border-[#dae2fd]">
                <Layers className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
                <span className="text-[11px] font-bold text-[#737686]">Class:</span>
                <select
                  value={selectedClassFilter}
                  onChange={e => setSelectedClassFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#131b2e] outline-none cursor-pointer"
                >
                  <option value="ALL">All Classes (KG to PhD)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Segmented Controls */}
              <div className="flex items-center gap-1 p-0.5 bg-[#f2f3ff] rounded-xl border border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`h-7 px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#004ac6] shadow-xs'
                      : 'text-[#737686] hover:text-[#131b2e]'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`h-7 px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'pending'
                      ? 'bg-[#ba1a1a] text-white shadow-xs'
                      : 'text-[#ba1a1a] hover:bg-[#ffdad6]/60'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Pending ({defaultersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('paid')}
                  className={`h-7 px-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'paid'
                      ? 'bg-[#007d55] text-white shadow-xs'
                      : 'text-[#007d55] hover:bg-[#bdffdb]/60'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Paid ({fullyPaidCount})</span>
                </button>
              </div>

              {/* Add Student to Class Button */}
              <button
                type="button"
                onClick={handleOpenAddStudent}
                className="h-8 px-3 bg-[#004ac6] hover:bg-[#1a5fd8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                title="Enroll a new student into class and set fees"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Student</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or roll no..."
                className="w-full h-9 pl-9 pr-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4 sticky left-0 bg-[#f2f3ff] z-20">Student</th>
                    <th className="py-3 px-2 sm:px-3">Class & Section</th>
                    <th className="py-3 px-2 sm:px-3 text-right">Total Billed</th>
                    <th className="py-3 px-2 sm:px-3 text-right">Paid Amount</th>
                    <th className="py-3 px-2 sm:px-3 text-right">Balance Due</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#737686]">
                        No student fee records found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const fee = getFeeForStudent(student.id, student.classSec);
                      const isDefaulter = fee.balanceDue > 0;
                      return (
                        <tr key={student.id} className="hover:bg-[#faf8ff] transition-colors">
                          <td className="py-3 px-3 sm:px-4 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={student.avatarUrl}
                                alt={student.name}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#dae2fd]"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-[#131b2e] block truncate max-w-[140px]">
                                  {student.name}
                                </span>
                                <span className="text-[10px] text-[#737686] font-mono">Roll #{student.rollNo}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-3 font-semibold text-[#434655]">
                            {student.classSec}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right font-mono font-bold text-[#131b2e]">
                            {institution.currencySymbol}{fee.totalBilled.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right font-mono font-bold text-[#007d55]">
                            {institution.currencySymbol}{fee.totalPaid.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-right font-mono font-bold">
                            <span className={fee.balanceDue > 0 ? 'text-[#ba1a1a]' : 'text-[#737686]'}>
                              {institution.currencySymbol}{fee.balanceDue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                fee.status === 'Paid'
                                  ? 'bg-[#bdffdb] text-[#002113]'
                                  : fee.status === 'Partial'
                                  ? 'bg-[#dbe1ff] text-[#00174b]'
                                  : 'bg-[#ffdad6] text-[#93000a]'
                              }`}
                            >
                              {fee.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenCollectFee(student)}
                                className="h-8 px-2.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                                type="button"
                                title="Collect Fee & Issue Receipt"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Collect</span>
                              </button>

                              {isDefaulter && (
                                <button
                                  onClick={() => {
                                    const parentPhone = student.parentWhatsApp || student.parentPhone || '919876543210';
                                    const clean = parentPhone.replace(/[^0-9]/g, '');
                                    const msg = encodeURIComponent(
                                      `*Fee Due Reminder - ${institution.name}*\n` +
                                      `Dear Parent of ${student.name} (Roll #${student.rollNo}, ${student.classSec}),\n` +
                                      `This is a friendly reminder that an outstanding fee balance of ${institution.currencySymbol}${fee.balanceDue.toLocaleString()} is pending.\n` +
                                      `Kindly remit the fee at your earliest convenience.\n` +
                                      `- Accounts Office, ${institution.shortName}`
                                    );
                                    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
                                  }}
                                  className="w-8 h-8 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#128c7e] flex items-center justify-center transition-all"
                                  type="button"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteStudentPrompt(student)}
                                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center transition-all"
                                type="button"
                                title="Remove student from roster & fee ledger"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS FEE STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">Academic Fee Schedules (Pre-Primary to Ph.D)</h3>
              <p className="text-xs text-[#737686]">Annual tuition, laboratory, exam, and activity fees breakdown per level</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#f2f3ff] text-[#004ac6] text-xs font-bold px-3 py-1 rounded-xl">
                {feeStructures.length} Class Structures
              </span>
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(true)}
                className="h-9 px-3.5 bg-[#004ac6] hover:bg-[#1a5fd8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Class & Set Fees</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {feeStructures.map(structure => (
              <div
                key={structure.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-[#eaedff] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#004ac6]/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#131b2e]">{structure.className}</h4>
                      <span className="text-[11px] text-[#737686]">{structure.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#00174b] text-[10px] font-bold">
                      {structure.frequency}
                    </span>
                  </div>

                  {/* Fee Breakdown List */}
                  <div className="mt-3 space-y-1.5 text-xs text-[#434655] bg-[#f2f3ff] p-3 rounded-2xl">
                    <div className="flex justify-between">
                      <span>Tuition Fee</span>
                      <span className="font-mono font-bold text-[#131b2e]">
                        {institution.currencySymbol}{structure.tuitionFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lab / Activity Fee</span>
                      <span className="font-mono font-bold text-[#131b2e]">
                        {institution.currencySymbol}{structure.labActivityFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Examination Fee</span>
                      <span className="font-mono font-bold text-[#131b2e]">
                        {institution.currencySymbol}{structure.examFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport / Facility</span>
                      <span className="font-mono font-bold text-[#131b2e]">
                        {institution.currencySymbol}{structure.transportFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#eaedff]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#737686]">Total Annual</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#004ac6] font-mono">
                      {institution.currencySymbol}{structure.totalAnnualFee.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditStructure(structure)}
                    className="w-full py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Fee Structure</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS & RECEIPTS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-[#eaedff] flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">Fee Payment Transactions & Receipts Log</h3>
            <span className="text-xs text-[#737686]">{feeTransactions.length} Total Receipts Issued</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f3ff] border-b border-[#dae2fd] text-[11px] font-bold text-[#737686] uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs">
                {feeTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#faf8ff] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#004ac6]">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-3 text-[#737686]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#131b2e] block">{tx.studentName}</span>
                      <span className="text-[10px] text-[#737686]">{tx.classSec} • Roll #{tx.rollNo}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#131b2e] font-semibold text-[11px]">
                        {tx.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#737686]">
                      {tx.transactionRef}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#007d55] text-sm">
                      {institution.currencySymbol}{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingReceipt(tx)}
                          className="h-8 px-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-xl font-bold text-xs flex items-center gap-1 active:scale-95"
                          type="button"
                          title="View Official Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsAppReceipt(tx)}
                          className="w-8 h-8 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#128c7e] flex items-center justify-center transition-all"
                          type="button"
                          title="Share on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECT FEE MODAL */}
      {isCollectModalOpen && targetStudentForFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Collect Academic Fees</h3>
                  <p className="text-xs text-white/80">Issue official receipt & update student ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProcessPayment} className="p-4 sm:p-5 space-y-3.5">
              {/* Student Summary Card */}
              <div className="p-3 bg-[#f2f3ff] rounded-2xl flex items-center justify-between border border-[#dae2fd]">
                <div>
                  <span className="font-bold text-sm text-[#131b2e] block">{targetStudentForFee.name}</span>
                  <span className="text-xs text-[#737686]">
                    {targetStudentForFee.classSec} • Roll #{targetStudentForFee.rollNo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#737686] uppercase font-bold block">Current Balance</span>
                  <span className="text-sm font-bold text-[#ba1a1a] font-mono">
                    {institution.currencySymbol}
                    {getFeeForStudent(targetStudentForFee.id, targetStudentForFee.classSec).balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Amount to Collect ({institution.currencySymbol})</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-[#f2f3ff] rounded-xl text-base font-mono font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#737686]">Payment Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'Cash', 'Net Banking', 'Cheque'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all ${
                        paymentMode === mode
                          ? 'bg-[#004ac6] text-white shadow-xs'
                          : 'bg-[#f2f3ff] text-[#434655] border border-[#dae2fd]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref / Receipt Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[#737686]">Transaction / Cheque Ref</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="e.g. UPI/3910283 or CHQ-991"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-[#737686]">Payment Remarks / Notes</label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                    placeholder="e.g. Term fee installment"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Receive & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE FEE RECEIPT SLIP MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#dae2fd] overflow-hidden text-left flex flex-col max-h-[95vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Controls Bar */}
            <div className="bg-[#131b2e] text-white p-3 px-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#6ffbbe]">
                <ShieldCheck className="w-4 h-4" />
                <span>Official Fee Receipt Generated</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => handleShareWhatsAppReceipt(viewingReceipt)}
                  className="h-8 px-2.5 bg-[#25d366] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  type="button"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Sheet */}
            <div id="printable-receipt" className="p-6 bg-white overflow-y-auto space-y-4 text-xs text-[#131b2e]">
              {/* Institution Header */}
              <div className="border-b-2 border-[#131b2e] pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={institution.logoUrl}
                    alt={institution.name}
                    className="w-14 h-14 rounded-xl object-contain border border-[#dae2fd]"
                  />
                  <div>
                    <h2 className="font-extrabold text-base text-[#131b2e] uppercase tracking-tight">{institution.name}</h2>
                    <p className="text-[11px] text-[#737686]">{institution.tagline || institution.boardName}</p>
                    <p className="text-[10px] text-[#737686]">{institution.address} • Affiliation: {institution.affiliationCode}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs bg-[#f2f3ff] text-[#004ac6] px-2.5 py-1 rounded-lg block">
                    {viewingReceipt.receiptNo}
                  </span>
                  <span className="text-[10px] text-[#737686] mt-1 block">Date: {viewingReceipt.date}</span>
                </div>
              </div>

              <div className="text-center font-bold text-xs uppercase tracking-widest text-[#004ac6] bg-[#f2f3ff] py-1 rounded-md">
                Fee Payment Voucher & Receipt Slip
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#faf8ff] p-3 rounded-xl border border-[#eaedff]">
                <div>
                  <span className="text-[10px] text-[#737686] block">Student Name:</span>
                  <span className="font-bold text-[#131b2e] text-sm">{viewingReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#737686] block">Roll Number:</span>
                  <span className="font-bold text-[#131b2e] font-mono">#{viewingReceipt.rollNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#737686] block">Class / Academic Level:</span>
                  <span className="font-semibold text-[#131b2e]">{viewingReceipt.classSec}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#737686] block">Academic Session:</span>
                  <span className="font-semibold text-[#131b2e]">{institution.academicSession}</span>
                </div>
              </div>

              {/* Fee Receipt Line Items Table */}
              <table className="w-full text-left border-collapse border border-[#eaedff]">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[10px] font-bold uppercase text-[#737686]">
                    <th className="p-2 border border-[#eaedff]">Sl.</th>
                    <th className="p-2 border border-[#eaedff]">Particulars</th>
                    <th className="p-2 border border-[#eaedff]">Mode / Ref</th>
                    <th className="p-2 border border-[#eaedff] text-right">Amount ({institution.currencySymbol})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-[#eaedff] font-mono">01</td>
                    <td className="p-2 border border-[#eaedff] font-semibold">
                      {viewingReceipt.note || 'Tuition & Academic Fees Installment'}
                    </td>
                    <td className="p-2 border border-[#eaedff] text-[#737686]">
                      {viewingReceipt.paymentMode} ({viewingReceipt.transactionRef})
                    </td>
                    <td className="p-2 border border-[#eaedff] text-right font-mono font-bold text-[#131b2e]">
                      {viewingReceipt.amount.toLocaleString()}.00
                    </td>
                  </tr>
                  <tr className="bg-[#f8f9ff] font-bold">
                    <td colSpan={3} className="p-2 border border-[#eaedff] text-right">
                      Net Received Amount:
                    </td>
                    <td className="p-2 border border-[#eaedff] text-right font-mono text-sm text-[#007d55]">
                      {institution.currencySymbol}{viewingReceipt.amount.toLocaleString()}.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Authorization Stamps & Signatures */}
              <div className="pt-6 flex items-end justify-between text-[11px] text-[#737686]">
                <div>
                  <p className="font-mono text-[10px]">Received by: {viewingReceipt.receivedBy}</p>
                  <p className="text-[9px] text-[#737686]">Computer generated voucher • Valid without physical seal</p>
                </div>
                <div className="text-right">
                  <div className="w-28 border-b border-[#131b2e] mb-1"></div>
                  <span className="font-bold text-[#131b2e] block">{institution.principalName}</span>
                  <span className="text-[10px]">{institution.principalDesignation} / Bursar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ADD STUDENT MODAL */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-base">Enroll New Student</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStudent} className="p-4 sm:p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudentRoll}
                    onChange={e => setNewStudentRoll(e.target.value)}
                    placeholder="DPS-1029"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Assigned Class *</label>
                  <select
                    value={newStudentClass}
                    onChange={e => setNewStudentClass(e.target.value)}
                    className="w-full h-10 px-2 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={e => setNewParentName(e.target.value)}
                  placeholder="e.g. Mr. Rajesh Sharma"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={newParentPhone}
                    onChange={e => setNewParentPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={newParentWhatsApp}
                    onChange={e => setNewParentWhatsApp(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="h-9 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#004ac6] hover:bg-[#1a5fd8] text-white rounded-xl font-bold text-xs shadow-xs active:scale-95"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FEE STRUCTURE MODAL */}
      {isEditStructureModalOpen && editingStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Edit Fee Structure</h3>
                <p className="text-xs text-white/80">{editingStructure.className} ({editingStructure.category})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStructureModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStructureEdit} className="p-4 sm:p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                    Tuition Fee ({institution.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editTuition}
                    onChange={e => setEditTuition(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                    Lab / Activity ({institution.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editLab}
                    onChange={e => setEditLab(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                    Exam Fee ({institution.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editExam}
                    onChange={e => setEditExam(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">
                    Transport ({institution.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editTransport}
                    onChange={e => setEditTransport(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-[#dae2fd]">
                <span className="font-bold text-[#737686]">Calculated Total Annual:</span>
                <span className="text-base font-extrabold text-[#004ac6] font-mono">
                  {institution.currencySymbol}{(editTuition + editLab + editExam + editTransport).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStructureModalOpen(false)}
                  className="h-9 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#004ac6] hover:bg-[#1a5fd8] text-white rounded-xl font-bold text-xs shadow-xs active:scale-95"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW CLASS & SET FEES MODAL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add New Class & Set Fees</h3>
                <p className="text-xs text-white/80">Configure academic level & class-wise fees</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewClassWithFees} className="p-4 sm:p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={newClassNameField}
                    onChange={e => setNewClassNameField(e.target.value)}
                    placeholder="e.g. Class 11-Science"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Tier / Category</label>
                  <select
                    value={newClassCategory}
                    onChange={e => setNewClassCategory(e.target.value as any)}
                    className="w-full h-10 px-2 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                  >
                    <option value="Pre-Primary / Kindergarten">Pre-Primary / Kindergarten</option>
                    <option value="Primary (1-5)">Primary (1-5)</option>
                    <option value="Middle School (6-8)">Middle School (6-8)</option>
                    <option value="Secondary (9-10)">Secondary (9-10)</option>
                    <option value="Higher Secondary (11-12)">Higher Secondary (11-12)</option>
                    <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                    <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                    <option value="Doctorate (Ph.D)">Doctorate (Ph.D)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Tuition Fee</label>
                  <input
                    type="number"
                    min={0}
                    value={newClassTuition}
                    onChange={e => setNewClassTuition(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Lab / Activity</label>
                  <input
                    type="number"
                    min={0}
                    value={newClassLab}
                    onChange={e => setNewClassLab(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Exam Fee</label>
                  <input
                    type="number"
                    min={0}
                    value={newClassExam}
                    onChange={e => setNewClassExam(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Transport Fee</label>
                  <input
                    type="number"
                    min={0}
                    value={newClassTransport}
                    onChange={e => setNewClassTransport(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] font-mono font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-xl flex items-center justify-between border border-[#dae2fd]">
                <span className="font-bold text-[#737686]">Total Annual Schedule:</span>
                <span className="text-base font-extrabold text-[#004ac6] font-mono">
                  {institution.currencySymbol}{(newClassTuition + newClassLab + newClassExam + newClassTransport).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="h-9 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#004ac6] hover:bg-[#1a5fd8] text-white rounded-xl font-bold text-xs shadow-xs active:scale-95"
                >
                  Create Class & Set Fees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
