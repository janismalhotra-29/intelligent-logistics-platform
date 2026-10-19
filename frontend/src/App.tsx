import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ScenarioModal } from './components/scenario/ScenarioModal';
import { HelpGuideModal } from './components/help/HelpGuideModal';
import { CommandCenter } from './pages/CommandCenter';
import { SimulationDrill } from './pages/SimulationDrill';
import { RoadIntelligence } from './pages/RoadIntelligence';
import { RoutePlanner } from './pages/RoutePlanner';
import { VehicleTracking } from './pages/VehicleTracking';
import { ShipmentManagement } from './pages/ShipmentManagement';
import { IncidentCenter } from './pages/IncidentCenter';
import { AlertsCenter } from './pages/AlertsCenter';
import { Analytics } from './pages/Analytics';
import { FieldOfficerApp } from './pages/FieldOfficerApp';

import { 
  fetchDashboardSummary, 
  fetchRoads, 
  fetchVehicles, 
  fetchShipments, 
  fetchWeather, 
  fetchIncidents, 
  fetchAlerts, 
  fetchHubs,
  simulateVehicleTick
} from './services/api';
import { UserRole, Road, Vehicle, Shipment, WeatherStation, Incident, AlertItem, Hub, DashboardKPIs } from './types';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('COMMAND_CENTER');
  const [lang, setLang] = useState<Language>('en');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<NavTab>('command_center');

  // Core Platform Data State
  const [roads, setRoads] = useState<Road[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [weather, setWeather] = useState<WeatherStation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    total_roads_monitored: 18,
    high_risk_roads: 9,
    blocked_roads: 0,
    vehicles_active: 6,
    critical_shipments: 6,
    delayed_shipments: 0,
    active_alerts: 2,
    incidents_reported: 3
  });

  // Scenario & Help Modal State
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [helpGuideOpen, setHelpGuideOpen] = useState(false);
  const [scenarioStep, setScenarioStep] = useState(1);
  const [scenarioPhase, setScenarioPhase] = useState<number>(1);
  const [scenarioVehicleId, setScenarioVehicleId] = useState<string>('V-102');
  const [inspectedRoadId, setInspectedRoadId] = useState<string>('R-1024');

  // Load all platform data
  const loadAllData = async () => {
    try {
      const [r, v, s, w, inc, alt, hb, dash] = await Promise.all([
        fetchRoads(selectedState),
        fetchVehicles(),
        fetchShipments(),
        fetchWeather(selectedState),
        fetchIncidents(),
        fetchAlerts(),
        fetchHubs(),
        fetchDashboardSummary()
      ]);

      setRoads(r);
      setVehicles(v);
      setShipments(s);
      setWeather(w);
      setIncidents(inc);
      setAlerts(alt);
      setHubs(hb);
      if (dash?.kpis) {
        setKpis(dash.kpis);
      }
      if (dash?.scenario_step) {
        setScenarioStep(dash.scenario_step);
      }
    } catch (err) {
      console.error('Error fetching platform data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedState]);

  // Periodic background simulation ping (every 6s)
  useEffect(() => {
    const timer = setInterval(() => {
      simulateVehicleTick()
        .then(() => {
          fetchVehicles().then(setVehicles).catch(() => {});
        })
        .catch(() => {});
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // When role changes, adapt the active view contextually
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'FIELD_OFFICER') {
      setActiveTab('field_app');
    } else if (newRole === 'LOGISTICS_OPERATOR') {
      setActiveTab('vehicle_tracking');
    } else {
      setActiveTab('command_center');
    }
  };

  const handleSelectRoad = (road: Road) => {
    setInspectedRoadId(road.id);
    setActiveTab('road_intelligence');
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setActiveTab('vehicle_tracking');
  };

  const handleScenarioUpdated = (stepData: any) => {
    if (stepData?.step) {
      setScenarioStep(stepData.step);
    }
    if (stepData?.stage) {
      setScenarioPhase(stepData.stage);
    } else if (stepData?.step) {
      setScenarioPhase(stepData.step === 1 ? 1 : stepData.step === 2 ? 2 : stepData.step === 3 ? 4 : 6);
    }
    if (stepData?.vehicle_id) {
      setScenarioVehicleId(stepData.vehicle_id);
    }
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        currentRole={role}
        setRole={handleRoleChange}
        currentLang={lang}
        setLang={setLang}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        onOpenScenarioModal={() => setScenarioModalOpen(true)}
        scenarioStep={scenarioStep}
        scenarioPhase={scenarioPhase}
        scenarioVehicleId={scenarioVehicleId}
        onOpenHelpGuide={() => setHelpGuideOpen(true)}
        onNavigateToSimulation={() => setActiveTab('simulation_drill')}
      />

      {/* Main Content Area: Sidebar + Active Page */}
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          alertsCount={alerts.filter((a) => a.alert_level === 'CRITICAL' || a.alert_level === 'WARNING').length}
        />

        <main className="flex-1 p-3 md:p-4 overflow-y-auto max-w-[1700px]">
          {activeTab === 'command_center' && (
            <CommandCenter
              roads={roads}
              vehicles={vehicles}
              incidents={incidents}
              hubs={hubs}
              weather={weather}
              alerts={alerts}
              kpis={kpis}
              lang={lang}
              scenarioStep={scenarioStep}
              scenarioPhase={scenarioPhase}
              scenarioVehicleId={scenarioVehicleId}
              onSelectRoad={handleSelectRoad}
              onSelectVehicle={handleSelectVehicle}
              onOpenScenario={() => setScenarioModalOpen(true)}
              onSelectScenarioVehicle={(id) => setScenarioVehicleId(id)}
              onNavigateToTab={setActiveTab}
              onRefreshWeather={loadAllData}
            />
          )}

          {activeTab === 'simulation_drill' && (
            <SimulationDrill
              roads={roads}
              vehicles={vehicles}
              incidents={incidents}
              hubs={hubs}
              weather={weather}
              lang={lang}
              scenarioPhase={scenarioPhase}
              setScenarioPhase={setScenarioPhase}
              scenarioVehicleId={scenarioVehicleId}
              setScenarioVehicleId={setScenarioVehicleId}
              onSelectRoad={handleSelectRoad}
              onSelectVehicle={handleSelectVehicle}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'road_intelligence' && (
            <RoadIntelligence initialRoadId={inspectedRoadId} />
          )}

          {activeTab === 'route_planner' && (
            <RoutePlanner />
          )}

          {activeTab === 'vehicle_tracking' && (
            <VehicleTracking
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
              onRefreshVehicles={loadAllData}
              onSimulateDetour={(vehicleId) => {
                setScenarioVehicleId(vehicleId);
                setScenarioModalOpen(true);
              }}
            />
          )}

          {activeTab === 'shipment_management' && (
            <ShipmentManagement shipments={shipments} />
          )}

          {activeTab === 'incident_center' && (
            <IncidentCenter incidents={incidents} />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenter
              alerts={alerts}
              onOpenScenario={() => setScenarioModalOpen(true)}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}

          {activeTab === 'field_app' && (
            <FieldOfficerApp />
          )}
        </main>
      </div>

      {/* Interactive Scenario Demonstration Modal */}
      <ScenarioModal
        isOpen={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
        activeStep={scenarioStep}
        activeStage={scenarioPhase}
        initialConvoyId={scenarioVehicleId}
        onScenarioUpdated={handleScenarioUpdated}
      />

      {/* User Onboarding & Help Guide Modal */}
      <HelpGuideModal
        isOpen={helpGuideOpen}
        onClose={() => setHelpGuideOpen(false)}
        onStartScenario={() => setScenarioModalOpen(true)}
      />
    </div>
  );
};
