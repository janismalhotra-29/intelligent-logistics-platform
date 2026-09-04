import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Navigation, 
  Truck, 
  Smartphone,
  Sparkles,
  ArrowRight,
  HelpCircle,
  MapPin
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
  if (!isOpen) return null;

  const STEPS = [
    {
      num: '1',
      title: 'Check If Your Road is Open or Blocked',
      desc: 'Type any town, state, or highway (e.g. "NH-10", "Gangtok") in the top search bar, or look at the map. Green means completely safe, Yellow means weather caution, and Red means impassable landslide.',
      icon: MapPin,
      badge: 'Live Road Status',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      num: '2',
      title: 'AI Predicts Mountain Hazards Before They Happen',
      desc: 'The platform monitors rainfall saturation, slope angles, and historical rockfalls to warn you hours ahead before a mountain pass collapses, giving convoys time to stop safely.',
      icon: ShieldAlert,
      badge: 'Predictive Safety',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      num: '3',
      title: 'Find the Safest Detour with 1 Click',
      desc: 'If a landslide occurs, the AI Route Planner instantly suggests safe bypass roads (like the Dikchu Western Bypass) so relief supplies and medicine always reach isolated communities.',
      icon: Navigation,
      badge: 'Smart Detours',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-command-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-command-950 to-command-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>How This Platform Works</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  Quick Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Helping everyday travelers, truck drivers, and relief teams stay safe in the North East.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-command-800 hover:bg-command-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Steps */}
        <div className="p-6 space-y-4">
          <div className="grid gap-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className={`p-4 rounded-xl border bg-gradient-to-r ${s.color} transition-all`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-command-950/80 border border-slate-700 flex items-center justify-center shrink-0 font-mono font-black text-sm text-white">
                      {s.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{s.title}</h4>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-command-950/60 text-slate-300 border border-slate-700 shrink-0">
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick FAQ / Helper note */}
          <div className="p-3.5 rounded-xl bg-command-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Want to see what happens when a landslide hits? Try the simulated scenario.
              </span>
            </div>
            {onStartScenario && (
              <button
                onClick={() => {
                  onClose();
                  onStartScenario();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Try Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-command-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Covers all 8 states: Sikkim, Assam, Arunachal, Meghalaya, Nagaland, Manipur, Mizoram, Tripura.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Got it, let's explore
          </button>
        </div>
      </div>
    </div>
  );
};
