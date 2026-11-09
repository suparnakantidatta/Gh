import React, { useState } from 'react';
import { X, Search, Sparkles, Filter, Check, Film, Image as ImageIcon } from 'lucide-react';
import { PRESET_SOURCE_FACES, PRESET_TARGET_IMAGES, PRESET_TARGET_VIDEOS } from '../utils/presets';
import { PresetFace, TargetMediaItem } from '../types';

interface PresetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'source' | 'target';
  onSelectSource: (face: PresetFace) => void;
  onSelectTarget: (target: TargetMediaItem) => void;
  selectedSourceUrl?: string | null;
  selectedTargetUrl?: string | null;
}

export const PresetPickerModal: React.FC<PresetPickerModalProps> = ({
  isOpen,
  onClose,
  type,
  onSelectSource,
  onSelectTarget,
  selectedSourceUrl,
  selectedTargetUrl,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetMediaType, setTargetMediaType] = useState<'all' | 'image' | 'video'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              {type === 'source' ? 'Select Persona Donor Face' : 'Select Target Scene / Clip'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {type === 'target' && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setTargetMediaType('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  targetMediaType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Media
              </button>
              <button
                onClick={() => setTargetMediaType('image')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  targetMediaType === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setTargetMediaType('video')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  targetMediaType === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Videos</span>
              </button>
            </div>
          )}

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'source' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {PRESET_SOURCE_FACES.filter(
                (p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((face) => {
                const isSelected = selectedSourceUrl === face.imageUrl;
                return (
                  <button
                    key={face.id}
                    onClick={() => {
                      onSelectSource(face);
                      onClose();
                    }}
                    className={`group relative rounded-xl overflow-hidden border text-left flex flex-col transition-all aspect-[3/4] ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                    }`}
                  >
                    <img
                      src={face.imageUrl}
                      alt={face.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {face.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-300 line-clamp-1">
                        {face.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {[
                ...(targetMediaType !== 'video' ? PRESET_TARGET_IMAGES : []),
                ...(targetMediaType !== 'image' ? PRESET_TARGET_VIDEOS : []),
              ]
                .filter(
                  (t) =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => {
                  const isSelected = selectedTargetUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTarget(item);
                        onClose();
                      }}
                      className={`group relative rounded-xl overflow-hidden border text-left flex flex-col transition-all aspect-[4/3] ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20'
                          : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-slate-200 border border-white/10 flex items-center gap-1">
                        {item.type === 'video' ? (
                          <>
                            <Film className="w-2.5 h-2.5 text-purple-400" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-2.5 h-2.5 text-indigo-400" />
                            <span>Image</span>
                          </>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
