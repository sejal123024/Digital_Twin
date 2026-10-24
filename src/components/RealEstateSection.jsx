import React from 'react';
import { 
  Building, 
  TrendingUp, 
  Key, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Compass, 
  ArrowUpRight 
} from 'lucide-react';

const REAL_ESTATE_THEMES = [
  {
    icon: Building,
    title: 'Modern High-Rise Enclaves',
    tag: 'Contemporary Living',
    desc: 'Skyline towers featuring dedicated parking podiums, rooftop wellness decks, and high-speed elevator banks.'
  },
  {
    icon: Sparkles,
    title: 'Clubhouse & Resort Amenities',
    tag: 'Lifestyle Quality',
    desc: 'Integrated swimming pools, fitness centers, badminton courts, landscaped podium gardens, and banquet halls.'
  },
  {
    icon: TrendingUp,
    title: 'Transit-Oriented Growth',
    tag: 'Appreciation Hub',
    desc: 'Developments strategically clustered along the Metro Line 9 corridor and Western Express arterial routes.'
  }
];

export default function RealEstateSection() {
  return (
    <section id="realestate-section" className="realestate-section section-spacing">
      <div className="container">
        
        {/* Header */}
        <div className="section-header-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              <span>URBAN HORIZONS</span>
            </div>
            <h2 className="font-display section-title">
              Residential & <span className="text-gradient-cyan">Development Landscape</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Mira Road has transformed into a sought-after urban township, offering thoughtfully planned gated communities and modern infrastructure.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="realestate-cards-grid">
          {REAL_ESTATE_THEMES.map((theme, idx) => {
            const Icon = theme.icon;
            return (
              <div key={idx} className="glass-card realestate-card">
                <div className="realestate-card-top">
                  <div className="realestate-icon-box">
                    <Icon size={24} className="realestate-icon" />
                  </div>
                  <span className="badge font-mono">{theme.tag}</span>
                </div>
                <h3 className="font-display realestate-card-title">{theme.title}</h3>
                <p className="realestate-card-desc">{theme.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Master Vision CTA Banner */}
        <div className="realestate-cta-banner glass-card">
          <div className="cta-banner-content">
            <div className="cta-tag font-mono">
              <Compass size={14} />
              <span>DIGITAL TWIN · SPATIAL INTELLIGENCE</span>
            </div>
            <h3 className="font-display cta-title">
              Experience the Future of Mira Road
            </h3>
            <p className="cta-desc">
              Whether you are an explorer, prospective homebuyer, or urban planner, explore how Mira Road bridges orbital geography with vibrant community living.
            </p>
            <div className="cta-buttons-row">
              <button 
                onClick={() => {
                  const el = document.getElementById('journey-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn btn-primary"
              >
                <Compass size={16} />
                <span>Replay Orbit Journey</span>
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('overview-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn btn-secondary"
              >
                <span>Explore City Sectors</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
