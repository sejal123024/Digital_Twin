import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import TrafficCard from './TrafficCard';
import AirQualityCard from './AirQualityCard';
import AiInsightsCard from './AiInsightsCard';
import BottomStrip from './BottomStrip';
import MiraRoadMap from './MiraRoadMap';
import SidebarModuleView from './SidebarPanels';
import AdminPanel from './AdminPanel';
import { fetchLiveWeather } from '../../services/weatherApi';
import { fetchLiveAirQuality } from '../../services/airQualityApi';
import { fetchLiveTraffic } from '../../services/trafficApi';
import { fetchInsights } from '../../services/insightApi';
import {
  MIRA_ROAD_LOCALITIES,
  DEMO_TRAFFIC_DATA,
  DEMO_AIR_QUALITY_DATA,
  DEMO_WEATHER_DATA,
  DEMO_AI_INSIGHTS,
  DEMO_BOTTOM_METRICS,
  SIDEBAR_NAV_ITEMS
} from '../../data/mockData';
import '../../styles/Dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation and Layout state
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Locality & Mode state
  const [selectedLocality, setSelectedLocality] = useState(MIRA_ROAD_LOCALITIES[0]);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Data states (initialized from mock data)
  const [trafficData, setTrafficData] = useState(DEMO_TRAFFIC_DATA);
  const [airQualityData, setAirQualityData] = useState(DEMO_AIR_QUALITY_DATA);
  const [weatherData, setWeatherData] = useState(DEMO_WEATHER_DATA);
  const [insights, setInsights] = useState(DEMO_AI_INSIGHTS);
  const [bottomMetrics, setBottomMetrics] = useState(DEMO_BOTTOM_METRICS);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [aqLoading, setAqLoading] = useState(false);
  const [aqError, setAqError] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficError, setTrafficError] = useState(null);

  // Synchronize Live Weather when Live Mode is toggled or Locality changes
  useEffect(() => {
    if (!isLiveMode) {
      setWeatherData(DEMO_WEATHER_DATA);
      setWeatherError(null);
      return;
    }

    let isSubscribed = true;
    setWeatherLoading(true);
    setWeatherError(null);

    const { lat, lon } = selectedLocality.coordinates;
    fetchLiveWeather(lat, lon)
      .then((live) => {
        if (!isSubscribed) return;
        setWeatherData(live);
        setWeatherLoading(false);
        // Synchronize bottom strip weather summary card
        setBottomMetrics((prev) =>
          prev.map((item) => {
            if (item.title === 'Weather Summary') {
              return {
                ...item,
                value: `${live.temperature}°C`,
                sub: `Humidity ${live.humidity}% • ${live.condition || live.weatherCondition || 'Clear sky'} [LIVE]`,
                status: 'neutral'
              };
            }
            return item;
          })
        );
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn('[Live Weather Error]:', err);
        setWeatherError(err.message);
        setWeatherLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isLiveMode, selectedLocality]);

  // Synchronize Live Air Quality when Live Mode is toggled or Locality changes
  useEffect(() => {
    if (!isLiveMode) {
      setAirQualityData(DEMO_AIR_QUALITY_DATA);
      setAqError(null);
      setBottomMetrics((prev) =>
        prev.map((item) => {
          if (item.title === 'Air Quality (AQI)') {
            return DEMO_BOTTOM_METRICS.find((m) => m.title === 'Air Quality (AQI)') || item;
          }
          return item;
        })
      );
      return;
    }

    let isSubscribed = true;
    setAqLoading(true);
    setAqError(null);

    const { lat, lon } = selectedLocality.coordinates;
    fetchLiveAirQuality(lat, lon)
      .then((live) => {
        if (!isSubscribed) return;
        setAirQualityData(live);
        setAqLoading(false);
        // Synchronize bottom strip AQ card
        setBottomMetrics((prev) =>
          prev.map((item) => {
            if (item.title === 'Air Quality (AQI)') {
              return {
                ...item,
                value: String(live.aqiValue),
                sub: `${live.primaryPollutant}: ${live.pollutants?.[0]?.value ?? '—'} ${live.pollutants?.[0]?.unit ?? ''} • ${live.aqiCategory} [LIVE]`,
                status: live.aqiValue > 150 ? 'alert' : live.aqiValue > 100 ? 'warning' : 'good'
              };
            }
            return item;
          })
        );
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn('[Live AQ Error]:', err);
        setAqError(err.message);
        setAqLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isLiveMode, selectedLocality]);

  // Synchronize Live Traffic when Live Mode is toggled or Locality changes
  useEffect(() => {
    if (!isLiveMode) {
      setTrafficData(DEMO_TRAFFIC_DATA);
      setTrafficError(null);
      setBottomMetrics((prev) =>
        prev.map((item) => {
          if (item.title === 'Mobility Network') {
            return DEMO_BOTTOM_METRICS.find((m) => m.title === 'Mobility Network') || item;
          }
          return item;
        })
      );
      return;
    }

    let isSubscribed = true;
    setTrafficLoading(true);
    setTrafficError(null);

    const { lat, lon } = selectedLocality.coordinates;
    fetchLiveTraffic(lat, lon)
      .then((live) => {
        if (!isSubscribed) return;
        setTrafficData(live);
        setTrafficLoading(false);
        // Synchronize bottom strip Mobility Network card
        setBottomMetrics((prev) =>
          prev.map((item) => {
            if (item.title === 'Mobility Network') {
              return {
                ...item,
                value: `${live.averageSpeedKmph} km/h`,
                sub: `Arterial avg speed • ${live.overallCongestionIndex}% load [${live.isLive ? 'LIVE' : 'DEMO'}]`,
                status: live.overallCongestionIndex > 75 ? 'alert' : live.overallCongestionIndex > 50 ? 'warning' : 'good'
              };
            }
            return item;
          })
        );
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn('[Live Traffic Error]:', err);
        setTrafficError(err.message);
        setTrafficLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isLiveMode, selectedLocality]);

  // Regenerate AI insights whenever core live data changes
  useEffect(() => {
    if (!isLiveMode) {
      setInsights(DEMO_AI_INSIGHTS);
      return;
    }
    const { lat, lon } = selectedLocality.coordinates;
    const locationName = selectedLocality.name;
    // Fire insight synthesis in background (non-blocking)
    fetchInsights({
      lat,
      lon,
      locationName,
      traffic: trafficData,
      weather: weatherData,
      airQuality: airQualityData
    })
      .then(resp => { if (resp.insights) setInsights(resp.insights); })
      .catch(err => console.warn('[Insights Error]:', err.message));
  }, [isLiveMode, selectedLocality, trafficData, weatherData, airQualityData]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleToggleLiveMode = () => {
    setIsLiveMode((prev) => !prev);
  };

  const handleSelectLocality = (locality) => {
    setSelectedLocality(locality);
  };

  return (
    <div className="dashboard-root">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        navItems={SIDEBAR_NAV_ITEMS}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Work Area */}
      <div className="dash-main">
        {/* Top Header */}
        <TopHeader
          localities={MIRA_ROAD_LOCALITIES}
          selectedLocality={selectedLocality}
          onSelectLocality={handleSelectLocality}
          isLiveMode={isLiveMode}
          onToggleLiveMode={handleToggleLiveMode}
          weatherData={weatherData}
          user={user}
          onLogout={handleLogout}
        />

        {/* 3. Central Map Canvas with Floating Intelligence Panels */}
        <div className="dash-content">
          {/* Main Map Background Container */}
          <div className="dash-map-container" id="mira-road-map-root">
            <MiraRoadMap
              selectedLocality={selectedLocality}
              onLocalityChange={handleSelectLocality}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </div>

          {/* Floating Card: Traffic Flow (Overview) or Active Domain Module Panel */}
          {activeNav === 'overview' ? (
            <TrafficCard
              trafficData={trafficData}
              isLiveMode={isLiveMode}
              isLoading={trafficLoading}
              error={trafficError}
            />
          ) : activeNav === 'admin' ? null : (
            <div className="dash-active-module-container">
              <SidebarModuleView
                activeNav={activeNav}
                onClose={() => setActiveNav('overview')}
                trafficData={trafficData}
                airQualityData={airQualityData}
                weatherData={weatherData}
                insights={insights}
                isLiveMode={isLiveMode}
                selectedLocality={selectedLocality}
              />
            </div>
          )}

          {/* Right Column: AQ + AI Insights stacked without overlap */}
          <div className="dash-right-column">
            <AirQualityCard
              airQualityData={airQualityData}
              isLiveMode={isLiveMode}
              isLoading={aqLoading}
              error={aqError}
            />
            <AiInsightsCard
              insights={insights}
              isLiveMode={isLiveMode}
            />
          </div>

          {/* Bottom Analytics Strip */}
          <BottomStrip
            metrics={bottomMetrics}
            weatherData={weatherData}
            isLiveMode={isLiveMode}
          />
        </div>
      </div>

      {/* 4. Dedicated Full-Screen Administrative Console Overlay */}
      {activeNav === 'admin' && (
        <AdminPanel
          onClose={() => setActiveNav('overview')}
          isLiveMode={isLiveMode}
          onToggleLiveMode={handleToggleLiveMode}
          selectedLocality={selectedLocality}
        />
      )}
    </div>
  );
}
