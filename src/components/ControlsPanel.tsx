import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  Maximize,
  Sun,
  ShieldCheck,
  RotateCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookmarkPlus,
  RefreshCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SwapSettings, AnalysisData } from '../types';

interface ControlsPanelProps {
  settings: SwapSettings;
  onUpdateSettings: (updater: (prev: SwapSettings) => SwapSettings) => void;
  onResetSettings: () => void;
  analysisData: AnalysisData | null;
  onRunAiAnalysis: () => void;
  isAnalyzing: boolean;
  onTriggerAiSwap: () => void;
  isAiProcessing: boolean;
  onSaveToHistory: () => void;
  hasSourceAndTarget: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  analysisData,
  onRunAiAnalysis,
  isAnalyzing,
  onTriggerAiSwap,
  isAiProcessing,
  onSaveToHistory,
  hasSourceAndTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'blend' | 'transform' | 'lighting' | 'analysis'>('blend');
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-5">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs font-medium w-full">
          <button
            onClick={() => setActiveTab('blend')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'blend'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Blending</span>
          </button>

          <button
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'transform'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Geometry</span>
          </button>

          <button
            onClick={() => setActiveTab('lighting')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'lighting'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Color &amp; Light</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Blending Controls */}
      {activeTab === 'blend' && (
        <div className="space-y-4">
          {/* Blend Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fusion Algorithm</span>
              </label>
              <span className="text-[11px] text-slate-400 capitalize">
                {settings.blendMode.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'seamless', label: 'Seamless Blend', desc: 'Poisson-style edge gradient' },
                { id: 'soft_feather', label: 'Soft Feather', desc: 'Gradual alpha falloff' },
                { id: 'color_transfer', label: 'Color Transfer', desc: 'Preserves target shadows' },
                { id: 'ai_deep', label: 'Deep AI Generative', desc: 'Gemini synthesis' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      blendMode: mode.id as any,
                    }))
                  }
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    settings.blendMode === mode.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold">{mode.label}</p>
                  <p className="text-[10px] text-slate-400 truncate">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone Matching Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Skin Tone Harmonization</span>
              </span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.skinToneMatch}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.skinToneMatch}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  skinToneMatch: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Edge Feather Radius Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Edge Feathering Radius</span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.featherRadius}px
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              value={settings.featherRadius}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  featherRadius: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Blend Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Blend Opacity</span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.opacity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.opacity}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  opacity: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Geometry & Transform Controls */}
      {activeTab === 'transform' && (
        <div className="space-y-4">
          {/* Scale Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Face Scale Size</span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.scale.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.02"
              value={settings.scale}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  scale: parseFloat(e.target.value),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rotation Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rotation Angle</span>
              </span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.rotation}°
              </span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={settings.rotation}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  rotation: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Position Offset X & Y */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Offset X</span>
                <span className="font-mono text-indigo-400 text-[11px]">
                  {Math.round(settings.offsetX)}px
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={settings.offsetX}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    offsetX: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Offset Y</span>
                <span className="font-mono text-indigo-400 text-[11px]">
                  {Math.round(settings.offsetY)}px
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={settings.offsetY}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    offsetY: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Alignment Reset */}
          <button
            onClick={() =>
              onUpdateSettings((prev) => ({
                ...prev,
                scale: 1.0,
                rotation: 0,
                offsetX: 0,
                offsetY: 0,
              }))
            }
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Reset Geometry to Center
          </button>
        </div>
      )}

      {/* Tab 3: Color & Lighting */}
      {activeTab === 'lighting' && (
        <div className="space-y-4">
          {/* Warmth Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Color Temperature / Warmth</span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.colorWarmth > 0 ? `+${settings.colorWarmth}` : settings.colorWarmth}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={settings.colorWarmth}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  colorWarmth: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">Lighting Contrast</span>
              <span className="font-mono text-indigo-400 text-[11px] font-semibold">
                {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={settings.contrast}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  contrast: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 4: AI Insights & Facial Compatibility */}
      {activeTab === 'analysis' && (
        <div className="space-y-3">
          {analysisData ? (
            <div className="space-y-3">
              {/* Compatibility Score Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                    Compatibility Index
                  </span>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>{analysisData.compatibilityScore}% Compatible</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-sm text-indigo-300">
                  {analysisData.compatibilityScore}
                </div>
              </div>

              {/* Head Poses */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Source Head Pose</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {analysisData.sourceFace?.headPose || 'Frontal'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Target Head Pose</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {analysisData.targetFace?.headPose || 'Frontal'}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {analysisData.blendRecommendations?.tips && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    AI Blend Recommendations:
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {analysisData.blendRecommendations.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 px-2">
              <Cpu className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-slate-200 mb-1">
                Gemini 3.8 Facial Landmark Analysis
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Analyze head orientation, gaze, lighting vectors, and skin undertones
              </p>
              <button
                onClick={onRunAiAnalysis}
                disabled={!hasSourceAndTarget || isAnalyzing}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                {isAnalyzing ? 'Analyzing Faces...' : 'Run Compatibility Scan'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Execution Action Buttons */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <button
          onClick={onTriggerAiSwap}
          disabled={!hasSourceAndTarget || isAiProcessing}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>
            {isAiProcessing ? 'Synthesizing with Gemini...' : 'Generate AI Deep Swap'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToHistory}
            disabled={!hasSourceAndTarget}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save Snapshot</span>
          </button>

          <button
            onClick={onResetSettings}
            title="Reset All Parameters"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
