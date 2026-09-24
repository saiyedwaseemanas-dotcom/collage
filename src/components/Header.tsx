import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Send, SlidersHorizontal, ChevronDown, Check, Bell } from 'lucide-react';

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
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Attendance Alert', desc: 'Kabir Mehta dipped below required threshold', time: '10m ago', unread: true },
    { id: '2', title: 'Curriculum Update', desc: 'Physics Unit 4 pending completion review', time: '1h ago', unread: true },
    { id: '3', title: 'Master Spreadsheet Synced', desc: 'All student marks recalculated & verified', time: '2h ago', unread: false },
  ];

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
                <span className="font-bold text-xs sm:text-sm text-[#131b2e] leading-tight tracking-tight truncate max-w-[120px] xs:max-w-[170px] sm:max-w-[240px]">
                  {institution.shortName}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#004ac6] bg-[#dbe1ff] px-1 sm:px-1.5 py-0.2 rounded shrink-0">
                  PRO
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] leading-3 text-[#737686] font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px]">
                {institution.boardName.split(' ')[0]} • {institution.academicSession}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Push Dispatch + Branding Shortcut + Role Switcher + Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Push Button: Quick PDF / Excel / WhatsApp Dispatch */}
          <button
            onClick={() =>
              openDispatchModal({
                title: 'Instant Document & WhatsApp Dispatch',
                reportCategory: 'master-audit',
                defaultFormat: 'pdf',
                defaultRecipientType: 'principal',
              })
            }
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
            type="button"
            title="Export PDF / Excel / Google Sheets and send via WhatsApp / Email"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Push Report</span>
          </button>

          {/* White-Label Customizer Shortcut button */}
          <button
            onClick={() => setActiveTab('branding')}
            className="hidden md:flex items-center gap-1 h-9 px-2.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl text-xs font-bold transition-all border border-[#dae2fd]"
            type="button"
            title="School Branding Customizer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#004ac6]" />
            <span>Schools & Branding</span>
          </button>

          {/* Role Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 h-8 pl-2 pr-1.5 sm:pl-2.5 sm:pr-2 bg-[#eaedff] rounded-full text-[#131b2e] hover:bg-[#e2e7ff] transition-all text-[11px] sm:text-xs font-semibold active:scale-95"
              type="button"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#007d55] animate-pulse"></span>
              <span>{userRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737686]" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#dae2fd] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#737686] tracking-wider">
                  Switch View Mode
                </div>
                {(['Admin', 'Teacher', 'Principal'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setShowRoleDropdown(false);
                      showToast(`Switched active view to ${role} Mode`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#f2f3ff] transition-colors ${
                      userRole === role ? 'text-[#004ac6] font-bold bg-[#f2f3ff]' : 'text-[#131b2e]'
                    }`}
                  >
                    <span>{role} Mode</span>
                    {userRole === role && <Check className="w-4 h-4 text-[#004ac6]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[#434655] hover:bg-[#f2f3ff] transition-colors active:scale-95"
              type="button"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#dae2fd] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                  <span className="font-semibold text-xs text-[#131b2e]">Urgent Notifications</span>
                  <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-1.5 py-0.5 rounded-full">
                    2 Unread
                  </span>
                </div>
                <div className="space-y-2 pt-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        showToast(`Opened: ${n.title}`);
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#131b2e] truncate">{n.title}</span>
                        <span className="text-[10px] text-[#737686]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#434655] mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    showToast('All notifications marked as read');
                    setShowNotifications(false);
                  }}
                  className="w-full mt-2 text-center text-[11px] font-semibold text-[#004ac6] py-1.5 rounded-lg hover:bg-[#f2f3ff] transition-colors"
                >
                  Mark All as Read
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
