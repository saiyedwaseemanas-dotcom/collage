import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { LayoutDashboard, CalendarCheck, BookOpen, Award, RefreshCw } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'exams', label: 'Exams', icon: <Award className="w-5 h-5" /> },
    { id: 'sync', label: 'Sync', icon: <RefreshCw className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 pb-safe bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.06)] border-t border-[#eaedff]">
      <div className="flex justify-around items-center h-14 sm:h-16 px-1 sm:px-2 max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#004ac6] font-bold bg-[#eaedff]/70'
                  : 'text-[#5f6377] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              <div className={`transition-transform duration-150 ${isActive ? 'scale-110 text-[#004ac6]' : 'text-[#737686]'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#004ac6]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
