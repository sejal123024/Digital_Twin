import express from 'express';
import { fetchWeather, fetchAirQuality } from '../services/openMeteoService.js';
import { getTrafficFlow } from '../services/hereTrafficService.js';
import { getTomTomTrafficFlow } from '../services/tomtomTrafficService.js';
import { reverseGeocode } from '../services/geocodingService.js';
import {
  getTransitData,
  getInfrastructureData,
  getEnergyData,
  getSafetyData,
  getEconomyData,
  getCivicData
} from '../services/osmOverpassService.js';
import { generateInsights } from '../services/aiInsightService.js';

const router = express.Router();
const startTime = Date.now();

/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  const hasTomTomKey = Boolean(process.env.TOMTOM_API_KEY && process.env.TOMTOM_API_KEY.trim() !== '');
  const hasHereKey = Boolean(process.env.HERE_API_KEY && process.env.HERE_API_KEY.trim() !== '' && process.env.HERE_API_KEY !== 'your_here_api_key_here');

  const trafficProvider = hasTomTomKey
    ? 'TomTom Traffic API (Flow & Incidents)'
    : hasHereKey
    ? 'HERE Traffic v7 Flow API'
    : 'Simulated Urban Flow Model';

  res.json({
    status: 'healthy',
    system: 'Mira Road Digital Twin API Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round((Date.now() - startTime) / 1000),
    services: {
      weather: { status: 'online', provider: 'Open-Meteo Weather API', mode: 'live_proxy' },
      airQuality: { status: 'online', provider: 'Open-Meteo CAMS Air Quality API', mode: 'live_proxy' },
      traffic: {
        status: (hasTomTomKey || hasHereKey) ? 'online' : 'fallback_simulation',
        provider: trafficProvider,
        mode: (hasTomTomKey || hasHereKey) ? 'live' : 'demo_fallback',
        keyConfigured: hasTomTomKey || hasHereKey
      },
      osm: { status: 'online', provider: 'OpenStreetMap Overpass API', mode: 'live_query' },
      geocoding: { status: 'online', provider: 'Nominatim / OSM', mode: 'live_proxy' },
      insights: { status: 'online', provider: 'Deterministic Rule Engine v2.0', mode: 'computed' }
    }
  });
});

/**
 * Weather Proxy Endpoint
 * GET /api/weather?lat=19.2812&lon=72.8561
 */
router.get('/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const data = await fetchWeather(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to retrieve weather from Open-Meteo provider', message: err.message });
  }
});

/**
 * Air Quality Proxy Endpoint
 * GET /api/air-quality?lat=19.2812&lon=72.8561
 */
router.get('/air-quality', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const data = await fetchAirQuality(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to retrieve air quality from Open-Meteo CAMS provider', message: err.message });
  }
});

/**
 * Traffic Endpoint (TomTom / HERE Traffic Multi-Provider Adapter)
 * GET /api/traffic?lat=19.2812&lon=72.8561&radius=3500
 */
router.get('/traffic', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 3500;

    const tomtomKey = process.env.TOMTOM_API_KEY;
    if (tomtomKey) {
      try {
        const data = await getTomTomTrafficFlow(lat, lon);
        return res.json(data);
      } catch (tomtomErr) {
        console.warn('[Traffic Router]: TomTom fetch failed, falling back:', tomtomErr.message);
      }
    }

    const data = await getTrafficFlow(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve traffic telemetry', message: err.message });
  }
});

/**
 * Geocoding / Reverse Geocode Endpoint
 * GET /api/geocode?lat=19.2812&lon=72.8561
 */
router.get('/geocode', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'lat and lon query parameters are required' });
    }
    const data = await reverseGeocode(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Geocoding service error', message: err.message });
  }
});

/**
 * OSM Transit Data Endpoint
 * GET /api/osm/transit?lat=19.2812&lon=72.8561&radius=1500
 */
router.get('/osm/transit', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 1500;
    const data = await getTransitData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Transit OSM query failed', message: err.message });
  }
});

/**
 * OSM Infrastructure Data Endpoint
 * GET /api/osm/infrastructure?lat=19.2812&lon=72.8561&radius=1200
 */
router.get('/osm/infrastructure', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 1200;
    const data = await getInfrastructureData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Infrastructure OSM query failed', message: err.message });
  }
});

/**
 * OSM Energy Data Endpoint
 * GET /api/osm/energy?lat=19.2812&lon=72.8561&radius=3000
 */
router.get('/osm/energy', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 3000;
    const data = await getEnergyData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Energy OSM query failed', message: err.message });
  }
});

/**
 * OSM Safety Data Endpoint
 * GET /api/osm/safety?lat=19.2812&lon=72.8561&radius=2500
 */
router.get('/osm/safety', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 2500;
    const data = await getSafetyData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Safety OSM query failed', message: err.message });
  }
});

/**
 * OSM Economy Data Endpoint
 * GET /api/osm/economy?lat=19.2812&lon=72.8561&radius=1000
 */
router.get('/osm/economy', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 1000;
    const data = await getEconomyData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Economy OSM query failed', message: err.message });
  }
});

/**
 * OSM Civic / Citizen Data Endpoint
 * GET /api/osm/civic?lat=19.2812&lon=72.8561&radius=1200
 */
router.get('/osm/civic', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 19.2812;
    const lon = parseFloat(req.query.lon) || 72.8561;
    const radius = parseInt(req.query.radius, 10) || 1200;
    const data = await getCivicData(lat, lon, radius);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Civic OSM query failed', message: err.message });
  }
});

/**
 * AI Insights Endpoint — evidence-grounded cross-domain insight synthesis
 * POST /api/insights
 * Body: { lat, lon, locationName, traffic, weather, airQuality, transit, safety, energy }
 * NOTE: synthesizes only from the data provided in the body — do not make blocking OSM calls here.
 */
router.post('/insights', (req, res) => {
  try {
    const { lat, lon, locationName, traffic, weather, airQuality, transit, safety, energy } = req.body;

    const insights = generateInsights({
      traffic: traffic || null,
      weather: weather || null,
      airQuality: airQuality || null,
      transit: transit || null,
      safety: safety || null,
      energy: energy || null,
      selectedLocation: { name: locationName || 'Mira Road, Maharashtra' }
    });

    res.json({
      source: 'Deterministic Rule Engine v2.0 — Verified Live Sensors',
      timestamp: new Date().toISOString(),
      location: locationName || 'Mira Road, Maharashtra',
      insightCount: insights.length,
      insights
    });
  } catch (err) {
    res.status(500).json({ error: 'Insight synthesis failed', message: err.message });
  }
});

export default router;
