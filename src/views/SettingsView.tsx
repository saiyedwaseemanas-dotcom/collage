import React from 'react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    academicSession,
    setAcademicSession,
    showToast,
    isTwoWaySyncActive,
    setIsTwoWaySyncActive,
    setIsApkModalOpen,
    institution,
    updateInstitution,
    setActiveTab,
    openDispatchModal,
    students,
    teachers,
    syllabus,
  } = useApp();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('School configuration & grading policies saved to database!');
  };

  const handleExportJson = () => {
    const fullBackup = {
      institution,
      academicSession,
      students,
      teachers,
      syllabus,
      backupTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${institution.shortName.toLowerCase().replace(/\s+/g, '_')}_master_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Complete school database backup downloaded (JSON)');
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-4xl mx-auto text-left pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">System Settings & Governance</h2>
          <p className="text-xs text-[#737686]">Academic governance, CBSE statutory limits, and WhatsApp notification gateways.</p>
        </div>
        <button
          onClick={() => setActiveTab('branding')}
          className="h-10 px-4 bg-[#004ac6] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>School Branding Customizer</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Institution Info */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">domain</span>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Active Institution Profile</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className="text-[#004ac6] text-xs font-bold hover:underline"
            >
              Switch Preset / Rebrand
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">Institution Name</label>
              <input
                type="text"
                value={institution.name}
                onChange={e => updateInstitution({ name: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">Affiliation / Accreditation</label>
              <input
                type="text"
                value={institution.affiliationCode}
                onChange={e => updateInstitution({ affiliationCode: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">Principal / Chancellor Name</label>
              <input
                type="text"
                value={institution.principalName}
                onChange={e => updateInstitution({ principalName: e.target.value })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] border border-[#dae2fd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-[#737686]">Defaulter Limit (%)</label>
              <input
                type="number"
                value={institution.defaulterThreshold}
                onChange={e => updateInstitution({ defaulterThreshold: parseInt(e.target.value) || 75 })}
                className="w-full h-10 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono border border-[#dae2fd]"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Gateway */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#007d55] text-[20px]">chat</span>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Parent WhatsApp Broadcast Gateway</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-[#bdffdb] text-[#002113] rounded-full text-[10px] font-bold">Connected</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-[#737686]">Default WhatsApp & SMS Template</label>
            <textarea
              rows={3}
              value={institution.whatsappTemplate}
              onChange={e => updateInstitution({ whatsappTemplate: e.target.value })}
              className="w-full p-3 bg-[#f2f3ff] rounded-2xl text-xs text-[#131b2e] border border-[#dae2fd]"
            />
            <span className="text-[10px] text-[#737686]">Placeholders: &#123;student_name&#125;, &#123;school_name&#125;, &#123;status&#125;, &#123;attendance_pct&#125;</span>
          </div>
        </div>

        {/* Database & Google Drive Cloud Backup */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f3ff]">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">cloud_sync</span>
            <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Cloud Database & Instant Exports</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50">
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

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJson}
              className="h-10 px-4 bg-[#eaedff] hover:bg-[#dae2fd] text-[#004ac6] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Full JSON Database
            </button>
            <button
              type="button"
              onClick={() =>
                openDispatchModal({
                  title: 'Complete System Data Push',
                  reportCategory: 'master-audit',
                  defaultFormat: 'excel',
                  defaultRecipientType: 'principal',
                })
              }
              className="h-10 px-4 bg-[#007d55] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Push PDF / Excel / WhatsApp to Principal
            </button>
          </div>
        </div>

        {/* Mobile App & APK Generator Hub */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#eaedff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#007d55] text-[20px]">android</span>
              <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Android App & APK Build Engine</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-[#bdffdb] text-[#002113] rounded-full text-[10px] font-bold">
              Java 21 Ready
            </span>
          </div>

          <p className="text-xs text-[#737686]">
            Generate native Android APK packages customized for any school or college client.
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
