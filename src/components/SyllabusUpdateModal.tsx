import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, X, Bell } from 'lucide-react';

export const SyllabusUpdateModal: React.FC = () => {
  const { editingChapterModalData, setEditingChapterModalData, updateChapter, addChapter } = useApp();

  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Completed'>('Not Started');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [homework, setHomework] = useState('');
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    if (editingChapterModalData) {
      setName(editingChapterModalData.name || '');
      setStatus(editingChapterModalData.status || 'Not Started');
      setDate(editingChapterModalData.completionDate || editingChapterModalData.scheduledDate || '');
      setNotes(editingChapterModalData.lessonNotes || '');
      setHomework(editingChapterModalData.assignedHomework || '');
    }
  }, [editingChapterModalData]);

  if (!editingChapterModalData) return null;

  const isNew = !editingChapterModalData.id || editingChapterModalData.id === 'new';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addChapter({
        unitNumber: 13,
        name,
        allottedPeriods: 8,
        completedPeriods: status === 'Completed' ? 8 : status === 'In Progress' ? 4 : 0,
        status,
        completionDate: status === 'Completed' ? date : undefined,
        scheduledDate: status !== 'Completed' ? date : undefined,
        lessonNotes: notes,
        assignedHomework: homework,
      });
    } else {
      updateChapter(
        editingChapterModalData.id,
        {
          name,
          status,
          completionDate: status === 'Completed' ? date : undefined,
          scheduledDate: status !== 'Completed' ? date : undefined,
          lessonNotes: notes,
          assignedHomework: homework,
          completedPeriods: status === 'Completed' ? editingChapterModalData.allottedPeriods : status === 'In Progress' ? Math.max(1, Math.floor(editingChapterModalData.allottedPeriods / 2)) : 0,
        },
        notify
      );
    }
    setEditingChapterModalData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto space-y-3 sm:space-y-4 border border-[#eaedff]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">
                {isNew ? 'Add New Curriculum Unit' : 'Update Unit Progress'}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-[#737686]">Class 10-A • Mathematics</span>
            </div>
          </div>
          <button
            onClick={() => setEditingChapterModalData(null)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#dae2fd] transition-colors active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 text-left">
          {/* Chapter Name */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">
              Chapter Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Arithmetic Progressions"
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
          </div>

          {/* Status & Date */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                {status === 'Completed' ? 'Completion Date' : 'Target Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">
              Teacher Lesson Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Formula sheet distributed, lab demonstration conducted..."
              className="w-full p-2.5 sm:p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
          </div>

          {/* Homework */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">
              Assigned Homework / Tasks
            </label>
            <input
              type="text"
              value={homework}
              onChange={e => setHomework(e.target.value)}
              placeholder="e.g. Exercise 5.3 questions 1 to 10"
              className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
          </div>

          {/* Notification Checkbox */}
          <div className="flex items-center gap-2 pt-0.5 bg-[#f2f3ff] p-2.5 sm:p-3 rounded-xl border border-[#dae2fd]">
            <input
              type="checkbox"
              id="notify-cb"
              checked={notify}
              onChange={e => setNotify(e.target.checked)}
              className="w-4 h-4 rounded text-[#004ac6] accent-[#004ac6]"
            />
            <label htmlFor="notify-cb" className="text-[11px] sm:text-xs text-[#131b2e] cursor-pointer">
              Send instant broadcast notification to <strong>Class 10-A parents</strong>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditingChapterModalData(null)}
              className="flex-1 h-10 sm:h-11 bg-[#eaedff] rounded-xl text-xs font-semibold text-[#131b2e] hover:bg-[#dae2fd] transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 h-10 sm:h-11 px-4 bg-[#004ac6] text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-[#2563eb] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span>Save & Notify</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
