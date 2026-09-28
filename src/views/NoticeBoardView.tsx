import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeItem, BroadcastGroup, Student } from '../types';
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
  FolderPlus,
  UserPlus,
  UserCheck,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Check,
  Edit3,
  Bus,
  Trophy,
  Shield,
  BookOpen,
  ArrowRight,
  ListFilter,
} from 'lucide-react';

const GROUP_CATEGORIES: BroadcastGroup['category'][] = [
  'Class Group',
  'Transport',
  'Hostel',
  'Sports & Activities',
  'Academic Batch',
  'PTA Council',
  'Custom',
];

export const NoticeBoardView: React.FC = () => {
  const {
    notices,
    addNotice,
    deleteNotice,
    broadcastNoticeToAllParents,
    sendClassWiseMultiChannelMessage,
    isBroadcastingNotice,
    broadcastGroups,
    addBroadcastGroup,
    updateBroadcastGroup,
    deleteBroadcastGroup,
    sendGroupBroadcast,
    students,
    classes,
    institution,
    showToast,
    activeAcademicYear,
  } = useApp();

  // Navigation tab within Notice Board
  const [activeTab, setActiveTab] = useState<'notices' | 'groups' | 'dispatcher'>('notices');

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedGroupCategoryFilter, setSelectedGroupCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedNoticeForBroadcast, setSelectedNoticeForBroadcast] = useState<NoticeItem | null>(null);

  // Group Management Modal state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BroadcastGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupCategory, setGroupCategory] = useState<BroadcastGroup['category']>('Class Group');
  const [groupTargetClass, setGroupTargetClass] = useState<string>('ALL');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [groupMemberSearch, setGroupMemberSearch] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // 1-Click Class-Wise & Group Broadcast Dispatcher State
  const [isClassBroadcastModalOpen, setIsClassBroadcastModalOpen] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState<'class' | 'group'>('class');
  const [selectedBroadcastClass, setSelectedBroadcastClass] = useState<string>(classes[0]?.name || 'Class 10-A');
  const [selectedBroadcastGroupId, setSelectedBroadcastGroupId] = useState<string>(broadcastGroups[0]?.id || '');
  const [broadcastTargetRole, setBroadcastTargetRole] = useState<'all' | 'parents' | 'students'>('parents');
  const [classBroadcastTitle, setClassBroadcastTitle] = useState('');
  const [classBroadcastBody, setClassBroadcastBody] = useState('');
  const [channelWhatsApp, setChannelWhatsApp] = useState(true);
  const [channelSMS, setChannelSMS] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [isSendingClassBroadcast, setIsSendingClassBroadcast] = useState(false);

  // 1-by-1 Step Messenger state
  const [isOneByOneModalOpen, setIsOneByOneModalOpen] = useState(false);
  const [oneByOneTargetGroup, setOneByOneTargetGroup] = useState<{ name: string; students: Student[] } | null>(null);
  const [oneByOneCurrentIndex, setOneByOneCurrentIndex] = useState(0);
  const [oneByOneSentIds, setOneByOneSentIds] = useState<string[]>([]);

  // New Notice Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('General');
  const [targetAudienceType, setTargetAudienceType] = useState<'All Parents' | 'Class-Specific' | 'Broadcast-Group' | 'All Teachers' | 'All Students'>('All Parents');
  const [targetClass, setTargetClass] = useState<string>(classes[0]?.name || 'Class 10-A');
  const [targetGroupId, setTargetGroupId] = useState<string>(broadcastGroups[0]?.id || '');
  const [priority, setPriority] = useState<NoticeItem['priority']>('Normal');
  const [isPinned, setIsPinned] = useState(false);

  // Broadcast modal form state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastProgress, setBulkProgress] = useState(0);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
      if (selectedClassFilter !== 'ALL' && n.targetClass && n.targetClass !== selectedClassFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.publishedBy.toLowerCase().includes(q) ||
          (n.targetGroupName && n.targetGroupName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [notices, selectedCategory, selectedClassFilter, searchQuery]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return broadcastGroups.filter(g => {
      if (selectedGroupCategoryFilter !== 'All' && g.category !== selectedGroupCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          g.name.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q)) ||
          (g.targetClass && g.targetClass.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [broadcastGroups, selectedGroupCategoryFilter, searchQuery]);

  // Handle Notice Creation
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in notice title and message body', 'warning');
      return;
    }

    let finalAudience = targetAudienceType as string;
    let selectedGroup: BroadcastGroup | undefined;

    if (targetAudienceType === 'Class-Specific') {
      finalAudience = `Parents - ${targetClass}`;
    } else if (targetAudienceType === 'Broadcast-Group') {
      selectedGroup = broadcastGroups.find(g => g.id === targetGroupId);
      finalAudience = selectedGroup ? `Group: ${selectedGroup.name}` : 'Custom Group';
    }

    addNotice({
      title,
      content,
      category,
      targetAudience: finalAudience,
      targetClass: targetAudienceType === 'Class-Specific' ? targetClass : undefined,
      targetGroupId: targetAudienceType === 'Broadcast-Group' ? targetGroupId : undefined,
      targetGroupName: selectedGroup?.name,
      priority,
      publishedBy: `${institution.principalName} (${institution.principalDesignation})`,
      isPinned,
      academicYear: activeAcademicYear,
    });

    setIsAddNoticeModalOpen(false);
    setTitle('');
    setContent('');
    setCategory('General');
    setPriority('Normal');
    setIsPinned(false);
  };

  // Open Add / Edit Group Modal
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupCategory('Class Group');
    setGroupTargetClass(classes[0]?.name || 'ALL');
    setGroupDescription('');
    setGroupMemberIds([]);
    setGroupMemberSearch('');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: BroadcastGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupCategory(group.category);
    setGroupTargetClass(group.targetClass || 'ALL');
    setGroupDescription(group.description || '');
    setGroupMemberIds(group.memberStudentIds);
    setGroupMemberSearch('');
    setIsGroupModalOpen(true);
  };

  // Save Group
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      showToast('Please enter group title', 'warning');
      return;
    }
    if (groupMemberIds.length === 0) {
      showToast('Please select at least 1 member for the group', 'warning');
      return;
    }

    if (editingGroup) {
      updateBroadcastGroup(editingGroup.id, {
        name: groupName,
        category: groupCategory,
        targetClass: groupTargetClass === 'ALL' ? undefined : groupTargetClass,
        description: groupDescription,
        memberStudentIds: groupMemberIds,
      });
    } else {
      addBroadcastGroup({
        name: groupName,
        category: groupCategory,
        targetClass: groupTargetClass === 'ALL' ? undefined : groupTargetClass,
        description: groupDescription,
        memberStudentIds: groupMemberIds,
        academicYear: activeAcademicYear,
      });
    }

    setIsGroupModalOpen(false);
  };

  // Quick helper to select all students of a class in group modal
  const handleSelectAllClassStudents = (className: string) => {
    const classStudentIds = students
      .filter(s => className === 'ALL' || s.classSec === className || s.gradeLevel === className)
      .map(s => s.id);

    setGroupMemberIds(prev => {
      const merged = Array.from(new Set([...prev, ...classStudentIds]));
      showToast(`Selected all ${classStudentIds.length} students from ${className}`);
      return merged;
    });
  };

  // Open Broadcast Modal for General Notice
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

  // Open 1-Click Class-Wise or Group Broadcast
  const handleOpenClassBroadcast = (defaultClass?: string) => {
    setBroadcastMode('class');
    const cls = defaultClass || (classes[0]?.name || 'Class 10-A');
    setSelectedBroadcastClass(cls);
    setClassBroadcastTitle(`Urgent Class Circular - ${cls}`);
    setClassBroadcastBody(`Dear Parents & Students of ${cls},\nPlease take note of the upcoming academic schedule & assignment submission deadline.\n- Principal Office, ${institution.shortName}`);
    setIsClassBroadcastModalOpen(true);
  };

  const handleOpenGroupBroadcast = (group: BroadcastGroup) => {
    setBroadcastMode('group');
    setSelectedBroadcastGroupId(group.id);
    setClassBroadcastTitle(`Broadcast for ${group.name}`);
    setClassBroadcastBody(`Dear Members of ${group.name},\nPlease review this official communication regarding upcoming activities & schedule updates.\n- ${institution.shortName} Administration`);
    setIsClassBroadcastModalOpen(true);
  };

  const handleApplyTemplate = (type: 'emergency' | 'fee' | 'exam' | 'transport' | 'meeting') => {
    const targetLabel = broadcastMode === 'class' ? selectedBroadcastClass : (broadcastGroups.find(g => g.id === selectedBroadcastGroupId)?.name || 'Group');
    if (type === 'emergency') {
      setClassBroadcastTitle(`Urgent Holiday / Weather Alert - ${targetLabel}`);
      setClassBroadcastBody(`Important alert for all members of ${targetLabel}: Campus classes are suspended today due to weather conditions. Online study material has been uploaded to the portal.`);
    } else if (type === 'fee') {
      setClassBroadcastTitle(`Term Fee Payment Reminder - ${targetLabel}`);
      setClassBroadcastBody(`Friendly reminder from ${institution.shortName} Accounts: Please clear pending term fee installments for ${targetLabel} before the due date to avoid late penalty.`);
    } else if (type === 'exam') {
      setClassBroadcastTitle(`Terminal Examination Schedule - ${targetLabel}`);
      setClassBroadcastBody(`The date sheet and syllabus scope for upcoming terminal examinations of ${targetLabel} has been published. Please inspect syllabus progress in the app.`);
    } else if (type === 'transport') {
      setClassBroadcastTitle(`Transport & Bus Route Advisory - ${targetLabel}`);
      setClassBroadcastBody(`Notice regarding bus transit: Please ensure students arrive at designated pickup stops 5 minutes prior to the revised timetable.`);
    } else if (type === 'meeting') {
      setClassBroadcastTitle(`Parent-Teacher Interactive Meeting - ${targetLabel}`);
      setClassBroadcastBody(`You are cordially invited to the upcoming PTM for ${targetLabel} this Saturday. Please confirm attendance via student diary.`);
    }
  };

  // Execute Dispatch
  const handleSendClassBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classBroadcastTitle.trim() || !classBroadcastBody.trim()) {
      showToast('Please enter both title and message body', 'warning');
      return;
    }

    setIsSendingClassBroadcast(true);

    try {
      if (broadcastMode === 'class') {
        await sendClassWiseMultiChannelMessage(
          selectedBroadcastClass,
          broadcastTargetRole,
          classBroadcastTitle,
          classBroadcastBody
        );
      } else {
        await sendGroupBroadcast(
          selectedBroadcastGroupId,
          classBroadcastTitle,
          classBroadcastBody,
          { whatsapp: channelWhatsApp, sms: channelSMS, push: channelPush }
        );
      }

      // Trigger direct WhatsApp broadcast link
      if (channelWhatsApp) {
        const text = encodeURIComponent(`*${classBroadcastTitle.toUpperCase()}*\n${classBroadcastBody}\n- ${institution.shortName}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }

      setIsClassBroadcastModalOpen(false);
    } finally {
      setIsSendingClassBroadcast(false);
    }
  };

  // Open 1-by-1 Interactive Messenger for a group or class
  const handleStartOneByOneDispatch = (groupName: string, studentList: Student[]) => {
    setOneByOneTargetGroup({ name: groupName, students: studentList });
    setOneByOneCurrentIndex(0);
    setOneByOneSentIds([]);
    setIsOneByOneModalOpen(true);
  };

  // Current members of chosen group in group management
  const candidateStudents = useMemo(() => {
    return students.filter(s => {
      const q = groupMemberSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.classSec.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
      );
    });
  }, [students, groupMemberSearch]);

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Notice Board & Broadcast Groups</h1>
            <span className="px-2.5 py-0.5 bg-[#dbe1ff] text-[#00174b] font-bold text-[10px] sm:text-xs rounded-full">
              Class-Wise & Groups
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Class-wise multi-channel messaging, custom broadcast groups (Transport, Hostel, Olympiad, PTA), & instant WhatsApp/SMS dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenAddGroup}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            title="Create a new broadcast group (Class, Transport, Activity, etc.)"
          >
            <FolderPlus className="w-4 h-4 text-purple-200" />
            <span>+ Add Group</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenClassBroadcast()}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            title="Send WhatsApp + SMS + Push to students & parents of a specific class in 1-click"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>⚡ Class Message</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddNoticeModalOpen(true)}
            className="flex-1 sm:flex-initial h-10 px-3.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#eaedff] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('notices')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notices'
              ? 'bg-[#004ac6] text-white shadow-xs'
              : 'text-[#434655] hover:bg-[#f2f3ff]'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>All Notices & Circulars ({notices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'groups'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-[#434655] hover:bg-purple-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Broadcast Groups ({broadcastGroups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatcher')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'dispatcher'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#434655] hover:bg-amber-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Class & Group Dispatcher</span>
        </button>
      </div>

      {/* TAB 1: ALL NOTICES & CIRCULARS */}
      {activeTab === 'notices' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Quick Filter Strip */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search circulars, groups, keywords..."
                className="w-full h-9 pl-9 pr-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd] focus:bg-white"
              />
            </div>

            {/* Category Filters & Class Dropdown */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#004ac6] border border-[#dae2fd] outline-none"
              >
                <option value="ALL">All Classes & Audiences</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#f2f3ff] p-1 rounded-xl border border-[#dae2fd]">
                {['All', 'Urgent', 'Fees', 'Holiday', 'Exams', 'PTM', 'General'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
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
          </div>

          {/* Notices Feed */}
          {filteredNotices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#eaedff] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#737686] flex items-center justify-center mx-auto">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#131b2e]">No Circulars Found</h3>
              <p className="text-xs text-[#737686]">No notices match your current search and filter settings.</p>
              <button
                type="button"
                onClick={() => setIsAddNoticeModalOpen(true)}
                className="px-4 py-2 bg-[#004ac6] text-white text-xs font-bold rounded-xl"
              >
                + Publish First Notice
              </button>
            </div>
          ) : (
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
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
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

                          {notice.targetGroupName && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {notice.targetGroupName}
                            </span>
                          )}

                          {notice.targetClass && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {notice.targetClass}
                            </span>
                          )}

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

                        <span className="text-[11px] text-[#737686] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {notice.publishedAt}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-[#131b2e] leading-snug">
                        {notice.title}
                      </h3>

                      <p className="text-xs text-[#434655] whitespace-pre-line line-clamp-4">
                        {notice.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="text-[11px] text-[#737686]">
                        <span className="font-bold text-[#131b2e]">Target: </span>
                        <span>{notice.targetAudience}</span>
                        {notice.broadcastSent && (
                          <span className="ml-2 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            ✓ Dispatched ({notice.broadcastRecipientsCount} parents)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenBroadcastModal(notice)}
                          className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 shadow-xs"
                          title="Broadcast this circular via WhatsApp & SMS"
                        >
                          <Send className="w-3 h-3" />
                          <span>Broadcast</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNotice(notice.id)}
                          className="w-8 h-8 rounded-xl bg-[#ffdad6]/50 text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center justify-center active:scale-95"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BROADCAST GROUPS HUB */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {/* Groups Header Bar */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#00174b] p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-purple-200" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                  Broadcast Audience Management
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  Class-Wise & Custom Message Groups ({broadcastGroups.length})
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Organize students and parents into dedicated groups for targeted circulars and instant WhatsApp notifications.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddGroup}
              className="w-full sm:w-auto h-10 px-5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <FolderPlus className="w-4 h-4 text-purple-700" />
              <span>+ Create New Broadcast Group</span>
            </button>
          </div>

          {/* Group Category Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-[#eaedff]">
            <span className="text-xs font-bold text-[#737686] px-2">Filter Group:</span>
            {['All', ...GROUP_CATEGORIES].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGroupCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGroupCategoryFilter === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-[#f2f3ff] text-[#434655] hover:bg-[#eaedff]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Group Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredGroups.map(group => {
              const memberStudents = students.filter(s => group.memberStudentIds.includes(s.id));
              const isExpanded = expandedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#eaedff] shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        {group.category}
                      </span>
                      {group.targetClass && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                          {group.targetClass}
                        </span>
                      )}
                      <span className="text-[10px] text-[#737686] font-mono ml-auto">
                        Created {group.createdAt}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#131b2e] leading-snug">
                        {group.name}
                      </h4>
                      {group.description && (
                        <p className="text-xs text-[#737686] mt-1 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                    </div>

                    {/* Member Avatars Stack */}
                    <div className="bg-[#f8f9ff] p-2.5 rounded-xl border border-[#eaedff] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {memberStudents.slice(0, 4).map(s => (
                            <img
                              key={s.id}
                              src={s.avatarUrl}
                              alt={s.name}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-[#131b2e] ml-1">
                          {memberStudents.length} Students & Parents
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                        className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? 'Hide' : 'View'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expandable Member List */}
                    {isExpanded && (
                      <div className="bg-[#f2f3ff] p-2.5 rounded-xl border border-[#dae2fd] space-y-1.5 max-h-48 overflow-y-auto">
                        <span className="text-[10px] font-bold uppercase text-[#737686] block">Group Members Roster:</span>
                        {memberStudents.map(s => (
                          <div key={s.id} className="bg-white p-2 rounded-lg flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={s.avatarUrl} alt={s.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-[#131b2e] truncate block text-[11px]">{s.name}</span>
                                <span className="text-[10px] text-[#737686] truncate block">{s.parentRelation}: {s.parentName}</span>
                              </div>
                            </div>
                            <a
                              href={`https://wa.me/${s.parentWhatsApp}?text=${encodeURIComponent(`Hello ${s.parentName}, update regarding ${s.name} from ${institution.shortName}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center shrink-0 ml-1"
                              title="Direct WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenGroupBroadcast(group)}
                      className="flex-1 h-8 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send to Group</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartOneByOneDispatch(group.name, memberStudents)}
                      className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl flex items-center gap-1 active:scale-95"
                      title="Step-by-step 1-by-1 WhatsApp verification"
                    >
                      <span>1-by-1</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditGroup(group)}
                      className="w-8 h-8 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#434655] rounded-xl flex items-center justify-center active:scale-95"
                      title="Edit group"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete broadcast group "${group.name}"?`)) {
                          deleteBroadcastGroup(group.id);
                        }
                      }}
                      className="w-8 h-8 bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-xl flex items-center justify-center active:scale-95"
                      title="Delete group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS & GROUP DISPATCHER */}
      {activeTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Quick Class Selection */}
          <div className="lg:col-span-1 space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#eaedff] shadow-xs">
            <h3 className="font-bold text-sm text-[#131b2e] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#004ac6]" />
              <span>Class-Wise Quick Dispatch</span>
            </h3>
            <p className="text-xs text-[#737686]">
              Select any class to immediately broadcast notices or trigger step-by-step WhatsApp dispatches.
            </p>

            <div className="space-y-2">
              {classes.map(c => {
                const classStudents = students.filter(s => s.classSec === c.name || s.gradeLevel === c.name);
                return (
                  <div
                    key={c.id}
                    className="p-3 bg-[#f8f9ff] hover:bg-[#eef2ff] rounded-2xl border border-[#eaedff] flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#131b2e]">{c.name}</h4>
                      <p className="text-[10px] text-[#737686]">
                        {classStudents.length} Students • {c.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartOneByOneDispatch(c.name, classStudents)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg"
                        title="Step-by-step 1-by-1 delivery"
                      >
                        1-by-1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenClassBroadcast(c.name)}
                        className="px-2.5 py-1.5 bg-[#004ac6] hover:bg-[#003899] text-white font-bold text-[10px] rounded-lg shadow-xs"
                      >
                        ⚡ Broadcast
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Custom Groups Quick Dispatch */}
          <div className="lg:col-span-2 space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-[#eaedff] shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#131b2e] flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Custom Group Broadcast Queues</span>
              </h3>
              <button
                type="button"
                onClick={handleOpenAddGroup}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Group</span>
              </button>
            </div>
            <p className="text-xs text-[#737686]">
              Special interest batches, bus routes, olympiad cohorts, and executive committees.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {broadcastGroups.map(grp => {
                const grpStudents = students.filter(s => grp.memberStudentIds.includes(s.id));
                return (
                  <div
                    key={grp.id}
                    className="p-3.5 bg-purple-50/50 hover:bg-purple-50 rounded-2xl border border-purple-100 flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                          {grp.category}
                        </span>
                        <span className="text-[10px] font-bold text-purple-800">
                          {grpStudents.length} Members
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#131b2e] mt-1">{grp.name}</h4>
                      {grp.description && (
                        <p className="text-[11px] text-[#737686] line-clamp-1 mt-0.5">{grp.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-purple-100">
                      <button
                        type="button"
                        onClick={() => handleStartOneByOneDispatch(grp.name, grpStudents)}
                        className="flex-1 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1"
                      >
                        <span>1-by-1 Messenger</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGroupBroadcast(grp)}
                        className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Instant Push</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BROADCAST GROUP */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <FolderPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingGroup ? 'Edit Broadcast Group' : 'Create New Broadcast Group'}
                  </h3>
                  <p className="text-xs text-white/80">
                    Group students & parents for targeted notices and class-wise WhatsApp broadcasts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveGroup} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Group Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. Bus Route #4 Parents, Science Olympiad, Grade 10 Batch"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Group Category *</label>
                  <select
                    value={groupCategory}
                    onChange={e => setGroupCategory(e.target.value as BroadcastGroup['category'])}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-purple-800 focus:bg-white outline-none"
                  >
                    {GROUP_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Target Class Affiliation</label>
                  <select
                    value={groupTargetClass}
                    onChange={e => setGroupTargetClass(e.target.value)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    <option value="ALL">All Classes / Multi-Grade</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Description & Purpose</label>
                  <input
                    type="text"
                    value={groupDescription}
                    onChange={e => setGroupDescription(e.target.value)}
                    placeholder="e.g. Transit notifications, academic announcements, contest training"
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Member Selector Strip */}
              <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#dae2fd] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs text-[#131b2e]">
                      Select Group Members ({groupMemberIds.length} Selected)
                    </span>
                  </div>

                  {/* Quick Select Class Shortcut */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#737686] font-bold">Quick Select:</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllClassStudents(groupTargetClass)}
                      className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[10px] font-bold"
                    >
                      + Add All in {groupTargetClass}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupMemberIds(students.map(s => s.id))}
                      className="px-2 py-1 bg-[#eaedff] text-[#004ac6] rounded-lg text-[10px] font-bold"
                    >
                      All {students.length}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupMemberIds([])}
                      className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search Student */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={groupMemberSearch}
                    onChange={e => setGroupMemberSearch(e.target.value)}
                    placeholder="Search student by name, roll number, or class..."
                    className="w-full h-8 pl-8 pr-3 bg-white rounded-xl text-[11px] border border-[#dae2fd] outline-none"
                  />
                </div>

                {/* Students Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {candidateStudents.map(student => {
                    const isSelected = groupMemberIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400'
                            : 'bg-white border-[#eaedff] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setGroupMemberIds(prev =>
                                isSelected ? prev.filter(id => id !== student.id) : [...prev, student.id]
                              );
                            }}
                            className="rounded text-purple-600 focus:ring-0"
                          />
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#131b2e] block truncate text-[11px]">{student.name}</span>
                            <span className="text-[10px] text-[#737686] truncate block">{student.classSec} • Roll #{student.rollNo}</span>
                          </div>
                        </div>

                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingGroup ? 'Update Broadcast Group' : 'Save Broadcast Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-CLICK CLASS-WISE & GROUP DISPATCHER */}
      {isClassBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {broadcastMode === 'class' ? '1-Click Class Multi-Channel Broadcast' : '1-Click Group Broadcast'}
                  </h3>
                  <p className="text-xs text-white/80">
                    Direct transmission to WhatsApp API, SMS Gateway & Parent Portal
                  </p>
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

            <form onSubmit={handleSendClassBroadcast} className="p-4 sm:p-5 space-y-3 text-xs max-h-[82vh] overflow-y-auto">
              {/* Broadcast Target Toggle: Class vs Custom Group */}
              <div className="grid grid-cols-2 gap-2 bg-[#f2f3ff] p-1 rounded-xl border border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setBroadcastMode('class')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    broadcastMode === 'class' ? 'bg-white text-amber-900 shadow-xs' : 'text-[#737686]'
                  }`}
                >
                  🏫 Class-Wise Mode
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastMode('group')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    broadcastMode === 'group' ? 'bg-white text-purple-900 shadow-xs' : 'text-[#737686]'
                  }`}
                >
                  👥 Custom Group Mode
                </button>
              </div>

              {/* Target Selector */}
              {broadcastMode === 'class' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-[#737686]">Select Target Class *</label>
                    <select
                      value={selectedBroadcastClass}
                      onChange={e => setSelectedBroadcastClass(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#004ac6] focus:bg-white outline-none"
                    >
                      <option value="ALL">All Classes ({students.length} Students)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-[#737686]">Recipient Audience</label>
                    <select
                      value={broadcastTargetRole}
                      onChange={e => setBroadcastTargetRole(e.target.value as any)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                    >
                      <option value="parents">Parents / Guardians Only</option>
                      <option value="students">Students Only</option>
                      <option value="all">Both Parents & Students</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Select Broadcast Group *</label>
                  <select
                    value={selectedBroadcastGroupId}
                    onChange={e => setSelectedBroadcastGroupId(e.target.value)}
                    className="w-full h-10 px-3 bg-purple-50 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 focus:bg-white outline-none"
                  >
                    {broadcastGroups.map(grp => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name} — {grp.category} ({grp.memberStudentIds.length} members)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Channels Selector */}
              <div>
                <label className="font-bold uppercase text-[10px] text-[#737686] block mb-1">Active Transmission Gateways</label>
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
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
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
                    onClick={() => handleApplyTemplate('transport')}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-[10px] font-bold border border-purple-200"
                  >
                    🚌 Bus Route Advisory
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('meeting')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200"
                  >
                    🤝 PTM Invitation
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
                  <span>{isSendingClassBroadcast ? 'Broadcasting...' : '1-Click Send Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 1-BY-1 INTERACTIVE MESSENGER */}
      {isOneByOneModalOpen && oneByOneTargetGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">1-by-1 WhatsApp Messenger</h3>
                  <p className="text-xs text-white/80">{oneByOneTargetGroup.name} • {oneByOneTargetGroup.students.length} Recipients</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOneByOneModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {oneByOneTargetGroup.students.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No students found in this group.</p>
              ) : (
                (() => {
                  const currentStudent = oneByOneTargetGroup.students[oneByOneCurrentIndex];
                  if (!currentStudent) {
                    return (
                      <div className="text-center py-8 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-[#131b2e]">All Reminders Sent!</h4>
                        <p className="text-xs text-[#737686]">Completed 1-by-1 dispatch to {oneByOneTargetGroup.students.length} recipients.</p>
                        <button
                          type="button"
                          onClick={() => setIsOneByOneModalOpen(false)}
                          className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                        >
                          Close Dispatcher
                        </button>
                      </div>
                    );
                  }

                  const isSent = oneByOneSentIds.includes(currentStudent.id);
                  const msgText = `*OFFICIAL NOTICE - ${institution.name.toUpperCase()}*\n\nDear ${currentStudent.parentName},\nImportant circular regarding ${currentStudent.name} (${currentStudent.classSec}, Roll #${currentStudent.rollNo}). Please review the school app for full instructions.\n- Principal Office, ${institution.shortName}`;

                  return (
                    <div className="space-y-4">
                      {/* Step Progress Counter */}
                      <div className="flex items-center justify-between bg-[#f2f3ff] p-3 rounded-2xl">
                        <span className="font-bold text-[#131b2e]">
                          Recipient {oneByOneCurrentIndex + 1} of {oneByOneTargetGroup.students.length}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {oneByOneSentIds.length} Delivered
                        </span>
                      </div>

                      {/* Current Student Card */}
                      <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center gap-3">
                        <img
                          src={currentStudent.avatarUrl}
                          alt={currentStudent.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-emerald-300 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#131b2e] truncate">{currentStudent.name}</h4>
                          <p className="text-[11px] text-[#737686] truncate">
                            {currentStudent.classSec} • Roll #{currentStudent.rollNo}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-900 mt-0.5">
                            {currentStudent.parentRelation}: {currentStudent.parentName} ({currentStudent.parentWhatsApp})
                          </p>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Message Text:</span>
                        <p className="text-[11px] text-gray-700 whitespace-pre-line font-mono">{msgText}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (oneByOneCurrentIndex > 0) {
                              setOneByOneCurrentIndex(prev => prev - 1);
                            }
                          }}
                          disabled={oneByOneCurrentIndex === 0}
                          className="px-3 py-2.5 rounded-xl border border-[#dae2fd] text-xs font-bold disabled:opacity-40"
                        >
                          Previous
                        </button>

                        <a
                          href={`https://wa.me/${currentStudent.parentWhatsApp}?text=${encodeURIComponent(msgText)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (!oneByOneSentIds.includes(currentStudent.id)) {
                              setOneByOneSentIds(prev => [...prev, currentStudent.id]);
                            }
                          }}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Send WhatsApp Notice</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            if (!oneByOneSentIds.includes(currentStudent.id)) {
                              setOneByOneSentIds(prev => [...prev, currentStudent.id]);
                            }
                            setOneByOneCurrentIndex(prev => prev + 1);
                          }}
                          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold"
                        >
                          Next ➔
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PUBLISH GENERAL NOTICE MODAL */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Publish Notice / Circular</h3>
                  <p className="text-xs text-white/80">Issue official circular to students, parents or broadcast groups</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNoticeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNotice} className="p-4 sm:p-5 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-[#737686]">Circular Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Examination Schedule, Sports Day Registration"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-semibold focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as NoticeItem['category'])}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    <option value="General">General Notice</option>
                    <option value="Urgent">Urgent / Emergency</option>
                    <option value="Fees">Fee Clearance Notice</option>
                    <option value="Holiday">Holiday & Closure</option>
                    <option value="Exams">Exams & Assessment</option>
                    <option value="PTM">Parent-Teacher Meeting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as NoticeItem['priority'])}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Group Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-[#737686]">Target Audience *</label>
                  <select
                    value={targetAudienceType}
                    onChange={e => setTargetAudienceType(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold text-[#004ac6] focus:bg-white outline-none"
                  >
                    <option value="All Parents">All Parents & Guardians</option>
                    <option value="Class-Specific">Class-Specific Audience</option>
                    <option value="Broadcast-Group">Broadcast Group</option>
                    <option value="All Students">All Students</option>
                    <option value="All Teachers">All Teachers</option>
                  </select>
                </div>

                {targetAudienceType === 'Class-Specific' && (
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-[#737686]">Select Class *</label>
                    <select
                      value={targetClass}
                      onChange={e => setTargetClass(e.target.value)}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-bold focus:bg-white outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetAudienceType === 'Broadcast-Group' && (
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-[#737686]">Select Broadcast Group *</label>
                    <select
                      value={targetGroupId}
                      onChange={e => setTargetGroupId(e.target.value)}
                      className="w-full h-10 px-3 bg-purple-50 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 focus:bg-white outline-none"
                    >
                      {broadcastGroups.map(grp => (
                        <option key={grp.id} value={grp.id}>
                          {grp.name} ({grp.memberStudentIds.length} members)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-[#737686]">Circular Content / Body *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Type official circular body..."
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-[#004ac6] focus:ring-0"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-[#131b2e] cursor-pointer">
                  📌 Pin this circular to top of Notice Board & Parent App
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: MASS BROADCAST MODAL */}
      {isBroadcastModalOpen && selectedNoticeForBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#eaedff] overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#007d55] to-[#005236] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Broadcast Notice Circular</h3>
                  <p className="text-xs text-white/80">Dispatch to {students.length} parents via WhatsApp & SMS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-[#737686]">Formatted Message Payload</label>
                <textarea
                  rows={6}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 bg-[#f2f3ff] rounded-xl border border-[#dae2fd] text-xs font-mono focus:bg-white outline-none"
                />
              </div>

              {broadcastProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-emerald-800">
                    <span>Broadcasting to WhatsApp & SMS Gateway...</span>
                    <span>{broadcastProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="h-10 px-4 rounded-xl font-bold text-xs text-[#737686] hover:bg-[#f2f3ff]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBroadcast}
                  disabled={isBroadcastingNotice}
                  className="h-10 px-5 bg-gradient-to-r from-[#007d55] to-[#005236] text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBroadcastingNotice ? 'Dispatching...' : `Broadcast to ${students.length} Parents`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
