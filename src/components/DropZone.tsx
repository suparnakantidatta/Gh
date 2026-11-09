import React, { useRef, useState } from 'react';
import {
  Upload,
  Camera,
  Users,
  Film,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  Sparkles,
  Link as LinkIcon,
  Clipboard,
  ArrowLeftRight,
  FolderOpen,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { TargetMediaItem } from '../types';

interface DropZoneProps {
  sourceImage: string | null;
  onSelectSourceImage: (url: string) => void;
  onClearSource: () => void;
  targetMedia: TargetMediaItem | null;
  onSelectTargetMedia: (item: TargetMediaItem) => void;
  onClearTarget: () => void;
  onOpenWebcam: () => void;
  onOpenSourcePresets: () => void;
  onOpenTargetPresets: () => void;
  onSwapSourceAndTarget?: () => void;
  activeMode: 'image' | 'video' | 'motion' | 'live';
}

export const DropZone: React.FC<DropZoneProps> = ({
  sourceImage,
  onSelectSourceImage,
  onClearSource,
  targetMedia,
  onSelectTargetMedia,
  onClearTarget,
  onOpenWebcam,
  onOpenSourcePresets,
  onOpenTargetPresets,
  onSwapSourceAndTarget,
  activeMode,
}) => {
  const [sourceDragOver, setSourceDragOver] = useState(false);
  const [targetDragOver, setTargetDragOver] = useState(false);
  const [showSourceUrlInput, setShowSourceUrlInput] = useState(false);
  const [showTargetUrlInput, setShowTargetUrlInput] = useState(false);
  const [sourceUrlText, setSourceUrlText] = useState('');
  const [targetUrlText, setTargetUrlText] = useState('');

  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSourceDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onSelectSourceImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTargetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setTargetDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (isVideo || isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const resultUrl = event.target.result as string;
            onSelectTargetMedia({
              id: 'custom-target-' + Date.now(),
              title: file.name,
              type: isVideo ? 'video' : 'image',
              url: resultUrl,
              thumbnailUrl: isVideo ? '' : resultUrl,
              category: 'cinematic',
              defaultFaceBox: { x: 30, y: 15, width: 40, height: 45 },
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectSourceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultUrl = event.target.result as string;
          onSelectTargetMedia({
            id: 'custom-target-' + Date.now(),
            title: file.name,
            type: isVideo ? 'video' : 'image',
            url: resultUrl,
            thumbnailUrl: isVideo ? '' : resultUrl,
            category: 'cinematic',
            defaultFaceBox: { x: 30, y: 15, width: 40, height: 45 },
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySourceUrl = () => {
    if (sourceUrlText.trim()) {
      onSelectSourceImage(sourceUrlText.trim());
      setSourceUrlText('');
      setShowSourceUrlInput(false);
    }
  };

  const handleApplyTargetUrl = () => {
    if (targetUrlText.trim()) {
      const isVideo = targetUrlText.endsWith('.mp4') || targetUrlText.endsWith('.webm');
      onSelectTargetMedia({
        id: 'url-target-' + Date.now(),
        title: 'Remote Media',
        type: isVideo ? 'video' : 'image',
        url: targetUrlText.trim(),
        thumbnailUrl: isVideo ? '' : targetUrlText.trim(),
        category: 'cinematic',
        defaultFaceBox: { x: 30, y: 15, width: 40, height: 45 },
      });
      setTargetUrlText('');
      setShowTargetUrlInput(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                onSelectSourceImage(ev.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch {
      // Browser permissions fallback
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Quick Actions Bar for Uploads */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>Upload Options:</span>
          </span>

          {/* Primary Upload Source Button */}
          <button
            onClick={() => sourceFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            title="Upload source face from your computer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Source Face</span>
          </button>

          {/* Primary Upload Target Button */}
          <button
            onClick={() => targetFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/25 transition-all active:scale-95"
            title="Upload target image or video from your computer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Target Media</span>
          </button>

          {/* Paste from Clipboard */}
          <button
            onClick={handlePasteClipboard}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Paste copied image from clipboard (Ctrl+V)"
          >
            <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paste Clipboard</span>
          </button>
        </div>

        {/* Swap direction button if handler provided */}
        {onSwapSourceAndTarget && (
          <button
            onClick={onSwapSourceAndTarget}
            disabled={!sourceImage || !targetMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95"
            title="Swap Source and Target roles"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Swap Source ⇄ Target</span>
          </button>
        )}
      </div>

      {/* Main Dual Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hidden File Inputs */}
        <input
          ref={sourceFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSourceFileChange}
        />
        <input
          ref={targetFileInputRef}
          type="file"
          accept={activeMode === 'video' ? 'video/mp4,video/webm,image/*' : 'image/*,video/mp4,video/webm'}
          className="hidden"
          onChange={handleTargetFileChange}
        />

        {/* 1. SOURCE FACE DROPZONE */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setSourceDragOver(true);
          }}
          onDragLeave={() => setSourceDragOver(false)}
          onDrop={handleSourceDrop}
          className={`relative rounded-2xl p-4 transition-all duration-300 border ${
            sourceDragOver
              ? 'border-indigo-400 bg-indigo-950/40 shadow-xl shadow-indigo-500/20 scale-[1.01]'
              : sourceImage
              ? 'border-indigo-500/40 bg-slate-900/70'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20'
          } backdrop-blur-md flex flex-col justify-between`}
        >
          {/* Header line */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  1
                </span>
                <h3 className="text-sm font-semibold text-slate-200">
                  {activeMode === 'motion' ? 'Target Portrait (To Animate)' : 'Source Face (Donor)'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {sourceImage && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Loaded</span>
                  </div>
                )}
                <button
                  onClick={() => setShowSourceUrlInput(!showSourceUrlInput)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Enter Image URL"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* URL Input dropdown */}
            {showSourceUrlInput && (
              <div className="mb-3 p-2 rounded-xl bg-slate-950 border border-indigo-500/40 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Paste image URL (https://...)"
                  value={sourceUrlText}
                  onChange={(e) => setSourceUrlText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={handleApplySourceUrl}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow"
                >
                  Apply
                </button>
              </div>
            )}

            {sourceImage ? (
              <div className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
                <img
                  src={sourceImage}
                  alt="Source Face"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => sourceFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New</span>
                    </button>
                    <button
                      onClick={onClearSource}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-xs text-rose-200 border border-rose-700/50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 transition-colors aspect-[4/3] bg-slate-950/30">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200 mb-1 text-center">
                  Drag &amp; drop source face image
                </p>
                <p className="text-xs text-slate-400 mb-4 text-center">
                  Click below to upload from your files or select presets
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => sourceFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Source Image</span>
                  </button>

                  <button
                    onClick={onOpenWebcam}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>Webcam</span>
                  </button>

                  <button
                    onClick={onOpenSourcePresets}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-all active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Presets</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Persistent Upload Action Button */}
          {sourceImage && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => sourceFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload different source</span>
              </button>
              <button
                onClick={onOpenSourcePresets}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Choose from presets
              </button>
            </div>
          )}
        </div>

        {/* 2. TARGET MEDIA DROPZONE */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setTargetDragOver(true);
          }}
          onDragLeave={() => setTargetDragOver(false)}
          onDrop={handleTargetDrop}
          className={`relative rounded-2xl p-4 transition-all duration-300 border ${
            targetDragOver
              ? 'border-purple-400 bg-purple-950/40 shadow-xl shadow-purple-500/20 scale-[1.01]'
              : targetMedia
              ? 'border-purple-500/40 bg-slate-900/70'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20'
          } backdrop-blur-md flex flex-col justify-between`}
        >
          {/* Header line */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                  2
                </span>
                <h3 className="text-sm font-semibold text-slate-200">
                  {activeMode === 'motion'
                    ? 'Driving Motion Video / Feed'
                    : activeMode === 'video'
                    ? 'Target Video Clip'
                    : 'Target Scene / Subject'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {targetMedia && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {targetMedia.type === 'video' ? <Film className="w-3 h-3 text-purple-400" /> : <Eye className="w-3 h-3 text-purple-400" />}
                    <span className="capitalize">{targetMedia.type} Loaded</span>
                  </div>
                )}
                <button
                  onClick={() => setShowTargetUrlInput(!showTargetUrlInput)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Enter Media URL"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* URL Input dropdown */}
            {showTargetUrlInput && (
              <div className="mb-3 p-2 rounded-xl bg-slate-950 border border-purple-500/40 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Paste video or image URL (https://...)"
                  value={targetUrlText}
                  onChange={(e) => setTargetUrlText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={handleApplyTargetUrl}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
                >
                  Apply
                </button>
              </div>
            )}

            {targetMedia ? (
              <div className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
                {targetMedia.type === 'video' ? (
                  <video
                    src={targetMedia.url}
                    className="w-full h-full object-cover object-center"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={targetMedia.url}
                    alt={targetMedia.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {/* Title chip */}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] font-medium text-slate-200 border border-white/10">
                  {targetMedia.title}
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => targetFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Target</span>
                    </button>
                    <button
                      onClick={onClearTarget}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-xs text-rose-200 border border-rose-700/50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-6 transition-colors aspect-[4/3] bg-slate-950/30">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  {activeMode === 'video' ? <Film className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-sm font-semibold text-slate-200 mb-1 text-center">
                  Drag &amp; drop {activeMode === 'video' ? 'video file (MP4, WEBM)' : 'target image or video'}
                </p>
                <p className="text-xs text-slate-400 mb-4 text-center">
                  Click below to upload from your files or select scenes
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => targetFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Target {activeMode === 'video' ? 'Video' : 'Media'}</span>
                  </button>

                  <button
                    onClick={onOpenTargetPresets}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Browse Scenes</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Persistent Upload Action Button */}
          {targetMedia && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => targetFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload different target</span>
              </button>
              <button
                onClick={onOpenTargetPresets}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Choose from scenes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
