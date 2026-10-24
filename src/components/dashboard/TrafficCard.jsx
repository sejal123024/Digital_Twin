import React from 'react';
import { Navigation2, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function TrafficCard({ trafficData, isLiveMode, isLoading, error }) {
  const isDemo = !isLiveMode || trafficData.isDemo;

  return (
    <div className="dash-float-card dash-traffic-card">
      {/* Header */}
      <div className="dash-card-header">
        <div className="dash-card-title">
          <Navigation2 size={13} color="#00d4ff" />
          <span>Mobility & Traffic Flow</span>
          <span className={`live-tag ${isDemo ? 'demo' : 'live'}`}>
            {isDemo ? 'DEMO' : 'LIVE'}
          </span>
        </div>
        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
          {isLoading ? 'Polling flow...' : trafficData.timestamp}
        </div>
      </div>

      {/* Body */}
      <div className="dash-card-body">
        {/* Top Metric Grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Network Congestion
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.7rem', fontWeight: 800, color: trafficData.statusColor || '#f59e0b', lineHeight: 1 }}>
                {trafficData.overallCongestionIndex}%
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {trafficData.congestionLevel}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase' }}>
              Avg Speed
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0f4fc' }}>
              {trafficData.averageSpeedKmph} <span style={{ fontSize: '0.68rem', color: '#64748b' }}>km/h</span>
            </div>
          </div>
        </div>

        {/* Major Corridors Progress Bars */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
            Key Corridors Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {trafficData.corridors?.map((corridor, idx) => (
              <div key={idx} style={{ fontSize: '0.68rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ color: '#cbd5e1', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '190px' }}>
                    {corridor.name}
                  </span>
                  <span style={{ fontWeight: 600, color: corridor.color }}>
                    {corridor.speed} km/h
                  </span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${corridor.congestion}%`,
                      background: corridor.color,
                      borderRadius: '2px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24h Hourly Flow Area Chart */}
        <div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Hourly Volume Trend</span>
            <span style={{ color: '#00d4ff' }}>PCU/hr</span>
          </div>
          <div style={{ width: '100%', height: '65px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData.hourlyFlowTrend} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 15, 29, 0.95)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '4px 8px'
                  }}
                  itemStyle={{ color: '#00d4ff' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#00d4ff" strokeWidth={1.5} fill="url(#flowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Source Footer */}
        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.58rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
          <span>Source: {trafficData.providerLabel}</span>
          <span>{trafficData.activeIncidentsCount} Incidents</span>
        </div>
      </div>
    </div>
  );
}
