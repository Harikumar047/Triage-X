import React from 'react';
import { HeartPulse, Activity, Zap, AlertTriangle } from 'lucide-react';

export default function Metrics({ metrics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Lives Saved */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-semibold text-sm">Lives Saved</span>
          <div className="p-2 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
            <HeartPulse className="text-green-500 w-5 h-5" />
          </div>
        </div>
        <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
          {metrics.lives_saved}
        </div>
      </div>

      {/* Efficiency */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-semibold text-sm">Efficiency Score</span>
          <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
            <Zap className="text-blue-500 w-5 h-5" />
          </div>
        </div>
        <div className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-baseline gap-1">
          {Math.round(metrics.efficiency)}
          <span className="text-lg text-slate-400 font-medium">%</span>
        </div>
        {/* Simple Progress Bar */}
        <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${metrics.efficiency}%` }} 
          />
        </div>
      </div>

      {/* Active Zones */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-semibold text-sm">Active Emergencies</span>
          <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
          {metrics.active_zones}
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-semibold text-sm">Avg. Response Time</span>
          <div className="p-2 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
            <Activity className="text-purple-500 w-5 h-5" />
          </div>
        </div>
        <div className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-baseline gap-1">
          {metrics.avg_response_time.toFixed(1)}
          <span className="text-lg text-slate-400 font-medium">min</span>
        </div>
      </div>
    </div>
  );
}
