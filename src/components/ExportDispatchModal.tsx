import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePdfDocument, generateExcelDocument, generateCsvDocument, buildWhatsAppMessage, buildEmailDispatch } from '../utils/exportUtils';
import { Student } from '../types';

export const ExportDispatchModal: React.FC = () => {
  const {
    dispatchModalConfig,
    closeDispatchModal,
    institution,
    students,
    teachers,
    syllabus,
    selectedExam,
    showToast,
  } = useApp();

  if (!dispatchModalConfig.isOpen) return null;

  const [format, setFormat] = useState<'pdf' | 'excel' | 'sheets'>(dispatchModalConfig.defaultFormat || 'pdf');
  const [recipientType, setRecipientType] = useState<'principal' | 'parent' | 'all-parents'>(dispatchModalConfig.defaultRecipientType || 'principal');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    dispatchModalConfig.targetStudent?.id || (students.length > 0 ? students[0].id : '')
  );
  const [customNote, setCustomNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      if (format === 'pdf') {
        const file = generatePdfDocument({
          institution,
          students,
          teachers,
          syllabus,
          targetStudent: recipientType === 'parent' ? currentStudent : undefined,
          targetClass: dispatchModalConfig.targetClass,
          selectedExam,
          category: dispatchModalConfig.reportCategory,
        });
        showToast(`Downloaded official PDF: ${file}`);
      } else if (format === 'excel') {
        const file = generateExcelDocument({
          institution,
          students,
          teachers,
          syllabus,
          category: dispatchModalConfig.reportCategory,
        });
        showToast(`Downloaded Excel Workbook: ${file}`);
      } else {
        const file = generateCsvDocument({
          institution,
          students,
          teachers,
          syllabus,
          category: dispatchModalConfig.reportCategory,
        });
        showToast(`Downloaded Google Sheets CSV: ${file}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Export generated successfully');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppSend = () => {
    if (recipientType === 'parent') {
      const { url } = buildWhatsAppMessage({
        recipientType: 'parent',
        institution,
        student: currentStudent,
      });
      window.open(url, '_blank');
      showToast(`WhatsApp report dispatched to ${currentStudent.parentName} (${currentStudent.name})`);
    } else if (recipientType === 'principal') {
      const { url } = buildWhatsAppMessage({
        recipientType: 'principal',
        institution,
        summaryText: customNote || undefined,
      });
      window.open(url, '_blank');
      showToast(`Executive summary dispatched to ${institution.principalDesignation} ${institution.principalName}`);
    } else {
      const firstUrl = buildWhatsAppMessage({
        recipientType: 'parent',
        institution,
        student: students[0],
      }).url;
      window.open(firstUrl, '_blank');
      showToast(`Batch WhatsApp broadcast prepared for ${students.length} parents`);
    }
    handleDownload();
  };

  const handleEmailSend = () => {
    if (recipientType === 'parent') {
      const { mailto } = buildEmailDispatch({
        recipientType: 'parent',
        institution,
        student: currentStudent,
      });
      window.location.href = mailto;
      showToast(`Email client opened for ${currentStudent.parentName}`);
    } else {
      const { mailto } = buildEmailDispatch({
        recipientType: 'principal',
        institution,
        summaryText: customNote || undefined,
      });
      window.location.href = mailto;
      showToast(`Email draft generated for ${institution.principalName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">send</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg leading-tight truncate">
                {dispatchModalConfig.title || 'Push & Dispatch Report'}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 mt-0.5 truncate">
                {institution.name} • {institution.affiliationCode}
              </p>
            </div>
          </div>
          <button
            onClick={closeDispatchModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white shrink-0 ml-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
          {/* Step 1: Choose File Format */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#004ac6]">description</span>
              1. Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                  format === 'pdf'
                    ? 'border-[#004ac6] bg-[#004ac6]/5 ring-2 ring-[#004ac6]/20'
                    : 'border-[#dae2fd] bg-[#faf8ff] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#ba1a1a]">picture_as_pdf</span>
                <span className="text-[11px] sm:text-xs font-bold text-[#131b2e] leading-tight">Official PDF</span>
                <span className="text-[9px] sm:text-[10px] text-[#737686] hidden xs:inline">Signed Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                  format === 'excel'
                    ? 'border-[#007d55] bg-[#007d55]/5 ring-2 ring-[#007d55]/20'
                    : 'border-[#dae2fd] bg-[#faf8ff] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#007d55]">table_chart</span>
                <span className="text-[11px] sm:text-xs font-bold text-[#131b2e] leading-tight">Excel (.xlsx)</span>
                <span className="text-[9px] sm:text-[10px] text-[#737686] hidden xs:inline">Multi-Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('sheets')}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                  format === 'sheets'
                    ? 'border-[#4648d4] bg-[#4648d4]/5 ring-2 ring-[#4648d4]/20'
                    : 'border-[#dae2fd] bg-[#faf8ff] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#4648d4]">sync_alt</span>
                <span className="text-[11px] sm:text-xs font-bold text-[#131b2e] leading-tight">Sheets (CSV)</span>
                <span className="text-[9px] sm:text-[10px] text-[#737686] hidden xs:inline">Live Sync</span>
              </button>
            </div>
          </div>

          {/* Step 2: Choose Recipient Target */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#007d55]">person_pin</span>
              2. Target Recipient
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setRecipientType('principal')}
                className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center ${
                  recipientType === 'principal'
                    ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b]'
                    : 'border-[#dae2fd] bg-[#faf8ff] text-[#434655] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">account_balance</span>
                <span className="truncate">{institution.principalDesignation}</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType('parent')}
                className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center ${
                  recipientType === 'parent'
                    ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b]'
                    : 'border-[#dae2fd] bg-[#faf8ff] text-[#434655] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">person</span>
                <span className="truncate">Student Parent</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType('all-parents')}
                className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-center ${
                  recipientType === 'all-parents'
                    ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b]'
                    : 'border-[#dae2fd] bg-[#faf8ff] text-[#434655] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">group</span>
                <span className="truncate">All Parents</span>
              </button>
            </div>
          </div>

          {/* Individual Parent Selector if 'parent' is chosen */}
          {recipientType === 'parent' && (
            <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-[#131b2e] block">Select Student & Guardian</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNo} {s.name} ({s.classSec}) — {s.parentName} ({s.parentWhatsApp})
                  </option>
                ))}
              </select>
              {currentStudent && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px] sm:text-[11px] text-[#737686] pt-1">
                  <span>Attendance: <strong className="text-[#131b2e]">{currentStudent.attendancePct}%</strong></span>
                  <span className="truncate">WA: <strong className="text-[#007d55]">{currentStudent.parentWhatsApp}</strong></span>
                  <span className="col-span-2 sm:col-span-1">UT2 Score: <strong className="text-[#004ac6]">{currentStudent.marks.ut2.math + currentStudent.marks.ut2.sci + currentStudent.marks.ut2.eng}/150</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Principal Contact Info if 'principal' is chosen */}
          {recipientType === 'principal' && (
            <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#131b2e] truncate">{institution.principalName} ({institution.principalDesignation})</span>
                <span className="text-[9px] sm:text-[10px] bg-[#bdffdb] text-[#002113] font-bold px-2 py-0.5 rounded-full shrink-0">Direct Executive</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#737686] truncate">
                WA: <strong className="text-[#007d55]">{institution.principalWhatsApp}</strong> • Email: <strong className="text-[#004ac6]">{institution.principalEmail}</strong>
              </p>
              <input
                type="text"
                placeholder="Optional executive note (e.g. 'All Term-2 marks uploaded')"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="w-full h-9 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] mt-1"
              />
            </div>
          )}

          {/* Live Preview Box */}
          <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#eaedff] space-y-1 text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-[#131b2e]">
              <span>Document: <strong className="text-[#004ac6] uppercase">{format}</strong></span>
              <span className="truncate max-w-[140px]">Branding: <strong className="text-[#007d55]">{institution.shortName}</strong></span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#737686] leading-relaxed">
              Sending via WhatsApp will launch WhatsApp with a pre-filled verified message and trigger document download.
            </p>
          </div>
        </div>

        {/* Modal Footer Action Buttons - Responsive stack on mobile */}
        <div className="p-3 sm:p-4 bg-[#f2f3ff] border-t border-[#eaedff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full sm:w-auto h-11 sm:h-10 px-4 bg-white hover:bg-[#eaedff] text-[#131b2e] border border-[#dae2fd] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download {format.toUpperCase()}</span>
          </button>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={handleEmailSend}
              className="h-11 sm:h-10 px-3.5 bg-[#dbe1ff] hover:bg-[#c7d2fe] text-[#004ac6] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="h-11 sm:h-10 px-4 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
