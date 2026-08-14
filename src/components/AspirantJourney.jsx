import React, { useEffect, useRef, useState } from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

const TOTAL_FRAMES = 31;
const START_FRAME = 5;
const END_FRAME = 35;

const getFramePath = (index) => {
  const frameNumber = String(index).padStart(3, '0');
  return `/aspirant-journey/ezgif-frame-${frameNumber}.png`;
};

const STEPS = [
  { num: "01", headline: "GUIDANCE", tagline: "Know What to Study", position: "top", x: 70 },
  { num: "02", headline: "STRATEGY", tagline: "Know How to Prepare", position: "bottom", x: 260 },
  { num: "03", headline: "AWARENESS", tagline: "Understand What Is Happening Around You", position: "top", x: 450 },
  { num: "04", headline: "PRACTICE", tagline: "Transform Knowledge into Answers", position: "bottom", x: 640 },
  { num: "05", headline: "PERSONALITY", tagline: "Prepare for the Responsibility Beyond the Exam", position: "top", x: 830 }
];

export default function AspirantJourney({ navigate }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentFrameNumber, setCurrentFrameNumber] = useState(START_FRAME);

  // 1. Preload all 31 frames (.png) into memory
  useEffect(() => {
    let loadedCount = 0;
    const loadedImgs = [];

    for (let i = START_FRAME; i <= END_FRAME; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        const jpgPath = `/aspirant-journey/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        img.src = jpgPath;
      };
      loadedImgs.push(img);
    }
    setImages(loadedImgs);
  }, []);

  // 2. Render Canvas Frame
  const renderCanvasFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgIndex = frameNum - START_FRAME;
    const img = images[imgIndex];

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (img && (img.complete || img.naturalWidth > 0)) {
      const scale = Math.min(width / img.width, height / img.height) * 0.95;
      const x = 0;
      const y = height - (img.height * scale);

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  // 3. Handle Scroll-Driven Animation & Frame Synchronization
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollableDistance = rect.height - viewportHeight;

      if (totalScrollableDistance <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.min(1, Math.max(0, currentScroll / totalScrollableDistance));

      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(rawProgress * TOTAL_FRAMES));
      const calculatedFrameNumber = START_FRAME + frameIndex;

      setCurrentFrameNumber(calculatedFrameNumber);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 4. Draw canvas whenever images load or frame updates
  useEffect(() => {
    if (imagesLoaded || images.length > 0) {
      requestAnimationFrame(() => renderCanvasFrame(currentFrameNumber));
    }
  }, [imagesLoaded, currentFrameNumber, images]);

  // Handle Resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 650;
        canvas.height = canvas.parentElement.clientHeight || 550;
        renderCanvasFrame(currentFrameNumber);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [imagesLoaded, currentFrameNumber, images]);

  // Frame Calculations
  const frameProgress = (currentFrameNumber - START_FRAME) / (TOTAL_FRAMES - 1);
  const isLensPhase = currentFrameNumber >= 25;
  const isNight = currentFrameNumber >= 18;

  // Sky Gradient Transition (Starts at Frame 5 with exact site Parchment #F4ECE1)
  const getSkyBackground = () => {
    if (currentFrameNumber < 25) {
      const progress = (currentFrameNumber - 5) / (24 - 5);
      const r = Math.round(244 - progress * 200);
      const g = Math.round(236 - progress * 200);
      const b = Math.round(225 - progress * 180);
      return `linear-gradient(180deg, 
        rgb(${r}, ${g}, ${b}) 0%, 
        rgb(${Math.round(235 - progress * 190)}, ${Math.round(224 - progress * 185)}, ${Math.round(207 - progress * 160)}) 50%, 
        rgb(${Math.round(220 - progress * 175)}, ${Math.round(205 - progress * 170)}, ${Math.round(180 - progress * 140)}) 100%)`;
    } else {
      return `linear-gradient(180deg, #070914 0%, #0F1424 50%, #171E33 100%)`;
    }
  };

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      
      {/* Sticky Viewport Container */}
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-24 pb-4 relative transition-colors duration-700"
        style={{ background: getSkyBackground() }}
      >
        
        {/* AGED VIGNETTE & DUSK OVERLAY */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700"
          style={{
            background: isLensPhase 
              ? 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 5, 12, 0.75) 100%)' 
              : 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(74, 48, 25, 0.22) 100%)'
          }}
        />

        {/* CELESTIAL SKY, ROAD, DENSE VILLAGE, VEHICLES WITH HEADLIGHTS & PEOPLE ON GROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <svg className="w-full h-full preserve-3d" viewBox="0 0 1400 800" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="moonSilverRadiant" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              <radialGradient id="moonGlowAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLensPhase ? "0.9" : "0.4"} />
                <stop offset="50%" stopColor="#E2E8F0" stopOpacity={isLensPhase ? "0.4" : "0.15"} />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="lampLightCone" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity={isNight ? "0.8" : "0.3"} />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </linearGradient>

              {/* Vehicle Headlight Cone Gradient */}
              <linearGradient id="headlightBeam" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#FFF8E7" stopOpacity={isNight ? "0.9" : "0.35"} />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 1. CRESCENT MOON */}
            <g transform="translate(1200, 110)">
              <circle cx="0" cy="0" r={isLensPhase ? "90" : "55"} fill="url(#moonGlowAura)" className="animate-pulse transition-all duration-700" />
              <path 
                d="M -10 -50 A 55 55 0 1 0 45 20 A 45 45 0 1 1 -10 -50 Z" 
                fill="url(#moonSilverRadiant)" 
                className="transition-all duration-500"
                style={{
                  filter: isLensPhase ? 'drop-shadow(0 0 25px rgba(255, 255, 25, 0.95))' : 'none'
                }}
              />
            </g>

            {/* 2. DYNAMIC NIGHT STARS */}
            <g transform="translate(420, 100)" className="animate-pulse">
              <polygon points="0,-18 4,-4 18,0 4,4 0,18 -4,4 -18,0 -4,-4" fill="#FFFFFF" opacity={isNight ? "1" : "0.4"} />
              <circle cx="0" cy="0" r="3" fill="#E2E8F0" />
            </g>
            <g transform="translate(240, 140)">
              <polygon points="0,-15 3.5,-3.5 15,0 3.5,3.5 0,15 -3.5,3.5 -15,0 -3.5,-3.5" fill="#E2E8F0" opacity={isNight ? "0.9" : "0.3"} />
            </g>
            <g transform="translate(700, 110)" className="animate-pulse">
              <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FFFFFF" opacity={isNight ? "1" : "0.4"} />
            </g>

            {/* EXTRA NIGHT STARS */}
            {isNight && (
              <g className="transition-opacity duration-700">
                <circle cx="150" cy="100" r="3" fill="#FFFFFF" opacity="0.9" />
                <circle cx="330" cy="80" r="3.5" fill="#E2E8F0" opacity="0.95" />
                <circle cx="510" cy="95" r="4" fill="#FFFFFF" opacity="0.9" />
                <circle cx="640" cy="200" r="3" fill="#E2E8F0" opacity="0.85" />
                <circle cx="780" cy="90" r="3.5" fill="#CBD5E1" opacity="0.9" />
                <circle cx="980" cy="140" r="3.5" fill="#FFFFFF" opacity="0.95" />
                <circle cx="1140" cy="220" r="3" fill="#E2E8F0" opacity="0.8" />
              </g>
            )}

            {/* 3. ORGANIC WAVY GROUND MOUND FILLING BOTH VERTICAL EDGES 100% */}
            <path 
              d="M -100 610 C 250 550, 500 660, 750 560 C 1000 640, 1250 550, 1500 610 L 1500 900 L -100 900 Z" 
              fill={isNight ? "#090E18" : "#9E815D"} 
              className="transition-colors duration-700"
            />

            {/* 4. WINDING VILLAGE ROAD */}
            <g opacity="0.9">
              <path 
                d="M 100 730 C 350 670, 600 660, 850 625 C 1050 595, 1200 605, 1380 615" 
                stroke={isNight ? "#1C2433" : "#B08E62"} 
                strokeWidth="28" 
                fill="none" 
                strokeLinecap="round"
              />
              <path 
                d="M 100 730 C 350 670, 600 660, 850 625 C 1050 595, 1200 605, 1380 615" 
                stroke={isNight ? "#FFD700" : "#FFF8E7"} 
                strokeWidth="2.5" 
                strokeDasharray="8 10" 
                fill="none" 
                opacity={isNight ? "0.85" : "0.6"}
              />
            </g>

            {/* 5. VEHICLES DRIVING ALONG THE ROAD WITH GLOWING HEADLIGHT BEAMS */}
            {/* Vehicle 1: Car / SUV driving rightward at x: 520, y: 645 */}
            <g transform="translate(520, 645)">
              {/* Headlight Beam Cone */}
              <polygon points="25,-6 130,-22 130,12 25,6" fill="url(#headlightBeam)" />
              {/* Car Body Silhouette */}
              <path d="M -22 2 L 22 2 L 18 -8 L 8 -16 L -10 -16 L -16 -8 Z" fill={isNight ? "#0B1321" : "#3A281A"} />
              {/* Wheels */}
              <circle cx="-10" cy="4" r="4.5" fill="#0A0E17" />
              <circle cx="10" cy="4" r="4.5" fill="#0A0E17" />
              {/* Headlight Lamp */}
              <circle cx="22" cy="-2" r="3" fill="#FFF8E7" className={isNight ? "shadow-[0_0_10px_#FFF8E7]" : ""} />
              {/* Taillight */}
              <circle cx="-22" cy="-4" r="2.5" fill="#EF4444" className={isNight ? "animate-pulse" : ""} />
            </g>

            {/* Vehicle 2: Auto-Rickshaw / Mini-Van driving rightward at x: 760, y: 625 */}
            <g transform="translate(760, 625)">
              {/* Headlight Beam Cone */}
              <polygon points="18,-4 95,-16 95,10 18,4" fill="url(#headlightBeam)" />
              {/* Rickshaw Silhouette */}
              <path d="M -16 2 L 16 2 L 14 -12 L -8 -14 L -16 -6 Z" fill={isNight ? "#0C1524" : "#4A3525"} />
              <circle cx="-8" cy="4" r="3.5" fill="#0A0E17" />
              <circle cx="8" cy="4" r="3.5" fill="#0A0E17" />
              {/* Golden Headlight */}
              <circle cx="16" cy="-4" r="3" fill="#FFD700" />
            </g>

            {/* Vehicle 3: Motorcycle / Scooter at x: 250, y: 675 */}
            <g transform="translate(250, 675)">
              {/* Headlight Beam */}
              <polygon points="12,-3 80,-14 80,8 12,3" fill="url(#headlightBeam)" />
              {/* Bike & Rider Silhouette */}
              <path d="M -10 2 L 10 2 L 6 -6 L 1 -14 L -5 -8 Z" fill={isNight ? "#080F1B" : "#2E1F14"} />
              <circle cx="-5" cy="4" r="3" fill="#0A0E17" />
              <circle cx="6" cy="4" r="3" fill="#0A0E17" />
              <circle cx="10" cy="-3" r="2.5" fill="#FFFDF8" />
            </g>

            {/* 6. DENSE VILLAGE HOUSES & BUILDINGS */}
            <g transform="translate(950, 535)">
              <g transform="translate(0, 45)">
                <rect x="0" y="0" width="55" height="40" fill={isNight ? "#0D1524" : "#6E553A"} rx="2" />
                <polygon points="-5,0 27.5,-22 60,0" fill={isNight ? "#192438" : "#8C3A27"} />
                <rect x="10" y="10" width="12" height="14" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
                <rect x="33" y="10" width="12" height="14" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
              </g>

              <g transform="translate(70, 20)">
                <rect x="0" y="0" width="70" height="65" fill={isNight ? "#111C2E" : "#7A5E42"} rx="2" />
                <polygon points="-8,0 35,-30 78,0" fill={isNight ? "#202E47" : "#5C261A"} />
                <rect x="12" y="12" width="14" height="16" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
                <rect x="44" y="12" width="14" height="16" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
                <rect x="28" y="38" width="14" height="27" fill={isNight ? "#FFDF80" : "#E2D0B5"} />
              </g>

              <g transform="translate(160, 35)">
                <rect x="0" y="0" width="60" height="50" fill={isNight ? "#0E1829" : "#685037"} rx="2" />
                <polygon points="-6,0 30,-25 66,0" fill={isNight ? "#1B2A42" : "#8C3A27"} />
                <rect x="12" y="12" width="12" height="14" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
                <rect x="36" y="12" width="12" height="14" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
              </g>

              <g transform="translate(240, 50)">
                <rect x="0" y="0" width="50" height="35" fill={isNight ? "#0B1220" : "#604A33"} rx="2" />
                <polygon points="-5,0 25,-18 55,0" fill={isNight ? "#162338" : "#702C1E"} />
                <rect x="18" y="8" width="14" height="14" fill={isNight ? "#FFD700" : "#FFEAA7"} className={isNight ? "animate-pulse" : ""} />
              </g>
            </g>

            {/* 7. DENSE TREES */}
            <g transform="translate(910, 530)">
              <circle cx="20" cy="20" r="28" fill={isNight ? "#09121F" : "#3B4E38"} />
              <circle cx="45" cy="15" r="22" fill={isNight ? "#0F1C2E" : "#4A6146"} />
              <rect x="28" y="38" width="8" height="40" fill={isNight ? "#060A12" : "#2A1E14"} />
            </g>
            <g transform="translate(1040, 510)">
              <circle cx="25" cy="20" r="32" fill={isNight ? "#0A1424" : "#354732"} />
              <circle cx="55" cy="18" r="25" fill={isNight ? "#122036" : "#455C41"} />
              <rect x="36" y="38" width="9" height="45" fill={isNight ? "#060A12" : "#2A1E14"} />
            </g>
            <g transform="translate(1290, 520)">
              <circle cx="20" cy="20" r="30" fill={isNight ? "#08101C" : "#334530"} />
              <rect x="16" y="36" width="8" height="45" fill={isNight ? "#060A12" : "#2A1E14"} />
            </g>

            {/* 8. GLOWING STREETLIGHTS */}
            <g transform="translate(320, 620)">
              <polygon points="-30,65 30,65 15,5 -15,5" fill="url(#lampLightCone)" />
              <ellipse cx="0" cy="65" rx="30" ry="10" fill="#FFD700" opacity={isNight ? "0.4" : "0.15"} className={isNight ? "animate-pulse" : ""} />
              <path d="M 0 65 L 0 5 Q 0 -5, -8 -8 L -12 -8" stroke={isNight ? "#4A586E" : "#4A3525"} strokeWidth="3" fill="none" />
              <circle cx="-12" cy="-8" r="5" fill={isNight ? "#FFD700" : "#D4B06A"} />
            </g>
            <g transform="translate(620, 595)">
              <polygon points="-30,65 30,65 15,5 -15,5" fill="url(#lampLightCone)" />
              <ellipse cx="0" cy="65" rx="30" ry="10" fill="#FFD700" opacity={isNight ? "0.4" : "0.15"} className={isNight ? "animate-pulse" : ""} />
              <path d="M 0 65 L 0 5 Q 0 -5, -8 -8 L -12 -8" stroke={isNight ? "#4A586E" : "#4A3525"} strokeWidth="3" fill="none" />
              <circle cx="-12" cy="-8" r="5" fill={isNight ? "#FFD700" : "#D4B06A"} />
            </g>
            <g transform="translate(930, 570)">
              <polygon points="-28,60 28,60 14,5 -14,5" fill="url(#lampLightCone)" />
              <ellipse cx="0" cy="60" rx="28" ry="9" fill="#FFD700" opacity={isNight ? "0.45" : "0.15"} className={isNight ? "animate-pulse" : ""} />
              <path d="M 0 60 L 0 5 Q 0 -5, -8 -8 L -12 -8" stroke={isNight ? "#4A586E" : "#4A3525"} strokeWidth="3" fill="none" />
              <circle cx="-12" cy="-8" r="5" fill={isNight ? "#FFD700" : "#D4B06A"} />
            </g>

            {/* 9. SILHOUETTES OF PEOPLE */}
            <g transform="translate(430, 650)" fill={isNight ? "#09101C" : "#3D2B1D"}>
              <circle cx="0" cy="-18" r="4" />
              <path d="M -3 -13 L 3 -13 L 4 0 L 1 18 L -2 18 L 0 0 Z" />
            </g>
            <g transform="translate(880, 615)" fill={isNight ? "#09101C" : "#3D2B1D"}>
              <circle cx="0" cy="-16" r="3.5" />
              <path d="M -3 -11 L 3 -11 L 3.5 0 L 1 16 L -1.5 16 L -0.5 0 Z" />
            </g>

          </svg>
        </div>

        {/* 1. TOP HEADLINE: ANIMATED EXACTLY LIKE THE GLOWING CELESTIAL MILESTONES */}
        <div className="text-center z-20 pointer-events-none relative mb-2 px-4">
          <div 
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-serif font-extrabold tracking-widest uppercase mb-2 transition-all duration-700 ${
              isNight 
                ? 'bg-[#FFD700]/20 border-[#FFD700]/50 text-[#FFD700] backdrop-blur-md shadow-[0_0_22px_rgba(255,215,0,0.8)] animate-pulse' 
                : 'bg-[#5C4028]/15 border-[#5C4028]/30 text-[#4A3019]'
            }`}
          >
            <Compass className={`w-4 h-4 ${isNight ? 'text-[#FFD700]' : 'text-[#4A3019]'}`} />
            <span>PATHWAY TO GOVERNANCE</span>
            <Sparkles className={`w-3.5 h-3.5 ${isNight ? 'text-[#FFD700] animate-spin' : 'hidden'}`} />
          </div>

          <h2 
            className={`font-serif-header text-3xl sm:text-4xl lg:text-5xl font-extrabold transition-all duration-700 tracking-tight ${
              isNight 
                ? 'scale-105 text-[#FFD700] drop-shadow-[0_0_28px_rgba(255,215,0,0.95)] animate-pulse' 
                : 'scale-100 text-[#2C1A0E]'
            }`}
            style={{
              color: isNight ? '#FFD700' : '#2C1A0E',
              textShadow: isNight ? '0 0 25px rgba(255, 215, 0, 0.95), 0 0 50px rgba(255, 215, 0, 0.6)' : 'none'
            }}
          >
            The Aspirant's Journey
          </h2>
        </div>

        {/* 2. MAIN VIEWPORT CONTAINER */}
        <div className="relative w-full flex-1 flex flex-col md:flex-row items-end justify-between px-0 md:px-4">
          
          {/* TELESCOPE CANVAS CONTAINER */}
          <div className="absolute left-0 bottom-0 w-full md:w-[54%] h-full flex items-end justify-start z-10 pointer-events-none ml-0 pl-0 mb-0 pb-0 border-none shadow-none">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Spacer */}
          <div className="hidden md:block w-[50%]" />

          {/* 3. GLOWING CELESTIAL MILESTONES */}
          <div className="relative w-full md:w-[50%] z-20 pr-4 lg:pr-8 hidden md:block pt-12 pb-12 self-start">
            <svg viewBox="0 0 950 300" fill="none" className="w-full h-auto overflow-visible">
              
              {/* Background Celestial Constellation Line */}
              <path 
                d="M 70 150 Q 165 90, 260 150 T 450 150 T 640 150 T 830 150" 
                stroke={isNight ? "#FFD700" : "#D5C3B0"} 
                strokeWidth="2.5" 
                strokeDasharray="6 6"
                fill="none" 
                opacity={isNight ? "0.8" : "0.5"}
              />

              {/* Scroll-Driven Animated Gold Wave Trail */}
              <path 
                d="M 70 150 Q 165 90, 260 150 T 450 150 T 640 150 T 830 150" 
                stroke={isLensPhase ? "#FFD700" : "#8C3A27"} 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray="950"
                strokeDashoffset={950 - (frameProgress * 950)}
                className="transition-all duration-300 shadow-[0_0_18px_rgba(255,215,0,0.9)]"
              />

              {/* 5 GLOWING CELESTIAL STAR MILESTONES */}
              {STEPS.map((step, idx) => {
                const nodeProgressTrigger = idx / (STEPS.length - 1);
                const isActive = isLensPhase || frameProgress >= nodeProgressTrigger;
                const isTop = step.position === "top";

                return (
                  <g key={step.num} transform={`translate(${step.x}, 150)`} className="group cursor-pointer">
                    
                    {/* Glowing Starburst Aura */}
                    {isActive && (
                      <g className="animate-pulse">
                        <circle cx="0" cy="0" r="36" fill="#FFD700" opacity="0.35" />
                        <polygon points="0,-36 8,-8 36,0 8,8 0,36 -8,8 -36,0 -8,-8" fill="#FFD700" opacity="0.45" />
                      </g>
                    )}

                    {/* Circular Step Badge */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r="26" 
                      fill={isActive ? (isLensPhase ? "#FFD700" : "#8C3A27") : "#FFFDF8"} 
                      stroke={isActive ? "#FFFFFF" : "#8C3A27"} 
                      strokeWidth="3.5" 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'scale-125 shadow-[0_0_22px_rgba(255,215,0,0.95)]' 
                          : 'group-hover:scale-110'
                      }`}
                    />

                    {/* Step Number Inside Circle */}
                    <text 
                      x="0" 
                      y="5" 
                      textAnchor="middle" 
                      fill={isActive ? (isLensPhase ? "#0F172A" : "#FFFDF8") : "#8C3A27"} 
                      fontSize="14" 
                      fontFamily="Cinzel, Georgia, serif" 
                      fontWeight="900"
                    >
                      {step.num}
                    </text>

                    {/* Milestone Typography */}
                    {isTop ? (
                      <g transform="translate(0, -48)" className="transition-all duration-300 group-hover:-translate-y-1">
                        <text 
                          x="0" 
                          y="-22" 
                          textAnchor="middle" 
                          fill={isNight ? "#FFD700" : "#140C08"} 
                          fontSize="17" 
                          fontFamily="Cinzel, Georgia, serif" 
                          fontWeight="900"
                          letterSpacing="0.08em"
                          className="transition-colors group-hover:fill-[#FFD700] drop-shadow-md"
                        >
                          {step.headline}
                        </text>

                        <text 
                          x="0" 
                          y="-4" 
                          textAnchor="middle" 
                          fill={isNight ? "#FFF8E7" : "#7C2D12"} 
                          fontSize="12" 
                          fontFamily="sans-serif" 
                          fontWeight="700"
                          className="opacity-95"
                        >
                          {step.tagline}
                        </text>
                      </g>
                    ) : (
                      <g transform="translate(0, 48)" className="transition-all duration-300 group-hover:-translate-y-1">
                        <text 
                          x="0" 
                          y="18" 
                          textAnchor="middle" 
                          fill={isNight ? "#FFD700" : "#140C08"} 
                          fontSize="17" 
                          fontFamily="Cinzel, Georgia, serif" 
                          fontWeight="900"
                          letterSpacing="0.08em"
                          className="transition-colors group-hover:fill-[#FFD700] drop-shadow-md"
                        >
                          {step.headline}
                        </text>

                        <text 
                          x="0" 
                          y="34" 
                          textAnchor="middle" 
                          fill={isNight ? "#FFF8E7" : "#7C2D12"} 
                          fontSize="12" 
                          fontFamily="sans-serif" 
                          fontWeight="700"
                          className="opacity-95"
                        >
                          {step.tagline}
                        </text>
                      </g>
                    )}

                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mobile Fallback View */}
          <div className="md:hidden relative max-w-sm mx-auto pl-8 border-l-2 border-dashed border-[#FFD700]/60 space-y-6 text-left py-4 z-20">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[45px] top-0 w-9 h-9 rounded-full bg-[#FFD700] border-2 border-[#0F172A] flex items-center justify-center text-[#0F172A] font-serif font-extrabold text-xs shadow-md">
                  {step.num}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-serif-header text-base font-extrabold text-[#FFD700] uppercase tracking-wider">
                    {step.headline}
                  </h4>
                  <p className="text-xs font-serif font-bold text-[#FFF8E7]">
                    {step.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* BOTTOM CONTROLS ROW: Left Progress Bar & Right Bottom Interactive CTA Button */}
        <div className="pb-4 px-6 sm:px-10 max-w-7xl mx-auto w-full z-30 flex items-center justify-between gap-4 relative">
          {/* Progress Bar */}
          <div className="w-48 sm:w-64 h-1 bg-white/20 rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-[#8C3A27] via-[#D97706] to-[#FFD700] transition-all duration-150"
              style={{ width: `${frameProgress * 100}%` }}
            />
          </div>

          {/* Right Bottom CTA Badge Button */}
          <button
            onClick={() => navigate ? navigate('/apply') : (window.location.href = '/apply')}
            className="btn-terracotta-pill py-2.5 px-6 sm:py-3 sm:px-8 shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-[#FFE8B3]/50 cursor-pointer shrink-0"
          >
            <span className="btn-label font-bold tracking-wider text-xs sm:text-sm">
              BEGIN YOUR JOURNEY WITH US
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
}
