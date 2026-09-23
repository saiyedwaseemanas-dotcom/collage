import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 space-y-4 border border-[#eaedff]">
        <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#131b2e]">Schedule Teacher Sync</h3>
              <span className="text-[11px] text-[#737686]">
                {scheduleSyncModalData.classSec} • {scheduleSyncModalData.subject}
              </span>
            </div>
          </div>
          <button
            onClick={() => setScheduleSyncModalData(null)}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#dae2fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSchedule} className="space-y-3 text-left">
          <div className="p-3 rounded-xl bg-[#f2f3ff] text-xs text-[#131b2e] space-y-1">
            <span className="font-semibold text-[#004ac6] block">Teacher Selected:</span>
            <p className="font-medium">{scheduleSyncModalData.teacherName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#434655]">Meeting Date</label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#434655]">Time Slot</label>
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#434655]">Agenda / Memo</label>
            <textarea
              rows={3}
              required
              value={agenda}
              onChange={e => setAgenda(e.target.value)}
              className="w-full p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#004ac6]/30 border border-[#dae2fd]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setScheduleSyncModalData(null)}
              className="flex-1 h-11 bg-[#eaedff] rounded-xl text-xs font-semibold text-[#131b2e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 h-11 px-4 bg-[#004ac6] text-white rounded-xl text-xs font-semibold shadow-md hover:bg-[#2563eb] flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Confirm & Dispatch Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
