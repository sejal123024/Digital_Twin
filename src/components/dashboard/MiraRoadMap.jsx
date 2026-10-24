import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Compass,
  Layers,
  RefreshCw,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Loader2,
  Building2
} from 'lucide-react';
import { fetchReverseGeocode } from '../../services/osmApi';

const MAP_STYLES = {
  darkCanvas: {
    label: 'Cyber Twin Dark (Ultra Crisp)',
    isInline: true,
    style: {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Tiles © Esri • HERE, Garmin, OpenStreetMap'
        },
        'esri-dark-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'esri-dark-base-layer',
          type: 'raster',
          source: 'esri-dark-base',
          minzoom: 0,
          maxzoom: 19
        },
        {
          id: 'esri-dark-labels-layer',
          type: 'raster',
          source: 'esri-dark-labels',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  satellite: {
    label: 'Satellite Orbital Imagery',
    isInline: true,
    style: {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: 'Tiles © Esri • Source: Earthstar Geographics'
        },
        'satellite-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'satellite-base-layer',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 19
        },
        {
          id: 'satellite-labels-layer',
          type: 'raster',
          source: 'satellite-labels',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  osmStreet: {
    label: 'OpenStreetMap Detailed',
    isInline: true,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  ofmBright: {
    label: 'OpenFreeMap Bright (Vector)',
    isInline: false,
    url: 'https://tiles.openfreemap.org/styles/bright'
  },
  ofmDark: {
    label: 'OpenFreeMap Dark (Vector)',
    isInline: false,
    url: 'https://tiles.openfreemap.org/styles/dark'
  }
};

async function getStyleDefinition(styleEntry) {
  if (styleEntry.isInline) {
    return styleEntry.style;
  }
  try {
    const res = await fetch(styleEntry.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const style = await res.json();
    if (style.sources && style.sources.ne2_shaded) {
      delete style.sources.ne2_shaded;
    }
    if (style.layers) {
      style.layers = style.layers.filter((l) => l.source !== 'ne2_shaded');
    }
    return style;
  } catch (err) {
    console.warn('[MiraRoadMap] Falling back to Cyber Twin Dark style:', err);
    return MAP_STYLES.darkCanvas.style;
  }
}

export default function MiraRoadMap({
  selectedLocality,
  onLocalityChange,
  isSidebarCollapsed
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isMountedRef = useRef(true);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isTilesStreaming, setIsTilesStreaming] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [currentStyleKey, setCurrentStyleKey] = useState('darkCanvas');
  const [is3DView, setIs3DView] = useState(true);
  const [is3DBuildings, setIs3DBuildings] = useState(true);
  const [currentPitch, setCurrentPitch] = useState(56);
  const [currentBearing, setCurrentBearing] = useState(-10);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const onLocalityChangeRef = useRef(onLocalityChange);
  useEffect(() => {
    onLocalityChangeRef.current = onLocalityChange;
  }, [onLocalityChange]);

  // Setup verified 3D building extrusions layer
  const setup3DBuildings = (map) => {
    if (!map) return;

    let sourceName = 'openmaptiles';
    if (!map.getSource('openmaptiles')) {
      if (!map.getSource('ofm-vector-buildings')) {
        try {
          map.addSource('ofm-vector-buildings', {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet'
          });
        } catch (e) {
          console.warn('Could not register ofm-vector-buildings source:', e);
        }
      }
      sourceName = 'ofm-vector-buildings';
    }

    if (map.getLayer('3d-buildings-extrusion')) return;

    // Find symbol label layer to insert beneath
    const layers = map.getStyle().layers || [];
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    try {
      map.addLayer(
        {
          id: '3d-buildings-extrusion',
          source: sourceName,
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          layout: {
            visibility: is3DBuildings ? 'visible' : 'none'
          },
          paint: {
            'fill-extrusion-color': [
              'case',
              ['has', 'colour'],
              ['get', 'colour'],
              '#1e293b' // Dark slate cyber fill
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.2,
              [
                '*',
                [
                  'coalesce',
                  ['get', 'render_height'],
                  ['get', 'height'],
                  3
                ],
                3.5 // Scale levels to meters
              ]
            ],
            'fill-extrusion-base': [
              'coalesce',
              ['*', ['get', 'render_min_height'], 3.5],
              0
            ],
            'fill-extrusion-opacity': 0.85
          }
        },
        labelLayerId
      );

      // Interactive popup on building click
      map.on('click', '3d-buildings-extrusion', (e) => {
        if (!e.features || !e.features[0]) return;
        const feat = e.features[0];
        const p = feat.properties || {};
        const levels = p.render_height || p.levels || '1-3';
        const heightMeters = Math.round((Number(p.render_height) || 3) * 3.5);

        new maplibregl.Popup({ offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              padding: 8px 12px;
              background: rgba(10, 15, 28, 0.96);
              color: #f0f4fc;
              font-family: inherit;
              border-radius: 8px;
              border: 1px solid rgba(0, 212, 255, 0.4);
              font-size: 11px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            ">
              <div style="font-weight: 700; color: #00d4ff; font-size: 12px; margin-bottom: 4px;">
                🏢 Verified 3D Structure
              </div>
              <div style="color: #94a3b8; margin-bottom: 2px;">
                Levels: <strong style="color: #fff;">${levels} Storeys</strong>
              </div>
              <div style="color: #94a3b8; margin-bottom: 2px;">
                Extrusion Height: <strong style="color: #34d399;">~${heightMeters} m</strong>
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                Source Layer: OpenMapTiles / OSM 'building' (render_height)
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', '3d-buildings-extrusion', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', '3d-buildings-extrusion', () => {
        map.getCanvas().style.cursor = '';
      });
    } catch (err) {
      console.warn('[3D Buildings Warning]:', err);
    }
  };

  // Initialize Map
  useEffect(() => {
    isMountedRef.current = true;
    if (!mapContainerRef.current) return;

    // Geographic coordinates for Mira Road & Bhayandar, Maharashtra
    // Longitude: 72.8561, Latitude: 19.2812
    const initialLng = selectedLocality?.coordinates?.lon ?? 72.8561;
    const initialLat = selectedLocality?.coordinates?.lat ?? 19.2812;
    const initialZoom = selectedLocality?.zoom ?? 14.6;
    const initialPitch = is3DView ? (selectedLocality?.pitch ?? 56) : 0;
    const initialBearing = selectedLocality?.bearing ?? -10;

    setMapLoaded(false);
    setIsTilesStreaming(true);
    setMapError(null);

    let mapInstance = null;

    (async () => {
      try {
        const styleDef = await getStyleDefinition(MAP_STYLES[currentStyleKey]);
        if (!isMountedRef.current || !mapContainerRef.current) return;

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: styleDef,
          center: [initialLng, initialLat],
          zoom: initialZoom,
          pitch: initialPitch,
          bearing: initialBearing,
          maxPitch: 75,
          minZoom: 10,
          maxZoom: 19,
          attributionControl: false
        });

        mapRef.current = map;
        mapInstance = map;

        // Navigation controls
        map.addControl(
          new maplibregl.NavigationControl({
            visualizePitch: true,
            showCompass: true,
            showZoom: true
          }),
          'bottom-right'
        );

        // Scale bar
        map.addControl(
          new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }),
          'bottom-left'
        );

        // Attribution removed per user request

        const onReady = () => {
          if (!isMountedRef.current) return;
          setMapLoaded(true);
          setIsTilesStreaming(false);
          setMapError(null);
          createOrUpdateMarker(map, initialLng, initialLat, selectedLocality?.name);
          setup3DBuildings(map);
          map.resize();
        };

        map.once('load', onReady);
        map.once('style.load', onReady);

        const timer = setTimeout(() => {
          if (isMountedRef.current && !mapLoaded) {
            onReady();
          }
        }, 600);

        map.on('rotate', () => {
          if (isMountedRef.current) setCurrentBearing(Math.round(map.getBearing()));
        });

        map.on('pitch', () => {
          if (isMountedRef.current) setCurrentPitch(Math.round(map.getPitch()));
        });

        // Click anywhere on map to select street/neighbourhood
        map.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          if (isMountedRef.current) setIsGeocoding(true);
          createOrUpdateMarker(map, lng, lat, 'Resolving Location...', 'Reverse-geocoding via OpenStreetMap');

          try {
            const geo = await fetchReverseGeocode(lat, lng);
            const roadName = geo.streetName && geo.streetName !== 'Local Corridor' ? geo.streetName : null;
            const localityName = geo.neighbourhood || geo.city || 'Mira Road';
            const displayTitle = roadName ? `${roadName}, ${localityName}` : (localityName || 'Mira Road Corridor');

            createOrUpdateMarker(map, lng, lat, displayTitle, geo.formattedAddress || 'Selected GIS Coordinate');

            if (onLocalityChangeRef.current) {
              onLocalityChangeRef.current({
                id: `custom-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                name: displayTitle,
                sector: localityName,
                coordinates: { lat, lon: lng },
                zoom: map.getZoom(),
                pitch: map.getPitch(),
                bearing: map.getBearing(),
                description: geo.formattedAddress || `Selected coordinate at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
              });
            }
          } catch (err) {
            console.warn('[Map Click Reverse Geocode Failed]:', err);
            const fallbackTitle = `Locality (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            createOrUpdateMarker(map, lng, lat, fallbackTitle, 'Mira Road GIS Point');
            if (onLocalityChangeRef.current) {
              onLocalityChangeRef.current({
                id: `custom-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                name: fallbackTitle,
                sector: 'Mira Road',
                coordinates: { lat, lon: lng },
                zoom: map.getZoom(),
                pitch: map.getPitch(),
                bearing: map.getBearing(),
                description: `Selected coordinate at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
              });
            }
          } finally {
            if (isMountedRef.current) {
              setIsGeocoding(false);
            }
          }
        });

        requestAnimationFrame(() => {
          map.resize();
        });
      } catch (err) {
        console.error('[MapLibre Init Failed]:', err);
        if (isMountedRef.current) {
          setMapError('Failed to initialize map engine: ' + err.message);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [currentStyleKey]);

  // Marker helper
  const createOrUpdateMarker = (map, lng, lat, name, subtitle) => {
    if (!map) return;

    const popupHtml = `
      <div style="
        padding: 6px 10px;
        background: rgba(10, 15, 28, 0.95);
        color: #f0f4fc;
        font-family: system-ui;
        border-radius: 6px;
        border: 1px solid rgba(0,212,255,0.4);
        font-size: 11px;
      ">
        <strong style="color: #00d4ff;">${name || 'Mira Road Locality'}</strong>
        <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">${subtitle || 'Active GIS Focal Point'}</div>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      const popup = markerRef.current.getPopup();
      if (popup) {
        popup.setHTML(popupHtml);
      }
      return;
    }

    const el = document.createElement('div');
    el.className = 'locality-pulse-marker';
    el.innerHTML = `
      <div style="
        width: 22px;
        height: 22px;
        background: #00d4ff;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 16px #00d4ff, 0 0 35px rgba(0,212,255,0.8);
        position: relative;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 2px solid rgba(0,212,255,0.8);
          animation: mapPulse 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        "></div>
      </div>
    `;

    const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(popupHtml);

    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);
  };

  // Fly to selected locality
  useEffect(() => {
    if (!mapRef.current || !selectedLocality) return;

    const { lon, lat } = selectedLocality.coordinates;
    const targetPitch = is3DView ? (selectedLocality.pitch ?? 56) : 0;
    const targetZoom = selectedLocality.zoom ?? 14.8;
    const targetBearing = selectedLocality.bearing ?? -10;

    const currentCenter = mapRef.current.getCenter();
    const distDeg = Math.hypot(currentCenter.lng - lon, currentCenter.lat - lat);

    if (distDeg > 0.003) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: targetZoom,
        pitch: targetPitch,
        bearing: targetBearing,
        duration: 1600,
        essential: true
      });
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([lon, lat]);
      const popup = markerRef.current.getPopup();
      if (popup) {
        popup.setHTML(`
          <div style="
            padding: 6px 10px;
            background: rgba(10, 15, 28, 0.95);
            color: #f0f4fc;
            font-family: system-ui;
            border-radius: 6px;
            border: 1px solid rgba(0,212,255,0.4);
            font-size: 11px;
          ">
            <strong style="color: #00d4ff;">${selectedLocality.name}</strong>
            <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">${selectedLocality.sector || 'Urban Zone'}</div>
          </div>
        `);
      }
    }
  }, [selectedLocality, is3DView]);

  // Sidebar resize watcher
  useEffect(() => {
    if (!mapRef.current) return;
    const timeout = setTimeout(() => {
      mapRef.current?.resize();
    }, 320);
    return () => clearTimeout(timeout);
  }, [isSidebarCollapsed]);

  // ResizeObserver for canvas
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Camera Actions
  const toggle3DView = () => {
    if (!mapRef.current) return;
    const new3D = !is3DView;
    setIs3DView(new3D);
    mapRef.current.easeTo({
      pitch: new3D ? 56 : 0,
      duration: 800
    });
  };

  const toggle3DBuildings = () => {
    if (!mapRef.current) return;
    const nextState = !is3DBuildings;
    setIs3DBuildings(nextState);
    if (mapRef.current.getLayer('3d-buildings-extrusion')) {
      mapRef.current.setLayoutProperty(
        '3d-buildings-extrusion',
        'visibility',
        nextState ? 'visible' : 'none'
      );
    }
  };

  const resetNorth = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      duration: 600
    });
  };

  const retryMapLoad = () => {
    setMapError(null);
    setCurrentStyleKey((k) => k);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          background: '#070a13'
        }}
      />

      {/* Subtle non-blocking tile status badge in top center */}
      {isTilesStreaming && !mapError && (
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 15, 28, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '999px',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 25,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: '#f0f4fc',
          fontSize: '0.72rem',
          fontWeight: 500
        }}>
          <Loader2 size={13} color="#00d4ff" className="animate-spin" />
          <span>Streaming Mira Road GIS tiles & 3D buildings...</span>
        </div>
      )}

      {/* Geocoding indicator when user clicks on map */}
      {isGeocoding && (
        <div style={{
          position: 'absolute',
          top: isTilesStreaming ? '48px' : '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 15, 28, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 212, 255, 0.5)',
          borderRadius: '999px',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 26,
          boxShadow: '0 4px 24px rgba(0,212,255,0.25)',
          color: '#f0f4fc',
          fontSize: '0.74rem',
          fontWeight: 600
        }}>
          <Loader2 size={13} color="#00d4ff" className="animate-spin" />
          <span>Identifying street & loading area telemetry...</span>
        </div>
      )}

      {/* Error Overlay */}
      {mapError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(7, 10, 19, 0.92)',
          zIndex: 20,
          padding: '20px',
          textAlign: 'center'
        }}>
          <AlertCircle size={36} color="#f87171" style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f87171' }}>
            Vector Map Stream Interrupted
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '360px', marginTop: '6px', marginBottom: '16px' }}>
            {mapError}
          </div>
          <button
            onClick={retryMapLoad}
            type="button"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              background: 'rgba(0, 212, 255, 0.15)',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              color: '#00d4ff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Top Floating Map Toolbar */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '334px',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Style Selector */}
        <div style={{
          background: 'rgba(10, 15, 28, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '8px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Layers size={12} color="#00d4ff" />
          <select
            value={currentStyleKey}
            onChange={(e) => setCurrentStyleKey(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {Object.entries(MAP_STYLES).map(([key, style]) => (
              <option key={key} value={key} style={{ background: '#0b1120', color: '#f0f4fc' }}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Tilt Toggle */}
        <button
          onClick={toggle3DView}
          type="button"
          title={is3DView ? 'Switch to Top-Down 2D' : 'Switch to 3D Oblique View'}
          style={{
            background: is3DView ? 'rgba(0, 212, 255, 0.18)' : 'rgba(10, 15, 28, 0.92)',
            backdropFilter: 'blur(12px)',
            border: is3DView ? '1px solid rgba(0, 212, 255, 0.45)' : '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '4px 10px',
            color: is3DView ? '#00d4ff' : '#94a3b8',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Sliders size={12} />
          <span>{is3DView ? `3D (${currentPitch}°)` : '2D Plan'}</span>
        </button>

        {/* 3D Buildings Extrusion Toggle */}
        <button
          onClick={toggle3DBuildings}
          type="button"
          title={is3DBuildings ? 'Hide 3D Buildings' : 'Show 3D Buildings'}
          style={{
            background: is3DBuildings ? 'rgba(0, 212, 255, 0.18)' : 'rgba(10, 15, 28, 0.92)',
            backdropFilter: 'blur(12px)',
            border: is3DBuildings ? '1px solid rgba(0, 212, 255, 0.45)' : '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '4px 10px',
            color: is3DBuildings ? '#00d4ff' : '#94a3b8',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Building2 size={12} />
          <span>{is3DBuildings ? '3D Buildings: ON' : '3D Buildings: OFF'}</span>
        </button>

        {/* Compass Reset North */}
        {currentBearing !== 0 && (
          <button
            onClick={resetNorth}
            type="button"
            title="Reset North Orientation"
            style={{
              background: 'rgba(10, 15, 28, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#cbd5e1',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Compass size={12} color="#f59e0b" />
            <span>Bearing: {currentBearing}°</span>
          </button>
        )}
      </div>
    </div>
  );
}
