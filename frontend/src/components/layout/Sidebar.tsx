import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Navigation, 
  Truck, 
  Package, 
  AlertTriangle, 
  BellRing, 
  BarChart3, 
  Smartphone,
  ShieldCheck,
  Info,
  PlayCircle
} from 'lucide-react';
import { translations, Language } from '../../i18n/translations';

export type NavTab = 
  | 'command_center'
  | 'simulation_drill'
  | 'road_intelligence'
  | 'route_planner'
  | 'vehicle_tracking'
  | 'shipment_management'
  | 'incident_center'
  | 'alerts'
  | 'analytics'
  | 'field_app';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  lang: Language;
  alertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  alertsCount
}) => {
  const t = translations[lang];

  const NAV_SECTIONS = [
    {
      title: t.section_overview,
      items: [
        { id: 'command_center', label: t.nav_command_center, icon: LayoutDashboard, badge: null },
        { id: 'simulation_drill', label: t.nav_simulation_drill, icon: PlayCircle, badge: t.badge_phases, badgeColor: 'bg-purple-600' },
        { id: 'road_intelligence', label: t.nav_road_intelligence, icon: Map, badge: null },
        { id: 'route_planner', label: t.nav_route_planner, icon: Navigation, badge: t.badge_ai_safe, badgeColor: 'bg-purple-600' }
      ]
    },
    {
      title: t.section_operations,
      items: [
        { id: 'vehicle_tracking', label: t.nav_vehicle_tracking, icon: Truck, badge: t.badge_live, badgeColor: 'bg-sky-600' },
        { id: 'shipment_management', label: t.nav_shipment_management, icon: Package, badge: null },
        { id: 'vehicle_tracking', label: t.nav_relief_operations, icon: ShieldCheck, badge: t.badge_convoys, badgeColor: 'bg-emerald-600' }
      ]
    },
    {
      title: t.section_incidents,
      items: [
        { id: 'alerts', label: t.nav_alerts, icon: BellRing, badge: alertsCount > 0 ? `${alertsCount}` : null, badgeColor: 'bg-rose-500' },
        { id: 'incident_center', label: t.nav_incident_center, icon: AlertTriangle, badge: null },
        { id: 'field_app', label: t.nav_report_hazard, icon: Smartphone, badge: t.badge_offline, badgeColor: 'bg-amber-600' }
      ]
    },
    {
      title: t.section_analytics,
      items: [
        { id: 'analytics', label: t.nav_analytics, icon: BarChart3, badge: null }
      ]
    }
  ];

  return (
    <aside className="w-56 bg-command-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-[calc(100vh-50px)] sticky top-[50px] shadow-2xl backdrop-blur-md">
      <div className="p-2.5 space-y-3.5 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <div className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold">
              {section.title}
            </div>
            {section.items.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && (item.label !== 'Relief Operations' || activeTab === 'vehicle_tracking');
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950/40'
                      : 'text-slate-300 hover:bg-command-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate text-[11px] font-semibold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                        item.badgeColor
                          ? `${item.badgeColor} text-white`
                          : 'bg-command-800 text-cyan-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Compact Quick Operational Status */}
      <div className="p-2.5 border-t border-slate-800/80 bg-cyan-950/20 m-2 rounded-xl border border-cyan-900/30">
        <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SYSTEM OPERATIONAL</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          NH-310A monitoring active. AI detour calculations live.
        </p>
      </div>
    </aside>
  );
};

