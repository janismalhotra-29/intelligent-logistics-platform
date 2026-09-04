export interface ScenarioConvoy {
  id: string;
  name: string;
  state: string;
  sector: string;
  origin: string;
  destination: string;
  primaryRoad: string;
  blockedRoad: string;
  disasterType: string;
  disasterHeadline: string;
  rainfall: string;
  slope: string;
  bypassRoad: string;
  bypassSub: string;
  bypassOverhead: string;
  bypassOverheadKm: string;
  bypassOverheadTime: string;
  cargo: string;
  driver: string;
  safetyScore: string;
  detourCoordinates: [number, number][];
  mapCenter: [number, number];
  mapZoom: number;
}

export const SCENARIO_CONVOYS: Record<string, ScenarioConvoy> = {
  'V-102': {
    id: 'V-102',
    name: 'Convoy #06 (V-102)',
    state: 'Sikkim',
    sector: 'NORTH SIKKIM',
    origin: 'Gangtok Hub',
    destination: 'Mangan Base',
    primaryRoad: 'NH-310A (Mangan Ridge Corridor)',
    blockedRoad: 'NH-310A (Mile 14)',
    disasterType: 'Mountain Landslide at Mile 14',
    disasterHeadline: 'NH-310A BLOCKED BY LANDSLIDE (Mile 14)',
    rainfall: '142 mm / 24h',
    slope: '34° Mountain Ridge',
    bypassRoad: 'Route B (Dikchu Western Bypass)',
    bypassSub: 'Dikchu → Phodong Bypass',
    bypassOverhead: '+18 km, +32 min',
    bypassOverheadKm: '+18 km',
    bypassOverheadTime: '+32 min',
    cargo: 'Emergency Trauma Kits & Insulin (Priority 100)',
    driver: 'Tashi Namgyal (+91-98002-12451)',
    safetyScore: '94%',
    mapCenter: [27.42, 88.55],
    mapZoom: 10,
    detourCoordinates: [
      [27.3389, 88.6065], // Gangtok Hub
      [27.3620, 88.5720],
      [27.3980, 88.5230], // Dikchu
      [27.4280, 88.5080],
      [27.4650, 88.5010], // Phodong
      [27.4890, 88.5150],
      [27.5034, 88.5284]  // Mangan Base
    ]
  },
  'V-110': {
    id: 'V-110',
    name: 'Relief Carrier Echo (V-110)',
    state: 'Manipur',
    sector: 'WEST MANIPUR / CACHAR',
    origin: 'Silchar Logistics Hub',
    destination: 'Imphal Central Depot',
    primaryRoad: 'NH-37 (Makru Bridge Corridor)',
    blockedRoad: 'NH-37 (Makru Bridge Approach)',
    disasterType: 'River Flash Flood Bridge Washout',
    disasterHeadline: 'NH-37 BLOCKED BY FLASH FLOOD (Makru Bridge)',
    rainfall: '168 mm / 24h',
    slope: '32° River Gorge',
    bypassRoad: 'Old Cachar / Jiribam Mountain Bypass',
    bypassSub: 'Jiribam → Noney High Mountain Crest',
    bypassOverhead: '+35 km, +1h 10m',
    bypassOverheadKm: '+35 km',
    bypassOverheadTime: '+1h 10m',
    cargo: 'Water Purification Systems & Tents (Priority 95)',
    driver: 'Kamei Rongmei (+91-98625-99881)',
    safetyScore: '91%',
    mapCenter: [24.81, 93.45],
    mapZoom: 9,
    detourCoordinates: [
      [24.8333, 92.7789], // Silchar Hub
      [24.8000, 93.1200], // Jiribam
      [24.7500, 93.3800], // Makru bypass
      [24.7800, 93.6500], // Noney
      [24.8000, 93.8500],
      [24.8170, 93.9368]  // Imphal Depot
    ]
  },
  'V-108': {
    id: 'V-108',
    name: 'Highland Tanker H-2 (V-108)',
    state: 'Mizoram',
    sector: 'NORTH MIZORAM / KOLASIB',
    origin: 'Silchar Logistics Hub',
    destination: 'Aizawl Fuel Reserves',
    primaryRoad: 'NH-306 (Kolasib Sector)',
    blockedRoad: 'NH-306 (Kolasib Pass)',
    disasterType: 'Roadbed Subsidence & Mud Slump',
    disasterHeadline: 'NH-306 BLOCKED BY ROADBED SUBSIDENCE (Kolasib)',
    rainfall: '135 mm / 24h',
    slope: '28° Ridge Escarpment',
    bypassRoad: 'Bairabi – Sairang Strategic Bypass',
    bypassSub: 'Bairabi → Sairang Western Crest',
    bypassOverhead: '+24 km, +45 min',
    bypassOverheadKm: '+24 km',
    bypassOverheadTime: '+45 min',
    cargo: 'Aviation Turbine Fuel & Diesel (Priority 85)',
    driver: 'Lalthlamuana Sailo (+91-94361-44321)',
    safetyScore: '92%',
    mapCenter: [24.15, 92.68],
    mapZoom: 9,
    detourCoordinates: [
      [24.8333, 92.7789], // Silchar Hub
      [24.5000, 92.7200], // Bilkhawthlir
      [24.2000, 92.6800], // Bairabi Pass
      [23.9000, 92.6500], // Kolasib West
      [23.7500, 92.7000], // Sairang
      [23.7271, 92.7176]  // Aizawl Base
    ]
  },
  'V-104': {
    id: 'V-104',
    name: 'Convoy Bravo (V-104)',
    state: 'Assam',
    sector: 'BRAHMAPUTRA VALLEY / NAGAON',
    origin: 'Guwahati Gateway Hub',
    destination: 'Silchar Logistics Hub',
    primaryRoad: 'NH-27 (Nagaon Corridor)',
    blockedRoad: 'NH-27 (Nagaon Bypass)',
    disasterType: 'Brahmaputra Valley Flood Inundation',
    disasterHeadline: 'NH-27 BLOCKED BY RIVER FLOOD (Nagaon Corridor)',
    rainfall: '155 mm / 24h',
    slope: '12° Lowland Basin',
    bypassRoad: 'Meghalaya Plateau Route (NH-6)',
    bypassSub: 'Shillong → Jowai → Silchar Ridge',
    bypassOverhead: '+40 km, +1h 15m',
    bypassOverheadKm: '+40 km',
    bypassOverheadTime: '+1h 15m',
    cargo: 'WFP Ration & Foodgrain (Priority 90)',
    driver: 'Bhaben Kalita (+91-98540-11233)',
    safetyScore: '89%',
    mapCenter: [25.65, 92.20],
    mapZoom: 8,
    detourCoordinates: [
      [26.1445, 91.7362], // Guwahati Hub
      [25.9000, 91.8800], // Nongpoh
      [25.5788, 91.8933], // Shillong
      [25.4000, 92.2000], // Jowai
      [25.1000, 92.4000], // Lad Rymbai
      [24.8333, 92.7789]  // Silchar Hub
    ]
  }
};

export const DEFAULT_CONVOY_ID = 'V-102';

import { Language } from '../i18n/translations';

export interface PhaseAdvisory {
  phase: number;
  title: string;
  badge: string;
  badgeClass: string;
  recommendation: string;
  recommendationIcon: string;
  recommendationClass: string;
  description: string;
  rainfall: string;
  slope: string;
  roadStatus: string;
  roadStatusClass: string;
  riskText: string;
  riskClass: string;
  xaiTitle: string;
  xaiFactors: string[];
  alternativeLabel: string;
  alternativeSub: string;
  alternativeOverhead: string;
  alternativeSafety: string;
  convoyStatusText: string;
  convoyStatusBadge: string;
  bannerHeadline: string;
  bannerType: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'DETOUR' | 'RESOLVED';
}

export function getPhaseAdvisory(convoy: ScenarioConvoy, phase: number = 1, lang: Language = 'en'): PhaseAdvisory {
  const isHi = lang === 'hi';
  switch (phase) {
    case 1:
      return {
        phase: 1,
        title: isHi ? 'सामान्य आवागमन आधारभूत स्थिति' : 'Normal Transit Baseline',
        badge: isHi ? 'सामान्य' : 'ALL CLEAR',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        recommendation: isHi ? 'सुरक्षित यात्रा' : 'SAFE TO TRAVEL',
        recommendationIcon: '🟢',
        recommendationClass: 'text-emerald-300',
        description: isHi
          ? `प्राथमिक राजमार्ग ${convoy.primaryRoad} खुला है और सामान्य रूप से सुगम है। ${convoy.sector} में मौसम शांत है।`
          : `Primary highway ${convoy.primaryRoad} is fully open and operating with optimal accessibility. Baseline weather conditions across ${convoy.sector}.`,
        rainfall: isHi ? '42 मिमी / 24 घंटे (सामान्य)' : '42 mm / 24h (Normal)',
        slope: `${convoy.slope} (${isHi ? 'स्थिर' : 'Stable'})`,
        roadStatus: isHi ? 'खुला / सुगम' : 'ACCESSIBLE',
        roadStatusClass: 'text-emerald-400',
        riskText: isHi ? 'कम जोखिम (32%)' : 'LOW (32%)',
        riskClass: 'text-emerald-400',
        xaiTitle: isHi ? 'यह मार्ग वर्तमान में सुरक्षित क्यों है' : 'WHY THIS ROUTE IS CURRENTLY SAFE',
        xaiFactors: isHi ? [
          'वर्षा सुरक्षित जल निकासी सीमा के भीतर है (42 मिमी/24 घंटे)',
          'मिट्टी में नमी और जल संतृप्ति सामान्य स्तर पर है (38%)',
          'पहाड़ी सेंसरों द्वारा कोई ढलान फिसलन या चट्टान गिरना दर्ज नहीं हुआ',
          'सड़क पर यातायात की गति सामान्य रूप से 36 किमी/घंटा है'
        ] : [
          'Precipitation well within safe hydrological drainage threshold (42mm/24h)',
          'Soil pore pressure and moisture saturation nominal (38%)',
          'Zero slope subsidence or boulder movement detected by hill sensors',
          'Traffic velocity normal at 36 km/h with clear carriageway lanes'
        ],
        alternativeLabel: isHi ? 'प्राथमिक मार्ग चालू' : 'PRIMARY ROUTE OPERATIONAL',
        alternativeSub: isHi ? 'वर्तमान परिस्थितियों में बाईपास की आवश्यकता नहीं है' : 'No bypass required under current conditions',
        alternativeOverhead: isHi ? '0 किमी अतिरिक्त' : '0 km overhead',
        alternativeSafety: '98%',
        convoyStatusText: isHi ? `निर्धारित समय पर मार्ग में • प्रस्थान: ${convoy.origin}` : `En Route On Schedule • Departing ${convoy.origin}`,
        convoyStatusBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        bannerHeadline: isHi ? `मार्ग खुला: ${convoy.primaryRoad} सामान्य परिचालन में है` : `ALL CLEAR: ${convoy.primaryRoad} Operating Under Normal Conditions`,
        bannerType: 'NORMAL'
      };
    case 2:
      return {
        phase: 2,
        title: isHi ? 'भारी वर्षा चेतावनी' : 'Severe Rainfall Trigger',
        badge: isHi ? 'मौसम निगरानी' : 'WEATHER WATCH',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        recommendation: isHi ? 'सावधानी से आगे बढ़ें' : 'PROCEED WITH CAUTION',
        recommendationIcon: '🟡',
        recommendationClass: 'text-amber-300',
        description: isHi
          ? `${convoy.sector} में मूसलाधार बारिश (${convoy.rainfall}) दर्ज। सड़क चालू है किंतु जल संतृप्ति बढ़ रही है।`
          : `Torrential downpour (${convoy.rainfall}) detected over ${convoy.sector}. Carriageway remains passable but moisture saturation is surging rapidly.`,
        rainfall: `${convoy.rainfall} (${isHi ? 'बढ़ी हुई' : 'Elevated'})`,
        slope: `${convoy.slope} (${isHi ? 'संतृप्ति निगरानी' : 'Saturation Watch'})`,
        roadStatus: isHi ? 'निगरानी' : 'WATCH',
        roadStatusClass: 'text-amber-400',
        riskText: isHi ? 'मध्यम जोखिम (54%)' : 'MODERATE (54%)',
        riskClass: 'text-amber-400',
        xaiTitle: isHi ? 'प्रारंभिक चेतावनी जोखिम कारक' : 'EARLY WARNING RISK FACTORS',
        xaiFactors: isHi ? [
          `वर्षा दर (${convoy.rainfall}) ने 100 मिमी अलर्ट सीमा पार की`,
          'सतह के नीचे मिट्टी की नमी 38% से बढ़कर 74% हुई',
          'जल निकासी नालियां 85% क्षमता पर बह रही हैं',
          'गति सीमा परामर्श जारी: वाहन की गति 25 किमी/घंटा से कम रखें'
        ] : [
          `Precipitation rate (${convoy.rainfall}) breached 100mm alert threshold`,
          'Subsurface moisture saturation increased from 38% to 74%',
          'Drainage culverts running at 85% maximum hydraulic capacity',
          'Speed restriction advisory dispatched: reduce speed below 25 km/h'
        ],
        alternativeLabel: `${isHi ? 'तैयार' : 'STANDBY'}: ${convoy.bypassRoad.split('(')[0]}`,
        alternativeSub: isHi ? 'सड़क स्थिति बिगड़ने पर तत्काल चालू करने हेतु तैयार' : 'Corridor pre-loaded into router if degradation occurs',
        alternativeOverhead: convoy.bypassOverheadKm,
        alternativeSafety: convoy.safetyScore,
        convoyStatusText: isHi ? 'सावधानीपूर्वक आगे बढ़ रहा है • चालक को जीपीएस द्वारा सूचित किया गया' : `Proceeding with caution • Driver alerted via AIS-140 GPS`,
        convoyStatusBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        bannerHeadline: isHi ? `मौसम निगरानी: ${convoy.primaryRoad.split('(')[0]} पर भारी वर्षा (${convoy.rainfall})` : `WEATHER WATCH: Severe Downpour (${convoy.rainfall}) on ${convoy.primaryRoad.split('(')[0]}`,
        bannerType: 'WATCH'
      };
    case 3:
      return {
        phase: 3,
        title: isHi ? 'आपदा जोखिम वृद्धि' : 'Disruption Risk Escalation',
        badge: isHi ? 'जोखिम वृद्धि' : 'HAZARD ESCALATION',
        badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        recommendation: isHi ? 'मार्ग परिवर्तन हेतु तैयार' : 'STANDBY FOR REROUTE',
        recommendationIcon: '🟠',
        recommendationClass: 'text-orange-300',
        description: isHi
          ? `${convoy.slope} पर मिट्टी की जल संतृप्ति 88% तक पहुंच गई। ${convoy.disasterType} की 68% उच्च संभावना।`
          : `Soil pore saturation reached 88% on ${convoy.slope}. Predictive models indicate high probability (68%) of impending ${convoy.disasterType}.`,
        rainfall: `${convoy.rainfall} (${isHi ? 'गंभीर' : 'Critical'})`,
        slope: `${convoy.slope} (${isHi ? 'उच्च भूस्खलन जोखिम' : 'High Shear Risk'})`,
        roadStatus: isHi ? 'उच्च जोखिम' : 'HIGH RISK',
        roadStatusClass: 'text-orange-400',
        riskText: isHi ? 'बढ़ा हुआ जोखिम (68%)' : 'ELEVATED (68%)',
        riskClass: 'text-orange-400',
        xaiTitle: isHi ? 'पूर्वानुमानित आपदा कारक' : 'PREDICTIVE COLLAPSE FACTORS',
        xaiFactors: isHi ? [
          `तीव्र ${convoy.slope} ढलान के साथ 88% मिट्टी संतृप्ति`,
          'पूर्व संवेदनशीलता: इस क्षेत्र में पूर्व में भूस्खलन दर्ज',
          'ढलान सेंसर सूक्ष्म दरारों के विस्तार का संकेत दे रहे हैं',
          'काफिले को फंसने से बचाने हेतु सुरक्षित ठहराव स्थल पर रोकने की सलाह'
        ] : [
          `Soil saturation at 88% combined with steep ${convoy.slope} gradient`,
          `Historical vulnerability: 9 previous landslide/flood incidents recorded`,
          'Early slope displacement sensors indicate micro-fissure expansion',
          'Pre-clearing standby diversion corridor to prevent convoy stranding'
        ],
        alternativeLabel: `${isHi ? 'पूर्वनिर्धारित' : 'PRE-CALCULATED'}: ${convoy.bypassRoad.split('(')[0]}`,
        alternativeSub: `${convoy.bypassSub} (${isHi ? 'त्वरित सक्रियण हेतु तैयार' : 'Ready for instantaneous activation'})`,
        alternativeOverhead: `${convoy.bypassOverheadKm}, ${convoy.bypassOverheadTime}`,
        alternativeSafety: convoy.safetyScore,
        convoyStatusText: isHi ? 'सुरक्षित ठहराव केंद्र पर प्रतीक्षारत • अनुमति की प्रतीक्षा' : `Holding at Safe Staging Post • Awaiting clearance or divert`,
        convoyStatusBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        bannerHeadline: isHi ? `आपदा चेतावनी: ${convoy.blockedRoad} पर अवरोध की उच्च संभावना (68%)` : `HAZARD WARNING: High Disruption Probability (68%) on ${convoy.blockedRoad}`,
        bannerType: 'WARNING'
      };
    case 4:
      return {
        phase: 4,
        title: isHi ? 'मार्ग पूर्णतः अवरुद्ध' : 'Corridor Blocked',
        badge: isHi ? 'गंभीर संकट' : 'CRITICAL DISRUPTION',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        recommendation: isHi ? 'यात्रा न करें - मार्ग बंद' : 'DO NOT TRAVEL',
        recommendationIcon: '🔴',
        recommendationClass: 'text-rose-300',
        description: isHi
          ? `${convoy.blockedRoad} पर ${convoy.disasterType} के कारण आवागमन पूर्णतः ठप। भारी वाहन रोके गए; मानचित्र पर लाल रेखा।`
          : `${convoy.blockedRoad} is completely impassable due to ${convoy.disasterType}. Heavy transport blocked; route painted RED on GIS map.`,
        rainfall: convoy.rainfall,
        slope: convoy.slope,
        roadStatus: isHi ? 'अवरुद्ध (बंद)' : 'BLOCKED',
        roadStatusClass: 'text-rose-400',
        riskText: isHi ? 'अत्यधिक जोखिम (91%)' : 'VERY HIGH (91%)',
        riskClass: 'text-rose-400',
        xaiTitle: isHi ? 'मार्ग अवरुद्ध होने के कारण' : 'WHY THIS ROUTE IS IMPASSABLE',
        xaiFactors: isHi ? [
          `भौतिक मार्ग अवरोध: ${convoy.disasterType}`,
          `${convoy.rainfall} संतृप्ति सीमा पूर्णतः टूट चुकी है`,
          'फील्ड अधिकारियों और उपग्रह सेंसर द्वारा पुष्टि',
          'मलबे की सफाई पूरी होने तक भारी वाहनों का प्रवेश पूर्णतः प्रतिबंधित'
        ] : [
          `Massive physical carriageway disruption: ${convoy.disasterType}`,
          `${convoy.rainfall} saturation threshold completely breached`,
          'Ground verification confirmed by field officers and GIS telemetry',
          'Heavy logistics transit strictly prohibited until BRO clears debris'
        ],
        alternativeLabel: `${isHi ? 'अनुशंसित बाईपास' : 'RECOMMENDED BYPASS'}: ${convoy.bypassRoad.split('(')[0]}`,
        alternativeSub: convoy.bypassSub,
        alternativeOverhead: `${convoy.bypassOverheadKm}, ${convoy.bypassOverheadTime}`,
        alternativeSafety: convoy.safetyScore,
        convoyStatusText: isHi ? 'सुरक्षित पोस्ट पर रोका गया • आपातकालीन डायवर्जन लंबित' : `Halted at Safe Post • Emergency reroute decision pending`,
        convoyStatusBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        bannerHeadline: convoy.disasterHeadline,
        bannerType: 'CRITICAL'
      };
    case 5:
      return {
        phase: 5,
        title: isHi ? 'एआई बाईपास मार्ग गणना' : 'AI Detour Calculation',
        badge: isHi ? 'बाईपास तैयार' : 'AI DETOUR READY',
        badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        recommendation: isHi ? 'एआई बाईपास मार्ग अपनाएं' : 'EXECUTE AI DETOUR',
        recommendationIcon: '🟣',
        recommendationClass: 'text-purple-300',
        description: isHi
          ? `एआई प्रणाली ने ${convoy.bypassRoad} द्वारा अनुकूलतम बाईपास बनाया। जोखिम 91% से घटकर 24% हुआ।`
          : `Multi-criteria router generated optimal bypass via ${convoy.bypassRoad}. Risk reduced from 91% to 24%; clearance dispatched.`,
        rainfall: isHi ? 'सुगम गलियारा' : 'Passable Corridor',
        slope: isHi ? 'सुरक्षित पहाड़ी कटक' : 'Secured Ridge Corridor',
        roadStatus: isHi ? 'बाईपास तैयार' : 'AI DETOUR READY',
        roadStatusClass: 'text-purple-400',
        riskText: isHi ? 'कम जोखिम (24%)' : 'LOW RISK (24%)',
        riskClass: 'text-emerald-400',
        xaiTitle: isHi ? 'एआई बहु-मापदंड मूल्यांकन कारक' : 'MULTI-CRITERIA ROUTER EVALUATION',
        xaiFactors: isHi ? [
          `सुरक्षा स्कोर: ${convoy.safetyScore} (आपदा क्षेत्र से पूर्णतः सुरक्षित)`,
          `नियंत्रित अतिरिक्त दूरी: ${convoy.bypassOverheadKm}, ${convoy.bypassOverheadTime}`,
          'पुल भार क्षमता एवं सड़क चौड़ाई भारी वाहनों के अनुकूल सत्यापित',
          'काफिले को संकीर्ण दर्रे में प्रवेश से पूर्व ही सफलतापूर्वक मोड़ दिया गया'
        ] : [
          `Safety Score: ${convoy.safetyScore} (Completely circumvents active hazard area)`,
          `Controlled Overhead: ${convoy.bypassOverheadKm} additional distance, ${convoy.bypassOverheadTime}`,
          'Bridge Class & Carriageway Width: Verified compatible with heavy vehicle axle load',
          `Turnaround Point: Convoy redirected before entering single-lane mountain defile`
        ],
        alternativeLabel: `🟣 ${convoy.bypassRoad}`,
        alternativeSub: `${convoy.bypassSub} (${isHi ? 'मानचित्र पर बाईपास सक्रिय' : 'Detour corridor active on map'})`,
        alternativeOverhead: `${convoy.bypassOverheadKm}, ${convoy.bypassOverheadTime}`,
        alternativeSafety: convoy.safetyScore,
        convoyStatusText: isHi ? `नए मार्ग के निर्देशांक चालक ${convoy.driver.split('(')[0]} को प्रेषित` : `Divert coordinates transmitted to driver ${convoy.driver.split('(')[0]}`,
        convoyStatusBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        bannerHeadline: isHi ? `एआई बाईपास सक्रिय: काफिला ${convoy.id} को ${convoy.bypassRoad.split('(')[0]} से मोड़ा जा रहा है` : `AI DETOUR ACTIVE: Rerouting Convoy ${convoy.id} via ${convoy.bypassRoad.split('(')[0]}`,
        bannerType: 'DETOUR'
      };
    case 6:
    default:
      return {
        phase: 6,
        title: isHi ? 'संकट समाधान व सुरक्षित काफिला' : 'Crisis Resolved & Convoy Safe',
        badge: isHi ? 'काफिला सुरक्षित' : 'CONVOY SAFE',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        recommendation: isHi ? 'सुरक्षित आवागमन बहाल' : 'TRANSIT SECURED',
        recommendationIcon: '🟢',
        recommendationClass: 'text-emerald-300',
        description: isHi
          ? `काफिला ${convoy.id} सफलता पूर्वक ${convoy.bypassRoad} पर सुरक्षित मोड़ दिया गया। महत्वपूर्ण सामग्री सुरक्षित।`
          : `Convoy ${convoy.id} successfully diverted onto ${convoy.bypassRoad}. Life-saving cargo transit secured avoiding the disaster zone.`,
        rainfall: isHi ? 'संरक्षित मार्ग' : 'Protected Route',
        slope: isHi ? 'स्थिर कटक मार्ग' : 'Stable Crest Route',
        roadStatus: `${isHi ? 'मार्ग:' : 'ON'} ${convoy.bypassRoad.split('(')[0]}`,
        roadStatusClass: 'text-emerald-400',
        riskText: isHi ? 'सुरक्षित (24%)' : 'SAFE (24%)',
        riskClass: 'text-emerald-400',
        xaiTitle: isHi ? 'मिशन सुरक्षा एवं सफलता सत्यापन' : 'MISSION SUCCESS ASSURANCE',
        xaiFactors: isHi ? [
          `शून्य नुकसान: महत्वपूर्ण आपूर्ति (${convoy.cargo.split('(')[0]}) पूर्णतः सुरक्षित`,
          `${convoy.blockedRoad} के अवरोध को बिना किसी वाहन के फंसे बाईपास किया गया`,
          `नियोजित आगमन समय सुनिश्चित (+${convoy.bypassOverheadTime})`,
          'जीपीएस टेलीमैटिक्स द्वारा नए मार्ग पर सुरक्षित आवागमन सत्यापित'
        ] : [
          `Zero-loss delivery: Critical cargo (${convoy.cargo.split('(')[0]}) completely protected`,
          `Impassable roadblock at ${convoy.blockedRoad} bypassed with 0 stranded vehicles`,
          `Controlled transit time: Scheduled arrival guaranteed (+${convoy.bypassOverheadTime})`,
          'Telematics verified: Convoy GPS pinging green along bypass waypoints'
        ],
        alternativeLabel: `🟢 ${convoy.bypassRoad}`,
        alternativeSub: `${convoy.bypassSub} (${isHi ? 'काफिला बाईपास मार्ग पर अग्रसर' : 'Convoy actively navigating bypass'})`,
        alternativeOverhead: `${convoy.bypassOverheadKm}, ${convoy.bypassOverheadTime}`,
        alternativeSafety: convoy.safetyScore,
        convoyStatusText: isHi ? 'सुरक्षित डायवर्ट • गंतव्य की ओर अग्रसर' : `Diverted & Safe • En Route to Destination`,
        convoyStatusBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        bannerHeadline: isHi ? `संकट समाधान: काफिला ${convoy.id} सुरक्षित रूप से ${convoy.bypassRoad.split('(')[0]} से गुजर रहा है` : `CONTINGENCY RESOLVED: Convoy ${convoy.id} Safely Diverted via ${convoy.bypassRoad.split('(')[0]}`,
        bannerType: 'RESOLVED'
      };
  }
}
