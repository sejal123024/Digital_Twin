/**
 * OSM / Overpass Frontend API Service
 * Wraps backend proxy routes for OSM infrastructure data.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function osmFetch(endpoint, lat, lon, radius) {
  const params = new URLSearchParams({ lat, lon });
  if (radius) params.set('radius', radius);
  const res = await fetch(`${BASE_URL}/api/osm/${endpoint}?${params.toString()}`);
  if (!res.ok) throw new Error(`OSM ${endpoint} fetch failed: HTTP ${res.status}`);
  return res.json();
}

export async function fetchOsmTransit(lat, lon, radius = 1500) {
  return osmFetch('transit', lat, lon, radius);
}

export async function fetchOsmInfrastructure(lat, lon, radius = 1200) {
  return osmFetch('infrastructure', lat, lon, radius);
}

export async function fetchOsmEnergy(lat, lon, radius = 3000) {
  return osmFetch('energy', lat, lon, radius);
}

export async function fetchOsmSafety(lat, lon, radius = 2500) {
  return osmFetch('safety', lat, lon, radius);
}

export async function fetchOsmEconomy(lat, lon, radius = 1000) {
  return osmFetch('economy', lat, lon, radius);
}

export async function fetchOsmCivic(lat, lon, radius = 1200) {
  return osmFetch('civic', lat, lon, radius);
}

export async function fetchReverseGeocode(lat, lon) {
  const res = await fetch(`${BASE_URL}/api/geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Geocode failed: HTTP ${res.status}`);
  return res.json();
}
