import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  SplitSquareVertical,
  Activity,
  Move,
  Sparkles,
  Info
} from 'lucide-react';
import { renderFaceSwap, renderMotionTransfer } from '../utils/faceSwapEngine';
import { SwapSettings, TargetMediaItem, Rect, MotionSettings } from '../types';

interface StudioCanvasProps {
  sourceImage: string | null;
  targetMedia: TargetMediaItem | null;
  settings: SwapSettings;
  onUpdateSettings: (updater: (prev: SwapSettings) => SwapSettings) => void;
  isAiProcessing: boolean;
  aiProcessingStep: string;
  aiSwappedImageUrl: string | null;
  currentTime?: number;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  activeMode?: 'image' | 'video' | 'motion' | 'live';
  motionSettings?: MotionSettings;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  sourceImage,
  targetMedia,
  settings,
  onUpdateSettings,
  isAiProcessing,
  aiProcessingStep,
  aiSwappedImageUrl,
  currentTime,
  onCanvasReady,
  activeMode = 'image',
  motionSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenTargetImgRef = useRef<HTMLImageElement>(null);
  const hiddenSourceImgRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isDraggingFace, setIsDraggingFace] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(60);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Sync Video time if target is video
  useEffect(() => {
    if (hiddenVideoRef.current && typeof currentTime === 'number' && targetMedia?.type === 'video') {
      hiddenVideoRef.current.currentTime = currentTime;
    }
  }, [currentTime, targetMedia]);

  // Main Render Loop
  const renderCanvas = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (onCanvasReady) {
        onCanvasReady(canvas);
      }

      // If we have an AI swapped image result and not showing split or in AI mode
      if (aiSwappedImageUrl && settings.blendMode === 'ai_deep') {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const aiImg = new Image();
        aiImg.crossOrigin = 'anonymous';
        aiImg.src = aiSwappedImageUrl;
        aiImg.onload = () => {
          canvas.width = aiImg.naturalWidth || 800;
          canvas.height = aiImg.naturalHeight || 600;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(aiImg, 0, 0);

          if (settings.showSplitView && hiddenTargetImgRef.current && hiddenTargetImgRef.current.complete && hiddenTargetImgRef.current.naturalWidth > 0) {
            // Draw split line
            const splitX = (canvas.width * settings.splitPosition) / 100;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, splitX, canvas.height);
            ctx.clip();
            ctx.drawImage(hiddenTargetImgRef.current, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Split divider line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(splitX, 0);
            ctx.lineTo(splitX, canvas.height);
            ctx.stroke();
          }
        };
        return;
      }

      // If activeMode is 'motion', render real-time neural motion transfer
      if (activeMode === 'motion' && hiddenSourceImgRef.current && hiddenSourceImgRef.current.complete && hiddenSourceImgRef.current.naturalWidth > 0) {
        const portrait = hiddenSourceImgRef.current;
        const pw = portrait.naturalWidth || 800;
        const ph = portrait.naturalHeight || 600;
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
        }
        const t = typeof currentTime === 'number' && currentTime > 0 ? currentTime : performance.now() / 1000;
        renderMotionTransfer(
          canvas,
          portrait,
          t,
          motionSettings || {
            expressionIntensity: 100,
            headPoseTransfer: true,
            headRotationScale: 100,
            eyeBlinkSync: true,
            lipSyncTransfer: true,
            gazeTracking: true,
            motionStabilization: 40,
            drivingPreset: 'talking',
          },
          settings
        );

        // FPS tracking
        const now = performance.now();
        frameCountRef.current++;
        if (now - lastFrameTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }
        return;
      }

      if (!targetMedia) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 800;
          canvas.height = 600;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 800, 600);
        }
        return;
      }

      const targetElement = targetMedia.type === 'video' ? hiddenVideoRef.current : hiddenTargetImgRef.current;
      if (!targetElement) return;

      // Check media dimensions
      let mediaW = 0;
      let mediaH = 0;
      if (targetMedia.type === 'video' && hiddenVideoRef.current) {
        if (hiddenVideoRef.current.readyState < 2) return;
        mediaW = hiddenVideoRef.current.videoWidth || 800;
        mediaH = hiddenVideoRef.current.videoHeight || 600;
      } else if (hiddenTargetImgRef.current) {
        if (!hiddenTargetImgRef.current.complete || hiddenTargetImgRef.current.naturalWidth === 0) return;
        mediaW = hiddenTargetImgRef.current.naturalWidth || 800;
        mediaH = hiddenTargetImgRef.current.naturalHeight || 600;
      }

      if (mediaW === 0 || mediaH === 0) return;

      if (canvas.width !== mediaW || canvas.height !== mediaH) {
        canvas.width = mediaW;
        canvas.height = mediaH;
      }

      const defaultBox: Rect = targetMedia.defaultFaceBox
        ? {
            x: (mediaW * targetMedia.defaultFaceBox.x) / 100,
            y: (mediaH * targetMedia.defaultFaceBox.y) / 100,
            width: (mediaW * targetMedia.defaultFaceBox.width) / 100,
            height: (mediaH * targetMedia.defaultFaceBox.height) / 100,
          }
        : {
            x: mediaW * 0.3,
            y: mediaH * 0.2,
            width: mediaW * 0.4,
            height: mediaH * 0.45,
          };

      const sourceEl = hiddenSourceImgRef.current;

      renderFaceSwap(canvas, targetElement, sourceEl, null, defaultBox, settings);

      // Calculate FPS
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastFrameTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
    } catch (err) {
      console.warn('Canvas render error avoided:', err);
    }
  }, [targetMedia, settings, aiSwappedImageUrl, onCanvasReady, activeMode, motionSettings, currentTime]);

  // Keep rendering on video play, motion mode, or parameter changes
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvas();
      if (targetMedia?.type === 'video' || activeMode === 'motion') {
        animId = requestAnimationFrame(loop);
      }
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas, targetMedia, activeMode]);

  // Handle Mouse / Touch interaction for Split Slider & Face dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const canvasX = (mouseX / rect.width) * 100;

    // Check if clicking near the split line
    if (settings.showSplitView && Math.abs(canvasX - settings.splitPosition) < 5) {
      setIsDraggingSplit(true);
      return;
    }

    // Otherwise initiate face drag offset
    setIsDraggingFace(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingSplit) {
      const mouseX = e.clientX - rect.left;
      const newPos = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      onUpdateSettings((prev) => ({ ...prev, splitPosition: newPos }));
      return;
    }

    if (isDraggingFace) {
      const deltaX = (e.clientX - dragStart.x) * 0.5;
      const deltaY = (e.clientY - dragStart.y) * 0.5;
      onUpdateSettings((prev) => ({
        ...prev,
        offsetX: Math.max(-100, Math.min(100, prev.offsetX + deltaX)),
        offsetY: Math.max(-100, Math.min(100, prev.offsetY + deltaY)),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSplit(false);
    setIsDraggingFace(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[520px] lg:h-[620px]">
      {/* Hidden media elements for canvas sampling */}
      {sourceImage && (
        <img
          ref={hiddenSourceImgRef}
          src={sourceImage}
          alt=""
          className="hidden"
          crossOrigin="anonymous"
          onLoad={renderCanvas}
        />
      )}
      {targetMedia && targetMedia.type === 'image' && (
        <img
          ref={hiddenTargetImgRef}
          src={targetMedia.url}
          alt=""
          className="hidden"
          crossOrigin="anonymous"
          onLoad={renderCanvas}
        />
      )}
      {targetMedia && targetMedia.type === 'video' && (
        <video
          ref={hiddenVideoRef}
          src={targetMedia.url}
          className="hidden"
          crossOrigin="anonymous"
          playsInline
          muted
          loop
          onLoadedData={renderCanvas}
          onSeeked={renderCanvas}
        />
      )}

      {/* Top Floating Overlay Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Left Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-medium text-slate-200 shadow-md">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{fps} FPS Real-Time</span>
          </div>

          {activeMode === 'motion' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/80 backdrop-blur-md border border-pink-500/40 text-[11px] font-semibold text-pink-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>3D Motion Transfer</span>
            </div>
          )}

          {settings.blendMode === 'ai_deep' && activeMode !== 'motion' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Deep Synthesis</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/60 backdrop-blur-md border border-white/5 text-[11px] text-slate-400">
            <Move className="w-3 h-3 text-slate-500" />
            <span>Drag face to reposition</span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          {/* Split Comparison Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((prev) => ({
                ...prev,
                showSplitView: !prev.showSplitView,
              }))
            }
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              settings.showSplitView
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Split-Screen Comparison (Before/After)"
          >
            <SplitSquareVertical className="w-4 h-4" />
          </button>

          {/* Wireframe Mesh Toggle */}
          <button
            onClick={() =>
              onUpdateSettings((prev) => ({
                ...prev,
                showLandmarks: !prev.showLandmarks,
              }))
            }
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              settings.showLandmarks
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Facial Landmark Mesh"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 px-1 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4 select-none"
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: isDraggingFace || isDraggingSplit ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-h-[440px] lg:max-h-[540px] max-w-full rounded-lg shadow-2xl object-contain border border-slate-800/80 bg-slate-900"
          />
        </div>

        {/* AI Processing Scanning Overlay */}
        {isAiProcessing && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {/* Animated Laser Grid */}
            <div className="relative w-28 h-28 mb-5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center overflow-hidden">
              <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scanline" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              AI Deep Neural Synthesis
            </h3>
            <p className="text-sm text-indigo-300 font-medium mb-4 max-w-md">
              {aiProcessingStep || 'Aligning facial features with Gemini...'}
            </p>

            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-pulse rounded-full w-full" />
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              Gemini 3.1 Neural Generation Pipeline
            </span>
          </div>
        )}

        {/* Bottom Split Slider Bar when Split View is Active */}
        {settings.showSplitView && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Original</span>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.splitPosition}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  splitPosition: parseFloat(e.target.value),
                }))
              }
              className="w-44 accent-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-indigo-400">Swapped</span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {Math.round(settings.splitPosition)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
