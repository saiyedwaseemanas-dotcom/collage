import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

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
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'students', label: 'Students Directory', icon: 'group' },
    { id: 'teachers', label: 'Teachers Register', icon: 'badge' },
    { id: 'attendance', label: 'Take Attendance', icon: 'fact_check' },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: 'menu_book' },
    { id: 'exams', label: 'Marks & Exams', icon: 'military_tech' },
    { id: 'sync', label: 'Google Sheets Sync', icon: 'sync_alt' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
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
        className={`fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1)] transition-transform duration-300 ease-in-out flex flex-col pt-safe ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[16px] text-[#131b2e]">EduTrack</span>
                <span className="text-[11px] font-bold text-[#004ac6]">PRO</span>
              </div>
              <span className="text-[10px] text-[#737686]">DPS, Sector 4</span>
            </div>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setIsDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#737686] hover:bg-[#f2f3ff] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Academic Session Selector */}
        <div className="p-3">
          <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#dae2fd]/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] block mb-1">
              Academic Session
            </span>
            <div className="flex items-center justify-between text-xs font-semibold text-[#131b2e]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6]">school</span>
                {academicSession}
              </span>
              <button
                onClick={() => {
                  const nextSession = academicSession.includes('Term 2') ? '2024 - 2025 (Term 1)' : '2024 - 2025 (Term 2)';
                  setAcademicSession(nextSession);
                  showToast(`Session switched to ${nextSession}`);
                }}
                className="p-1 hover:bg-[#dae2fd] rounded text-[#737686] transition-colors"
                title="Toggle Term"
              >
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>
              </button>
            </div>
          </div>
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
                    ? 'bg-[#dbe1ff] text-[#004ac6] font-bold shadow-sm'
                    : 'text-[#434655] hover:bg-[#f2f3ff] hover:text-[#131b2e]'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#004ac6]' : 'text-[#737686]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'sync' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#007d55] animate-pulse" title="Bi-directional Webhook Active"></span>
                )}
                {item.id === 'attendance' && (
                  <span className="ml-auto bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold px-1.5 py-0.2 rounded-full">2 Alert</span>
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
              className="w-full flex items-center justify-between px-3 h-11 rounded-xl text-xs font-bold bg-gradient-to-r from-[#004ac6] to-[#1d2d5a] text-white shadow-md active:scale-95 transition-all"
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#00d68f]">android</span>
                <span>Build Android APK</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">.apk</span>
            </button>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#eaedff] pb-safe bg-[#faf8ff]">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white shadow-sm border border-[#eaedff]">
            <img
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-[#004ac6]/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHjnfW0yD4P0JPB3pCJ8PvHI9VdRb2yr8Uaoib1V1D0SD7h-f1dSFY2rMXl9PP58IK3jJXKMqNrYLuXFSvhtN82V_qaE3gNo89VF9f9JuAuoDjW2OORZ1NI3KkSPLZ05a3hTO6XuiqShgR-PLjxuBOd5a16_0RtINVa0xAbUuhvnKk-UkbEEN2UZFFY7Dluql-5eL0SGWewPuxfBKozgrYjH8eTqaryMyeRomqQ_-p_6F8LHOlQgau"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-[#131b2e] truncate">Dr. Anita Roy</span>
              <span className="text-[10px] text-[#737686] truncate">principal@dpssec4.edu</span>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => showToast('Session locked. Re-authenticate to access.')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#737686] hover:bg-[#f2f3ff] hover:text-[#ba1a1a] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
