import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  X,
  Printer,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  Wallet,
} from 'lucide-react';

export const FacultySalaryModal: React.FC = () => {
  const { selectedFacultyForSlip, setSelectedFacultyForSlip, institution, showToast } = useApp();

  if (!selectedFacultyForSlip) return null;

  const slip = selectedFacultyForSlip;

  const handlePrint = () => {
    showToast('Preparing official Faculty Payslip for printing...');
    window.print();
  };

  const handleWhatsAppSlip = () => {
    const message = `*${institution.name.toUpperCase()}*
*OFFICIAL FACULTY SALARY SLIP - ${slip.monthYear.toUpperCase()}*
----------------------------------------
*Faculty Member:* ${slip.teacherName}
*Designation:* ${slip.designation} (${slip.subject})
*Approved By:* ${institution.principalDesignation} ${institution.principalName}

*ATTENDANCE LEDGER:*
• Total Working Days: ${slip.totalWorkingDays} days
• Days Present & Active: ${slip.presentDays} days
• External / Exam On-Duty: ${slip.onDutyDays} days
• Half-Days: ${slip.halfDays} days
• Authorized Paid Leaves: ${slip.paidLeavesCount} days
• Unpaid Absences (LOP): ${slip.unpaidAbsences} days

*SALARY & EARNINGS BREAKDOWN:*
• Base Monthly Salary: ${institution.currencySymbol}${slip.baseMonthlySalary.toLocaleString()}
• Daily Pro-Rata Rate: ${institution.currencySymbol}${slip.perDayRate.toLocaleString()}
• Duty & Examination Allowance: +${institution.currencySymbol}${slip.dutyAllowance.toLocaleString()}
• Loss-of-Pay (LOP) Deductions: -${institution.currencySymbol}${slip.lopDeduction.toLocaleString()}
----------------------------------------
*NET PAYABLE SALARY:* *${institution.currencySymbol}${slip.netPayableSalary.toLocaleString()}*
----------------------------------------
_Digitally Authenticated by Principal Office, ${institution.shortName}_`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast(`Salary slip dispatched to ${slip.teacherName} via WhatsApp`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007d55] to-[#004ac6] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">Faculty Attendance & Salary Payslip</h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                {institution.name} • {slip.monthYear}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFacultyForSlip(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2 active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payslip Card Sheet */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Institution Header */}
          <div className="bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd] text-center space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#004ac6]">Official Payroll Document</span>
            <h4 className="font-bold text-xs sm:text-sm text-[#131b2e]">{institution.name.toUpperCase()}</h4>
            <p className="text-[10px] text-[#737686]">{institution.boardName} • Affiliation: {institution.affiliationCode}</p>
          </div>

          {/* Teacher Bio & Attendance Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 bg-[#faf8ff] p-3 rounded-2xl border border-[#eaedff]">
            <div>
              <span className="text-[10px] text-[#737686] block uppercase font-bold">Faculty Name</span>
              <span className="font-bold text-[#131b2e] text-xs sm:text-sm">{slip.teacherName}</span>
              <span className="text-[10px] text-[#004ac6] font-semibold block">{slip.designation} • {slip.subject}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#737686] block uppercase font-bold">Pay Period</span>
              <span className="font-bold text-[#131b2e] text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#007d55]" />
                {slip.monthYear}
              </span>
              <span className="text-[10px] text-[#007d55] font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Principal Authorized
              </span>
            </div>
          </div>

          {/* Attendance Breakdown Matrix */}
          <div className="border border-[#dae2fd] rounded-xl overflow-hidden">
            <div className="bg-[#eaedff] px-3 py-2 text-[10px] font-bold uppercase text-[#737686] flex justify-between">
              <span>Attendance Component</span>
              <span>Days Logged</span>
            </div>
            <div className="divide-y divide-[#f2f3ff] bg-white">
              <div className="px-3 py-2 flex justify-between items-center">
                <span>Total Month Working Days</span>
                <span className="font-mono font-bold">{slip.totalWorkingDays} days</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#007d55]">
                <span>Present & Full Duty Days</span>
                <span className="font-mono font-bold">{slip.presentDays} days</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#004ac6]">
                <span>External Examination / Exam On-Duty</span>
                <span className="font-mono font-bold">{slip.onDutyDays} days</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#b45309]">
                <span>Sanctioned Paid Leaves (CL/SL/EL)</span>
                <span className="font-mono font-bold">{slip.paidLeavesCount} days</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#ba1a1a]">
                <span>Unapproved Absences / Loss of Pay</span>
                <span className="font-mono font-bold">{slip.unpaidAbsences} days</span>
              </div>
            </div>
          </div>

          {/* Financial Calculation Ledger */}
          <div className="border border-[#dae2fd] rounded-xl overflow-hidden">
            <div className="bg-[#eaedff] px-3 py-2 text-[10px] font-bold uppercase text-[#737686] flex justify-between">
              <span>Earnings & Deductions</span>
              <span>Amount ({institution.currencySymbol})</span>
            </div>
            <div className="divide-y divide-[#f2f3ff] bg-white">
              <div className="px-3 py-2 flex justify-between items-center">
                <span>Base Monthly Salary</span>
                <span className="font-mono font-bold">{institution.currencySymbol}{slip.baseMonthlySalary.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#007d55]">
                <span>Duty & Special Allowance</span>
                <span className="font-mono font-bold">+{institution.currencySymbol}{slip.dutyAllowance.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-[#ba1a1a]">
                <span>Loss of Pay (LOP) Attendance Deduction</span>
                <span className="font-mono font-bold">-{institution.currencySymbol}{slip.lopDeduction.toLocaleString()}</span>
              </div>
              <div className="px-3 py-2.5 bg-[#f2f3ff] flex justify-between items-center text-sm font-bold text-[#131b2e]">
                <span>Net Payable Salary</span>
                <span className="font-mono text-[#007d55] text-base">{institution.currencySymbol}{slip.netPayableSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Principal Seal & Authorization Stamp */}
          <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#eaedff] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#bdffdb] flex items-center justify-center text-[#007d55]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#131b2e] block">Authorized & Approved by Principal</span>
                <span className="text-[10px] text-[#737686]">{institution.principalDesignation}: {institution.principalName}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#737686] bg-white px-2 py-1 rounded-lg border border-[#dae2fd]">
              {slip.principalApprovalDate}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#f2f3ff] border-t border-[#dae2fd] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-4 bg-white hover:bg-[#eaedff] text-[#131b2e] border border-[#dae2fd] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Payslip</span>
          </button>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFacultyForSlip(null)}
              className="h-10 px-3.5 bg-white border border-[#dae2fd] text-[#434655] text-xs font-bold rounded-xl active:scale-95"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleWhatsAppSlip}
              className="h-10 px-4 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp Payslip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
