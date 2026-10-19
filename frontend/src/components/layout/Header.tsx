import React, { useState, useRef, useEffect } from 'react';
import { UserRole, AlertItem } from '../../types';
import { translations, Language } from '../../i18n/translations';
import { 
  ShieldCheck, 
  MapPin, 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  User, 
  X, 
  ExternalLink 
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentLang: Language;
  setLang: (lang: Language) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  onOpenScenarioModal?: () => void;
  scenarioStep?: number;
  scenarioPhase?: number;
  scenarioVehicleId?: string;
  onOpenHelpGuide?: () => void;
  criticalAlertsCount?: number;
  onSearchRoad?: (query: string) => void;
  onNavigateToSimulation?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeTabTitle?: string;
  alerts?: AlertItem[];
}

const NER_STATES = [
  'All',
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  currentLang,
  setLang,
  selectedState,
  setSelectedState,
  onOpenScenarioModal,
  criticalAlertsCount = 0,
  onSearchRoad,
  isSidebarCollapsed = false,
  onToggleSidebar,
  activeTabTitle = 'Command Center',
  alerts = []
}) => {
  const t = translations[currentLang];
  const isHi = currentLang === 'hi';

  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchRoad && searchValue.trim()) {
      onSearchRoad(searchValue.trim());
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'COMMAND_CENTER': return isHi ? 'कमांड सेंटर' : 'Command Center';
      case 'LOGISTICS_OPERATOR': return isHi ? 'लॉजिस्टिक्स' : 'Logistics Operator';
      case 'FIELD_OFFICER': return isHi ? 'फील्ड ऑफिसर' : 'Field Officer';
      default: return r;
    }
  };

  const activeAlerts = alerts.filter(a => a.alert_level === 'CRITICAL' || a.alert_level === 'WARNING');
  const alertBadgeCount = criticalAlertsCount || activeAlerts.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-2.5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
        {/* Left: Sidebar Toggle, Brand & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 font-sans">
              NER SafeRoute
            </span>
          </div>

          {/* Breadcrumb Page Title */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-slate-200">
            <span>Platform</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">{activeTabTitle}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isHi ? 'राजमार्ग, जिला या अलर्ट खोजें...' : 'Search highway, route, or incident...'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right: State Selector, Notifications, Language & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* State Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              {NER_STATES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? (isHi ? 'सभी 8 राज्य' : 'All 8 States') : st}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
              title="Notifications"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {alertBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                  {alertBadgeCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Operational Alerts</span>
                  <span className="text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                    {alertBadgeCount} Active
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onOpenScenarioModal) onOpenScenarioModal();
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between font-medium text-slate-800 mb-0.5">
                          <span className="truncate">{a.title}</span>
                          <span className={`text-[9px] px-1 rounded font-semibold ${
                            a.alert_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {a.alert_level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{a.reason}</p>
                        <span className="text-[10px] text-emerald-700 font-medium block mt-1">{a.route_name} • {a.state}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No active alerts reported.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs bg-slate-50 shadow-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 font-medium transition-colors ${
                !isHi ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 font-medium transition-colors ${
                isHi ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* User Role Profile Switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-3 h-3" />
              </div>
              <span className="font-medium text-slate-700 hidden lg:inline">
                {getRoleLabel(currentRole)}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-slate-400">
                  Switch Active Role
                </div>
                {(['COMMAND_CENTER', 'LOGISTICS_OPERATOR', 'FIELD_OFFICER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      currentRole === r
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{getRoleLabel(r)}</span>
                    {currentRole === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
