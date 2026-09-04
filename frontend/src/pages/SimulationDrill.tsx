import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Navigation, 
  Sparkles, 
  ExternalLink, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  ChevronRight,
  Shield,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { NERMap } from '../components/maps/NERMap';
import { Road, Vehicle, Incident, Hub, WeatherStation } from '../types';
import { 
  SCENARIO_CONVOYS, 
  DEFAULT_CONVOY_ID, 
  ScenarioConvoy, 
  getPhaseAdvisory,
  PhaseAdvisory
} from '../data/scenarioConfigs';
import { translations, Language } from '../i18n/translations';
import { NavTab } from '../components/layout/Sidebar';

interface SimulationDrillProps {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  hubs: Hub[];
  weather: WeatherStation[];
  lang: Language;
  scenarioPhase: number;
  setScenarioPhase: (phase: number) => void;
  scenarioVehicleId: string;
  setScenarioVehicleId: (id: string) => void;
  onSelectRoad: (road: Road) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNavigateToTab: (tab: NavTab) => void;
}

const PHASES_LIST = [
  { phase: 1, labelEn: '1. Normal Road', labelHi: '1. सामान्य सड़क', descEn: 'Baseline Transit', descHi: 'आधारभूत आवागमन' },
  { phase: 2, labelEn: '2. Heavy Rain', labelHi: '2. भारी वर्षा', descEn: 'Weather Watch', descHi: 'मौसम निगरानी' },
  { phase: 3, labelEn: '3. Risk Escalation', labelHi: '3. जोखिम वृद्धि', descEn: 'Saturation Alert', descHi: 'संतृप्ति चेतावनी' },
  { phase: 4, labelEn: '4. Road Blocked', labelHi: '4. सड़क अवरुद्ध', descEn: 'Corridor Cut', descHi: 'मार्ग विच्छेदन' },
  { phase: 5, labelEn: '5. AI Detour', labelHi: '5. एआई बाईपास', descEn: 'Bypass Calculated', descHi: 'बाईपास तैयार' },
  { phase: 6, labelEn: '6. Convoy Safe', labelHi: '6. काफिला सुरक्षित', descEn: 'Transit Secured', descHi: 'सुरक्षित बहाली' }
];

export const SimulationDrill: React.FC<SimulationDrillProps> = ({
  roads,
  vehicles,
  incidents,
  hubs,
  weather,
  lang,
  scenarioPhase,
  setScenarioPhase,
  scenarioVehicleId,
  setScenarioVehicleId,
  onSelectRoad,
  onSelectVehicle,
  onNavigateToTab
}) => {
  const t = translations[lang];
  const isHi = lang === 'hi';

  const activeScenario: ScenarioConvoy = SCENARIO_CONVOYS[scenarioVehicleId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];
  const advisory: PhaseAdvisory = getPhaseAdvisory(activeScenario, scenarioPhase, lang);
  const [highlightAiRoute, setHighlightAiRoute] = useState<boolean>(true);

  // Convoy selector options
  const availableConvoys = Object.values(SCENARIO_CONVOYS);

  return (
    <div className="space-y-3.5 font-sans animate-in fade-in duration-300">
      {/* 1. TOP HEADER & CORRIDOR SELECTOR BAR */}
      <div className="bg-command-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  {isHi ? 'आपदा एवं मार्ग परिवर्तन सिमुलेशन अभ्यास' : 'DISASTER & DETOUR SIMULATION DRILL'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {isHi ? 'इंटरैक्टिव अभ्यास कक्ष' : 'INTERACTIVE DRILL ROOM'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isHi 
                  ? 'पूर्वोत्तर के पर्वतीय गलियारों में भूस्खलन, बाढ़ व मार्ग अवरोध की स्थिति में एआई डायवर्जन का परीक्षण करें।'
                  : 'Simulate extreme mountain weather and landslides across 4 NER corridors to test real-time AI rerouting.'}
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScenarioPhase(1)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-command-950 hover:bg-command-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Reset drill to Phase 1 baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHi ? 'रीसेट (चरण 1)' : 'Reset (Phase 1)'}</span>
            </button>
            <button
              onClick={() => onNavigateToTab('command_center')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>{isHi ? 'लाइव कमांड सेंटर देखें' : 'View Live Command Center'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Corridor / Fleet Convoy Selector Pills */}
        <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            {isHi ? 'काफिला व आपदा गलियारा चुनें:' : 'SELECT CONVOY & CORRIDOR:'}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {availableConvoys.map((c) => {
              const isSelected = c.id === activeScenario.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setScenarioVehicleId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-md shadow-purple-950/50 ring-1 ring-purple-400'
                      : 'bg-command-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`}></span>
                  <span>{c.id} ({c.state})</span>
                  <span className="text-[10px] font-normal text-slate-400 font-mono hidden sm:inline">· {c.primaryRoad.split('(')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 6-PHASE PROGRESSION TIMELINE */}
      <div className="bg-command-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              {isHi ? '6-चरणीय आपदा एवं बाईपास अनुक्रम (सीधे किसी भी चरण पर क्लिक करें):' : '6-PHASE CONTINGENCY PIPELINE (CLICK ANY PHASE DIRECTLY):'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600/40 font-bold">
            {isHi ? `सक्रिय चरण: ${scenarioPhase}/6` : `Active: Phase ${scenarioPhase}/6`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PHASES_LIST.map((item) => {
            const isCurrent = scenarioPhase === item.phase;
            const isPassed = scenarioPhase > item.phase;
            return (
              <button
                key={item.phase}
                onClick={() => setScenarioPhase(item.phase)}
                className={`p-2 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-gradient-to-br from-purple-900/60 to-command-950 border-purple-400 shadow-md shadow-purple-950/50 ring-1 ring-purple-400'
                    : isPassed
                    ? 'bg-command-950/90 border-slate-700/80 hover:border-slate-600'
                    : 'bg-command-950/50 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isCurrent ? 'text-purple-300' : isPassed ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {isHi ? `चरण ${item.phase}` : `PHASE ${item.phase}`}
                  </span>
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  ) : isPassed ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ) : null}
                </div>
                <div className="text-xs font-black text-white truncate">
                  {isHi ? item.labelHi : item.labelEn}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {isHi ? item.descHi : item.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SIMULATION STATUS ALERT BANNER */}
      <div className={`border rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300 ${
        advisory.bannerType === 'NORMAL'
          ? 'bg-gradient-to-r from-emerald-950/60 via-command-900 to-command-950 border-emerald-500/40'
          : advisory.bannerType === 'WATCH'
          ? 'bg-gradient-to-r from-amber-950/70 via-command-900 to-command-950 border-amber-500/50'
          : advisory.bannerType === 'WARNING'
          ? 'bg-gradient-to-r from-orange-950/80 via-command-900 to-command-950 border-orange-500/50'
          : advisory.bannerType === 'CRITICAL'
          ? 'bg-gradient-to-r from-rose-950/90 via-command-900 to-command-950 border-rose-500/60'
          : advisory.bannerType === 'DETOUR'
          ? 'bg-gradient-to-r from-purple-950/80 via-command-900 to-command-950 border-purple-500/60'
          : 'bg-gradient-to-r from-emerald-950/80 via-command-900 to-command-950 border-emerald-500/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold shrink-0 text-base shadow-lg ${
            advisory.bannerType === 'NORMAL' || advisory.bannerType === 'RESOLVED'
              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
              : advisory.bannerType === 'WATCH'
              ? 'bg-amber-600/30 border-amber-500 text-amber-300 animate-pulse'
              : advisory.bannerType === 'WARNING'
              ? 'bg-orange-600/30 border-orange-500 text-orange-300 animate-pulse'
              : advisory.bannerType === 'CRITICAL'
              ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-purple-600/30 border-purple-500 text-purple-300'
          }`}>
            {advisory.recommendationIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${advisory.badgeClass}`}>
                {advisory.badge} ({isHi ? 'चरण' : 'PHASE'} {scenarioPhase}/6)
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {advisory.bannerHeadline}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-slate-300 border border-slate-700 font-bold">
                {activeScenario.id} ({activeScenario.state})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-300 mt-0.5">
              <span>{t.telemetry_rainfall}: <strong className="text-white">{advisory.rainfall}</strong></span>
              <span>• {t.telemetry_slope}: <strong className="text-white">{advisory.slope}</strong></span>
              <span>• {isHi ? 'सामग्री' : 'Cargo'}: <strong className="text-white">{activeScenario.cargo.split('(')[0]}</strong></span>
              <span>• {t.telemetry_road_status}: <strong className={advisory.roadStatusClass}>{advisory.roadStatus}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scenarioPhase < 6 ? (
            <button
              onClick={() => setScenarioPhase(scenarioPhase + 1)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isHi ? `अगला चरण (${scenarioPhase + 1}/6) →` : `Advance to Phase ${scenarioPhase + 1} →`}</span>
            </button>
          ) : (
            <button
              onClick={() => setScenarioPhase(1)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isHi ? 'अभ्यास पुनः प्रारंभ करें' : 'Restart Drill'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN SIMULATION WORKSPACE: GIS MAP (65%) + AI DETOUR ADVISOR (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left: Interactive Simulation GIS Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="bg-command-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-white uppercase text-[11px]">
                {isHi ? `गलियारा जीआईएस मानचित्र: ${activeScenario.state} (${activeScenario.sector})` : `CORRIDOR GIS SIMULATION: ${activeScenario.state} (${activeScenario.sector})`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {isHi ? 'अवरुद्ध सड़क (लाल)' : 'Blocked Highway (Red)'}
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                {isHi ? 'एआई बाईपास (बैंगनी)' : 'AI Detour Bypass (Purple)'}
              </span>
            </div>
          </div>

          <div className="relative">
            <NERMap
              roads={roads}
              vehicles={vehicles}
              incidents={incidents}
              hubs={hubs}
              weather={weather}
              scenarioVehicleId={activeScenario.id}
              onSelectRoad={onSelectRoad}
              onSelectVehicle={onSelectVehicle}
              highlightAiRoute={true}
              height="540px"
            />
          </div>
        </div>

        {/* Right: AI Contingency Advisor Panel */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-command-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
            {/* Title Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
                  {t.ai_advisor_header}
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                {isHi ? 'सिमुलेशन मोड' : 'SIMULATION MODE'}
              </span>
            </div>

            {/* Travel Recommendation Banner */}
            <div className="p-3 rounded-xl bg-command-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  {t.sector_label}: {activeScenario.sector}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${advisory.badgeClass}`}>
                  {isHi ? 'चरण' : 'PHASE'} {scenarioPhase} · {advisory.badge}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl shrink-0">{advisory.recommendationIcon}</span>
                <div>
                  <span className={`text-sm font-black uppercase tracking-tight block ${advisory.recommendationClass}`}>
                    {advisory.recommendation}
                  </span>
                  <p className="text-[11px] text-slate-300 font-medium leading-snug">
                    {advisory.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-command-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">{t.telemetry_rainfall}</span>
                <span className="font-mono font-bold text-white text-xs">{advisory.rainfall}</span>
              </div>
              <div className="p-2 rounded-lg bg-command-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">{t.telemetry_slope}</span>
                <span className="font-mono font-bold text-white text-xs">{advisory.slope}</span>
              </div>
              <div className="p-2 rounded-lg bg-command-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">{t.telemetry_road_status}</span>
                <span className={`font-bold text-xs ${advisory.roadStatusClass}`}>{advisory.roadStatus}</span>
              </div>
              <div className="p-2 rounded-lg bg-command-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">{t.telemetry_hazard_risk}</span>
                <span className={`font-bold text-xs ${advisory.riskClass}`}>{advisory.riskText}</span>
              </div>
            </div>

            {/* Explainable AI Factor Card */}
            <div className="p-3 rounded-xl bg-command-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                {advisory.xaiTitle}
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {advisory.xaiFactors.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safe Alternative Recommendation */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                  {advisory.alternativeLabel}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t.safety_score_label}: {advisory.alternativeSafety}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{advisory.alternativeSub}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{t.bypass_alternative}</span>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <div className="text-purple-300 font-bold">{advisory.alternativeOverhead}</div>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={() => setHighlightAiRoute(true)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white shadow-md shadow-purple-950/50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t.safe_route_active}</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('route_planner')}
                  className="p-1.5 rounded-lg bg-command-800 hover:bg-command-700 text-slate-300 border border-slate-700 cursor-pointer"
                  title="Open Route Planner"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Affected Convoy Snapshot */}
            <div className="p-2.5 rounded-xl bg-command-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block text-[11px]">
                    {isHi ? 'काफिला' : 'Convoy'} {activeScenario.id}: {advisory.convoyStatusText}
                  </span>
                  <span className="text-[10px] text-slate-400">{activeScenario.origin} → {activeScenario.destination}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${advisory.convoyStatusBadge}`}>
                {advisory.badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
