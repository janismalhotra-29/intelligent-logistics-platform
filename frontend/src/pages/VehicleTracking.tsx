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
    <div className="space-y-3.5 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Live Convoy & Vehicle GPS Telematics</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              AIS-140 GPS SIMULATION
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time GPS telemetry, speed monitoring, and dynamic reroute execution for priority supply relief.
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
              className="bg-slate-50 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-52 shadow-xs"
            />
          </div>
          {onRefreshVehicles && (
            <button
              onClick={onRefreshVehicles}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Refresh Pings</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Left 2 Columns: Fleet Table */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Monitored Convoys ({filteredVehicles.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Pings updated every 6s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
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
                        isSelected ? 'bg-blue-50/70 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {v.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[180px]">{v.cargo_name}</div>
                        <span className="text-[10px] text-slate-500">{v.cargo_category} (P-{v.cargo_priority})</span>
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
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : v.current_route_risk === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {v.current_route_risk}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-amber-700">
                        {v.predicted_delay}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDiverted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 font-bold block">
                  VEHICLE TELEMATICS PROFILE
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedVehicle.id}: {selectedVehicle.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                selectedVehicle.status === 'DIVERTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : selectedVehicle.status === 'STOPPED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {selectedVehicle.status}
              </span>
            </div>

            {/* Vehicle Info Specs */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">Assigned Cargo</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{selectedVehicle.cargo_name}</span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  Category: {selectedVehicle.cargo_category} • Priority: {selectedVehicle.cargo_priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Current Speed</span>
                  <span className="font-bold text-slate-900 font-mono">{Math.round(selectedVehicle.current_speed_kmh)} km/h</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Heading</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedVehicle.heading_deg}° N</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Normal ETA</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedVehicle.normal_eta}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Predicted Delay</span>
                  <span className="font-bold text-amber-700 font-mono">{selectedVehicle.predicted_delay}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">Route Path</span>
                <div className="text-slate-900 font-semibold mt-0.5">
                  {selectedVehicle.origin} → {selectedVehicle.destination}
                </div>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  Assigned Sector: {selectedVehicle.assigned_road_id}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Assigned Driver</span>
                  <span className="font-bold text-slate-900">{selectedVehicle.driver_name}</span>
                </div>
                <span className="text-xs font-mono text-blue-700">{selectedVehicle.driver_contact}</span>
              </div>
            </div>

            {/* Dynamic Detour Trigger */}
            <div className="pt-2">
              <button
                onClick={() => onSimulateDetour ? onSimulateDetour(selectedVehicle.id) : handleDivert(selectedVehicle.id)}
                disabled={diverting || selectedVehicle.status === 'DIVERTED'}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CornerUpRight className="w-3.5 h-3.5" />
                <span>
                  {selectedVehicle.status === 'DIVERTED'
                    ? 'Bypass Detour Successfully Enacted'
                    : 'Execute Dynamic Bypass Reroute'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
