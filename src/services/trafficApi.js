/**
 * Traffic API Service - Backend Proxy & HERE Traffic v7 Adapter
 * 
 * Master Prompt Compliance:
 * - Calls /api/traffic which reads HERE_API_KEY from backend environment.
 * - Handles missing credentials, failed requests, and network timeouts.
 * - When no HERE API key is configured, transparently reports fallback demo data.
 */

import { DEMO_TRAFFIC_DATA } from '../data/mockData';

// In-memory cache for traffic requests (TTL: 30 seconds)
const trafficCache = new Map();
const CACHE_TTL_MS = 30 * 1000;

export async function fetchLiveTraffic(lat = 19.2812, lon = 72.8561, radius = 3500) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const now = Date.now();

  if (trafficCache.has(cacheKey)) {
    const cached = trafficCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/traffic?lat=${lat}&lon=${lon}&radius=${radius}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Traffic API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    trafficCache.set(cacheKey, { timestamp: now, data });
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Traffic API Warning]: Backend traffic request failed, using baseline demo flow:', err.message);
    return {
      ...DEMO_TRAFFIC_DATA,
      fallbackReason: err.message
    };
  }
}
