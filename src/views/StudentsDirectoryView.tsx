import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { StudentEditModal } from '../components/StudentEditModal';
import {
  Send,
  UserPlus,
  Search,
  Edit3,
  Award,
  Eye,
  Layers,
  Camera,
  Plus,
  Trash2,
  Wallet,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  Building2,
  GraduationCap,
} from 'lucide-react';

export const StudentsDirectoryView: React.FC = () => {
  const {
    students,
    classes,
    setIsClassModalOpen,
    institution,
    showToast,
    setActiveStudentForReport,
    setActiveTab,
    openDispatchModal,
    getFeeForStudent,
    deleteStudent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  // Edit / Add Modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.classSec && s.classSec.toLowerCase().includes(q));

      if (selectedClassFilter === 'ALL') return matchesSearch;

      const targetGrade = selectedClassFilter.replace(/^class\s*/i, '').trim().toLowerCase();
      const sGrade = s.gradeLevel ? s.gradeLevel.toLowerCase() : '';
      const sClass = s.classSec ? s.classSec.toLowerCase() : '';
      const matchesClass = sGrade === targetGrade || sClass === selectedClassFilter.toLowerCase() || sClass.includes(targetGrade);

      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClassFilter]);

  const handleAddNewStudent = () => {
    setEditingStudent(null);
    setIsNewStudent(true);
    setIsEditModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsNewStudent(false);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Students Database & Directory</h2>
            <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#004ac6] font-bold text-xs rounded-full">
              {filteredStudents.length} Records
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Class-wise student roster spanning Kindergarten to Doctorate Ph.D with direct photo uploads, parent communication & fee telemetry.
          </p>
        </div>

        {/* Action Buttons: Add Student + Push Master Roster */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Students Master Roster Export',
                reportCategory: 'attendance-register',
                defaultFormat: 'sheets',
                defaultRecipientType: 'principal',
              })
            }
            className="h-10 px-3 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#131b2e] rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            type="button"
          >
            <Send className="w-3.5 h-3.5 text-[#004ac6]" />
            <span className="truncate">Push Roster</span>
          </button>

          <button
            onClick={handleAddNewStudent}
            className="h-10 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            <span className="truncate">+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Class Option Selector & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search by student name, roll number, parent name, or class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
            <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Universal Class Option Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white cursor-pointer"
              >
                <option value="ALL">All Classes & Tiers ({classes.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              className="h-10 px-3 bg-[#eaedff] hover:bg-[#dbe1ff] text-[#004ac6] rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95"
              title="Add or Manage Classes"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Horizontal Scroll Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <button
            onClick={() => setSelectedClassFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
              selectedClassFilter === 'ALL'
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
            }`}
            type="button"
          >
            All Classes ({students.length})
          </button>

          {classes.slice(0, 10).map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassFilter(cls.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                selectedClassFilter === cls.name
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredStudents.map(student => {
          const isDefaulter = student.attendancePct < institution.defaulterThreshold;
          const fee = getFeeForStudent(student.id, student.classSec);

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#eaedff] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Header with Student Photo & Class */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative group">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-[#dae2fd] shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleEditStudent(student)}
                        className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Change Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#131b2e] truncate">{student.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#737686]">
                        <span className="font-mono font-bold text-[#004ac6]">Roll #{student.rollNo}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#131b2e] truncate">{student.classSec}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDefaulter ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#bdffdb] text-[#002113]'
                    }`}
                  >
                    {student.attendancePct}%
                  </span>
                </div>

                {/* Parent & Financial Info */}
                <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#dae2fd]/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#434655]">
                    <span>Parent: <strong className="text-[#131b2e]">{student.parentName}</strong></span>
                    <span className="text-[10px] text-[#737686]">{student.parentRelation}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#434655]">
                    <span>WhatsApp:</span>
                    <span className="font-mono font-bold text-[#131b2e]">{student.parentWhatsApp}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#dae2fd]/40">
                    <span className="flex items-center gap-1 text-[#737686]">
                      <Wallet className="w-3 h-3 text-[#007d55]" />
                      Fee Due:
                    </span>
                    <strong className={fee.balanceDue > 0 ? 'text-[#ba1a1a]' : 'text-[#007d55]'}>
                      {institution.currencySymbol}{fee.balanceDue.toLocaleString()} ({fee.status})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => setInspectStudent(student)}
                  className="flex-1 h-8.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditStudent(student)}
                  className="flex-1 h-8.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStudentForReport(student);
                    setActiveTab('exams');
                  }}
                  className="flex-1 h-8.5 bg-[#004ac6] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Marks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Permanently remove student ${student.name} (Roll #${student.rollNo})?`)) {
                      deleteStudent(student.id);
                      showToast(`Removed student ${student.name}`);
                    }
                  }}
                  className="w-8.5 h-8.5 bg-white hover:bg-[#ffdad6] text-[#737686] hover:text-[#ba1a1a] rounded-xl border border-[#dae2fd] flex items-center justify-center transition-colors shrink-0"
                  title="Delete Student"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <StudentDetailModal
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
      />

      <StudentEditModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isNew={isNewStudent}
      />
    </div>
  );
};
