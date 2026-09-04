import React from 'react';
import { AlertItem } from '../types';
import { 
  BellRing, 
  ShieldAlert, 
  AlertTriangle, 
  CornerUpRight, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Truck,
  Layers
} from 'lucide-react';

interface AlertsCenterProps {
  alerts: AlertItem[];
  onOpenScenario?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  alerts,
  onOpenScenario,
  onNavigateToTab
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-command-900/80 p-4 rounded-xl border border-command-border">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-bold text-white">Actionable Command Alerts & Decision Directives</h2>
          </div>
          <p className="text-xs text-slate-400">
            Rule + ML synthesized operational alerts prioritized by logistical impact.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            {alerts.filter((a) => a.alert_level === 'CRITICAL').length} Critical
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            {alerts.filter((a) => a.alert_level === 'WARNING').length} Warning
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold">
            {alerts.filter((a) => a.alert_level === 'WATCH').length} Watch
          </span>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {alerts.map((a) => {
          const isCrit = a.alert_level === 'CRITICAL';
          const isWarn = a.alert_level === 'WARNING';

          return (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCrit
                  ? 'border-rose-500/50 bg-rose-950/20 shadow-xl shadow-rose-950/30'
                  : isWarn
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-yellow-500/40 bg-yellow-950/10'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{a.icon}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                        isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-yellow-500'
                      }`}
                    >
                      {a.alert_level}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {a.state} • Route: {a.route_name}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{a.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    <span className="font-semibold text-slate-200">Root Cause:</span> {a.reason}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-200">Disruption Window:</span>{' '}
                    <span className="font-mono font-bold text-rose-400">{a.prediction}</span>
                  </p>
                </div>

                {/* Impact Metrics */}
                <div className="flex items-center gap-3 bg-command-950/80 p-3 rounded-xl border border-slate-800 shrink-0 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Affected Convoys</span>
                    <span className="text-xl font-bold font-mono text-white">{a.affected_vehicles}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Critical Supplies</span>
                    <span className="text-xl font-bold font-mono text-rose-400">{a.critical_shipments}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Risk Index</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{a.risk_score}%</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs flex items-center gap-2">
                  <span className="font-mono font-bold uppercase text-cyan-400 text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    Recommended Action:
                  </span>
                  <span className="text-white font-medium">{a.recommended_action}</span>
                </div>

                <div className="flex items-center gap-2">
                  {a.alternative_route_name && (
                    <button
                      onClick={() => onNavigateToTab && onNavigateToTab('route_planner')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-800 hover:bg-command-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
                    >
                      <CornerUpRight className="w-3.5 h-3.5" />
                      <span>Inspect {a.alternative_route_name.split('(')[0]}</span>
                    </button>
                  )}
                  {onOpenScenario && (
                    <button
                      onClick={onOpenScenario}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-950 transition-colors cursor-pointer"
                    >
                      <span>Simulate Incident Reroute</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
