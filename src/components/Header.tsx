import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Send,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Bell,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  GraduationCap,
  Users,
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    userRole,
    setUserRole,
    showToast,
    institution,
    openDispatchModal,
    setActiveTab,
    academicSessions,
    activeAcademicYear,
    setActiveAcademicYear,
    setIsAcademicSessionModalOpen,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Curriculum Updated', desc: 'Dr. Sharma updated Science syllabus for Class 10-A', time: '5m ago', unread: true },
    { id: '2', title: 'Attendance Auto-Marked', desc: '28 students checked in via register & QR scan', time: '15m ago', unread: true },
    { id: '3', title: 'Google Sheets Synced', desc: 'All student marks & fee ledger updated live', time: '1h ago', unread: false },
  ];

  const rolesList: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    { role: 'Super Admin', label: 'Super Admin', desc: 'Full institutional control', icon: <SlidersHorizontal className="w-3.5 h-3.5 text-[#004ac6]" /> },
    { role: 'Teacher / Faculty', label: 'Teacher / Faculty', desc: 'Curriculum & attendance', icon: <UserCheck className="w-3.5 h-3.5 text-[#007d55]" /> },
    { role: 'Student', label: 'Student Portal', desc: 'View grades & notices', icon: <GraduationCap className="w-3.5 h-3.5 text-[#b78103]" /> },
    { role: 'Parent', label: 'Parent Portal', desc: 'Fee payments & performance', icon: <Users className="w-3.5 h-3.5 text-[#ba1a1a]" /> },
  ];

  const isFaculty = userRole === 'Teacher / Faculty';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-[#eaedff]">
      <div className="h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 max-w-7xl mx-auto">
        {/* Left: Drawer Trigger + Dynamic Institution Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            aria-label="Open menu"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#131b2e] hover:bg-[#f2f3ff] transition-colors active:scale-95 shrink-0"
            type="button"
          >
            <Menu className="w-5 h-5 text-[#131b2e]" />
          </button>

          <div
            className="flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => setActiveTab('branding')}
            title="Click to customize School / College Branding"
          >
            <img
              src={institution.logoUrl}
              alt={institution.shortName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-[#dae2fd] shadow-xs shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs sm:text-sm text-[#131b2e] leading-tight tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[200px]">
                  {institution.shortName}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff] px-1 sm:px-1.5 py-0.2 rounded shrink-0">
                  PRO
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] leading-3 text-[#737686] font-medium truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                {institution.boardName.split(' ')[0]} • EduManager
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Academic Year Switcher + Role Switcher + Push Report + Notifications */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-wrap justify-end">
          {/* Module 1: Academic Year Switcher */}
          <div className="relative">
            {isFaculty ? (
              // Faculty mode: Locked auto session!
              <div
                className="flex items-center gap-1 h-8 px-2.5 bg-amber-50 border border-amber-200 rounded-full text-amber-900 text-[10px] sm:text-xs font-semibold cursor-default"
                title="Faculty login is permanently locked to current active academic session (automatic)"
              >
                <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="font-bold">{activeAcademicYear}</span>
                <span className="hidden md:inline text-[9px] text-amber-700 bg-amber-100 px-1 rounded">Auto</span>
              </div>
            ) : (
              // Super Admin / Student / Parent: Interactive Switcher + Manage Modal
              <>
                <button
                  type="button"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="flex items-center gap-1 h-8 pl-2 pr-1.5 sm:pl-2.5 sm:pr-2 bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#dae2fd] rounded-full text-[#131b2e] transition-all text-[10px] sm:text-xs font-bold active:scale-95"
                  title="Switch Academic Year (Filters all data)"
                >
                  <Calendar className="w-3 h-3 text-[#004ac6]" />
                  <span>{activeAcademicYear}</span>
                  <ChevronDown className="w-3 h-3 text-[#737686]" />
                </button>

                {showYearDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#dae2fd] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#737686] tracking-wider border-b border-[#eaedff]">
                      Academic Year Filter
                    </div>
                    {academicSessions.map(session => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => {
                          setActiveAcademicYear(session.name);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f2f3ff] transition-colors ${
                          activeAcademicYear === session.name ? 'text-[#004ac6] font-bold bg-[#f2f3ff]' : 'text-[#131b2e]'
                        }`}
                      >
                        <div>
                          <span className="block font-semibold">{session.name}</span>
                          <span className="text-[10px] text-[#737686]">{session.termName || session.status}</span>
                        </div>
                        {activeAcademicYear === session.name && <Check className="w-4 h-4 text-[#004ac6]" />}
                      </button>
                    ))}
                    <div className="pt-1 border-t border-[#eaedff] px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowYearDropdown(false);
                          setIsAcademicSessionModalOpen(true);
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-[#004ac6] hover:bg-[#f2f3ff] rounded-lg transition-colors"
                      >
                        + Manage Sessions (CRUD)
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Role Switcher (4 Logins: Super Admin, Teacher, Student, Parent) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 h-8 pl-2 pr-1.5 sm:pl-2.5 sm:pr-2 bg-[#eaedff] rounded-full text-[#131b2e] hover:bg-[#e2e7ff] transition-all text-[11px] sm:text-xs font-semibold active:scale-95"
              type="button"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#007d55] animate-pulse"></span>
              <span className="truncate max-w-[85px] xs:max-w-[120px]">{userRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737686]" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#dae2fd] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#737686] tracking-wider border-b border-[#eaedff]">
                  Switch Role / Login Mode
                </div>
                {rolesList.map(item => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setUserRole(item.role);
                      setShowRoleDropdown(false);
                      showToast(`Switched active view to ${item.role} Mode`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f2f3ff] transition-colors ${
                      userRole === item.role ? 'text-[#004ac6] font-bold bg-[#f2f3ff]' : 'text-[#131b2e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div>
                        <span className="block font-bold">{item.label}</span>
                        <span className="text-[10px] text-[#737686] block leading-tight">{item.desc}</span>
                      </div>
                    </div>
                    {userRole === item.role && <Check className="w-4 h-4 text-[#004ac6] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Push Button: Quick PDF / Excel / WhatsApp Dispatch */}
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Instant Document & WhatsApp Dispatch',
                reportCategory: 'master-audit',
                defaultFormat: 'sheets',
                defaultRecipientType: 'principal',
              })
            }
            className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
            type="button"
            title="Export Google Sheets and send via WhatsApp / Email"
          >
            <Send className="w-3 h-3" />
            <span>Push Report</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[#434655] hover:bg-[#f2f3ff] transition-colors active:scale-95"
              type="button"
            >
              <Bell className="w-4 h-4 text-[#131b2e]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#004ac6]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#dae2fd] py-2 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                <div className="px-4 py-1.5 border-b border-[#eaedff] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#131b2e]">Live Academic Feeds</span>
                  <span className="text-[10px] text-[#004ac6] font-semibold">2 New</span>
                </div>
                <div className="divide-y divide-[#eaedff] max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-[#f2f3ff] transition-colors cursor-pointer text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#131b2e]">{n.title}</span>
                        <span className="text-[10px] text-[#737686]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#434655] mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
