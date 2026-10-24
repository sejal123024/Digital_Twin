import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Radio,
  LogOut,
  User,
  SlidersHorizontal,
  ChevronDown,
  CloudRain
} from 'lucide-react';

export default function TopHeader({
  localities,
  selectedLocality,
  onSelectLocality,
  isLiveMode,
  onToggleLiveMode,
  weatherData,
  user,
  onLogout
}) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="dash-header">
      {/* Left Section: Locality, Weather and Status */}
      <div className="dash-header-left">
        {/* Locality Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="#00d4ff" />
          <div style={{ position: 'relative' }}>
            <select
              value={selectedLocality.id}
              onChange={(e) => {
                const found = localities.find((l) => l.id === e.target.value);
                if (found) onSelectLocality(found);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                color: '#f0f4fc',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '5px 28px 5px 10px',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {!localities.some((l) => l.id === selectedLocality?.id) && selectedLocality && (
                <option value={selectedLocality.id} style={{ background: '#0b1120', color: '#00d4ff' }}>
                  📍 {selectedLocality.name} (Custom Point)
                </option>
              )}
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id} style={{ background: '#0b1120', color: '#f0f4fc' }}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        {/* Live Weather Indicator */}
        {weatherData && (
          <div className="dash-header-weather-badge" title={`Source: ${weatherData.providerLabel}`}>
            <CloudRain size={13} color="#00d4ff" />
            <span>{weatherData.temperature}°C {weatherData.condition}</span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
              background: isLiveMode ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: isLiveMode ? '#34d399' : '#fbbf24',
              marginLeft: '2px'
            }}>
              {isLiveMode ? 'LIVE' : 'DEMO'}
            </span>
          </div>
        )}

        {/* Live Clock */}
        <div className="dash-header-datetime">
          <Clock size={13} color="#64748b" />
          <span>{currentTime}</span>
        </div>

        {/* Telemetry Status */}
        <div className="dash-header-status">
          <span className={`dash-status-dot ${isLiveMode ? 'green' : 'amber'}`}></span>
          <span>{isLiveMode ? 'LIVE TELEMETRY' : 'DEMO MODE'}</span>
        </div>
      </div>

      {/* Right Section: Controls, User, Logout */}
      <div className="dash-header-right">
        {/* Demo / Live Toggle */}
        <button
          type="button"
          onClick={onToggleLiveMode}
          className={`dash-mode-toggle ${isLiveMode ? 'live' : 'demo'}`}
          title={isLiveMode ? 'Switch to Demo Data' : 'Switch to Live API Mode'}
        >
          <Radio size={12} />
          <span>{isLiveMode ? 'MODE: LIVE DATA' : 'MODE: DEMO DATA'}</span>
        </button>

        {/* User Badge */}
        <div className="dash-user-badge">
          <div className="dash-user-avatar">
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.username || 'Analyst'}</div>
            <div className="dash-user-role">{user?.role || 'Smart City Admin'}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          type="button"
          className="dash-logout-btn"
          title="Sign out of Digital Twin"
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
