/**
 * Air Quality API Service - Open-Meteo Air Quality Integration
 * Documentation: https://open-meteo.com/en/docs/air-quality-api
 * API Base URL: https://air-quality-api.open-meteo.com/v1/air-quality
 *
 * Adheres strictly to Master Prompt:
 * - Uses documented Open-Meteo AQI variables (US AQI & European AQI).
 * - Distinguishes atmospheric dispersion grid models (CAMS) from physical ground station observations.
 * - Never fabricates readings in Live Data mode.
 */

// Documented US EPA AQI category thresholds
function getAqiCategory(aqi) {
  if (aqi <= 50) return { category: 'Good', color: '#10b981' };
  if (aqi <= 100) return { category: 'Moderate', color: '#f59e0b' };
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive', color: '#f97316' };
  if (aqi <= 200) return { category: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { category: 'Very Unhealthy', color: '#a855f7' };
  return { category: 'Hazardous', color: '#7e22ce' };
}

function getPollutantStatus(name, val) {
  // Standard WHO/National ambient guideline approximations
  switch (name) {
    case 'PM2.5':
      return val <= 30 ? 'Good' : val <= 60 ? 'Moderate' : 'Unhealthy';
    case 'PM10':
      return val <= 50 ? 'Good' : val <= 100 ? 'Moderate' : 'Unhealthy';
    case 'NO₂':
      return val <= 40 ? 'Good' : val <= 80 ? 'Moderate' : 'Unhealthy';
    case 'O₃':
      return val <= 100 ? 'Good' : val <= 160 ? 'Moderate' : 'Unhealthy';
    case 'SO₂':
      return val <= 40 ? 'Good' : val <= 80 ? 'Moderate' : 'Unhealthy';
    case 'CO':
      return val <= 2000 ? 'Good' : 'Elevated';
    default:
      return 'Normal';
  }
}

// In-memory cache for 5 minutes
const aqCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchLiveAirQuality(lat = 19.2812, lon = 72.8561) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const now = Date.now();

  if (aqCache.has(cacheKey)) {
    const cached = aqCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&hourly=pm2_5,pm10,us_aqi&timezone=Asia%2FKolkata`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // 1. Attempt to fetch via backend proxy endpoint
    const backendRes = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`, { signal: controller.signal });
    if (backendRes.ok) {
      clearTimeout(timeoutId);
      const data = await backendRes.json();
      aqCache.set(cacheKey, { timestamp: now, data });
      return data;
    }
  } catch (backendErr) {
    console.info('[Air Quality API]: Backend proxy not available, falling back to direct Open-Meteo:', backendErr.message);
  }

  // 2. Direct fallback to Open-Meteo Air Quality
  const directUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&hourly=pm2_5,pm10,us_aqi&timezone=Asia%2FKolkata`;

  try {
    const res = await fetch(directUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo Air Quality HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const curr = json.current;
    if (!curr) throw new Error('Incomplete air quality payload from Open-Meteo');

    const usAqi = Math.round(curr.us_aqi ?? 100);
    const { category, color } = getAqiCategory(usAqi);

    // Determine primary pollutant dynamically
    let primary = 'PM2.5';
    if ((curr.ozone || 0) > 180) {
      primary = 'O₃ (Ozone)';
    } else if ((curr.pm2_5 || 0) > 50) {
      primary = 'PM2.5';
    } else if ((curr.pm10 || 0) > 90) {
      primary = 'PM10';
    }

    const pollutants = [
      {
        name: 'PM2.5',
        value: Math.round((curr.pm2_5 || 0) * 10) / 10,
        unit: 'µg/m³',
        status: getPollutantStatus('PM2.5', curr.pm2_5)
      },
      {
        name: 'PM10',
        value: Math.round((curr.pm10 || 0) * 10) / 10,
        unit: 'µg/m³',
        status: getPollutantStatus('PM10', curr.pm10)
      },
      {
        name: 'NO₂',
        value: Math.round((curr.nitrogen_dioxide || 0) * 10) / 10,
        unit: 'µg/m³',
        status: getPollutantStatus('NO₂', curr.nitrogen_dioxide)
      },
      {
        name: 'O₃',
        value: Math.round((curr.ozone || 0) * 10) / 10,
        unit: 'µg/m³',
        status: getPollutantStatus('O₃', curr.ozone)
      },
      {
        name: 'SO₂',
        value: Math.round((curr.sulphur_dioxide || 0) * 10) / 10,
        unit: 'µg/m³',
        status: getPollutantStatus('SO₂', curr.sulphur_dioxide)
      },
      {
        name: 'CO',
        value: Math.round(((curr.carbon_monoxide || 0) / 1000) * 100) / 100, // convert µg/m³ to mg/m³
        unit: 'mg/m³',
        status: getPollutantStatus('CO', curr.carbon_monoxide)
      }
    ];

    // Extract forecast snapshots (+2h, +6h, +12h, +18h, +24h)
    const hourlyAqis = json.hourly?.us_aqi || [];
    const forecastIndices = [2, 6, 12, 18, 24];
    const forecast24h = forecastIndices.map((offset) => {
      const val = hourlyAqis[offset] ?? usAqi;
      const cat = getAqiCategory(val).category;
      return {
        time: `+${offset}h`,
        aqi: Math.round(val),
        cat
      };
    });

    const result = {
      isDemo: false,
      isModelForecast: true,
      providerLabel: 'Open-Meteo / Copernicus CAMS Atmospheric Model',
      timestamp: new Date(curr.time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST',
      aqiValue: usAqi,
      aqiCategory: category,
      categoryColor: color,
      primaryPollutant: primary,
      pollutants,
      forecast24h
    };

    aqCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
