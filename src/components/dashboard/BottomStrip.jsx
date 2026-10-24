import React from 'react';
import {
  Thermometer,
  Car,
  Bus,
  Wind,
  Radio,
  AlertTriangle,
  Activity
} from 'lucide-react';

const iconMap = {
  'Weather Summary': Thermometer,
  'Mobility Network': Car,
  'Suburban Transit': Bus,
  'Air Quality (AQI)': Wind,
  'Active Sensor Nodes': Radio,
  'Incident Queue': AlertTriangle
};

export default function BottomStrip({ metrics, weatherData, isLiveMode }) {
  return (
    <div className="dash-bottom-strip">
      {metrics.map((card, idx) => {
        const Icon = iconMap[card.title] || Activity;
        const isAlert = card.status === 'alert';
        const isWarn = card.status === 'warning';
        const isGood = card.status === 'good';

        let valColor = '#f0f4fc';
        if (isAlert) valColor = '#f87171';
        if (isWarn) valColor = '#fbbf24';
        if (isGood) valColor = '#34d399';

        return (
          <div key={idx} className="dash-mini-card">
            <div className="dash-mini-card-title">
              <Icon size={12} color="#00d4ff" />
              <span>{card.title}</span>
            </div>
            <div className="dash-mini-card-value" style={{ color: valColor }}>
              {card.value}
            </div>
            <div className="dash-mini-card-sub">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
