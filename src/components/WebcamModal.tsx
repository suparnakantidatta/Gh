import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCapturedPreview(null);
      setCountdown(null);
      setCameraError(null);
      return;
    }

    // Request webcam stream
    async function initCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 },
            facingMode: 'user',
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError('Camera access denied or not available. Please allow camera permissions.');
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleStartCapture = () => {
    if (countdown !== null) return;
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    // Flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontal flip
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPreview(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Capture Donor Face Selfie</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-sm max-w-sm flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
              <span>{cameraError}</span>
            </div>
          ) : capturedPreview ? (
            <img src={capturedPreview} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Face Guide Oval */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-68 rounded-[50%] border-2 border-dashed border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.3)] flex flex-col items-center justify-between py-4">
                  <span className="text-[10px] font-semibold text-indigo-300 bg-black/60 px-2 py-0.5 rounded-full">
                    Align Face Here
                  </span>
                  <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded-full">
                    Look Directly at Camera
                  </span>
                </div>
              </div>

              {/* Countdown Numbers */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="text-7xl font-extrabold text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Flash effect */}
              {flash && <div className="absolute inset-0 bg-white transition-opacity duration-300" />}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          {capturedPreview ? (
            <>
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Use This Face</span>
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-400">Position face in center frame</span>
              <button
                onClick={handleStartCapture}
                disabled={!!cameraError || countdown !== null}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Take Snapshot (3s)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
