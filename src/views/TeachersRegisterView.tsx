import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher } from '../types';
import { TeacherEditModal } from '../components/TeacherEditModal';
import {
  Send,
  UserPlus,
  Edit2,
  Fingerprint,
  Phone,
  Mail,
} from 'lucide-react';

export const TeachersRegisterView: React.FC = () => {
  const { teachers, updateTeacherStatus, showToast, openDispatchModal } = useApp();

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(false);

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

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Faculty & Staff Register</h2>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#bdffdb] text-[#002113] font-bold text-[10px] sm:text-xs rounded-full">
              {teachers.length} Active
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Biometric logs, assigned classes, qualifications, leave ledger, and instant export.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Faculty Biometric & Duty Report',
                reportCategory: 'faculty-summary',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
              })
            }
            className="flex-1 sm:flex-initial h-10 px-3 sm:px-3.5 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#131b2e] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            type="button"
          >
            <Send className="w-3.5 h-3.5 text-[#007d55]" />
            <span>Push Roster</span>
          </button>

          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-initial h-10 px-3.5 sm:px-4 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Faculty</span>
          </button>
        </div>
      </div>

      {/* Teachers List */}
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

              {/* Status Select */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <select
                  value={teacher.status}
                  onChange={e => updateTeacherStatus(teacher.id, e.target.value as any)}
                  className={`text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg sm:rounded-xl border focus:outline-none ${
                    teacher.status === 'In Campus'
                      ? 'bg-[#bdffdb]/40 text-[#002113] border-[#007d55]/30'
                      : teacher.status === 'On Duty (Exam)'
                      ? 'bg-[#dbe1ff] text-[#004ac6] border-[#004ac6]/30'
                      : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                  }`}
                >
                  <option value="In Campus">In Campus</option>
                  <option value="On Duty (Exam)">On Duty</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Field Work">Field Work</option>
                </select>
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
                <span className="text-[9px] sm:text-[10px] text-[#737686] block font-bold uppercase">Biometric Punch</span>
                <span className="font-bold font-mono text-[#007d55] flex items-center gap-1 mt-0.5 text-[11px] sm:text-xs">
                  <Fingerprint className="w-3.5 h-3.5" />
                  {teacher.biometricCheckIn}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-[#737686] block font-bold uppercase">Scheduled Shift</span>
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

      <TeacherEditModal
        teacher={editingTeacher}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isNew={isNewTeacher}
      />
    </div>
  );
};
