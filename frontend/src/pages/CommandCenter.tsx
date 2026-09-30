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
  Activity, 
  AlertTriangle, 
  Truck, 
  ShieldAlert, 
  CloudRain, 
  CheckCircle2, 
  Clock, 
  Package, 
  AlertOctagon,
  ArrowRight,
  MapPin,
  Play,
  Search,
  Navigation,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  X,
  ExternalLink,
  Info,
  Radio,
  RotateCcw
} from 'lucide-react';
import { syncLiveWeather } from '../services/api';

import { SCENARIO_CONVOYS, DEFAULT_CONVOY_ID, ScenarioConvoy, getPhaseAdvisory } from '../data/scenarioConfigs';

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
  scenarioVehicleId = DEFAULT_CONVOY_ID,
  onSelectRoad,
  onSelectVehicle,
  onOpenScenario,
  onSelectScenarioVehicle,
  onNavigateToTab,
  onRefreshWeather
}) => {
  const t = translations[lang];
  const isHi = lang === 'hi';

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStateFilter, setActiveStateFilter] = useState('All');
  const [highlightAiRoute, setHighlightAiRoute] = useState(scenarioStep >= 3);
  const [selectedRoadDetails, setSelectedRoadDetails] = useState<Road | null>(null);

  // Live Weather Telemetry State
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const [localWeather, setLocalWeather] = useState<WeatherStation[]>(weather);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  React.useEffect(() => {
    if (weather && weather.length > 0) {
      setLocalWeather(weather);
    }
  }, [weather]);

  const handleSyncWeather = async () => {
    setIsSyncingWeather(true);
    setSyncStatus('idle');
    setSyncMessage(null);
    try {
      const fresh = await syncLiveWeather();
      if (fresh && fresh.length > 0) {
        setLocalWeather(fresh);
        setSyncStatus('success');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        setSyncMessage(isHi ? `✓ ${fresh.length} मौसम केंद्र लाइव सिंक हुए (${timeStr})` : `✓ ${fresh.length} stations synced live (${timeStr})`);
        if (onRefreshWeather) onRefreshWeather();
        setTimeout(() => setSyncMessage(null), 4000);
      } else {
        setSyncStatus('error');
        setSyncMessage(isHi ? 'कोई मौसम डेटा प्राप्त नहीं हुआ' : 'No station data received');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to sync live weather:', err);
      setSyncStatus('error');
      setSyncMessage(isHi ? 'सिंक विफल: बैकएंड उपलब्ध नहीं है' : 'Sync failed: Backend unreachable');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncingWeather(false);
    }
  };

  const weatherList = localWeather.length > 0 ? localWeather : weather;

  // Real active weather station matching user selection or active state filter
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

  const activeScenario: ScenarioConvoy = SCENARIO_CONVOYS[scenarioVehicleId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];
  const advisory = getPhaseAdvisory(activeScenario, scenarioPhase, lang);

  // Sync highlight with scenario step
  React.useEffect(() => {
    if (scenarioStep >= 3) {
      setHighlightAiRoute(true);
    }
  }, [scenarioStep]);

  // Filter roads by state chip
  const filteredRoads = useMemo(() => {
    if (activeStateFilter === 'All') return roads;
    return roads.filter((r) => r.state.toLowerCase() === activeStateFilter.toLowerCase());
  }, [roads, activeStateFilter]);

  // Quick search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return roads.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.highway_no.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [roads, searchQuery]);

  // Metrics
  const totalRoads = roads.length || 23;
  const blockedRoads = roads.filter((r) => r.status === 'BLOCKED').length;
  const accessibleRoads = totalRoads - blockedRoads;
  const criticalAlerts = alerts.filter((a) => a.alert_level === 'CRITICAL');
  const topAlert = criticalAlerts[0] || alerts[0];

  const handleRoadClick = (road: Road) => {
    setSelectedRoadDetails(road);
    onSelectRoad(road);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. TOP LIVE OPERATIONAL NETWORK & MONSOON STATUS BANNER */}
      <div className="border border-slate-800 rounded-2xl p-3.5 shadow-xl bg-gradient-to-r from-cyan-950/40 via-command-900 to-command-950 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-cyan-500/50 bg-cyan-600/20 flex items-center justify-center font-bold shrink-0 text-cyan-400 shadow-lg">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                {isHi ? 'लाइव संचालन' : 'LIVE OPERATIONS'}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {isHi ? 'पूर्वोत्तर क्षेत्रीय सड़क नेटवर्क एवं मौसम निगरानी प्रणाली' : 'NER Highway Network & Real-Time Weather Surveillance'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-slate-300 border border-slate-700 font-bold">
                {activeStateFilter === 'All' ? (isHi ? 'सभी 8 राज्य' : 'All 8 NER States') : activeStateFilter}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-300 mt-0.5">
              <span>{t.metric_road_accessibility}: <strong className="text-emerald-400">{accessibleRoads} {t.metric_open}</strong>{blockedRoads > 0 && <span className="text-rose-400"> · {blockedRoads} {t.metric_blocked}</span>}</span>
              <span>• {isHi ? 'सक्रिय चेतावनियां' : 'Active Weather Alerts'}: <strong className="text-amber-400">{criticalAlerts.length || alerts.length} {isHi ? 'अलर्ट' : 'Alerts'}</strong></span>
              {activeWeatherStation && (
                <span>• {isHi ? 'लाइव मौसम' : 'Live Weather'}: <strong className="text-cyan-300">{activeWeatherStation.name.split('(')[0]} ({activeWeatherStation.temperature_c}°C · {activeWeatherStation.weather_condition || 'Live'} · {activeWeatherStation.rainfall_24h_mm} mm/24h)</strong></span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab('simulation_drill')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Open dedicated disaster simulation space"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {t.launch_drill_cta}
          </button>
          <button
            onClick={() => onNavigateToTab('alerts_center')}
            className="px-3 py-1.5 rounded-lg bg-command-950 hover:bg-command-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            {isHi ? 'चेतावनियां देखें' : 'VIEW WARNINGS'}
          </button>
        </div>
      </div>

      {/* Main Grid: Search & Filters, Leaflet Map, and Right Weather Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Map & Highway Monitoring (8-9 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Quick Highway Search and State Filter Bar */}
          <div className="bg-command-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isHi ? 'राजमार्ग खोजें (उदा. NH-10, NH-310A)...' : 'Search highway (e.g. NH-10, NH-310A)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-command-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-9 left-0 right-0 z-50 bg-command-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1">
                  {searchResults.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRoadDetails(r);
                        onSelectRoad(r);
                      }}
                      className="p-1.5 rounded-lg hover:bg-command-800 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{r.highway_no} - {r.name}</span>
                        <span className="text-[10px] text-slate-400">{r.state}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        r.status === 'BLOCKED' ? 'bg-rose-500 text-white' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* State Filter Chips */}
            <div className="flex flex-wrap items-center gap-1">
              {NER_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStateFilter(st)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    activeStateFilter === st
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-command-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Large Hero Map Component */}
          <div className="relative">
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
              height="540px"
            />

            {/* Selected Road Status Floating Drawer (if road clicked) */}
            {selectedRoadDetails && (
              <div className="absolute bottom-14 right-3 z-[400] w-72 bg-command-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white">{selectedRoadDetails.highway_no}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      selectedRoadDetails.status === 'BLOCKED'
                        ? 'bg-rose-600 text-white'
                        : selectedRoadDetails.status === 'WATCH'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {selectedRoadDetails.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedRoadDetails(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="font-semibold text-white">{selectedRoadDetails.name}</div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Length: {selectedRoadDetails.distance_km} km</span>
                    <span>Slope: {selectedRoadDetails.slope_deg}°</span>
                    <span>Elevation: {selectedRoadDetails.elevation_m} m</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectRoad(selectedRoadDetails)}
                    className="flex-1 py-1 rounded bg-command-800 hover:bg-command-700 text-cyan-300 font-semibold text-[10px] border border-slate-700 transition-colors"
                  >
                    {t.inspect_intelligence}
                  </button>
                  {selectedRoadDetails.status === 'BLOCKED' && (
                    <button
                      onClick={() => onNavigateToTab('simulation_drill')}
                      className="py-1 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                    >
                      {t.detour_btn}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: LIVE REAL-TIME WEATHER & REGIONAL TRANSIT INTEL (25-35% width) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-command-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  {t.live_weather_header}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {lastSyncTime && (
                  <span className="text-[9px] font-mono text-slate-400 hidden sm:inline" title="Last synced timestamp">
                    {lastSyncTime}
                  </span>
                )}
                <button
                  onClick={handleSyncWeather}
                  disabled={isSyncingWeather}
                  className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-300 hover:text-cyan-300 bg-command-950 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  title="Force re-fetch from Open-Meteo"
                >
                  <RotateCcw className={`w-2.5 h-2.5 ${isSyncingWeather ? 'animate-spin text-cyan-400' : ''}`} />
                  {isSyncingWeather ? (isHi ? 'सिंक...' : 'Syncing...') : (isHi ? 'लाइव सिंक' : 'Sync Live')}
                </button>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE FEED
                </span>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncMessage && (
              <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                syncStatus === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
              }`}>
                {syncStatus === 'success' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                )}
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Active Real-Time Weather Station Card */}
            {activeWeatherStation && (
              <div className="p-3 rounded-xl bg-command-950 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {activeWeatherStation.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeWeatherStation.state} · Lat {activeWeatherStation.lat}°, Lng {activeWeatherStation.lng}°
                    </span>
                    {activeWeatherStation.weather_condition && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {activeWeatherStation.weather_condition}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${
                    activeWeatherStation.warning_level === 'RED_ALERT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : activeWeatherStation.warning_level === 'ORANGE_ALERT'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : activeWeatherStation.warning_level === 'WATCH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {activeWeatherStation.warning_level.replace('_', ' ')}
                  </span>
                </div>

                {/* Real-time Weather Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-command-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">{t.station_rain_24h}</span>
                    <span className="font-mono font-black text-cyan-300 text-sm">{activeWeatherStation.rainfall_24h_mm} mm</span>
                    <span className="text-[9px] text-slate-500 block">Current: {activeWeatherStation.current_rainfall_mm ?? activeWeatherStation.rainfall_1h_mm} mm/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-command-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">{t.station_temp} / {t.station_humidity}</span>
                    <span className="font-mono font-bold text-white text-xs">{activeWeatherStation.temperature_c}°C · {activeWeatherStation.humidity_percent}%</span>
                    <span className="text-[9px] text-slate-500 block">Wind: {activeWeatherStation.wind_speed_kmh} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Regional Weather Network Across All 8 States */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  {t.actual_weather_stations}
                </span>
                <span className="text-[9px] font-mono text-cyan-400">Click station to inspect</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {weatherList.map((ws) => (
                  <div 
                    key={ws.station_id}
                    onClick={() => {
                      setSelectedStationId(ws.station_id);
                      setActiveStateFilter(ws.state);
                    }}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      activeWeatherStation?.station_id === ws.station_id
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/40 shadow-sm'
                        : 'bg-command-950 border-slate-800 text-slate-300 hover:bg-command-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold block text-[11px] text-white">{ws.name.split('(')[0]}</span>
                        {ws.weather_condition && (
                          <span className="text-[9px] text-slate-400 font-mono">({ws.weather_condition})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ws.state} · {ws.temperature_c}°C</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-cyan-400 text-xs block">{ws.rainfall_24h_mm} mm</span>
                      <span className={`text-[9px] font-mono font-bold ${
                        ws.warning_level === 'RED_ALERT' ? 'text-rose-400' :
                        ws.warning_level === 'ORANGE_ALERT' ? 'text-orange-400' :
                        ws.warning_level === 'WATCH' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{ws.warning_level.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedicated Contingency Simulation Space Callout Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/60 via-command-950 to-indigo-950/60 border border-purple-600/50 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-current text-purple-400" />
                  {isHi ? 'आपदा एवं मार्ग परिवर्तन सिमुलेशन' : 'DISASTER & DETOUR SIMULATION'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40">
                  {t.badge_phases}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {isHi
                  ? 'सिक्किम, मणिपुर, मिजोरम व असम में भूस्खलन एवं बाढ़ की स्थिति का 6 चरणों में अनुकरण करें।'
                  : 'Test how the platform handles severe landslides and recalculates safe bypass detours in 6 interactive phases.'}
              </p>
              <button
                onClick={() => onNavigateToTab('simulation_drill')}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isHi ? 'सिमुलेशन अभ्यास कक्ष खोलें →' : 'Open Disaster Simulation Drill →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: LIVE OPERATIONAL STATUS BAR */}
      <div className="bg-command-900/90 border border-slate-800 rounded-xl p-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 4 Compact Operational Metrics (Col 8) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Metric 1 */}
            <div className="p-2 rounded-lg bg-command-950 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                  {t.metric_road_accessibility}
                </span>
                <span className="text-xs font-black text-white">
                  <span className="text-emerald-400">{accessibleRoads} {t.metric_open}</span>
                  {blockedRoads > 0 && <span className="text-rose-400 ml-1">· {blockedRoads} {t.metric_blocked}</span>}
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-2 rounded-lg bg-command-950 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                  {t.metric_active_hazards}
                </span>
                <span className="text-xs font-black text-amber-400">
                  9 {t.metric_corridors_risk}
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-2 rounded-lg bg-command-950 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                  {t.metric_relief_fleets}
                </span>
                <span className="text-xs font-black text-sky-400">
                  6 {t.metric_convoys_route}
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-2 rounded-lg bg-command-950 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                  {t.metric_safe_detours}
                </span>
                <span className="text-xs font-black text-purple-300">
                  3 {t.metric_operational}
                </span>
              </div>
            </div>
          </div>

          {/* Live Data Freshness & Simulation Mode Status (Col 4) */}
          <div className="md:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-2 text-[10px] font-mono pl-0 md:pl-2 border-t md:border-t-0 md:border-l border-slate-800">
            <div className="space-y-0.5 text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t.metric_data_sync}</span>
              </div>
              <div className="text-[9px] text-slate-400">
                {t.metric_sync_sub}
              </div>
            </div>

            <div className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-600/50 text-[10px] font-bold tracking-wider" title="Calibrated monsoon scenario active for SIH presentation. Live Open-Meteo & IMD APIs integrated for production.">
              {t.metric_drill_tag}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
