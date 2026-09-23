import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CheckCircle2, Download, Share2, Smartphone, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  onOpenApkModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className, onOpenApkModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, show small badge or APK build helper
  if (isInstalled) {
    return (
      <button
        onClick={onOpenApkModal}
        className={
          className ||
          'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#bdffdb] text-[#002113] text-xs font-bold transition-all shadow-xs hover:opacity-90 active:scale-95'
        }
        title="App Installed - Click for APK & Mobile settings"
        type="button"
      >
        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#007d55] shrink-0" />
        <span className="whitespace-nowrap">Installed</span>
      </button>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          className ||
          'flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#2563eb] text-white text-xs font-bold transition-all shadow-xs active:scale-95'
        }
        type="button"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="whitespace-nowrap">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            className ||
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] text-xs font-bold transition-all active:scale-95'
          }
          type="button"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="whitespace-nowrap">Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-left border border-[#eaedff]">
              <div className="flex items-center justify-between pb-2 border-b border-[#f2f3ff]">
                <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-1.5">
                  <Smartphone className="w-5 h-5 text-[#004ac6] shrink-0" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#737686] hover:bg-[#eaedff]"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-[#434655] leading-relaxed">
                1. Tap the <strong className="text-[#004ac6]">Share button</strong> in Safari toolbar.<br />
                2. Scroll down and tap <strong className="text-[#004ac6]">"Add to Home Screen"</strong>.<br />
                3. Tap <strong className="text-[#004ac6]">Add</strong> to place EduTrack Pro on your home screen.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full h-10 rounded-xl bg-[#004ac6] text-white text-xs font-bold hover:bg-[#2563eb] transition-all"
                type="button"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button to open APK Hub modal
  return (
    <button
      onClick={onOpenApkModal}
      className={
        className ||
        'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#004ac6] border border-[#dae2fd] text-xs font-bold transition-all active:scale-95'
      }
      type="button"
      title="Build Android APK or Install"
    >
      <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#007d55] shrink-0" />
      <span className="whitespace-nowrap">Build APK</span>
    </button>
  );
};
