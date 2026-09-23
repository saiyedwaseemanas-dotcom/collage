import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SyllabusUpdateModal } from '../components/SyllabusUpdateModal';

export const SyllabusView: React.FC = () => {
  const {
    syllabus,
    updateChapter,
    sendTeacherReminder,
    setEditingChapterModalData,
    showToast,
  } = useApp();

  const [selectedClassTab, setSelectedClassTab] = useState<'10-A' | '10-B' | '9-A'>('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>(['chap-5']);

  const toggleAccordion = (id: string) => {
    setExpandedChapterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExport = (type: 'PDF' | 'Sheets') => {
    showToast(`Generating ${type} Curriculum Progress Report...`);
  };

  const subjects = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'];

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Breadcrumb & Title Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[#737686] text-[11px] font-bold uppercase tracking-wider">
            <span>Academic Monitoring</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#004ac6]">Syllabus Tracker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Curriculum Progress</h1>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1 h-9 px-3 bg-white border border-[#dae2fd] rounded-full text-[#131b2e] hover:bg-[#eaedff] transition-all shadow-sm active:scale-95"
            type="button"
            title="Export as PDF"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">picture_as_pdf</span>
            <span className="text-xs font-bold hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={() => handleExport('Sheets')}
            className="flex items-center gap-1 h-9 px-3 bg-white border border-[#dae2fd] rounded-full text-[#131b2e] hover:bg-[#eaedff] transition-all shadow-sm active:scale-95"
            type="button"
            title="Sync to Google Sheets"
          >
            <span className="material-symbols-outlined text-[18px] text-[#007d55]">table_chart</span>
            <span className="text-xs font-bold hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex p-1 bg-[#eaedff] rounded-2xl gap-1 overflow-x-auto no-scrollbar shadow-inner">
        {(['10-A', '10-B', '9-A'] as const).map(cls => (
          <button
            key={cls}
            onClick={() => {
              setSelectedClassTab(cls);
              showToast(`Loaded curriculum for Class ${cls}`);
            }}
            className={`flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold transition-all ${
              selectedClassTab === cls
                ? 'bg-white text-[#004ac6] shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Subject Horizontal Scroll Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map(subj => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                showToast(`Viewing ${subj} curriculum`);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#004ac6] text-white shadow-sm'
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
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe1ff] flex items-center justify-center text-[#00174b] shrink-0">
              <span className="material-symbols-outlined text-[28px]">functions</span>
            </div>
            <div className="min-w-0 flex flex-col">
              <h2 className="text-sm sm:text-base font-bold text-[#131b2e] truncate">
                {selectedSubject} — Class {selectedClassTab}
              </h2>
              <div className="flex items-center gap-1 text-[#737686] text-xs truncate">
                <span className="material-symbols-outlined text-[15px]">person</span>
                <span className="truncate">{syllabus.teacherName} ({syllabus.teacherQualification})</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-bold text-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {syllabus.statusText}
          </span>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-1.5 bg-[#f2f3ff] p-3 rounded-xl border border-[#dae2fd]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737686]">Syllabus Completion</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-bold text-[#004ac6]">{syllabus.overallCompletion}%</span>
              <span className="text-[11px] text-[#737686]">
                ({syllabus.completedChapters} / {syllabus.chapters.length} Chapters)
              </span>
            </div>
          </div>

          {/* Dual Tier Progress Bar */}
          <div className="relative w-full h-3 bg-[#eaedff] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004ac6] rounded-full transition-all duration-500"
              style={{ width: `${syllabus.overallCompletion}%` }}
            />
            {/* Target Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#131b2e]/60"
              style={{ left: `${syllabus.targetMidTerm}%` }}
              title={`Target: ${syllabus.targetMidTerm}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#737686] pt-0.5">
            <span>Target for mid-term: {syllabus.targetMidTerm}%</span>
            <span className="text-[#ba1a1a] font-bold">
              -{(syllabus.targetMidTerm - syllabus.overallCompletion).toFixed(1)}% delta
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#f2f3ff] p-3 rounded-xl flex items-center gap-3 border border-[#dae2fd]/50">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#004ac6] shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#737686]">Periods Held</span>
              <span className="text-sm font-bold text-[#131b2e] font-mono">
                {syllabus.periodsHeld} <span className="text-xs text-[#737686] font-normal">/ {syllabus.totalPeriods}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#f2f3ff] p-3 rounded-xl flex items-center gap-3 border border-[#dae2fd]/50">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#007d55] shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#737686]">Remaining</span>
              <span className="text-sm font-bold text-[#131b2e] font-mono">
                {syllabus.chapters.length - syllabus.completedChapters}{' '}
                <span className="text-xs text-[#737686] font-normal">Chapters</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Red Alert Box */}
      <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-2xl shadow-sm flex flex-col gap-3 border border-[#ba1a1a]/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ba1a1a]">
                Critical Syllabus Alert
              </span>
              <span className="text-[10px] bg-[#ba1a1a]/15 text-[#ba1a1a] px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            </div>
            <p className="text-sm font-bold text-[#93000a] mt-0.5">Class 10-B • Science</p>
            <p className="text-xs text-[#93000a]/90 mt-0.5 leading-relaxed">
              Current pace is <strong>42% completed</strong> (4 chapters behind projected mid-term schedule). Teacher:{' '}
              <em>Ms. Preeti Sharma</em>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <button
            onClick={() => sendTeacherReminder('Ms. Preeti Sharma', 'Science', 'Class 10-B')}
            className="w-full sm:w-auto h-9 px-4 bg-[#ba1a1a] text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            Send Reminder to Teacher
          </button>
        </div>
      </div>

      {/* Chapter Breakdown Interactive Accordion List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#131b2e]">Curriculum Units</h3>
            <span className="bg-[#eaedff] text-[#434655] px-2.5 py-0.5 rounded-full text-xs font-bold">
              {syllabus.chapters.length} Total
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
            className="text-[#004ac6] text-xs font-bold flex items-center gap-1 hover:underline"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Unit
          </button>
        </div>

        {/* Chapters Accordion */}
        <div className="space-y-2.5">
          {syllabus.chapters.map(chapter => {
            const isExpanded = expandedChapterIds.includes(chapter.id);
            const isCurrentProgress = chapter.status === 'In Progress';

            return (
              <div
                key={chapter.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border transition-all ${
                  isCurrentProgress
                    ? 'border-[#2563eb] shadow-[0_0_0_2px_rgba(37,99,235,0.2)]'
                    : 'border-[#eaedff]'
                }`}
              >
                {/* Header button */}
                <button
                  onClick={() => toggleAccordion(chapter.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left gap-3"
                  type="button"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] truncate">{chapter.name}</h4>
                        {isCurrentProgress && <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-ping"></span>}
                      </div>
                      <span className="text-[11px] text-[#737686]">
                        {chapter.allottedPeriods} Periods Allotted •{' '}
                        {chapter.status === 'Completed'
                          ? `Completed ${chapter.completionDate || 'Recently'}`
                          : chapter.status === 'In Progress'
                          ? `${chapter.completedPeriods} / ${chapter.allottedPeriods} Periods Completed (${Math.round((chapter.completedPeriods / chapter.allottedPeriods) * 100)}%)`
                          : `Scheduled ${chapter.scheduledDate || 'Upcoming'}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        chapter.status === 'Completed'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : chapter.status === 'In Progress'
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-[#eaedff] text-[#434655]'
                      }`}
                    >
                      {chapter.status === 'Completed' && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                      {chapter.status === 'In Progress' && (
                        <span className="material-symbols-outlined text-[14px]">timelapse</span>
                      )}
                      {chapter.status === 'Not Started' && (
                        <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                      )}
                      <span>{chapter.status}</span>
                    </span>
                    <span className="material-symbols-outlined text-[#737686] text-[20px]">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 bg-[#faf8ff] pt-2 border-t border-[#eaedff]">
                    {isCurrentProgress && (
                      <div className="p-3 rounded-xl bg-white border border-[#eaedff] space-y-2.5">
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
                            className="h-8 px-2 rounded-lg bg-[#f2f3ff] text-xs font-semibold text-[#131b2e] border border-[#dae2fd]"
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
                              style={{ width: `${(chapter.completedPeriods / chapter.allottedPeriods) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-white border border-[#eaedff] space-y-2 text-xs">
                      {chapter.lessonNotes && (
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#007d55] shrink-0 mt-0.5">
                            sticky_note_2
                          </span>
                          <div>
                            <span className="font-bold text-[#737686] block text-[10px] uppercase">Lesson Notes</span>
                            <p className="text-[#131b2e] mt-0.5">{chapter.lessonNotes}</p>
                          </div>
                        </div>
                      )}

                      {chapter.assignedHomework && (
                        <div className="flex items-start gap-2 pt-1 border-t border-[#f2f3ff]">
                          <span className="material-symbols-outlined text-[18px] text-[#004ac6] shrink-0 mt-0.5">
                            assignment
                          </span>
                          <div>
                            <span className="font-bold text-[#737686] block text-[10px] uppercase">
                              Assigned Homework
                            </span>
                            <p className="text-[#131b2e] mt-0.5">{chapter.assignedHomework}</p>
                          </div>
                        </div>
                      )}

                      {chapter.prerequisites && (
                        <div className="flex items-start gap-2 pt-1 border-t border-[#f2f3ff]">
                          <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
                            info
                          </span>
                          <div>
                            <span className="font-bold text-[#737686] block text-[10px] uppercase">Prerequisites</span>
                            <p className="text-[#131b2e] mt-0.5">{chapter.prerequisites}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingChapterModalData(chapter)}
                        className="h-8 px-3 rounded-xl bg-[#eaedff] text-[#004ac6] text-xs font-bold flex items-center gap-1 hover:bg-[#dbe1ff]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        Edit Record
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
