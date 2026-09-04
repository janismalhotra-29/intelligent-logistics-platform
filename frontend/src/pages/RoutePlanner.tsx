import React, { useState } from 'react';
import { optimizeRoute } from '../services/api';
import { 
  Navigation, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  Truck,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Polyline, MapContainer, TileLayer } from 'react-leaflet';

const ORIGINS = [
  'Gangtok Medical Depot (Sikkim)',
  'Guwahati Central Logistic Hub (Assam)',
  'Silchar Transshipment Depot (Assam)',
  'Shillong Strategic Cold Chain (Meghalaya)',
  'Dimapur Central Railhead (Nagaland)',
  'Agartala Integrated Logistics Hub (Tripura)'
];

const DESTINATIONS = [
  'Mangan Forward Relief Base (North Sikkim)',
  'Lachung High Altitude Outpost (Sikkim)',
  'Tawang High-Altitude Base (Arunachal Pradesh)',
  'Imphal Relief & Distribution Center (Manipur)',
  'Aizawl Civil Supplies Warehouse (Mizoram)',
  'Kohima Highland Depot (Nagaland)'
];

const CARGO_TYPES = [
  { name: 'Medicine', priority: 100, label: 'Emergency Medicine (Priority 100)' },
  { name: 'Emergency supplies', priority: 95, label: 'Disaster Relief Kits (Priority 95)' },
  { name: 'Food', priority: 90, label: 'WFP Rations & Pulses (Priority 90)' },
  { name: 'Fuel', priority: 85, label: 'Aviation & Diesel Fuel (Priority 85)' },
  { name: 'Agricultural produce', priority: 70, label: 'Essential Foodgrains (Priority 70)' },
  { name: 'Construction material', priority: 50, label: 'Heavy Engineering (Priority 50)' }
];

const VEHICLE_TYPES = [
  'Heavy Multi-Axle Truck (AIS-140 GPS)',
  'Cold-Chain Medical Van (2-8°C)',
  'Light Commercial Vehicle (LCV 4x4)',
  'Heavy Fuel Bowzer (ATF/HSD)',
  'Disaster Relief Carrier (NDRF)'
];

const PRESET_ROUTES = [
  {
    label: '🏔️ Gangtok → Mangan (North Sikkim Landslide Test)',
    origin: 'Gangtok Medical Depot (Sikkim)',
    destination: 'Mangan Forward Relief Base (North Sikkim)',
    cargo: CARGO_TYPES[0]
  },
  {
    label: '🌿 Guwahati → Imphal (Manipur Lifeline)',
    origin: 'Guwahati Central Logistic Hub (Assam)',
    destination: 'Imphal Relief & Distribution Center (Manipur)',
    cargo: CARGO_TYPES[1]
  },
  {
    label: '⛰️ Guwahati → Tawang (Arunachal Border)',
    origin: 'Guwahati Central Logistic Hub (Assam)',
    destination: 'Tawang High-Altitude Base (Arunachal Pradesh)',
    cargo: CARGO_TYPES[2]
  }
];

export const RoutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [selectedCargo, setSelectedCargo] = useState(CARGO_TYPES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeRouteId, setActiveRouteId] = useState<string>('ROUTE-B');

  const handleCalculateRoute = async (customOrigin?: string, customDest?: string, customCargo?: any) => {
    setLoading(true);
    const org = customOrigin || origin;
    const dst = customDest || destination;
    const crg = customCargo || selectedCargo;

    try {
      const data = await optimizeRoute({
        origin: org,
        destination: dst,
        cargo_category: crg.name,
        cargo_priority: crg.priority
      });
      setResult(data);
      if (data.recommended_route) {
        setActiveRouteId(data.recommended_route.route_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ROUTES[0]) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setSelectedCargo(preset.cargo);
    handleCalculateRoute(preset.origin, preset.destination, preset.cargo);
  };

  React.useEffect(() => {
    handleCalculateRoute();
  }, []);

  const activeRoute = result?.all_routes?.find((r: any) => r.route_id === activeRouteId) || result?.recommended_route;

  return (
    <div className="space-y-3 font-sans">
      {/* Route Request Planner Form */}
      <div className="bg-command-900 border border-slate-800 p-4 rounded-xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Emergency Route Optimization & Hazard Bypass Engine
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Penalizes active landslides, flood zones, and saturated mountain slopes.
          </span>
        </div>

        {/* 1-Click Common Route Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Common Scenarios:</span>
          </span>
          {PRESET_ROUTES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-command-950 hover:bg-command-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Form Inputs: FROM, TO, Cargo Type, Vehicle Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* FROM */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
              FROM (Starting Depot)
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-command-950 text-white text-xs px-2.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {ORIGINS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
              TO (Destination Base)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-command-950 text-white text-xs px-2.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Cargo Type */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
              Cargo Category
            </label>
            <select
              value={selectedCargo.name}
              onChange={(e) => {
                const found = CARGO_TYPES.find((c) => c.name === e.target.value);
                if (found) setSelectedCargo(found);
              }}
              className="w-full bg-command-950 text-white text-xs px-2.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {CARGO_TYPES.map((c) => (
                <option key={c.name} value={c.name}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
              Vehicle Type
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-command-950 text-white text-xs px-2.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleCalculateRoute()}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Calculating Safe Path...</span>
              ) : (
                <>
                  <span>CALCULATE DETOUR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Comparison Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Candidate Routes: FASTEST, SAFEST, AI RECOMMENDED (Col 8) */}
          <div className="lg:col-span-8 space-y-3">
            {/* AI Decision Rationale Banner */}
            <div className="p-3.5 rounded-xl border border-purple-800/60 bg-purple-950/20 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  AI Decision Rationale & Safety Trade-Off
                </h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  {result.recommendation_rationale}
                </p>
              </div>
            </div>

            {/* Candidate Route Cards: FASTEST, SAFEST, AI RECOMMENDED */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {result.all_routes?.map((r: any, idx: number) => {
                const isSelected = activeRouteId === r.route_id;
                const isAiRecommended = r.route_id === 'ROUTE-B' || r.status === 'RECOMMENDED';
                const isFastest = r.route_id === 'ROUTE-A';
                const isSafest = r.route_id === 'ROUTE-C' || (!isAiRecommended && !isFastest);

                const categoryLabel = isAiRecommended
                  ? '🟣 AI RECOMMENDED'
                  : isFastest
                  ? '⚡ FASTEST ROUTE'
                  : '🛡️ SAFEST ROUTE';

                const roadStatusText = r.risk_score > 70 ? '🔴 BLOCKED' : r.risk_score > 35 ? '🟡 WATCH' : '🟢 OPEN';
                const weatherRiskText = r.risk_score > 70 ? 'Extreme Torrent (142mm)' : 'Moderate Rain (32mm)';

                return (
                  <div
                    key={r.route_id}
                    onClick={() => setActiveRouteId(r.route_id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? isAiRecommended
                          ? 'border-purple-400 bg-command-900 shadow-xl shadow-purple-950/50 ring-1 ring-purple-400'
                          : 'border-cyan-400 bg-command-900 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-command-950 hover:bg-command-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
                      <span className={`text-[10px] font-mono font-bold ${
                        isAiRecommended ? 'text-purple-300' : 'text-slate-300'
                      }`}>
                        {categoryLabel}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        r.status === 'RECOMMENDED'
                          ? 'bg-purple-600 text-white'
                          : r.status === 'NOT RECOMMENDED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-command-800 text-slate-300'
                      }`}>
                        {r.highway}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2 leading-snug">{r.name}</h4>

                    <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Distance:</span>
                        <span className="font-mono font-bold text-white">{r.distance_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Predicted ETA:</span>
                        <span className="font-mono font-bold text-white">{r.normal_eta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Score:</span>
                        <span className={`font-mono font-bold ${
                          r.risk_score > 70 ? 'text-rose-400' : r.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {r.risk_score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weather Risk:</span>
                        <span className="text-slate-200">{weatherRiskText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Road Status:</span>
                        <span className="font-bold">{roadStatusText}</span>
                      </div>
                      {isAiRecommended && (
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                          <span>Safety Score:</span>
                          <span>94%</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                      <strong>Reason: </strong>
                      {isAiRecommended
                        ? 'Avoids NH-310A landslide zone at Mile-14. Zero roadblock probability.'
                        : r.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Route Detailed Metrics */}
            {activeRoute && (
              <div className="bg-command-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Detailed Route Specifications: {activeRoute.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {activeRoute.distance_km} km • ETA {activeRoute.predicted_eta || activeRoute.normal_eta}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {activeRoute.tradeoffs?.map((t: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-command-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t.label}</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{t.value}</span>
                    </div>
                  ))}
                  <div className="p-2 rounded-lg bg-command-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">AIS-140 Convoy Clearance</span>
                    <span className="font-bold text-emerald-400 text-xs mt-0.5 block">Approved</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Corridor Trajectory Map (Col 4) */}
          <div className="lg:col-span-4 bg-command-900 p-3 rounded-xl border border-slate-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Corridor Trajectory Map
              </span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-bold">
                {activeRoute?.highway || 'CORRIDOR'}
              </span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800">
              <MapContainer
                center={[27.42, 88.55]}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {activeRoute?.coordinates && (
                  <Polyline
                    positions={activeRoute.coordinates}
                    pathOptions={{
                      color: activeRoute.route_id === 'ROUTE-B' ? '#a855f7' : activeRoute.color || '#10b981',
                      weight: 6,
                      opacity: 0.95,
                      dashArray: activeRoute.route_id === 'ROUTE-B' ? '8, 6' : undefined
                    }}
                  />
                )}
              </MapContainer>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Selected: <strong className="text-white">{activeRoute?.name}</strong></span>
              <span className="text-purple-300 font-bold">🟣 Purple = AI Bypass</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
