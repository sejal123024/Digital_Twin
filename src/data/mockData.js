/**
 * Mira Road Digital Twin - Mock / Demo Data
 * All metrics in this file are explicitly labeled as DEMO data.
 * Adheres to Master Prompt guidelines: No fabricated sensor data claimed as live.
 */

export const MIRA_ROAD_LOCALITIES = [
  {
    id: 'shanti-nagar',
    name: 'Shanti Nagar, Mira Road',
    sector: 'Sector 1-11',
    coordinates: { lat: 19.2812, lon: 72.8561 },
    zoom: 14.5,
    pitch: 55,
    bearing: -15,
    description: 'Central residential and commercial hub, high pedestrian movement near Shanti Nagar bus terminal.'
  },
  {
    id: 'kanakia-beverly',
    name: 'Beverly Park / Kanakia',
    sector: 'Kanakia Hub',
    coordinates: { lat: 19.2890, lon: 72.8640 },
    zoom: 14.8,
    pitch: 58,
    bearing: 10,
    description: 'Dense residential township and educational cluster with multiple arterial access points.'
  },
  {
    id: 'naya-nagar',
    name: 'Naya Nagar',
    sector: 'Railway Station West Area',
    coordinates: { lat: 19.2855, lon: 72.8520 },
    zoom: 15.0,
    pitch: 52,
    bearing: -25,
    description: 'High-density commercial precinct bordering Western Railway suburban rail corridor.'
  },
  {
    id: 'silver-park',
    name: 'Silver Park / Hatkesh',
    sector: 'Mira-Bhayandar Road Corridor',
    coordinates: { lat: 19.2785, lon: 72.8660 },
    zoom: 14.6,
    pitch: 56,
    bearing: 5,
    description: 'Major arterial transit junction with high mixed commercial & transit vehicle density.'
  },
  {
    id: 'pleasant-park',
    name: 'Pleasant Park / GCC Club',
    sector: 'Mira Road East Outer',
    coordinates: { lat: 19.2740, lon: 72.8680 },
    zoom: 14.5,
    pitch: 50,
    bearing: 0,
    description: 'Green residential stretch with recreational corridor connecting towards Ghodbunder.'
  },
  {
    id: 'weh-junction',
    name: 'Kashimira / WEH Junction',
    sector: 'Western Express Highway Arterial',
    coordinates: { lat: 19.2680, lon: 72.8710 },
    zoom: 14.2,
    pitch: 60,
    bearing: 20,
    description: 'Key strategic gateway connecting Mumbai Suburban District to Mira-Bhayandar.'
  },
  {
    id: 'bhayandar-east',
    name: 'Bhayandar East (Goddev)',
    sector: 'Municipal Zone East',
    coordinates: { lat: 19.3015, lon: 72.8540 },
    zoom: 14.4,
    pitch: 54,
    bearing: -10,
    description: 'Administrative & industrial-commercial zone north of railway creek crossing.'
  },
  {
    id: 'bhayandar-west',
    name: 'Bhayandar West (Maxus)',
    sector: 'Coastal Coastal Sub-zone',
    coordinates: { lat: 19.3080, lon: 72.8390 },
    zoom: 14.4,
    pitch: 52,
    bearing: 15,
    description: 'Retail and residential sub-district bordering creek wetlands and coastal highway.'
  }
];

export const DEMO_TRAFFIC_DATA = {
  isDemo: true,
  providerLabel: 'Simulated Urban Flow Model [DEMO]',
  timestamp: 'Just now (Simulated)',
  overallCongestionIndex: 68, // percent
  congestionLevel: 'Moderate to High',
  statusColor: '#f59e0b',
  averageSpeedKmph: 22.4,
  freeFlowSpeedKmph: 45.0,
  activeIncidentsCount: 3,
  corridors: [
    { name: 'Mira-Bhayandar Rd (Silver Park to Station)', congestion: 78, speed: 16, status: 'Heavy', color: '#ef4444' },
    { name: 'Western Express Hwy (Kashimira Flyover)', congestion: 64, speed: 28, status: 'Moderate', color: '#f59e0b' },
    { name: 'Kanakia Road (Beverly Park Corridor)', congestion: 52, speed: 24, status: 'Moderate', color: '#f59e0b' },
    { name: 'Shanti Park Internal Bypass', congestion: 38, speed: 32, status: 'Fluid', color: '#10b981' }
  ],
  hourlyFlowTrend: [
    { time: '06:00', volume: 2200, speed: 38 },
    { time: '08:00', volume: 6800, speed: 19 },
    { time: '10:00', volume: 8100, speed: 15 },
    { time: '12:00', volume: 4900, speed: 26 },
    { time: '14:00', volume: 4600, speed: 29 },
    { time: '16:00', volume: 5800, speed: 22 },
    { time: '18:00', volume: 8900, speed: 13 },
    { time: '20:00', volume: 7600, speed: 18 },
    { time: '22:00', volume: 3800, speed: 32 }
  ]
};

export const DEMO_AIR_QUALITY_DATA = {
  isDemo: true,
  providerLabel: 'Atmospheric Dispersion Model [DEMO]',
  timestamp: 'Last hour (Simulated)',
  aqiValue: 132,
  aqiCategory: 'Moderate',
  categoryColor: '#f59e0b',
  primaryPollutant: 'PM2.5',
  pollutants: [
    { name: 'PM2.5', value: 48.2, unit: 'µg/m³', limit: 60, status: 'Moderate' },
    { name: 'PM10', value: 92.5, unit: 'µg/m³', limit: 100, status: 'Moderate' },
    { name: 'NO₂', value: 34.1, unit: 'µg/m³', limit: 80, status: 'Good' },
    { name: 'O₃', value: 42.0, unit: 'µg/m³', limit: 100, status: 'Good' },
    { name: 'SO₂', value: 12.8, unit: 'µg/m³', limit: 80, status: 'Good' },
    { name: 'CO', value: 1.1, unit: 'mg/m³', limit: 4, status: 'Good' }
  ],
  forecast24h: [
    { time: '+2h', aqi: 136, cat: 'Moderate' },
    { time: '+6h', aqi: 148, cat: 'Moderate' },
    { time: '+12h', aqi: 115, cat: 'Moderate' },
    { time: '+18h', aqi: 95, cat: 'Satisfactory' },
    { time: '+24h', aqi: 125, cat: 'Moderate' }
  ]
};

export const DEMO_WEATHER_DATA = {
  isDemo: true,
  providerLabel: 'ECMWF / Open-Meteo Synth [DEMO]',
  timestamp: 'Current (Simulated)',
  temperature: 31.4,
  apparentTemperature: 36.2,
  humidity: 74,
  precipitationMm: 0.0,
  precipitationProbability: 15,
  windSpeedKmph: 14.8,
  windDirectionDeg: 245,
  windDirectionLabel: 'WSW',
  uvIndex: 7.2,
  condition: 'Partly Cloudy',
  cloudCoverPercent: 42,
  visibilityKm: 6.5
};

export const DEMO_AI_INSIGHTS = [
  {
    id: 'ins-1',
    isDemo: true,
    title: 'Arterial Congestion Surge Anticipated',
    category: 'Traffic Mobility',
    severity: 'high',
    location: 'Silver Park → Kashimira WEH Junction',
    supportingMeasurements: 'Flow Volume > 7,800 PCU/hr, Avg Speed dropped to 14 km/h',
    source: 'Rule Engine: Corridor Speed Threshold [DEMO]',
    timestamp: '10 mins ago',
    confidence: '88% (High)',
    suggestedAction: 'Activate adaptive signal sync at Hatkesh junction and divert light vehicles to Shanti Park bypass.',
    badgeClass: 'high'
  },
  {
    id: 'ins-2',
    isDemo: true,
    title: 'Elevated Particulate Trapping in Dense Canopy',
    category: 'Environmental Health',
    severity: 'medium',
    location: 'Shanti Nagar Sector 3 to Sector 6',
    supportingMeasurements: 'PM2.5: 54 µg/m³ with wind speed < 8 km/h and high relative humidity (78%)',
    source: 'Rule Engine: Dispersion Stagnation Indicator [DEMO]',
    timestamp: '25 mins ago',
    confidence: '79% (Moderate)',
    suggestedAction: 'Schedule mist cannon anti-smog deployment along central spine road between 17:00 and 20:00.',
    badgeClass: 'medium'
  },
  {
    id: 'ins-3',
    isDemo: true,
    title: 'Suburban Rail Transit Feeder Optimization',
    category: 'Public Transit',
    severity: 'info',
    location: 'Mira Road Railway Station East Forecourt',
    supportingMeasurements: 'Peak feeder headway variance: ±6.4 mins during evening interchange window',
    source: 'Rule Engine: Transit Timetable Feeder Sync [DEMO]',
    timestamp: '42 mins ago',
    confidence: '92% (High)',
    suggestedAction: 'Reposition MBMT bus dispatch intervals at station bay 2 to match fast local arrivals.',
    badgeClass: 'info'
  }
];

export const DEMO_BOTTOM_METRICS = [
  {
    title: 'Weather Summary',
    value: '31.4°C',
    sub: 'Humidity 74% • Partly Cloudy [DEMO]',
    status: 'neutral'
  },
  {
    title: 'Mobility Network',
    value: '22.4 km/h',
    sub: 'Arterial avg speed • 68% load [DEMO]',
    status: 'warning'
  },
  {
    title: 'Suburban Transit',
    value: '3.4 min',
    sub: 'Avg peak feeder wait time [DEMO]',
    status: 'good'
  },
  {
    title: 'Air Quality (AQI)',
    value: '132',
    sub: 'PM2.5: 48 µg/m³ • Moderate [DEMO]',
    status: 'warning'
  },
  {
    title: 'Active Sensor Nodes',
    value: '48 / 52',
    sub: '92.3% telemetry online [DEMO]',
    status: 'good'
  },
  {
    title: 'Incident Queue',
    value: '3 Active',
    sub: 'Hatkesh, Kashimira, Station E [DEMO]',
    status: 'alert'
  }
];

export const SIDEBAR_NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',           icon: 'LayoutDashboard' },
  { id: 'mobility',    label: 'Mobility & Traffic',  icon: 'Car'             },
  { id: 'transit',     label: 'Public Transport',    icon: 'Bus'             },
  { id: 'infrastructure', label: 'Infrastructure',   icon: 'Workflow'        },
  { id: 'environment', label: 'Environment & AQI',   icon: 'Leaf'            },
  { id: 'buildings',   label: '3D Buildings',        icon: 'Building2'       },
  { id: 'energy',      label: 'Energy & Grid',       icon: 'Zap'             },
  { id: 'safety',      label: 'Safety & Security',   icon: 'ShieldAlert'     },
  { id: 'economy',     label: 'Economy & Retail',    icon: 'TrendingUp'      },
  { id: 'citizen',     label: 'Citizen Experience',  icon: 'Users'           },
  { id: 'insights',    label: 'AI Insights Engine',  icon: 'Cpu'             },
  { id: 'admin',       label: 'Admin Panel',         icon: 'ShieldCheck'     }
];
