import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AcademicClass, ClassLevelCategory } from '../types';
import {
  GraduationCap,
  X,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Save,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES: ClassLevelCategory[] = [
  'Pre-Primary / Kindergarten',
  'Primary (1-5)',
  'Middle School (6-8)',
  'Secondary (9-10)',
  'Higher Secondary (11-12)',
  'Undergraduate (UG)',
  'Postgraduate (PG)',
  'Doctorate (Ph.D)',
];

export const ClassManageModal: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    selectedClass,
    setSelectedClass,
    isClassModalOpen,
    setIsClassModalOpen,
    teachers,
    showToast,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState<Partial<AcademicClass>>({
    name: '',
    category: 'Secondary (9-10)',
    section: 'A',
    department: 'General Studies',
    roomNo: '',
    mentorTeacherName: '',
    capacity: 40,
    totalEnrolled: 0,
  });

  if (!isClassModalOpen) return null;

  const handleStartAdd = () => {
    setEditingClass(null);
    setIsAddingNew(true);
    setFormData({
      name: '',
      category: 'Pre-Primary / Kindergarten',
      section: 'A',
      department: 'Early Childhood Education',
      roomNo: 'KG-01',
      mentorTeacherName: teachers[0]?.name || 'Senior Faculty',
      capacity: 35,
      totalEnrolled: 0,
    });
  };

  const handleStartEdit = (cls: AcademicClass) => {
    setIsAddingNew(false);
    setEditingClass(cls);
    setFormData(cls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please provide a class name (e.g. Senior KG, Class 10-A, B.Tech CSE, Ph.D)', 'warning');
      return;
    }

    if (isAddingNew) {
      const newClass: AcademicClass = {
        id: `cls-${Date.now()}`,
        name: formData.name,
        category: (formData.category as ClassLevelCategory) || 'Secondary (9-10)',
        section: formData.section || 'A',
        department: formData.department || 'Academic Wing',
        roomNo: formData.roomNo || 'Room 101',
        mentorTeacherName: formData.mentorTeacherName || 'Class Mentor',
        capacity: formData.capacity || 40,
        totalEnrolled: formData.totalEnrolled || 0,
      };
      addClass(newClass);
    } else if (editingClass) {
      updateClass(editingClass.id, formData);
    }

    setIsAddingNew(false);
    setEditingClass(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove class "${name}" from the curriculum database?`)) {
      deleteClass(id);
    }
  };

  const filteredClasses = filterCategory === 'ALL'
    ? classes
    : classes.filter(c => c.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">
                Academic Classes & Grade Management
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                Configure classes from Senior KG to Ph.D doctoral research
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsClassModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2 active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action ribbon & Category pills */}
        <div className="p-3 sm:p-4 bg-[#f2f3ff] border-b border-[#dae2fd] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#004ac6]" />
              <span>Classes Across All Academic Levels</span>
              <span className="bg-[#dbe1ff] text-[#004ac6] text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {classes.length} Total
              </span>
            </span>

            <button
              onClick={handleStartAdd}
              className="h-8 sm:h-9 px-3 bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Class</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
            {['ALL', ...CATEGORIES].map(cat => {
              const isSel = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                    isSel
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'bg-white text-[#434655] border border-[#dae2fd] hover:bg-[#eaedff]'
                  }`}
                  type="button"
                >
                  {cat === 'ALL' ? 'All Levels' : cat.split('/')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Add / Edit Form Panel */}
          {(isAddingNew || editingClass) && (
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 bg-[#faf8ff] rounded-2xl border-2 border-[#004ac6]/30 space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#dae2fd]">
                <span className="font-bold text-xs sm:text-sm text-[#004ac6] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{isAddingNew ? 'Create New Academic Class' : `Edit Class: ${editingClass?.name}`}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingClass(null);
                  }}
                  className="text-xs font-bold text-[#737686] hover:text-[#131b2e]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class / Grade Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior KG, Class 10-C, B.Tech CSE, Ph.D Year 1"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Section / Batch</label>
                  <input
                    type="text"
                    placeholder="A, B, Honors, Cohort"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Academic Level Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ClassLevelCategory })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Department / Wing</label>
                  <input
                    type="text"
                    placeholder="e.g. Early Childhood, Science Wing, Computer Science"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Room / Lab No.</label>
                  <input
                    type="text"
                    placeholder="KG-01, LAB-3"
                    value={formData.roomNo}
                    onChange={e => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class Mentor / Coordinator</label>
                  <input
                    type="text"
                    placeholder="e.g. Ms. Rohini Deshmukh, Prof. Marcus"
                    value={formData.mentorTeacherName}
                    onChange={e => setFormData({ ...formData, mentorTeacherName: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingClass(null);
                  }}
                  className="h-9 px-3.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAddingNew ? 'Save Class' : 'Update Class'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Classes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredClasses.map(cls => {
              const isSelected = selectedClass === cls.name;
              return (
                <div
                  key={cls.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'border-[#004ac6] bg-[#004ac6]/5 ring-2 ring-[#004ac6]/20'
                      : 'border-[#eaedff] bg-white hover:border-[#dae2fd]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{cls.name}</h4>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 bg-[#bdffdb] text-[#002113] text-[9px] font-bold rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#007d55]" />
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#004ac6] font-semibold block mt-0.5">
                        {cls.category}
                      </span>
                      <span className="text-[10px] text-[#737686] block truncate">
                        {cls.department || 'Academic Wing'} • Room: {cls.roomNo || 'TBA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cls)}
                        className="w-7 h-7 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] flex items-center justify-center transition-colors active:scale-95"
                        title="Edit Class Details"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls.id, cls.name)}
                        className="w-7 h-7 rounded-lg bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] flex items-center justify-center transition-colors active:scale-95"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#f2f3ff] text-[10px]">
                    <span className="text-[#737686] truncate">Mentor: <strong className="text-[#131b2e]">{cls.mentorTeacherName || 'Faculty'}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls.name);
                        showToast(`Switched active workspace to ${cls.name}`);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] active:scale-95 transition-all ${
                        isSelected
                          ? 'bg-[#004ac6] text-white'
                          : 'bg-[#eaedff] text-[#004ac6] hover:bg-[#dbe1ff]'
                      }`}
                    >
                      {isSelected ? 'Active Filter' : 'Select Class'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 bg-[#f2f3ff] border-t border-[#dae2fd] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#737686]">
            Classes configured: <strong>{classes.length}</strong> (Kindergarten to Ph.D)
          </span>
          <button
            type="button"
            onClick={() => setIsClassModalOpen(false)}
            className="px-4 py-1.5 bg-white hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold border border-[#dae2fd] active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
