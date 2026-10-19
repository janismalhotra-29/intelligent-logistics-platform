import React, { useState, useEffect } from 'react';
import { Road } from '../types';
import { fetchRoadIntelligence, fetchRoads } from '../services/api';
import { 
  AlertTriangle, 
  MapPin, 
  CloudRain, 
  Mountain, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  ArrowRight,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

interface RoadIntelligenceProps {
  initialRoadId?: string;
}

export const RoadIntelligence: React.FC<RoadIntelligenceProps> = ({ initialRoadId }) => {
  const [roads, setRoads] = useState<Road[]>([]);
  const [selectedRoadId, setSelectedRoadId] = useState<string>(initialRoadId || 'R-1024');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoads().then((data) => {
      setRoads(data);
      if (!selectedRoadId && data.length > 0) {
        setSelectedRoadId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedRoadId) {
      setLoading(true);
      fetchRoadIntelligence(selectedRoadId)
        .then((data) => {
          setIntelligence(data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedRoadId]);

  const road = intelligence?.road;
  const weather = intelligence?.weather;
  const riskAnalysis = intelligence?.risk_analysis;
  const accessibility = intelligence?.accessibility;
  const etaAnalysis = intelligence?.eta_analysis;
  const alternative = intelligence?.alternative;

  // Rainfall trend data for recharts
  const rainfallTrendData = (weather?.rainfall_trend || [25, 40, 65, 90, 115, 130, 142]).map((val: number, i: number) => ({
    hour: `T-${(6 - i) * 4}h`,
    rainfall: val
  }));

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Header & Road Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Road Intelligence & Explainable AI Disruption Inspector</span>
          </h2>
          <p className="text-xs text-slate-500">
            Physical topography, sensor telemetry, and deterministic ML predictions per highway sector.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium">Select Highway Sector:</label>
          <select
            value={selectedRoadId}
            onChange={(e) => setSelectedRoadId(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {roads.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}: {r.name} ({r.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono">Loading telemetry & computing ML risk vectors...</span>
        </div>
      ) : intelligence ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start">
          {/* Column 1: Core Physical Parameters & Status */}
          <div className="space-y-3.5">
            {/* Status Hero Card */}
            <div className={`p-4 rounded-xl border shadow-xs ${
              road?.status === 'BLOCKED'
                ? 'border-rose-200 bg-rose-50/50'
                : road?.status === 'WATCH'
                ? 'border-amber-200 bg-amber-50/50'
                : road?.status === 'RESTRICTED'
                ? 'border-orange-200 bg-orange-50/50'
                : 'border-emerald-200 bg-emerald-50/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-600">ROAD {road?.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${
                  road?.status === 'BLOCKED'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : road?.status === 'WATCH'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : road?.status === 'RESTRICTED'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {road?.status === 'BLOCKED' ? 'BLOCKED' : road?.status === 'WATCH' ? 'WATCH' : road?.status === 'RESTRICTED' ? 'RESTRICTED' : 'ACCESSIBLE'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{road?.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {accessibility?.reason}
              </p>
              
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Predicted Disruption Window:</span>
                <span className="font-mono font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                  {riskAnalysis?.disruption_window}
                </span>
              </div>
            </div>

            {/* Physical Telemetry Table */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
                Terrain & Physical Metrics
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Elevation</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{road?.elevation_m} m</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Slope Angle</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{road?.slope_deg}° (Steep)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Historical Incidents</span>
                  <span className="font-bold text-amber-700 text-sm font-mono">{intelligence?.historical_incidents_count} past slides</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Last Field Report</span>
                  <span className="font-bold text-slate-900 text-sm">{intelligence?.last_field_report}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Road Surface</span>
                  <span className="font-bold text-slate-900 text-sm">{road?.road_surface}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Bridge Integrity</span>
                  <span className="font-bold text-slate-900 text-sm">{road?.bridge_condition_score} / 5</span>
                </div>
              </div>
            </div>

            {/* Alternative Bypass Card */}
            {alternative && (
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Recommended Safe Bypass Corridor</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] border border-emerald-300">
                    {alternative.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{alternative.alternative_name}</h4>
                <p className="text-[11px] text-slate-600 font-mono">
                  Path: {alternative.route_path}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Added Distance</span>
                    <span className="font-bold text-slate-900 font-mono">{alternative.additional_distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Added Delay</span>
                    <span className="font-bold text-slate-900 font-mono">{alternative.estimated_additional_delay}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Explainable AI Attribution (XAI) */}
          <div className="space-y-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Explainable AI Risk Breakdown</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Decision Tree Weights</span>
              </div>

              {/* Big Risk Number */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono">Total Disruption Probability</span>
                  <span className="text-3xl font-black font-mono text-rose-600">
                    {riskAnalysis?.risk_score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-mono">Confidence Level</span>
                  <span className="text-lg font-bold font-mono text-emerald-700">
                    {riskAnalysis?.model_confidence}%
                  </span>
                </div>
              </div>

              {/* Explainable AI Contributors Bar Chart */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  Major Contributing Risk Drivers (+ Points):
                </span>
                {riskAnalysis?.contributors?.map((c: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate max-w-[200px]">{c.factor}</span>
                      <span className="font-mono font-bold text-rose-600">{c.points}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, c.value * 3)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-Risk Categorization */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Landslide Risk</span>
                  <span className="font-bold text-rose-600 font-mono text-sm">{riskAnalysis?.landslide_risk}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Flood Inundation</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{riskAnalysis?.flood_risk}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Rainfall Saturation</span>
                  <span className="font-bold text-amber-600 font-mono text-sm">{riskAnalysis?.heavy_rain_risk}%</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Convoy Congestion</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">{riskAnalysis?.traffic_risk}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Weather Radar & Precipitation Trends */}
          <div className="space-y-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rainfall Telemetry</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">{weather?.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">1-Hour</span>
                  <span className="font-bold text-slate-900 font-mono">{weather?.rainfall_1h_mm} mm</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">6-Hour</span>
                  <span className="font-bold text-slate-900 font-mono">{weather?.rainfall_6h_mm} mm</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">24-Hour</span>
                  <span className="font-bold text-rose-600 font-mono">{weather?.rainfall_24h_mm} mm</span>
                </div>
              </div>

              {/* Rainfall Trend Graph */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                  24-Hour Rainfall Trend (Cumulative Acceleration mm)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rainfallTrendData}>
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }} />
                      <Line type="monotone" dataKey="rainfall" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Forecast (Next 24h)</span>
                  <span className="font-bold text-slate-900 font-mono">{weather?.forecast_rainfall_mm} mm</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Warning State</span>
                  <span className="font-bold text-rose-600 font-mono text-xs">{weather?.warning_level}</span>
                </div>
              </div>
            </div>

            {/* Safety Disclaimer Banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Deterministic ML Advisory Notice</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Risk predictions are probabilistic estimates based on rainfall saturation and gradient factors. They assist emergency dispatch but do not guarantee absolute transit safety. Ground inspection takes precedence.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
