export type UserRole = 'COMMAND_CENTER' | 'LOGISTICS_OPERATOR' | 'FIELD_OFFICER';

export type RoadStatus = 'ACCESSIBLE' | 'WATCH' | 'RESTRICTED' | 'BLOCKED';

export interface Road {
  id: string;
  name: string;
  highway_no: string;
  state: string;
  from_hub: string;
  to_hub: string;
  distance_km: number;
  status: RoadStatus;
  base_speed_kmh: number;
  elevation_m: number;
  slope_deg: number;
  road_type: string;
  road_surface: string;
  road_condition_score: number;
  traffic_level: string;
  river_proximity_m: number;
  historical_landslides: number;
  historical_floods: number;
  bridge_condition_score: number;
  coordinates: [number, number][];
  alternative_route_ids?: string[];
}

export interface Hub {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  type: string;
  capacity_tons: number;
}

export interface Vehicle {
  id: string;
  name: string;
  vehicle_type: string;
  driver_name: string;
  driver_contact: string;
  current_lat: number;
  current_lng: number;
  current_speed_kmh: number;
  heading_deg: number;
  status: 'EN_ROUTE' | 'DIVERTED' | 'STOPPED' | 'IDLE';
  assigned_road_id: string;
  cargo_id: string;
  cargo_name: string;
  cargo_category: string;
  cargo_priority: number;
  origin: string;
  destination: string;
  normal_eta: string;
  predicted_delay: string;
  current_route_risk: 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';
  is_diverted: boolean;
  simulation_mode: boolean;
}

export interface Shipment {
  id: string;
  cargo_name: string;
  cargo_category: 'Medicine' | 'Food' | 'Emergency supplies' | 'Fuel' | 'Agricultural produce' | 'Construction material';
  priority: number;
  priority_label: string;
  quantity: string;
  origin: string;
  destination: string;
  vehicle_id: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELAYED' | 'DIVERTED' | 'DELIVERED';
  departure_time: string;
  expected_arrival: string;
  predicted_arrival: string;
  risk_impact: string;
}

export interface WeatherStation {
  station_id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  current_rainfall_mm: number;
  rainfall_1h_mm: number;
  rainfall_6h_mm: number;
  rainfall_24h_mm: number;
  rainfall_7d_mm: number;
  forecast_rainfall_mm: number;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  visibility_km: number;
  warning_level: string;
  rainfall_trend: number[];
  weather_condition?: string;
  wmo_code?: number;
  is_live?: boolean;
  source?: string;
  last_updated?: string;
}

export interface Incident {
  id: string;
  road_id: string;
  road_name: string;
  state: string;
  type: 'Landslide' | 'Flood' | 'Road Damage' | 'Bridge Damage' | 'Traffic' | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  lat: number;
  lng: number;
  reported_by: string;
  timestamp: string;
  description: string;
  photo_url?: string;
  cv_classification?: {
    detected_type: string;
    confidence: number;
    severity: string;
    recommended_action: string;
  };
  affected_vehicles_count: number;
  affected_shipments_count: number;
}

export interface AlertItem {
  id: string;
  alert_level: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  icon: string;
  title: string;
  road_id: string;
  route_name: string;
  state: string;
  risk_score: number;
  reason: string;
  prediction: string;
  affected_vehicles: number;
  critical_shipments: number;
  recommended_action: string;
  alternative_route_id?: string;
  alternative_route_name?: string;
  status: string;
}

export interface DashboardKPIs {
  total_roads_monitored: number;
  high_risk_roads: number;
  blocked_roads: number;
  vehicles_active: number;
  critical_shipments: number;
  delayed_shipments: number;
  active_alerts: number;
  incidents_reported: number;
}
