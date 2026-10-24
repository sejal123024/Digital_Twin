/**
 * AI Insights Frontend API Service
 * Posts available live data to the backend insight synthesis engine.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetch evidence-grounded insights from the backend rule engine.
 * @param {Object} payload - { lat, lon, locationName, traffic, weather, airQuality, transit, safety, energy }
 */
export async function fetchInsights(payload) {
  const res = await fetch(`${BASE_URL}/api/insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Insights fetch failed: HTTP ${res.status}`);
  return res.json();
}
