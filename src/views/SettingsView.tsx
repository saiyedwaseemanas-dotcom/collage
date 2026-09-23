import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    academicSession,
    setAcademicSession,
    showToast,
    isTwoWaySyncActive,
    setIsTwoWaySyncActive,
    setIsApkModalOpen,
  } = useApp();

  const [schoolName, setSchoolName] = useState('Delhi Public School, Sector 4');
  const [affiliationNo, setAffiliationNo] = useState('CBSE/AFF/2130492');
  const [defaulterThreshold, setDefaulterThreshold] = useState('75');
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'EduTrack Alert: Daily attendance update for {student_name}. Status: {status}. Date: {date}. DPS Sector 4.'
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('School configuration & grading policies saved successfully!');
  };

  const handleBackupJson = () => {
    showToast('Complete school database backup downloaded (JSON)');
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-4xl mx-auto text-left pb-24">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">System Settings</h2>
        <p className="text-xs text-[#737686]">Academic governance, CBSE statutory limits, and WhatsApp notification gateways.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Institution Info */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">domain</span>
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Institution Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">CBSE Affiliation Code</label>
              <input
                type="text"
                value={affiliationNo}
                onChange={e => setAffiliationNo(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">Active Academic Session</label>
              <select
                value={academicSession}
                onChange={e => setAcademicSession(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-semibold border border-[#dae2fd]"
              >
                <option>2024 - 2025 (Term 2)</option>
                <option>2024 - 2025 (Term 1)</option>
                <option>2023 - 2024 (Annual)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">CBSE Defaulter Limit (%)</label>
              <input
                type="number"
                value={defaulterThreshold}
                onChange={e => setDefaulterThreshold(e.target.value)}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Gateway */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#007d55] text-[20px]">chat</span>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Parent WhatsApp Broadcast Gateway</h3>
            </div>
            <span className="px-2 py-0.5 bg-[#bdffdb] text-[#002113] rounded-full text-[10px] font-bold">Connected</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-[#737686]">Default SMS & WhatsApp Template</label>
            <textarea
              rows={3}
              value={whatsappTemplate}
              onChange={e => setWhatsappTemplate(e.target.value)}
              className="w-full p-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
            />
            <span className="text-[10px] text-[#737686]">Placeholders: &#123;student_name&#125;, &#123;status&#125;, &#123;date&#125;, &#123;attendance_pct&#125;</span>
          </div>
        </div>

        {/* Database & Google Drive Cloud Backup */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">cloud_sync</span>
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Cloud Database & Backup</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
            <div>
              <span className="text-xs font-bold text-[#131b2e] block">Live Google Sheets Webhook Listener</span>
              <span className="text-[11px] text-[#737686]">Synchronize marks and daily registers in real-time</span>
            </div>
            <input
              type="checkbox"
              checked={isTwoWaySyncActive}
              onChange={e => setIsTwoWaySyncActive(e.target.checked)}
              className="w-5 h-5 rounded text-[#004ac6] accent-[#004ac6]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleBackupJson}
              className="h-10 px-4 bg-[#eaedff] hover:bg-[#dae2fd] text-[#004ac6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Full JSON Database
            </button>
          </div>
        </div>

        {/* Mobile App & APK Generator Hub */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#007d55] text-[20px]">android</span>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Android App & APK Build Engine</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-[#bdffdb] text-[#002113] rounded-full text-[10px] font-bold">
              Capacitor & PWA Ready
            </span>
          </div>

          <p className="text-xs text-[#737686]">
            Generate native Android APK packages for direct sideloading or deployment to school faculty tablets.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsApkModalOpen(true)}
              className="h-10 px-4 bg-gradient-to-r from-[#004ac6] to-[#1d2d5a] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm hover:opacity-95 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00d68f]">build</span>
              Open APK Generator & CLI Commands
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save All Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
