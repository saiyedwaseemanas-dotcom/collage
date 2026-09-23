import React from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

export const StudentDetailModal: React.FC<{ student: Student | null; onClose: () => void }> = ({
  student,
  onClose,
}) => {
  const { showToast, setActiveStudentForReport, setActiveTab } = useApp();

  if (!student) return null;

  const handleOpenReportCard = () => {
    setActiveStudentForReport(student);
    setActiveTab('exams');
    onClose();
    showToast(`Loaded Report Card for ${student.name}`);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `EduTrack Pro DPS Sector 4: Academic & Attendance progress summary for ${student.name} (Roll: ${student.rollNo}, ${student.classSec}). Overall Attendance: ${student.attendancePct}%. Please contact school administration for further queries.`
    );
    window.open(`https://wa.me/${student.parentWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4 border border-[#eaedff]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#131b2e]">{student.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#004ac6]">
                  Roll {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-[#737686]">{student.classSec} • {student.parentRelation}: {student.parentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Attendance & Performance Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#737686]">Aggregate Attendance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-bold ${student.attendancePct < 75 ? 'text-[#ba1a1a]' : 'text-[#007d55]'}`}>
                {student.attendancePct}%
              </span>
              <span className="text-[10px] text-[#737686]">({student.totalPresent}/{student.totalWorkingDays} days)</span>
            </div>
            {student.attendancePct < 75 ? (
              <span className="text-[10px] font-bold text-[#ba1a1a] mt-1 bg-[#ffdad6] px-1.5 py-0.5 rounded">
                CBSE Statutory Defaulter Limit (&lt;75%)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#007d55] mt-1">Good Standing</span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#f2f3ff] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#737686]">UT-2 Assessment Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold text-[#004ac6]">
                {(student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng)}
              </span>
              <span className="text-[10px] text-[#737686]">/ 150 (Total)</span>
            </div>
            <span className="text-[10px] text-[#737686] mt-1">
              Math: {student.marks.ut2.math} • Sci: {student.marks.ut2.sci} • Eng: {student.marks.ut2.eng}
            </span>
          </div>
        </div>

        {/* Parent & Contact Info */}
        <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-left space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">Guardian & Emergency Contact</span>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#131b2e]">
            <div>
              <span className="text-[#737686] block text-[10px]">Guardian Name</span>
              <span className="font-semibold">{student.parentName} ({student.parentRelation})</span>
            </div>
            <div>
              <span className="text-[#737686] block text-[10px]">Phone Number</span>
              <span className="font-semibold font-mono">{student.parentPhone}</span>
            </div>
          </div>
          {student.note && (
            <div className="pt-2 border-t border-[#eaedff] text-xs text-[#434655]">
              <span className="font-semibold text-[#004ac6]">Official Notes:</span> {student.note}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleSendWhatsApp}
            className="h-11 bg-[#007d55] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp Parent
          </button>
          <button
            onClick={handleOpenReportCard}
            className="h-11 bg-[#004ac6] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            View Report Card
          </button>
        </div>
      </div>
    </div>
  );
};
