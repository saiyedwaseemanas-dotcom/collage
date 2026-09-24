import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { useApp } from '../context/AppContext';
import { UserCheck, X, Trash2, Save, Wallet } from 'lucide-react';

interface TeacherEditModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
}

export const TeacherEditModal: React.FC<TeacherEditModalProps> = ({ teacher, isOpen, onClose, isNew = false }) => {
  const { addTeacher, updateTeacher, deleteTeacher, showToast, institution } = useApp();

  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    designation: 'Senior PGT Faculty',
    subject: 'Mathematics',
    department: 'Department of Mathematics',
    qualification: 'M.Sc., B.Ed.',
    phone: '+91 98765 11223',
    email: 'faculty@school.edu.in',
    status: 'In Campus',
    biometricCheckIn: '07:45 AM',
    scheduledOut: '02:30 PM',
    baseSalary: 60000,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    leaveBalance: { cl: 8, sl: 10, el: 15 },
    classesAssigned: ['Class 10-A', 'Class 10-B'],
  });

  useEffect(() => {
    if (teacher && !isNew) {
      setFormData(teacher);
    } else if (isNew) {
      setFormData({
        name: '',
        designation: 'Senior Faculty',
        subject: 'Physics',
        department: 'Department of Natural Sciences',
        qualification: 'M.Sc., Ph.D.',
        phone: '+91 98765 99887',
        email: 'teacher@school.edu.in',
        status: 'In Campus',
        biometricCheckIn: '07:50 AM',
        scheduledOut: '02:30 PM',
        baseSalary: 65000,
        avatarUrl: `https://images.unsplash.com/photo-${1573496359142 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
        leaveBalance: { cl: 10, sl: 10, el: 15 },
        classesAssigned: ['Class 10-A'],
      });
    }
  }, [teacher, isNew, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      showToast('Please provide faculty name and subject', 'warning');
      return;
    }

    if (isNew) {
      addTeacher(formData as Teacher);
      showToast(`Faculty member ${formData.name} added to database`);
    } else if (teacher) {
      updateTeacher(teacher.id, formData);
      showToast(`Updated record for ${formData.name}`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (teacher && confirm(`Delete faculty member ${teacher.name} from the school database?`)) {
      deleteTeacher(teacher.id);
      showToast(`Faculty ${teacher.name} removed`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#007d55] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">
                {isNew ? 'Add Faculty Member' : `Edit: ${teacher?.name}`}
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">Manage biometric status, salary & classes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2 active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Faculty Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                placeholder="e.g. Dr. Rajesh Kumar"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Primary Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                placeholder="e.g. Mathematics / Physics"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Department / Wing</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Science Wing"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Monthly Base Salary ({institution.currencySymbol})</label>
              <input
                type="number"
                value={formData.baseSalary}
                onChange={e => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold text-[#007d55] border border-[#dae2fd] focus:bg-white"
                placeholder="60000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Phone / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Current Campus Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
              >
                <option value="In Campus">In Campus</option>
                <option value="On Duty (Exam)">On Duty (Exam)</option>
                <option value="On Leave">On Leave</option>
                <option value="Field Work">Field Work</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Biometric Check-In</label>
              <input
                type="text"
                value={formData.biometricCheckIn}
                onChange={e => setFormData({ ...formData, biometricCheckIn: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#eaedff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 px-3.5 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Teacher</span>
              </button>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial h-10 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] text-xs font-bold rounded-xl active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial h-10 px-5 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isNew ? 'Add Faculty' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
