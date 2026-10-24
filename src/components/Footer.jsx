import React from 'react';
import { Globe2, ArrowUp, Compass, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        
        {/* Top row */}
        <div className="footer-top-row">
          <div className="footer-brand-col">
            <div className="footer-brand" onClick={scrollToTop}>
              <div className="brand-icon-box">
                <Globe2 size={20} />
              </div>
              <span className="brand-title">MIRA ROAD DIGITAL TWIN</span>
            </div>
            <p className="footer-tagline">
              A cinematic spatial journey from planetary orbit into the heart of Mira-Bhayandar, Maharashtra, India.
            </p>
            <div className="footer-coords font-mono">
              LAT: 19.2812° N · LON: 72.8561° E · ELEV: 14m
            </div>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading font-mono">NAVIGATION</h4>
            <ul className="footer-links">
              <li>
                <button onClick={scrollToTop}>Home</button>
              </li>
              <li>
                <button onClick={() => document.getElementById('journey-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Scroll Journey (Earth to City)
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('overview-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore Mira Road
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('connectivity-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Transit & Connectivity
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('lifestyle-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Lifestyle & Social Ecosystem
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-telemetry-col">
            <h4 className="footer-heading font-mono">JOURNEY STAGES</h4>
            <div className="footer-stage-list font-mono">
              <div className="footer-stage-item">
                <span className="stage-num">01</span>
                <span>Earth Orbit (12,740 km)</span>
              </div>
              <div className="footer-stage-item">
                <span className="stage-num">02</span>
                <span>India Subcontinent (1,800 km)</span>
              </div>
              <div className="footer-stage-item">
                <span className="stage-num">03</span>
                <span>Maharashtra Coast (350 km)</span>
              </div>
              <div className="footer-stage-item">
                <span className="stage-num">04</span>
                <span>Mira Road Urban Grid (250 m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copy">
            © {new Date().getFullYear()} Mira Road Digital Twin Experience. All rights reserved.
          </div>

          <button onClick={scrollToTop} className="back-to-top-btn" title="Back to top">
            <span>BACK TO TOP</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}
