import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SyllabusUpdateModal } from '../components/SyllabusUpdateModal';
import { CurriculumChapter } from '../types';
import {
  ChevronRight,
  Send,
  BookOpen,
  User,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Check,
  Clock,
  Hourglass,
  ChevronUp,
  ChevronDown,
  FileText,
  ClipboardList,
  Trash2,
  Edit3,
  Plus,
  BookmarkCheck,
  GraduationCap,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const SyllabusView: React.FC = () => {
  const {
    classes,
    selectedClass,
    setSelectedClass,
    subjects,
    getSubjectsForClass,
    selectedSubject,
    setSelectedSubject,
    setIsSubjectModalOpen,
    setIsClassModalOpen,
    syllabus: globalSyllabus,
    teachers,
    setEditingChapterModalData,
    showToast,
    institution,
    openDispatchModal,
  } = useApp();

  const [viewMode, setViewMode] = useState<'tracker' | 'mapping'>('tracker');

  // Active Class State
  const activeClass = selectedClass !== 'ALL' ? selectedClass : (classes[0]?.name || 'Class 10-A');

  // Subjects for the currently selected class
  const classSubjects = useMemo(() => {
    const list = getSubjectsForClass(activeClass);
    if (list.length > 0) return list;
    // Fallback: match by class category or return top subjects
    const matchingClassObj = classes.find(c => c.name === activeClass);
    if (matchingClassObj) {
      const byCat = subjects.filter(s => s.classCategory === matchingClassObj.category);
      if (byCat.length > 0) return byCat;
    }
    return subjects.slice(0, 5);
  }, [activeClass, classes, subjects, getSubjectsForClass]);

  const [activeSubjectName, setActiveSubjectName] = useState<string>(() => {
    return classSubjects[0]?.name || 'Mathematics';
  });

  // Whenever class changes, default to its first subject
  useEffect(() => {
    if (classSubjects.length > 0 && !classSubjects.some(s => s.name === activeSubjectName)) {
      setActiveSubjectName(classSubjects[0].name);
    }
  }, [activeClass, classSubjects, activeSubjectName]);

  // Sync when selectedSubject updates globally from SubjectManageModal
  useEffect(() => {
    if (selectedSubject) {
      if (classSubjects.some(s => s.name === selectedSubject)) {
        setActiveSubjectName(selectedSubject);
      }
    }
  }, [selectedSubject, classSubjects]);

  const activeSubjectObj = classSubjects.find(s => s.name === activeSubjectName) || classSubjects[0];

  // Keyed chapter storage in localStorage per subject & class
  const storageKey = `edutrack_curriculum_${activeClass.replace(/[^a-zA-Z0-9]/g, '_')}_${(activeSubjectName || 'General').replace(/[^a-zA-Z0-9]/g, '_')}`;

  const [subjectChapters, setSubjectChapters] = useState<CurriculumChapter[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // If it's Class 10-A Math, use the initial chapters
    if (activeClass.includes('10') && activeSubjectName === 'Mathematics') {
      return globalSyllabus.chapters;
    }
    // Default starter units for any subject
    return [
      {
        id: `chap-${Date.now()}-1`,
        unitNumber: 1,
        name: `${activeSubjectName} Foundations & Fundamentals`,
        allottedPeriods: 6,
        completedPeriods: 6,
        status: 'Completed',
        completionDate: '2024-09-10',
        lessonNotes: 'Basic theoretical principles, definitions & foundational exercises completed.',
        assignedHomework: 'Workbook Chapter 1 Problem Sets.',
      },
      {
        id: `chap-${Date.now()}-2`,
        unitNumber: 2,
        name: 'Core Concepts, Methodology & Analysis',
        allottedPeriods: 8,
        completedPeriods: 5,
        status: 'In Progress',
        lessonNotes: 'Practical applications and interactive problem solving underway.',
        assignedHomework: 'Assignment 2.1 & Seminar Presentation prep.',
      },
      {
        id: `chap-${Date.now()}-3`,
        unitNumber: 3,
        name: 'Applied Case Studies & Laboratory Work',
        allottedPeriods: 8,
        completedPeriods: 0,
        status: 'Not Started',
        scheduledDate: '2024-11-15',
        lessonNotes: 'Hands-on project work and empirical experiments.',
        assignedHomework: 'Project draft outline.',
      },
      {
        id: `chap-${Date.now()}-4`,
        unitNumber: 4,
        name: 'Revision, Terminal Review & Assessment',
        allottedPeriods: 6,
        completedPeriods: 0,
        status: 'Not Started',
        scheduledDate: '2024-12-05',
        lessonNotes: 'Mock examination and doubt-clearing sessions.',
        assignedHomework: 'Past papers & comprehensive test drills.',
      },
    ];
  });

  // Re-load when class or subject changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSubjectChapters(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    if (activeClass.includes('10') && activeSubjectName === 'Mathematics') {
      setSubjectChapters(globalSyllabus.chapters);
    } else {
      setSubjectChapters([
        {
          id: `chap-${Date.now()}-1`,
          unitNumber: 1,
          name: `${activeSubjectName} Foundations & Principles`,
          allottedPeriods: 6,
          completedPeriods: 6,
          status: 'Completed',
          completionDate: '2024-09-10',
          lessonNotes: 'Fundamental modules and core syllabus initiated.',
          assignedHomework: 'Practice set 1 & Concept map.',
        },
        {
          id: `chap-${Date.now()}-2`,
          unitNumber: 2,
          name: 'Core Concepts & Advanced Methodologies',
          allottedPeriods: 8,
          completedPeriods: 4,
          status: 'In Progress',
          lessonNotes: 'In-depth lectures and analytical discussions.',
          assignedHomework: 'Chapter Exercise 2 Q1-Q10.',
        },
        {
          id: `chap-${Date.now()}-3`,
          unitNumber: 3,
          name: 'Practical Application & Empirical Projects',
          allottedPeriods: 8,
          completedPeriods: 0,
          status: 'Not Started',
          scheduledDate: '2024-11-15',
          lessonNotes: 'Case studies and lab practice.',
          assignedHomework: 'Lab manual submission.',
        },
      ]);
    }
  }, [storageKey, activeClass, activeSubjectName, globalSyllabus.chapters]);

  // Persist chapters
  const saveChapters = (newChapters: CurriculumChapter[]) => {
    setSubjectChapters(newChapters);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newChapters));
    } catch {
      // storage error
    }
  };

  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);

  const toggleAccordion = (id: string) => {
    setExpandedChapterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Pacing calculations
  const totalChapters = subjectChapters.length;
  const completedChapters = subjectChapters.filter(c => c.status === 'Completed').length;
  const inProgressChapters = subjectChapters.filter(c => c.status === 'In Progress').length;
  const overallCompletion = totalChapters > 0 ? parseFloat(((completedChapters / totalChapters) * 100).toFixed(1)) : 0;
  const totalPeriods = subjectChapters.reduce((acc, c) => acc + (c.allottedPeriods || 6), 0);
  const periodsHeld = subjectChapters.reduce((acc, c) => acc + (c.completedPeriods || 0), 0);
  const targetMidTerm = 60.0;
  const statusText = overallCompletion >= targetMidTerm ? 'On Track' : overallCompletion >= 40 ? 'Behind Schedule' : 'Critical Lag';

  const teacherName = activeSubjectObj?.teacherName || teachers[0]?.name || 'Senior Academic Faculty';

  const handleUpdateChapter = (chapterId: string, updates: Partial<CurriculumChapter>) => {
    const updated = subjectChapters.map(c => (c.id === chapterId ? { ...c, ...updates } : c));
    saveChapters(updated);
    showToast('Curriculum chapter progress saved');
  };

  const handleDeleteChapter = (chapterId: string) => {
    const remaining = subjectChapters.filter(c => c.id !== chapterId);
    saveChapters(remaining);
    showToast('Chapter removed from syllabus');
  };

  const handleAddNewChapter = () => {
    const nextUnit = subjectChapters.length + 1;
    const newChap: CurriculumChapter = {
      id: `chap-${Date.now()}`,
      unitNumber: nextUnit,
      name: `Unit ${nextUnit}: Advanced Topics in ${activeSubjectName}`,
      allottedPeriods: 8,
      completedPeriods: 0,
      status: 'Not Started',
      scheduledDate: new Date().toISOString().split('T')[0],
      lessonNotes: 'Curriculum delivery module scheduled.',
      assignedHomework: 'Read introductory chapter section.',
    };
    saveChapters([...subjectChapters, newChap]);
    setExpandedChapterIds(prev => [...prev, newChap.id]);
    showToast(`New unit added to ${activeSubjectName} syllabus!`);
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Breadcrumb & Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[#737686] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span>{institution.shortName} Academic</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#004ac6]">Syllabus Delivery</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Curriculum & Syllabus Delivery Tracker</h1>
        </div>

        {/* Action Buttons: Push Report */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: `Curriculum Audit: ${activeSubjectName} (${activeClass})`,
                reportCategory: 'syllabus-audit',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
              })
            }
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-9 sm:h-10 px-4 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Push Audit to Principal</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Curriculum Tracker vs Class-Wise Subject Mapping */}
      <div className="p-1 bg-[#eaedff] rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setViewMode('tracker')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            viewMode === 'tracker' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus Pacing Tracker</span>
        </button>
        <button
          onClick={() => setViewMode('mapping')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            viewMode === 'mapping' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#434655] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <Layers className="w-4 h-4" />
          <span>Class-Wise Subject Mapping (KG to PhD)</span>
        </button>
      </div>

      {viewMode === 'tracker' ? (
        <>
          {/* Class Selector Dropdown & Manage Classes Ribbon */}
          <div className="bg-white p-3 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <GraduationCap className="w-5 h-5 text-[#004ac6] shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#737686]">Select Academic Class (KG to PhD)</span>
                <select
                  value={activeClass}
                  onChange={e => {
                    setSelectedClass(e.target.value);
                    showToast(`Loaded curriculum for ${e.target.value}`);
                  }}
                  className="bg-[#f2f3ff] text-xs sm:text-sm font-bold text-[#131b2e] px-2.5 py-1.5 rounded-xl border border-[#dae2fd] outline-none cursor-pointer w-full mt-0.5"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} ({cls.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsClassModalOpen(true)}
              className="h-9 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
              type="button"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Classes</span>
            </button>
          </div>

          {/* Subject Horizontal Scroll Chips + "+ Add Subject" Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {classSubjects.map(subj => {
              const isSelected = activeSubjectName === subj.name;
              return (
                <button
                  key={subj.id || subj.name}
                  onClick={() => {
                    setActiveSubjectName(subj.name);
                    showToast(`Viewing ${subj.name} curriculum`);
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#004ac6] text-white shadow-xs'
                      : 'bg-white text-[#131b2e] border border-[#dae2fd] hover:bg-[#eaedff]'
                  }`}
                  type="button"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>{subj.name}</span>
                  {subj.code && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#f2f3ff] text-[#737686]'
                      }`}
                    >
                      {subj.code}
                    </span>
                  )}
                </button>
              );
            })}

            {/* PROMINENT "+ Add Subject" BUTTON */}
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="h-9 px-3.5 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
              type="button"
              title={`Add New Subject for ${activeClass}`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Subject</span>
            </button>
          </div>

      {/* Overall Subject Progress Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs border border-[#eaedff] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#dbe1ff] flex items-center justify-center text-[#00174b] shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#004ac6]" />
            </div>
            <div className="min-w-0 flex flex-col">
              <h2 className="text-xs sm:text-base font-bold text-[#131b2e] truncate">
                {activeSubjectName} — {activeClass}
              </h2>
              <div className="flex items-center gap-1 text-[#737686] text-[11px] sm:text-xs truncate">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Mentor: {teacherName}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-bold text-[10px] sm:text-xs shrink-0 ${
              overallCompletion >= targetMidTerm
                ? 'bg-[#bdffdb] text-[#002113]'
                : overallCompletion >= 40
                ? 'bg-amber-500/10 text-amber-700'
                : 'bg-[#ffdad6] text-[#93000a]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {statusText}
          </span>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-1.5 bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#dae2fd]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737686]">Syllabus Delivery Completion</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-base font-bold text-[#004ac6]">{overallCompletion}%</span>
              <span className="text-[10px] sm:text-[11px] text-[#737686]">
                ({completedChapters} / {totalChapters} Units Completed)
              </span>
            </div>
          </div>

          <div className="w-full bg-[#eaedff] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallCompletion >= targetMidTerm ? 'bg-[#007d55]' : 'bg-[#004ac6]'
              }`}
              style={{ width: `${Math.min(100, overallCompletion)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#737686] pt-0.5">
            <span>Target Pacing: {targetMidTerm}%</span>
            <span className={overallCompletion >= targetMidTerm ? 'text-[#007d55] font-bold' : 'text-[#ba1a1a] font-bold'}>
              {overallCompletion >= targetMidTerm ? '+ On Schedule' : `${(targetMidTerm - overallCompletion).toFixed(1)}% behind target`}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
          <div className="bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 border border-[#dae2fd]/50">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center text-[#004ac6] shrink-0 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-[11px] text-[#737686]">Periods Held</span>
              <span className="text-xs sm:text-sm font-bold text-[#131b2e] font-mono">
                {periodsHeld} <span className="text-[10px] text-[#737686] font-normal">/ {totalPeriods}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 border border-[#dae2fd]/50">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center text-[#007d55] shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-[11px] text-[#737686]">Pending Units</span>
              <span className="text-xs sm:text-sm font-bold text-[#131b2e] font-mono">
                {totalChapters - completedChapters}{' '}
                <span className="text-[10px] text-[#737686] font-normal">Units</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Breakdown Interactive Accordion List */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Curriculum Units & Chapters</h3>
            <span className="bg-[#eaedff] text-[#434655] px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              {totalChapters} Units
            </span>
          </div>
          <button
            onClick={handleAddNewChapter}
            className="text-[#004ac6] text-xs font-bold flex items-center gap-1 hover:underline active:scale-95"
            type="button"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Unit</span>
          </button>
        </div>

        {/* Units Accordion List */}
        <div className="space-y-2">
          {subjectChapters.map((chapter, idx) => {
            const isExpanded = expandedChapterIds.includes(chapter.id);
            const isCurrentProgress = chapter.status === 'In Progress';

            return (
              <div
                key={chapter.id || idx}
                className={`bg-white rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden border transition-all ${
                  isCurrentProgress
                    ? 'border-[#2563eb] shadow-[0_0_0_2px_rgba(37,99,235,0.2)]'
                    : 'border-[#eaedff]'
                }`}
              >
                {/* Header button */}
                <button
                  onClick={() => toggleAccordion(chapter.id)}
                  className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left gap-2.5"
                  type="button"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrentProgress
                          ? 'bg-[#dbe1ff] text-[#00174b]'
                          : chapter.status === 'Completed'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : 'bg-[#f2f3ff] text-[#737686]'
                      }`}
                    >
                      {chapter.unitNumber || idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{chapter.name}</h4>
                        {isCurrentProgress && <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping shrink-0"></span>}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-[#737686] truncate block">
                        {chapter.allottedPeriods} Periods •{' '}
                        {chapter.status === 'Completed'
                          ? `Done ${chapter.completionDate || 'Recently'}`
                          : chapter.status === 'In Progress'
                          ? `${chapter.completedPeriods}/${chapter.allottedPeriods} (${Math.round((chapter.completedPeriods / (chapter.allottedPeriods || 1)) * 100)}%)`
                          : `Scheduled ${chapter.scheduledDate || 'Upcoming'}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${
                        chapter.status === 'Completed'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : chapter.status === 'In Progress'
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-[#eaedff] text-[#434655]'
                      }`}
                    >
                      {chapter.status === 'Completed' && <Check className="w-3 h-3" />}
                      {chapter.status === 'In Progress' && <Clock className="w-3 h-3" />}
                      {chapter.status === 'Not Started' && <Hourglass className="w-3 h-3" />}
                      <span className="hidden xs:inline">{chapter.status}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#737686]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#737686]" />
                    )}
                  </div>
                </button>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2.5 bg-[#faf8ff] pt-2 border-t border-[#eaedff]">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-[#eaedff] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#737686]">Unit Delivery Status</span>
                        <select
                          value={chapter.status}
                          onChange={e =>
                            handleUpdateChapter(chapter.id, {
                              status: e.target.value as any,
                              completedPeriods:
                                e.target.value === 'Completed'
                                  ? chapter.allottedPeriods
                                  : e.target.value === 'In Progress'
                                  ? Math.max(1, Math.floor(chapter.allottedPeriods / 2))
                                  : 0,
                            })
                          }
                          className="h-8 px-2 rounded-xl bg-[#f2f3ff] text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#737686]">
                          <span>Periods Taught</span>
                          <span className="font-mono font-semibold">
                            {chapter.completedPeriods} of {chapter.allottedPeriods} held
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#eaedff] rounded-full overflow-hidden">
                          <div
                            className="bg-[#004ac6] h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(chapter.completedPeriods / (chapter.allottedPeriods || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-[#eaedff] space-y-2 text-xs">
                      {chapter.lessonNotes && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-[#007d55] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#737686] block text-[10px] uppercase">Lesson Notes</span>
                            <p className="text-[#131b2e] mt-0.5">{chapter.lessonNotes}</p>
                          </div>
                        </div>
                      )}

                      {chapter.assignedHomework && (
                        <div className="flex items-start gap-2 pt-1 border-t border-[#f2f3ff]">
                          <ClipboardList className="w-4 h-4 text-[#004ac6] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#737686] block text-[10px] uppercase">
                              Assigned Homework
                            </span>
                            <p className="text-[#131b2e] mt-0.5">{chapter.assignedHomework}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`Delete unit "${chapter.name}" from curriculum?`)) {
                            handleDeleteChapter(chapter.id);
                          }
                        }}
                        className="h-8 px-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold flex items-center gap-1 hover:bg-[#ffb4ab] active:scale-95"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Unit</span>
                      </button>

                      <button
                        onClick={() => setEditingChapterModalData(chapter)}
                        className="h-8 px-3 rounded-xl bg-[#eaedff] text-[#004ac6] text-xs font-bold flex items-center gap-1 hover:bg-[#dbe1ff] active:scale-95"
                        type="button"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Record</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        </>
      ) : (
        /* CLASS-WISE SUBJECT MAPPING MATRIX (KG to PhD) */
        <div className="space-y-4 animate-in fade-in">
          {/* Header Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#131b2e] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#004ac6]" />
                <span>Class-Wise Curriculum & Subject Mapping</span>
              </h2>
              <p className="text-xs text-[#737686]">
                Comprehensive institutional syllabus hierarchy from Kindergarten (Pre-Primary) to Doctorate (Ph.D).
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  openDispatchModal({
                    title: 'Institutional Class & Subject Mapping Hierarchy',
                    reportCategory: 'syllabus-audit',
                    defaultFormat: 'excel',
                    defaultRecipientType: 'principal',
                  })
                }
                className="flex-1 sm:flex-initial h-9 px-3 bg-white border border-[#dae2fd] text-[#131b2e] hover:bg-[#f2f3ff] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#007d55]" />
                <span>Export Matrix</span>
              </button>

              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="flex-1 sm:flex-initial h-9 px-3.5 bg-[#007d55] hover:bg-[#006644] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Subject</span>
              </button>
            </div>
          </div>

          {/* Educational Tiers Grid (KG to PhD) */}
          {[
            {
              category: 'Pre-Primary / Kindergarten',
              description: 'Nursery, Junior KG & Senior KG foundational sensory, phonics & numeracy tracks',
              badge: 'Pre-Primary',
            },
            {
              category: 'Primary (1-5)',
              description: 'Classes 1 through 5 foundational languages, mathematics, environmental science',
              badge: 'Primary',
            },
            {
              category: 'Middle School (6-8)',
              description: 'Classes 6 through 8 integrated science, social studies, mathematics & ICT',
              badge: 'Middle',
            },
            {
              category: 'Secondary (9-10)',
              description: 'Classes 9 & 10 CBSE/Board syllabus, core laboratory sciences & mathematics',
              badge: 'Secondary',
            },
            {
              category: 'Higher Secondary (11-12)',
              description: 'Classes 11 & 12 Science, Commerce & Humanities streams',
              badge: 'Higher Sec',
            },
            {
              category: 'Undergraduate (UG)',
              description: 'Bachelor degrees: B.Tech (CSE, AI), B.Sc, BCA, B.Com, B.A semester modules',
              badge: 'UG Degree',
            },
            {
              category: 'Postgraduate (PG)',
              description: 'Masters programs: M.Tech (AI & Robotics), M.Sc, MBA, MCA advanced modules',
              badge: 'PG Masters',
            },
            {
              category: 'Doctorate (Ph.D)',
              description: 'Doctoral research methodology, literature review, publication ethics & thesis defense',
              badge: 'Doctorate',
            },
          ].map(tier => {
            const tierClasses = classes.filter(c => c.category === tier.category);
            const tierSubjects = subjects.filter(s => s.classCategory === tier.category);

            return (
              <div
                key={tier.category}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs overflow-hidden"
              >
                {/* Tier Header */}
                <div className="p-3.5 sm:p-4 bg-[#f8f9ff] border-b border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dbe1ff] text-[#004ac6]">
                        {tier.badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#131b2e] truncate">{tier.category}</h3>
                    </div>
                    <p className="text-[11px] text-[#737686] mt-0.5">{tier.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-[#004ac6] bg-white px-2.5 py-1 rounded-xl border border-[#dae2fd]">
                      {tierClasses.length} Classes • {tierSubjects.length} Subjects
                    </span>
                    <button
                      onClick={() => {
                        const firstClass = tierClasses[0]?.name || tier.category;
                        setSelectedClass(firstClass);
                        setIsSubjectModalOpen(true);
                      }}
                      className="h-8 px-2.5 bg-[#007d55] hover:bg-[#006644] text-white text-[11px] font-bold rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                      type="button"
                      title={`Add Subject to ${tier.category}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subject</span>
                    </button>
                  </div>
                </div>

                {/* Registered Classes in this Tier */}
                {tierClasses.length > 0 && (
                  <div className="px-3.5 sm:px-4 py-2 bg-white border-b border-[#eaedff]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold uppercase text-[#737686] shrink-0">Classes:</span>
                    {tierClasses.map(cls => (
                      <span
                        key={cls.id}
                        className="px-2 py-0.5 bg-[#f2f3ff] text-[#131b2e] border border-[#dae2fd] rounded-lg text-[10px] sm:text-[11px] font-semibold shrink-0"
                      >
                        {cls.name} {cls.section ? `(${cls.section})` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mapped Subjects List */}
                <div className="p-3.5 sm:p-4">
                  {tierSubjects.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#737686] italic bg-[#faf8ff] rounded-xl border border-dashed border-[#dae2fd]">
                      No subjects configured for {tier.category} yet. Click "+ Add Subject" above to register.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                      {tierSubjects.map(sub => (
                        <div
                          key={sub.id}
                          className="p-3 bg-[#faf8ff] hover:bg-white rounded-2xl border border-[#dae2fd] hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#131b2e] leading-snug">
                                {sub.name}
                              </span>
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e1e0ff] text-[#4648d4] shrink-0">
                                {sub.code}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-[#737686]">
                              <span className="font-medium truncate">
                                Target: {sub.specificClassName || 'All Sections in Level'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-[#737686]">
                              <span>Faculty: <strong className="text-[#131b2e]">{sub.teacherName || 'Subject Faculty'}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#dae2fd]/50 text-[10px]">
                            <span className="font-semibold text-[#737686]">
                              Max: {sub.maxMarks} • Pass: {sub.passMarks}
                            </span>
                            <button
                              onClick={() => {
                                const targetClass =
                                  sub.specificClassName && sub.specificClassName !== 'All Sections'
                                    ? sub.specificClassName
                                    : (tierClasses[0]?.name || activeClass);
                                setSelectedClass(targetClass);
                                setActiveSubjectName(sub.name);
                                setViewMode('tracker');
                                showToast(`Switched to ${sub.name} curriculum tracker`);
                              }}
                              className="px-2.5 py-1 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                              type="button"
                            >
                              <span>View Tracker</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Chapter Modal */}
      <SyllabusUpdateModal />
    </div>
  );
};
