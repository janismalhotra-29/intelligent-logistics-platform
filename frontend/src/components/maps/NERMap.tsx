import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Road, Vehicle, Incident, Hub, WeatherStation } from '../../types';
import { NER_STATE_BOUNDARIES } from '../../data/ner_boundaries';
import { 
  Layers, 
  MapPin, 
  Crosshair, 
  Map as MapIcon, 
  Globe, 
  Mountain,
  Eye,
  EyeOff,
  X, 
  Search, 
  Layers as LayersIcon, 
  AlertTriangle, 
  Maximize2,
  Navigation,
  Compass
} from 'lucide-react';
import { SCENARIO_CONVOYS, DEFAULT_CONVOY_ID } from '../../data/scenarioConfigs';

interface NERMapProps {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  hubs: Hub[];
  weather: WeatherStation[];
  selectedRoadId?: string;
  scenarioVehicleId?: string;
  onSelectRoad?: (road: Road) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSimulateDetour?: () => void;
  highlightAiRoute?: boolean;
  height?: string;
}

// Bounding box encompassing all 8 NER states
const NER_BOUNDS: [[number, number], [number, number]] = [
  [21.8, 88.0], // South-West (South Mizoram/Tripura/Sikkim)
  [29.5, 97.5]  // North-East (North Arunachal Pradesh)
];


// Route B (Dikchu – Phodong Western Bypass) AI Recommended Trajectory
const AI_DETOUR_COORDINATES: [number, number][] = [
  [27.3389, 88.6065], // Gangtok Hub
  [27.3620, 88.5720],
  [27.3980, 88.5230], // Dikchu
  [27.4280, 88.5080],
  [27.4650, 88.5010], // Phodong
  [27.4890, 88.5150],
  [27.5034, 88.5284]  // Mangan Base
];

const BASEMAP_TILES = {
  osm_standard: {
    name: 'OpenStreetMap Streets (All Real Roads & Towns)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  esri_streets: {
    name: 'Esri World Street Map (Highways & Arterials)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ, TomTom'
  },
  esri_topo: {
    name: 'Mountain Topography & Relief',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, Intermap'
  },
  carto_dark: {
    name: 'Tactical Night Dark Matter',
    url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  },
  esri_satellite: {
    name: 'Satellite Imagery & Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  }
};

// Custom Icons
const createHubIcon = () => {
  return L.divIcon({
    className: 'custom-hub-icon',
    html: `
      <div style="background: #0284c7; width: 13px; height: 13px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 10px rgba(2,132,199,0.9);"></div>
    `,
    iconSize: [13, 13],
    iconAnchor: [6, 6]
  });
};

const createVehicleIcon = (status: string, priority: number) => {
  const isCritical = priority >= 95;
  const color = status === 'DIVERTED' ? '#10b981' : isCritical ? '#3b82f6' : '#2563eb';
  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${color}44; animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold;">
          🚛
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createIncidentIcon = (type: string, severity: string) => {
  const color = severity === 'HIGH' || severity === 'CRITICAL' ? '#ef4444' : '#f97316';
  return L.divIcon({
    className: 'custom-incident-icon',
    html: `
      <div style="background: ${color}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 12px ${color};">
        !
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createStateLabelIcon = (name: string, color: string) => {
  return L.divIcon({
    className: 'state-label-icon',
    html: `
      <div style="background: rgba(11, 17, 32, 0.88); border: 1px solid ${color}aa; color: ${color}; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.7); pointer-events: none;">
        ${name}
      </div>
    `,
    iconSize: [60, 20],
    iconAnchor: [30, 10]
  });
};

const getRoadMidpoint = (coordinates: [number, number][]): [number, number] => {
  if (!coordinates || coordinates.length === 0) return [26.0, 92.0];
  const midIdx = Math.floor(coordinates.length / 2);
  return coordinates[midIdx];
};

const createHighwayBadgeIcon = (highwayNo: string, status: string) => {
  const getBadgeColor = () => {
    switch (status) {
      case 'BLOCKED': return '#ef4444';
      case 'RESTRICTED': return '#f97316';
      case 'WATCH': return '#eab308';
      case 'ACCESSIBLE': default: return '#10b981';
    }
  };
  const color = getBadgeColor();
  return L.divIcon({
    className: 'custom-highway-badge',
    html: `
      <div style="background: rgba(15, 23, 42, 0.95); border: 1.5px solid ${color}; color: #ffffff; padding: 2px 6px; border-radius: 5px; font-size: 9px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.65); display: flex; align-items: center; gap: 4px; white-space: nowrap; pointer-events: none;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></span>
        ${highwayNo}
      </div>
    `,
    iconSize: [54, 20],
    iconAnchor: [27, 10]
  });
};

const createAiRouteBadgeIcon = (label: string = 'ROUTE B (DIKCHU)') => {
  return L.divIcon({
    className: 'ai-route-badge',
    html: `
      <div style="background: rgba(88, 28, 135, 0.95); border: 1.5px solid #c084fc; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; font-family: ui-monospace, monospace; letter-spacing: 0.5px; box-shadow: 0 0 14px rgba(192, 132, 252, 0.8); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #c084fc; box-shadow: 0 0 6px #c084fc;"></span>
        🟣 AI DETOUR: ${label.toUpperCase()}
      </div>
    `,
    iconSize: [220, 22],
    iconAnchor: [110, 11]
  });
};

// Map View Controller Helper
function MapViewController({ 
  highlightAiRoute, 
  scenarioVehicleId 
}: { 
  highlightAiRoute: boolean; 
  scenarioVehicleId?: string; 
}) {
  const map = useMap();
  const prevHighlight = React.useRef(highlightAiRoute);
  const prevVehicle = React.useRef(scenarioVehicleId);

  useEffect(() => {
    map.fitBounds(NER_BOUNDS, { padding: [15, 15] });
  }, [map]);

  useEffect(() => {
    if (highlightAiRoute && (highlightAiRoute !== prevHighlight.current || scenarioVehicleId !== prevVehicle.current)) {
      const cfg = SCENARIO_CONVOYS[scenarioVehicleId || DEFAULT_CONVOY_ID] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];
      if (cfg) {
        map.flyTo(cfg.mapCenter, cfg.mapZoom, { duration: 1.2 });
      }
    }
    prevHighlight.current = highlightAiRoute;
    prevVehicle.current = scenarioVehicleId;
  }, [highlightAiRoute, scenarioVehicleId, map]);

  return null;
}

export const NERMap: React.FC<NERMapProps> = ({
  roads,
  vehicles,
  incidents,
  hubs,
  weather,
  selectedRoadId,
  scenarioVehicleId = DEFAULT_CONVOY_ID,
  onSelectRoad,
  onSelectVehicle,
  onSimulateDetour,
  highlightAiRoute = false,
  height = '600px'
}) => {
  const activeScenario = SCENARIO_CONVOYS[scenarioVehicleId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];
  const detourCoords = activeScenario.detourCoordinates;
  const [activeBasemap, setActiveBasemap] = useState<keyof typeof BASEMAP_TILES>('osm_standard');

  const [layers, setLayers] = useState({
    stateBoundaries: true,
    roads: true,
    riskColors: true,
    vehicles: true,
    incidents: true,
    hubs: true,
    weather: true,
    aiDetour: true
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const getRoadColor = (road: Road) => {
    if (!layers.riskColors) return '#38bdf8';
    switch (road.status) {
      case 'BLOCKED':
        return '#ef4444'; // 🔴 RED
      case 'RESTRICTED':
        return '#f97316'; // 🟠 ORANGE
      case 'WATCH':
        return '#eab308'; // 🟡 YELLOW
      case 'ACCESSIBLE':
      default:
        return '#10b981'; // 🟢 GREEN
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100" style={{ height }}>
      {/* Top Right Floating Controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
        {/* Basemap Style Selector */}
        <div className="bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm backdrop-blur-md flex items-center gap-1.5 text-xs">
          <MapIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <select
            value={activeBasemap}
            onChange={(e) => setActiveBasemap(e.target.value as keyof typeof BASEMAP_TILES)}
            className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {Object.entries(BASEMAP_TILES).map(([k, v]) => (
              <option key={k} value={k} className="bg-white text-slate-800">
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* GIS Layer Menu Button */}
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm backdrop-blur-md transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Layers</span>
        </button>

        {showLayerMenu && (
          <div className="absolute top-11 right-0 bg-white border border-slate-200 rounded-xl p-3 shadow-lg w-56 space-y-2 text-xs text-slate-700">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              GIS Layer Overlays
            </span>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>8 State Boundaries</span>
              <input
                type="checkbox"
                checked={layers.stateBoundaries}
                onChange={(e) => setLayers({ ...layers, stateBoundaries: e.target.checked })}
                className="rounded text-blue-600 border-slate-300 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>Highway Corridors</span>
              <input
                type="checkbox"
                checked={layers.roads}
                onChange={(e) => setLayers({ ...layers, roads: e.target.checked })}
                className="rounded text-blue-600 border-slate-300 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>AI Recommended Detour</span>
              <input
                type="checkbox"
                checked={layers.aiDetour}
                onChange={(e) => setLayers({ ...layers, aiDetour: e.target.checked })}
                className="rounded text-purple-600 border-slate-300 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>Relief Fleet Vehicles</span>
              <input
                type="checkbox"
                checked={layers.vehicles}
                onChange={(e) => setLayers({ ...layers, vehicles: e.target.checked })}
                className="rounded text-blue-600 border-slate-300 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>Field Incidents</span>
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                className="rounded text-rose-600 border-slate-300 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
              <span>Logistics Hubs</span>
              <input
                type="checkbox"
                checked={layers.hubs}
                onChange={(e) => setLayers({ ...layers, hubs: e.target.checked })}
                className="rounded text-blue-600 border-slate-300 focus:ring-0"
              />
            </label>
          </div>
        )}
      </div>

      {/* Clean Bottom Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-command-950/95 border border-slate-800 rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300 font-medium">Open / Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-sm shadow-yellow-500/50"></span>
          <span className="text-slate-300 font-medium">Caution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm shadow-orange-500/50"></span>
          <span className="text-slate-300 font-medium">High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50 animate-pulse"></span>
          <span className="text-slate-300 font-medium font-bold text-rose-300">Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500/50"></span>
          <span className="text-slate-300 font-medium">Relief Vehicle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm shadow-purple-500/50"></span>
          <span className="text-purple-300 font-semibold">AI Recommended Route</span>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        bounds={NER_BOUNDS}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapViewController 
          highlightAiRoute={highlightAiRoute} 
          scenarioVehicleId={scenarioVehicleId} 
        />
        
        {/* Dynamic Tile Layer */}
        <TileLayer
          key={activeBasemap}
          attribution={BASEMAP_TILES[activeBasemap].attribution}
          url={BASEMAP_TILES[activeBasemap].url}
          maxZoom={18}
        />

        {/* 1. State Boundaries */}
        {layers.stateBoundaries &&
          NER_STATE_BOUNDARIES.map((st) => (
            <React.Fragment key={st.name}>
              <Polygon
                positions={st.polygon}
                pathOptions={{
                  color: st.color,
                  weight: 1.5,
                  dashArray: '4, 4',
                  fillColor: st.color,
                  fillOpacity: 0.03
                }}
              />
              <Marker
                position={st.center}
                icon={createStateLabelIcon(st.name, st.color)}
                interactive={false}
              />
            </React.Fragment>
          ))}

        {/* 2. Road Network Polylines with Dual Glow & Shield Badges */}
        {layers.roads &&
          roads.map((r) => {
            const isSelected = selectedRoadId === r.id;
            const color = getRoadColor(r);
            const midPoint = getRoadMidpoint(r.coordinates);
            const isBlocked = r.status === 'BLOCKED';

            return (
              <React.Fragment key={r.id}>
                {/* Glow underlay polyline */}
                <Polyline
                  positions={r.coordinates}
                  pathOptions={{
                    color: isBlocked ? '#ef4444' : isSelected ? '#38bdf8' : color,
                    weight: isBlocked ? 14 : isSelected ? 12 : 8,
                    opacity: isBlocked ? 0.75 : isSelected ? 0.65 : 0.4
                  }}
                  interactive={false}
                />
                {/* Sharp foreground road polyline */}
                <Polyline
                  positions={r.coordinates}
                  pathOptions={{
                    color: color,
                    weight: isBlocked ? 6 : isSelected ? 6.5 : 4.5,
                    opacity: 1.0,
                    dashArray: r.status === 'RESTRICTED' ? '6, 6' : undefined
                  }}
                  eventHandlers={{
                    click: () => onSelectRoad && onSelectRoad(r)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-3 text-slate-900 min-w-[250px] font-sans">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                        <span className="font-black text-sm text-slate-900 tracking-tight">{r.highway_no}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                            isBlocked ? 'bg-rose-600 animate-pulse' : ''
                          }`}
                          style={{ background: isBlocked ? '#dc2626' : color }}
                        >
                          {r.status}
                        </span>
                      </div>
                      
                      <p className="text-xs font-bold text-slate-800 leading-snug">{r.name}</p>
                      
                      {/* Detailed Landslide / Hazard Information */}
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Condition:</span>
                          <span className="font-bold text-slate-800">
                            {isBlocked ? '⚠️ Landslide detected · Mile 14' : 'Operational Corridor'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Rainfall:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {isBlocked ? '142 mm / 24h' : '32 mm / 24h'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Slope:</span>
                          <span className="font-mono font-bold text-slate-800">{r.slope_deg}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Vehicles Affected:</span>
                          <span className={`font-mono font-bold ${isBlocked ? 'text-rose-600' : 'text-slate-800'}`}>
                            {isBlocked ? '6 Convoys' : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Medical Shipments:</span>
                          <span className={`font-mono font-bold ${isBlocked ? 'text-rose-600' : 'text-slate-800'}`}>
                            {isBlocked ? '2 At Risk' : 'Normal'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Landslide Risk:</span>
                          <span className={`font-bold ${isBlocked ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {isBlocked ? 'VERY HIGH (91%)' : 'LOW (24%)'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-500 font-medium">Recommended Action:</span>
                          <span className={`font-bold uppercase ${isBlocked ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {isBlocked ? 'REROUTE VIA BYPASS' : 'PROCEED'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        {onSelectRoad && (
                          <button
                            onClick={() => onSelectRoad(r)}
                            className="w-full py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition-colors uppercase tracking-wider"
                          >
                            VIEW DETAILS
                          </button>
                        )}
                        {onSimulateDetour && isBlocked && (
                          <button
                            onClick={onSimulateDetour}
                            className="w-full py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-500 transition-colors uppercase tracking-wider shadow-sm"
                          >
                            SIMULATE DETOUR
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Polyline>
                {/* Highway Badge Icon */}
                {r.coordinates && r.coordinates.length > 0 && (
                  <Marker
                    position={midPoint}
                    icon={createHighwayBadgeIcon(r.highway_no, r.status)}
                    interactive={false}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/* 3. AI Recommended Route (Purple Corridor) */}
        {(layers.aiDetour && highlightAiRoute && detourCoords && detourCoords.length > 0) && (
          <React.Fragment>
            {/* Glowing purple underlay */}
            <Polyline
              positions={detourCoords}
              pathOptions={{
                color: '#c084fc',
                weight: 12,
                opacity: 0.65
              }}
              interactive={false}
            />
            {/* Crisp purple dashed foreground */}
            <Polyline
              positions={detourCoords}
              pathOptions={{
                color: '#9333ea',
                weight: 6,
                opacity: 1.0,
                dashArray: '8, 6'
              }}
            >
              <Popup>
                <div className="p-2.5 text-slate-900 min-w-[230px]">
                  <div className="font-bold text-xs text-purple-900 mb-1 flex items-center gap-1.5">
                    <span>🟣 AI RECOMMENDED ALTERNATIVE</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{activeScenario.bypassRoad}</h4>
                  <span className="text-[10px] text-purple-700 font-semibold block">{activeScenario.bypassSub}</span>
                  <div className="mt-1.5 text-[11px] text-slate-600 space-y-1 border-t border-slate-200 pt-1.5">
                    <div>Sector: <strong className="text-slate-900">{activeScenario.sector}</strong></div>
                    <div>Distance Overhead: <strong className="text-slate-900">{activeScenario.bypassOverheadKm}</strong></div>
                    <div>Additional Time: <strong className="text-slate-900">{activeScenario.bypassOverheadTime}</strong></div>
                    <div>Safety Score: <strong className="text-emerald-700">{activeScenario.safetyScore} (Bypasses Hazard)</strong></div>
                    <div>Assigned Convoy: <strong className="text-slate-900">{activeScenario.id}</strong></div>
                  </div>
                </div>
              </Popup>
            </Polyline>
            <Marker
              position={detourCoords[Math.floor(detourCoords.length / 2)]}
              icon={createAiRouteBadgeIcon(activeScenario.bypassRoad.split('(')[0].trim())}
              interactive={false}
            />
          </React.Fragment>
        )}

        {/* 4. Logistics Hubs */}
        {layers.hubs &&
          hubs.map((h) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              icon={createHubIcon()}
            >
              <Popup>
                <div className="p-1.5 text-slate-900 text-xs">
                  <span className="font-bold block text-sky-700">{h.name}</span>
                  <span className="text-[10px] text-slate-600">{h.type} • {h.state}</span>
                  <div className="text-[10px] mt-1 font-semibold">Capacity: {h.capacity_tons} tons</div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 5. Incidents */}
        {layers.incidents &&
          incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.lat, inc.lng]}
              icon={createIncidentIcon(inc.type, inc.severity)}
            >
              <Popup>
                <div className="p-2 text-slate-900 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-rose-700 uppercase text-[10px]">{inc.type}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800">{inc.road_name}</p>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{inc.description}</p>
                  <div className="text-[9px] text-slate-500 mt-1.5 border-t pt-1">
                    Reported by: {inc.reported_by} ({inc.timestamp})
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 6. Active Fleet Vehicles (Blue Relief Vehicles) */}
        {layers.vehicles &&
          vehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.current_lat, v.current_lng]}
              icon={createVehicleIcon(v.status, v.cargo_priority)}
              eventHandlers={{
                click: () => onSelectVehicle && onSelectVehicle(v)
              }}
            >
              <Popup>
                <div className="p-2.5 text-slate-900 text-xs min-w-[220px]">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-200">
                    <span className="font-black text-xs text-blue-700 font-mono">CONVOY #{v.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      v.status === 'DIVERTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  
                  <div className="font-bold text-xs text-slate-800">{v.name}</div>
                  
                  <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-bold text-slate-800">{v.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cargo:</span>
                      <span className="font-bold text-slate-800">{v.cargo_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ETA:</span>
                      <span className="font-mono font-bold text-slate-800">{v.normal_eta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Route Risk:</span>
                      <span className={`font-bold ${v.current_route_risk === 'LOW' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {v.current_route_risk}
                      </span>
                    </div>
                  </div>

                  {onSelectVehicle && (
                    <button
                      onClick={() => onSelectVehicle(v)}
                      className="mt-2 w-full py-1.5 rounded bg-blue-700 text-white font-bold text-[10px] hover:bg-blue-800 transition-colors uppercase tracking-wider"
                    >
                      INSPECT CONVOY TELEMATICS
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

