import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarCheck, X, Send } from 'lucide-react';

export const ScheduleSyncModal: React.FC = () => {
  const { scheduleSyncModalData, setScheduleSyncModalData, showToast } = useApp();
  const [meetingDate, setMeetingDate] = useState('2024-10-25');
  const [meetingTime, setMeetingTime] = useState('03:30 PM');
  const [agenda, setAgenda] = useState('Review lagging chapter milestones & schedule weekend remedial sessions.');

  if (!scheduleSyncModalData) return null;

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Meeting invitation dispatched to ${scheduleSyncModalData.teacherName} for ${meetingDate} at ${meetingTime}`);
    setScheduleSyncModalData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#283044]/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border border-[#eaedff]">
        <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Schedule Teacher Sync</h3>
              <span className="text-[10px] sm:text-[11px] text-[#737686]">
                {scheduleSyncModalData.classSec} • {scheduleSyncModalData.subject}
              </span>
            </div>
          </div>
          <button
            onClick={() => setScheduleSyncModalData(null)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#dae2fd] active:scale-95"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="space-y-2.5 sm:space-y-3 text-left">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] space-y-1">
            <span className="font-semibold text-[#004ac6] block text-[11px]">Teacher Selected:</span>
            <p className="font-medium">{scheduleSyncModalData.teacherName}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">Meeting Date</label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">Time Slot</label>
              <input
                type="text"
                required
                value={meetingTime}
                onChange={e => setMeetingTime(e.target.value)}
                placeholder="e.g. 03:30 PM"
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#434655]">Agenda / Memo</label>
            <textarea
              rows={3}
              required
              value={agenda}
              onChange={e => setAgenda(e.target.value)}
              className="w-full p-2.5 sm:p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={() => setScheduleSyncModalData(null)}
              className="flex-1 h-10 sm:h-11 bg-[#eaedff] rounded-xl text-xs font-semibold text-[#131b2e] active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 h-10 sm:h-11 px-3 sm:px-4 bg-[#004ac6] text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-[#2563eb] flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
