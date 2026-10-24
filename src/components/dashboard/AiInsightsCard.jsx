import React from 'react';
import { Cpu, Lightbulb, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function AiInsightsCard({ insights, isLiveMode }) {
  return (
    <div className="dash-float-card dash-ai-card">
      {/* Header */}
      <div className="dash-card-header">
        <div className="dash-card-title">
          <Cpu size={13} color="#00d4ff" />
          <span>Autonomous AI Insights</span>
          <span className="live-tag demo">RULE ENGINE</span>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
          {insights.length} Active
        </div>
      </div>

      {/* Body */}
      <div className="dash-card-body">
        <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginBottom: '6px', lineHeight: 1.3 }}>
          Deterministic spatial-temporal telemetry rules:
        </div>

        {insights.map((item) => (
          <div key={item.id} className="ai-insight-item" style={{ padding: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span className={`ai-insight-badge ${item.badgeClass || 'info'}`} style={{ marginBottom: 0 }}>
                {item.severity} SEVERITY
              </span>
              <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                {item.confidence}
              </span>
            </div>

            <div className="ai-insight-title" style={{ fontSize: '0.74rem', marginBottom: '2px' }}>
              {item.title}
            </div>
            
            <div style={{ fontSize: '0.62rem', color: '#38bdf8', marginBottom: '2px' }}>
              📍 {item.location}
            </div>

            <div className="ai-insight-desc" style={{ fontSize: '0.66rem', lineHeight: 1.35 }}>
              {item.supportingMeasurements}
            </div>

            <div style={{
              marginTop: '5px',
              padding: '5px 7px',
              background: 'rgba(0, 212, 255, 0.05)',
              borderLeft: '2px solid #00d4ff',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.62rem',
              color: '#cbd5e1',
              lineHeight: 1.3
            }}>
              <strong style={{ color: '#00d4ff' }}>Action:</strong> {item.suggestedAction}
            </div>

            <div style={{ marginTop: '3px', fontSize: '0.55rem', color: '#475569' }}>
              Triggered by: {item.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
