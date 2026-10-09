import React, { useEffect, useRef } from 'react';

/**
 * AnimatedHeroBackground
 * Organic fluid motion background inspired by flowing blue liquid glass / liquid silk.
 * 
 * Multi-layer architecture:
 * 1. Deep Midnight & Royal Blue atmospheric gradient base (#06152F & #0B2D68).
 * 2. Continuously morphing liquid glass organic SVG blobs with smooth SVG <animate> path interpolation.
 * 3. Flowing translucent wave forms and liquid silk highlights.
 * 4. Drifting cyan & electric-blue plasma nodes with diagonal translation & gentle rotation.
 * 5. Cinematic edge lighting that softly illuminates the perimeter.
 * 6. High-contrast dark center well for white text readability.
 * 7. Seamless bottom blend and subtle tactile grain overlay.
 */
export const AnimatedHeroBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    // Check user accessibility preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    if (mediaQuery.matches) {
      return () => mediaQuery.removeEventListener('change', motionListener);
    }

    // Physics-smoothed cursor response
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xRatio = (e.clientX / innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / innerHeight - 0.5) * 2;
      targetPosRef.current = { x: xRatio * 22, y: yRatio * 18 };
    };

    const updateMotion = () => {
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * 0.045;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * 0.045;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-shift-x', `${currentPosRef.current.x.toFixed(2)}px`);
        containerRef.current.style.setProperty('--mouse-shift-y', `${currentPosRef.current.y.toFixed(2)}px`);
      }
      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      mediaQuery.removeEventListener('change', motionListener);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="hero-animated-bg-container" ref={containerRef} aria-hidden="true">
      {/* 1. Deep Midnight Base: #06152F to #0B2D68 */}
      <div className="hero-bg-deep-base" />

      {/* 2. Fluid Mesh Layer: Overlapping organic gradient volumes */}
      <div className="hero-bg-mesh-layer">
        {/* Contrast protection well in center for clean text readability */}
        <div className="mesh-orb orb-deep-center" />

        {/* Large flowing organic liquid bodies */}
        <div className="mesh-orb orb-electric-left" />
        <div className="mesh-orb orb-cyan-right" />
        <div className="mesh-orb orb-luminous-top" />
        <div className="mesh-orb orb-luminous-bottom" />
        <div className="mesh-orb orb-floating-plasma" />
      </div>

      {/* 3. Continuously Morphing Liquid Glass Organic SVG Shapes */}
      <svg className="hero-bg-organic-morphs" viewBox="0 0 1600 1000" fill="none" preserveAspectRatio="none">
        <defs>
          {/* Liquid Glass Gradient 1 (Left Fluid Body) */}
          <linearGradient id="liquidGlassGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#20C8FF" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#087BFF" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#0B2D68" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06152F" stopOpacity="0" />
          </linearGradient>

          {/* Liquid Glass Gradient 2 (Right Fluid Body) */}
          <linearGradient id="liquidGlassGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#73B7FF" stopOpacity="0.48" />
            <stop offset="40%" stopColor="#20C8FF" stopOpacity="0.30" />
            <stop offset="75%" stopColor="#087BFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06152F" stopOpacity="0" />
          </linearGradient>

          {/* Liquid Silk High-Gloss Sheen */}
          <linearGradient id="silkSheenGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="30%" stopColor="#73B7FF" stopOpacity="0.28" />
            <stop offset="65%" stopColor="#20C8FF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0B2D68" stopOpacity="0" />
          </linearGradient>

          {/* Flowing Translucent Wave Stream */}
          <linearGradient id="waveStreamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#087BFF" stopOpacity="0" />
            <stop offset="30%" stopColor="#20C8FF" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#73B7FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#087BFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Morphing Organic Fluid Shape A (Left side liquid fold) */}
        <path
          className="organic-fluid-shape fluid-shape-left"
          fill="url(#liquidGlassGrad1)"
          d="M 150,220 C 350,90 620,380 480,680 C 340,980 80,820 -80,660 C -240,500 -50,350 150,220 Z"
        >
          {!prefersReducedMotion && (
            <animate
              attributeName="d"
              dur="24s"
              repeatCount="indefinite"
              values="
                M 150,220 C 350,90 620,380 480,680 C 340,980 80,820 -80,660 C -240,500 -50,350 150,220 Z;
                M 220,180 C 440,160 560,480 410,740 C 260,1000 -20,880 -120,690 C -220,500 -20,200 220,180 Z;
                M 180,280 C 380,120 640,340 520,650 C 400,960 120,860 -40,640 C -200,420 -20,440 180,280 Z;
                M 150,220 C 350,90 620,380 480,680 C 340,980 80,820 -80,660 C -240,500 -50,350 150,220 Z
              "
            />
          )}
        </path>

        {/* Morphing Organic Fluid Shape B (Right side liquid highlight) */}
        <path
          className="organic-fluid-shape fluid-shape-right"
          fill="url(#liquidGlassGrad2)"
          d="M 1450,180 C 1650,340 1620,680 1420,820 C 1220,960 980,800 1020,580 C 1060,360 1250,20 1450,180 Z"
        >
          {!prefersReducedMotion && (
            <animate
              attributeName="d"
              dur="28s"
              repeatCount="indefinite"
              values="
                M 1450,180 C 1650,340 1620,680 1420,820 C 1220,960 980,800 1020,580 C 1060,360 1250,20 1450,180 Z;
                M 1380,140 C 1580,280 1680,620 1490,790 C 1300,960 1020,850 970,640 C 920,430 1180,0 1380,140 Z;
                M 1490,230 C 1690,410 1560,720 1370,860 C 1180,1000 950,760 1050,540 C 1150,320 1290,50 1490,230 Z;
                M 1450,180 C 1650,340 1620,680 1420,820 C 1220,960 980,800 1020,580 C 1060,360 1250,20 1450,180 Z
              "
            />
          )}
        </path>

        {/* Flowing Liquid Silk Wave Ribbon */}
        <path
          className="organic-wave-ribbon wave-ribbon-silk"
          stroke="url(#silkSheenGrad)"
          strokeWidth="130"
          strokeLinecap="round"
          d="M -100,160 Q 420,440 960,170 T 1720,310"
        >
          {!prefersReducedMotion && (
            <animate
              attributeName="d"
              dur="22s"
              repeatCount="indefinite"
              values="
                M -100,160 Q 420,440 960,170 T 1720,310;
                M -100,210 Q 460,380 920,230 T 1720,270;
                M -100,130 Q 380,480 980,140 T 1720,340;
                M -100,160 Q 420,440 960,170 T 1720,310
              "
            />
          )}
        </path>

        {/* Translucent Traveling Wave Stream */}
        <path
          className="organic-wave-ribbon wave-ribbon-stream"
          stroke="url(#waveStreamGrad)"
          strokeWidth="90"
          strokeLinecap="round"
          d="M -120,620 Q 380,240 890,480 T 1740,360"
        >
          {!prefersReducedMotion && (
            <animate
              attributeName="d"
              dur="26s"
              repeatCount="indefinite"
              values="
                M -120,620 Q 380,240 890,480 T 1740,360;
                M -120,570 Q 420,290 850,430 T 1740,410;
                M -120,660 Q 350,200 930,520 T 1740,320;
                M -120,620 Q 380,240 890,480 T 1740,360
              "
            />
          )}
        </path>
      </svg>

      {/* 4. Cinematic Edge Lighting */}
      <div className="hero-edge-glow edge-glow-left" />
      <div className="hero-edge-glow edge-glow-right" />
      <div className="hero-edge-glow edge-glow-top" />

      {/* 5. Tactile Fine-Grain Noise Overlay */}
      <div className="hero-bg-noise-overlay" />

      {/* 6. Smooth Seamless Bottom Blend into Page White */}
      <div className="hero-bg-bottom-fade" />
    </div>
  );
};
