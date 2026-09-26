import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  UserCog,
  X,
  Users,
  Trash2,
  Save,
  Camera,
  Upload,
  Image,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const STUDENT_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDjnvEo4rntnVlzhL_NbNVaY5aV2Y748brFVD8M2w8R6FZj-sZi3Idkok1Gx2tRrAOlaWATe0ed2THYGEhcctg6BkLSQrR78hDguAY3ab5wbBZZtuCfPh2p5C1UUVePZtRUhe0In18o1_kzLSTzFY4aL271VNubkzdGPGiOQ4cwzliov16tppBzFlQ9aZMOPGZbinyUglE8jCMYgOxoQ-RFeRkCSZ-nFYxFYvue5uCZjArCvu8rwJrk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2TMiF9jA-VdX-snEiDHEeLTaLPtJVm-HU8uqwacukmuNfI8nlUlpPpmwjqQ2lhTqLIvYtqBdhTlPE0t55jP7UCKEkjkiK6UdcP9IYp4BSg0oeEgcpUslB5yXmqh4wPOiyHWmEocXHUKMuNW36rQOLtXvNsa4Biu3-Aw4KrK9MYRbSwwaeB0t7uyXP7MFUL-v82s6lhBj85ha2eYE_MKDjOTS3c0pobs703_g1oNwn76XaMBVIi167',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDwPRUkPExYzwOFERZnY0PqJsBp6UKVM8Lij9IAbKL4YBOciP-RwOUQX18-vyh68J11aJjlDIZXU7oVf2y1GqzxXbLHBz8aVkx8GU6VqN4TnqTjY38Himiooh9kbC-3j8TQETCJh9Xi4fMLN7OG1CaVIP5g2MLVpIV7K5YADd9ZgfNE8mbekYmARcrD34ZTIo46C_-D3OS5-0joKdmlBDSKJGZsLmFlBdm7gwoRMz2NzQGTC0z-hHT2',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

interface StudentEditModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
  defaultClassSec?: string;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  student,
  isOpen,
  onClose,
  isNew = false,
  defaultClassSec,
}) => {
  const { addStudent, updateStudent, deleteStudent, showToast, selectedClass, classes } = useApp();

  const initialClass = defaultClassSec || (selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Class 10-A'));

  const [formData, setFormData] = useState<Partial<Student>>({
    rollNo: '1021',
    name: '',
    classSec: initialClass,
    gradeLevel: initialClass.replace('Class ', '') || '10-A',
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
      const targetClass = defaultClassSec || (selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Class 10-A'));
      const nextRoll = Math.floor(1000 + Math.random() * 9000).toString();
      setFormData({
        rollNo: nextRoll,
        name: '',
        classSec: targetClass,
        gradeLevel: targetClass.replace('Class ', '') || '10-A',
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
  }, [student, isNew, isOpen, selectedClass, defaultClassSec, classes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo) {
      showToast('Please enter student name and roll number', 'warning');
      return;
    }

    if (isNew) {
      addStudent(formData as Student);
      showToast(`Student ${formData.name} added to ${formData.classSec}!`);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004ac6] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              {isNew ? (
                <UserPlus className="w-5 h-5 text-white" />
              ) : (
                <UserCog className="w-5 h-5 text-white" />
              )}
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2 active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
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
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Student Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                placeholder="e.g. Aarav Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class Preset (KG to PhD)</label>
              <select
                value={formData.classSec}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    classSec: val,
                    gradeLevel: val.replace(/^class\s*/i, ''),
                  });
                }}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
              >
                {formData.classSec && !classes.some(c => c.name === formData.classSec) && (
                  <option value={formData.classSec}>
                    {formData.classSec} (Selected Target)
                  </option>
                )}
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.section ? `(Sec ${c.section})` : ''} — {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class & Section Name</label>
              <input
                type="text"
                required
                value={formData.classSec || ''}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    classSec: val,
                    gradeLevel: val.replace(/^class\s*/i, ''),
                  });
                }}
                className="w-full h-10 px-3 bg-white rounded-xl text-xs font-bold font-mono text-[#004ac6] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30"
                placeholder="e.g. Class 1-B, KG-A, 10-A, B.Tech-Batch A"
              />
            </div>
          </div>

          {/* Student Photo Option Studio */}
          <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#dae2fd] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#131b2e] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#004ac6]" />
                Student Photo & Profile Picture Option
              </h4>
              <span className="text-[10px] text-[#737686]">JPG, PNG or Presets</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Photo Preview */}
              <div className="relative group shrink-0">
                <img
                  src={formData.avatarUrl || STUDENT_AVATAR_PRESETS[0]}
                  alt="Student Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#004ac6] shadow-sm bg-white"
                />
              </div>

              {/* Upload Local File or URL */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 h-9 px-3 bg-[#004ac6] hover:bg-[#003899] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Student Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, avatarUrl: reader.result as string });
                            showToast('Photo uploaded & updated preview!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const randomAvatar = STUDENT_AVATAR_PRESETS[Math.floor(Math.random() * STUDENT_AVATAR_PRESETS.length)];
                      setFormData({ ...formData, avatarUrl: randomAvatar });
                      showToast('Assigned random avatar');
                    }}
                    className="h-9 px-3 bg-white hover:bg-[#eaedff] text-[#434655] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center gap-1"
                    title="Pick Random Portrait"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Random</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={formData.avatarUrl || ''}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="Or paste external photo image URL..."
                  className="w-full h-8 px-2.5 bg-white rounded-lg text-[11px] text-[#434655] border border-[#dae2fd] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Avatar Gallery Preset Swatches */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-[#737686] block mb-1">Instant Avatar Library:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {STUDENT_AVATAR_PRESETS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: avatar })}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 shrink-0 ${
                      formData.avatarUrl === avatar ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30' : 'border-white'
                    }`}
                  >
                    <img src={avatar} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Parent & Contact Details */}
          <div className="p-3 bg-[#f2f3ff] rounded-xl sm:rounded-2xl border border-[#dae2fd] space-y-2.5">
            <h4 className="font-bold text-xs text-[#131b2e] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#004ac6]" />
              Parent & WhatsApp Contact Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Guardian Name</label>
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
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Relation</label>
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
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Parent Phone (Call)</label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Parent WhatsApp</label>
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
                className="h-10 px-3.5 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
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
                className="flex-1 sm:flex-initial h-10 px-5 bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isNew ? 'Add Student' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
