import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeItem } from '../types';
import {
  BellRing,
  Plus,
  Send,
  MessageSquare,
  Users,
  Search,
  Filter,
  Pin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  Sparkles,
  Smartphone,
  Mail,
  Share2,
  Zap,
  Radio,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const NoticeBoardView: React.FC = () => {
  const {
    notices,
    addNotice,
    deleteNotice,
    broadcastNoticeToAllParents,
    sendClassWiseMultiChannelMessage,
    isBroadcastingNotice,
    students,
    classes,
    institution,
    showToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedNoticeForBroadcast, setSelectedNoticeForBroadcast] = useState<NoticeItem | null>(null);

  // 1-Click Class-Wise Broadcast Modal State
  const [isClassBroadcastModalOpen, setIsClassBroadcastModalOpen] = useState(false);
  const [selectedBroadcastClass, setSelectedBroadcastClass] = useState<string>(classes[0]?.name || 'Class 10-A');
  const [broadcastTargetRole, setBroadcastTargetRole] = useState<'all' | 'parents' | 'students'>('all');
  const [classBroadcastTitle, setClassBroadcastTitle] = useState('');
  const [classBroadcastBody, setClassBroadcastBody] = useState('');
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [isSendingClassBroadcast, setIsSendingClassBroadcast] = useState(false);

  // New Notice Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('General');
  const [targetAudience, setTargetAudience] = useState<NoticeItem['targetAudience']>('All Parents');
  const [targetClass, setTargetClass] = useState<string>('Senior KG');
  const [priority, setPriority] = useState<NoticeItem['priority']>('Normal');
  const [isPinned, setIsPinned] = useState(false);

  // Broadcast modal form state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastProgress, setBulkProgress] = useState(0);

  const filteredNotices = notices.filter(n => {
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.publishedBy.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in notice title and message body', 'warning');
      return;
    }

    const finalAudience = targetAudience === 'Class-Specific' ? `Parents - ${targetClass}` : targetAudience;

    addNotice({
      title,
      content,
      category,
      targetAudience: finalAudience as any,
      targetClass: targetAudience === 'Class-Specific' ? targetClass : undefined,
      priority,
      publishedBy: `${institution.principalName} (${institution.principalDesignation})`,
      isPinned,
    });

    setIsAddNoticeModalOpen(false);
    setTitle('');
    setContent('');
    setCategory('General');
    setPriority('Normal');
    setIsPinned(false);
  };

  const handleOpenBroadcastModal = (notice: NoticeItem) => {
    setSelectedNoticeForBroadcast(notice);
    setBroadcastMessage(
      `*OFFICIAL PARENT CIRCULAR - ${institution.name.toUpperCase()}*\n\n` +
      `📢 *${notice.title.toUpperCase()}*\n\n` +
      `${notice.content}\n\n` +
      `📅 Date: ${notice.publishedAt}\n` +
      `🏛️ Issued By: ${notice.publishedBy}\n` +
      `📞 Helpline: ${institution.phone} | ${institution.website}\n` +
      `- Principal Office, ${institution.shortName}`
    );
    setIsBroadcastModalOpen(true);
  };

  const handleExecuteBroadcast = async () => {
    if (!selectedNoticeForBroadcast) return;
    setBulkProgress(25);
    await new Promise(r => setTimeout(r, 400));
    setBulkProgress(70);
    await new Promise(r => setTimeout(r, 400));
    setBulkProgress(100);

    await broadcastNoticeToAllParents(selectedNoticeForBroadcast.id, broadcastMessage);
    setIsBroadcastModalOpen(false);
  };

  const handleOpenClassBroadcast = (defaultClass?: string) => {
    const cls = defaultClass || (classes[0]?.name || 'Class 10-A');
    setSelectedBroadcastClass(cls);
    setClassBroadcastTitle(`Urgent Notification for ${cls}`);
    setClassBroadcastBody(`Dear Parents & Students of ${cls},\nPlease take note of the upcoming academic schedule. Complete instructions have been updated in your portal.\n- Principal Office, ${institution.shortName}`);
    setIsClassBroadcastModalOpen(true);
  };

  const handleApplyTemplate = (type: 'emergency' | 'fee' | 'exam' | 'live') => {
    if (type === 'emergency') {
      setClassBroadcastTitle(`Urgent Weather / Holiday Alert - ${selectedBroadcastClass}`);
      setClassBroadcastBody(`Important notice for all parents of ${selectedBroadcastClass}: Due to institutional advisory, campus activities for today are suspended. Online classes will operate per timetable.`);
    } else if (type === 'fee') {
      setClassBroadcastTitle(`Term Fee Payment Reminder - ${selectedBroadcastClass}`);
      setClassBroadcastBody(`Friendly reminder from ${institution.shortName} Accounts: Please clear pending term fee installments for ${selectedBroadcastClass} students before the due date.`);
    } else if (type === 'exam') {
      setClassBroadcastTitle(`Terminal Examination Schedule - ${selectedBroadcastClass}`);
      setClassBroadcastBody(`The date sheet and syllabus scope for upcoming terminal examinations of ${selectedBroadcastClass} has been published. Please review syllabus progress in the app.`);
    } else if (type === 'live') {
      setClassBroadcastTitle(`Live Class Session Started - ${selectedBroadcastClass}`);
      setClassBroadcastBody(`Live video class has commenced for ${selectedBroadcastClass}. Students please join immediately via the Live Class tab to register auto attendance.`);
    }
  };

  const handleSendClassBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classBroadcastTitle.trim() || !classBroadcastBody.trim()) {
      showToast('Please enter both title and message body', 'warning');
      return;
    }

    setIsSendingClassBroadcast(true);

    try {
      await sendClassWiseMultiChannelMessage(
        selectedBroadcastClass,
        broadcastTargetRole,
        classBroadcastTitle,
        classBroadcastBody
      );

      // If WhatsApp channel selected, trigger direct WhatsApp link for demonstration
      if (channelWhatsApp) {
        const text = encodeURIComponent(`*${classBroadcastTitle.toUpperCase()}*\n${classBroadcastBody}\n- ${institution.shortName}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }

      setIsClassBroadcastModalOpen(false);
    } finally {
      setIsSendingClassBroadcast(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Notice Board & Parents Broadcast Hub</h1>
            <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#00174b] font-bold text-[10px] sm:text-xs rounded-full">
              1-Click Multi-Channel
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Publish institutional circulars and dispatch emergency notices, fee reminders, & holiday announcements to all parents at once.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenClassBroadcast()}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
            title="Send WhatsApp + SMS + Push to students & parents of a specific class in 1-click"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>⚡ 1-Click Class Message</span>
          </button>

          <button
            onClick={() => {
              if (notices.length > 0) {
                handleOpenBroadcastModal(notices[0]);
              }
            }}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-[#007d55] to-[#005236] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast All Parents</span>
          </button>

          <button
            onClick={() => setIsAddNoticeModalOpen(true)}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Notice</span>
          </button>
        </div>
      </div>

      {/* 1-Click Master Broadcast Banner Card */}
      <div className="bg-gradient-to-r from-[#004ac6] via-[#1e3a8a] to-[#002113] p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#bdffdb] block">
              Instant Unified Parent Reach
            </span>
            <h3 className="text-base sm:text-lg font-bold">
              Send Message to All {students.length} Parents in 1-Click
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Simultaneous transmission via WhatsApp API, SMS Gateway & Parent Portal.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (notices.length > 0) {
              handleOpenBroadcastModal(notices[0]);
            } else {
              setIsAddNoticeModalOpen(true);
            }
          }}
          className="w-full sm:w-auto h-10 px-5 bg-white text-[#004ac6] hover:bg-[#f2f3ff] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all shrink-0"
          type="button"
        >
          <Send className="w-4 h-4 text-[#004ac6]" />
          <span>Launch Broadcast Dispatcher</span>
        </button>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search circulars, keywords..."
            className="w-full h-9 pl-9 pr-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto bg-[#f2f3ff] p-1 rounded-xl border border-[#dae2fd]">
          {['All', 'Urgent', 'Fees', 'Holiday', 'Exams', 'PTM', 'General'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#434655] hover:text-[#131b2e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredNotices.map(notice => {
          const isUrgent = notice.priority === 'Urgent';
          const isHigh = notice.priority === 'High';

          return (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                notice.isPinned ? 'border-[#004ac6]/40 bg-[#f9faff]' : 'border-[#eaedff]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        notice.category === 'Fees'
                          ? 'bg-[#fff3c4] text-[#7a5900]'
                          : notice.category === 'Urgent'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : notice.category === 'Exams'
                          ? 'bg-[#dbe1ff] text-[#00174b]'
                          : notice.category === 'Holiday'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : 'bg-[#eaedff] text-[#131b2e]'
                      }`}
                    >
                      {notice.category}
                    </span>

                    {notice.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#004ac6]">
                        <Pin className="w-3 h-3 rotate-45" />
                        Pinned
                      </span>
                    )}

                    {isUrgent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#ba1a1a]">
                        <AlertTriangle className="w-3 h-3" />
                        High Priority
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete notice "${notice.title}"?`)) {
                        deleteNotice(notice.id);
                      }
                    }}
                    className="p-1 hover:bg-[#ffdad6] text-[#737686] hover:text-[#ba1a1a] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#131b2e] leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-[#434655] leading-relaxed line-clamp-3">
                  {notice.content}
                </p>
              </div>

              {/* Metadata & Actions Footer */}
              <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-[#737686]">
                  <span>{notice.publishedAt}</span> • <span>{notice.targetAudience}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {notice.broadcastSent ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#007d55] bg-[#bdffdb] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Dispatched ({notice.broadcastRecipientsCount || students.length})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenBroadcastModal(notice)}
                      className="px-2.5 py-1 bg-[#004ac6] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span>1-Click Broadcast</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Notice Modal */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#eaedff] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-base sm:text-lg text-[#131b2e]">Publish Circular / Notice</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNoticeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Notice Headline / Subject</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Examination 2026"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#737686]">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                    >
                      <option value="General">General Academic</option>
                      <option value="Fees">Fee Payment</option>
                      <option value="Exams">Examinations</option>
                      <option value="Holiday">Holiday Announcement</option>
                      <option value="PTM">Parent-Teacher Meeting</option>
                      <option value="Urgent">Emergency Advisory</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#737686]">Target Audience</label>
                    <select
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value as any)}
                      className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                    >
                      <option value="All Parents">All Parents ({students.length})</option>
                      <option value="Class-Specific">Parents - According to Class</option>
                      <option value="All Teachers">Faculty & Staff</option>
                      <option value="All Students">All Students</option>
                    </select>
                  </div>
                </div>

                {targetAudience === 'Class-Specific' && (
                  <div className="space-y-1 bg-[#f2f3ff] p-3 rounded-2xl border border-[#004ac6]/30">
                    <label className="text-[10px] font-bold uppercase text-[#004ac6] flex items-center justify-between">
                      <span>Select Target Class Parents</span>
                      <span className="text-[9px] bg-[#004ac6] text-white px-2 py-0.5 rounded-full">Class Wise</span>
                    </label>
                    <select
                      value={targetClass}
                      onChange={e => setTargetClass(e.target.value)}
                      className="w-full h-10 px-3 bg-white rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          Parents - {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Circular Body Text</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Detailed instructions, dates, timings or guidelines for parents..."
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#131b2e]">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={e => setIsPinned(e.target.checked)}
                    className="rounded text-[#004ac6]"
                  />
                  <span>Pin to Top of Notice Board</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#004ac6] text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Broadcast Dispatcher Modal */}
      {isBroadcastModalOpen && selectedNoticeForBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#eaedff] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#e7f8ef] text-[#007d55] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#131b2e]">1-Click Parent Broadcast Dispatcher</h3>
                  <p className="text-[10px] text-[#737686]">Instant WhatsApp & SMS delivery to all registered parent contacts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#004ac6]" />
                <span className="font-bold text-[#131b2e]">Target: {students.length} Verified Parent WhatsApp Contacts</span>
              </div>
              <span className="text-[10px] font-bold text-[#007d55] bg-[#bdffdb] px-2 py-0.5 rounded-full">
                100% Ready
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-[#737686]">Custom Broadcast Message Payload</label>
              <textarea
                rows={6}
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="w-full p-3 bg-[#faf8ff] rounded-xl text-xs font-mono text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            {isBroadcastingNotice && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#004ac6]">
                  <span>Broadcasting to {students.length} parents...</span>
                  <span>{broadcastProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#f2f3ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#007d55] transition-all duration-300 rounded-full"
                    style={{ width: `${broadcastProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="flex-1 h-10 bg-[#f2f3ff] text-[#434655] font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBroadcastingNotice}
                onClick={handleExecuteBroadcast}
                className="flex-1 h-10 bg-gradient-to-r from-[#007d55] to-[#005236] text-white font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isBroadcastingNotice ? 'Dispatching...' : 'Dispatch in 1-Click Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1-CLICK CLASS BROADCAST MODAL (WhatsApp + SMS + Push) */}
      {isClassBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">1-Click Class Message</h3>
                  <p className="text-xs text-white/80">WhatsApp API + SMS Gateway + App Push Notification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClassBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendClassBroadcast} className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Class & Audience Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Target Class *</label>
                  <select
                    value={selectedBroadcastClass}
                    onChange={e => setSelectedBroadcastClass(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Recipients *</label>
                  <select
                    value={broadcastTargetRole}
                    onChange={e => setBroadcastTargetRole(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    <option value="all">Students & Parents of Class</option>
                    <option value="parents">Class-wise Parents Only</option>
                    <option value="students">Class-wise Students Only</option>
                  </select>
                </div>
              </div>

              {/* Multi-Channel Checkboxes */}
              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Active Transmission Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    channelWhatsApp ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={channelWhatsApp}
                      onChange={e => setChannelWhatsApp(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px]">WhatsApp</span>
                  </label>

                  <label className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    channelSMS ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={channelSMS}
                      onChange={e => setChannelSMS(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px]">SMS Gateway</span>
                  </label>

                  <label className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    channelPush ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={channelPush}
                      onChange={e => setChannelPush(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                    <BellRing className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px]">App Push</span>
                  </label>
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Quick Smart Templates</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('emergency')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold border border-red-200"
                  >
                    🚨 Weather / Emergency
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('fee')}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200"
                  >
                    💰 Fee Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('exam')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold border border-blue-200"
                  >
                    📝 Exam Date Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('live')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200"
                  >
                    💻 Live Class Link
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-[#737686]">Notice / Circular Title *</label>
                <input
                  type="text"
                  required
                  value={classBroadcastTitle}
                  onChange={e => setClassBroadcastTitle(e.target.value)}
                  placeholder="e.g. Schedule Update for Class 10-A"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-[#737686]">Message Body *</label>
                <textarea
                  required
                  rows={4}
                  value={classBroadcastBody}
                  onChange={e => setClassBroadcastBody(e.target.value)}
                  placeholder="Enter circular details..."
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassBroadcastModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingClassBroadcast}
                  className="h-10 px-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>{isSendingClassBroadcast ? 'Broadcasting...' : '1-Click Send to Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
