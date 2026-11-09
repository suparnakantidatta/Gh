import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Zap, Users, Sliders, AlertCircle, Video } from 'lucide-react';
import { PRESET_SOURCE_FACES } from '../utils/presets';
import { renderFaceSwap } from '../utils/faceSwapEngine';
import { SwapSettings, Rect } from '../types';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: string | null;
  onSelectSourceImage: (url: string) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  sourceImage,
  onSelectSourceImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenSourceRef = useRef<HTMLImageElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>(
    sourceImage || PRESET_SOURCE_FACES[0].imageUrl
  );
  const [blendOpacity, setBlendOpacity] = useState(85);
  const [skinMatch, setSkinMatch] = useState(70);
  const [fps, setFps] = useState(30);

  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (sourceImage) {
      setSelectedPersona(sourceImage);
    }
  }, [sourceImage]);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    async function initCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera live stream error:', err);
        setCameraError('Unable to access webcam. Please check browser permissions.');
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen]);

  // Real-time animation loop for live camera face swap
  const renderLiveLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const sourceEl = hiddenSourceRef.current;

    if (video && canvas && video.readyState >= 2) {
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
      }

      const targetFaceBox: Rect = {
        x: vw * 0.3,
        y: vh * 0.18,
        width: vw * 0.4,
        height: vh * 0.5,
      };

      const settings: SwapSettings = {
        blendMode: 'seamless',
        skinToneMatch: skinMatch,
        featherRadius: 20,
        opacity: blendOpacity,
        scale: 1.05,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        lightingMatch: 80,
        colorWarmth: 0,
        contrast: 5,
        preserveExpression: true,
        showLandmarks: false,
        showSplitView: false,
        splitPosition: 50,
      };

      renderFaceSwap(canvas, video, sourceEl, null, targetFaceBox, settings);

      // FPS tracking
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderLiveLoop);
  }, [skinMatch, blendOpacity]);

  useEffect(() => {
    if (isOpen && stream) {
      animFrameIdRef.current = requestAnimationFrame(renderLiveLoop);
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen, stream, renderLiveLoop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hidden video and source image */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <img ref={hiddenSourceRef} src={selectedPersona} alt="" className="hidden" crossOrigin="anonymous" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Live Real-Time Webcam Face Swapper</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                {fps} FPS LIVE
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Canvas Viewport */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[360px] p-2">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-sm max-w-sm flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="max-h-[460px] max-w-full rounded-xl shadow-xl object-contain -scale-x-100"
            />
          )}

          {/* Quick HUD info */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300 pointer-events-none">
            Face alignment locked to center
          </div>
        </div>

        {/* Bottom Persona Switcher & Controls */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Live Swap Persona:</span>
            </span>

            {/* Quick sliders */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Opacity:</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={blendOpacity}
                  onChange={(e) => setBlendOpacity(parseInt(e.target.value, 10))}
                  className="w-20 h-1.5 accent-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Skin Match:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skinMatch}
                  onChange={(e) => setSkinMatch(parseInt(e.target.value, 10))}
                  className="w-20 h-1.5 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Persona avatars row */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
            {PRESET_SOURCE_FACES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPersona(p.imageUrl);
                  onSelectSourceImage(p.imageUrl);
                }}
                className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedPersona === p.imageUrl
                    ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
                    : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                }`}
              >
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
