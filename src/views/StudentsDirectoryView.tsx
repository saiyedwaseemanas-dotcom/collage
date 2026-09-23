import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentDetailModal } from '../components/StudentDetailModal';

export const StudentsDirectoryView: React.FC = () => {
  const { students, showToast, setActiveStudentForReport, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<'ALL' | '10-A' | '10-B' | '9-A'>('ALL');
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || s.gradeLevel === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Title & Search */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Students Directory</h2>
          <span className="px-3 py-1 bg-[#dbe1ff] text-[#004ac6] font-bold text-xs rounded-full">
            {filteredStudents.length} Enrolled
          </span>
        </div>
        <p className="text-xs text-[#737686]">Complete pupil roster with parent details, GPA, and compliance logs.</p>
      </div>

      {/* Search Bar & Class Filters */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by student name, roll no, or parent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-[#737686]">
            search
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['ALL', '10-A', '10-B', '9-A'] as const).map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClassFilter(cls)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedClassFilter === cls
                  ? 'bg-[#004ac6] text-white shadow-sm'
                  : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStudents.map(student => {
          const isDefaulter = student.attendancePct < 75;
          const totalScore = student.marks.ut2.math + student.marks.ut2.sci + student.marks.ut2.eng;
          const scorePct = ((totalScore / 150) * 100).toFixed(1);

          return (
            <div
              key={student.id}
              className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex flex-col justify-between space-y-3 ${
                isDefaulter ? 'border-[#ba1a1a]/30' : 'border-[#eaedff]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#004ac6]/20 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[#131b2e]">{student.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#eaedff] text-[#004ac6]">
                        #{student.rollNo}
                      </span>
                    </div>
                    <span className="text-xs text-[#737686]">{student.classSec}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isDefaulter ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#bdffdb] text-[#002113]'
                  }`}
                >
                  {student.attendancePct}% Att
                </span>
              </div>

              {/* Quick Info Strip */}
              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-2.5 rounded-xl text-xs text-[#131b2e]">
                <div>
                  <span className="text-[10px] text-[#737686] block">Guardian</span>
                  <span className="font-semibold truncate block">{student.parentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#737686] block">UT-2 Score</span>
                  <span className="font-semibold font-mono text-[#004ac6]">
                    {totalScore} / 150 ({scorePct}%)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setInspectStudent(student)}
                  className="flex-1 h-9 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-[#dae2fd]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Profile
                </button>
                <button
                  onClick={() => {
                    setActiveStudentForReport(student);
                    setActiveTab('exams');
                    showToast(`Viewing report card for ${student.name}`);
                  }}
                  className="flex-1 h-9 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <StudentDetailModal student={inspectStudent} onClose={() => setInspectStudent(null)} />
    </div>
  );
};
