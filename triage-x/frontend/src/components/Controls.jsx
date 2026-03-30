import React from 'react';
import { Settings, Command, BrainCircuit, Droplets, CloudLightning, Waves, MousePointer2 } from 'lucide-react';

export default function Controls({ mode, scenario, onModeChange, onScenarioChange, selectedBoatId }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="text-slate-400" size={20} />
        <h2 className="text-lg font-bold text-slate-700">Mission Control</h2>
      </div>

      {/* Mode Switcher */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Operation Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('ai')}
            className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all ${
              mode === 'ai' 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit size={24} className={`mb-2 ${mode === 'ai' ? 'text-indigo-500' : 'text-slate-400'}`} />
            <span className="text-sm font-bold">AI Agent</span>
            <span className="text-[10px] opacity-70 mt-1">Q-Learning Dispatch</span>
          </button>
          
          <button
            onClick={() => onModeChange('manual')}
            className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all ${
              mode === 'manual' 
                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' 
                : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Command size={24} className={`mb-2 ${mode === 'manual' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="text-sm font-bold">Manual</span>
            <span className="text-[10px] opacity-70 mt-1">Human Overwrite</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Disaster Scenario</h3>
        <div className="space-y-2">
          {[
            { id: 'low', name: 'Rising Tide', desc: 'Low severity flooding', icon: Droplets, color: 'text-blue-400' },
            { id: 'flash', name: 'Flash Flood', desc: 'Rapid accumulation', icon: CloudLightning, color: 'text-orange-500' },
            { id: 'extreme', name: 'Category 5', desc: 'Extreme emergency', icon: Waves, color: 'text-red-500' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onScenarioChange(s.id)}
              className={`w-full flex items-center p-3 rounded-xl border transition-all text-left ${
                scenario === s.id 
                  ? 'border-slate-300 bg-slate-50 shadow-sm' 
                  : 'border-transparent bg-transparent hover:bg-slate-50'
              }`}
            >
              <s.icon size={20} className={`${s.color} mr-3`} />
              <div>
                <div className={`font-semibold text-sm ${scenario === s.id ? 'text-slate-800' : 'text-slate-600'}`}>
                  {s.name}
                </div>
                <div className="text-[11px] text-slate-400">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Helper text for manual mode */}
      {mode === 'manual' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm flex gap-3 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
          <MousePointer2 className="shrink-0 text-amber-600" size={18} />
          <p>
            {selectedBoatId 
              ? <b>Click a zone on the map to dispatch the selected boat.</b>
              : <span>Action required: <b>Select a boat</b> on the map to issue new coordinates.</span>
            }
          </p>
        </div>
      )}
    </div>
  );
}
