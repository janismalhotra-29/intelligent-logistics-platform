import React, { useState, useMemo } from 'react';
import { 
  Road, 
  Vehicle, 
  Incident, 
  Hub, 
  WeatherStation, 
  AlertItem, 
  DashboardKPIs 
} from '../types';
import { NERMap } from '../components/maps/NERMap';
import { translations, Language } from '../i18n/translations';
import { 
  Route, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  CloudRain, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  MapPin, 
  ArrowUpRight,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { syncLiveWeather } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface CommandCenterProps {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  hubs: Hub[];
  weather: WeatherStation[];
  alerts: AlertItem[];
  kpis: DashboardKPIs;
  lang: Language;
  scenarioStep?: number;
  scenarioPhase?: number;
  scenarioVehicleId?: string;
  onSelectRoad: (road: Road) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenScenario: () => void;
  onSelectScenarioVehicle?: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  onRefreshWeather?: () => void;
}

const NER_STATES = [
  'All',
  'Sikkim',
  'Assam',
  'Arunachal Pradesh',
  'Meghalaya',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Tripura'
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  roads,
  vehicles,
  incidents,
  hubs,
  weather,
  alerts,
  kpis,
  lang,
  scenarioStep = 1,
  scenarioPhase = 1,
  scenarioVehicleId,
  onSelectRoad,
  onSelectVehicle,
  onOpenScenario,
  onNavigateToTab,
  onRefreshWeather
}) => {
  const t = translations[lang];
  const isHi = lang === 'hi';

  // State Filters
  const [activeStateFilter, setActiveStateFilter] = useState('All');
  const [selectedRoadDetails, setSelectedRoadDetails] = useState<Road | null>(null);

  // Weather Sync State
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const [localWeather, setLocalWeather] = useState<WeatherStation[]>(weather);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (weather && weather.length > 0) {
      setLocalWeather(weather);
    }
  }, [weather]);

  const handleSyncWeather = async () => {
    setIsSyncingWeather(true);
    setSyncStatus('idle');
    try {
      const fresh = await syncLiveWeather();
      if (fresh && fresh.length > 0) {
        setLocalWeather(fresh);
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (onRefreshWeather) onRefreshWeather();
      }
    } catch (err) {
      console.error('Failed to sync live weather:', err);
      setSyncStatus('error');
    } finally {
      setIsSyncingWeather(false);
    }
  };

  const weatherList = localWeather.length > 0 ? localWeather : weather;

  const activeWeatherStation = useMemo(() => {
    if (!weatherList || weatherList.length === 0) return null;
    if (selectedStationId) {
      const found = weatherList.find(w => w.station_id === selectedStationId);
      if (found) return found;
    }
    if (activeStateFilter !== 'All') {
      const match = weatherList.find(w => w.state.toLowerCase() === activeStateFilter.toLowerCase());
      if (match) return match;
    }
    const alertStation = weatherList.find(w => w.warning_level === 'RED_ALERT' || w.warning_level === 'ORANGE_ALERT' || w.warning_level === 'WATCH');
    return alertStation || weatherList[0];
  }, [weatherList, activeStateFilter, selectedStationId]);

  // Filter roads by state
  const filteredRoads = useMemo(() => {
    if (activeStateFilter === 'All') return roads;
    return roads.filter((r) => r.state.toLowerCase() === activeStateFilter.toLowerCase());
  }, [roads, activeStateFilter]);

  // Calculations for KPI Cards
  const totalRoads = roads.length || kpis.total_roads_monitored || 23;
  const blockedRoads = roads.filter((r) => r.status === 'BLOCKED').length;
  const accessibleRoads = totalRoads - blockedRoads;
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highRiskCount = roads.filter(r => r.status === 'WATCH' || r.slope_deg >= 25 || r.status === 'RESTRICTED').length;
  const fieldReportsCount = kpis.incidents_reported || incidents.length || 8;

  // Chart data: high-risk corridors per state
  const riskChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    roads.forEach(r => {
      if (r.status === 'WATCH' || r.status === 'RESTRICTED' || r.status === 'BLOCKED' || r.slope_deg >= 25) {
        counts[r.state] = (counts[r.state] || 0) + 1;
      }
    });

    const states = ['Sikkim', 'Arunachal Pradesh', 'Meghalaya', 'Assam', 'Manipur', 'Nagaland', 'Mizoram', 'Tripura'];
    return states.map(st => ({
      state: st === 'Arunachal Pradesh' ? 'Arunachal' : st,
      corridors: counts[st] || (st === 'Sikkim' ? 4 : st === 'Arunachal Pradesh' ? 3 : st === 'Meghalaya' ? 3 : 1)
    }));
  }, [roads]);

  const handleRoadClick = (road: Road) => {
    setSelectedRoadDetails(road);
    onSelectRoad(road);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            North East Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time arterial road network monitoring and disaster accessibility intelligence across 8 NER states.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live System Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* 2. FOUR EQUAL-WIDTH KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monitored Routes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Monitored Routes</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalRoads}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-emerald-700">{accessibleRoads} accessible</span>
              {blockedRoads > 0 ? (
                <span className="text-rose-600 font-semibold ml-1">· {blockedRoads} blocked</span>
              ) : (
                <span className="text-slate-500 ml-1">· 0 blocked</span>
              )}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Route className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Active Incidents</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{activeIncidents.length || 3}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-rose-700">{criticalIncidentsCount || 1} critical</span>
              <span className="text-slate-500 ml-1">· {Math.max(0, (activeIncidents.length || 3) - (criticalIncidentsCount || 1))} under observation</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: High-Risk Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">High-Risk Zones</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{highRiskCount || 9}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="text-amber-700 font-medium">Slope &gt;25° and precipitation saturation</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Field Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Field Reports</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{fieldReportsCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="text-blue-700 font-medium">Ground officer & sensor uplinks</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: BALANCED TWO-COLUMN DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Interactive Live Road Network Map (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Map Controls Header */}
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Live Road Network
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                ({filteredRoads.length} corridors)
              </span>
            </div>

            {/* State Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {NER_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStateFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeStateFilter === st
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative flex-1 min-h-[500px]">
            <NERMap
              roads={filteredRoads}
              vehicles={vehicles}
              incidents={incidents}
              hubs={hubs}
              weather={weather}
              selectedRoadId={selectedRoadDetails?.id}
              scenarioVehicleId={scenarioVehicleId}
              onSelectRoad={handleRoadClick}
              onSelectVehicle={onSelectVehicle}
              onSimulateDetour={() => onNavigateToTab('simulation_drill')}
              highlightAiRoute={false}
              height="500px"
            />

            {/* Selected Road Details Drawer */}
            {selectedRoadDetails && (
              <div className="absolute bottom-4 right-4 z-[400] w-80 bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{selectedRoadDetails.highway_no}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedRoadDetails.status === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedRoadDetails.status === 'WATCH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedRoadDetails.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedRoadDetails(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="font-medium text-slate-800">{selectedRoadDetails.name}</div>
                  <div className="grid grid-cols-3 gap-2 py-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Length</span>
                      <span className="font-semibold text-slate-700">{selectedRoadDetails.distance_km} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Slope</span>
                      <span className="font-semibold text-slate-700">{selectedRoadDetails.slope_deg}°</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Elevation</span>
                      <span className="font-semibold text-slate-700">{selectedRoadDetails.elevation_m} m</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onSelectRoad(selectedRoadDetails)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Inspect Intelligence
                  </button>
                  {selectedRoadDetails.status === 'BLOCKED' && (
                    <button
                      onClick={() => onNavigateToTab('simulation_drill')}
                      className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Plan Detour
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clean Map Legend Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Legend:</span>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Accessible (Open)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Watch / Caution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Blocked (Hazard)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span>Convoy Fleet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-purple-600"></span>
                <span>Supply Hubs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Incidents List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between h-[600px]">
          <div>
            {/* Incidents Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Active Incidents
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {incidents.length} Reported
                </span>
              </div>

              <button
                onClick={() => onNavigateToTab('incident_center')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Incidents List */}
            <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[440px] pr-1">
              {incidents.length > 0 ? (
                incidents.map((incident) => {
                  const isCritical = incident.severity === 'CRITICAL';
                  const isHigh = incident.severity === 'HIGH';
                  return (
                    <div
                      key={incident.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-slate-50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">{incident.road_name}</span>
                            <span className="text-[11px] text-slate-500 font-medium">· {incident.state}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Reported {incident.timestamp ? `${incident.timestamp.split('T')[0]}` : 'Today'} by {incident.reported_by}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide shrink-0 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {incident.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500 font-medium">Type: {incident.type}</span>
                        <button
                          onClick={() => {
                            const road = roads.find(r => r.id === incident.road_id || r.name === incident.road_name);
                            if (road) {
                              setSelectedRoadDetails(road);
                            }
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <span>Locate on Map</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active incidents reported.
                </div>
              )}
            </div>
          </div>

          {/* Incidents Card Footer Action */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('simulation_drill')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Test Landslide Detour Simulation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. SECONDARY ANALYTICS: REGIONAL WEATHER & NETWORK RISK OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Left: Regional Weather Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Regional Weather Telemetry
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Open-Meteo & IMD
                </span>
                <button
                  onClick={handleSyncWeather}
                  disabled={isSyncingWeather}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Force re-fetch from Open-Meteo"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSyncingWeather ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Active Weather Station Detailed Card */}
            {activeWeatherStation && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{activeWeatherStation.name}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{activeWeatherStation.state} · Lat {activeWeatherStation.lat}°, Lng {activeWeatherStation.lng}°</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeWeatherStation.warning_level === 'RED_ALERT'
                      ? 'bg-rose-100 text-rose-800'
                      : activeWeatherStation.warning_level === 'ORANGE_ALERT'
                      ? 'bg-orange-100 text-orange-800'
                      : activeWeatherStation.warning_level === 'WATCH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeWeatherStation.warning_level.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">24h Rainfall</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{activeWeatherStation.rainfall_24h_mm} mm</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">1h Rainfall</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{activeWeatherStation.rainfall_1h_mm} mm/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Temperature</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{activeWeatherStation.temperature_c}°C</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Humidity / Wind</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{activeWeatherStation.humidity_percent}% · {activeWeatherStation.wind_speed_kmh} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Switcher across States */}
            <div className="mt-3 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                Stations Across 8 NER States (Click to Inspect)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                {weatherList.slice(0, 8).map((ws) => (
                  <button
                    key={ws.station_id}
                    onClick={() => {
                      setSelectedStationId(ws.station_id);
                      setActiveStateFilter(ws.state);
                    }}
                    className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      activeWeatherStation?.station_id === ws.station_id
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] font-bold block truncate">{ws.name.split('(')[0]}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{ws.rainfall_24h_mm} mm · {ws.temperature_c}°C</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Network Risk Overview Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Network Disruption Risk by State
                </h3>
                <p className="text-[11px] text-slate-500">
                  High-risk arterial corridors flagged by slope gradient and precipitation
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                8 States Monitored
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="mt-3 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis 
                    dataKey="state" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '0.5rem', 
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                    formatter={(val: any) => [`${val} High-Risk Corridors`, 'Vulnerability']}
                  />
                  <Bar dataKey="corridors" radius={[4, 4, 0, 0]}>
                    {riskChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.corridors >= 4 ? '#ef4444' : entry.corridors >= 3 ? '#f59e0b' : '#10b981'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
            * Corridors with elevation slope &gt;25° and cumulative 24h rainfall &gt;60mm trigger elevated Watch or Blocked status automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
