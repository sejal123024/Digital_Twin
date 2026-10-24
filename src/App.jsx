import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import CinematicScrollJourney from './components/CinematicScrollJourney';
import MiraRoadOverview from './components/MiraRoadOverview';
import ConnectivitySection from './components/ConnectivitySection';
import LifestyleSection from './components/LifestyleSection';
import RealEstateSection from './components/RealEstateSection';
import Footer from './components/Footer';
import ExploreModal from './components/ExploreModal';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginPage from './components/LoginPage';

function LandingPage() {
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="app-layout">
      {/* 1. Global Navigation Bar */}
      <Navbar onOpenExploreModal={() => setIsExploreModalOpen(true)} />

      {/* 2. Home Section: Clean Cinematic Scroll-Driven Earth to Mira Road Journey */}
      <CinematicScrollJourney videoSrc="/journey.mp4" />

      {/* 3. The City Arrival: "Your Journey Ends Here. Your Exploration Begins." */}
      <MiraRoadOverview />

      {/* 4. Multimodal Transit & Connectivity Grid */}
      <ConnectivitySection />

      {/* 5. Social & Urban Ecosystem */}
      <LifestyleSection />

      {/* 6. Real Estate & Development Landscape */}
      <RealEstateSection />

      {/* 7. Footer */}
      <Footer />

      {/* 8. Interactive Animated Registration / Explore Modal */}
      <ExploreModal 
        isOpen={isExploreModalOpen} 
        onClose={() => setIsExploreModalOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Secure Firebase Login & Register Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Digital Twin Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
