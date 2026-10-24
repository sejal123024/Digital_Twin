import React from 'react';
import { 
  Building2, 
  Trees, 
  Train, 
  ShoppingBag, 
  Compass, 
  ArrowRight,
  MapPin,
  HeartPulse,
  Home,
  Navigation
} from 'lucide-react';

const SECTION_PREVIEWS = [
  {
    id: 'neighbourhood',
    targetId: 'overview-section',
    icon: Compass,
    title: 'Explore the Neighbourhood',
    tag: 'Locality & Heritage',
    description: 'Discover established sectors, serene waterfronts along Vasai Creek, and vibrant residential enclaves with deep community roots.'
  },
  {
    id: 'connectivity',
    targetId: 'connectivity-section',
    icon: Train,
    title: 'Connectivity & Transit',
    tag: 'Infrastructure',
    description: 'Western Railway artery, Western Express Highway link, and the upcoming Mumbai Metro Line 9 transforming daily commutes.'
  },
  {
    id: 'lifestyle',
    targetId: 'lifestyle-section',
    icon: ShoppingBag,
    title: 'Lifestyle and Amenities',
    tag: 'Social Ecosystem',
    description: 'Leading multi-specialty hospitals, international curriculum schools, shopping malls, theme parks, and wellness avenues.'
  },
  {
    id: 'realestate',
    targetId: 'realestate-section',
    icon: Building2,
    title: 'Real Estate & Growth',
    tag: 'Urban Horizons',
    description: 'Contemporary high-rise gated towers with integrated clubhouse podiums, rooftop decks, and rising property appreciation.'
  }
];

export default function MiraRoadOverview() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="overview-section" className="mira-overview-section">
      <div className="container">
        
        {/* Distinct Welcome Introduction */}
        <div className="overview-welcome-header text-center">
          <div className="eyebrow-pill">
            <span className="eyebrow-dot"></span>
            <span>DESTINATION REACHED · 19.2812° N</span>
          </div>

          <h2 className="welcome-main-heading font-display">
            Welcome to <span className="text-gradient-cyan">Mira Road</span>
          </h2>

          <p className="welcome-main-desc">
            Explore the neighbourhood, its connectivity, local amenities, and evolving urban landscape.
          </p>
        </div>

        {/* 4 Clean Separate Section Previews Grid */}
        <div className="preview-sections-grid">
          {SECTION_PREVIEWS.map((preview) => {
            const Icon = preview.icon;
            return (
              <div 
                key={preview.id} 
                className="glass-card preview-card"
                onClick={() => scrollToSection(preview.targetId)}
              >
                <div className="preview-card-header">
                  <div className="preview-icon-box">
                    <Icon size={22} />
                  </div>
                  <span className="badge font-mono">{preview.tag}</span>
                </div>

                <h3 className="preview-card-title font-display">{preview.title}</h3>
                <p className="preview-card-desc">{preview.description}</p>

                <div className="preview-card-action">
                  <span className="preview-action-text font-mono">EXPLORE SECTION</span>
                  <ArrowRight size={14} className="preview-action-arrow" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Localities & Sectors Box */}
        <div className="neighborhoods-box glass-card">
          <div className="neighborhoods-header">
            <div>
              <span className="badge font-mono">EXPLORE THE NEIGHBOURHOOD</span>
              <h3 className="font-display neighborhoods-title">Key Localities & Sectors</h3>
            </div>
            <p className="neighborhoods-sub">Established residential pockets and commercial avenues across Mira Road</p>
          </div>

          <div className="neighborhoods-pills-grid">
            {[
              'Shanti Park', 
              'Beverly Park', 
              'Kanakia Spaces', 
              'Silver Park', 
              'Pleasant Park', 
              'Hatkesh Udyog Nagar', 
              'Poonam Sagar Complex', 
              'Mira-Bhayandar Road Corridor', 
              'Evershine Enclave', 
              'Western Express Gateway'
            ].map((name, i) => (
              <div key={i} className="neighborhood-pill">
                <MapPin size={13} className="pill-pin" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
