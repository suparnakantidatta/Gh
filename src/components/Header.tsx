import React from 'react';
import { Sparkles, Video, Image, Camera, History, Download, RefreshCw, Wand2 } from 'lucide-react';

interface HeaderProps {
  activeMode: 'image' | 'video' | 'motion' | 'live';
  setActiveMode: (mode: 'image' | 'video' | 'motion' | 'live') => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenPresets: (type: 'source' | 'target') => void;
  onResetAll: () => void;
  onExport: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  setActiveMode,
  historyCount,
  onOpenHistory,
  onOpenPresets,
  onResetAll,
  onExport,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0e17]/90 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0b0e17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                FaceMorph <span className="text-indigo-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Studio Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-time Image &amp; Video Face Swap powered by Gemini AI
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveMode('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'image'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Image Swap</span>
          </button>

          <button
            onClick={() => setActiveMode('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'video'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Swap</span>
          </button>

          <button
            onClick={() => setActiveMode('motion')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'motion'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1.5">
              Motion Transfer
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                NEW
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveMode('live')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeMode === 'live'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1.5">
              Live Webcam
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            </span>
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAll}
            title="Reset everything"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gallery</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onExport}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
