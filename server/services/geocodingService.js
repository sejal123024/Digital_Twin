/**
 * Geocoding & Reverse Geocoding Service for Mira Road
 * Resolves clicked coordinates on the map to real street names, neighbourhoods, and boundaries
 * using OpenStreetMap Nominatim with caching and local corridor fallback.
 */

const geocodeCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Local geographic anchors in Mira Road for rapid snapping and offline resilience
const MIRA_ROAD_ANCHORS = [
  { name: 'Shanti Nagar', road: 'Shanti Nagar Main Road', lat: 19.2812, lon: 72.8561, radius: 600 },
  { name: 'Beverly Park / Kanakia', road: 'Kanakia Road', lat: 19.2890, lon: 72.8640, radius: 700 },
  { name: 'Naya Nagar', road: 'Station Road West', lat: 19.2855, lon: 72.8520, radius: 600 },
  { name: 'Silver Park / Hatkesh', road: 'Mira-Bhayandar Road', lat: 19.2785, lon: 72.8660, radius: 700 },
  { name: 'Kashimira / WEH', road: 'Western Express Highway (NH 48)', lat: 19.2680, lon: 72.8710, radius: 900 },
  { name: 'Pleasant Park', road: 'GCC Club Road', lat: 19.2740, lon: 72.8680, radius: 650 },
  { name: 'Bhayandar East (Goddev)', road: 'Goddev Road', lat: 19.3015, lon: 72.8540, radius: 800 },
  { name: 'Bhayandar West (Maxus)', road: 'Maxus Mall Road', lat: 19.3080, lon: 72.8390, radius: 800 }
];

/**
 * Reverse geocode latitude and longitude to street and neighbourhood
 */
export async function reverseGeocode(lat, lon) {
  const cacheKey = `${parseFloat(lat).toFixed(4)},${parseFloat(lon).toFixed(4)}`;
  const now = Date.now();

  if (geocodeCache.has(cacheKey)) {
    const entry = geocodeCache.get(cacheKey);
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MiraRoadDigitalTwin/2.0 (mira-road-digital-twin@analytics.local)',
        'Accept-Language': 'en'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.footway || addr.path || 'Local Corridor';
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || 'Mira Road';
      const city = addr.city || addr.town || addr.municipality || 'Mira-Bhayandar';

      const result = {
        streetName: road,
        neighbourhood: suburb,
        city,
        formattedAddress: data.display_name || `${road}, ${suburb}, ${city}`,
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
        boundingbox: data.boundingbox ? data.boundingbox.map(Number) : null,
        source: 'OpenStreetMap Nominatim',
        timestamp: new Date().toISOString()
      };

      geocodeCache.set(cacheKey, { timestamp: now, data: result });
      return result;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Reverse Geocode Warning]: Nominatim lookup failed, using local anchor interpolation:', err.message);
  }

  // Fallback: Find closest local anchor in Mira Road
  let closest = MIRA_ROAD_ANCHORS[0];
  let minDiff = 999999;

  for (const anchor of MIRA_ROAD_ANCHORS) {
    const diff = Math.hypot(lat - anchor.lat, lon - anchor.lon);
    if (diff < minDiff) {
      minDiff = diff;
      closest = anchor;
    }
  }

  const fallbackResult = {
    streetName: closest.road,
    neighbourhood: closest.name,
    city: 'Mira-Bhayandar, Maharashtra',
    formattedAddress: `${closest.road}, ${closest.name}, Mira Road`,
    coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
    source: 'Local Spatial Corridor Reference (Offline)',
    timestamp: new Date().toISOString()
  };

  geocodeCache.set(cacheKey, { timestamp: now, data: fallbackResult });
  return fallbackResult;
}
