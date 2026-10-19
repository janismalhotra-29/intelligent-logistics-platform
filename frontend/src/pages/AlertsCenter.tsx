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
    <div className="space-y-3.5 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Actionable Command Alerts & Decision Directives</h2>
          </div>
          <p className="text-xs text-slate-500">
            Rule + ML synthesized operational alerts prioritized by logistical impact across all 8 NER states.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold">
            {alerts.filter((a) => a.alert_level === 'CRITICAL').length} Critical
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold">
            {alerts.filter((a) => a.alert_level === 'WARNING').length} Warning
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold">
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
              className={`p-4 rounded-xl border bg-white shadow-xs transition-all ${
                isCrit
                  ? 'border-l-4 border-l-rose-600 border-slate-200'
                  : isWarn
                  ? 'border-l-4 border-l-amber-500 border-slate-200'
                  : 'border-l-4 border-l-blue-500 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isCrit ? 'bg-rose-100 text-rose-800' : isWarn ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.alert_level}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      {a.state} • Route: {a.route_name}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">{a.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    <span className="font-semibold text-slate-700">Root Cause:</span> {a.reason}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Disruption Window:</span>{' '}
                    <span className="font-mono font-bold text-rose-600">{a.prediction}</span>
                  </p>
                </div>

                {/* Impact Metrics */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Affected Convoys</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{a.affected_vehicles}</span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Critical Supplies</span>
                    <span className="text-lg font-bold font-mono text-rose-600">{a.critical_shipments}</span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Risk Index</span>
                    <span className="text-lg font-bold font-mono text-amber-600">{a.risk_score}%</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs flex items-center gap-2">
                  <span className="font-mono font-bold uppercase text-blue-700 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                    Recommended Action:
                  </span>
                  <span className="text-slate-800 font-medium">{a.recommended_action}</span>
                </div>

                <div className="flex items-center gap-2">
                  {a.alternative_route_name && (
                    <button
                      onClick={() => onNavigateToTab && onNavigateToTab('route_planner')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
                    >
                      <CornerUpRight className="w-3.5 h-3.5" />
                      <span>Inspect {a.alternative_route_name.split('(')[0]}</span>
                    </button>
                  )}
                  {onOpenScenario && (
                    <button
                      onClick={onOpenScenario}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
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
