import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  Check,
  X,
  Zap,
  AlertCircle,
  Upload,
  Sparkles,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Student Live Photo Camera',
  subtitle = 'Position the student face within the guide frame',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isFlashing, setIsFlashing] = useState(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Play synthetic camera shutter audio using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    } catch {
      // Audio playback fails gracefully if muted/unsupported
    }
  };

  // Start Camera Stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsLoadingCamera(true);
    setErrorMsg(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      console.warn('Camera error:', err);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in browser settings or upload a file.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera device was detected on your system. Please connect a webcam or upload a photo.');
      } else {
        setErrorMsg('Unable to access camera. Please check permissions or upload a photo directly.');
      }
    } finally {
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setErrorMsg(null);
      setShowAdjustments(false);
      setBrightness(100);
      setContrast(100);
      startCamera(facingMode);
    } else {
      // Clean up stream on close
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Flip Camera Front / Back
  const toggleCameraFacing = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Perform Capture
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;

    // Crop to square portrait center
    const size = Math.min(videoW, videoH);
    const startX = (videoW - size) / 2;
    const startY = (videoH - size) / 2;

    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image naturally
    if (facingMode === 'user') {
      ctx.translate(480, 0);
      ctx.scale(-1, 1);
    }

    // Apply brightness/contrast filter
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 480, 480);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    setCapturedPhoto(dataUrl);

    // Stop stream while previewing photo
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Trigger Countdown and Capture
  const handleSnapWithCountdown = (seconds = 3) => {
    if (isCountingDown) return;
    setIsCountingDown(true);
    setCountdown(seconds);

    let current = seconds;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        setIsCountingDown(false);
        captureSnapshot();
      }
    }, 1000);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  // Fallback file upload
  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#111827] text-white w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#1f2937] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#004ac6] flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{title}</h3>
              <p className="text-[11px] text-gray-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden">
          {/* Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />
          )}

          {/* Countdown Indicator */}
          {isCountingDown && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <div className="w-24 h-24 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-5xl font-black shadow-2xl animate-bounce">
                {countdown}
              </div>
            </div>
          )}

          {/* Error / Fallback View */}
          {errorMsg ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Camera Unavailable</h4>
                <p className="text-xs text-gray-400 mt-1">{errorMsg}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Camera</span>
                </button>
                <label className="w-full py-2.5 bg-[#004ac6] hover:bg-[#003899] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFallbackUpload}
                  />
                </label>
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Captured Photo Preview */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-[#004ac6] shadow-2xl bg-black">
                <img
                  src={capturedPhoto}
                  alt="Captured Student"
                  className="w-full h-full object-cover"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
                <div className="absolute top-2 left-2 bg-[#004ac6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  Passport Preview
                </div>
              </div>
              <p className="text-xs text-gray-300 mt-3 font-medium">
                Photo captured! Confirm or retake below.
              </p>
            </div>
          ) : (
            /* Live Camera Feed */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[380px] ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              />

              {/* Passport Photo Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-white/20 flex flex-col items-center justify-between py-4">
                    <span className="text-[10px] font-bold tracking-wider text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      STUDENT FACE GUIDE
                    </span>
                    <div className="w-20 h-0.5 bg-white/40 rounded-full" />
                    <span className="text-[9px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                      Keep shoulders level
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Action Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border border-white/10 active:scale-95"
                  title="Switch Camera (Front/Back)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{facingMode === 'user' ? 'Front' : 'Back'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustments(!showAdjustments)}
                  className={`p-2 rounded-full backdrop-blur-md border border-white/10 active:scale-95 ${
                    showAdjustments ? 'bg-[#004ac6] text-white' : 'bg-black/60 text-gray-300'
                  }`}
                  title="Photo Tuning"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sliders Adjustment Bar */}
        {showAdjustments && (
          <div className="p-3 bg-[#1e293b] border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-full accent-[#004ac6]"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                <span>Contrast</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                value={contrast}
                onChange={e => setContrast(Number(e.target.value))}
                className="w-full accent-[#004ac6]"
              />
            </div>
          </div>
        )}

        {/* Bottom Shutter & Controls Toolbar */}
        <div className="p-4 bg-[#1f2937] border-t border-white/10 flex items-center justify-between shrink-0">
          {capturedPhoto ? (
            /* Post-capture actions */
            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#004ac6] to-[#007d55] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Use Student Photo</span>
              </button>
            </div>
          ) : (
            /* Live Shutter Mode */
            <div className="w-full flex items-center justify-between">
              {/* 3s Timer button */}
              <button
                type="button"
                onClick={() => handleSnapWithCountdown(3)}
                disabled={isCountingDown || isLoadingCamera || !!errorMsg}
                className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                title="3 Second Timer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>3s Timer</span>
              </button>

              {/* Central Shutter Button */}
              <button
                type="button"
                onClick={captureSnapshot}
                disabled={isLoadingCamera || !!errorMsg}
                className="w-16 h-16 rounded-full border-4 border-white/40 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 shadow-xl"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#004ac6]">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              {/* Upload fallback button */}
              <label className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFallbackUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
