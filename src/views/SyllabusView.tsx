import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SyllabusUpdateModal } from '../components/SyllabusUpdateModal';
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
} from 'lucide-react';

export const SyllabusView: React.FC = () => {
  const {
    syllabus,
    updateChapter,
    deleteChapter,
    setEditingChapterModalData,
    showToast,
    institution,
    openDispatchModal,
  } = useApp();

  const [selectedClassTab, setSelectedClassTab] = useState<'10-A' | '10-B' | '9-A' | '11-Sci' | '12-Sci'>('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>(['chap-5']);

  const toggleAccordion = (id: string) => {
    setExpandedChapterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const subjects = ['Mathematics', 'Science', 'English', 'Social Science', 'Computer Science', 'Hindi'];

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Breadcrumb & Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[#737686] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span>{institution.shortName} Academic</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#004ac6]">Syllabus Tracker</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Curriculum & Syllabus Delivery</h1>
        </div>

        {/* Action Buttons: Push Report */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              openDispatchModal({
                title: `Curriculum Audit: ${selectedSubject} (${selectedClassTab})`,
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

      {/* Class Selector Tabs */}
      <div className="flex p-1 bg-[#eaedff] rounded-xl sm:rounded-2xl gap-1 overflow-x-auto no-scrollbar shadow-inner">
        {(['10-A', '10-B', '9-A', '11-Sci', '12-Sci'] as const).map(cls => (
          <button
            key={cls}
            onClick={() => {
              setSelectedClassTab(cls);
              showToast(`Loaded curriculum for Class ${cls}`);
            }}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 text-center rounded-lg sm:rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              selectedClassTab === cls
                ? 'bg-white text-[#004ac6] shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Subject Horizontal Scroll Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {subjects.map(subj => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                showToast(`Viewing ${subj} curriculum`);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-white text-[#131b2e] border border-[#dae2fd] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {subj}
            </button>
          );
        })}
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
                {selectedSubject} — Class {selectedClassTab}
              </h2>
              <div className="flex items-center gap-1 text-[#737686] text-[11px] sm:text-xs truncate">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{syllabus.teacherName} ({syllabus.teacherQualification})</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-bold text-[10px] sm:text-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {syllabus.statusText}
          </span>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-1.5 bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#dae2fd]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737686]">Syllabus Completion</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-base font-bold text-[#004ac6]">{syllabus.overallCompletion}%</span>
              <span className="text-[10px] sm:text-[11px] text-[#737686]">
                ({syllabus.completedChapters} / {syllabus.chapters.length} Units)
              </span>
            </div>
          </div>

          {/* Dual Tier Progress Bar */}
          <div className="relative w-full h-2.5 sm:h-3 bg-[#eaedff] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004ac6] rounded-full transition-all duration-500"
              style={{ width: `${syllabus.overallCompletion}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#131b2e]/60"
              style={{ left: `${syllabus.targetMidTerm}%` }}
              title={`Target: ${syllabus.targetMidTerm}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#737686] pt-0.5">
            <span>Target for mid-term: {syllabus.targetMidTerm}%</span>
            <span className="text-[#ba1a1a] font-bold">
              -{(syllabus.targetMidTerm - syllabus.overallCompletion).toFixed(1)}% delta
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
                {syllabus.periodsHeld} <span className="text-[10px] text-[#737686] font-normal">/ {syllabus.totalPeriods}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 border border-[#dae2fd]/50">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center text-[#007d55] shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-[11px] text-[#737686]">Remaining</span>
              <span className="text-xs sm:text-sm font-bold text-[#131b2e] font-mono">
                {syllabus.chapters.length - syllabus.completedChapters}{' '}
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
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Curriculum Units</h3>
            <span className="bg-[#eaedff] text-[#434655] px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
              {syllabus.chapters.length} Units
            </span>
          </div>
          <button
            onClick={() =>
              setEditingChapterModalData({
                id: 'new',
                unitNumber: syllabus.chapters.length + 1,
                name: '',
                allottedPeriods: 8,
                completedPeriods: 0,
                status: 'Not Started',
                lessonNotes: '',
                assignedHomework: '',
              })
            }
            className="text-[#004ac6] text-xs font-bold flex items-center gap-1 hover:underline active:scale-95"
            type="button"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Unit</span>
          </button>
        </div>

        {/* Chapters Accordion */}
        <div className="space-y-2">
          {syllabus.chapters.map(chapter => {
            const isExpanded = expandedChapterIds.includes(chapter.id);
            const isCurrentProgress = chapter.status === 'In Progress';

            return (
              <div
                key={chapter.id}
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
                      {chapter.unitNumber}
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
                    {isCurrentProgress && (
                      <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-[#eaedff] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#737686]">Quick Status Change</span>
                          <select
                            value={chapter.status}
                            onChange={e =>
                              updateChapter(chapter.id, {
                                status: e.target.value as any,
                                completedPeriods: e.target.value === 'Completed' ? chapter.allottedPeriods : chapter.completedPeriods,
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
                            <span>Class Periods Pacing</span>
                            <span className="font-mono font-semibold">
                              {chapter.completedPeriods} of {chapter.allottedPeriods} held
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#eaedff] rounded-full overflow-hidden">
                            <div
                              className="bg-[#004ac6] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(chapter.completedPeriods / (chapter.allottedPeriods || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                            deleteChapter(chapter.id);
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

      {/* Update Chapter Modal */}
      <SyllabusUpdateModal />
    </div>
  );
};
