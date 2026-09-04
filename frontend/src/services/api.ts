import { Road, Hub, Vehicle, Shipment, WeatherStation, Incident, AlertItem, DashboardKPIs } from '../types';

const API_BASE = '/api';

// Offline reports queue in localStorage
const OFFLINE_QUEUE_KEY = 'ner_offline_field_reports_queue';

export function getOfflineQueue(): any[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToOfflineQueue(report: any) {
  const queue = getOfflineQueue();
  queue.push({
    ...report,
    client_uuid: report.client_uuid || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp_captured: new Date().toISOString()
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return queue;
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function syncOfflineReports(): Promise<{ status: string; synced_count: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { status: 'NO_OP', synced_count: 0 };
  }
  try {
    const res = await fetch(`${API_BASE}/field-reports/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reports: queue })
    });
    if (res.ok) {
      clearOfflineQueue();
      const data = await res.json();
      return { status: 'SYNCED', synced_count: data.synced_count };
    }
    throw new Error('Sync failed on server');
  } catch (err) {
    console.error('Offline sync error:', err);
    throw err;
  }
}

// API functions
export async function fetchDashboardSummary(): Promise<{
  kpis: DashboardKPIs;
  state_breakdown: Record<string, any>;
  recent_alerts: AlertItem[];
  scenario_step: number;
}> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export async function fetchRoads(state?: string): Promise<Road[]> {
  const url = state && state !== 'All' ? `${API_BASE}/roads?state=${encodeURIComponent(state)}` : `${API_BASE}/roads`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch roads');
  return res.json();
}

export async function fetchHubs(): Promise<Hub[]> {
  const res = await fetch(`${API_BASE}/roads/hubs`);
  if (!res.ok) throw new Error('Failed to fetch hubs');
  return res.json();
}

export async function fetchRoadIntelligence(roadId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/roads/${roadId}/intelligence`);
  if (!res.ok) throw new Error('Failed to fetch road intelligence');
  return res.json();
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function divertVehicle(vehicleId: string, newRoadId: string = 'R-1028'): Promise<any> {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/divert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_road_id: newRoadId })
  });
  if (!res.ok) throw new Error('Failed to divert vehicle');
  return res.json();
}

export async function fetchShipments(): Promise<Shipment[]> {
  const res = await fetch(`${API_BASE}/shipments`);
  if (!res.ok) throw new Error('Failed to fetch shipments');
  return res.json();
}

export async function fetchWeather(state?: string): Promise<WeatherStation[]> {
  const url = state && state !== 'All' ? `${API_BASE}/weather?state=${encodeURIComponent(state)}` : `${API_BASE}/weather`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export async function syncLiveWeather(): Promise<WeatherStation[]> {
  const res = await fetch(`${API_BASE}/weather/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to sync live weather');
  const data = await res.json();
  return data.data || [];
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function createIncident(payload: any): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to report incident');
  return res.json();
}

export async function classifyPhoto(file?: File, simulatedType?: string): Promise<any> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (simulatedType) {
    formData.append('simulated_type', simulatedType);
  }
  const res = await fetch(`${API_BASE}/incidents/classify-photo`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to classify photo');
  return res.json();
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function optimizeRoute(params: {
  origin: string;
  destination: string;
  cargo_category: string;
  cargo_priority: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/routes/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to optimize route');
  return res.json();
}

export async function triggerScenarioStep(step: number, vehicleId: string = 'V-102'): Promise<any> {
  const res = await fetch(`${API_BASE}/scenario/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, vehicle_id: vehicleId })
  });
  if (!res.ok) throw new Error('Failed to trigger scenario step');
  return res.json();
}

export async function resetScenario(): Promise<any> {
  const res = await fetch(`${API_BASE}/scenario/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset scenario');
  return res.json();
}

export async function predictRoadRiskDirect(features: any): Promise<any> {
  const res = await fetch(`${API_BASE}/risk/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features)
  });
  if (!res.ok) throw new Error('Failed to predict risk');
  return res.json();
}

export async function predictEtaDirect(features: any): Promise<any> {
  const res = await fetch(`${API_BASE}/eta/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features)
  });
  if (!res.ok) throw new Error('Failed to predict ETA');
  return res.json();
}
