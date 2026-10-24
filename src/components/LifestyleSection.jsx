import React from 'react';
import { 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  UtensilsCrossed, 
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';

const LIFESTYLE_CATEGORIES = [
  {
    icon: HeartPulse,
    title: 'Healthcare & Wellness',
    tag: 'Medical Infrastructure',
    description: 'Home to leading multi-specialty hospitals with state-of-the-art emergency, cardiac, and pediatric care.',
    examples: ['BhaktiVedanta Hospital & Research Institute', 'Wockhardt Super Specialty', 'Thunga Hospital', 'Seven Eleven Hospital']
  },
  {
    icon: GraduationCap,
    title: 'Academic Institutions',
    tag: 'Education',
    description: 'Premier CBSE, ICSE, and Cambridge International curriculum schools with sprawling suburban campuses.',
    examples: ['Singapore International School', 'RBK International Academy', 'GCC International School', 'St. Xavier’s High School']
  },
  {
    icon: ShoppingBag,
    title: 'Retail & Entertainment',
    tag: 'Commercial Leisure',
    description: 'Modern shopping malls, hypermarkets, multiplexes, and bustling retail boulevards for weekend leisure.',
    examples: ['Maxus Mall & Multiplex', 'Thakur Mall & INOX', 'DMart & Star Bazaar Hubs', 'Beverly Park Commercial Avenue']
  },
  {
    icon: Trees,
    title: 'Recreation & Parks',
    tag: 'Open Green Spaces',
    description: 'Theme gardens, open joggers’ parks, community sports arenas, and proximity to national park trailheads.',
    examples: ['Vardhman Fantasy Theme Park', 'Joggers Park & Green Promenades', 'GCC Club & Sports Arena', 'Vasai Creek Waterfront Proximity']
  }
];

export default function LifestyleSection() {
  return (
    <section id="lifestyle-section" className="lifestyle-section section-spacing">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              <span>COMMUNITY & COMFORT</span>
            </div>
            <h2 className="font-display section-title">
              Social & <span className="text-gradient-cyan">Urban Ecosystem</span>
            </h2>
          </div>
          <p className="section-subtitle">
            A self-sustaining neighborhood offering world-class social infrastructure, educational institutions, healthcare centers, and leisure avenues.
          </p>
        </div>

        {/* 4-Card Lifestyle Grid */}
        <div className="lifestyle-grid">
          {LIFESTYLE_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="glass-card lifestyle-card">
                <div className="lifestyle-card-top">
                  <div className="lifestyle-icon-box">
                    <Icon size={24} className="lifestyle-icon" />
                  </div>
                  <span className="badge font-mono">{cat.tag}</span>
                </div>

                <h3 className="lifestyle-card-title font-display">{cat.title}</h3>
                <p className="lifestyle-card-desc">{cat.description}</p>

                <div className="lifestyle-examples-box">
                  <div className="examples-header font-mono">
                    <Sparkles size={12} />
                    <span>KEY CENTERS:</span>
                  </div>
                  <ul className="examples-list">
                    {cat.examples.map((item, i) => (
                      <li key={i} className="example-item">
                        <span className="example-bullet" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
