import React, { useState, useEffect } from 'react';
import { 
  X, 
  CloudRain, 
  AlertOctagon, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Truck,
  Layers,
  AlertTriangle,
  Navigation,
  Compass,
  Zap
} from 'lucide-react';
import { triggerScenarioStep, resetScenario } from '../../services/api';
import { SCENARIO_CONVOYS, DEFAULT_CONVOY_ID, ScenarioConvoy } from '../../data/scenarioConfigs';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStep: number;
  activeStage?: number;
  initialConvoyId?: string;
  onScenarioUpdated: (stepData: any) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  activeStep,
  activeStage,
  initialConvoyId = DEFAULT_CONVOY_ID,
  onScenarioUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedConvoyId, setSelectedConvoyId] = useState<string>(initialConvoyId);
  const [currentStage, setCurrentStage] = useState(
    activeStage || (activeStep === 1 ? 1 : activeStep === 2 ? 2 : activeStep === 3 ? 4 : 6)
  );

  useEffect(() => {
    if (activeStage) {
      setCurrentStage(activeStage);
    }
  }, [activeStage]);

  useEffect(() => {
    if (initialConvoyId && SCENARIO_CONVOYS[initialConvoyId]) {
      setSelectedConvoyId(initialConvoyId);
    }
  }, [initialConvoyId]);

  if (!isOpen) return null;

  const currentConvoy: ScenarioConvoy = SCENARIO_CONVOYS[selectedConvoyId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];

  const SIX_STEPS = [
    {
      stage: 1,
      backendStep: 1,
      title: 'Normal Road',
      subtitle: 'Baseline Transit',
      desc: `${currentConvoy.primaryRoad} is clear and accessible. ${currentConvoy.name} departs from ${currentConvoy.origin} towards ${currentConvoy.destination} carrying ${currentConvoy.cargo}.`,
      risk: '32%',
      roadStatus: '🟢 ACCESSIBLE',
      weather: '42 mm / 24h',
      action: `Surveillance normal. Driver ${currentConvoy.driver} proceeding safely.`,
      icon: Truck
    },
    {
      stage: 2,
      backendStep: 2,
      title: 'Heavy Rainfall',
      subtitle: 'Extreme Downpour',
      desc: `Severe monsoon downpour escalates to ${currentConvoy.rainfall} over ${currentConvoy.sector}. Ground saturation index reaches 88%.`,
      risk: '54%',
      roadStatus: '🟡 WATCH',
      weather: currentConvoy.rainfall,
      action: 'Automatic Weather Station (AWS) triggers early alert. Caution advisory dispatched.',
      icon: CloudRain
    },
    {
      stage: 3,
      backendStep: 2,
      title: 'Disruption Risk Increases',
      subtitle: 'Hazard Escalation',
      desc: `Soil saturation combined with ${currentConvoy.slope} elevates hazard probability to 68%. Warning of impending ${currentConvoy.disasterType}.`,
      risk: '68%',
      roadStatus: '🟠 HIGH RISK',
      weather: currentConvoy.rainfall,
      action: `AI Risk Engine flags ${currentConvoy.blockedRoad} as vulnerable. High standby alert issued.`,
      icon: AlertTriangle
    },
    {
      stage: 4,
      backendStep: 3,
      title: 'Corridor Blocked',
      subtitle: 'Incident Occurs',
      desc: `${currentConvoy.disasterType} occurs. ${currentConvoy.blockedRoad} completely impassable. Convoy stranded, critical cargo at risk.`,
      risk: '91%',
      roadStatus: '🔴 BLOCKED',
      weather: currentConvoy.rainfall,
      action: 'Road colored RED on GIS map. Critical alert fires. Routing engine triggered.',
      icon: AlertOctagon
    },
    {
      stage: 5,
      backendStep: 3,
      title: 'AI Calculates Detour',
      subtitle: 'Bypass Optimization',
      desc: `Multi-criteria router evaluates alternatives and selects ${currentConvoy.bypassRoad}: ${currentConvoy.bypassOverhead}, ${currentConvoy.safetyScore} safety score.`,
      risk: '24%',
      roadStatus: '🟣 AI DETOUR READY',
      weather: 'Passable Corridor',
      action: `AI paints detour corridor in purple on commander's map. Divert clearance transmitted.`,
      icon: Navigation
    },
    {
      stage: 6,
      backendStep: 4,
      title: 'Convoy Rerouted Safe',
      subtitle: 'Secure Delivery',
      desc: `${currentConvoy.name} executes automated diversion via ${currentConvoy.bypassRoad}. Supplies reach destination safely avoiding the hazard zone.`,
      risk: '24%',
      roadStatus: `🟢 ON ${currentConvoy.bypassRoad.split('(')[0]}`,
      weather: 'Secured Corridor',
      action: `Crisis resolved. Convoy ${currentConvoy.id} successfully averted total loss.`,
      icon: ShieldCheck
    }
  ];

  const handleStageSelect = async (stageNum: number, convoyId: string = selectedConvoyId) => {
    setLoading(true);
    setCurrentStage(stageNum);
    const target = SIX_STEPS.find((s) => s.stage === stageNum) || SIX_STEPS[0];

    try {
      const data = await triggerScenarioStep(target.backendStep, convoyId);
      onScenarioUpdated({ ...data, vehicle_id: convoyId, stage: stageNum });
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvoyChange = (convoyId: string) => {
    setSelectedConvoyId(convoyId);
    handleStageSelect(currentStage, convoyId);
  };

  const handleNextStage = () => {
    if (currentStage < 6) {
      handleStageSelect(currentStage + 1);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setCurrentStage(1);
    try {
      const data = await resetScenario();
      onScenarioUpdated({ ...data, vehicle_id: selectedConvoyId, stage: 1 });
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentInfo = SIX_STEPS[currentStage - 1];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Disaster Simulation & Detour Drill
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                  Interactive Contingency Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select any convoy, choose any phase directly, and inspect real-time AI rerouting and map updates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Convoy & Route Scenario Selector */}
        <div className="bg-slate-50/50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700 font-mono text-[11px] uppercase">
              Select Target Convoy & Corridor:
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.values(SCENARIO_CONVOYS).map((c) => (
              <button
                key={c.id}
                onClick={() => handleConvoyChange(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedConvoyId === c.id
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{c.id}</span>
                <span className="text-[10px] opacity-90 font-medium">({c.state})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Convoy Specs Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">{currentConvoy.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {currentConvoy.origin} → {currentConvoy.destination}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Cargo: <strong className="text-slate-800">{currentConvoy.cargo}</strong> • Driver: {currentConvoy.driver}
              </span>
            </div>
            <div className="text-right text-[11px] font-mono">
              <span className="text-rose-700 font-semibold block">Disruption: {currentConvoy.disasterType}</span>
              <span className="text-blue-700 font-bold">Bypass: {currentConvoy.bypassRoad.split('(')[0]} ({currentConvoy.bypassOverhead})</span>
            </div>
          </div>

          {/* Interactive Stepper (Any step is 1-click selectable!) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] uppercase font-mono font-bold text-amber-800">
                  1-Click Direct Jump — Click Any Phase Below:
                </span>
              </div>
              <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Phase {currentStage} / 6 Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SIX_STEPS.map((s) => {
                const Icon = s.icon;
                const isCurrent = currentStage === s.stage;
                const isPassed = currentStage > s.stage;
                return (
                  <button
                    key={s.stage}
                    onClick={() => handleStageSelect(s.stage)}
                    disabled={loading}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative group shadow-xs ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500 scale-[1.02]'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/50 text-slate-700 hover:border-emerald-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Phase {s.stage}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-700' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">{s.title}</h4>
                    <span className="text-[9px] text-slate-500 block truncate">{s.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Phase Detailed Showcase */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
                  PHASE {currentStage} OF 6: {currentInfo.subtitle.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{currentInfo.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                  {currentInfo.desc}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
                <div className="text-center px-2 border-r border-slate-200">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Route Risk</span>
                  <span className={`text-xl font-black font-mono ${
                    parseInt(currentInfo.risk) > 70
                      ? 'text-rose-600'
                      : parseInt(currentInfo.risk) > 40
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}>
                    {currentInfo.risk}
                  </span>
                </div>
                <div className="text-center px-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weather</span>
                  <span className="text-xs font-bold font-mono text-slate-800 block mt-1">
                    {currentInfo.weather}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">Primary Road</span>
                <span className="font-bold text-slate-900 text-[11px] block mt-0.5">
                  {currentInfo.roadStatus}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">Convoy {currentConvoy.id}</span>
                <span className="font-bold text-slate-900 text-[11px] block mt-0.5 truncate">
                  {currentStage >= 6 ? 'Diverted & Safe' : currentStage >= 4 ? 'Halted at Safe Post' : 'En Route Normal'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">Cargo Security</span>
                <span className="font-bold text-emerald-700 text-[11px] block mt-0.5">
                  🛡️ Protected via Bypass
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">AI Recommended Detour</span>
                <span className="font-bold text-blue-700 text-[11px] block mt-0.5 truncate">
                  🟣 {currentConvoy.bypassRoad.split('(')[0]}
                </span>
              </div>
            </div>

            {/* Operational System Action */}
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-950 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-blue-950">Command Decision: </strong>
                <span>{currentInfo.action}</span>
              </div>
            </div>

            {/* Final State Badges */}
            {currentStage === 6 && (
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Contingency Drill Successfully Completed
                    </h5>
                    <p className="text-[11px] text-slate-600">
                      Convoy {currentConvoy.id} safely diverted. Life-saving {currentConvoy.cargo.split('(')[0]} delivered without incident.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold">
                  <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 border border-rose-300">
                    🔴 {currentConvoy.primaryRoad.split('(')[0]} BLOCKED
                  </span>
                  <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 border border-purple-300">
                    🟣 AI DETOUR ACTIVE
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🚛 CONVOY {currentConvoy.id} REROUTED
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Drill</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStage < 6 ? (
              <button
                onClick={handleNextStage}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>Proceed to Phase {currentStage + 1}: {SIX_STEPS[currentStage].title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close & Inspect Live Map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
