import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X, Globe2, ChevronRight, LogIn, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_SECTIONS = [
  { id: 'home-journey', label: 'Home', action: 'scrollTop' },
  { id: 'overview-section', label: 'Explore Mira Road' },
  { id: 'connectivity-section', label: 'Connectivity' },
  { id: 'lifestyle-section', label: 'Lifestyle' },
  { id: 'realestate-section', label: 'Real Estate' }
];

export default function Navbar({ onOpenExploreModal }) {
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home-journey');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Determine which section is currently in view
      const navHeight = 80;
      const scrollY = window.scrollY + navHeight + 100; // offset for better detection

      let current = 'home-journey';
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollY >= top && scrollY < bottom) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (section) => {
    setMobileMenuOpen(false);
    if (section.action === 'scrollTop') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(section.id);
    }
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container-wide navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-box">
            <Globe2 className="brand-icon" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">MIRA ROAD</span>
            <span className="brand-subtitle">DIGITAL TWIN · 19.2812° N</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          {NAV_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section)}
              className={`nav-link ${activeSection === section.id ? 'nav-link-active' : ''}`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <Link 
              to="/dashboard"
              className="btn btn-primary nav-cta"
              id="dashboard-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={16} />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenExploreModal}
                className="btn btn-outline"
                id="navbar-signin-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.48rem 1rem',
                  fontSize: '0.84rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button 
                onClick={() => {
                  if (onOpenExploreModal) {
                    onOpenExploreModal();
                  } else {
                    scrollToSection('overview-section');
                  }
                }} 
                className="btn btn-primary nav-cta"
                id="explore-city-btn"
              >
                <Compass size={16} />
                <span>Explore City</span>
              </button>
            </>
          )}

          {/* Mobile Toggle Button */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavClick(section)}
                className={`mobile-nav-link ${activeSection === section.id ? 'mobile-nav-link-active' : ''}`}
              >
                <span>{section.label}</span>
                <ChevronRight size={16} />
              </button>
            ))}
            <div className="mobile-menu-cta" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                  <User size={16} />
                  <span>Open Digital Twin Dashboard</span>
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenExploreModal) onOpenExploreModal();
                    }} 
                    className="btn btn-outline" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <LogIn size={16} />
                    <span>Sign In with Firebase</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenExploreModal) {
                        onOpenExploreModal();
                      } else {
                        scrollToSection('overview-section');
                      }
                    }} 
                    className="btn btn-primary" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <Compass size={16} />
                    <span>Explore City</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
