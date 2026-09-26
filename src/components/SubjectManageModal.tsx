import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectItem, ClassLevelCategory } from '../types';
import {
  BookOpen,
  X,
  Plus,
  Edit2,
  Trash2,
  BookmarkCheck,
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

export const SubjectManageModal: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    classes,
    selectedClass,
    selectedSubject,
    setSelectedSubject,
    isSubjectModalOpen,
    setIsSubjectModalOpen,
    teachers,
    showToast,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState<Partial<SubjectItem>>({
    name: '',
    code: '',
    classCategory: 'Secondary (9-10)',
    specificClassName: 'Class 10-A',
    creditHours: 4,
    maxMarks: 50,
    passMarks: 18,
    teacherName: '',
  });

  // Sync default target class when modal opens
  React.useEffect(() => {
    if (isSubjectModalOpen && !editingSubject) {
      const activeClassObj = classes.find(c => c.name === selectedClass);
      setFormData(prev => ({
        ...prev,
        classCategory: activeClassObj?.category || prev.classCategory || 'Secondary (9-10)',
        specificClassName: selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'All Sections'),
        teacherName: prev.teacherName || teachers[0]?.name || 'Subject Faculty',
      }));
    }
  }, [isSubjectModalOpen, editingSubject, selectedClass, classes, teachers]);

  if (!isSubjectModalOpen) return null;

  const handleStartAdd = () => {
    setEditingSubject(null);
    setIsAddingNew(true);
    const activeClassObj = classes.find(c => c.name === selectedClass);
    setFormData({
      name: '',
      code: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      classCategory: activeClassObj?.category || 'Pre-Primary / Kindergarten',
      specificClassName: selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Senior KG'),
      creditHours: 4,
      maxMarks: 50,
      passMarks: 18,
      teacherName: teachers[0]?.name || 'Senior Faculty',
    });
  };

  const handleStartEdit = (subj: SubjectItem) => {
    setIsAddingNew(false);
    setEditingSubject(subj);
    setFormData(subj);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Please specify subject title (e.g. Phonics, Quantum Mechanics, Machine Learning)', 'warning');
      return;
    }

    if (isAddingNew) {
      const newSubj: SubjectItem = {
        id: `sub-${Date.now()}`,
        name: formData.name,
        code: formData.code || `SUB-${Date.now().toString().slice(-4)}`,
        classCategory: (formData.classCategory as ClassLevelCategory) || 'Secondary (9-10)',
        specificClassName: formData.specificClassName || (selectedClass !== 'ALL' ? selectedClass : 'All Sections'),
        creditHours: formData.creditHours || 4,
        maxMarks: formData.maxMarks || 50,
        passMarks: formData.passMarks || 18,
        teacherName: formData.teacherName || 'Subject Coordinator',
      };
      addSubject(newSubj);
      setSelectedSubject(newSubj.name);
      showToast(`Subject "${newSubj.name}" mapped to ${newSubj.specificClassName}!`);
    } else if (editingSubject) {
      updateSubject(editingSubject.id, formData);
      if (formData.name) setSelectedSubject(formData.name);
      showToast(`Subject "${formData.name || editingSubject.name}" updated successfully`);
    }

    setIsAddingNew(false);
    setEditingSubject(null);
    setIsSubjectModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove subject "${name}" from the curriculum ledger?`)) {
      deleteSubject(id);
    }
  };

  const filteredSubjects = filterCategory === 'ALL'
    ? subjects
    : subjects.filter(s => s.classCategory === filterCategory);

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
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">
                Curriculum Subjects Management
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                Mapped dynamically from Senior KG to Ph.D doctoral specializations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubjectModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 ml-2 active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Control Bar */}
        <div className="p-3 sm:p-4 bg-[#f2f3ff] border-b border-[#dae2fd] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-[#007d55]" />
              <span>Registered Curriculum Disciplines</span>
              <span className="bg-[#bdffdb] text-[#002113] text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {subjects.length} Subjects
              </span>
            </span>

            <button
              onClick={handleStartAdd}
              className="h-8 sm:h-9 px-3 bg-[#007d55] hover:bg-[#006644] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Subject</span>
            </button>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
            {['ALL', ...CATEGORIES].map(cat => {
              const isSel = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                    isSel
                      ? 'bg-[#007d55] text-white shadow-xs'
                      : 'bg-white text-[#434655] border border-[#dae2fd] hover:bg-[#eaedff]'
                  }`}
                  type="button"
                >
                  {cat === 'ALL' ? 'All Disciplines' : cat.split('/')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Add / Edit Form */}
          {(isAddingNew || editingSubject) && (
            <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 bg-[#faf8ff] rounded-2xl border-2 border-[#007d55]/30 space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#dae2fd]">
                <span className="font-bold text-xs sm:text-sm text-[#007d55] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{isAddingNew ? 'Create New Subject' : `Edit Subject: ${editingSubject?.name}`}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingSubject(null);
                  }}
                  className="text-xs font-bold text-[#737686] hover:text-[#131b2e]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phonics & Numeracy, Quantum Physics, Machine Learning, Thesis"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd] focus:outline-none focus:ring-2 focus:ring-[#007d55]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Subject Code</label>
                  <input
                    type="text"
                    placeholder="MATH-10, CSE-301"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs font-mono font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Class Level Category</label>
                  <select
                    value={formData.classCategory}
                    onChange={e => setFormData({ ...formData, classCategory: e.target.value as ClassLevelCategory })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Specific Class / Batch (Optional)</label>
                  <select
                    value={formData.specificClassName}
                    onChange={e => setFormData({ ...formData, specificClassName: e.target.value })}
                    className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  >
                    <option value="All Sections">All Sections in this Level</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Periods / Credits</label>
                  <input
                    type="number"
                    value={formData.creditHours}
                    onChange={e => setFormData({ ...formData, creditHours: parseInt(e.target.value) || 4 })}
                    className="w-full h-10 px-2.5 bg-white rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Max Marks</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={e => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 50 })}
                    className="w-full h-10 px-2.5 bg-white rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Pass Marks</label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={e => setFormData({ ...formData, passMarks: parseInt(e.target.value) || 18 })}
                    className="w-full h-10 px-2.5 bg-white rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-[#737686]">Assigned Faculty Mentor</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Rajesh Kumar, Dr. Anita Roy"
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full h-10 px-3 bg-white rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingSubject(null);
                  }}
                  className="h-9 px-3.5 bg-white border border-[#dae2fd] text-[#434655] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAddingNew ? 'Save Subject' : 'Update Subject'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredSubjects.map(subj => {
              const isSelected = selectedSubject === subj.name;
              return (
                <div
                  key={subj.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'border-[#007d55] bg-[#007d55]/5 ring-2 ring-[#007d55]/20'
                      : 'border-[#eaedff] bg-white hover:border-[#dae2fd]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{subj.name}</h4>
                        <span className="px-1.5 py-0.2 bg-[#dbe1ff] text-[#004ac6] text-[9px] font-mono font-bold rounded">
                          {subj.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#007d55] font-semibold block mt-0.5">
                        {subj.classCategory}
                      </span>
                      <span className="text-[10px] text-[#737686] block truncate">
                        Assigned: {subj.specificClassName || 'All Levels'} • Max: {subj.maxMarks}m (Pass: {subj.passMarks}m)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(subj)}
                        className="w-7 h-7 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] flex items-center justify-center transition-colors active:scale-95"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(subj.id, subj.name)}
                        className="w-7 h-7 rounded-lg bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] flex items-center justify-center transition-colors active:scale-95"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#f2f3ff] text-[10px]">
                    <span className="text-[#737686] truncate">Faculty: <strong className="text-[#131b2e]">{subj.teacherName || 'Faculty'}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject(subj.name);
                        showToast(`Switched active subject to ${subj.name}`);
                      }}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] active:scale-95 transition-all ${
                        isSelected
                          ? 'bg-[#007d55] text-white'
                          : 'bg-[#eaedff] text-[#004ac6] hover:bg-[#dbe1ff]'
                      }`}
                    >
                      {isSelected ? 'Active Subject' : 'Select'}
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
            Total Subjects: <strong>{subjects.length}</strong> (Senior KG to Ph.D)
          </span>
          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(false)}
            className="px-4 py-1.5 bg-white hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold border border-[#dae2fd] active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
