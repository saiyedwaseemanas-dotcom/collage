import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen, userRole, setUserRole, showToast, setIsApkModalOpen } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Critical Attendance Defaulter', desc: 'Kabir Mehta (10-B) dipped to 71.4%', time: '10m ago', unread: true },
    { id: '2', title: 'Syllabus Delay Alert', desc: 'Physics Ch. 4 (Class 10-B) 12 days behind', time: '1h ago', unread: true },
    { id: '3', title: 'Google Sheets Auto-Sync', desc: '40 Student marks imported successfully', time: '2h ago', unread: false },
  ];

  return (
    <header className="fixed top-0 w-full z-40 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-[#eaedff]">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Drawer Trigger + Brand */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Open menu"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#131b2e] hover:bg-[#f2f3ff] transition-colors active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[16px] text-[#131b2e] leading-tight tracking-tight">EduTrack</span>
                <span className="text-[11px] font-bold text-[#004ac6] bg-[#dbe1ff] px-1.5 py-0.2 rounded">PRO</span>
              </div>
              <span className="text-[10px] leading-3 text-[#737686] font-medium">DPS, Sector 4</span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* In-App PWA Install / APK Button */}
          <PWAInstallButton onOpenApkModal={() => setIsApkModalOpen(true)} />

          {/* Role Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 h-8 pl-2.5 pr-1.5 bg-[#eaedff] rounded-full text-[#131b2e] hover:bg-[#e2e7ff] transition-all text-xs font-semibold"
              type="button"
            >
              <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse"></span>
              <span>{userRole}</span>
              <span className="material-symbols-outlined text-[16px] text-[#737686]">arrow_drop_down</span>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-[#dae2fd] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#737686] tracking-wider">Switch View Mode</div>
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
                    {userRole === role && <span className="material-symbols-outlined text-[16px]">check</span>}
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
              className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#434655] hover:bg-[#f2f3ff] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#dae2fd] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                  <span className="font-semibold text-xs text-[#131b2e]">Urgent Notifications</span>
                  <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-1.5 py-0.5 rounded-full">2 Unread</span>
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
                  className="w-full mt-2 text-center text-[11px] font-semibold text-[#004ac6] py-1 rounded hover:bg-[#f2f3ff]"
                >
                  Mark All as Read
                </button>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center">
            <img
              alt="Profile Dr. Anita Roy"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#004ac6]/20 shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHjnfW0yD4P0JPB3pCJ8PvHI9VdRb2yr8Uaoib1V1D0SD7h-f1dSFY2rMXl9PP58IK3jJXKMqNrYLuXFSvhtN82V_qaE3gNo89VF9f9JuAuoDjW2OORZ1NI3KkSPLZ05a3hTO6XuiqShgR-PLjxuBOd5a16_0RtINVa0xAbUuhvnKk-UkbEEN2UZFFY7Dluql-5eL0SGWewPuxfBKozgrYjH8eTqaryMyeRomqQ_-p_6F8LHOlQgau"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
