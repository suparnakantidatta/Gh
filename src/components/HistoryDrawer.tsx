import React from 'react';
import { X, Download, Trash2, ArrowUpRight, History, Calendar, Check } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Generated Swaps Gallery</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center">
              <History className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300 mb-1">No Swaps Saved Yet</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Your generated face swaps and snapshots will appear here for easy download and re-editing.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-col gap-3 group hover:border-indigo-500/40 transition-colors"
              >
                {/* Result Image */}
                <div className="relative rounded-lg overflow-hidden aspect-[4/3] bg-black">
                  <img
                    src={item.resultUrl}
                    alt="Swapped result"
                    className="w-full h-full object-cover"
                  />
                  {/* Thumbnails of source and target in bottom left corner */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 p-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
                    <img
                      src={item.sourceThumb}
                      alt="Source"
                      className="w-6 h-6 rounded-md object-cover border border-indigo-400"
                      title="Source Face"
                    />
                    <span className="text-[10px] text-slate-400">➔</span>
                    <img
                      src={item.targetThumb}
                      alt="Target"
                      className="w-6 h-6 rounded-md object-cover border border-purple-400"
                      title="Target Scene"
                    />
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-slate-600">•</span>
                    <span className="capitalize">{item.settings.blendMode.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onLoadItem(item);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      title="Load in Studio"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={item.resultUrl}
                      download={`facemorph_swap_${item.id}.jpg`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
