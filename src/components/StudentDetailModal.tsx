import React from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { X, MessageSquare, Award } from 'lucide-react';

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
      `EduTrack Pro: Academic & Attendance progress summary for ${student.name} (Roll: ${student.rollNo}, ${student.classSec}). Overall Attendance: ${student.attendancePct}%. Please contact school administration for further queries.`
    );
    window.open(`https://wa.me/${student.parentWhatsApp}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto space-y-3 sm:space-y-4 border border-[#eaedff]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">{student.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dbe1ff] text-[#004ac6]">
                  Roll {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-[#737686]">{student.classSec} • {student.parentRelation}: {student.parentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#dae2fd] active:scale-95 transition-all"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Attendance & Performance Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-left">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#f2f3ff] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">Aggregate Attendance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-lg sm:text-xl font-bold ${student.attendancePct < 75 ? 'text-[#ba1a1a]' : 'text-[#007d55]'}`}>
                {student.attendancePct}%
              </span>
              <span className="text-[10px] text-[#737686]">({student.totalPresent}/{student.totalWorkingDays} days)</span>
            </div>
            {student.attendancePct < 75 ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-[#ba1a1a] mt-1 bg-[#ffdad6] px-1.5 py-0.5 rounded">
                Defaulter (&lt;75%)
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-bold text-[#007d55] mt-1">Good Standing</span>
            )}
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#f2f3ff] flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#737686]">UT-2 Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-bold text-[#004ac6]">
                {(student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng)}
              </span>
              <span className="text-[10px] text-[#737686]">/ 150</span>
            </div>
            <span className="text-[10px] text-[#737686] mt-1 truncate">
              M:{student.marks.ut2.math} • S:{student.marks.ut2.sci} • E:{student.marks.ut2.eng}
            </span>
          </div>
        </div>

        {/* Parent & Contact Info */}
        <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-left space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">Guardian & Emergency Contact</span>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#131b2e]">
            <div>
              <span className="text-[#737686] block text-[10px]">Guardian Name</span>
              <span className="font-semibold truncate block">{student.parentName} ({student.parentRelation})</span>
            </div>
            <div>
              <span className="text-[#737686] block text-[10px]">Phone Number</span>
              <span className="font-semibold font-mono truncate block">{student.parentPhone}</span>
            </div>
          </div>
          {student.note && (
            <div className="pt-2 border-t border-[#eaedff] text-xs text-[#434655]">
              <span className="font-semibold text-[#004ac6]">Official Notes:</span> {student.note}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
          <button
            onClick={handleSendWhatsApp}
            className="h-10 sm:h-11 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Parent</span>
          </button>
          <button
            onClick={handleOpenReportCard}
            className="h-10 sm:h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Award className="w-4 h-4" />
            <span>View Report Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
