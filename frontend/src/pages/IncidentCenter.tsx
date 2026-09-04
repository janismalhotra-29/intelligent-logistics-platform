import React, { useState } from 'react';
import { Incident } from '../types';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Camera, 
  Search,
  Filter,
  Layers
} from 'lucide-react';

interface IncidentCenterProps {
  incidents: Incident[];
}

export const IncidentCenter: React.FC<IncidentCenterProps> = ({ incidents }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filtered = incidents.filter((inc) => {
    const matchesType = filterType === 'All' || inc.type === filterType;
    const matchesSearch = inc.road_name.toLowerCase().includes(search.toLowerCase()) ||
                          inc.state.toLowerCase().includes(search.toLowerCase()) ||
                          inc.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-command-900/80 p-4 rounded-xl border border-command-border">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-bold text-white">Disaster & Field Incident Center</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-hazard ground reports and computer-vision photo classifications across NER.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-command-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flood">Flood</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Bridge Damage">Bridge Damage</option>
              <option value="Traffic">Traffic Obstruction</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search incident, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-command-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 w-48"
          />
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inc) => {
          const isHigh = inc.severity === 'HIGH' || inc.severity === 'CRITICAL';

          return (
            <div
              key={inc.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isHigh
                  ? 'border-rose-500/40 bg-rose-950/20 shadow-md shadow-rose-950/30'
                  : 'border-slate-800 bg-command-900/70 hover:bg-command-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{inc.id} • {inc.state}</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    isHigh ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {inc.type.toUpperCase()} ({inc.severity})
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{inc.road_name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{inc.description}</p>

                {/* Computer Vision Classifier Output Badge */}
                {inc.cv_classification && (
                  <div className="p-2 rounded-lg bg-command-950 border border-cyan-900/60 mb-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3" /> CV Photo Classifier
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {inc.cv_classification.confidence}% Conf.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Action: {inc.cv_classification.recommended_action}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{inc.timestamp}</span>
                </div>
                <span className="font-mono font-semibold text-rose-400">
                  {inc.affected_vehicles_count} Convoys Impacted
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
