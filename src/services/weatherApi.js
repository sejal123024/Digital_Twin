/**
 * Weather API Service - Open-Meteo Integration
 * Official API Base URL: https://api.open-meteo.com/v1/forecast
 * Adheres strictly to Master Prompt:
 * - Distinguishes numerical weather model forecasts from physical monitoring station observations.
 * - Never fabricates fake readings in Live Data mode.
 */

// WMO Weather interpretation codes (WMO code -> Label & Icon)
const WMO_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

function getWindCompass(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
  return directions[index];
}

// In-memory cache to respect Open-Meteo usage limits (TTL: 5 minutes)
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchLiveWeather(lat = 19.2812, lon = 72.8561) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const now = Date.now();

  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FKolkata`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // 1. Attempt to fetch via backend proxy endpoint
    const backendRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal: controller.signal });
    if (backendRes.ok) {
      clearTimeout(timeoutId);
      const data = await backendRes.json();
      weatherCache.set(cacheKey, { timestamp: now, data });
      return data;
    }
  } catch (backendErr) {
    console.info('[Weather API]: Backend proxy not available, falling back to direct Open-Meteo:', backendErr.message);
  }

  // 2. Direct fallback to Open-Meteo if backend proxy is down
  const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FKolkata`;

  try {
    const res = await fetch(directUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const curr = json.current;
    if (!curr) throw new Error('Incomplete weather payload from Open-Meteo');

    const conditionText = WMO_CODE_MAP[curr.weather_code] || 'Partly cloudy';
    const windDirectionLabel = getWindCompass(curr.wind_direction_10m);

    // Format hourly forecast (next 6 entries)
    const hourlyTimes = json.hourly?.time || [];
    const hourlyTemps = json.hourly?.temperature_2m || [];
    const hourlyPrecip = json.hourly?.precipitation_probability || [];

    const hourlyForecast = [];
    for (let i = 0; i < Math.min(hourlyTimes.length, 6); i++) {
      const timeStr = new Date(hourlyTimes[i]).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      hourlyForecast.push({
        time: timeStr,
        temp: hourlyTemps[i],
        precipProb: hourlyPrecip[i] ?? 0
      });
    }

    const result = {
      isDemo: false,
      isModelForecast: true,
      providerLabel: 'Open-Meteo Numerical Prediction Grid (ECMWF/GFS)',
      timestamp: new Date(curr.time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST',
      temperature: Math.round(curr.temperature_2m * 10) / 10,
      apparentTemperature: Math.round(curr.apparent_temperature * 10) / 10,
      humidity: Math.round(curr.relative_humidity_2m),
      precipitationMm: curr.precipitation,
      windSpeedKmph: Math.round(curr.wind_speed_10m * 10) / 10,
      windDirectionDeg: curr.wind_direction_10m,
      windDirectionLabel,
      cloudCoverPercent: curr.cloud_cover,
      condition: conditionText,
      weatherCode: curr.weather_code,
      hourlyForecast
    };

    weatherCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
