import React, { useState } from 'react';
import { Vehicle } from '../types';
import { divertVehicle } from '../services/api';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Gauge, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  CornerUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Activity,
  Zap
} from 'lucide-react';

interface VehicleTrackingProps {
  vehicles: Vehicle[];
  onSelectVehicle?: (v: Vehicle) => void;
  onRefreshVehicles?: () => void;
  onSimulateDetour?: (vehicleId: string) => void;
}

export const VehicleTracking: React.FC<VehicleTrackingProps> = ({
  vehicles,
  onSelectVehicle,
  onRefreshVehicles,
  onSimulateDetour
}) => {
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0]);
  const [diverting, setDiverting] = useState(false);

  const filteredVehicles = vehicles.filter((v) =>
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.cargo_name.toLowerCase().includes(search.toLowerCase()) ||
    v.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleDivert = async (vehicleId: string) => {
    setDiverting(true);
    try {
      const res = await divertVehicle(vehicleId, 'R-1028');
      if (res.vehicle) {
        setSelectedVehicle(res.vehicle);
      }
      if (onRefreshVehicles) {
        onRefreshVehicles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiverting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-command-900/80 p-4 rounded-xl border border-command-border">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Live Convoy & Vehicle GPS Telematics</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
              SIMULATION MODE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time GPS telemetry, speed monitoring, and dynamic reroute execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vehicle, cargo, dest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-command-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>
          {onRefreshVehicles && (
            <button
              onClick={onRefreshVehicles}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-command-800 hover:bg-command-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Pings</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns: Fleet Table */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-command-border space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
            Monitored Convoys ({filteredVehicles.length})
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-command-950/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Vehicle ID</th>
                  <th className="py-2.5 px-3">Cargo Consignment</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Route Risk</th>
                  <th className="py-2.5 px-3">Delay</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVehicles.map((v) => {
                  const isSelected = selectedVehicle?.id === v.id;
                  const isDiverted = v.status === 'DIVERTED';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicle(v);
                        if (onSelectVehicle) onSelectVehicle(v);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 text-white' : 'hover:bg-command-850/60 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                        {v.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-[180px]">{v.cargo_name}</div>
                        <span className="text-[10px] text-slate-400">{v.cargo_category} (P-{v.cargo_priority})</span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {Math.round(v.current_speed_kmh)} km/h
                      </td>
                      <td className="py-3 px-3 truncate max-w-[140px]">
                        {v.destination}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          v.current_route_risk === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : v.current_route_risk === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {v.current_route_risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-amber-400">
                        {v.predicted_delay}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDiverted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-command-800 text-slate-300'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Vehicle Intelligence Card */}
        {selectedVehicle && (
          <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                  VEHICLE TELEMATICS PROFILE
                </span>
                <h3 className="text-base font-black text-white">{selectedVehicle.id}: {selectedVehicle.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                selectedVehicle.status === 'DIVERTED'
                  ? 'bg-emerald-500 text-white'
                  : selectedVehicle.status === 'STOPPED'
                  ? 'bg-rose-500 text-white'
                  : 'bg-cyan-600 text-white'
              }`}>
                {selectedVehicle.status}
              </span>
            </div>

            {/* Vehicle Info Specs */}
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-command-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Assigned Cargo</span>
                <span className="font-bold text-white text-sm block mt-0.5">{selectedVehicle.cargo_name}</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Category: {selectedVehicle.cargo_category} • Priority: {selectedVehicle.cargo_priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-command-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Current Speed</span>
                  <span className="font-bold text-white font-mono">{Math.round(selectedVehicle.current_speed_kmh)} km/h</span>
                </div>
                <div className="p-2 rounded bg-command-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Heading</span>
                  <span className="font-bold text-white font-mono">{selectedVehicle.heading_deg}° N</span>
                </div>
                <div className="p-2 rounded bg-command-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Normal ETA</span>
                  <span className="font-bold text-white font-mono">{selectedVehicle.normal_eta}</span>
                </div>
                <div className="p-2 rounded bg-command-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Predicted Delay</span>
                  <span className="font-bold text-amber-400 font-mono">{selectedVehicle.predicted_delay}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-command-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Route Path</span>
                <div className="text-white font-semibold mt-0.5">
                  {selectedVehicle.origin} → {selectedVehicle.destination}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Assigned Sector: {selectedVehicle.assigned_road_id}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-command-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Assigned Driver</span>
                  <span className="font-bold text-white">{selectedVehicle.driver_name}</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">{selectedVehicle.driver_contact}</span>
              </div>
            </div>

            {/* Divert Action Button */}
            {!selectedVehicle.is_diverted ? (
              <button
                onClick={() => handleDivert(selectedVehicle.id)}
                disabled={diverting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CornerUpRight className="w-4 h-4" />
                <span>
                  {diverting ? 'Recalculating & Transmitting Reroute...' : 'Divert Convoy to Alternative Corridor'}
                </span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
                <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Convoy Successfully Diverted</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Rerouted via secondary bypass corridor. Clearance confirmed.
                </p>
              </div>
            )}

            {/* Contingency Simulation Drill Launcher */}
            {onSimulateDetour && (
              <button
                onClick={() => onSimulateDetour(selectedVehicle.id)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulate Disaster & Detour on {selectedVehicle.id}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
