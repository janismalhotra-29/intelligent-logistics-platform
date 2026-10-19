import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Activity, 
  BrainCircuit, 
  PlayCircle
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScenario?: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onStartScenario
}) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'legend' | 'xai' | 'demo'>('pillars');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Platform Concepts & System Guide
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  SIH Knowledge Base
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand how predictive AI, real-time GIS, and multi-criteria routing protect mountain logistics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pillars'
                ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 border-x border-slate-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4 Core Pillars</span>
          </button>
          <button
            onClick={() => setActiveTab('legend')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'legend'
                ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 border-x border-slate-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Road Status Legend</span>
          </button>
          <button
            onClick={() => setActiveTab('xai')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'xai'
                ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 border-x border-slate-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Explainable AI (XAI)</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'demo'
                ? 'bg-white text-blue-700 border-t-2 border-t-blue-600 border-x border-slate-200 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Sikkim Drill Walkthrough</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'pillars' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed shadow-xs">
                <strong className="text-blue-950 block mb-0.5">Why Standard Consumer Maps Fail in the North East:</strong>
                Commercial navigation engines (Google Maps, Apple Maps) rely on static turn-by-turn routing based solely on consumer smartphone traffic delays. They cannot foresee Himalayan rockfall vulnerability, monsoon cloudburst saturation, or riverbank erosion. The NER platform is a <strong>Predictive Decision-Support Engine</strong> explicitly built for mountain lifelines.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 hover:border-slate-300 shadow-xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">8-State Arterial GIS</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Surveillance across 23 arterial corridors and 19 logistics depots across Assam, Sikkim, Arunachal, Meghalaya, Nagaland, Manipur, Mizoram, and Tripura.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 hover:border-slate-300 shadow-xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Real-Time Meteorological Trigger</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Monitors live rainfall rates (1h/6h/24h/7d) and saturation indices via verified TLS feeds from Open-Meteo & IMD to flag imminent washouts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 hover:border-slate-300 shadow-xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Explainable AI Risk Engine</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Random Forest model evaluates 23 geomorphological variables (slope angle, elevation, river distance) predicting disruptions before roads collapse.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 hover:border-slate-300 shadow-xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Dynamic Multi-Criteria Detour</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mathematical Dijkstra algorithm applies infinite penalty to blocked corridors, prioritizing cold-chain medicine and relief convoys via safe valley bypasses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legend' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-slate-600">
                Road status is dynamically evaluated in real-time by combining sensor data, field officer uplinks, and AI disruption probabilities:
              </p>

              <div className="grid gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    🟢
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">ACCESSIBLE (Risk &lt; 35%)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">Normal Flow</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Road is completely open and safe. Normal highway speeds maintained; all vehicle tonnages permitted without restriction.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    🟡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">WATCH (Risk 35% – 65%)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-medium">Weather Caution</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Heavy rainfall or waterlogging reported in catchment. Landslide or rockfall possible within 3 to 6 hours. Speeds reduced by 20%.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    🟠
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">RESTRICTED (Risk 65% – 85%)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-300 font-medium">Single-Lane Escort</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Severe slope movement or culvert damage. Heavy multi-axle freight halted; emergency relief convoys permitted with BRO/police escort only.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    🔴
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">BLOCKED (Risk &gt; 85% or Confirmed Debris)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 font-medium">Impassable</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Confirmed physical blockage (landslide debris, bridge washout, or deep flooding). Corridor receives infinite routing penalty; traffic automatically diverted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xai' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs">
                <strong className="text-slate-900 block mb-0.5">Explainable AI (XAI) Attribution:</strong>
                Rather than acting as an unexplainable &quot;black box&quot;, the AI explains <em>why</em> a mountain pass is vulnerable using point-based feature attribution:
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Sample Attribution Breakdown: NH-310A (North Sikkim Lifeline)</span>
                  <span className="font-mono text-rose-600 font-bold">Total Risk: 91% (CRITICAL)</span>
                </h4>
                
                <div className="space-y-2.5 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">🌧️ 24h Rainfall Saturation (142 mm downpour)</span>
                      <span className="font-mono font-bold text-blue-600">+29%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '29%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">⛰️ Steep Slope Gradient (32° unstable angle)</span>
                      <span className="font-mono font-bold text-purple-600">+21%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '21%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">⚠️ Historical Landslide Recurrence (Mile-14 corridor)</span>
                      <span className="font-mono font-bold text-amber-600">+17%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">📸 Field Officer Verified Landslide Uplink</span>
                      <span className="font-mono font-bold text-rose-600">+24%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-slate-600">
                Experience the 4-step emergency drill sequence presented to the Smart India Hackathon jury:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
                  <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Step 1 — Baseline Transit Departure</h5>
                    <p className="text-[11px] text-slate-600">Convoy V-102 departs Gangtok carrying insulin and trauma kits (Priority 100) destined for Mangan Forward Base via NH-310A.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
                  <span className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Step 2 — Torrential Monsoon Trigger</h5>
                    <p className="text-[11px] text-slate-600">Precipitation spikes to 142 mm in Mangan catchment. Road status transitions to WATCH; AI anticipates delay of +48 mins.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
                  <span className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Step 3 — Landslide at Mile-14 Confirmed</h5>
                    <p className="text-[11px] text-slate-600">Field officer confirms physical debris blockage. Road marked BLOCKED. Critical Alert triggers emergency rerouting.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
                  <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Step 4 — Automated Bypass Detour via Route B</h5>
                    <p className="text-[11px] text-slate-600">Engine selects Dikchu Western Bypass (Route B: +18 km, Risk 24%). Convoy V-102 safely diverted, ensuring cold-chain survival.</p>
                  </div>
                </div>
              </div>

              {onStartScenario && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onStartScenario();
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Launch Interactive Sikkim Landslide Simulation Drill</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Decision-Support System for all 8 NER States</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
