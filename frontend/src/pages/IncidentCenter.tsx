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
  Layers, 
  List, 
  LayoutGrid, 
  X, 
  ChevronRight,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';

interface IncidentCenterProps {
  incidents: Incident[];
}

export const IncidentCenter: React.FC<IncidentCenterProps> = ({ incidents }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filtered = incidents.filter((inc) => {
    const matchesType = filterType === 'All' || inc.type === filterType;
    const matchesSeverity = filterSeverity === 'All' || inc.severity === filterSeverity;
    const matchesSearch = inc.road_name.toLowerCase().includes(search.toLowerCase()) ||
                          inc.state.toLowerCase().includes(search.toLowerCase()) ||
                          inc.description.toLowerCase().includes(search.toLowerCase()) ||
                          inc.id.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">MODERATE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">LOW</span>;
    }
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Disaster & Field Incident Center</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time multi-hazard ground reports and computer-vision photo classifications across NER.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Hazards</option>
              <option value="Landslide">Landslide</option>
              <option value="Flood">Flood</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Bridge Damage">Bridge Damage</option>
              <option value="Traffic">Traffic Obstruction</option>
            </select>
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium / Moderate</option>
            <option value="LOW">Low</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search incident, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Incident ID</th>
                  <th className="py-2.5 px-3">Highway & Corridor</th>
                  <th className="py-2.5 px-3">Hazard Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Impacted Convoys</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inc) => (
                  <tr 
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{inc.id}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{inc.road_name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{inc.description}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{inc.type}</td>
                    <td className="py-3 px-3">{getSeverityBadge(inc.severity)}</td>
                    <td className="py-3 px-3 text-slate-600">{inc.state}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{inc.affected_vehicles_count} Convoys</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{inc.timestamp}</td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching incidents found.
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((inc) => {
            const isHigh = inc.severity === 'HIGH' || inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isHigh
                    ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{inc.id} • {inc.state}</span>
                    {getSeverityBadge(inc.severity)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{inc.road_name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">{inc.description}</p>

                  {/* Computer Vision Classifier Output Badge */}
                  {inc.cv_classification && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 mb-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-blue-700 font-bold flex items-center gap-1">
                          <Camera className="w-3 h-3" /> CV Photo Classifier
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {inc.cv_classification.confidence}% Conf.
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Action: {inc.cv_classification.recommended_action}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{inc.timestamp}</span>
                  </div>
                  <span className="font-mono font-bold text-rose-600">
                    {inc.affected_vehicles_count} Convoys Impacted
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Detail Modal / Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{selectedIncident.id}</span>
                {getSeverityBadge(selectedIncident.severity)}
              </div>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">{selectedIncident.road_name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedIncident.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">State / Region</span>
                <span className="font-bold text-slate-900">{selectedIncident.state}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Hazard Classification</span>
                <span className="font-bold text-slate-900">{selectedIncident.type}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Report Timestamp</span>
                <span className="font-mono text-slate-800">{selectedIncident.timestamp}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Relief Fleet Impact</span>
                <span className="font-mono font-bold text-rose-700">{selectedIncident.affected_vehicles_count} Convoys Halted</span>
              </div>
            </div>

            {selectedIncident.cv_classification && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Computer Vision Photo Analysis</span>
                  </span>
                  <span className="font-mono text-blue-700">{selectedIncident.cv_classification.confidence}% Confidence</span>
                </div>
                <p className="text-slate-700 text-xs">
                  <strong>Advisory: </strong>{selectedIncident.cv_classification.recommended_action}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
