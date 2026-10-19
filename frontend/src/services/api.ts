import { Road, Hub, Vehicle, Shipment, WeatherStation, Incident, AlertItem, DashboardKPIs } from '../types';

// Configurable API base URL: works locally via Vite proxy or with remote HTTPS backend
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

/**
 * Dynamically resolves WebSocket URL for fleet tracking & live telematics.
 * Respects VITE_WS_URL if set, or detects wss:// on HTTPS vs ws:// on HTTP.
 */
export function getWebSocketUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // In browser runtime
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const host = window.location.host;
    return `${isHttps ? 'wss:' : 'ws:'}//${host}/ws/live`;
  }
  return 'ws://localhost:8000/ws/live';
}

function getAuthHeaders(): HeadersInit {
  const role = typeof localStorage !== 'undefined' ? localStorage.getItem('ner_user_role') || 'COMMAND_CENTER' : 'COMMAND_CENTER';
  const apiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('ner_api_key') || '' : '';
  const headers: Record<string, string> = {
    'X-User-Role': role
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
}

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let detail = fallbackError;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        detail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // Ignore JSON parse error on non-JSON error pages
    }
    throw new Error(`[HTTP ${res.status}] ${detail}`);
  }
  return res.json();
}

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

export async function syncOfflineReports(): Promise<{ status: string; synced_count: number; duplicates_skipped?: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { status: 'NO_OP', synced_count: 0, duplicates_skipped: 0 };
  }
  try {
    const res = await fetch(`${API_BASE}/field-reports/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ reports: queue })
    });
    const data = await handleResponse<{ status: string; synced_count: number; duplicates_skipped?: number }>(
      res, 
      'Offline sync rejected by server'
    );
    clearOfflineQueue();
    return data;
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
  const res = await fetch(`${API_BASE}/dashboard`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch dashboard overview');
}

export async function fetchRoads(state?: string): Promise<Road[]> {
  const url = state && state !== 'All' ? `${API_BASE}/roads?state=${encodeURIComponent(state)}` : `${API_BASE}/roads`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch road networks');
}

export async function fetchHubs(): Promise<Hub[]> {
  const res = await fetch(`${API_BASE}/roads/hubs`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch logistics hubs');
}

export async function fetchRoadIntelligence(roadId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/roads/${roadId}/intelligence`, { headers: getAuthHeaders() });
  return handleResponse(res, `Failed to fetch intelligence for road ${roadId}`);
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${API_BASE}/vehicles`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch vehicle fleet');
}

export async function simulateVehicleTick(): Promise<any> {
  const res = await fetch(`${API_BASE}/vehicles/simulate-tick`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res, 'Vehicle tick simulation failed');
}

export async function divertVehicle(vehicleId: string, newRoadId: string = 'R-1028'): Promise<any> {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/divert`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ new_road_id: newRoadId })
  });
  return handleResponse(res, `Failed to divert vehicle ${vehicleId}`);
}

export async function fetchShipments(): Promise<Shipment[]> {
  const res = await fetch(`${API_BASE}/shipments`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch shipments');
}

export async function fetchWeather(state?: string): Promise<WeatherStation[]> {
  const url = state && state !== 'All' ? `${API_BASE}/weather?state=${encodeURIComponent(state)}` : `${API_BASE}/weather`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch meteorological telemetry');
}

export async function syncLiveWeather(): Promise<WeatherStation[]> {
  const res = await fetch(`${API_BASE}/weather/sync`, { 
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await handleResponse<{ status: string; data: WeatherStation[] }>(res, 'Failed to sync live weather');
  return data.data || [];
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch incidents');
}

export async function createIncident(payload: any): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, 'Failed to report verified incident');
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
    headers: getAuthHeaders(),
    body: formData
  });
  return handleResponse(res, 'Photo classification analysis failed');
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE}/alerts`, { headers: getAuthHeaders() });
  return handleResponse(res, 'Failed to fetch decision alerts');
}

export async function optimizeRoute(params: {
  origin: string;
  destination: string;
  cargo_category: string;
  cargo_priority: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/routes/optimize`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(params)
  });
  return handleResponse(res, 'Failed to compute hazard-optimized route');
}

export async function triggerScenarioStep(step: number, vehicleId: string = 'V-102'): Promise<any> {
  const res = await fetch(`${API_BASE}/scenario/step`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ step, vehicle_id: vehicleId })
  });
  return handleResponse(res, `Failed to transition scenario to step ${step}`);
}

export async function resetScenario(): Promise<any> {
  const res = await fetch(`${API_BASE}/scenario/reset`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res, 'Failed to reset scenario drill');
}

export async function predictRoadRiskDirect(features: any): Promise<any> {
  const res = await fetch(`${API_BASE}/risk/predict`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(features)
  });
  return handleResponse(res, 'Failed to compute road disruption risk');
}

export async function predictEtaDirect(features: any): Promise<any> {
  const res = await fetch(`${API_BASE}/eta/predict`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(features)
  });
  return handleResponse(res, 'Failed to predict ETA delay regression');
}
