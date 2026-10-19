import React, { useState, useRef, useEffect } from 'react';
import { UserRole, AlertItem } from '../../types';
import { translations, Language } from '../../i18n/translations';
import { 
  Shield, 
  Truck, 
  Smartphone, 
  PlayCircle, 
  Globe2, 
  Activity, 
  MapPin,
  HelpCircle,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
  User,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SCENARIO_CONVOYS, DEFAULT_CONVOY_ID } from '../../data/scenarioConfigs';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentLang: Language;
  setLang: (lang: Language) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  onOpenScenarioModal: () => void;
  scenarioStep: number;
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
  scenarioStep,
  scenarioPhase = 1,
  scenarioVehicleId = DEFAULT_CONVOY_ID,
  onOpenHelpGuide,
  criticalAlertsCount = 1,
  onSearchRoad,
  onNavigateToSimulation,
  isSidebarCollapsed = false,
  onToggleSidebar,
  activeTabTitle = 'Command Center',
  alerts = []
}) => {
  const t = translations[currentLang];
  const isHi = currentLang === 'hi';
  const activeScenario = SCENARIO_CONVOYS[scenarioVehicleId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];

  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
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
      case 'COMMAND_CENTER': return isHi ? 'कमांड सेंटर' : 'Disaster Command';
      case 'LOGISTICS_OPERATOR': return isHi ? 'रसद संचालक' : 'Logistics Operator';
      case 'FIELD_OFFICER': return isHi ? 'फील्ड अधिकारी' : 'Field Officer';
      default: return r;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-3.5 py-2 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle, Brand Logo & Breadcrumb */}
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

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-navy-900 font-sans">
                  NER SafeRoute
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.live_badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Breadcrumb page title */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-200">
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
              placeholder={isHi ? 'राजमार्ग, जिला या अलर्ट खोजें (उदा. NH-10, Mangan)...' : 'Search highway, district, or incident (e.g. NH-10, Mangan)...'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right: State Filter, Drill CTA, Guide, Notifications & User Role */}
        <div className="flex items-center gap-2">
          {/* State Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {NER_STATES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? t.states_all : st}
                </option>
              ))}
            </select>
          </div>

          {/* Drill Controller Button */}
          <button
            onClick={onNavigateToSimulation || onOpenScenarioModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition-colors shadow-xs"
            title={`Simulate disaster & detour drill on ${activeScenario.id} (${activeScenario.state})`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold">Landslide Drill:</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-200/80 text-indigo-900 font-bold">
              Step {scenarioStep || scenarioPhase}/4
            </span>
          </button>

          {/* How It Works Guide Button */}
          {onOpenHelpGuide && (
            <button
              onClick={onOpenHelpGuide}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              title="Open platform guide and architecture documentation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* Notification Centre Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 transition-colors shadow-xs"
              title="Notifications & Active Alerts"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {criticalAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-mono font-bold text-white shadow-xs animate-pulse">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Command Alerts & Directives</span>
                  </span>
                  <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                    {criticalAlertsCount} Active
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
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                          <span className="truncate">{a.title}</span>
                          <span className={`text-[9px] font-mono px-1 rounded ${
                            a.alert_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {a.alert_level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{a.reason}</p>
                        <span className="text-[10px] font-mono text-blue-600 block mt-1">{a.route_name} • {a.state}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No active alerts reported.
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      if (onOpenScenarioModal) onOpenScenarioModal();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>View all operational alerts in drill</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Segmented Language Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="English interface"
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="हिन्दी इंटरफ़ेस"
            >
              हिन्दी
            </button>
          </div>

          {/* User Profile & Role Dropdown */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors shadow-xs cursor-pointer"
              title="User role & profile switcher"
            >
              <div className="w-6 h-6 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-[10px]">
                {currentRole === 'COMMAND_CENTER' ? 'CC' : currentRole === 'LOGISTICS_OPERATOR' ? 'LO' : 'FO'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-bold text-slate-800 block text-[11px] leading-tight">
                  {getRoleLabel(currentRole)}
                </span>
                <span className="text-[9px] text-slate-500 font-mono leading-none">
                  NER Authority
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Switch Active Persona
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRole('COMMAND_CENTER');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentRole === 'COMMAND_CENTER' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{t.role_command}</span>
                    <span className="text-[10px] text-slate-400">Government / NDMA</span>
                  </div>
                  {currentRole === 'COMMAND_CENTER' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setRole('LOGISTICS_OPERATOR');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentRole === 'LOGISTICS_OPERATOR' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{t.role_logistics}</span>
                    <span className="text-[10px] text-slate-400">Fleet & Convoy Depot</span>
                  </div>
                  {currentRole === 'LOGISTICS_OPERATOR' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setRole('FIELD_OFFICER');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentRole === 'FIELD_OFFICER' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{t.role_field}</span>
                    <span className="text-[10px] text-slate-400">Ground Scout / Police</span>
                  </div>
                  {currentRole === 'FIELD_OFFICER' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
