import React from 'react';
import { useApp } from '../context/AppContext';

export const TeachersRegisterView: React.FC = () => {
  const { teachers, updateTeacherStatus, showToast } = useApp();

  const handleCallTeacher = (phone: string, name: string) => {
    showToast(`Connecting direct intercom to ${name} (${phone})`);
  };

  const handleEmailTeacher = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Teachers Register</h2>
          <span className="px-3 py-1 bg-[#bdffdb] text-[#002113] font-bold text-xs rounded-full">
            {teachers.length} Faculty Members
          </span>
        </div>
        <p className="text-xs text-[#737686]">
          Daily biometric duty status, assigned classes, qualifications, and leave balances.
        </p>
      </div>

      {/* Teachers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teachers.map(teacher => (
          <div
            key={teacher.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3.5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-[#004ac6]/20 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-[#131b2e]">{teacher.name}</h4>
                  <p className="text-xs text-[#004ac6] font-semibold">{teacher.designation}</p>
                  <span className="text-[11px] text-[#737686] block mt-0.5">{teacher.qualification}</span>
                </div>
              </div>

              {/* Status Select */}
              <select
                value={teacher.status}
                onChange={e => updateTeacherStatus(teacher.id, e.target.value as any)}
                className="text-[11px] font-bold px-2 py-1 rounded-xl bg-[#f2f3ff] text-[#131b2e] border border-[#dae2fd] focus:outline-none"
              >
                <option value="In Campus">In Campus</option>
                <option value="On Duty (Exam)">On Duty (Exam)</option>
                <option value="On Leave">On Leave</option>
                <option value="Field Work">Field Work</option>
              </select>
            </div>

            {/* Timetable & Biometric Info */}
            <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-3 rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]/50">
              <div>
                <span className="text-[10px] text-[#737686] block font-bold uppercase">Biometric Punch</span>
                <span className="font-bold font-mono text-[#007d55] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">fingerprint</span>
                  {teacher.biometricCheckIn}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737686] block font-bold uppercase">Scheduled Shift</span>
                <span className="font-bold font-mono text-[#434655] mt-0.5 block">{teacher.scheduledOut}</span>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#737686] font-medium">Assigned:</span>
              {teacher.classesAssigned.map(cls => (
                <span
                  key={cls}
                  className="bg-[#eaedff] text-[#004ac6] text-[11px] font-bold px-2 py-0.5 rounded-lg"
                >
                  {cls}
                </span>
              ))}
            </div>

            {/* Leave Balance & Contact Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#f2f3ff]">
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#737686]">Leaves:</span>
                <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">CL:{teacher.leaveBalance.cl}</span>
                <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">SL:{teacher.leaveBalance.sl}</span>
                <span className="font-semibold bg-[#f2f3ff] px-1.5 py-0.5 rounded">EL:{teacher.leaveBalance.el}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCallTeacher(teacher.phone, teacher.name)}
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#004ac6] transition-colors"
                  type="button"
                  title="Call Faculty"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                </button>
                <button
                  onClick={() => handleEmailTeacher(teacher.email)}
                  className="w-8 h-8 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] flex items-center justify-center text-[#007d55] transition-colors"
                  type="button"
                  title="Email Faculty"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
