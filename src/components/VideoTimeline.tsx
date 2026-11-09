import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Download,
  Repeat,
  FastForward,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  canvasRef?: HTMLCanvasElement | null;
  onExportVideo: () => void;
  isExportingVideo: boolean;
  exportProgress: number;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  duration,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
  playbackRate,
  onChangePlaybackRate,
  isLooping,
  onToggleLoop,
  onExportVideo,
  isExportingVideo,
  exportProgress,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 shadow-xl">
      {/* Video Progress Bar & Keyframe Track */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
          <span className="text-indigo-400 font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-500">Track: 30 FPS Face Swap</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Interactive Scrub Bar */}
        <div className="relative group">
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer appearance-none accent-indigo-500 group-hover:h-2.5 transition-all"
          />

          {/* Keyframe indicators */}
          <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none flex justify-around">
            {[0.1, 0.25, 0.45, 0.7, 0.9].map((pos, idx) => (
              <div
                key={idx}
                style={{ left: `${pos * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"
                title={`Keyframe #${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Playback Controls & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Play / Pause / Rewind */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSeek(0)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-xl border transition-colors ${
              isLooping
                ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-400'
                : 'border-transparent bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-0.5">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => onChangePlaybackRate(rate)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  playbackRate === rate
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Video Render & Export Button */}
        <div>
          {isExportingVideo ? (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Rendering Video: {Math.round(exportProgress)}%</span>
            </div>
          ) : (
            <button
              onClick={onExportVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Rendered Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
