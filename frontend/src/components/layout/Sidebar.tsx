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
  PlayCircle,
  Activity
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

  const NAV_GROUPS = [
    {
      name: 'Overview',
      items: [
        { id: 'command_center' as NavTab, label: t.nav_command_center, icon: LayoutDashboard },
        { id: 'simulation_drill' as NavTab, label: t.nav_simulation_drill, icon: PlayCircle },
        { id: 'road_intelligence' as NavTab, label: t.nav_road_intelligence, icon: Map }
      ]
    },
    {
      name: 'Operations',
      items: [
        { id: 'route_planner' as NavTab, label: t.nav_route_planner, icon: Navigation },
        { id: 'vehicle_tracking' as NavTab, label: t.nav_vehicle_tracking, icon: Truck },
        { id: 'shipment_management' as NavTab, label: t.nav_shipment_management, icon: Package }
      ]
    },
    {
      name: 'Incidents',
      items: [
        { id: 'incident_center' as NavTab, label: t.nav_incident_center, icon: AlertTriangle },
        { id: 'alerts' as NavTab, label: t.nav_alerts, icon: BellRing, badgeCount: alertsCount },
        { id: 'field_app' as NavTab, label: t.nav_report_hazard, icon: Smartphone }
      ]
    },
    {
      name: 'Analytics',
      items: [
        { id: 'analytics' as NavTab, label: t.nav_analytics, icon: BarChart3 }
      ]
    }
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-16' : 'w-[250px]'
      } bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] sticky top-[53px] z-40 transition-all duration-200 select-none shadow-xs`}
    >
      {/* Navigation Groups */}
      <div className="p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.name} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.name}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } rounded-lg text-xs transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive 
                            ? 'text-emerald-700' 
                            : 'text-slate-500 group-hover:text-slate-800'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-left whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] uppercase tracking-wide">Live Monitoring</span>
          </div>
          <p className="text-[10px] text-slate-500">8 NER states arterial surveillance online</p>
        </div>
      ) : (
        <div className="p-3 flex justify-center border-t border-slate-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
        </div>
      )}
    </aside>
  );
};
