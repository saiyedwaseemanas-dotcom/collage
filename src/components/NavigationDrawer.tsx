import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  Award,
  RefreshCw,
  Palette,
  Settings,
  X,
  GraduationCap,
  ChevronsUpDown,
  Send,
  Smartphone,
  LogOut,
  UserCheck,
  Layers,
  BookmarkCheck,
} from 'lucide-react';

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    activeTab,
    setActiveTab,
    academicSession,
    setAcademicSession,
    showToast,
    setIsApkModalOpen,
    setIsClassModalOpen,
    setIsSubjectModalOpen,
    institution,
    openDispatchModal,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'students', label: 'Students Database', icon: <Users className="w-5 h-5" /> },
    { id: 'teachers', label: 'Faculty & Staff Roster', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'attendance', label: 'Daily Attendance Ledger', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'syllabus', label: 'Curriculum & Syllabus', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'exams', label: 'Marks & Report Cards', icon: <Award className="w-5 h-5" /> },
    { id: 'sync', label: 'Google Sheets & Webhook', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'branding', label: 'Schools & Campuses', icon: <Palette className="w-5 h-5" />, badge: 'Client' },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#283044]/40 backdrop-blur-[2px] z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Body */}
      <aside
        className={`fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col pt-safe ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top dynamic brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#eaedff]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={institution.logoUrl}
              alt={institution.shortName}
              className="w-9 h-9 rounded-xl object-cover border border-[#dae2fd] shadow-xs shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[15px] text-[#131b2e] truncate">{institution.shortName}</span>
                <span className="text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff] px-1.5 py-0.2 rounded shrink-0">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#737686] truncate">
                {institution.boardName.split(' ')[0]} • {institution.category}
              </span>
            </div>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setIsDrawerOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#737686] hover:bg-[#f2f3ff] transition-colors shrink-0"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Session Selector */}
        <div className="p-3">
          <div className="bg-[#f2f3ff] p-3 rounded-2xl border border-[#dae2fd]/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] block mb-1">
              Academic Session
            </span>
            <div className="flex items-center justify-between text-xs font-semibold text-[#131b2e]">
              <span className="flex items-center gap-1.5 truncate">
                <GraduationCap className="w-4 h-4 text-[#004ac6] shrink-0" />
                <span className="truncate">{academicSession}</span>
              </span>
              <button
                onClick={() => {
                  const nextSession = academicSession.includes('Term 2') ? '2024 - 2025 (Term 1)' : '2024 - 2025 (Term 2)';
                  setAcademicSession(nextSession);
                  showToast(`Session switched to ${nextSession}`);
                }}
                className="p-1 hover:bg-[#dae2fd] rounded-lg text-[#737686] transition-colors shrink-0"
                title="Toggle Term"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Academic Hierarchy Modals (Senior KG to PhD) */}
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsClassModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 h-9 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] rounded-xl text-[11px] font-bold border border-[#dae2fd] active:scale-95 transition-all"
            type="button"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Classes</span>
          </button>

          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsSubjectModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 h-9 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#007d55] rounded-xl text-[11px] font-bold border border-[#dae2fd] active:scale-95 transition-all"
            type="button"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Manage Subjects</span>
          </button>
        </div>

        {/* Push Document & WhatsApp Quick Action Bar */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              openDispatchModal({
                title: 'Push Report & Dispatch',
                reportCategory: 'master-audit',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
              });
            }}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            type="button"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Push Report (PDF/Excel/WA)</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 h-11 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#dbe1ff] text-[#004ac6] font-bold shadow-xs'
                    : 'text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                }`}
              >
                <div className={isActive ? 'text-[#004ac6]' : 'text-[#737686]'}>
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-[#007d55]/15 text-[#007d55] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.id === 'sync' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#007d55] animate-pulse" title="Live Google Sheets Connected"></span>
                )}
              </button>
            );
          })}

          {/* Android APK Build Shortcut */}
          <div className="pt-2 pb-1">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setIsApkModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 h-11 rounded-xl text-xs font-bold bg-[#faf8ff] border border-[#dae2fd] text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-all"
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-[#007d55] shrink-0" />
                <span>Build Android APK</span>
              </div>
              <span className="text-[10px] bg-[#dbe1ff] text-[#004ac6] px-2 py-0.5 rounded-full font-mono font-bold">
                Java 21
              </span>
            </button>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#eaedff] pb-safe bg-[#faf8ff]">
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white shadow-xs border border-[#eaedff]">
            <img
              alt={institution.principalName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-[#004ac6]/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHjnfW0yD4P0JPB3pCJ8PvHI9VdRb2yr8Uaoib1V1D0SD7h-f1dSFY2rMXl9PP58IK3jJXKMqNrYLuXFSvhtN82V_qaE3gNo89VF9f9JuAuoDjW2OORZ1NI3KkSPLZ05a3hTO6XuiqShgR-PLjxuBOd5a16_0RtINVa0xAbUuhvnKk-UkbEEN2UZFFY7Dluql-5eL0SGWewPuxfBKozgrYjH8eTqaryMyeRomqQ_-p_6F8LHOlQgau"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-[#131b2e] truncate">{institution.principalName}</span>
              <span className="text-[10px] text-[#737686] truncate">{institution.principalDesignation}</span>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => showToast('Session locked. Re-authenticate to access.')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#737686] hover:bg-[#f2f3ff] hover:text-[#ba1a1a] transition-colors"
              type="button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
