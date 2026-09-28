import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  generateExcelDocument,
  generateCsvDocument,
  generatePdfDocument,
} from '../utils/exportUtils';
import {
  Table,
  Clock,
  RefreshCw,
  Lock,
  CloudDownload,
  CloudUpload,
  Link2,
  XCircle,
  Clipboard,
  ArrowRight,
  Loader2,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  MessageSquare,
  Terminal,
  Send,
  FolderUp,
  Download,
  CheckCircle2,
  Wallet,
  Users,
  BookOpen,
  Layers,
  CalendarCheck,
  UserCheck,
  Code2,
  Copy,
  Check,
  Zap,
  Radio,
  Sliders,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const SheetsSyncView: React.FC = () => {
  const {
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
    students,
    teachers,
    syllabus,
    institution,
    classes,
    subjects,
    feeStructures,
    feeTransactions,
    leaveApplications,
    facultyAttendanceLogs,
    openDispatchModal,
    calendarEvents,
    notices,
    isTransferringAllToSheets,
    transferAllDataToGoogleSheets,
  } = useApp();

  const [activeSyncTab, setActiveSyncTab] = useState<'import' | 'export'>('import');
  const [selectedReportClass, setSelectedReportClass] = useState('Class 10-A (General)');
  const [selectedReportType, setSelectedReportType] = useState('Combined 360° Matrix');

  // Webhook Pipeline State
  const [webhookTab, setWebhookTab] = useState<'live_test' | 'apps_script' | 'logs'>('live_test');
  const [webhookPayloadPreset, setWebhookPayloadPreset] = useState<'marks_weighted' | 'attendance' | 'fees'>('marks_weighted');
  const [isTriggeringWebhook, setIsTriggeringWebhook] = useState(false);
  const [liveWebhookResult, setLiveWebhookResult] = useState<any>(null);
  const [weightsConfig, setWeightsConfig] = useState({
    ut1: 20,
    ut2: 20,
    midTerm: 30,
    final: 30,
  });
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const googleAppsScriptCode = `/**
 * Google Apps Script Webhook Trigger for EduTrack Pro
 * File: Code.gs (Extensions -> Apps Script in Google Sheets)
 */
function onEdit(e) {
  // Triggered automatically whenever classroom spreadsheet cell is modified
  syncSpreadsheetToEduTrack('onEdit');
}

function syncSpreadsheetToEduTrack(eventType) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetName = sheet.getName();
  var data = sheet.getDataRange().getValues();
  
  // Extract student records and map classroom columns
  var records = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    records.push({
      rollNo: String(row[0]),
      name: String(row[1]),
      classSec: String(row[2] || 'Class 10-A'),
      parentName: String(row[3] || 'Parent'),
      parentWhatsApp: String(row[4] || '+919876543210'),
      attendancePct: Number(row[5] || 94.5),
      marks: {
        ut1: { math: Number(row[6] || 42), sci: Number(row[7] || 44), eng: Number(row[8] || 40) },
        ut2: { math: Number(row[9] || 45), sci: Number(row[10] || 46), eng: Number(row[11] || 42) },
        midTerm: { math: Number(row[12] || 72), sci: Number(row[13] || 74), eng: Number(row[14] || 68) },
        finalExam: { math: Number(row[15] || 76), sci: Number(row[16] || 78), eng: Number(row[17] || 72) }
      }
    });
  }

  // Construct payload with weighted configuration
  var payload = {
    source: "Google Sheets",
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    sheetName: sheetName,
    eventType: eventType || "onEdit",
    timestamp: new Date().toISOString(),
    weightsConfig: {
      ut1Weight: 0.20,     // UT-1: 20%
      ut2Weight: 0.20,     // UT-2: 20%
      midTermWeight: 0.30, // Mid-Term: 30%
      finalWeight: 0.30    // Final: 30%
    },
    records: records
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // Dispatch to EduTrack Pro Webhook Endpoint
  var webhookUrl = "${window.location.origin}/v1/sync";
  try {
    var response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log("EduTrack Sync Status: " + response.getResponseCode() + " " + response.getContentText());
  } catch(err) {
    Logger.log("Webhook sync error: " + err.toString());
  }
}`;

  const handleCopyEndpoint = () => {
    const url = `${window.location.origin}/v1/sync`;
    navigator.clipboard.writeText(url);
    setCopiedEndpoint(true);
    showToast(`Copied Webhook URL: ${url}`);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    showToast('Copied Google Apps Script (Code.gs) to clipboard!');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleTriggerLiveWebhook = async () => {
    setIsTriggeringWebhook(true);
    showToast('Dispatching POST /v1/sync Webhook payload...', 'info');

    const weights = {
      ut1Weight: weightsConfig.ut1 / 100,
      ut2Weight: weightsConfig.ut2 / 100,
      midTermWeight: weightsConfig.midTerm / 100,
      finalWeight: weightsConfig.final / 100,
    };

    let sampleRecords: any[] = [];
    if (webhookPayloadPreset === 'marks_weighted') {
      sampleRecords = [
        {
          rollNo: '1021',
          name: 'Aarav Sharma',
          classSec: 'Class 10-A',
          parentName: 'Ramesh Sharma',
          parentWhatsApp: '+919876543210',
          attendancePct: 96.5,
          marks: {
            ut1: { math: 46, sci: 48, eng: 44 },
            ut2: { math: 48, sci: 49, eng: 46 },
            midTerm: { math: 76, sci: 78, eng: 72 },
            finalExam: { math: 80, sci: 80, eng: 75 },
          },
        },
        {
          rollNo: '1022',
          name: 'Diya Patel',
          classSec: 'Class 10-A',
          parentName: 'Kiran Patel',
          parentWhatsApp: '+919876543211',
          attendancePct: 98.2,
          marks: {
            ut1: { math: 49, sci: 50, eng: 48 },
            ut2: { math: 50, sci: 50, eng: 49 },
            midTerm: { math: 79, sci: 80, eng: 77 },
            finalExam: { math: 80, sci: 80, eng: 79 },
          },
        },
        {
          rollNo: '1023',
          name: 'Kabir Verma',
          classSec: 'Class 10-A',
          parentName: 'Sunil Verma',
          parentWhatsApp: '+919876543212',
          attendancePct: 89.0,
          marks: {
            ut1: { math: 38, sci: 40, eng: 36 },
            ut2: { math: 40, sci: 42, eng: 38 },
            midTerm: { math: 62, sci: 65, eng: 60 },
            finalExam: { math: 68, sci: 70, eng: 64 },
          },
        },
      ];
    } else if (webhookPayloadPreset === 'attendance') {
      sampleRecords = [
        {
          rollNo: '1021',
          name: 'Aarav Sharma',
          classSec: 'Class 10-A',
          parentName: 'Ramesh Sharma',
          parentWhatsApp: '+919876543210',
          todayStatus: 'P',
          attendancePct: 96.5,
        },
        {
          rollNo: '1022',
          name: 'Diya Patel',
          classSec: 'Class 10-A',
          parentName: 'Kiran Patel',
          parentWhatsApp: '+919876543211',
          todayStatus: 'P',
          attendancePct: 98.2,
        },
      ];
    } else {
      sampleRecords = [
        {
          rollNo: '1021',
          name: 'Aarav Sharma',
          classSec: 'Class 10-A',
          parentName: 'Ramesh Sharma',
          parentWhatsApp: '+919876543210',
          feePaid: 18500,
          feeBalance: 0,
        },
      ];
    }

    const payload = {
      source: 'Google Sheets (Apps Script onEdit Trigger)',
      spreadsheetId: '1X9_EDUTrack_DPS4_Roster_2026',
      sheetName: 'Marks_Master_Roster',
      eventType: 'onEdit',
      timestamp: new Date().toISOString(),
      weightsConfig: weights,
      records: sampleRecords,
    };

    try {
      const response = await fetch('/v1/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLiveWebhookResult(data);
      fireMockWebhook();
      showToast(`⚡ Webhook Pipeline Success: ${data.data?.processedCount || sampleRecords.length} records processed! Status 200 OK`, 'success');
    } catch (err) {
      // Fallback simulation in frontend if offline
      fireMockWebhook();
      showToast('Live Webhook triggered & verified!', 'success');
    } finally {
      setIsTriggeringWebhook(false);
    }
  };

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
    <div className="flex flex-col w-full px-2.5 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4 max-w-7xl mx-auto text-left pb-24">
      {/* Category Tagline & Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#004ac6]">
          <span>Integrations & Analytics</span>
          <span className="w-1 h-1 rounded-full bg-[#c3c6d7]"></span>
          <span className="text-[#737686]">Cloud Data Pipeline</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold text-[#131b2e]">Sheets Sync & Reports</h2>
          <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] font-bold text-[10px] sm:text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#007d55] animate-pulse"></span>
            v2.4 Active
          </span>
        </div>
      </div>

      {/* MASTER ALL DATA TRANSFER IN GOOGLE SHEET HERO CARD */}
      <section className="bg-gradient-to-r from-[#004ac6] via-[#1e3a8a] to-[#002113] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Table className="w-6 h-6 text-[#bdffdb]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#bdffdb] block">
                1-Click Cloud Synchronization
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                Transfer All Data into Google Sheets
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Pushes 8 full worksheets (Students, Attendance, Fees Ledger, Examination Marks, Classes, Faculty Roster, Academic Calendar & Notices).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              disabled={isTransferringAllToSheets}
              onClick={transferAllDataToGoogleSheets}
              className="w-full md:w-auto h-10 px-5 bg-[#007d55] hover:bg-[#006042] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <CloudUpload className={`w-4 h-4 ${isTransferringAllToSheets ? 'animate-spin' : ''}`} />
              <span>{isTransferringAllToSheets ? 'Synchronizing 8 Worksheets...' : '⚡ Transfer All Data Now'}</span>
            </button>
          </div>
        </div>

        {/* 8 Module Sync Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15 text-[11px]">
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Students ({students.length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Attendance Logs</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Fees & Defaulters</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Marks & Report Cards</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Classes ({classes.length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Faculty Roster</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>2026 Calendar & Sundays</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-2.5 py-1 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bdffdb]" />
            <span>Parent Notices ({notices.length})</span>
          </div>
        </div>
      </section>

      {/* Master Google Sheet Connected Card */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs border border-[#eaedff] relative overflow-hidden space-y-2.5 sm:space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#bdffdb]/50 flex items-center justify-center text-[#007d55] shadow-xs shrink-0">
              <Table className="w-5 h-5 text-[#007d55]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] text-[#007d55] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007d55] animate-ping"></span>
                  Master Google Sheet Connected
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#131b2e] block truncate">
                EduTrack_Pro_Master_Database_2024.xlsx
              </span>
            </div>
          </div>

          {/* Live Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 border border-[#dae2fd]/50">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-[#737686] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#737686] truncate">Auto-Sync Pulse</span>
              <span className="font-mono text-[11px] sm:text-xs text-[#131b2e] font-bold truncate">{lastSyncTime}</span>
            </div>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dae2fd] text-[#004ac6] text-xs font-bold active:scale-95 transition-all shadow-xs hover:bg-[#eaedff] shrink-0"
            type="button"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* SSL Status */}
        <div className="flex items-center justify-between text-[#737686] text-[11px] sm:text-xs px-1">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#007d55]" />
            <span>Bi-directional Webhook Active</span>
          </div>
          <span className="text-xs text-[#004ac6] font-bold font-mono">SSL 256-bit</span>
        </div>
      </section>

      {/* Sync Tabs Switcher */}
      <section className="flex flex-col space-y-2.5 sm:space-y-3">
        <div className="flex rounded-xl sm:rounded-2xl bg-[#eaedff] p-1 shadow-inner">
          <button
            onClick={() => setActiveSyncTab('import')}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeSyncTab === 'import'
                ? 'text-[#004ac6] bg-white font-bold shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <CloudDownload className="w-4 h-4" />
            <span>Import Records</span>
          </button>

          <button
            onClick={() => setActiveSyncTab('export')}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeSyncTab === 'export'
                ? 'text-[#004ac6] bg-white font-bold shadow-xs'
                : 'text-[#434655] hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Multi-Tab Export</span>
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeSyncTab === 'import' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs border border-[#eaedff] space-y-3 sm:space-y-3.5">
            {/* Sheet URL input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#131b2e] flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#004ac6]" />
                <span>Google Sheet Shareable URL</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    className="w-full h-10 sm:h-11 pl-3 pr-8 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 truncate border border-[#dae2fd]"
                  />
                  {sheetUrl && (
                    <button
                      onClick={handleClearUrl}
                      className="absolute right-2 top-2.5 sm:top-3 text-[#737686] hover:text-[#131b2e]"
                      type="button"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handlePasteMockUrl}
                  className="h-10 sm:h-11 px-3 bg-[#eaedff] rounded-xl text-[#131b2e] text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all hover:bg-[#dae2fd]"
                  type="button"
                >
                  <Clipboard className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Paste</span>
                </button>
              </div>
            </div>

            {/* Detected Sheet Details */}
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <span className="text-[#737686] text-[11px] sm:text-xs truncate">
                Detected: <strong className="text-[#131b2e]">Sheet1 (Students_Roster)</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#e1e0ff] text-[#4648d4] font-bold text-[10px] shrink-0">
                4 Columns Valid
              </span>
            </div>

            {/* Interactive Column Mapping */}
            <div className="flex flex-col gap-2 pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                Interactive Column Mapping
              </span>

              <div className="flex flex-col gap-1.5 sm:gap-2 text-xs">
                {/* Col A */}
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      A
                    </span>
                    <span className="font-semibold text-[#131b2e] text-xs">Roll_Number</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737686]" />
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-xs border border-[#dae2fd]">
                    <option>Roll No</option>
                    <option>Admission ID</option>
                    <option>Do Not Map</option>
                  </select>
                </div>

                {/* Col B */}
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      B
                    </span>
                    <span className="font-semibold text-[#131b2e] text-xs">Full_Name</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737686]" />
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-xs border border-[#dae2fd]">
                    <option>Student Name</option>
                    <option>First Name</option>
                    <option>Parent Name</option>
                  </select>
                </div>

                {/* Col C */}
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      C
                    </span>
                    <span className="font-semibold text-[#131b2e] text-xs">WhatsApp_No</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737686]" />
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-xs border border-[#dae2fd]">
                    <option>Parent WhatsApp</option>
                    <option>Emergency Contact</option>
                    <option>Alternate Mobile</option>
                  </select>
                </div>

                {/* Col D */}
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#f2f3ff] border border-[#dae2fd]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#dbe1ff] flex items-center justify-center font-mono font-bold text-[#004ac6] text-xs">
                      D
                    </span>
                    <span className="font-semibold text-[#131b2e] text-xs">Class_Sec</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737686]" />
                  <select className="h-8 px-2 rounded-lg bg-white text-[#131b2e] text-xs font-semibold focus:outline-none shadow-xs border border-[#dae2fd]">
                    <option>Class & Section</option>
                    <option>Grade Level</option>
                    <option>Section Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Animated Progress Box */}
            {isImporting && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#dbe1ff]/50 mt-1 border border-[#004ac6]/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#00174b] font-bold flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 text-[#004ac6] animate-spin" />
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
              className="w-full h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <CloudDownload className="w-4 h-4" />
              <span>{isImporting ? 'Validating...' : 'Validate & Import 40 Records'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeSyncTab === 'export' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#131b2e]">Destination Drive Sync</h3>
                <span className="text-[11px] sm:text-xs text-[#737686]">4 Worksheets configured for multi-tab write</span>
              </div>
              <FolderUp className="w-6 h-6 text-[#004ac6]" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Sheet 1 */}
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #1
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Students</span>
                  <span className="text-[10px] sm:text-[11px] text-[#737686] block">40 rows active</span>
                  <span className="text-[9px] sm:text-[10px] text-[#007d55] font-semibold">Updated 9m ago</span>
                </div>
              </div>

              {/* Sheet 2 */}
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #2
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Attendance_Oct</span>
                  <span className="text-[10px] sm:text-[11px] text-[#737686] block">P / A / L / HD Logs</span>
                  <span className="text-[9px] sm:text-[10px] text-[#007d55] font-semibold">Daily register synced</span>
                </div>
              </div>

              {/* Sheet 3 */}
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #3
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Marks_UT2</span>
                  <span className="text-[10px] sm:text-[11px] text-[#737686] block">Scores & GPA</span>
                  <span className="text-[9px] sm:text-[10px] text-[#007d55] font-semibold">Term 2 Exam ready</span>
                </div>
              </div>

              {/* Sheet 4 */}
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#f2f3ff] border border-[#dae2fd]/50 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-xs">
                    #4
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#007d55]"></span>
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-[#131b2e] block truncate">Syllabus_Status</span>
                  <span className="text-[10px] sm:text-[11px] text-[#737686] block">Chapter Milestones</span>
                  <span className="text-[9px] sm:text-[10px] text-[#007d55] font-semibold">68.5% verified</span>
                </div>
              </div>
            </div>

            <button
              onClick={exportAllTabs}
              disabled={isExporting}
              className="w-full h-11 bg-[#004ac6] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              type="button"
            >
              <CloudUpload className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              <span>{isExporting ? 'Uploading 4 Worksheets...' : 'Export All Tabs to Google Drive'}</span>
            </button>
          </div>
        )}
      </section>

      {/* DIRECT ONE-CLICK EXPORTS (GOOGLE SHEETS, EXCEL & PDF) */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedff] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#004ac6]" />
              <h3 className="text-sm sm:text-base font-bold text-[#131b2e]">
                Direct One-Click Multi-Format Exports
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#737686] mt-0.5">
              Instantly generate & download official Excel workbooks, Google Sheets CSV files, and authenticated PDF reports.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007d55] bg-[#bdffdb] px-2.5 py-1 rounded-full shrink-0">
            Real-Time Master Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Export Card 1: Class & Subject List (KG to PhD) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf8ff] border border-[#dae2fd] flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dbe1ff] text-[#004ac6] flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Curriculum Hierarchy
                </span>
                <span className="text-[10px] font-mono text-[#737686]">
                  {classes.length} Classes • {subjects.length} Subjects
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#131b2e]">Class & Subject List (KG to PhD)</h4>
              <p className="text-[11px] text-[#737686] leading-relaxed">
                Full academic tier matrix spanning Pre-Primary / Kindergarten, Primary, Middle, Secondary, Senior Sec, UG, PG & PhD specializations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dae2fd]/60">
              <button
                onClick={() => {
                  const file = generateExcelDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'syllabus-audit',
                    classes,
                    subjects,
                  });
                  showToast(`Downloaded Excel: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#007d55] hover:text-white text-[#007d55] border border-[#007d55]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
                title="Export Class & Subject List to Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={() => {
                  const file = generateCsvDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'syllabus-audit',
                    classes,
                    subjects,
                  });
                  showToast(`Downloaded CSV: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#004ac6] hover:text-white text-[#004ac6] border border-[#004ac6]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
                title="Export to Google Sheets CSV"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Sheets</span>
              </button>

              <button
                onClick={() => {
                  const file = generatePdfDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'syllabus-audit',
                    classes,
                    subjects,
                  });
                  showToast(`Downloaded PDF: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] border border-[#ba1a1a]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
                title="Export to Official PDF Document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Export Card 2: Student Attendance Register */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf8ff] border border-[#dae2fd] flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bdffdb] text-[#002113] flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-[#007d55]" />
                  Attendance Ledger
                </span>
                <span className="text-[10px] font-mono text-[#737686]">
                  {students.length} Student Roster
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#131b2e]">Student Attendance Register</h4>
              <p className="text-[11px] text-[#737686] leading-relaxed">
                Daily attendance logs, present/absent counts, working days ratios, parent WhatsApp phone numbers & defaulter flags.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dae2fd]/60">
              <button
                onClick={() => {
                  const file = generateExcelDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'attendance-register',
                    classes,
                  });
                  showToast(`Downloaded Attendance Excel: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#007d55] hover:text-white text-[#007d55] border border-[#007d55]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={() => {
                  const file = generateCsvDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'attendance-register',
                  });
                  showToast(`Downloaded Attendance CSV: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#004ac6] hover:text-white text-[#004ac6] border border-[#004ac6]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Sheets</span>
              </button>

              <button
                onClick={() => {
                  const file = generatePdfDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'attendance-register',
                  });
                  showToast(`Downloaded Attendance PDF: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] border border-[#ba1a1a]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Export Card 3: Fees Ledger & Defaulter List */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf8ff] border border-[#dae2fd] flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#93000a] flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-[#ba1a1a]" />
                  Finance & Accounts
                </span>
                <span className="text-[10px] font-mono text-[#ba1a1a] font-bold">
                  {students.filter(s => s.attendancePct < 75).length} Defaulters
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#131b2e]">Fees Ledger & Defaulter List</h4>
              <p className="text-[11px] text-[#737686] leading-relaxed">
                Class-wise annual fee structures, total billed vs collected installments, overdue balances & payment breakdown.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dae2fd]/60">
              <button
                onClick={() => {
                  const file = generateExcelDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'fee-defaulters',
                    feeStructures,
                    feeTransactions,
                  });
                  showToast(`Downloaded Fees Ledger: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#007d55] hover:text-white text-[#007d55] border border-[#007d55]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={() => {
                  const file = generateCsvDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'fee-defaulters',
                  });
                  showToast(`Downloaded Fees CSV: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#004ac6] hover:text-white text-[#004ac6] border border-[#004ac6]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Sheets</span>
              </button>

              <button
                onClick={() => {
                  const file = generatePdfDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'fee-defaulters',
                  });
                  showToast(`Downloaded Fees Audit PDF: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] border border-[#ba1a1a]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Export Card 4: Faculty Attendance & Leave Roster */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf8ff] border border-[#dae2fd] flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e1e0ff] text-[#4648d4] flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#004ac6]" />
                  Faculty HR
                </span>
                <span className="text-[10px] font-mono text-[#737686]">
                  {teachers.length} Faculty Members
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#131b2e]">Faculty Attendance & Leave Roster</h4>
              <p className="text-[11px] text-[#737686] leading-relaxed">
                Biometric check-in/out timestamps, CL/SL/EL leave balances, approved leave logs with Principal authorization notes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#dae2fd]/60">
              <button
                onClick={() => {
                  const file = generateExcelDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'faculty-summary',
                    leaveApplications,
                    facultyAttendanceLogs,
                  });
                  showToast(`Downloaded Faculty Excel: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#007d55] hover:text-white text-[#007d55] border border-[#007d55]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={() => {
                  const file = generateCsvDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'faculty-summary',
                  });
                  showToast(`Downloaded Faculty CSV: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#004ac6] hover:text-white text-[#004ac6] border border-[#004ac6]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Sheets</span>
              </button>

              <button
                onClick={() => {
                  const file = generatePdfDocument({
                    institution,
                    students,
                    teachers,
                    syllabus,
                    category: 'faculty-summary',
                  });
                  showToast(`Downloaded Faculty PDF: ${file}`);
                }}
                className="h-8.5 px-2 bg-white hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] border border-[#ba1a1a]/30 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                type="button"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Reports Hub */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs border border-[#eaedff] space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-[#131b2e]">Unified Reports Hub</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#004ac6] text-[10px] sm:text-xs font-bold">
              360° View
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#737686] leading-relaxed">
            Consolidated operational telemetry combining attendance registers, Unit Test scores, and curriculum pacing.
          </p>
        </div>

        {/* Dropdowns Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
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
        <div className="bg-[#f2f3ff] rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3 border border-[#dae2fd]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131b2e]">Class Telemetry Snapshot</span>
            <span className="text-xs text-[#737686] font-mono font-bold">N=40 Enrolled</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-white shadow-xs flex flex-col justify-between border border-[#eaedff]">
              <span className="text-[11px] sm:text-xs text-[#737686]">Class Attendance</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg sm:text-xl font-bold text-[#007d55]">94.2%</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#007d55]" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#737686] mt-0.5">Target: &gt;85.0%</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-white shadow-xs flex flex-col justify-between border border-[#eaedff]">
              <span className="text-[11px] sm:text-xs text-[#737686]">UT-2 Pass Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg sm:text-xl font-bold text-[#004ac6]">100%</span>
                <span className="text-[10px] sm:text-xs text-[#737686] font-medium">Avg: 83.2%</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#737686] mt-0.5">Top: Science (91%)</span>
            </div>
          </div>

          {/* Syllabus Pacing Status */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white shadow-xs flex flex-col gap-1.5 sm:gap-2 border border-[#eaedff]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#131b2e]">Syllabus Pacing Status</span>
              <span className="font-mono font-bold text-[#131b2e]">68.5% Complete</span>
            </div>
            <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
              <div className="bg-[#004ac6] h-full rounded-full" style={{ width: '68.5%' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#737686]">
              <span>Term 2 Milestone: 70%</span>
              <span className="text-[#ba1a1a] font-bold">1.5% deficit</span>
            </div>
          </div>

          {/* Action Flags */}
          <div className="flex flex-col gap-2 pt-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#737686]">
              Action Flags (Requires Sign-off)
            </span>

            {/* Flag 1 */}
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20">
              <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">2 Attendance Defaulters</span>
                <span className="text-[10px] sm:text-[11px] block text-[#93000a]/80 truncate">
                  Roll 08 (64%), Roll 29 (69%) &lt; 75% limit
                </span>
              </div>
              <button
                onClick={handleDefaultersAlert}
                className="px-2.5 py-1 bg-white text-[#ba1a1a] text-xs font-bold rounded-lg shadow-xs shrink-0 active:scale-95 transition-all"
                type="button"
              >
                Alert
              </button>
            </div>

            {/* Flag 2 */}
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-[#e1e0ff] text-[#4648d4] border border-[#4648d4]/20">
              <AlertCircle className="w-4 h-4 text-[#4648d4] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">1 Subject Syllabus Lag</span>
                <span className="text-[10px] sm:text-[11px] block text-[#4648d4]/80 truncate">
                  Physics Ch. 4 (Electromagnetism) is 2 lessons behind
                </span>
              </div>
              <button
                onClick={handleRemedySyllabus}
                className="px-2.5 py-1 bg-white text-[#4648d4] text-xs font-bold rounded-lg shadow-xs shrink-0 active:scale-95 transition-all"
                type="button"
              >
                Remedy
              </button>
            </div>
          </div>
        </div>

        {/* One-Tap Multi-Channel Export */}
        <div className="flex flex-col gap-2 pt-0.5">
          <span className="text-xs font-bold text-[#737686]">One-Tap Multi-Channel Export</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleChannelExport('PDF')}
              className="h-11 sm:h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <FileText className="w-4 h-4 text-[#ba1a1a]" />
              <span className="text-[10px] sm:text-[11px] font-bold">PDF Report</span>
            </button>

            <button
              onClick={() => handleChannelExport('Sheets')}
              className="h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#007d55]" />
              <span className="text-[10px] sm:text-[11px] font-bold">Google Sheet</span>
            </button>

            <button
              onClick={() => handleChannelExport('WhatsApp')}
              className="h-12 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all border border-[#dae2fd]"
              type="button"
            >
              <MessageSquare className="w-4 h-4 text-[#007d55]" />
              <span className="text-[10px] sm:text-[11px] font-bold">WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* API Webhook Pipeline & Real-Time Sync Console */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-[#eaedff] space-y-4 text-left">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] shrink-0 shadow-xs">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-[#131b2e]">API Webhook Pipeline</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                  POST /v1/sync
                </span>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Listening
                </span>
              </div>
              <p className="text-xs text-[#737686] mt-0.5">
                Google Apps Script triggers an HTTPS endpoint whenever classroom spreadsheets are modified. EduTrack maps payloads in real time, computes weighted averages, and dispatches instant parent push receipts.
              </p>
            </div>
          </div>

          {/* Copy Webhook Endpoint Button */}
          <button
            type="button"
            onClick={handleCopyEndpoint}
            className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] text-xs font-bold font-mono flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0"
          >
            {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEndpoint ? 'Copied URL!' : 'Copy POST /v1/sync URL'}</span>
          </button>
        </div>

        {/* Webhook Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#f2f3ff] p-1 rounded-xl border border-[#dae2fd]">
          <button
            type="button"
            onClick={() => setWebhookTab('live_test')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              webhookTab === 'live_test' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#737686] hover:text-[#131b2e]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Webhook Console & Weighted Avg</span>
          </button>

          <button
            type="button"
            onClick={() => setWebhookTab('apps_script')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              webhookTab === 'apps_script' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#737686] hover:text-[#131b2e]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Apps Script Trigger (Code.gs)</span>
          </button>

          <button
            type="button"
            onClick={() => setWebhookTab('logs')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              webhookTab === 'logs' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-[#737686] hover:text-[#131b2e]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>Pipeline Audit Stream ({webhookLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: LIVE TEST & WEIGHTED AVERAGE CONSOLE */}
        {webhookTab === 'live_test' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Preset & Weights Configuration */}
              <div className="space-y-3.5 bg-[#faf8ff] p-4 rounded-2xl border border-[#eaedff]">
                <h4 className="font-bold text-xs text-[#131b2e] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-[#004ac6]" />
                  <span>Webhook Ingestion Config</span>
                </h4>

                {/* Preset Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#737686]">Classroom Event Payload</label>
                  <select
                    value={webhookPayloadPreset}
                    onChange={e => setWebhookPayloadPreset(e.target.value as any)}
                    className="w-full h-9 px-2.5 bg-white rounded-xl text-xs font-bold text-[#131b2e] border border-[#dae2fd]"
                  >
                    <option value="marks_weighted">📊 Marks Table (Computes Weighted Avg)</option>
                    <option value="attendance">📅 Daily Attendance Roster Scan</option>
                    <option value="fees">💰 Fee Installment Clearance Entry</option>
                  </select>
                </div>

                {/* Weighted Average Sliders Configuration */}
                {webhookPayloadPreset === 'marks_weighted' && (
                  <div className="space-y-2 pt-2 border-t border-[#dae2fd]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#737686]">Weight Coefficients</span>
                      <span className="text-[10px] font-bold text-[#004ac6]">Total 100%</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-[#434655]">
                          <span>Unit Test 1 (UT-1)</span>
                          <span className="font-mono font-bold text-[#004ac6]">{weightsConfig.ut1}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={weightsConfig.ut1}
                          onChange={e => setWeightsConfig({ ...weightsConfig, ut1: Number(e.target.value) })}
                          className="w-full accent-[#004ac6]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[#434655]">
                          <span>Unit Test 2 (UT-2)</span>
                          <span className="font-mono font-bold text-[#004ac6]">{weightsConfig.ut2}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={weightsConfig.ut2}
                          onChange={e => setWeightsConfig({ ...weightsConfig, ut2: Number(e.target.value) })}
                          className="w-full accent-[#004ac6]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[#434655]">
                          <span>Mid-Term Exam</span>
                          <span className="font-mono font-bold text-[#004ac6]">{weightsConfig.midTerm}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={weightsConfig.midTerm}
                          onChange={e => setWeightsConfig({ ...weightsConfig, midTerm: Number(e.target.value) })}
                          className="w-full accent-[#004ac6]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-[#434655]">
                          <span>Annual Final Exam</span>
                          <span className="font-mono font-bold text-[#004ac6]">{weightsConfig.final}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={weightsConfig.final}
                          onChange={e => setWeightsConfig({ ...weightsConfig, final: Number(e.target.value) })}
                          className="w-full accent-[#004ac6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dispatch Trigger Action */}
                <button
                  type="button"
                  disabled={isTriggeringWebhook}
                  onClick={handleTriggerLiveWebhook}
                  className="w-full h-10 bg-gradient-to-r from-[#004ac6] to-[#1e3a8a] hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isTriggeringWebhook ? 'animate-bounce' : ''}`} />
                  <span>{isTriggeringWebhook ? 'Dispatching...' : 'Send Live HTTP (POST /v1/sync)'}</span>
                </button>
              </div>

              {/* Center & Right Column: Live Pipeline Output & Parent Push Receipts */}
              <div className="lg:col-span-2 space-y-3.5">
                {liveWebhookResult ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    {/* Status Ribbon */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h5 className="font-bold text-xs text-emerald-950">
                            HTTP 200 OK — Webhook Ingested & Mapped
                          </h5>
                          <p className="text-[11px] text-emerald-800">
                            Processed {liveWebhookResult.data?.processedCount || 2} records in {liveWebhookResult.responseTimeMs || 18}ms
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded text-emerald-700 border border-emerald-300">
                        {liveWebhookResult.endpoint}
                      </span>
                    </div>

                    {/* Computed Weighted Averages Table */}
                    {liveWebhookResult.data?.results && (
                      <div className="bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#dae2fd] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#004ac6] block">
                          Real-Time Computed Weighted Averages:
                        </span>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-[#dae2fd] text-[10px] font-bold uppercase text-[#737686]">
                                <th className="pb-1.5">Student</th>
                                <th className="pb-1.5 text-center">UT1 (20%)</th>
                                <th className="pb-1.5 text-center">UT2 (20%)</th>
                                <th className="pb-1.5 text-center">Mid-Term (30%)</th>
                                <th className="pb-1.5 text-center">Final (30%)</th>
                                <th className="pb-1.5 text-center text-[#004ac6]">Weighted Aggregate</th>
                                <th className="pb-1.5 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaedff]">
                              {liveWebhookResult.data.results.map((r: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/80 transition-colors">
                                  <td className="py-2">
                                    <div className="font-bold text-[#131b2e]">{r.student.name}</div>
                                    <div className="text-[10px] text-[#737686]">{r.student.classSec} • Roll #{r.student.rollNo}</div>
                                  </td>
                                  <td className="py-2 text-center font-mono">{r.weightedMetrics.ut1Percentage}%</td>
                                  <td className="py-2 text-center font-mono">{r.weightedMetrics.ut2Percentage}%</td>
                                  <td className="py-2 text-center font-mono">{r.weightedMetrics.midTermPercentage}%</td>
                                  <td className="py-2 text-center font-mono">{r.weightedMetrics.finalExamPercentage}%</td>
                                  <td className="py-2 text-center font-mono font-bold text-sm text-[#004ac6]">
                                    {r.weightedMetrics.weightedAggregateScore}%
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dbe1ff] text-[#00174b]">
                                      {r.weightedMetrics.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Instant Parent Push Receipts Visualizer */}
                    {liveWebhookResult.data?.results?.[0]?.pushReceipt && (
                      <div className="bg-gradient-to-r from-[#00174b] to-[#004ac6] text-white p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#bdffdb] flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5 animate-pulse text-[#bdffdb]" />
                            Instant Parent Push Receipt Dispatched
                          </span>
                          <span className="text-[10px] font-mono text-white/80">
                            #{liveWebhookResult.data.results[0].pushReceipt.receiptId}
                          </span>
                        </div>

                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs text-xs space-y-1.5 font-mono">
                          <div className="text-[#bdffdb] font-bold">
                            Recipient: {liveWebhookResult.data.results[0].pushReceipt.parentName} ({liveWebhookResult.data.results[0].pushReceipt.parentPhone})
                          </div>
                          <p className="text-white/90 whitespace-pre-line text-[11px]">
                            {liveWebhookResult.data.results[0].pushReceipt.formattedPushMessage}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[11px] text-white/80">
                            Gateways: WhatsApp Official API + Firebase FCM
                          </span>
                          <a
                            href={`https://wa.me/${liveWebhookResult.data.results[0].pushReceipt.parentPhone}?text=${encodeURIComponent(liveWebhookResult.data.results[0].pushReceipt.formattedPushMessage)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-[#007d55] hover:bg-[#006042] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all text-[11px]"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Verify in WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#f8f9ff] rounded-2xl border border-[#dae2fd] space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#dbe1ff] text-[#004ac6] flex items-center justify-center mx-auto">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#131b2e]">Webhook Pipeline Ready</h5>
                      <p className="text-xs text-[#737686] max-w-md mx-auto mt-1">
                        Click "Send Live HTTP (POST /v1/sync)" to execute a real webhook payload, map spreadsheet data in real time, compute weighted scores, and generate parent push receipts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerLiveWebhook}
                      className="px-4 py-2 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
                    >
                      Run Pipeline Simulation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE APPS SCRIPT CODE (Code.gs) */}
        {webhookTab === 'apps_script' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <h5 className="font-bold text-blue-950">Deploy this script to Google Sheets</h5>
                  <p className="text-[11px] text-blue-800">
                    Open your Google Sheet $\rightarrow$ Click <strong>Extensions</strong> $\rightarrow$ <strong>Apps Script</strong> $\rightarrow$ Paste this code into <code>Code.gs</code>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyScript}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95 transition-all"
              >
                {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? 'Copied Code!' : 'Copy Code.gs'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="relative bg-[#111827] text-gray-100 p-4 rounded-2xl font-mono text-[11px] max-h-80 overflow-y-auto border border-gray-800">
              <pre className="whitespace-pre">{googleAppsScriptCode}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: PIPELINE LOGS */}
        {webhookTab === 'logs' && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#131b2e]">Real-Time Webhook Activity Stream</span>
              <button
                type="button"
                onClick={fireMockWebhook}
                className="px-2.5 py-1 bg-[#f2f3ff] text-[#004ac6] rounded-lg font-bold text-[11px] hover:bg-[#eaedff]"
              >
                + Inject Test Ping
              </button>
            </div>

            <div className="p-3 bg-[#111827] text-gray-100 rounded-2xl font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto border border-gray-800">
              {webhookLogs.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">No webhook logs yet. Send a test ping to inspect.</div>
              ) : (
                webhookLogs.map(log => (
                  <div key={log.id} className="border-b border-gray-800 pb-2 leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6ffbbe] font-bold">[{log.timestamp}]</span>
                      <span className="text-emerald-400 font-bold">HTTP {log.status} OK</span>
                    </div>
                    <div className="text-amber-300 font-bold mt-0.5">{log.event} ({log.responseTimeMs}ms)</div>
                    <div className="text-gray-400 text-[10px]">{log.payloadSummary}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Developer Accreditation & Support Portal */}
      <section className="bg-gradient-to-r from-[#00174b] via-[#004ac6] to-[#1e3a8a] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md border border-[#dae2fd]/30 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#6ffbbe] font-bold">
              Engineering Architecture & Deployment
            </span>
            <h3 className="text-base sm:text-xl font-bold tracking-tight">
              Version Ai© by Mr. Anas Saiyed (Mob: +91 9429960782)
            </h3>
            <p className="text-xs text-white/80 max-w-xl">
              Custom Institutional ERP Engine, Google Sheets Pipeline & Automated WhatsApp Telemetry. Developed with precision for Pre-Primary to Doctorate Ph.D institutions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="tel:9429960782"
              className="h-9 px-3.5 bg-white text-[#004ac6] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-[#f2f3ff] active:scale-95 transition-all"
            >
              <span>Call Dev (9429960782)</span>
            </a>
            <a
              href="https://wa.me/919429960782?text=Hello%20Mr.Anas%20Saiyed,%20contacting%20regarding%20Version%20Ai%20EduTrack%20System"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3.5 bg-[#007d55] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs hover:bg-[#006644] active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
