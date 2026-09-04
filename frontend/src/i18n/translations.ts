export type Language = 'en' | 'hi';

export const translations = {
  en: {
    app_title: "NER SMART LOGISTICS",
    tagline: "North Eastern Region · 8 States",
    live_badge: "LIVE",
    states_all: "All 8 NER States",
    drill_label: "Drill",
    phase_label: "Phase",
    guide_button: "Guide",
    alert_badge: "Alert",
    
    // Roles
    role_command: "Command",
    role_logistics: "Logistics",
    role_field: "Field",
    role_command_center: "Government / Command Center",
    role_logistics_operator: "Logistics Operator",
    role_field_officer: "Field Officer",
    
    // Sidebar Sections
    section_overview: "OVERVIEW",
    section_operations: "OPERATIONS",
    section_incidents: "INCIDENTS",
    section_analytics: "ANALYTICS",

    // Nav
    nav_command_center: "Command Center",
    nav_simulation_drill: "Disaster Simulation Drill",
    nav_road_intelligence: "Road Intelligence",
    nav_route_planner: "Route Planner",
    nav_vehicle_tracking: "Vehicle Tracking",
    nav_shipment_management: "Shipment Management",
    nav_relief_operations: "Relief Operations",
    nav_incident_center: "Incident Center",
    nav_alerts: "Alerts Center",
    nav_report_hazard: "Report Hazard",
    nav_analytics: "Analytics & Vulnerability",
    nav_field_app: "Field Officer App",

    // Badges
    badge_ai_safe: "AI Safe",
    badge_live: "Live",
    badge_offline: "Offline",
    badge_convoys: "6 Convoys",
    badge_phases: "6 Phases",

    // Live Weather & Operational Banner
    live_weather_header: "✦ LIVE REGIONAL WEATHER & TRANSIT INTEL",
    live_weather_sub: "Real-time IMD / Open-Meteo telemetry across 8 North Eastern states",
    monsoon_status_banner: "LIVE OPERATIONAL NETWORK STATUS",
    launch_drill_cta: "Launch Contingency Simulation Drill →",
    actual_weather_stations: "ACTUAL REGIONAL WEATHER STATIONS",
    station_humidity: "Humidity",
    station_temp: "Temp",
    station_wind: "Wind",
    station_rain_24h: "24h Rain",
    station_warning: "IMD Alert",
    normal_transit_status: "Standard Commercial Transit Active",
    real_road_condition: "Current Ground Status",

    // Banner & Controls
    simulation_drill_btn: "SIMULATION DRILL",
    view_warnings_btn: "VIEW WARNINGS",
    search_placeholder: "Search highway (e.g. NH-10, NH-310A)...",
    inspect_intelligence: "Inspect Full Intelligence",
    detour_btn: "Detour",

    // AI Advisor
    ai_advisor_header: "✦ AI TRAVEL ADVISOR",
    live_ai_check: "LIVE AI CHECK",
    sector_label: "SECTOR",
    telemetry_rainfall: "Rainfall Telemetry",
    telemetry_slope: "Slope / Elevation",
    telemetry_road_status: "Road Accessibility",
    telemetry_hazard_risk: "Hazard Probability",
    view_safe_route: "VIEW SAFE ROUTE",
    safe_route_active: "PURPLE ROUTE ACTIVE ON MAP",
    bypass_alternative: "Bypass Route Alternative",
    safety_score_label: "Safety",

    // Bottom Metrics
    metric_road_accessibility: "ROAD ACCESSIBILITY",
    metric_active_hazards: "ACTIVE HAZARDS",
    metric_relief_fleets: "RELIEF FLEETS",
    metric_safe_detours: "SAFE DETOURS",
    metric_open: "Open",
    metric_blocked: "Blocked",
    metric_corridors_risk: "Corridors at Risk",
    metric_convoys_route: "Convoys En Route",
    metric_operational: "Operational",
    metric_data_sync: "● LIVE DATA SYNC",
    metric_sync_sub: "Weather 2m ago · Road 1m ago · Fleet 15s",
    metric_drill_tag: "SIMULATION DRILL",

    // KPIs
    kpi_total_roads: "Total Roads Monitored",
    kpi_high_risk: "High Risk Roads",
    kpi_blocked_roads: "Blocked Roads",
    kpi_active_vehicles: "Active Vehicles",
    kpi_critical_shipments: "Critical Shipments",
    kpi_delayed_shipments: "Delayed Shipments",
    kpi_active_alerts: "Active Alerts",
    kpi_incidents_reported: "Incidents Reported",

    // Common
    accessible: "Accessible",
    watch: "Watch / Advisory",
    restricted: "Restricted",
    blocked: "Blocked",
    normal: "Normal",
    warning: "Warning",
    critical: "Critical",
    divert_action: "Divert Critical Shipment",
    simulated_data: "SIMULATION / DEMO DATA",
    scenario_button: "North Sikkim Landslide Scenario",
    reroute_recommended: "REROUTE RECOMMENDED"
  },
  hi: {
    app_title: "पूर्वोत्तर स्मार्ट रसद",
    tagline: "पूर्वोत्तर क्षेत्र · 8 राज्य",
    live_badge: "सक्रिय",
    states_all: "सभी 8 पूर्वोत्तर राज्य",
    drill_label: "ड्रिल",
    phase_label: "चरण",
    guide_button: "मार्गदर्शिका",
    alert_badge: "अलर्ट",

    // Roles
    role_command: "कमांड",
    role_logistics: "लॉजिस्टिक्स",
    role_field: "फील्ड",
    role_command_center: "कमांड सेंटर / सरकारी प्राधिकरण",
    role_logistics_operator: "रसद संचालक (लॉजिस्टिक्स)",
    role_field_officer: "फील्ड अधिकारी (निगरानी दल)",

    // Sidebar Sections
    section_overview: "सिंहावलोकन",
    section_operations: "संचालन एवं काफिले",
    section_incidents: "आपदा व चेतावनियां",
    section_analytics: "विश्लेषण एवं डेटा",

    // Nav
    nav_command_center: "कमांड सेंटर",
    nav_simulation_drill: "आपदा सिमुलेशन अभ्यास",
    nav_road_intelligence: "सड़क आसूचना व जोखिम",
    nav_route_planner: "मार्ग योजनाकार (रूट)",
    nav_vehicle_tracking: "वाहन जीपीएस ट्रैकिंग",
    nav_shipment_management: "आवश्यक आपूर्ति प्रबंधन",
    nav_relief_operations: "राहत काफिला संचालन",
    nav_incident_center: "आपदा व घटना केंद्र",
    nav_alerts: "चेतावनी केंद्र (अलर्ट्स)",
    nav_report_hazard: "आपदा रिपोर्ट करें",
    nav_analytics: "विश्लेषण व संवेदनशीलता",
    nav_field_app: "फील्ड मोबाइल ऐप",

    // Badges
    badge_ai_safe: "एआई सुरक्षित",
    badge_live: "लाइव",
    badge_offline: "ऑफलाइन",
    badge_convoys: "6 काफिले",
    badge_phases: "6 चरण",

    // Live Weather & Operational Banner
    live_weather_header: "✦ लाइव क्षेत्रीय मौसम एवं आवागमन आसूचना",
    live_weather_sub: "पूर्वोत्तर के 8 राज्यों में आईएमडी / ओपन-मीटियो वास्तविक टेलीमेट्री",
    monsoon_status_banner: "लाइव परिचालन नेटवर्क स्थिति",
    launch_drill_cta: "आपातकालीन सिमुलेशन अभ्यास शुरू करें →",
    actual_weather_stations: "वास्तविक मानसूनी मौसम केंद्र",
    station_humidity: "आर्द्रता",
    station_temp: "तापमान",
    station_wind: "हवा",
    station_rain_24h: "24 घंटे वर्षा",
    station_warning: "आईएमडी अलर्ट",
    normal_transit_status: "सामान्य वाणिज्यिक आवागमन चालू",
    real_road_condition: "वर्तमान जमीनी स्थिति",

    // Banner & Controls
    simulation_drill_btn: "सिमुलेशन अभ्यास",
    view_warnings_btn: "चेतावनियां देखें",
    search_placeholder: "राजमार्ग खोजें (उदा. NH-10, NH-310A)...",
    inspect_intelligence: "पूर्ण आसूचना देखें",
    detour_btn: "बाईपास",

    // AI Advisor
    ai_advisor_header: "✦ एआई यात्रा परामर्शदाता",
    live_ai_check: "लाइव एआई जांच",
    sector_label: "सेक्टर",
    telemetry_rainfall: "वर्षा टेलीमेट्री (24 घंटे)",
    telemetry_slope: "पहाड़ी ढलान / ऊंचाई",
    telemetry_road_status: "सड़क आवागमन स्थिति",
    telemetry_hazard_risk: "आपदा जोखिम संभावना",
    view_safe_route: "सुरक्षित मार्ग देखें",
    safe_route_active: "मानचित्र पर बैंगनी मार्ग सक्रिय",
    bypass_alternative: "वैकल्पिक बाईपास मार्ग",
    safety_score_label: "सुरक्षा स्कोर",

    // Bottom Metrics
    metric_road_accessibility: "सड़क आवागमन स्थिति",
    metric_active_hazards: "सक्रिय आपदाएं",
    metric_relief_fleets: "राहत काफिले",
    metric_safe_detours: "सुरक्षित बाईपास",
    metric_open: "खुली",
    metric_blocked: "अवरुद्ध",
    metric_corridors_risk: "गलियारे जोखिम में",
    metric_convoys_route: "काफिले मार्ग में",
    metric_operational: "सक्रिय",
    metric_data_sync: "● लाइव डेटा समन्वय",
    metric_sync_sub: "मौसम 2 मि. पूर्व · सड़क 1 मि. पूर्व · काफिला 15 से.",
    metric_drill_tag: "सिमुलेशन अभ्यास",

    // KPIs
    kpi_total_roads: "निगरानी अधीन कुल सड़कें",
    kpi_high_risk: "उच्च जोखिम वाली सड़कें",
    kpi_blocked_roads: "अवरुद्ध / बंद सड़कें",
    kpi_active_vehicles: "सक्रिय वाहन काफिले",
    kpi_critical_shipments: "अति-महत्वपूर्ण आपूर्तियाँ (दवा/राशन)",
    kpi_delayed_shipments: "विलंबित खेप",
    kpi_active_alerts: "सक्रिय अलर्ट",
    kpi_incidents_reported: "दर्ज की गई घटनाएं",

    // Common
    accessible: "खुला / सुगम",
    watch: "निगरानी स्तर",
    restricted: "सीमित आवागमन",
    blocked: "अवरुद्ध (बंद)",
    normal: "सामान्य",
    warning: "चेतावनी",
    critical: "गंभीर संकट",
    divert_action: "वैकल्पिक सुरक्षित मार्ग पर मोड़ें",
    simulated_data: "सिमुलेशन / डेमो डेटा",
    scenario_button: "उत्तरी सिक्किम भूस्खलन परिदृश्य (डेमो)",
    reroute_recommended: "मार्ग परिवर्तन अनुशंसित"
  }
};

