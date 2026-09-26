import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  CalendarCheck,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  X,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AcademicCalendarView: React.FC = () => {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    institution,
    showToast,
    openDispatchModal,
  } = useApp();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0 = Jan 2026
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'holidays' | 'sundays' | 'exams' | 'ptm' | 'fees'>('all');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>('2026-01-15');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('holiday');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Calculate days in active month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay();
  }, [currentYear, currentMonthIndex]);

  // Map of events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    calendarEvents.forEach(ev => {
      const existing = map.get(ev.date) || [];
      map.set(ev.date, [...existing, ev]);
    });
    return map;
  }, [calendarEvents]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    let sundaysCount = 0;
    let holidaysCount = 0;
    let examsCount = 0;
    let ptmCount = 0;
    let feeDueCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(currentYear, currentMonthIndex, d).getDay();
      const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      if (dayOfWeek === 0) {
        sundaysCount++;
      }

      const events = eventsByDate.get(dateStr) || [];
      events.forEach(e => {
        if (e.type === 'holiday') holidaysCount++;
        if (e.type === 'exam') examsCount++;
        if (e.type === 'ptm') ptmCount++;
        if (e.type === 'fee-due') feeDueCount++;
      });
    }

    const workingDays = Math.max(0, daysInMonth - sundaysCount - holidaysCount);

    return {
      daysInMonth,
      sundaysCount,
      holidaysCount,
      workingDays,
      examsCount,
      ptmCount,
      feeDueCount,
    };
  }, [currentYear, currentMonthIndex, daysInMonth, eventsByDate]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Please enter an event title', 'warning');
      return;
    }

    addCalendarEvent({
      title: newEventTitle,
      date: selectedDateForNewEvent,
      type: newEventType,
      description: newEventDesc,
      isGazetted: newEventType === 'holiday',
    });

    setIsAddEventModalOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  const handleExportCalendar = () => {
    openDispatchModal({
      title: `Academic Calendar ${currentYear} (${MONTH_NAMES[currentMonthIndex]})`,
      reportCategory: 'master-audit',
      defaultFormat: 'excel',
      defaultRecipientType: 'principal',
    });
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Academic Calendar & Holiday Ledger</h1>
            <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#00174b] font-bold text-[10px] sm:text-xs rounded-full">
              Year {currentYear} Session
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Full annual institutional schedule with automatic Sunday off-days, Indian gazetted holidays, terminal examinations & fee deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCalendar}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-white border border-[#dae2fd] text-[#131b2e] hover:bg-[#f2f3ff] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Download className="w-4 h-4 text-[#007d55]" />
            <span>Export Calendar</span>
          </button>

          <button
            onClick={() => {
              setSelectedDateForNewEvent(`${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-15`);
              setIsAddEventModalOpen(true);
            }}
            className="flex-1 sm:flex-initial h-10 px-4 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Event / Holiday</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Working Days */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">Working Days ({MONTH_NAMES[currentMonthIndex]})</span>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#004ac6]">{monthlyStats.workingDays} Days</div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">Excluding Sundays & Gazetted Holidays</span>
          </div>
        </div>

        {/* Sundays Off */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider">Sundays (Weekly Off)</span>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#ba1a1a]">{monthlyStats.sundaysCount} Sundays</div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">Mandatory Weekly Rest Days</span>
          </div>
        </div>

        {/* Gazetted Holidays */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#007d55] uppercase tracking-wider">Gazetted Holidays</span>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#007d55]">{monthlyStats.holidaysCount} Holidays</div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">National & Religious Observances</span>
          </div>
        </div>

        {/* Academic Events / Exams */}
        <div className="bg-white p-3.5 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#131b2e] uppercase tracking-wider">Exams & Events</span>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-extrabold text-[#131b2e]">
              {monthlyStats.examsCount + monthlyStats.ptmCount + monthlyStats.feeDueCount} Milestones
            </div>
            <span className="text-[10px] text-[#737686] mt-0.5 block">Exams, PTMs & Fee Clearance</span>
          </div>
        </div>
      </div>

      {/* Month Navigator & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Month Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex items-center justify-center transition-all active:scale-95"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center min-w-44">
            <h2 className="text-base sm:text-lg font-bold text-[#131b2e]">
              {MONTH_NAMES[currentMonthIndex]} {currentYear}
            </h2>
            <span className="text-[10px] text-[#737686]">{monthlyStats.daysInMonth} Total Days</span>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex items-center justify-center transition-all active:scale-95"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto bg-[#f2f3ff] p-1 rounded-xl border border-[#dae2fd]">
          {[
            { id: 'all', label: 'All Days' },
            { id: 'holidays', label: 'Holidays' },
            { id: 'sundays', label: 'Sundays' },
            { id: 'exams', label: 'Exams' },
            { id: 'fees', label: 'Fee Dates' },
            { id: 'ptm', label: 'PTM' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#eaedff] bg-[#faf8ff] text-center font-bold text-xs py-2.5">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] uppercase tracking-wider ${
                idx === 0 ? 'text-[#ba1a1a]' : 'text-[#434655]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#eaedff]">
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-32 bg-[#faf8ff]/40 p-1.5" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayOfWeek = (firstDayOfWeek + idx) % 7;
            const isSunday = dayOfWeek === 0;
            const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const events = eventsByDate.get(dateStr) || [];

            // Filter logic
            const hasHoliday = events.some(e => e.type === 'holiday');
            const hasExam = events.some(e => e.type === 'exam');
            const hasFeeDue = events.some(e => e.type === 'fee-due');
            const hasPtm = events.some(e => e.type === 'ptm');

            let isDimmed = false;
            if (selectedFilter === 'holidays' && !hasHoliday) isDimmed = true;
            if (selectedFilter === 'sundays' && !isSunday) isDimmed = true;
            if (selectedFilter === 'exams' && !hasExam) isDimmed = true;
            if (selectedFilter === 'fees' && !hasFeeDue) isDimmed = true;
            if (selectedFilter === 'ptm' && !hasPtm) isDimmed = true;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  setSelectedDateForNewEvent(dateStr);
                  setIsAddEventModalOpen(true);
                }}
                className={`h-24 sm:h-32 p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col justify-between hover:bg-[#f2f3ff]/60 ${
                  isSunday ? 'bg-[#fff5f5]' : hasHoliday ? 'bg-[#e7f8ef]/40' : 'bg-white'
                } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isSunday
                        ? 'bg-[#ba1a1a] text-white'
                        : hasHoliday
                        ? 'bg-[#007d55] text-white'
                        : 'text-[#131b2e]'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isSunday && (
                    <span className="text-[9px] font-bold text-[#ba1a1a] hidden sm:inline">Sunday Off</span>
                  )}
                </div>

                {/* Event Tags inside cell */}
                <div className="space-y-1 overflow-y-auto max-h-16 sm:max-h-20 no-scrollbar mt-1">
                  {events.map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Remove event "${ev.title}"?`)) {
                          deleteCalendarEvent(ev.id);
                        }
                      }}
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold truncate flex items-center justify-between group ${
                        ev.type === 'holiday'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : ev.type === 'exam'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : ev.type === 'fee-due'
                          ? 'bg-[#fff3c4] text-[#7a5900]'
                          : ev.type === 'ptm'
                          ? 'bg-[#dbe1ff] text-[#00174b]'
                          : 'bg-[#eaedff] text-[#131b2e]'
                      }`}
                      title={`${ev.title}: ${ev.description || ''}`}
                    >
                      <span className="truncate">{ev.title}</span>
                      <Trash2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#eaedff] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-base text-[#131b2e]">Add Holiday or Academic Event</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEventModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Event / Holiday Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Maha Shivratri, UT-3 Examination, Science Exhibition"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Event Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDateForNewEvent}
                    onChange={e => setSelectedDateForNewEvent(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Category</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as any)}
                    className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  >
                    <option value="holiday">Gazetted Holiday</option>
                    <option value="exam">Examination</option>
                    <option value="ptm">PTM Meeting</option>
                    <option value="fee-due">Fee Due Deadline</option>
                    <option value="event">School Function</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Description & Notes</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  placeholder="Instructions for faculty, students or parents..."
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#004ac6] text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
