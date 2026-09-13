import React, { useEffect, useRef, useState } from 'react';

/**
 * Rising Light / Dawn Entrance Animation for e-Gurukulam for IAS
 *
 * Visual Atmosphere & Sequence:
 * 1. Initial State: Deep atmospheric background (dark charcoal / twilight tone)
 *    with the e-Gurukulam emblem in subtle outline at the center.
 * 2. The Sunrise Arc: A warm, radiant golden-amber glow (radial gradient) emerges
 *    from the bottom center, slowly ascending and illuminating the center emblem.
 * 3. The Horizon Glow: As the light reaches the center, warm rays subtly disperse across the screen.
 * 4. Text Caption: Classical typography beneath the emblem:
 *    "e-Gurukulam for IAS • The Dawn of Knowledge"
 * 5. Seamless Dissolve: Once data/route hydration is ready, the golden glow expands outwards,
 *    transitioning into the site's warm parchment background (#FAF8F5) with 0ms bypass for cached data.
 */
export default function ParticleConvergenceLoader({
  isReady = false,
  label = 'Hydrating Knowledge Base...',
  sublabel = 'e-Gurukulam for IAS • The Dawn of Knowledge',
  onFinished,
  fullScreen = true,
}) {
  // If data is already available synchronously on initial mount, bypass immediately (0ms wait)
  const initiallyReady = useRef(isReady);
  if (initiallyReady.current) {
    return null;
  }

  const canvasRef = useRef(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [illumination, setIllumination] = useState(0); // 0 to 1 emblem illumination
  const [tick, setTick] = useState(0);

  // Trigger snappy dissolve transition once isReady becomes true
  useEffect(() => {
    if (isReady && !isDissolving) {
      setIsDissolving(true);
      const timer = setTimeout(() => {
        setIsExited(true);
        if (onFinished) onFinished();
      }, 520);
      return () => clearTimeout(timer);
    }
  }, [isReady, isDissolving, onFinished]);

  useEffect(() => {
    if (isExited) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let startTime = performance.now();
    let dissolveStartTime = null;

    // Floating dawn dust motes (golden light particles)
    const MOTE_COUNT = 38;
    const motes = [];

    const initMotes = (w, h) => {
      motes.length = 0;
      for (let i = 0; i < MOTE_COUNT; i++) {
        motes.push({
          x: w * (0.2 + Math.random() * 0.6),
          y: h * (0.3 + Math.random() * 0.7),
          speedY: 0.3 + Math.random() * 0.5,
          speedX: (Math.random() - 0.5) * 0.25,
          radius: 0.8 + Math.random() * 1.8,
          alpha: 0.1 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      if (motes.length === 0) initMotes(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (now) => {
      const elapsed = (now - startTime) / 1000;

      // Handle dissolve timing when ready
      let dissolveProgress = 0;
      if (isDissolving) {
        if (!dissolveStartTime) dissolveStartTime = now;
        dissolveProgress = Math.min(1, (now - dissolveStartTime) / 500);
      }

      // Sunrise Arc: Smooth cubic rise over 1.6s
      const riseDuration = 1.6;
      const rawRise = Math.min(1, elapsed / riseDuration);
      const riseProgress = 1 - Math.pow(1 - rawRise, 3);

      // Subtle breathing at zenith
      const breathe = Math.sin(elapsed * 1.6) * 0.025;
      const currentProgress = Math.min(1.05, riseProgress + (rawRise >= 1 ? breathe : 0));

      // Illumination of center emblem
      const illum = Math.min(1, Math.max(0, (currentProgress - 0.15) / 0.85));
      setIllumination(illum);
      setTick(elapsed);

      // 1. CLEAR & DEEP ATMOSPHERIC TWILIGHT BACKGROUND
      ctx.clearRect(0, 0, width, height);

      const twilightGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, 10,
        width * 0.5, height * 0.45, Math.max(width, height) * 0.85
      );
      twilightGrad.addColorStop(0, '#19120E');
      twilightGrad.addColorStop(0.45, '#120D0B');
      twilightGrad.addColorStop(1, '#090706');

      ctx.fillStyle = twilightGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. THE SUNRISE ARC (Ascending Golden-Amber Volumetric Sphere)
      const sunX = width * 0.5;
      const sunStartY = height * 1.15;
      const sunTargetY = height * 0.52;
      const sunY = sunStartY - (sunStartY - sunTargetY) * currentProgress;

      let baseSunRadius = Math.max(width, height) * (0.38 + 0.12 * currentProgress);
      if (dissolveProgress > 0) {
        // Dramatic radiant bloom outwards filling screen
        baseSunRadius *= (1 + dissolveProgress * 3.8);
      }

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, baseSunRadius);
      sunGrad.addColorStop(0.0, 'rgba(255, 252, 240, 0.98)');
      sunGrad.addColorStop(0.12, 'rgba(252, 214, 98, 0.92)');
      sunGrad.addColorStop(0.26, 'rgba(245, 166, 35, 0.78)');
      sunGrad.addColorStop(0.45, 'rgba(212, 130, 48, 0.52)');
      sunGrad.addColorStop(0.68, 'rgba(140, 58, 39, 0.28)');
      sunGrad.addColorStop(0.88, 'rgba(64, 20, 15, 0.10)');
      sunGrad.addColorStop(1.0, 'rgba(9, 7, 6, 0.0)');

      ctx.save();
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, baseSunRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. THE HORIZON GLOW & RADIANT DISPERSING RAYS
      if (currentProgress > 0.25) {
        const rayIntensity = Math.min(1, (currentProgress - 0.25) / 0.75) * (1 - dissolveProgress * 0.4);

        // A. Subtle Horizon Elliptical Light Wave
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const horizonY = height * 0.52;
        const horizonGrad = ctx.createRadialGradient(
          sunX, horizonY, 20,
          sunX, horizonY, width * 0.7
        );
        horizonGrad.addColorStop(0, `rgba(250, 200, 75, ${0.4 * rayIntensity})`);
        horizonGrad.addColorStop(0.35, `rgba(212, 150, 45, ${0.22 * rayIntensity})`);
        horizonGrad.addColorStop(0.7, `rgba(140, 58, 39, ${0.08 * rayIntensity})`);
        horizonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = horizonGrad;
        ctx.beginPath();
        ctx.ellipse(sunX, horizonY, width * 0.85, height * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // B. Volumetric Crepuscular Sunbeams / God-Rays
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const rayCount = 12;
        const maxRayLen = Math.max(width, height) * 0.95;

        for (let i = 0; i < rayCount; i++) {
          const baseAngle = -Math.PI * 0.86 + (i / (rayCount - 1)) * (Math.PI * 0.72);
          const rayWobble = Math.sin(elapsed * 0.8 + i * 0.6) * 0.035;
          const angle = baseAngle + rayWobble;
          const rayWidth = 0.05 + Math.sin(elapsed * 0.6 + i) * 0.015;
          const rayAlpha = (0.075 + Math.sin(elapsed * 1.4 + i * 0.8) * 0.035) * rayIntensity;

          const rGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, maxRayLen);
          rGrad.addColorStop(0, `rgba(255, 248, 225, ${rayAlpha * 2.0})`);
          rGrad.addColorStop(0.25, `rgba(245, 178, 54, ${rayAlpha * 1.3})`);
          rGrad.addColorStop(0.65, `rgba(212, 140, 45, ${rayAlpha * 0.5})`);
          rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.arc(sunX, sunY, maxRayLen, angle - rayWidth / 2, angle + rayWidth / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. FLOATING DAWN DUST MOTES
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const m of motes) {
        m.y -= m.speedY;
        m.x += m.speedX + Math.sin(elapsed + m.phase) * 0.2;
        if (m.y < height * 0.2) {
          m.y = height * (0.8 + Math.random() * 0.15);
          m.x = width * (0.25 + Math.random() * 0.5);
        }

        const moteAlpha = m.alpha * (0.4 + 0.6 * illum) * (1 - dissolveProgress);
        ctx.fillStyle = `rgba(255, 235, 160, ${moteAlpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. SEAMLESS DISSOLVE OVERLAY TO PARCHMENT (#FAF8F5)
      if (dissolveProgress > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, dissolveProgress * 1.35);
        ctx.fillStyle = '#FAF8F5';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      if (!isExited) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isExited, isDissolving]);

  if (isExited) return null;

  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-[9999]' : 'relative w-full min-h-[550px]'
      } overflow-hidden flex flex-col items-center justify-center select-none transition-all duration-500 ease-out ${
        isDissolving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#0C0908',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Dynamic Rising Light / Dawn Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Center Stage: e-Gurukulam Emblem & Classical Typography */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-xl pointer-events-none transition-all duration-700">
        
        {/* Emblem Container with Celestial Sunburst Halo */}
        <div className="relative mb-6 flex items-center justify-center">
          
          {/* Volumetric Radial Aura */}
          <div
            className="absolute -inset-8 rounded-full pointer-events-none transition-all duration-700"
            style={{
              background: `radial-gradient(circle, rgba(245, 178, 54, ${0.15 + 0.5 * illumination}) 0%, rgba(212, 175, 55, ${0.08 + 0.3 * illumination}) 50%, transparent 75%)`,
              filter: `blur(${14 + 14 * illumination}px)`,
              transform: `scale(${0.9 + 0.18 * illumination})`,
            }}
          />

          {/* Concentric Celestial Rings / Subtle Orbital Horizon */}
          <div
            className="absolute -inset-3 rounded-full border border-[#D4AF37]/35 pointer-events-none transition-all duration-700"
            style={{
              opacity: 0.3 + 0.55 * illumination,
              transform: `rotate(${tick * 8}deg)`,
            }}
          />
          <div
            className="absolute -inset-5 rounded-full border border-dashed border-[#F3B236]/25 pointer-events-none transition-all duration-700"
            style={{
              opacity: 0.2 + 0.45 * illumination,
              transform: `rotate(${-tick * 5}deg)`,
            }}
          />

          {/* Center Emblem: Starts in subtle outline, brilliantly illuminates with dawn */}
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-700"
            style={{
              backgroundColor: 'rgba(18, 14, 12, 0.92)',
              border: `1.5px solid rgba(212, 175, 55, ${0.35 + 0.65 * illumination})`,
              boxShadow: `0 0 ${16 + 28 * illumination}px rgba(245, 178, 54, ${0.25 + 0.65 * illumination}), inset 0 0 14px rgba(212, 175, 55, ${0.2 + 0.4 * illumination})`,
            }}
          >
            <img
              src="/favicon-512x512.png"
              alt="e-Gurukulam for IAS Emblem"
              className="w-full h-full object-contain p-2 transition-all duration-700"
              style={{
                filter: `drop-shadow(0 0 10px rgba(245, 178, 54, ${0.3 + 0.7 * illumination})) contrast(${1.05 + 0.15 * illumination}) brightness(${0.75 + 0.45 * illumination})`,
                opacity: 0.3 + 0.7 * illumination,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Text Caption: Subtle typography beneath the emblem */}
        <div className="space-y-2.5 transition-all duration-700">
          <div className="space-y-1">
            <h2
              className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.22em] uppercase transition-all duration-700 leading-tight"
              style={{
                letterSpacing: '0.22em',
                textShadow: `0 0 ${12 + 16 * illumination}px rgba(245, 178, 54, ${0.35 + 0.55 * illumination}), 0 2px 4px rgba(0,0,0,0.85)`,
              }}
            >
              <span className="bg-gradient-to-r from-[#FDF8EC] via-[#F8E29D] to-[#E5A93C] bg-clip-text text-transparent">
                e-Gurukulam for IAS
              </span>
            </h2>
            <p 
              className="text-xs sm:text-sm font-serif italic tracking-[0.24em] transition-all duration-700 font-medium"
              style={{
                color: '#E5C07B',
                opacity: 0.45 + 0.55 * illumination,
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              The Dawn of Knowledge
            </p>
          </div>

          {/* Soft status badge for active route hydration */}
          {label && (
            <div
              className="pt-1.5 transition-opacity duration-500"
              style={{ opacity: 0.4 + 0.6 * illumination }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A120F]/90 border border-[#D4AF37]/30 text-[#FAF5EE] text-[10px] font-sans font-medium tracking-widest uppercase shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F3B236] animate-ping" />
                <span className="text-[#F3B236]">{label}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export { ParticleConvergenceLoader as RisingDawnLoader };
