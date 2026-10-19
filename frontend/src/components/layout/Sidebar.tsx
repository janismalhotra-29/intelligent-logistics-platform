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
  PlayCircle,
  Activity,
  Layers,
  ChevronRight
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
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  alertsCount,
  isCollapsed = false
}) => {
  const t = translations[lang];

  const NAV_SECTIONS = [
    {
      title: 'INTELLIGENCE & MAPS',
      items: [
        { id: 'command_center', label: t.nav_command_center, icon: LayoutDashboard, badge: 'Live GIS', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 'simulation_drill', label: t.nav_simulation_drill, icon: PlayCircle, badge: 'Sikkim 4-Step', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { id: 'road_intelligence', label: t.nav_road_intelligence, icon: Map, badge: 'Topography', badgeColor: null },
        { id: 'route_planner', label: t.nav_route_planner, icon: Navigation, badge: 'AI Detours', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' }
      ]
    },
    {
      title: 'OPERATIONS & FLEET',
      items: [
        { id: 'vehicle_tracking', label: t.nav_vehicle_tracking, icon: Truck, badge: '6 Convoys', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
        { id: 'shipment_management', label: t.nav_shipment_management, icon: Package, badge: 'Medicine', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' }
      ]
    },
    {
      title: 'INCIDENTS & HAZARDS',
      items: [
        { id: 'alerts', label: t.nav_alerts, icon: BellRing, badge: alertsCount > 0 ? `${alertsCount} New` : null, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
        { id: 'incident_center', label: t.nav_incident_center, icon: AlertTriangle, badge: null, badgeColor: null },
        { id: 'field_app', label: t.nav_report_hazard, icon: Smartphone, badge: 'Offline', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' }
      ]
    },
    {
      title: 'REPORTS & INSIGHTS',
      items: [
        { id: 'analytics', label: t.nav_analytics, icon: BarChart3, badge: 'Metrics', badgeColor: null }
      ]
    }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-50px)] sticky top-[50px] shadow-xs z-40 transition-all duration-200`}>
      <div className="p-2.5 space-y-3.5 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => setActiveTab(item.id as NavTab)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'} rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/90 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 border ${
                          item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Pill at Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 m-2 rounded-xl border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>NETWORK ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono text-blue-600 font-bold">8 States</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Real-time weather telemetry & AI risk engine monitoring mountain arteries.
          </p>
        </div>
      )}
    </aside>
  );
};
