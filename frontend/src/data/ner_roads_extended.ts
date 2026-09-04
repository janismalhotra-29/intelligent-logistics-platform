/**
 * Enriched, high-density road network dataset for the North Eastern Region.
 * Contains realistic curvature coordinate paths for National Highways, State Highways,
 * and strategic mountain passes across all 8 NER states.
 */

export interface DetailedRoad {
  id: string;
  name: string;
  highway_no: string;
  state: string;
  road_type: string;
  distance_km: number;
  status: 'ACCESSIBLE' | 'WATCH' | 'RESTRICTED' | 'BLOCKED';
  base_speed_kmh: number;
  elevation_m: number;
  slope_deg: number;
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

export const DETAILED_NER_ROADS: DetailedRoad[] = [
  // ==========================================
  // SIKKIM HIGHWAYS
  // ==========================================
  {
    id: 'R-1024',
    name: 'NH-310A Gangtok – Mangan Sector (Mangan Ridge)',
    highway_no: 'NH-310A',
    state: 'Sikkim',
    road_type: 'National Highway',
    distance_km: 68.0,
    status: 'WATCH',
    base_speed_kmh: 28.0,
    elevation_m: 1850.0,
    slope_deg: 34.0,
    road_surface: 'Asphalt/Bituminous',
    road_condition_score: 2,
    traffic_level: 'High',
    river_proximity_m: 80.0,
    historical_landslides: 7,
    historical_floods: 1,
    bridge_condition_score: 3,
    coordinates: [
      [27.3389, 88.6065], // Gangtok
      [27.3520, 88.6180],
      [27.3750, 88.6120], // Penlong
      [27.4050, 88.5850],
      [27.4250, 88.5520], // Mile-14 (Landslide point)
      [27.4520, 88.5420],
      [27.4780, 88.5350],
      [27.5034, 88.5284]  // Mangan
    ],
    alternative_route_ids: ['R-1028', 'R-1031']
  },
  {
    id: 'R-1028',
    name: 'Dikchu – Phodong Western Bypass (Route B)',
    highway_no: 'SH-7 (Sikkim)',
    state: 'Sikkim',
    road_type: 'State Highway Bypass',
    distance_km: 86.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 32.0,
    elevation_m: 1420.0,
    slope_deg: 22.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 350.0,
    historical_landslides: 2,
    historical_floods: 0,
    bridge_condition_score: 4,
    coordinates: [
      [27.3389, 88.6065], // Gangtok
      [27.3620, 88.5720],
      [27.3980, 88.5230], // Dikchu
      [27.4280, 88.5080],
      [27.4650, 88.5010], // Phodong
      [27.4890, 88.5150],
      [27.5034, 88.5284]  // Mangan
    ],
    alternative_route_ids: ['R-1024', 'R-1031']
  },
  {
    id: 'R-1031',
    name: 'Singtam – Tarku – Rabongla Ridge Bypass (Route C)',
    highway_no: 'SH-11 (Sikkim)',
    state: 'Sikkim',
    road_type: 'State Mountain Highway',
    distance_km: 102.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 26.0,
    elevation_m: 2100.0,
    slope_deg: 28.0,
    road_surface: 'Bituminous',
    road_condition_score: 3,
    traffic_level: 'Low',
    river_proximity_m: 600.0,
    historical_landslides: 3,
    historical_floods: 0,
    bridge_condition_score: 4,
    coordinates: [
      [27.3389, 88.6065], // Gangtok
      [27.2850, 88.5600],
      [27.2350, 88.4980], // Singtam
      [27.2650, 88.4200], // Tarku
      [27.3100, 88.3650], // Rabongla
      [27.3850, 88.3900],
      [27.4400, 88.4200],
      [27.4800, 88.4800],
      [27.5034, 88.5284]  // Mangan
    ],
    alternative_route_ids: ['R-1028']
  },
  {
    id: 'R-1035',
    name: 'NH-10 Siliguri – Rangpo – Gangtok Lifeline Corridor',
    highway_no: 'NH-10',
    state: 'Sikkim',
    road_type: 'National Highway',
    distance_km: 114.0,
    status: 'RESTRICTED',
    base_speed_kmh: 34.0,
    elevation_m: 950.0,
    slope_deg: 31.0,
    road_surface: 'Asphalt',
    road_condition_score: 2,
    traffic_level: 'Heavy',
    river_proximity_m: 45.0,
    historical_landslides: 12,
    historical_floods: 4,
    bridge_condition_score: 3,
    coordinates: [
      [26.7271, 88.4283], // Siliguri
      [26.8850, 88.4720], // Sevoke Coronation Bridge
      [26.9650, 88.5150], // Kalijhora
      [27.0580, 88.5280], // Teesta Bazaar
      [27.1250, 88.5320], // Melli
      [27.1760, 88.5310], // Rangpo (Border Checkpost)
      [27.2350, 88.4980], // Singtam
      [27.2850, 88.5620], // Ranipool
      [27.3389, 88.6065]  // Gangtok
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-1040',
    name: 'NH-310A Mangan – Chungthang – Lachung Forward Sector',
    highway_no: 'NH-310A North',
    state: 'Sikkim',
    road_type: 'Strategic Border Highway',
    distance_km: 54.0,
    status: 'WATCH',
    base_speed_kmh: 22.0,
    elevation_m: 2700.0,
    slope_deg: 38.0,
    road_surface: 'Bituminous',
    road_condition_score: 2,
    traffic_level: 'Low',
    river_proximity_m: 90.0,
    historical_landslides: 9,
    historical_floods: 1,
    bridge_condition_score: 2,
    coordinates: [
      [27.5034, 88.5284], // Mangan
      [27.5450, 88.5620],
      [27.5900, 88.6300], // Chungthang
      [27.6350, 88.6850],
      [27.6891, 88.7430]  // Lachung
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // ASSAM HIGHWAYS
  // ==========================================
  {
    id: 'R-2010',
    name: 'NH-27 Guwahati – Nagaon – Doboka – Lumding – Silchar Corridor',
    highway_no: 'NH-27',
    state: 'Assam',
    road_type: 'National Highway 4-Lane',
    distance_km: 310.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 58.0,
    elevation_m: 140.0,
    slope_deg: 4.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Heavy',
    river_proximity_m: 420.0,
    historical_landslides: 0,
    historical_floods: 2,
    bridge_condition_score: 4,
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.1850, 92.0500], // Jagiroad
      [26.3450, 92.6840], // Nagaon
      [26.0850, 92.8800], // Doboka
      [25.7500, 93.1800], // Lumding
      [25.4100, 93.0200], // Haflong
      [25.1200, 92.9500],
      [24.8333, 92.7789]  // Silchar
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-2020',
    name: 'NH-37 Guwahati – Tezpur – Kaziranga – Jorhat – Dibrugarh',
    highway_no: 'NH-37',
    state: 'Assam',
    road_type: 'National Highway',
    distance_km: 435.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 52.0,
    elevation_m: 115.0,
    slope_deg: 3.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'High',
    river_proximity_m: 210.0,
    historical_landslides: 0,
    historical_floods: 5,
    bridge_condition_score: 4,
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.6500, 92.8000], // Tezpur
      [26.5800, 93.1700], // Kaziranga
      [26.6900, 93.5800], // Bokakhat
      [26.7500, 94.2100], // Jorhat
      [26.9800, 94.6300], // Sivasagar
      [27.4728, 94.9120]  // Dibrugarh
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-2030',
    name: 'NH-17 Guwahati – Goalpara – Dhubri Border Corridor',
    highway_no: 'NH-17',
    state: 'Assam',
    road_type: 'National Highway',
    distance_km: 260.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 50.0,
    elevation_m: 65.0,
    slope_deg: 2.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 180.0,
    historical_landslides: 0,
    historical_floods: 4,
    bridge_condition_score: 4,
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.1100, 91.2000],
      [26.1800, 90.6200], // Goalpara
      [26.0500, 90.2500],
      [26.0200, 89.9800]  // Dhubri
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // MEGHALAYA HIGHWAYS
  // ==========================================
  {
    id: 'R-3010',
    name: 'NH-6 Guwahati – Nongpoh – Umiam – Shillong Expressway',
    highway_no: 'NH-6',
    state: 'Meghalaya',
    road_type: 'National Highway 4-Lane',
    distance_km: 99.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 46.0,
    elevation_m: 1520.0,
    slope_deg: 18.0,
    road_surface: 'Asphalt',
    road_condition_score: 5,
    traffic_level: 'High',
    river_proximity_m: 310.0,
    historical_landslides: 3,
    historical_floods: 0,
    bridge_condition_score: 5,
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [26.0200, 91.8100], // Byrnihat
      [25.9000, 91.8800], // Nongpoh
      [25.6800, 91.9100], // Umiam
      [25.5788, 91.8933]  // Shillong
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-3020',
    name: 'NH-6 Shillong – Jowai – Khliehriat – Ratacherra – Silchar',
    highway_no: 'NH-6 South',
    state: 'Meghalaya',
    road_type: 'National Highway',
    distance_km: 215.0,
    status: 'WATCH',
    base_speed_kmh: 33.0,
    elevation_m: 1280.0,
    slope_deg: 27.0,
    road_surface: 'Bituminous',
    road_condition_score: 2,
    traffic_level: 'High',
    river_proximity_m: 120.0,
    historical_landslides: 8,
    historical_floods: 1,
    bridge_condition_score: 3,
    coordinates: [
      [25.5788, 91.8933], // Shillong
      [25.5100, 92.0500],
      [25.4400, 92.2000], // Jowai
      [25.3200, 92.3500], // Khliehriat
      [25.0500, 92.4800], // Ratacherra
      [24.9000, 92.6500], // Badarpur
      [24.8333, 92.7789]  // Silchar
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-3030',
    name: 'SH-5 Shillong – Mylliem – Cherrapunji (Sohra) Highway',
    highway_no: 'SH-5',
    state: 'Meghalaya',
    road_type: 'High Rainfall Highway',
    distance_km: 54.0,
    status: 'WATCH',
    base_speed_kmh: 30.0,
    elevation_m: 1430.0,
    slope_deg: 29.0,
    road_surface: 'Bituminous',
    road_condition_score: 3,
    traffic_level: 'Moderate',
    river_proximity_m: 180.0,
    historical_landslides: 6,
    historical_floods: 0,
    bridge_condition_score: 3,
    coordinates: [
      [25.5788, 91.8933], // Shillong
      [25.4800, 91.8400], // Mylliem
      [25.3800, 91.7800],
      [25.2700, 91.7300]  // Sohra / Cherrapunji
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-3040',
    name: 'NH-127B Shillong – Nongstoin – Williamnagar – Tura',
    highway_no: 'NH-127B',
    state: 'Meghalaya',
    road_type: 'National Highway',
    distance_km: 295.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 36.0,
    elevation_m: 1050.0,
    slope_deg: 20.0,
    road_surface: 'Asphalt',
    road_condition_score: 3,
    traffic_level: 'Low',
    river_proximity_m: 250.0,
    historical_landslides: 4,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [25.5788, 91.8933], // Shillong
      [25.5200, 91.2700], // Nongstoin
      [25.6000, 90.6200], // Williamnagar
      [25.5141, 90.2032]  // Tura
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // ARUNACHAL PRADESH HIGHWAYS
  // ==========================================
  {
    id: 'R-4010',
    name: 'NH-13 Bhalukpong – Bomdila – Sela Tunnel – Tawang Highway',
    highway_no: 'NH-13 Tawang',
    state: 'Arunachal Pradesh',
    road_type: 'Strategic Border Highway',
    distance_km: 315.0,
    status: 'RESTRICTED',
    base_speed_kmh: 26.0,
    elevation_m: 3150.0,
    slope_deg: 36.0,
    road_surface: 'Asphalt',
    road_condition_score: 3,
    traffic_level: 'Moderate',
    river_proximity_m: 110.0,
    historical_landslides: 11,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [26.8500, 92.6500], // Tezpur/Bhalukpong Gate
      [27.0100, 92.5800], // Tenga
      [27.2600, 92.4200], // Bomdila
      [27.3500, 92.2400], // Dirang
      [27.5000, 92.1000], // Sela Tunnel
      [27.5500, 91.9800], // Jang
      [27.5861, 91.8594]  // Tawang
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-4020',
    name: 'NH-415 Tezpur – Banderdewa – Naharlagun – Itanagar Capital Arterial',
    highway_no: 'NH-415',
    state: 'Arunachal Pradesh',
    road_type: 'National Highway',
    distance_km: 185.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 44.0,
    elevation_m: 480.0,
    slope_deg: 16.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 290.0,
    historical_landslides: 3,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [26.6500, 92.8000], // Tezpur
      [26.9000, 93.3000], // Banderdewa
      [27.1000, 93.6800], // Naharlagun
      [27.0844, 93.6053]  // Itanagar
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-4030',
    name: 'NH-15 / NH-515 Itanagar – North Lakhimpur – Pasighat Terminal',
    highway_no: 'NH-515',
    state: 'Arunachal Pradesh',
    road_type: 'National Highway',
    distance_km: 270.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 48.0,
    elevation_m: 160.0,
    slope_deg: 8.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 350.0,
    historical_landslides: 2,
    historical_floods: 3,
    bridge_condition_score: 4,
    coordinates: [
      [27.0844, 93.6053], // Itanagar
      [27.2300, 94.1000], // North Lakhimpur
      [27.5000, 94.6000], // Dhemaji
      [27.8000, 95.0500], // Jonai
      [28.0664, 95.3267]  // Pasighat
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // NAGALAND HIGHWAYS
  // ==========================================
  {
    id: 'R-5010',
    name: 'NH-29 Dimapur – Chumoukedima – Medziphema – Kohima Corridor',
    highway_no: 'NH-29',
    state: 'Nagaland',
    road_type: 'National Highway 4-Lane',
    distance_km: 74.0,
    status: 'WATCH',
    base_speed_kmh: 34.0,
    elevation_m: 1440.0,
    slope_deg: 26.0,
    road_surface: 'Asphalt',
    road_condition_score: 3,
    traffic_level: 'Heavy',
    river_proximity_m: 150.0,
    historical_landslides: 7,
    historical_floods: 0,
    bridge_condition_score: 4,
    coordinates: [
      [25.9068, 93.7271], // Dimapur
      [25.8200, 93.8100], // Chumoukedima
      [25.7500, 93.9200], // Medziphema
      [25.7000, 94.0200], // Zubza
      [25.6751, 94.1086]  // Kohima
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-5020',
    name: 'NH-2 Kohima – Wokha – Mokokchung Mountain Arterial',
    highway_no: 'NH-2 North',
    state: 'Nagaland',
    road_type: 'State Mountain Highway',
    distance_km: 155.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 30.0,
    elevation_m: 1320.0,
    slope_deg: 24.0,
    road_surface: 'Bituminous',
    road_condition_score: 3,
    traffic_level: 'Moderate',
    river_proximity_m: 220.0,
    historical_landslides: 4,
    historical_floods: 0,
    bridge_condition_score: 3,
    coordinates: [
      [25.6751, 94.1086], // Kohima
      [25.8900, 94.1800],
      [26.1000, 94.2600], // Wokha
      [26.3200, 94.5200]  // Mokokchung
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // MANIPUR HIGHWAYS
  // ==========================================
  {
    id: 'R-6010',
    name: 'NH-2 Kohima – Senapati – Kangpokpi – Imphal Lifeline',
    highway_no: 'NH-2 South',
    state: 'Manipur',
    road_type: 'National Highway',
    distance_km: 138.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 36.0,
    elevation_m: 1050.0,
    slope_deg: 20.0,
    road_surface: 'Asphalt',
    road_condition_score: 3,
    traffic_level: 'High',
    river_proximity_m: 180.0,
    historical_landslides: 5,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [25.6751, 94.1086], // Kohima
      [25.5000, 94.1200], // Mao Gate
      [25.3200, 94.0500], // Maram
      [25.1800, 94.0200], // Senapati
      [25.0100, 93.9700], // Kangpokpi
      [24.8900, 93.9500], // Sekmai
      [24.8170, 93.9368]  // Imphal
    ],
    alternative_route_ids: ['R-6020']
  },
  {
    id: 'R-6020',
    name: 'NH-37 Silchar – Jiribam – Noney – Imphal Corridor',
    highway_no: 'NH-37 Jiribam',
    state: 'Manipur',
    road_type: 'National Highway',
    distance_km: 222.0,
    status: 'RESTRICTED',
    base_speed_kmh: 28.0,
    elevation_m: 920.0,
    slope_deg: 32.0,
    road_surface: 'Bituminous',
    road_condition_score: 2,
    traffic_level: 'Moderate',
    river_proximity_m: 90.0,
    historical_landslides: 9,
    historical_floods: 2,
    bridge_condition_score: 3,
    coordinates: [
      [24.8333, 92.7789], // Silchar
      [24.8000, 93.1200], // Jiribam
      [24.7500, 93.3800], // Nungba
      [24.7800, 93.5800], // Makru / Noney Bridge
      [24.8000, 93.7500],
      [24.8170, 93.9368]  // Imphal
    ],
    alternative_route_ids: ['R-6010']
  },
  {
    id: 'R-6030',
    name: 'NH-102 Imphal – Thoubal – Kakching – Pallel – Moreh Border Highway',
    highway_no: 'NH-102',
    state: 'Manipur',
    road_type: 'International Trade Corridor',
    distance_km: 110.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 42.0,
    elevation_m: 780.0,
    slope_deg: 14.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 140.0,
    historical_landslides: 3,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [24.8170, 93.9368], // Imphal
      [24.6300, 93.9800], // Thoubal
      [24.4800, 93.9900], // Kakching
      [24.4100, 94.0200], // Pallel
      [24.2800, 94.1500], // Tengnoupal
      [24.2400, 94.3000]  // Moreh (Border)
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-6040',
    name: 'Imphal – Bishnupur – Churachandpur Tiddim Highway',
    highway_no: 'Tiddim Road',
    state: 'Manipur',
    road_type: 'State Arterial',
    distance_km: 65.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 40.0,
    elevation_m: 850.0,
    slope_deg: 10.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'High',
    river_proximity_m: 210.0,
    historical_landslides: 1,
    historical_floods: 1,
    bridge_condition_score: 4,
    coordinates: [
      [24.8170, 93.9368], // Imphal
      [24.6200, 93.7600], // Bishnupur
      [24.4800, 93.6900],
      [24.3333, 93.6800]  // Churachandpur
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // MIZORAM HIGHWAYS
  // ==========================================
  {
    id: 'R-7010',
    name: 'NH-306 Silchar – Vairengte – Kolasib – Sairang – Aizawl Lifeline',
    highway_no: 'NH-306',
    state: 'Mizoram',
    road_type: 'National Highway',
    distance_km: 178.0,
    status: 'WATCH',
    base_speed_kmh: 32.0,
    elevation_m: 1130.0,
    slope_deg: 30.0,
    road_surface: 'Asphalt',
    road_condition_score: 3,
    traffic_level: 'High',
    river_proximity_m: 140.0,
    historical_landslides: 8,
    historical_floods: 0,
    bridge_condition_score: 3,
    coordinates: [
      [24.8333, 92.7789], // Silchar
      [24.5800, 92.7500], // Dholai
      [24.4900, 92.7500], // Vairengte (Border Checkpost)
      [24.2200, 92.6800], // Kolasib
      [23.9500, 92.6400], // Kawnpui
      [23.8200, 92.6600], // Sairang
      [23.7271, 92.7176]  // Aizawl
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-7020',
    name: 'NH-54 Aizawl – Serchhip – Lunglei Southern Lifeline',
    highway_no: 'NH-54 South',
    state: 'Mizoram',
    road_type: 'National Highway',
    distance_km: 165.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 30.0,
    elevation_m: 1220.0,
    slope_deg: 28.0,
    road_surface: 'Bituminous',
    road_condition_score: 3,
    traffic_level: 'Moderate',
    river_proximity_m: 220.0,
    historical_landslides: 5,
    historical_floods: 0,
    bridge_condition_score: 3,
    coordinates: [
      [23.7271, 92.7176], // Aizawl
      [23.5100, 92.7800],
      [23.3100, 92.8500], // Serchhip
      [23.1200, 92.8100],
      [22.8833, 92.7333]  // Lunglei
    ],
    alternative_route_ids: []
  },

  // ==========================================
  // TRIPURA HIGHWAYS
  // ==========================================
  {
    id: 'R-8010',
    name: 'NH-8 Silchar – Dharmanagar – Teliamura – Agartala Highway',
    highway_no: 'NH-8',
    state: 'Tripura',
    road_type: 'National Highway',
    distance_km: 285.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 46.0,
    elevation_m: 180.0,
    slope_deg: 9.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'High',
    river_proximity_m: 220.0,
    historical_landslides: 1,
    historical_floods: 3,
    bridge_condition_score: 4,
    coordinates: [
      [24.8333, 92.7789], // Silchar
      [24.5500, 92.2800], // Churaibari Gate
      [24.3833, 92.1667], // Dharmanagar
      [24.1800, 92.0200], // Kumarghat
      [23.9200, 91.8500], // Ambassa
      [23.8400, 91.5800], // Teliamura
      [23.8315, 91.2868]  // Agartala
    ],
    alternative_route_ids: []
  },
  {
    id: 'R-8020',
    name: 'NH-208 Agartala – Bishalgarh – Udaipur – Santirbazar – Sabroom',
    highway_no: 'NH-208',
    state: 'Tripura',
    road_type: 'National Highway 4-Lane',
    distance_km: 132.0,
    status: 'ACCESSIBLE',
    base_speed_kmh: 50.0,
    elevation_m: 85.0,
    slope_deg: 6.0,
    road_surface: 'Asphalt',
    road_condition_score: 4,
    traffic_level: 'Moderate',
    river_proximity_m: 310.0,
    historical_landslides: 0,
    historical_floods: 2,
    bridge_condition_score: 5,
    coordinates: [
      [23.8315, 91.2868], // Agartala
      [23.6800, 91.3100], // Bishalgarh
      [23.5300, 91.4800], // Udaipur
      [23.3100, 91.5500], // Santirbazar
      [23.0000, 91.7000]  // Sabroom (Maitri Bridge Border)
    ],
    alternative_route_ids: []
  }
];
