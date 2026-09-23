import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';

interface StudentEditModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({ student, isOpen, onClose, isNew = false }) => {
  const { addStudent, updateStudent, deleteStudent, showToast, selectedClass } = useApp();

  const [formData, setFormData] = useState<Partial<Student>>({
    rollNo: '1021',
    name: '',
    classSec: selectedClass,
    gradeLevel: (selectedClass.replace('Class ', '') as any) || '10-A',
    parentName: '',
    parentRelation: 'Father',
    parentPhone: '+91 98765 43210',
    parentWhatsApp: '+919876543210',
    parentEmail: '',
    attendancePct: 92.5,
    totalPresent: 37,
    totalWorkingDays: 40,
    todayStatus: 'P',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    marks: {
      ut1: { math: 42, sci: 45, eng: 40 },
      ut2: { math: 45, sci: 46, eng: 43 },
      midTerm: { math: 72, sci: 74, eng: 68 },
    },
  });

  useEffect(() => {
    if (student && !isNew) {
      setFormData(student);
    } else if (isNew) {
      const nextRoll = Math.floor(1000 + Math.random() * 9000).toString();
      setFormData({
        rollNo: nextRoll,
        name: '',
        classSec: selectedClass,
        gradeLevel: (selectedClass.replace('Class ', '') as any) || '10-A',
        parentName: '',
        parentRelation: 'Father',
        parentPhone: '+91 98765 00000',
        parentWhatsApp: '+919876500000',
        parentEmail: '',
        attendancePct: 95.0,
        totalPresent: 38,
        totalWorkingDays: 40,
        todayStatus: 'P',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
        marks: {
          ut1: { math: 40, sci: 42, eng: 38 },
          ut2: { math: 42, sci: 44, eng: 40 },
          midTerm: { math: 70, sci: 72, eng: 65 },
        },
      });
    }
  }, [student, isNew, isOpen, selectedClass]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo) {
      showToast('Please enter student name and roll number', 'warning');
      return;
    }

    if (isNew) {
      addStudent(formData as Student);
      showToast(`Student ${formData.name} added successfully!`);
    } else if (student) {
      updateStudent(student.id, formData);
      showToast(`Updated student profile for ${formData.name}`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (student && confirm(`Are you sure you want to permanently delete student ${student.name} (Roll #${student.rollNo})?`)) {
      deleteStudent(student.id);
      showToast(`Student ${student.name} deleted`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004ac6] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                {isNew ? 'person_add' : 'manage_accounts'}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">
                {isNew ? 'Add New Student' : `Edit: ${student?.name}`}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                {formData.classSec} • Roll #{formData.rollNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold text-[#131b2e] border border-[#dae2fd]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Student Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
                placeholder="e.g. Aarav Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class & Section</label>
              <select
                value={formData.classSec}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    classSec: val,
                    gradeLevel: val.replace('Class ', '') as any,
                  });
                }}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
              >
                <option value="Class 10-A">Class 10-A</option>
                <option value="Class 10-B">Class 10-B</option>
                <option value="Class 9-A">Class 9-A</option>
                <option value="Class 11-Sci">Class 11-Sci</option>
                <option value="Class 12-Sci">Class 12-Sci</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Avatar Image URL</label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
              />
            </div>
          </div>

          {/* Parent & Contact Details */}
          <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2.5">
            <h4 className="font-bold text-xs text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#004ac6]">family_restroom</span>
              Parent & WhatsApp Contact Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Guardian Name</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  placeholder="e.g. Ramesh Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Relation</label>
                <select
                  value={formData.parentRelation}
                  onChange={e => setFormData({ ...formData, parentRelation: e.target.value as any })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Parent Phone (Call)</label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Parent WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.parentWhatsApp}
                  onChange={e => setFormData({ ...formData, parentWhatsApp: e.target.value })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
                  placeholder="+919876543210"
                />
              </div>
            </div>
          </div>

          {/* Attendance Initial Config */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Present</label>
              <input
                type="number"
                value={formData.totalPresent}
                onChange={e => {
                  const p = parseInt(e.target.value) || 0;
                  const total = formData.totalWorkingDays || 40;
                  const pct = parseFloat(((p / total) * 100).toFixed(1));
                  setFormData({ ...formData, totalPresent: p, attendancePct: pct });
                }}
                className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Total Days</label>
              <input
                type="number"
                value={formData.totalWorkingDays}
                onChange={e => {
                  const t = parseInt(e.target.value) || 1;
                  const p = formData.totalPresent || 0;
                  const pct = parseFloat(((p / t) * 100).toFixed(1));
                  setFormData({ ...formData, totalWorkingDays: t, attendancePct: pct });
                }}
                className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Ratio</label>
              <input
                type="number"
                readOnly
                value={formData.attendancePct}
                className="w-full h-10 px-2 bg-[#e2e7ff] rounded-xl text-xs font-bold text-[#004ac6] border border-[#dae2fd]"
              />
            </div>
          </div>

          {/* Footer buttons responsive stack */}
          <div className="pt-2 border-t border-[#eaedff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="h-11 sm:h-10 px-3.5 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Delete Student</span>
              </button>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial h-11 sm:h-10 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial h-11 sm:h-10 px-5 bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{isNew ? 'Add Student' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
