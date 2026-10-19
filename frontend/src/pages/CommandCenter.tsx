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
  RotateCcw,
  Layers,
  Cpu,
  Route,
  ChevronRight
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
    <div className="space-y-3.5 font-sans">
      {/* 1. TOP LIVE OPERATIONAL NETWORK & MONSOON STATUS BANNER */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isHi ? 'लाइव संचालन' : 'LIVE OPERATIONS'}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {isHi ? 'पूर्वोत्तर क्षेत्रीय सड़क नेटवर्क एवं मौसम निगरानी प्रणाली' : 'NER Highway Network & Real-Time Weather Surveillance'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                {activeStateFilter === 'All' ? (isHi ? 'सभी 8 राज्य' : 'All 8 NER States') : activeStateFilter}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 mt-0.5">
              <span>{t.metric_road_accessibility}: <strong className="text-emerald-700">{accessibleRoads} {t.metric_open}</strong>{blockedRoads > 0 && <span className="text-rose-600 font-bold"> · {blockedRoads} {t.metric_blocked}</span>}</span>
              <span>• {isHi ? 'सक्रिय चेतावनियां' : 'Active Weather Alerts'}: <strong className="text-amber-700">{criticalAlerts.length || alerts.length} {isHi ? 'अलर्ट' : 'Alerts'}</strong></span>
              {activeWeatherStation && (
                <span>• {isHi ? 'लाइव मौसम' : 'Live Weather'}: <strong className="text-blue-700">{activeWeatherStation.name.split('(')[0]} ({activeWeatherStation.temperature_c}°C · {activeWeatherStation.weather_condition || 'Live'} · {activeWeatherStation.rainfall_24h_mm} mm/24h)</strong></span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab('simulation_drill')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Open dedicated disaster simulation space"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {t.launch_drill_cta}
          </button>
          <button
            onClick={() => onNavigateToTab('alerts_center')}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            {isHi ? 'चेतावनियां देखें' : 'VIEW WARNINGS'}
          </button>
        </div>
      </div>

      {/* 2. PLATFORM CONCEPT EXPLAINER RIBBON (4 Interactive Strategic Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: 8-State Arterials */}
        <div 
          onClick={() => setActiveStateFilter('Sikkim')}
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to focus on Sikkim critical corridor"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              {isHi ? 'स्तंभ 1: धमनी नेटवर्क' : 'Pillar 1: Arterial Net'}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              23 Corridors
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            {isHi ? '8 पूर्वोत्तर राज्य हाई-पास ग्रिड' : '8-State Strategic Grid'}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {isHi 
              ? 'सिलीगुड़ी कॉरिडोर, नाथू ला व तवांग जैसे संवेदनशील पर्वतीय राजमार्गों की मैपिंग।' 
              : 'Siliguri Chicken’s Neck, Nathu La & Tawang high-altitude corridors.'}
          </p>
        </div>

        {/* Card 2: Monsoon & Sensor Telemetry */}
        <div 
          onClick={handleSyncWeather}
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to force live weather telemetry sync"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
              {isHi ? 'स्तंभ 2: मौसम टेलीमेट्री' : 'Pillar 2: Weather Sensor'}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Open-Meteo & IMD
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
            {isHi ? 'वास्तविक वर्षा एवं ढलान संतृप्ति' : 'Real-Time Precip & Soil'}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {isHi
              ? 'गंगटोक (142mm), चेरापूंजी वर्षा गेज से जोखिम स्कोर की स्वतः गणना।'
              : 'Gangtok (142mm) & Mawsynram telemetry triggering risk alerts.'}
          </p>
        </div>

        {/* Card 3: Explainable AI Risk Prediction */}
        <div 
          onClick={() => onNavigateToTab('road_intelligence')}
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to inspect Explainable AI factors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              {isHi ? 'स्तंभ 3: पारदर्शी AI' : 'Pillar 3: Explainable AI'}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              ML Breakdown
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
            {isHi ? 'भूस्खलन संभाव्यता एवं कारक' : 'Landslide Risk Vectors'}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {isHi
              ? 'ढलान (34°), वर्षा (29%), और मिट्टी प्रकार का स्पष्ट प्रतिशत योगदान।'
              : 'Slope gradient (21%), 24h rain (29%) & soil moisture attribution.'}
          </p>
        </div>

        {/* Card 4: Dynamic Dijkstra Rerouting */}
        <div 
          onClick={() => onNavigateToTab('route_planner')}
          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to test Emergency Route Planner"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-purple-600" />
              {isHi ? 'स्तंभ 4: गतिशील डायवर्जन' : 'Pillar 4: Dynamic Detour'}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Auto-Bypass
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
            {isHi ? 'अवरुद्ध मार्गों का सुरक्षित विकल्प' : 'Dijkstra Hazard Penalty'}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {isHi
              ? 'NH-10 अवरोध पर स्वचालित लावा-अल्गरा बाईपास और समय गणना।'
              : 'Instant bypass via Lava-Algarah corridor when NH-10 is blocked.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Search & Filters, Leaflet Map, and Right Weather Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left: Map & Highway Monitoring (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Quick Highway Search and State Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isHi ? 'राजमार्ग खोजें (उदा. NH-10, NH-310A)...' : 'Search highway (e.g. NH-10, NH-310A)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-9 left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1">
                  {searchResults.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRoadDetails(r);
                        onSelectRoad(r);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{r.highway_no} - {r.name}</span>
                        <span className="text-[10px] text-slate-500">{r.state}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        r.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* State Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {NER_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStateFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    activeStateFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Status Legend Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono font-bold text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>MAP STATUS LEGEND:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5" title="All vehicles permitted with standard safety limits">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                <span className="text-slate-700 font-medium">{isHi ? 'खुला मार्ग' : 'Accessible (Open)'}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Rainfall >60mm/24h or slope >25°">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
                <span className="text-slate-700 font-medium">{isHi ? 'निगरानी (चेतावनी)' : 'Watch / Caution'}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Severe active landslide or flash flood — dynamic detour active">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs animate-pulse"></span>
                <span className="text-slate-700 font-medium">{isHi ? 'अवरुद्ध (भूस्खलन)' : 'Blocked (Hazard Active)'}</span>
              </div>
              <div className="flex items-center gap-1.5" title="AIS-140 GPS tracked relief convoy carrying priority rations/medicine">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span className="text-slate-700 font-medium">{isHi ? 'राहत काफिला' : 'AIS-140 Fleet'}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Key transshipment hubs, medical stores, and helipads">
                <span className="w-2.5 h-2.5 rounded bg-purple-600"></span>
                <span className="text-slate-700 font-medium">{isHi ? 'सामरिक डिपो' : 'Supply Hubs'}</span>
              </div>
            </div>
          </div>

          {/* Large Hero Map Component */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs">
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
              <div className="absolute bottom-4 right-4 z-[400] w-76 bg-white/95 border border-slate-200 rounded-xl p-3.5 shadow-xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{selectedRoadDetails.highway_no}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      selectedRoadDetails.status === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedRoadDetails.status === 'WATCH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedRoadDetails.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedRoadDetails(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">{selectedRoadDetails.name}</div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Length: {selectedRoadDetails.distance_km} km</span>
                    <span>Slope: {selectedRoadDetails.slope_deg}°</span>
                    <span>Elevation: {selectedRoadDetails.elevation_m} m</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectRoad(selectedRoadDetails)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
                  >
                    {t.inspect_intelligence}
                  </button>
                  {selectedRoadDetails.status === 'BLOCKED' && (
                    <button
                      onClick={() => onNavigateToTab('simulation_drill')}
                      className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      {t.detour_btn}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: LIVE REAL-TIME WEATHER & REGIONAL TRANSIT INTEL (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {t.live_weather_header}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {lastSyncTime && (
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline" title="Last synced timestamp">
                    {lastSyncTime}
                  </span>
                )}
                <button
                  onClick={handleSyncWeather}
                  disabled={isSyncingWeather}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="Force re-fetch from Open-Meteo"
                >
                  <RotateCcw className={`w-3 h-3 ${isSyncingWeather ? 'animate-spin text-blue-600' : ''}`} />
                  {isSyncingWeather ? (isHi ? 'सिंक...' : 'Syncing...') : (isHi ? 'लाइव सिंक' : 'Sync Live')}
                </button>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE FEED
                </span>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncMessage && (
              <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                syncStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {syncStatus === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Active Real-Time Weather Station Card */}
            {activeWeatherStation && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {activeWeatherStation.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeWeatherStation.state} · Lat {activeWeatherStation.lat}°, Lng {activeWeatherStation.lng}°
                    </span>
                    {activeWeatherStation.weather_condition && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {activeWeatherStation.weather_condition}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                    activeWeatherStation.warning_level === 'RED_ALERT'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      : activeWeatherStation.warning_level === 'ORANGE_ALERT'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : activeWeatherStation.warning_level === 'WATCH'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {activeWeatherStation.warning_level.replace('_', ' ')}
                  </span>
                </div>

                {/* Real-time Weather Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">{t.station_rain_24h}</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{activeWeatherStation.rainfall_24h_mm} mm</span>
                    <span className="text-[10px] text-slate-400 block">Current: {activeWeatherStation.current_rainfall_mm ?? activeWeatherStation.rainfall_1h_mm} mm/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">{t.station_temp} / {t.station_humidity}</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">{activeWeatherStation.temperature_c}°C · {activeWeatherStation.humidity_percent}%</span>
                    <span className="text-[10px] text-slate-400 block">Wind: {activeWeatherStation.wind_speed_kmh} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Regional Weather Network Across All 8 States */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  {t.actual_weather_stations}
                </span>
                <span className="text-[10px] font-mono text-blue-600">Click station to inspect</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {weatherList.map((ws) => (
                  <div 
                    key={ws.station_id}
                    onClick={() => {
                      setSelectedStationId(ws.station_id);
                      setActiveStateFilter(ws.state);
                    }}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      activeWeatherStation?.station_id === ws.station_id
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold block text-[11px] text-slate-900">{ws.name.split('(')[0]}</span>
                        {ws.weather_condition && (
                          <span className="text-[10px] text-slate-400 font-mono">({ws.weather_condition})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ws.state} · {ws.temperature_c}°C</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-700 text-xs block">{ws.rainfall_24h_mm} mm</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        ws.warning_level === 'RED_ALERT' ? 'text-rose-600' :
                        ws.warning_level === 'ORANGE_ALERT' ? 'text-orange-600' :
                        ws.warning_level === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>{ws.warning_level.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedicated Contingency Simulation Space Callout Card */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-current text-indigo-600" />
                  {isHi ? 'आपदा एवं मार्ग परिवर्तन सिमुलेशन' : 'DISASTER & DETOUR SIMULATION'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-200 text-indigo-900 border border-indigo-300">
                  {t.badge_phases}
                </span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-snug">
                {isHi
                  ? 'सिक्किम, मणिपुर, मिजोरम व असम में भूस्खलन एवं बाढ़ की स्थिति का 6 चरणों में अनुकरण करें।'
                  : 'Test how the platform handles severe landslides and recalculates safe bypass detours in 6 interactive phases.'}
              </p>
              <button
                onClick={() => onNavigateToTab('simulation_drill')}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isHi ? 'सिमुलेशन अभ्यास कक्ष खोलें →' : 'Open Disaster Simulation Drill →'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: LIVE OPERATIONAL STATUS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 4 Compact Operational Metrics (Col 8) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  {t.metric_road_accessibility}
                </span>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  <span className="text-emerald-700">{accessibleRoads} {t.metric_open}</span>
                  {blockedRoads > 0 && <span className="text-rose-600 ml-1.5 font-bold">· {blockedRoads} {t.metric_blocked}</span>}
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs hover:border-amber-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  {t.metric_active_hazards}
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-700">
                  9 {t.metric_corridors_risk}
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs hover:border-blue-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  {t.metric_relief_fleets}
                </span>
                <span className="text-xs sm:text-sm font-bold text-blue-700">
                  6 {t.metric_convoys_route}
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs hover:border-purple-300 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  {t.metric_safe_detours}
                </span>
                <span className="text-xs sm:text-sm font-bold text-purple-700">
                  3 {t.metric_operational}
                </span>
              </div>
            </div>
          </div>

          {/* Live Data Freshness & Simulation Mode Status (Col 4) */}
          <div className="md:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-2 text-[10px] font-mono pl-0 md:pl-2 border-t md:border-t-0 md:border-l border-slate-200">
            <div className="space-y-0.5 text-slate-600">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t.metric_data_sync}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {t.metric_sync_sub}
              </div>
            </div>

            <div className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold tracking-wider" title="Calibrated monsoon scenario active for SIH presentation. Live Open-Meteo & IMD APIs integrated for production.">
              {t.metric_drill_tag}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
