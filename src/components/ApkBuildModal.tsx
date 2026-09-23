import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'quick' | 'capacitor' | 'pwabuilder' | 'bubblewrap'>('quick');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadBuildScript = () => {
    const scriptContent = `#!/bin/bash
# EduTrack Pro - Android APK Build Automation Script
echo "=================================================="
echo "    EduTrack Pro Android APK Build Generator     "
echo "=================================================="

# 1. Install dependencies
echo "[1/4] Building web production assets..."
npm run build

# 2. Initialize Capacitor Android if not already present
if [ ! -d "android" ]; then
  echo "[2/4] Adding Android platform via Capacitor..."
  npx cap add android
fi

# 3. Sync Web Assets to Android Studio Project
echo "[3/4] Syncing web dist to native Android wrapper..."
npx cap sync android

# 4. Build Debug APK
echo "[4/4] Building APK with Gradle..."
if [ -f "android/gradlew" ]; then
  cd android
  ./gradlew assembleDebug
  echo "=================================================="
  echo " SUCCESS! APK generated at:"
  echo " android/app/build/outputs/apk/debug/app-debug.apk"
  echo "=================================================="
else
  echo "Capacitor project ready! Opening in Android Studio..."
  npx cap open android
fi
`;

    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-android-apk.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded build-android-apk.sh build script!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#131b2e]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#eaedff] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#004ac6] to-[#1d2d5a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="material-symbols-outlined text-[26px] text-[#00d68f]">
                android
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Android APK & Mobile Deployment</h3>
              <p className="text-xs text-white/80">Generate native Android APK or install standalone app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#f2f3ff] px-4 pt-2 border-b border-[#dae2fd] overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quick'
                ? 'bg-white text-[#004ac6] border-[#004ac6] shadow-sm'
                : 'text-[#434655] border-transparent hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            1-Click Mobile Install
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'bg-white text-[#004ac6] border-[#004ac6] shadow-sm'
                : 'text-[#434655] border-transparent hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            Capacitor APK Build
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-white text-[#004ac6] border-[#004ac6] shadow-sm'
                : 'text-[#434655] border-transparent hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_download</span>
            PWABuilder Cloud APK
          </button>
          <button
            onClick={() => setActiveTab('bubblewrap')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bubblewrap'
                ? 'bg-white text-[#004ac6] border-[#004ac6] shadow-sm'
                : 'text-[#434655] border-transparent hover:text-[#131b2e]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            Google TWA / Bubblewrap
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: 1-Click PWA Install */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#dae2fd] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">phone_android</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#131b2e]">Instant Web App Installation (PWA)</h4>
                    <p className="text-xs text-[#737686] mt-0.5">
                      Installs directly on your Android phone or tablet without needing an app store. Features offline support, splash screen, and full-screen native experience.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {isInstallable && (
                    <button
                      onClick={install}
                      className="h-11 px-5 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                      Install App on this Device
                    </button>
                  )}

                  {isInstalled && (
                    <div className="px-4 py-2.5 bg-[#bdffdb] text-[#002113] rounded-xl text-xs font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      App is already installed and running standalone!
                    </div>
                  )}

                  {!isInstallable && !isInstalled && (
                    <div className="px-3.5 py-2 bg-white rounded-xl border border-[#dae2fd] text-xs text-[#434655] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#004ac6] text-[18px]">info</span>
                      Open in Chrome on Android: Tap <strong>⋮ (Menu) → Add to Home Screen / Install App</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* iOS instructions */}
              {isIOS && (
                <div className="bg-[#fff8e1] p-4 rounded-2xl border border-[#ffe082] space-y-2">
                  <div className="flex items-center gap-2 text-[#b78103] font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">apple</span>
                    Install on Apple iOS (iPhone / iPad)
                  </div>
                  <p className="text-xs text-[#5d4037]">
                    Tap the <strong>Share</strong> icon in Safari, scroll down, and select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              )}

              {/* Android Features Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-center space-y-1 shadow-sm">
                  <span className="material-symbols-outlined text-[#007d55] text-[20px]">wifi_off</span>
                  <p className="text-xs font-bold text-[#131b2e]">Offline Cached</p>
                  <span className="text-[10px] text-[#737686] block">Works without active internet</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-center space-y-1 shadow-sm">
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">fullscreen</span>
                  <p className="text-xs font-bold text-[#131b2e]">Full Screen</p>
                  <span className="text-[10px] text-[#737686] block">Hides browser URL bars</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#eaedff] text-center space-y-1 shadow-sm col-span-2 sm:col-span-1">
                  <span className="material-symbols-outlined text-[#8e44ad] text-[20px]">sync</span>
                  <p className="text-xs font-bold text-[#131b2e]">Auto-Updating</p>
                  <span className="text-[10px] text-[#737686] block">Instant latest builds</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Capacitor Native Android APK */}
          {activeTab === 'capacitor' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131b2e]">Build Real .APK with Capacitor CLI:</span>
                <button
                  onClick={handleDownloadBuildScript}
                  className="px-3 py-1 bg-[#eaedff] hover:bg-[#dae2fd] text-[#004ac6] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Download build-android-apk.sh
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <div className="bg-[#131b2e] text-white p-3.5 rounded-xl font-mono text-xs space-y-2 border border-[#2d3748]">
                  <div className="flex items-center justify-between text-[#a0aec0] text-[11px] pb-1 border-b border-white/10">
                    <span>STEP 1: Build & Initialize Android Platform</span>
                    <button
                      onClick={() =>
                        copyToClipboard('npm run build && npx cap add android && npx cap sync', 'Step 1 Command')
                      }
                      className="hover:text-white transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === 'Step 1 Command' ? 'check' : 'content_copy'}
                      </span>
                      {copiedIndex === 'Step 1 Command' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[#00d68f]">npm run build</p>
                  <p className="text-[#00d68f]">npx cap add android</p>
                  <p className="text-[#00d68f]">npx cap sync</p>
                </div>

                <div className="bg-[#131b2e] text-white p-3.5 rounded-xl font-mono text-xs space-y-2 border border-[#2d3748]">
                  <div className="flex items-center justify-between text-[#a0aec0] text-[11px] pb-1 border-b border-white/10">
                    <span>STEP 2: Generate APK via Gradle or Android Studio</span>
                    <button
                      onClick={() =>
                        copyToClipboard('cd android && ./gradlew assembleDebug', 'Step 2 Command')
                      }
                      className="hover:text-white transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === 'Step 2 Command' ? 'check' : 'content_copy'}
                      </span>
                      {copiedIndex === 'Step 2 Command' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[#38bdf8]"># Option A: Command Line direct APK build</p>
                  <p className="text-[#00d68f]">cd android && ./gradlew assembleDebug</p>
                  <p className="text-[#38bdf8] pt-1"># Option B: Open in Android Studio GUI</p>
                  <p className="text-[#00d68f]">npx cap open android</p>
                </div>
              </div>

              <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#dae2fd] text-xs text-[#434655]">
                <strong className="text-[#131b2e] block">Output APK Location:</strong>
                <code className="text-[11px] font-mono text-[#004ac6] bg-white px-1.5 py-0.5 rounded mt-1 inline-block border border-[#dae2fd]">
                  android/app/build/outputs/apk/debug/app-debug.apk
                </code>
              </div>
            </div>
          )}

          {/* TAB 3: PWABuilder Cloud APK */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-3.5">
              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#dae2fd] space-y-3">
                <div className="flex items-center gap-2 text-[#004ac6] font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                  Microsoft PWABuilder (Zero Code Cloud APK Package)
                </div>
                <p className="text-xs text-[#737686]">
                  Microsoft PWABuilder automatically packages your live progressive web app into signed Android packages (APK / AAB) ready to sideload or submit to the Google Play Store.
                </p>

                <div className="p-3 bg-white rounded-xl border border-[#dae2fd] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#737686] uppercase">Your App Live URL:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="w-full text-xs font-mono bg-[#f2f3ff] px-2.5 py-1.5 rounded-lg border border-[#dae2fd] text-[#131b2e]"
                    />
                    <button
                      onClick={() => copyToClipboard(currentUrl, 'Live URL')}
                      className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copy
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-full bg-[#007d55] hover:bg-[#00966b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Generate Android APK on PWABuilder
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Bubblewrap CLI */}
          {activeTab === 'bubblewrap' && (
            <div className="space-y-3.5">
              <div className="bg-[#f2f3ff] p-4 rounded-2xl border border-[#dae2fd] space-y-3">
                <div className="flex items-center gap-2 text-[#004ac6] font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">terminal</span>
                  Google Official Bubblewrap CLI (Trusted Web Activity)
                </div>
                <p className="text-xs text-[#737686]">
                  Bubblewrap is Google Chrome's command-line tool that turns Progressive Web Apps into Google Play-ready Android APK and AAB packages.
                </p>

                <div className="bg-[#131b2e] text-white p-3 rounded-xl font-mono text-xs space-y-2 border border-[#2d3748]">
                  <div className="flex items-center justify-between text-[#a0aec0] text-[11px] pb-1 border-b border-white/10">
                    <span>Run in Terminal:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `npm i -g @bubblewrap/cli\nbubblewrap init --manifest=${currentUrl}/manifest.webmanifest\nbubblewrap build`,
                          'Bubblewrap Commands'
                        )
                      }
                      className="hover:text-white transition-colors flex items-center gap-1"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedIndex === 'Bubblewrap Commands' ? 'check' : 'content_copy'}
                      </span>
                      {copiedIndex === 'Bubblewrap Commands' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[#a0aec0]"># 1. Install Google Bubblewrap</p>
                  <p className="text-[#00d68f]">npm i -g @bubblewrap/cli</p>
                  <p className="text-[#a0aec0] pt-1"># 2. Initialize from manifest</p>
                  <p className="text-[#00d68f]">bubblewrap init --manifest={currentUrl}/manifest.webmanifest</p>
                  <p className="text-[#a0aec0] pt-1"># 3. Build signed APK</p>
                  <p className="text-[#00d68f]">bubblewrap build</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f2f3ff] border-t border-[#dae2fd] flex items-center justify-between">
          <span className="text-[11px] text-[#737686] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#007d55]">verified</span>
            PWA Manifest & Maskable Icons Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#eaedff] text-[#131b2e] text-xs font-bold rounded-xl border border-[#dae2fd] transition-colors"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
