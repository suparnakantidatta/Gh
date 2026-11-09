import React from 'react';
import {
  Wand2,
  Sliders,
  Eye,
  Smile,
  Rotate3d,
  Activity,
  ShieldCheck,
  Sparkles,
  Download,
  Film,
  RefreshCcw
} from 'lucide-react';
import { MotionSettings } from '../types';
import { PRESET_DRIVING_MOTIONS } from '../utils/presets';

interface MotionTransferPanelProps {
  motionSettings: MotionSettings;
  onUpdateMotionSettings: (updater: (prev: MotionSettings) => MotionSettings) => void;
  onSelectDrivingPreset: (presetId: string) => void;
  onExportMotionVideo: () => void;
  isExporting: boolean;
  exportProgress: number;
}

export const MotionTransferPanel: React.FC<MotionTransferPanelProps> = ({
  motionSettings,
  onUpdateMotionSettings,
  onSelectDrivingPreset,
  onExportMotionVideo,
  isExporting,
  exportProgress,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Motion Transfer Engine</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                LivePortrait
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Animate static faces with 3D driving motion</p>
          </div>
        </div>
      </div>

      {/* Driving Motion Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
          <Film className="w-3.5 h-3.5 text-pink-400" />
          <span>Driving Motion Template</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_DRIVING_MOTIONS.map((motion) => {
            const isSelected = motionSettings.drivingPreset === motion.id || (motion.id === 'motion-1' && motionSettings.drivingPreset === 'talking');
            return (
              <button
                key={motion.id}
                onClick={() => onSelectDrivingPreset(motion.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/40 text-white ring-1 ring-pink-500/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-100">{motion.title}</p>
                  <p className="text-[10px] text-slate-400">{motion.description}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {motion.duration}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 pt-1">
        {/* Expression Intensity */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>Expression Intensity</span>
            </span>
            <span className="font-mono text-pink-400 text-[11px] font-semibold">
              {motionSettings.expressionIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={motionSettings.expressionIntensity}
            onChange={(e) =>
              onUpdateMotionSettings((prev) => ({
                ...prev,
                expressionIntensity: parseInt(e.target.value, 10),
              }))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-pink-500"
          />
        </div>

        {/* Head Rotation Scale */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Head Rotation Scale</span>
            </span>
            <span className="font-mono text-pink-400 text-[11px] font-semibold">
              {motionSettings.headRotationScale}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            value={motionSettings.headRotationScale}
            onChange={(e) =>
              onUpdateMotionSettings((prev) => ({
                ...prev,
                headRotationScale: parseInt(e.target.value, 10),
              }))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-pink-500"
          />
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() =>
              onUpdateMotionSettings((prev) => ({
                ...prev,
                eyeBlinkSync: !prev.eyeBlinkSync,
              }))
            }
            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              motionSettings.eyeBlinkSync
                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                : 'border-slate-800 bg-slate-950/40 text-slate-500'
            }`}
          >
            <span>Eye Blink Sync</span>
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() =>
              onUpdateMotionSettings((prev) => ({
                ...prev,
                lipSyncTransfer: !prev.lipSyncTransfer,
              }))
            }
            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
              motionSettings.lipSyncTransfer
                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                : 'border-slate-800 bg-slate-950/40 text-slate-500'
            }`}
          >
            <span>Lip Sync &amp; Speech</span>
            <Smile className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Export Action */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onExportMotionVideo}
          disabled={isExporting}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>
            {isExporting ? `Rendering Motion Clip: ${Math.round(exportProgress)}%` : 'Export Animated Video (WebM)'}
          </span>
        </button>

        <button
          onClick={() =>
            onUpdateMotionSettings(() => ({
              expressionIntensity: 100,
              headPoseTransfer: true,
              headRotationScale: 100,
              eyeBlinkSync: true,
              lipSyncTransfer: true,
              gazeTracking: true,
              motionStabilization: 40,
              drivingPreset: 'talking',
            }))
          }
          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Motion Settings</span>
        </button>
      </div>
    </div>
  );
};
