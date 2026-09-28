import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AcademicSession } from '../types';
import {
  Calendar,
  X,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AcademicSessionModal: React.FC = () => {
  const {
    isAcademicSessionModalOpen,
    setIsAcademicSessionModalOpen,
    academicSessions,
    activeAcademicYear,
    setActiveAcademicYear,
    addAcademicSession,
    updateAcademicSession,
    deleteAcademicSession,
    userRole,
    showToast,
  } = useApp();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [termName, setTermName] = useState('Annual Academic Cycle');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2027-03-31');
  const [status, setStatus] = useState<AcademicSession['status']>('Active');
  const [description, setDescription] = useState('');

  if (!isAcademicSessionModalOpen) return null;

  const handleStartAdd = () => {
    setName('');
    setTermName('Annual Academic Cycle');
    setStartDate('2026-04-01');
    setEndDate('2027-03-31');
    setStatus('Active');
    setDescription('');
    setEditingSessionId(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (session: AcademicSession) => {
    setName(session.name);
    setTermName(session.termName || 'Annual Academic Cycle');
    setStartDate(session.startDate);
    setEndDate(session.endDate);
    setStatus(session.status);
    setDescription(session.description || '');
    setEditingSessionId(session.id);
    setIsAddingNew(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter session name (e.g. 2026-2027)', 'warning');
      return;
    }

    if (editingSessionId) {
      updateAcademicSession(editingSessionId, {
        name,
        termName,
        startDate,
        endDate,
        status,
        description,
      });
    } else {
      const newSession: AcademicSession = {
        id: `session-${Date.now()}`,
        name,
        termName,
        startDate,
        endDate,
        isCurrent: status === 'Active',
        status,
        description,
      };
      addAcademicSession(newSession);
    }

    setIsAddingNew(false);
    setEditingSessionId(null);
  };

  const isFaculty = userRole === 'Teacher / Faculty';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] flex flex-col max-h-[92vh] overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004ac6] via-[#1e3a8a] to-[#002113] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg truncate">Academic Session & Year Switcher</h3>
                <span className="text-[10px] font-bold bg-[#bdffdb] text-[#002113] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Module 1
                </span>
              </div>
              <p className="text-xs text-white/80 truncate">
                Configure academic cycles. Changing year auto-filters student rosters, grades, attendance & fees.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAcademicSessionModalOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0 ml-2"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#faf8ff]">
          {/* Faculty Lock Banner */}
          {isFaculty && (
            <div className="bg-[#fff8e1] border border-[#ffe082] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#b78103]">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#f57f17]" />
              <div className="min-w-0">
                <span className="font-bold block">Faculty Automatic Session Lock:</span>
                <span>As per compliance rule, Teacher login is permanently synchronized to the live Active Session ({activeAcademicYear}).</span>
              </div>
            </div>
          )}

          {/* Active Session Info Box */}
          <div className="bg-white p-4 rounded-2xl border border-[#dae2fd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] block">
                Currently Active Session
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h4 className="text-xl font-extrabold text-[#004ac6]">{activeAcademicYear}</h4>
                <span className="px-2 py-0.5 bg-[#bdffdb] text-[#002113] text-[10px] font-bold rounded-full">
                  All Data Filtered Live
                </span>
              </div>
            </div>

            {!isAddingNew && !isFaculty && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="h-9 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Academic Session</span>
              </button>
            )}
          </div>

          {/* Add / Edit Session Form */}
          {isAddingNew && !isFaculty && (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-[#004ac6]/40 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#eaedff] pb-2">
                <span className="text-xs font-bold text-[#131b2e]">
                  {editingSessionId ? 'Edit Academic Session' : 'Create New Academic Session'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-[#737686] hover:text-[#131b2e]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Session Name / Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-2027"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Term / Cycle Descriptor</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Cycle / Semester 1"
                    value={termName}
                    onChange={e => setTermName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full h-9 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  >
                    <option value="Active">Active (Current Operations)</option>
                    <option value="Upcoming">Upcoming (Planning & Admissions)</option>
                    <option value="Archived">Archived (Read-Only Records)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Description</label>
                  <input
                    type="text"
                    placeholder="Short description or notes..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 bg-[#f2f3ff] text-[#434655] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#004ac6] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
                >
                  {editingSessionId ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          )}

          {/* List of Sessions */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737686] block">
              Available Sessions ({academicSessions.length})
            </span>

            {academicSessions.map(session => {
              const isSelected = activeAcademicYear === session.name;

              return (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#f2f3ff] border-[#004ac6] shadow-xs'
                      : 'bg-white border-[#eaedff] hover:border-[#dae2fd]'
                  }`}
                >
                  <div className="min-w-0 flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#004ac6] text-white font-bold' : 'bg-[#f2f3ff] text-[#434655]'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#131b2e]">{session.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            session.status === 'Active'
                              ? 'bg-[#bdffdb] text-[#002113]'
                              : session.status === 'Upcoming'
                              ? 'bg-[#dbe1ff] text-[#00174b]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {session.status}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold bg-[#004ac6] text-white px-2 py-0.5 rounded-full">
                            Active Filter
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737686] mt-0.5 line-clamp-1">
                        {session.startDate} to {session.endDate} • {session.termName || 'Academic Cycle'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => setActiveAcademicYear(session.name)}
                        className="px-3 py-1.5 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#004ac6] text-xs font-bold rounded-xl flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Switch to this Year</span>
                      </button>
                    )}

                    {!isFaculty && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(session)}
                          className="p-1.5 hover:bg-[#eaedff] text-[#434655] rounded-lg transition-colors"
                          title="Edit Session"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {academicSessions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove session "${session.name}"?`)) {
                                deleteAcademicSession(session.id);
                              }
                            }}
                            className="p-1.5 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#eaedff] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#737686]">
            Academic Sessions: <strong>{academicSessions.length} total</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsAcademicSessionModalOpen(false)}
            className="px-4 py-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
