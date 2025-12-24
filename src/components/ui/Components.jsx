import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Check, ShieldAlert, X } from 'lucide-react';

export const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
    <Icon size={14} className="text-blue-500" />
    {title}
  </div>
);

export const SmartSlider = ({ label, value, min, max, step = 1, unit = "", onChange }) => (
  <div className="group">
    <div className="flex justify-between text-[11px] font-medium mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
      <span>{label}</span>
      <span className="text-blue-400 font-mono">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all" 
    />
  </div>
);

export const Toggle = ({ label, checked, onChange, icon: Icon, subLabel }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300 group ${checked ? 'bg-blue-500/10 border-blue-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
        {Icon ? <Icon size={16} /> : <Check size={16} />}
      </div>
      <div>
        <span className={`block text-xs font-bold ${checked ? 'text-blue-400' : 'text-zinc-300'}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-zinc-500 block">{subLabel}</span>}
      </div>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-zinc-700'}`}>
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

export const AlignSelector = ({ value, onChange }) => (
  <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mt-2">
    {[{ id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight }].map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${value === opt.id ? 'bg-zinc-800 text-blue-400 shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
      >
        <opt.icon size={14} />
      </button>
    ))}
  </div>
);

export const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-200' : 'bg-zinc-900/90 border-blue-500/30 text-zinc-100'}`}>
    {type === 'error' ? <ShieldAlert size={20} className="text-red-500" /> : <Check size={20} className="text-blue-500" />}
    <div className="text-sm font-medium">{message}</div>
    <button onClick={onClose}><X size={14} className="opacity-50 hover:opacity-100" /></button>
  </div>
);