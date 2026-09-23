import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SheetsSyncView: React.FC = () => {
  const {
    isMasterSheetConnected,
    setIsMasterSheetConnected,
    isTwoWaySyncActive,
    setIsTwoWaySyncActive,
    lastSyncTime,
    triggerManualSync,
    isSyncing,
    sheetUrl,
    setSheetUrl,
    importRecords,
    isImporting,
    importProgress,
    exportAllTabs,
    isExporting,
    webhookLogs,
    fireMockWebhook,
    showToast,
  } = useApp();

  const [activeSyncTab, setActiveSyncTab] = useState<'import' | 'export'>('import');
  const [selectedReportClass, setSelectedReportClass] = useState('Class 10-A (General)');
  const [selectedReportType, setSelectedReportType] = useState('Combined 360° Matrix');
  const [showWebhookLogs, setShowWebhookLogs] = useState(true);

  const handleClearUrl = () => {
    setSheetUrl('');
    showToast('Spreadsheet URL cleared');
  };

  const handlePasteMockUrl = () => {
    setSheetUrl('https://docs.google.com/spreadsheets/d/1X9_EDUTrack_DPS4_Roster_2024/edit#gid=0');
    showToast('Pasted master spreadsheet link from clipboard');
  };

  const handleDefaultersAlert = () => {
    showToast('SMS & WhatsApp reminders queued for Roll 08 & Roll 29');
  };

  const handleRemedySyllabus = () => {
    showToast('Remedial lesson schedule draft prepared for Physics Ch. 4');
  };

  const handleChannelExport = (channel: string) => {
    if (channel === 'PDF') {
      showToast('Consolidated 360° Telemetry PDF generated & downloaded');
    } else if (channel === 'Sheets') {
      showToast('Report metrics pushed to Google Drive Sheets archive');
    } else if (channel === 'WhatsApp') {
      showToast('Dispatched summary brief to Parents Broadcast Group');
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-3 space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Category Tagline & Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#004ac6]">
          <span>Integrations & Analytics</span>
          <span className="w-1 h-1 rounded-full bg-[#c3c6d7]"></span>
          <span className="text-[#737686]">Cloud Data Pipeline</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Sheets Sync & Reports</h2>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] font-bold text-xs shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse"></span>
            v2.4 Active
          </span>
        </div>
      </div>

      {/* Master Google Sheet Connected Card */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] relative overflow-hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55] shadow-sm">
              <span className="material-symbols-outlined text-[24px]">table_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#007d55] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007d55] animate-ping"></span>
                  Master Google Sheet Connected
                </span>
              </div>
              <span className="text-sm font-bold text-[#131b2e] block truncate max-w-[220px] sm:max-w-md">
                EduTrack_Pro_Master_Database_2024.xlsx
              </span>
            </div>
          </div>

          {/* Live Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isTwoWaySyncActive}
              onChange={e => {
                setIsTwoWaySyncActive(e.target.checked);
                showToast(
                  e.target.checked
                    ? 'Live two-way real-time listener active'
                    : 'Two-way sync paused. Offline mode on'
                );
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#eaedff] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
          </label>
        </div>

        {/* Auto Sync Pulse Box */}
        <div className="bg-[#f2f3ff] rounded-xl p-3 flex items-center justify-between gap-2 border border-[#dae2fd]/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-[#737686] shrink-0">update</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#737686] truncate">Auto-Sync Pulse</span>
              <span className="font-mono text-xs text-[#131b2e] font-bold truncate">{lastSyncTime}</span>
            </div>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dae2fd] text-[#004ac6] text-xs font-bold active:scale-95 transition-all shadow-sm hover:bg-[#eaedff]"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* SSL Status */}
        <div className="flex items-center justify-between text-[#737686] text-xs px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-[#007d55]">lock_reset</span>
            <span>Bi-directional Webhook Active</span>
          </div>
          <span className="text-xs text-[#004ac6] font-bold font-mono">SSL 256-bit</span>
        </div>
      </section>

      {/* Sync Tabs Switcher */}
      <section className="flex flex-col space-y-3">
        <div className="flex rounded-2xl bg-[#eaedff] p-1 shadow-inner">
          <button
            onClick={() => setActiveSyncTab('import')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'import'
                ? 'text-[#004ac6] bg-white font-bold shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
            Import Records
          </button>

          <button
            onClick={() => setActiveSyncTab('export')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'export'
                ? 'text-[#004ac6] bg-white font-bold shadow-sm'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            Multi-Tab Export
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeSyncTab === 'import' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-3.5">
            {/* Sheet URL input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">link</span>
                Google Sheet Shareable URL
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 truncate border border-[#dae2fd]"
                  />
                  {sheetUrl && (
                    <button
                      onClick={handleClearUrl}
                      className="absolute right-2 top-3 text-[#737686] hover:text-[#131b2e]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={handlePasteMockUrl}
                  className="h-11 px-3 bg-[#eaedff] rounded-xl text-[#131b2e] text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all hover:bg-[#dae2fd]"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#004ac6]">content_paste</span>
                  Paste
                </button>
              </div>
            </div>

            {/* Detected Sheet Details */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[#737686]">
                Detected Sheet: <strong className="text-[#131b2e]">Sheet1 (Students_Roster)</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e1e0ff] text-[#4648d4] font-bold text-[10px]">
                4 Columns Valid
              </span>
            </div>

            {/* Interactive Column Mapping */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                Interactive Column Mapping
              </span>

              <div className="flex flex-col gap-2 text-xs">
                {/* Col A */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      A
                    </span>
                    <span className="font-semibold text-[#131b2e]">Roll_Number</span>
                  </div>
                  <span className="material-symbols-outlined text-[#737686] text-[16px]">arrow_forward</span>
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-sm border border-[#dae2fd]">
                    <option>Roll No</option>
                    <option>Admission ID</option>
                    <option>Do Not Map</option>
                  </select>
                </div>

                {/* Col B */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      B
                    </span>
                    <span className="font-semibold text-[#131b2e]">Full_Name</span>
                  </div>
                  <span className="material-symbols-outlined text-[#737686] text-[16px]">arrow_forward</span>
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-sm border border-[#dae2fd]">
                    <option>Student Name</option>
                    <option>First Name</option>
                    <option>Parent Name</option>
                  </select>
                </div>

                {/* Col C */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      C
                    </span>
                    <span className="font-semibold text-[#131b2e]">WhatsApp_No</span>
                  </div>
                  <span className="material-symbols-outlined text-[#737686] text-[16px]">arrow_forward</span>
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-sm border border-[#dae2fd]">
                    <option>Parent WhatsApp</option>
                    <option>Emergency Contact</option>
                    <option>Alternate Mobile</option>
                  </select>
                </div>

                {/* Col D */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      D
                    </span>
                    <span className="font-semibold text-[#131b2e]">Class_Sec</span>
                  </div>
                  <span className="material-symbols-outlined text-[#737686] text-[16px]">arrow_forward</span>
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-sm border border-[#dae2fd]">
                    <option>Class & Section</option>
                    <option>Grade Level</option>
                    <option>Section Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Animated Progress Box */}
            {isImporting && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#dbe1ff]/50 mt-2 border border-[#004ac6]/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#00174b] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#004ac6] animate-spin">
                      progress_activity
                    </span>
                    Validating schema & formatting...
                  </span>
                  <span className="font-mono text-[#004ac6] font-bold">{importProgress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#004ac6] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={importRecords}
              disabled={isImporting}
              className="w-full h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_download</span>
              <span>{isImporting ? 'Validating...' : 'Validate & Import 40 Records'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeSyncTab === 'export' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#131b2e]">Destination Drive Sync</h3>
                <span className="text-xs text-[#737686]">4 Worksheets configured for multi-tab write</span>
              </div>
              <span className="material-symbols-outlined text-[#004ac6] text-[28px]">drive_folder_upload</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Sheet 1 */}
              <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #1
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Students</span>
                  <span className="text-[11px] text-[#737686] block">40 rows active</span>
                  <span className="text-[10px] text-[#007d55] font-semibold">Updated 9m ago</span>
                </div>
              </div>

              {/* Sheet 2 */}
              <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #2
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Attendance_Oct</span>
                  <span className="text-[11px] text-[#737686] block">P / A / L / HD Logs</span>
                  <span className="text-[10px] text-[#007d55] font-semibold">Daily register synced</span>
                </div>
              </div>

              {/* Sheet 3 */}
              <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #3
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Marks_UT2</span>
                  <span className="text-[11px] text-[#737686] block">Subject Scores & GPA</span>
                  <span className="text-[10px] text-[#007d55] font-semibold">Term 2 Exam ready</span>
                </div>
              </div>

              {/* Sheet 4 */}
              <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-7 h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #4
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Syllabus_Status</span>
                  <span className="text-[11px] text-[#737686] block">Chapter Milestones</span>
                  <span className="text-[10px] text-[#007d55] font-semibold">68.5% verified</span>
                </div>
              </div>
            </div>

            <button
              onClick={exportAllTabs}
              disabled={isExporting}
              className="w-full h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              type="button"
            >
              <span className={`material-symbols-outlined text-[20px] ${isExporting ? 'animate-spin' : ''}`}>
                file_upload
              </span>
              <span>{isExporting ? 'Uploading 4 Worksheets...' : 'Export All Tabs to Google Drive'}</span>
            </button>
          </div>
        )}
      </section>

      {/* Unified Reports Hub */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[22px]">analytics</span>
              <h3 className="text-base font-bold text-[#131b2e]">Unified Reports Hub</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#004ac6] text-xs font-bold">
              360° View
            </span>
          </div>
          <p className="text-xs text-[#737686] leading-relaxed">
            Consolidated operational telemetry combining attendance registers, Unit Test scores, and curriculum pacing.
          </p>
        </div>

        {/* Dropdowns Filter */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-[#737686]">Academic Class</label>
            <select
              value={selectedReportClass}
              onChange={e => {
                setSelectedReportClass(e.target.value);
                showToast(`Loaded metrics for ${e.target.value}`);
              }}
              className="h-10 px-2.5 rounded-xl bg-[#f2f3ff] text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
            >
              <option>Class 10-A (General)</option>
              <option>Class 10-B (Advanced)</option>
              <option>Class 9-A (Foundation)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-[#737686]">Report Type</label>
            <select
              value={selectedReportType}
              onChange={e => {
                setSelectedReportType(e.target.value);
                showToast(`Switched report view to ${e.target.value}`);
              }}
              className="h-10 px-2.5 rounded-xl bg-[#f2f3ff] text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
            >
              <option>Combined 360° Matrix</option>
              <option>Attendance Defaulter Brief</option>
              <option>CBSE Marks Audit Sheet</option>
            </select>
          </div>
        </div>

        {/* Telemetry Snapshot */}
        <div className="bg-[#f2f3ff] rounded-2xl p-4 space-y-3 border border-[#dae2fd]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">speed</span>
              Class Telemetry Snapshot
            </span>
            <span className="text-xs text-[#737686] font-mono font-bold">N=40 Enrolled</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white shadow-sm flex flex-col justify-between border border-[#eaedff]">
              <span className="text-xs text-[#737686]">Class Attendance</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-[#007d55]">94.2%</span>
                <span className="material-symbols-outlined text-[14px] text-[#007d55]">trending_up</span>
              </div>
              <span className="text-[10px] text-[#737686] mt-0.5">Target: &gt;85.0%</span>
            </div>

            <div className="p-3 rounded-xl bg-white shadow-sm flex flex-col justify-between border border-[#eaedff]">
              <span className="text-xs text-[#737686]">UT-2 Pass Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-[#004ac6]">100%</span>
                <span className="text-xs text-[#737686] font-medium">Avg: 83.2%</span>
              </div>
              <span className="text-[10px] text-[#737686] mt-0.5">Top: Science (91%)</span>
            </div>
          </div>

          {/* Syllabus Pacing Status */}
          <div className="p-3 rounded-xl bg-white shadow-sm flex flex-col gap-2 border border-[#eaedff]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#131b2e]">Syllabus Pacing Status</span>
              <span className="font-mono font-bold text-[#131b2e]">68.5% Complete</span>
            </div>
            <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
              <div className="bg-[#004ac6] h-full rounded-full" style={{ width: '68.5%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#737686]">
              <span>Term 2 Milestone: 70%</span>
              <span className="text-[#ba1a1a] font-bold">1.5% deficit</span>
            </div>
          </div>

          {/* Action Flags */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#737686]">
              Action Flags (Requires Sign-off)
            </span>

            {/* Flag 1 */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] shrink-0">warning</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">2 Attendance Defaulters Identified</span>
                <span className="text-[11px] block text-[#93000a]/80">
                  Roll 08 (64%), Roll 29 (69%) under statutory 75% limit
                </span>
              </div>
              <button
                onClick={handleDefaultersAlert}
                className="px-3 py-1 bg-white text-[#ba1a1a] text-xs font-bold rounded-lg shadow-sm shrink-0 active:scale-95 transition-all"
                type="button"
              >
                Alert
              </button>
            </div>

            {/* Flag 2 */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#e1e0ff] text-[#4648d4] border border-[#4648d4]/20">
              <span className="material-symbols-outlined text-[18px] text-[#4648d4] shrink-0">pending_actions</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">1 Subject Syllabus Lag</span>
                <span className="text-[11px] block text-[#4648d4]/80">
                  Physics Ch. 4 (Electromagnetism) is 2 lessons behind
                </span>
              </div>
              <button
                onClick={handleRemedySyllabus}
                className="px-3 py-1 bg-white text-[#4648d4] text-xs font-bold rounded-lg shadow-sm shrink-0 active:scale-95 transition-all"
                type="button"
              >
                Remedy
              </button>
            </div>
          </div>
        </div>

        {/* One-Tap Multi-Channel Export */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-bold text-[#737686]">One-Tap Multi-Channel Export</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleChannelExport('PDF')}
              className="h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">picture_as_pdf</span>
              <span className="text-[11px] font-bold">Download PDF</span>
            </button>

            <button
              onClick={() => handleChannelExport('Sheets')}
              className="h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#007d55]">sheets_rtl</span>
              <span className="text-[11px] font-bold">To Sheets</span>
            </button>

            <button
              onClick={() => handleChannelExport('WhatsApp')}
              className="h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#007d55]">chat</span>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* API Webhook Documentation & Sandbox */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#131b2e]">API Webhook Documentation</h4>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f2f3ff] text-[#434655] font-mono border border-[#dae2fd]">
                POST /v1/sync
              </span>
            </div>
            <p className="text-xs text-[#737686] leading-relaxed">
              Google Apps Script triggers an HTTPS endpoint whenever classroom spreadsheets are modified. EduTrack maps
              payloads in real time, computes weighted averages, and dispatches instant parent push receipts.
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                <span className="text-xs text-[#131b2e] font-bold">Sandbox Mock Webhook Listener</span>
              </div>
              <button
                onClick={fireMockWebhook}
                className="px-3 py-1.5 rounded-xl bg-[#004ac6] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">send</span>
                Fire Test Ping
              </button>
            </div>

            {/* Webhook Logs Terminal */}
            {webhookLogs.length > 0 && (
              <div className="p-3 rounded-xl bg-[#131b2e] text-[#eef0ff] font-mono text-[11px] mt-2 space-y-1.5 border-l-4 border-[#007d55] max-h-36 overflow-y-auto">
                {webhookLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="leading-snug">
                    <span className="text-[#6ffbbe]">[{log.timestamp}]</span>{' '}
                    <span className="text-amber-300">{log.event}</span>: Status {log.status} ({log.responseTimeMs}ms)
                    <div className="text-white/70 text-[10px] pl-2">{log.payloadSummary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
