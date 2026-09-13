import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom Particle Formation Loader for e-Gurukulam for IAS
 *
 * Floating ambient particles with rich gold & maroon palette gradually converge
 * toward the center to assemble the shape/silhouette of the e-Gurukulam emblem.
 * Features a subtle shimmer effect and instant 0ms bypass for cached data.
 */
export default function ParticleConvergenceLoader({
  isReady = false,
  label = 'Hydrating Knowledge Base...',
  sublabel = 'e-Gurukulam for IAS • Tradition of Wisdom & Modern Rigor',
  onFinished,
  fullScreen = true,
}) {
  // If data was already available synchronously on initial mount, skip completely (0ms bypass)
  const initiallyReady = useRef(isReady);
  const canvasRef = useRef(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const [isExited, setIsExited] = useState(false);

  // Trigger smooth fade-out and unmount once isReady becomes true
  useEffect(() => {
    if (initiallyReady.current) return;
    if (isReady && !isDissolving) {
      setIsDissolving(true);
      const timer = setTimeout(() => {
        setIsExited(true);
        if (onFinished) onFinished();
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isReady, isDissolving, onFinished]);

  useEffect(() => {
    if (initiallyReady.current || isExited) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Palette: Regal Golds and Master Maroons
    const GOLD_PALETTE = ['#D4AF37', '#F3B236', '#F8D886', '#C5A059', '#E5C07B', '#FDF8EC'];
    const MAROON_PALETTE = ['#8C3A27', '#6C1D18', '#B2533E', '#A63F28', '#9E2A2B', '#7A2219'];

    const PARTICLE_COUNT = 380;
    let particles = [];
    let targetPoints = [];
    let logoLoaded = false;

    // Generate procedural emblem target points (Radiating Sun/Tree of Knowledge + Lotus Core)
    const generateFallbackEmblemPoints = (cx, cy, scale = 1) => {
      const points = [];
      const numPoints = PARTICLE_COUNT;

      // 1. Central Core / Sun / Dome (approx 90 points)
      for (let i = 0; i < 90; i++) {
        const angle = (i / 90) * Math.PI * 2;
        const r = (16 + Math.sin(angle * 6) * 3) * scale;
        points.push({
          x: cx + Math.cos(angle) * r,
          y: cy - 10 * scale + Math.sin(angle) * r,
          isMaroon: i % 2 === 0,
        });
      }

      // 2. Radiating Crown / Wisdom Rays (approx 120 points)
      for (let i = 0; i < 120; i++) {
        const rayAngle = (i / 120) * Math.PI * 2;
        const rayLength = (28 + Math.sin(rayAngle * 12) * 14) * scale;
        points.push({
          x: cx + Math.cos(rayAngle) * rayLength,
          y: cy - 10 * scale + Math.sin(rayAngle) * rayLength,
          isMaroon: i % 3 === 0,
        });
      }

      // 3. Open Book / Gurukulam Foundation Wings (approx 110 points)
      for (let i = 0; i < 110; i++) {
        const t = (i / 110) * 2 - 1; // -1 to 1
        const bx = cx + t * 55 * scale;
        // parabolic curve of open parchment pages
        const by = cy + (22 + Math.abs(t) * 16 - Math.pow(t, 2) * 8) * scale;
        points.push({
          x: bx,
          y: by,
          isMaroon: i % 2 !== 0,
        });
      }

      // 4. Sacred Knowledge Flame Tip (approx 60 points)
      for (let i = 0; i < 60; i++) {
        const t = i / 60; // 0 to 1
        const fy = cy - (12 + t * 45) * scale;
        const fx = cx + Math.sin(t * Math.PI) * (14 * (1 - t)) * Math.sin(i) * scale;
        points.push({
          x: fx,
          y: fy,
          isMaroon: false, // Gold flame
        });
      }

      return points;
    };

    // Load actual Logo image to sample exact coordinate silhouette
    const loadLogoSilhouette = (cx, cy) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/images/Logo.png';
      img.onload = () => {
        try {
          const offCanvas = document.createElement('canvas');
          const offCtx = offCanvas.getContext('2d');
          const sampleSize = 160;
          offCanvas.width = sampleSize;
          offCanvas.height = sampleSize;

          offCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imgData = offCtx.getImageData(0, 0, sampleSize, sampleSize);
          const pixels = imgData.data;
          const extracted = [];

          // Sample pixels with alpha > 120
          for (let y = 0; y < sampleSize; y += 4) {
            for (let x = 0; x < sampleSize; x += 4) {
              const idx = (y * sampleSize + x) * 4;
              const a = pixels[idx + 3];
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];

              if (a > 120) {
                const isDarkOrMaroon = r > g && r > b;
                extracted.push({
                  relX: (x - sampleSize / 2) * 1.15,
                  relY: (y - sampleSize / 2) * 1.15 - 12,
                  isMaroon: isDarkOrMaroon,
                });
              }
            }
          }

          if (extracted.length > 50) {
            // Downsample or interpolate to match PARTICLE_COUNT
            const newTargets = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const sample = extracted[Math.floor((i / PARTICLE_COUNT) * extracted.length)];
              newTargets.push({
                x: cx + sample.relX,
                y: cy + sample.relY,
                isMaroon: sample.isMaroon,
              });
            }
            targetPoints = newTargets;
            logoLoaded = true;

            // Re-assign target coordinates to particles smoothly
            particles.forEach((p, idx) => {
              if (targetPoints[idx]) {
                p.tx = targetPoints[idx].x;
                p.ty = targetPoints[idx].y;
                p.isMaroon = targetPoints[idx].isMaroon;
                p.color = p.isMaroon
                  ? MAROON_PALETTE[Math.floor(Math.random() * MAROON_PALETTE.length)]
                  : GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
              }
            });
          }
        } catch (e) {
          // Keep procedural fallback if image data cannot be read
        }
      };
    };

    // Resize handler with High-DPI support
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const cx = width / 2;
      const cy = height / 2 - 25;

      if (!logoLoaded) {
        targetPoints = generateFallbackEmblemPoints(cx, cy, 1.25);
      } else {
        loadLogoSilhouette(cx, cy);
      }
    };

    handleResize();
    const cx = width / 2;
    const cy = height / 2 - 25;
    targetPoints = generateFallbackEmblemPoints(cx, cy, 1.25);
    loadLogoSilhouette(cx, cy);

    // Initialize particles floating smoothly from random positions
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const target = targetPoints[i] || { x: cx, y: cy, isMaroon: i % 2 === 0 };
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * Math.min(width, height) * 0.45;

      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        tx: target.x,
        ty: target.y,
        radius: 1.2 + Math.random() * 2.2,
        isMaroon: target.isMaroon,
        color: target.isMaroon
          ? MAROON_PALETTE[Math.floor(Math.random() * MAROON_PALETTE.length)]
          : GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
        baseAlpha: 0.45 + Math.random() * 0.5,
        shimmerSpeed: 0.02 + Math.random() * 0.04,
        shimmerPhase: Math.random() * Math.PI * 2,
        ease: 0.035 + Math.random() * 0.045,
        harmonicFreq: 0.015 + Math.random() * 0.025,
      });
    }

    let startTime = performance.now();

    // Canvas Animation Loop
    const render = (time) => {
      const elapsed = (time - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      // Subtle ambient gold radial background glow behind center
      const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      radialGlow.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
      radialGlow.addColorStop(0.5, 'rgba(140, 58, 39, 0.06)');
      radialGlow.addColorStop(1, 'rgba(243, 235, 217, 0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Convergence Progress Multiplier (0 to 1 over first 1.8 seconds)
      const convergenceProgress = Math.min(1, elapsed / 1.8);
      const easedProgress = 1 - Math.pow(1 - convergenceProgress, 3);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Harmonic ambient drift
        const driftX = Math.cos(elapsed * 2 + p.shimmerPhase) * 1.2 * (1 - easedProgress * 0.7);
        const driftY = Math.sin(elapsed * 1.8 + p.shimmerPhase) * 1.2 * (1 - easedProgress * 0.7);

        // Smooth spring interpolation toward target point
        const targetX = p.tx + driftX;
        const targetY = p.ty + driftY;

        p.x += (targetX - p.x) * p.ease * easedProgress;
        p.y += (targetY - p.y) * p.ease * easedProgress;

        // If not fully converged, apply ambient floating drift
        if (easedProgress < 0.95) {
          p.x += p.vx * (1 - easedProgress);
          p.y += p.vy * (1 - easedProgress);
        }

        // Shimmering alpha oscillation
        const shimmer = Math.sin(elapsed * 3.5 + p.shimmerPhase);
        const currentAlpha = Math.max(0.15, Math.min(1, p.baseAlpha + shimmer * 0.28));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;

        // Subtle bloom glow for gold particles
        if (!p.isMaroon && p.radius > 2.0) {
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 6;
        } else if (p.isMaroon && p.radius > 2.2) {
          ctx.shadowColor = '#8C3A27';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.restore();
      }

      // Connecting constellation filaments between nearby converged particles
      if (easedProgress > 0.4) {
        ctx.save();
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.16)';
        for (let i = 0; i < particles.length; i += 4) {
          const p1 = particles[i];
          for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 26) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isExited]);

  if (initiallyReady.current || isExited) return null;

  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center'
          : 'relative w-full min-h-[60vh] flex flex-col items-center justify-center'
      } bg-[#F3EBD9] select-none transition-opacity duration-500 ease-out ${
        isDissolving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#F3EBD9',
        backgroundImage: 'radial-gradient(circle at center, #FCFAF6 0%, #F3EBD9 85%, #E8DEC8 100%)',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Particle Convergence Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Elegant Typography & Brand Identity Anchor (Positioned below converging emblem) */}
      <div className="relative z-10 text-center px-6 mt-48 sm:mt-56 max-w-lg space-y-3 pointer-events-none">
        {/* Shimmering Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/25 text-[#8C3A27] text-[11px] font-mono font-bold uppercase tracking-widest shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
          <span>{label}</span>
        </div>

        {/* Institution Title with Classical Gold & Maroon Contrast */}
        <div className="space-y-1">
          <h2
            className="font-serif-header text-xl sm:text-2xl font-black tracking-wider leading-snug drop-shadow-xs"
            style={{ color: '#2C221E' }}
          >
            e-Gurukulam for IAS
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-[#6C1D18] font-bold">
            {sublabel}
          </p>
        </div>

        {/* Subtle Horizontal Shimmer Progress Indicator */}
        <div className="w-36 sm:w-44 h-0.5 mx-auto bg-[#D5C3B0]/50 rounded-full overflow-hidden relative">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
