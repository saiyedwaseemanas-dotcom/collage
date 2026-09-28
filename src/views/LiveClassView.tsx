import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LiveSession, LiveRecording } from '../types';
import {
  Video,
  Play,
  Pause,
  Download,
  Users,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  Sparkles,
  QrCode,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  Send,
  Trash2,
  Layers,
  Search,
  Maximize2,
  FileText,
  Radio,
  Share2,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const LiveClassView: React.FC = () => {
  const {
    userRole,
    classes,
    subjects,
    students,
    activeAcademicYear,
    liveSessions,
    liveRecordings,
    activeLiveSession,
    setActiveLiveSession,
    startLiveClass,
    endLiveClass,
    joinLiveClassWithAutoAttendance,
    deleteLiveRecording,
    syllabus,
    teachers,
    showToast,
  } = useApp();

  // Subviews: 'live-rooms' | 'recordings-library' | 'offline-qr' | 'syllabus-tracker'
  const [activeSubTab, setActiveSubTab] = useState<'live-rooms' | 'recordings-library' | 'offline-qr' | 'syllabus-tracker'>('live-rooms');

  // Filter states
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Start Live Class Form State
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState(classes[0]?.name || 'Class 10-A');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Mathematics');
  const [newTopic, setNewTopic] = useState('');
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);

  // Classroom Live Interactive State (Mic, Camera, Screen Share, Whiteboard, Chat)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    { id: '1', sender: 'Teacher Bot', text: 'Welcome to the Live Classroom! Live attendance has been registered.', time: '10:02 AM' },
    { id: '2', sender: 'Kabir Mehta', text: 'Good morning sir, can see your screen clearly.', time: '10:04 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'participants'>('chat');

  // Video Player Preview Modal
  const [previewRecording, setPreviewRecording] = useState<LiveRecording | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);

  // QR Code Scanner / Display Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrScannedStudentId, setQrScannedStudentId] = useState('');

  const isTeacherOrAdmin = userRole === 'Super Admin' || userRole === 'Teacher / Faculty';

  // Filtered live sessions
  const filteredSessions = useMemo(() => {
    return liveSessions.filter(s => {
      if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || s.teacherName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [liveSessions, selectedClassFilter, searchQuery]);

  // Filtered recordings
  const filteredRecordings = useMemo(() => {
    return liveRecordings.filter(r => {
      if (selectedClassFilter !== 'ALL' && r.className !== selectedClassFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.chapterTopic.toLowerCase().includes(q);
      }
      return true;
    });
  }, [liveRecordings, selectedClassFilter, searchQuery]);

  const handleStartClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please provide a class topic or title', 'warning');
      return;
    }

    const assignedTeacher = teachers[0]?.name || 'Lead Instructor';

    const session = startLiveClass({
      title: newTitle,
      className: newClass,
      subject: newSubject,
      teacherId: 't-lead',
      teacherName: assignedTeacher,
      scheduledTime: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Ongoing`,
      roomId: `room-${Date.now()}`,
      isRecording: autoRecordEnabled,
      academicYear: activeAcademicYear,
      chapterTopic: newTopic || 'Live Curriculum Pacing',
    });

    setIsStartModalOpen(false);
    setNewTitle('');
    setNewTopic('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: userRole === 'Student' ? 'You (Student)' : 'You (Instructor)',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleScanQr = (studentId: string) => {
    const student = students.find(s => s.id === studentId || s.rollNo === studentId);
    if (student) {
      joinLiveClassWithAutoAttendance(liveSessions[0]?.id || 'live-1', student.id);
      showToast(`QR Code verified for ${student.name} (Roll #${student.rollNo})!`, 'success');
      setQrScannedStudentId('');
    } else {
      showToast('Invalid QR code or student not found', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-28 min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-[#131b2e] flex items-center gap-2">
              <Video className="w-6 h-6 text-[#004ac6]" />
              <span>Live Class, Recordings & Pacing</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-[#bdffdb] text-[#002113] font-bold text-[10px] sm:text-xs rounded-full uppercase">
              Agora / Daily.co Engine
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686]">
            Start interactive live video sessions, auto-mark student attendance upon joining, and archive recordings class-wise.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="h-10 px-3.5 bg-white border border-[#dae2fd] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
          >
            <QrCode className="w-4 h-4 text-[#007d55]" />
            <span>QR Attendance</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={() => setIsStartModalOpen(true)}
              className="h-10 px-4 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Start Live Class</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE LIVE CLASSROOM SIMULATION (If any session is active) */}
      {activeLiveSession && (
        <div className="bg-[#131b2e] text-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border border-[#004ac6]/50 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse shrink-0">
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE CLASSROOM</span>
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">{activeLiveSession.title}</h3>
                <span className="text-xs text-white/70">
                  {activeLiveSession.className} • {activeLiveSession.subject} • {activeLiveSession.teacherName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-xs text-white/90">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>REC ON</span>
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#bdffdb] text-[#002113] rounded-full text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{activeLiveSession.attendeeStudentIds.length} Joined</span>
              </span>
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => endLiveClass(activeLiveSession.id)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
                >
                  End & Save Recording
                </button>
              )}
            </div>
          </div>

          {/* Video Stream + Classroom Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Stage Video / Whiteboard */}
            <div className="lg:col-span-2 bg-[#090d16] rounded-2xl overflow-hidden relative min-h-[260px] sm:min-h-[380px] flex flex-col justify-between p-3 border border-white/10">
              {isWhiteboardActive ? (
                <div className="w-full h-full bg-white text-[#131b2e] rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs font-bold text-[#004ac6] uppercase tracking-wider">Interactive Classroom Whiteboard</span>
                  <div className="w-full flex-1 border border-dashed border-[#dae2fd] rounded-xl flex items-center justify-center p-4 text-center text-xs text-[#737686]">
                    Teacher is drawing formulas and circuit diagrams live on screen...
                  </div>
                </div>
              ) : isVideoOff ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-2 text-white/60">
                  <VideoOff className="w-12 h-12" />
                  <span className="text-sm font-semibold">Camera is temporarily turned off</span>
                </div>
              ) : (
                <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80"
                    alt="Live Stream"
                    className="w-full h-full object-cover rounded-xl opacity-90"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    <span>HD 1080p • 60 FPS</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs text-white">
                    Instructor: {activeLiveSession.teacherName}
                  </div>
                </div>
              )}

              {/* Classroom Control Toolbar */}
              <div className="pt-3 flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Microphone"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-green-400" />}
                  <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isVideoOff ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Video Camera"
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-blue-400" />}
                  <span className="hidden sm:inline">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isScreenSharing ? 'bg-[#007d55] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Share Screen"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Screen Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                  className={`p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isWhiteboardActive ? 'bg-[#004ac6] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Whiteboard"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Whiteboard</span>
                </button>
              </div>
            </div>

            {/* Sidebar: Live Chat & Participants */}
            <div className="bg-[#182032] rounded-2xl p-3 sm:p-4 flex flex-col h-[320px] sm:h-auto border border-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('chat')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeSidebarTab === 'chat' ? 'bg-[#004ac6] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Live Chat ({chatMessages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('participants')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeSidebarTab === 'participants' ? 'bg-[#004ac6] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Attendees ({activeLiveSession.attendeeStudentIds.length})
                </button>
              </div>

              {activeSidebarTab === 'chat' ? (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-white/50">
                          <span className="font-bold text-[#bdffdb]">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed break-words">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Ask questions or type doubt..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 h-9 px-3 bg-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#004ac6] border border-white/10"
                    />
                    <button
                      type="submit"
                      className="w-9 h-9 bg-[#004ac6] text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                  <span className="text-[10px] text-white/60 block uppercase">
                    Auto-Marked Present Upon Joining:
                  </span>
                  {activeLiveSession.attendeeStudentIds.map(studentId => {
                    const st = students.find(s => s.id === studentId);
                    return (
                      <div key={studentId} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={st?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={st?.name || 'Student'}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <span className="font-semibold text-white truncate">{st?.name || studentId}</span>
                        </div>
                        <span className="text-[10px] bg-[#bdffdb] text-[#002113] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Present</span>
                        </span>
                      </div>
                    );
                  })}
                  {activeLiveSession.attendeeStudentIds.length === 0 && (
                    <div className="text-center py-6 text-white/50 text-xs">
                      No students joined yet. Students will be marked Present automatically as soon as they join.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs Strip */}
      <div className="bg-[#eaedff] p-1 rounded-2xl flex items-center shadow-inner overflow-x-auto no-scrollbar">
        {[
          { id: 'live-rooms', label: 'Live Classrooms', icon: <Radio className="w-4 h-4" />, count: liveSessions.length },
          { id: 'recordings-library', label: 'Class-Wise Video Library', icon: <Video className="w-4 h-4" />, count: liveRecordings.length },
          { id: 'offline-qr', label: 'QR Code Attendance Scanner', icon: <QrCode className="w-4 h-4" /> },
          { id: 'syllabus-tracker', label: 'Curriculum Pacing (%)', icon: <BookOpen className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 ${
              activeSubTab === tab.id ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#434655] hover:text-[#131b2e]'
            }`}
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubTab === tab.id ? 'bg-[#dbe1ff] text-[#00174b]' : 'bg-white/60 text-[#737686]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Universal Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#eaedff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Class Filter */}
          <div className="bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd] space-y-1">
            <label className="text-[10px] font-bold uppercase text-[#737686] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#004ac6]" />
              <span>Select Academic Class</span>
            </label>
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[#131b2e] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Classes & Sections ({classes.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-1 md:col-span-2 bg-[#f2f3ff] p-2.5 rounded-2xl border border-[#dae2fd] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#737686] shrink-0" />
            <input
              type="text"
              placeholder="Search lectures, subjects, topics, or faculty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#131b2e] focus:outline-none placeholder-[#737686]"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE CLASSROOMS */}
      {activeSubTab === 'live-rooms' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">
              Active & Scheduled Sessions ({filteredSessions.length})
            </h3>
            <span className="text-xs text-[#737686]">Academic Year: {activeAcademicYear}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSessions.map(session => {
              const isLive = session.status === 'live';

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                    isLive ? 'border-[#004ac6] ring-1 ring-[#004ac6]/30' : 'border-[#eaedff]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isLive ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-[#dbe1ff] text-[#00174b]'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>{session.status.toUpperCase()}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-[#737686] bg-[#f2f3ff] px-2 py-0.5 rounded-md">
                        {session.className}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-[#131b2e] leading-snug line-clamp-2">
                        {session.title}
                      </h4>
                      <p className="text-xs text-[#004ac6] font-semibold mt-1">
                        {session.subject}
                      </p>
                    </div>

                    <div className="bg-[#faf8ff] p-2.5 rounded-xl border border-[#dae2fd]/60 space-y-1 text-xs">
                      <div className="flex justify-between text-[#737686]">
                        <span>Instructor:</span>
                        <strong className="text-[#131b2e]">{session.teacherName}</strong>
                      </div>
                      <div className="flex justify-between text-[#737686]">
                        <span>Time Slot:</span>
                        <span className="text-[#131b2e]">{session.scheduledTime}</span>
                      </div>
                      <div className="flex justify-between text-[#737686]">
                        <span>Auto-Recording:</span>
                        <span className={session.isRecording ? 'text-green-600 font-bold' : 'text-gray-500'}>
                          {session.isRecording ? 'Enabled' : 'Off'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between gap-2">
                    <span className="text-xs text-[#737686] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#007d55]" />
                      <span>{session.attendeeStudentIds.length} Joined</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveLiveSession(session);
                        // If student role, join and auto mark attendance!
                        if (userRole === 'Student' && students[0]) {
                          joinLiveClassWithAutoAttendance(session.id, students[0].id);
                        } else {
                          showToast(`Joined Live Room: ${session.title}!`, 'success');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#1e3a8a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isLive ? 'Join Live Now' : 'Open Room'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSessions.length === 0 && (
            <div className="bg-white p-8 rounded-2xl text-center border border-[#eaedff] space-y-2">
              <Video className="w-10 h-10 text-[#737686] mx-auto opacity-50" />
              <p className="text-xs font-semibold text-[#737686]">No active or scheduled sessions for this class.</p>
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(true)}
                  className="px-4 py-2 bg-[#004ac6] text-white rounded-xl text-xs font-bold"
                >
                  Start New Session
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLASS-WISE VIDEO LIBRARY */}
      {activeSubTab === 'recordings-library' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">
              Saved Lecture Recordings ({filteredRecordings.length})
            </h3>
            <span className="text-xs text-[#737686]">Permanent Student Cloud Archive</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecordings.map(rec => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#eaedff] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Header with Play Button */}
                <div className="relative aspect-video bg-black/80 overflow-hidden group">
                  <img
                    src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPreviewRecording(rec)}
                      className="w-12 h-12 rounded-full bg-white/90 text-[#004ac6] flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    {rec.duration}
                  </span>
                  <span className="absolute top-2 left-2 bg-[#004ac6] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {rec.className}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] leading-snug line-clamp-2">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-[#004ac6] font-semibold">{rec.subject}</p>
                    <p className="text-[10px] text-[#737686] line-clamp-1">{rec.chapterTopic}</p>
                  </div>

                  <div className="pt-2 border-t border-[#eaedff] flex items-center justify-between text-[11px] text-[#737686]">
                    <span>{rec.date} • {rec.sizeMb} MB</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloaded lecture video & notes for "${rec.title}"!`, 'success')}
                        className="p-1.5 hover:bg-[#eaedff] text-[#004ac6] rounded-lg transition-colors"
                        title="Download Recording"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isTeacherOrAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete recording "${rec.title}"?`)) {
                              deleteLiveRecording(rec.id);
                            }
                          }}
                          className="p-1.5 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg transition-colors"
                          title="Delete Recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE QR CODE ATTENDANCE SCANNER */}
      {activeSubTab === 'offline-qr' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#eaedff] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff] pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">
                QR Code & Biometric Student Attendance Check-In
              </h3>
              <p className="text-xs text-[#737686]">
                Instant contactless attendance via student ID QR scanner or class check-in tablet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="px-4 py-2 bg-[#007d55] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Student Scanner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick QR Scanner Box */}
            <div className="bg-[#faf8ff] p-4 rounded-2xl border border-[#dae2fd] space-y-3">
              <span className="text-xs font-bold text-[#131b2e] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#004ac6]" />
                <span>Simulate Student QR Scan</span>
              </span>
              <p className="text-xs text-[#737686]">
                Enter student Roll Number or ID code to simulate contactless camera check-in:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 01, s1, s2..."
                  value={qrScannedStudentId}
                  onChange={e => setQrScannedStudentId(e.target.value)}
                  className="flex-1 h-9 px-3 bg-white rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                />
                <button
                  type="button"
                  onClick={() => handleScanQr(qrScannedStudentId)}
                  className="px-4 h-9 bg-[#004ac6] text-white rounded-xl text-xs font-bold"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Attendance Status Telemetry */}
            <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#dae2fd] space-y-2">
              <span className="text-xs font-bold text-[#131b2e] block">
                Today's Digital Register Sync
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Verified Today</span>
                  <span className="text-base font-extrabold text-[#007d55]">{students.length} / {students.length}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#dae2fd]">
                  <span className="text-[10px] text-[#737686] block">Method</span>
                  <span className="text-xs font-bold text-[#004ac6]">Live Auto + QR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYLLABUS & CURRICULUM PACING */}
      {activeSubTab === 'syllabus-tracker' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#eaedff] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#131b2e]">
                Syllabus Progress & Completion Tracking
              </h3>
              <p className="text-xs text-[#737686]">
                Target Mid-Term vs Actual Chapter Completion percentage across subjects.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#bdffdb] text-[#002113] rounded-full text-xs font-bold">
              {syllabus.statusText}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-[#f2f3ff] p-3.5 rounded-2xl border border-[#dae2fd] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#131b2e]">{syllabus.subject} ({syllabus.gradeLevel})</span>
                <strong className="text-[#004ac6]">{syllabus.overallCompletion}% Completed</strong>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#dae2fd]">
                <div
                  className="h-full bg-gradient-to-r from-[#004ac6] to-[#007d55] rounded-full transition-all duration-500"
                  style={{ width: `${syllabus.overallCompletion}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#737686]">
                <span>{syllabus.completedChapters} of {syllabus.totalChapters} Units Finished</span>
                <span>Periods Held: {syllabus.periodsHeld} / {syllabus.totalPeriods}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#131b2e] block">Chapter Breakdown:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {syllabus.chapters.map(chap => (
                  <div
                    key={chap.id}
                    className="p-3 rounded-xl border border-[#eaedff] bg-[#faf8ff] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-[#131b2e] block truncate">
                        Unit {chap.unitNumber}: {chap.name}
                      </span>
                      <span className="text-[10px] text-[#737686]">
                        {chap.completedPeriods} / {chap.allottedPeriods} Periods ({chap.status})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        chap.status === 'Completed'
                          ? 'bg-[#bdffdb] text-[#002113]'
                          : chap.status === 'In Progress'
                          ? 'bg-[#dbe1ff] text-[#00174b]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {chap.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* START LIVE CLASS MODAL */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 shadow-2xl border border-[#eaedff] text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#004ac6]" />
                <h3 className="font-bold text-base text-[#131b2e]">Start Live Classroom</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartClassSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Class Lecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Chapter 3: Laws of Motion"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Target Class</label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full h-10 px-2.5 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#737686]">Topic / Chapter Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Solving problem set 4.1 & numerical derivations"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#131b2e] pt-1">
                <input
                  type="checkbox"
                  checked={autoRecordEnabled}
                  onChange={e => setAutoRecordEnabled(e.target.checked)}
                  className="rounded text-[#004ac6]"
                />
                <span>Automatically Record & Save to Class Video Library</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2 bg-[#f2f3ff] text-[#434655] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
                >
                  Launch Live Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORDING PLAYBACK PREVIEW MODAL */}
      {previewRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#131b2e] text-white w-full max-w-3xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-left">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base truncate">{previewRecording.title}</h4>
                <span className="text-xs text-white/70">
                  {previewRecording.className} • {previewRecording.subject} • {previewRecording.teacherName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRecording(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video
                src={previewRecording.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span>Duration: {previewRecording.duration} • File Size: {previewRecording.sizeMb} MB</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Downloaded recording: ${previewRecording.title}`, 'success')}
                  className="px-3.5 py-1.5 bg-[#004ac6] text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRecording(null)}
                  className="px-3.5 py-1.5 bg-white/10 text-white rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE ATTENDANCE SCANNER MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#dae2fd] text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#007d55]" />
                <h3 className="font-bold text-base text-[#131b2e]">Scan Student Attendance QR</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Scanner Mock Viewfinder */}
            <div className="relative aspect-square max-w-[240px] mx-auto rounded-2xl bg-black/90 p-4 flex flex-col items-center justify-center border-2 border-dashed border-[#007d55]">
              <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode className="w-32 h-32 text-[#131b2e]" />
              </div>
              <span className="text-[10px] text-white/80 mt-3 animate-pulse">
                Align student QR badge inside frame
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#737686]">Or Enter Roll Number / Student ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 01, s1..."
                  value={qrScannedStudentId}
                  onChange={e => setQrScannedStudentId(e.target.value)}
                  className="flex-1 h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleScanQr(qrScannedStudentId);
                    setIsQrModalOpen(false);
                  }}
                  className="h-10 px-4 bg-[#007d55] text-white rounded-xl text-xs font-bold active:scale-95"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
