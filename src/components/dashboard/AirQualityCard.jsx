import React from 'react';
import { Wind, Activity, Loader2, AlertCircle, Info } from 'lucide-react';

export default function AirQualityCard({ airQualityData, isLiveMode, isLoading, error }) {
  const isDemo = !isLiveMode || airQualityData.isDemo;

  return (
    <div className="dash-float-card dash-aq-card">
      {/* Header */}
      <div className="dash-card-header">
        <div className="dash-card-title">
          <Wind size={13} color="#00d4ff" />
          <span>Air Quality & Emissions</span>
          <span className={`live-tag ${isDemo ? 'demo' : 'live'}`}>
            {isDemo ? 'DEMO' : 'LIVE'}
          </span>
        </div>
        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
          {isLoading ? 'Fetching...' : airQualityData.timestamp}
        </div>
      </div>

      {/* Body */}
      <div className="dash-card-body aq-body-compact">
        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '24px 0', color: '#94a3b8', fontSize: '0.72rem'
          }}>
            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Fetching Open-Meteo Air Quality...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div style={{
            padding: '8px 10px', borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <AlertCircle size={12} color="#f87171" />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#f87171' }}>
                Live AQ Request Failed
              </span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{error}</div>
          </div>
        )}

        {/* Main AQI Display */}
        {!isLoading && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                className="aqi-gauge-compact"
                style={{
                  background: `radial-gradient(circle, ${airQualityData.categoryColor}22 0%, transparent 70%)`,
                  borderColor: airQualityData.categoryColor
                }}
              >
                <div className="aqi-gauge-val" style={{ color: airQualityData.categoryColor }}>
                  {airQualityData.aqiValue}
                </div>
                <div className="aqi-gauge-sub" style={{ color: airQualityData.categoryColor }}>
                  AQI (US)
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0f4fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {airQualityData.aqiCategory}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '1px' }}>
                  Primary: <strong style={{ color: '#00d4ff' }}>{airQualityData.primaryPollutant}</strong>
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>
                  Outdoor activity acceptable for most individuals.
                </div>
              </div>
            </div>

            {/* Source Type Badge — Model vs Station */}
            {!isDemo && (
              <div className="aq-badge-notice">
                <Info size={10} style={{ flexShrink: 0 }} />
                <span>
                  {airQualityData.isModelForecast
                    ? 'Dispersion model estimate — not ground station'
                    : 'Ground station observation'}
                </span>
              </div>
            )}

            {/* Pollutants 2x2 Grid */}
            <div className="aq-pollutants-grid">
              {airQualityData.pollutants?.slice(0, 4).map((item, idx) => (
                <div key={idx} className="aq-pollutant-box">
                  <div className="aq-pollutant-top">
                    <span className="aq-pollutant-name">{item.name}</span>
                    <span className={`aq-pollutant-tag ${item.status?.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="aq-pollutant-val">
                    {item.value} <span className="aq-pollutant-unit">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 24h Dispersion Forecast Strip */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                Next 24h Dispersion Forecast
              </div>
              <div className="aq-forecast-row">
                {airQualityData.forecast24h?.map((fc, idx) => (
                  <div key={idx} className="aq-forecast-cell">
                    <div className="aq-forecast-cell-value" style={{ color: fc.aqi > 100 ? '#f59e0b' : '#10b981' }}>
                      {fc.aqi}
                    </div>
                    <div className="aq-forecast-cell-time">{fc.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Footer */}
            <div className="aq-source-footer">
              Source: {airQualityData.providerLabel || 'Open-Meteo CAMS'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
