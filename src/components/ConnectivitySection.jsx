import React, { useState } from 'react';
import { Train, Car, Navigation, Route, Zap, Shield, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const TRANSIT_MODES = [
  {
    id: 'rail',
    icon: Train,
    title: 'Western Railway & Metro Line 9',
    badge: 'Rapid Mass Transit',
    summary: 'Direct suburban train connectivity on the Western Line with fast and slow local trains, supplemented by the elevated Metro Line 9 corridor.',
    points: [
      'Mira Road Railway Station on the high-frequency Western Line',
      'Direct connectivity to Churchgate, Andheri, and Borivali',
      'Metro Line 9 extending seamlessly from Dahisar (East) into Mira-Bhayandar',
      'Interchange capability with Mumbai Metro Line 7 & Line 2A'
    ]
  },
  {
    id: 'road',
    icon: Car,
    title: 'Western Express Highway & NH-48',
    badge: 'Arterial Arteries',
    summary: 'Direct vehicular access through the 8-lane Western Express Highway and national highway infrastructure.',
    points: [
      'Unbroken expressway access southwards toward BKC and South Mumbai',
      'Ghodbunder Road connecting directly to Thane and Navi Mumbai',
      'Flyover networks reducing local commute congestion',
      'Wide arterial corridors connecting internal sectors to the highway'
    ]
  },
  {
    id: 'future',
    icon: Zap,
    title: 'Mega Infrastructure Corridors',
    badge: 'Upcoming Projects',
    summary: 'Next-generation transit master plans elevating regional mobility and reducing travel times across MMR.',
    points: [
      'Borivali-Thane underground twin tunnel project nearby',
      'Mumbai Coastal Road northern extension connectivity',
      'Proposed Ring Road networks across the Thane-Mira belt',
      'Modernized EV feeder bus networks by MBMT'
    ]
  }
];

export default function ConnectivitySection() {
  const [activeTab, setActiveTab] = useState('rail');

  const selectedTransit = TRANSIT_MODES.find(t => t.id === activeTab) || TRANSIT_MODES[0];

  return (
    <section id="connectivity-section" className="connectivity-section section-spacing">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              <span>LIFELINE OF THE REGION</span>
            </div>
            <h2 className="font-display section-title">
              Multimodal <span className="text-gradient-cyan">Connectivity Grid</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Engineered to keep residents connected to Mumbai's primary financial hubs, commercial corridors, and neighboring satellite cities.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="transit-tabs-wrapper">
          {TRANSIT_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = mode.id === activeTab;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id)}
                className={`transit-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{mode.title.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Card */}
        <div className="glass-card transit-detail-card">
          <div className="transit-detail-grid">
            
            {/* Left Content */}
            <div className="transit-detail-info">
              <div className="transit-badge-row">
                <span className="badge font-mono">{selectedTransit.badge}</span>
                <span className="transit-status-indicator">
                  <span className="status-dot"></span> ACTIVE NETWORK
                </span>
              </div>
              
              <h3 className="font-display transit-card-title">{selectedTransit.title}</h3>
              <p className="transit-card-summary">{selectedTransit.summary}</p>
              
              <div className="transit-points-list">
                {selectedTransit.points.map((pt, idx) => (
                  <div key={idx} className="transit-point-item">
                    <CheckCircle2 size={16} className="point-icon" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Schematic */}
            <div className="transit-schematic-box">
              <div className="schematic-header">
                <span className="font-mono schematic-tag">TRANSIT VECTOR SCHEMATIC</span>
                <Navigation size={15} className="schematic-icon" />
              </div>

              <div className="schematic-diagram">
                <div className="route-node node-start">
                  <div className="node-marker"></div>
                  <div className="node-text">
                    <strong>Mira Road Hub</strong>
                    <span>Origin / Destination</span>
                  </div>
                </div>

                <div className="route-line-connector">
                  <div className="route-pulse"></div>
                </div>

                <div className="route-node node-mid">
                  <div className="node-marker"></div>
                  <div className="node-text">
                    <strong>Dahisar / Borivali Node</strong>
                    <span>Metro & Highway Interchange</span>
                  </div>
                </div>

                <div className="route-line-connector">
                  <div className="route-pulse"></div>
                </div>

                <div className="route-node node-end">
                  <div className="node-marker"></div>
                  <div className="node-text">
                    <strong>Greater Mumbai & Thane</strong>
                    <span>Commercial & Financial Epicenters</span>
                  </div>
                </div>
              </div>

              <div className="schematic-footer font-mono">
                <span>SEAMLESS MULTI-TIER TRANSIT</span>
                <span>STATUS: OPERATIONAL & EXPANDING</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
