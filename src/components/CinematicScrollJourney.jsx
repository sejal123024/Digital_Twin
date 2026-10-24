import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

const TOTAL_FRAMES = 167;

const STAGES = [
  { id: 'earth', label: 'Earth Orbit', progressRange: [0, 0.28], altitude: '12,740 km' },
  { id: 'india', label: 'India', progressRange: [0.28, 0.58], altitude: '1,800 km' },
  { id: 'maharashtra', label: 'Maharashtra', progressRange: [0.58, 0.82], altitude: '350 km' },
  { id: 'miraroad', label: 'Mira Road', progressRange: [0.82, 1.0], altitude: '250 m' }
];

export default function CinematicScrollJourney() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);


  const getFramePath = (index) => {
    const num = String(index + 1).padStart(4, '0');
    return `/frames/frame_${num}.jpg`;
  };

  // Render a specific frame with true 100% full-bleed cover
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[index];
    let resolvedIndex = index;

    // If requested frame is not ready, fallback to nearest loaded frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      let found = false;
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = imagesRef.current[index - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          resolvedIndex = index - offset;
          found = true;
          break;
        }
        const next = imagesRef.current[index + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          resolvedIndex = index + offset;
          found = true;
          break;
        }
      }
      if (!found) return; // Keep canvas as-is, never clear to black
    }

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // True mathematical cover to prevent letterboxing
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    // Draw directly over canvas — never clearRect first, preventing any blank flash
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrameRef.current = resolvedIndex;
  }, []);

  // Resize canvas to match display bounding box with DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetWidth = Math.round((rect.width || window.innerWidth) * dpr);
    const targetHeight = Math.round((rect.height || window.innerHeight) * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Preload all 167 frames into memory
  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES);
    let count = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        count++;
        // If this is the active frame or the first frame on startup, render immediately
        if (i === currentFrameRef.current || (i === 0 && lastDrawnFrameRef.current === -1)) {
          renderFrame(currentFrameRef.current);
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${i + 1}:`, getFramePath(i));
      };

      imagesRef.current[i] = img;
    }

    // Set initial canvas buffer dimensions
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [renderFrame, resizeCanvas]);

  // Robust progress calculation and frame mapping on scroll & RAF
  useEffect(() => {
    let animId = null;

    const updateScrollAnimation = () => {
      const container = containerRef.current;
      const sticky = stickyRef.current;

      if (container && sticky) {
        const containerRect = container.getBoundingClientRect();
        // Section coordinates relative to document
        const sectionStart = containerRect.top + window.scrollY;
        const maxScrollDist = container.offsetHeight - sticky.offsetHeight;

        const scrollY = window.scrollY;

        // progress = clamp((scrollY - sectionStart) / (sectionEnd - sectionStart), 0, 1)
        let progress = 0;
        if (maxScrollDist > 0) {
          progress = (scrollY - sectionStart) / maxScrollDist;
          progress = Math.max(0, Math.min(1, progress));
        }

        // frameIndex = Math.round(progress * (totalFrames - 1))
        const targetIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(progress * (TOTAL_FRAMES - 1)))
        );

        setScrollProgress(progress);
        setActiveFrameIndex(targetIndex);

        // Determine active stage
        for (let i = 0; i < STAGES.length; i++) {
          const [min, max] = STAGES[i].progressRange;
          if (progress >= min && progress <= max) {
            setCurrentStageIndex(i);
            break;
          } else if (progress > max && i === STAGES.length - 1) {
            setCurrentStageIndex(i);
          }
        }

        if (targetIndex !== currentFrameRef.current) {
          currentFrameRef.current = targetIndex;
          renderFrame(targetIndex);
        }
      }
    };

    const loop = () => {
      updateScrollAnimation();
      animId = requestAnimationFrame(loop);
    };

    // Run loop and also bind to scroll event for instantaneous response
    animId = requestAnimationFrame(loop);
    window.addEventListener('scroll', updateScrollAnimation, { passive: true });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('scroll', updateScrollAnimation);
    };
  }, [renderFrame]);

  // Jump to specific stage on click
  const handleStageClick = (stageIndex) => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    if (!container || !sticky) return;

    const stage = STAGES[stageIndex];
    const targetProgress = (stage.progressRange[0] + stage.progressRange[1]) / 2;

    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const maxScrollDist = container.offsetHeight - sticky.offsetHeight;
    const targetScrollY = containerTop + (targetProgress * maxScrollDist);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  const heroOpacity = Math.max(0, 1 - scrollProgress * 5);
  const heroTranslateY = -(scrollProgress * 40);

  return (
    <section 
      id="home-journey" 
      ref={containerRef} 
      className="fullscreen-journey-section"
    >

      {/* Sticky Stage */}
      <div ref={stickyRef} className="fullscreen-journey-sticky">
        
        {/* Fullscreen HTML5 Canvas (100% width and height) */}
        <canvas 
          ref={canvasRef} 
          className="journey-fullscreen-canvas"
          aria-label="Earth to Mira Road cinematic zoom journey"
        />

        {/* Floating Centered Hero Header */}
        <div 
          className="hero-floating-header"
          style={{ 
            opacity: heroOpacity,
            transform: `translate(-50%, ${heroTranslateY}px)`,
            pointerEvents: heroOpacity < 0.15 ? 'none' : 'auto'
          }}
        >
          <div className="eyebrow-pill">
            <span className="eyebrow-dot"></span>
            <span>DISCOVER THE CITY</span>
          </div>

          <h1 className="hero-main-title">
            From Earth to <span className="hero-title-cyan">Mira Road</span>
          </h1>

          <p className="hero-lead-desc">
            A cinematic journey into Maharashtra's urban landscape.
          </p>
        </div>

        {/* Floating Minimal Stage Indicator Bar (Bottom Center) */}
        <div className="journey-floating-stage-bar">
          {STAGES.map((stage, idx) => {
            const isActive = idx === currentStageIndex;
            const isPast = scrollProgress > stage.progressRange[1];

            return (
              <button 
                key={stage.id} 
                onClick={() => handleStageClick(idx)}
                className={`stage-pill-btn ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                title={`Jump to ${stage.label}`}
              >
                <span className="stage-pill-dot" />
                <span className="stage-pill-label">{stage.label}</span>
                <span className="stage-pill-alt font-mono">{stage.altitude}</span>
                {idx < STAGES.length - 1 && (
                  <ChevronRight size={12} className="stage-pill-chevron" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Viewport Progress Line */}
        <div className="journey-viewport-progress">
          <div 
            className="journey-progress-fill" 
            style={{ width: `${scrollProgress * 100}%` }} 
          />
        </div>

      </div>
    </section>
  );
}
