import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { ScheduleSyncModal } from './components/ScheduleSyncModal';
import { ApkBuildModal } from './components/ApkBuildModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExportDispatchModal } from './components/ExportDispatchModal';

import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { SyllabusView } from './views/SyllabusView';
import { MarksView } from './views/MarksView';
import { SheetsSyncView } from './views/SheetsSyncView';
import { StudentsDirectoryView } from './views/StudentsDirectoryView';
import { TeachersRegisterView } from './views/TeachersRegisterView';
import { SettingsView } from './views/SettingsView';
import { InstitutionCustomizerView } from './views/InstitutionCustomizerView';

const MainContent: React.FC = () => {
  const { activeTab, isApkModalOpen, setIsApkModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] antialiased">
      {/* Top Fixed Header */}
      <Header />

      {/* Left Navigation Drawer */}
      <NavigationDrawer />

      {/* Main View Area */}
      <main className="flex-1 pt-16 pb-20 w-full overflow-x-hidden">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'attendance' && <AttendanceView />}
        {activeTab === 'syllabus' && <SyllabusView />}
        {activeTab === 'exams' && <MarksView />}
        {activeTab === 'sync' && <SheetsSyncView />}
        {activeTab === 'students' && <StudentsDirectoryView />}
        {activeTab === 'teachers' && <TeachersRegisterView />}
        {activeTab === 'branding' && <InstitutionCustomizerView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Toast Feedback */}
      <Toast />

      {/* Global Modals */}
      <ScheduleSyncModal />
      <ApkBuildModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
      <ExportDispatchModal />

      {/* Offline Status */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
