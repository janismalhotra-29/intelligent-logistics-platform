import React, { useState } from 'react';
import { UserRole } from '../../types';
import { translations, Language } from '../../i18n/translations';
import { 
  Shield, 
  Truck, 
  Smartphone, 
  PlayCircle, 
  Globe2, 
  Activity, 
  Radio, 
  MapPin,
  HelpCircle,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle
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
  onNavigateToSimulation
}) => {
  const t = translations[currentLang];
  const activeScenario = SCENARIO_CONVOYS[scenarioVehicleId] || SCENARIO_CONVOYS[DEFAULT_CONVOY_ID];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchRoad && searchValue.trim()) {
      onSearchRoad(searchValue);
    }
  };

  return (
    <header className="bg-command-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 px-4 py-2 flex items-center justify-between gap-3 shadow-xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 shadow-md shadow-cyan-900/30 border border-cyan-400/40">
          <Activity className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-white uppercase font-sans">
              {t.app_title}
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.live_badge}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
            {t.tagline}
          </p>
        </div>
      </div>

      {/* Center / Right Functional Controls */}
      <div className="flex items-center gap-2.5">
        {/* State Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-command-900 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {NER_STATES.map((st) => (
              <option key={st} value={st} className="bg-command-900 text-slate-100">
                {st === 'All' ? t.states_all : st}
              </option>
            ))}
          </select>
        </div>

        {/* Live Simulation Drill Controller */}
        <button
          onClick={onNavigateToSimulation || onOpenScenarioModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-purple-500/50 hover:border-purple-400 transition-all text-xs font-semibold text-purple-200 hover:text-white cursor-pointer shadow-sm"
          title={`Open simulation drill on ${activeScenario.id} (${activeScenario.state})`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden sm:inline">{t.drill_label}: {activeScenario.id} ({activeScenario.state})</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/30 text-purple-200 font-bold border border-purple-500/40">
            {t.phase_label} {scenarioPhase}/6
          </span>
        </button>

        {/* User Guide Button */}
        {onOpenHelpGuide && (
          <button
            onClick={onOpenHelpGuide}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-command-900 hover:bg-command-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Open 3-step beginner guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.guide_button}</span>
          </button>
        )}

        {/* Active Critical Alerts Notification Badge */}
        <div 
          onClick={onOpenScenarioModal}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold cursor-pointer hover:bg-rose-900/40 transition-colors"
          title={`${criticalAlertsCount} critical disruption alert active`}
        >
          <Bell className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          <span>{criticalAlertsCount} {t.alert_badge}</span>
        </div>

        {/* Unambiguous Segmented Language Selector */}
        <div className="flex items-center bg-command-900 rounded-lg border border-slate-700/80 p-0.5 text-xs font-semibold">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400 mx-1.5 shrink-0" />
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch interface to English"
          >
            EN
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLang === 'hi'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="हिन्दी में इंटरफ़ेस बदलें"
          >
            हिन्दी
          </button>
        </div>

        {/* Compact Role Switcher */}
        <div className="hidden lg:flex bg-command-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setRole('COMMAND_CENTER')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
              currentRole === 'COMMAND_CENTER'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.role_command}
          </button>
          <button
            onClick={() => setRole('LOGISTICS_OPERATOR')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
              currentRole === 'LOGISTICS_OPERATOR'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.role_logistics}
          </button>
          <button
            onClick={() => setRole('FIELD_OFFICER')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
              currentRole === 'FIELD_OFFICER'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.role_field}
          </button>
        </div>
      </div>
    </header>
  );
};
