import React from 'react';
import { ArrowDown, Orbit, MapPin, Compass } from 'lucide-react';

export default function HeroIntro({ onScrollClick }) {
  return (
    <section className="hero-intro-section">
      <div className="container hero-intro-container">
        {/* Eyebrow */}
        <div className="eyebrow animate-fade-in">
          <span className="eyebrow-dot"></span>
          <span>DISCOVER THE CITY</span>
        </div>

        {/* Heading */}
        <h1 className="hero-heading animate-fade-in font-display">
          From the <span className="text-gradient">World</span> to <span className="text-gradient-cyan">Mira Road</span>
        </h1>

        {/* Description */}
        <p className="hero-description animate-fade-in">
          Follow a cinematic journey from Earth to India, Maharashtra, and the evolving urban landscape of Mira Road.
        </p>

        {/* Key Highlights Pill Row */}
        <div className="hero-meta-row animate-fade-in">
          <div className="hero-meta-pill">
            <Orbit size={14} className="meta-icon" />
            <span>Scale: Planetary Orbit to Street Grid</span>
          </div>
          <div className="hero-meta-pill">
            <MapPin size={14} className="meta-icon" />
            <span>Region: Mumbai Metropolitan Region (MMR)</span>
          </div>
          <div className="hero-meta-pill">
            <Compass size={14} className="meta-icon" />
            <span>Interactive Scroll-Scrub Sync</span>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="scroll-hint-wrapper" onClick={onScrollClick}>
          <div className="scroll-hint-content">
            <span className="scroll-hint-text">SCROLL TO EXPLORE</span>
            <div className="scroll-indicator-arrow">
              <ArrowDown size={18} />
            </div>
          </div>
          <div className="scroll-mouse-icon">
            <div className="scroll-wheel-dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
