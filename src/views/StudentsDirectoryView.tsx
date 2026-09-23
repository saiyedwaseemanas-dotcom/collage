import React, { useState } from 'react';
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
} from 'lucide-react';

export const StudentsDirectoryView: React.FC = () => {
  const {
    students,
    institution,
    showToast,
    setActiveStudentForReport,
    setActiveTab,
    openDispatchModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<'ALL' | '10-A' | '10-B' | '9-A' | '11-Sci' | '12-Sci'>('ALL');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  // Edit / Add Modal state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || s.gradeLevel === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

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
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Students Database</h2>
            <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#004ac6] font-bold text-xs rounded-full">
              {filteredStudents.length} Records
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Complete database ledger with Add, Edit, Delete, Save and instant PDF/Excel/WhatsApp push actions.
          </p>
        </div>

        {/* Action Buttons: Add Student + Push Master Roster */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Students Master Roster Export',
                reportCategory: 'attendance-register',
                defaultFormat: 'excel',
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
            className="h-10 px-3.5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            <span className="truncate">+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Class Filters */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xs border border-[#eaedff] space-y-2.5 sm:space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by student name, roll no, or parent name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-4 bg-[#f2f3ff] rounded-xl sm:rounded-2xl text-xs text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
          />
          <Search className="w-4 h-4 text-[#737686] absolute left-3 top-3 sm:top-3.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {(['ALL', '10-A', '10-B', '9-A', '11-Sci', '12-Sci'] as const).map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClassFilter(cls)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                selectedClassFilter === cls
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {cls === 'ALL' ? 'All Sections' : `Class ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {filteredStudents.map(student => {
          const isDefaulter = student.attendancePct < institution.defaulterThreshold;
          const totalScore = student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng;
          const scorePct = ((totalScore / 150) * 100).toFixed(1);

          return (
            <div
              key={student.id}
              className={`bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3 hover:shadow-sm ${
                isDefaulter ? 'border-[#ba1a1a]/40 bg-[#fffbfa]' : 'border-[#eaedff]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ring-[#004ac6]/20 shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{student.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#eaedff] text-[#004ac6] shrink-0">
                        #{student.rollNo}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-[#737686]">{student.classSec}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDefaulter ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#bdffdb] text-[#002113]'
                    }`}
                  >
                    {student.attendancePct}% Att
                  </span>
                  <button
                    onClick={() => handleEditStudent(student)}
                    className="text-[11px] font-bold text-[#004ac6] hover:underline flex items-center gap-0.5 active:scale-95"
                    title="Edit Student Data"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Quick Info Strip */}
              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-xs text-[#131b2e]">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block">Guardian</span>
                  <span className="font-semibold truncate block">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-[#737686] block">UT-2 Score</span>
                  <span className="font-semibold font-mono text-[#004ac6]">
                    {totalScore} / 150 ({scorePct}%)
                  </span>
                </div>
              </div>

              {/* Push Action Buttons: WhatsApp / PDF Report / Profile */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
                <button
                  onClick={() =>
                    openDispatchModal({
                      title: `Push Report Card: ${student.name}`,
                      reportCategory: 'student-report',
                      defaultFormat: 'pdf',
                      defaultRecipientType: 'parent',
                      targetStudent: student,
                    })
                  }
                  className="flex-1 h-9 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                  type="button"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="truncate">Push WA/PDF</span>
                </button>

                <button
                  onClick={() => {
                    setActiveStudentForReport(student);
                    setActiveTab('exams');
                    showToast(`Viewing report card for ${student.name}`);
                  }}
                  className="h-9 px-2.5 sm:px-3 bg-[#dbe1ff] hover:bg-[#c7d2fe] text-[#004ac6] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                  type="button"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Marks</span>
                </button>

                <button
                  onClick={() => setInspectStudent(student)}
                  className="h-9 w-9 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex items-center justify-center transition-colors border border-[#dae2fd] active:scale-95 shrink-0"
                  type="button"
                  title="Full Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Detail View Modal */}
      <StudentDetailModal student={inspectStudent} onClose={() => setInspectStudent(null)} />

      {/* Student Add / Edit / Delete Modal */}
      <StudentEditModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isNew={isNewStudent}
      />
    </div>
  );
};
