import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function IASWithLifeSection({ navigate }) {
  // Time of Day Progress (0.00 = Morning, 1.00 = Quiet Night)
  // Derived strictly from native browser vertical page scroll
  const [dayProgress, setDayProgress] = useState(0);

  const sectionRef = useRef(null);

  // ====================================================================
  // NATIVE BROWSER VERTICAL SCROLL AS SINGLE SOURCE OF TRUTH
  // ZERO WHEEL OVERRIDES / ZERO GLOBAL EVENT LISTENERS / ZERO BODY MUTATIONS
  // ====================================================================
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const totalScrollable = sectionHeight - viewportHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clamped = Math.min(Math.max(rawProgress, 0), 1);

      setDayProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Environment Lighting Phases based on dayProgress (0.0 to 1.0)
  const isEveningPhase = dayProgress >= 0.48;
  const isNightPhase = dayProgress >= 0.68;

  // Dynamic vehicle translation derived strictly from dayProgress (0 to 100%)
  const vehicleOffsetMorning = (dayProgress * 400) % 300;
  const vehicleOffsetEvening = ((1 - dayProgress) * 400) % 300;

  // Calculate dynamic sky background color interpolation
  const getSkyColor = () => {
    if (dayProgress < 0.25) return '#F5ECE0';
    if (dayProgress < 0.50) return '#EFE3D3';
    if (dayProgress < 0.75) return '#C87E5C';
    return '#160F0C';
  };

  return (
    <section 
      ref={sectionRef}
      className="ias-day-life-section relative w-full h-[800vh] cursor-default font-sans"
    >
      {/* EXPLICIT HIGH-CONTRAST TYPOGRAPHY STYLES & SUBTLE NATURAL MOVEMENT */}
      <style>{`
        .story-text-dark {
          color: #2B211C !important;
          fill: #2B211C !important;
          transition: color 0.5s ease;
        }
        .story-text-light {
          color: #F3EBDD !important;
          fill: #F3EBDD !important;
          transition: color 0.5s ease;
        }
        .universal-narrative-container {
          width: min(1000px, calc(100vw - 60px));
          margin-inline: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        /* Subtle natural animation keyframes for birds */
        @keyframes floatBird {
          0% { transform: translate(0, 0); }
          50% { transform: translate(120px, -15px); }
          100% { transform: translate(250px, 5px); }
        }
        .bird-animation {
          animation: floatBird 24s linear infinite;
        }
      `}</style>

      {/* ==================================================================== */}
      {/* 1. STICKY CINEMATIC STAGE (100vh Locked strictly to top: 0) */}
      {/* ==================================================================== */}
      <div 
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-700 z-10"
        style={{ backgroundColor: getSkyColor() }}
      >

        {/* ------------------------------------------------------------------ */}
        {/* 2. LIVING ILLUSTRATED CITY & STUDY WORLD (SUBTLE SUBDUED OVERLAY) */}
        {/* ------------------------------------------------------------------ */}
        <div className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 opacity-28">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1400 900">
            
            {/* BIRDS CROSSING MORNING/DAY SKY */}
            {!isNightPhase && (
              <g className="bird-animation" opacity="0.35">
                <path d="M 200 120 Q 210 110 220 120 Q 230 110 240 120" fill="none" stroke="#2B211C" strokeWidth="2" strokeLinecap="round" />
                <path d="M 250 140 Q 258 132 266 140 Q 274 132 282 140" fill="none" stroke="#2B211C" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {/* RESIDENTIAL BUILDINGS (HOMES) */}
            <rect x="80" y="360" width="200" height="540" fill={isNightPhase ? '#2A1C16' : '#D8C7B3'} />
            <polygon points="80,360 180,270 280,360" fill={isNightPhase ? '#38251D' : '#C4B29B'} />
            
            {/* Illuminated Windows */}
            <rect x="110" y="400" width="32" height="42" fill={isNightPhase ? '#FFD700' : '#FFFDF8'} opacity={isNightPhase ? 0.95 : 0.6} />
            <rect x="190" y="400" width="32" height="42" fill={isNightPhase ? '#FFD700' : '#FFFDF8'} opacity={isNightPhase ? 0.95 : 0.6} />
            <rect x="110" y="480" width="32" height="42" fill={isNightPhase ? '#FFD700' : '#FFFDF8'} opacity={isNightPhase ? 0.4 : 0.6} />
            <rect x="190" y="480" width="32" height="42" fill={isNightPhase ? '#FFD700' : '#FFFDF8'} opacity={isNightPhase ? 0.85 : 0.6} />

            {/* Distant Pedestrians */}
            <circle cx="160" cy="740" r="6" fill={isNightPhase ? '#5C4028' : '#3A261E'} opacity="0.7" />
            <rect x="157" y="746" width="6" height="18" fill={isNightPhase ? '#5C4028' : '#3A261E'} opacity="0.7" />

            {/* OFFICE TOWERS (CAREER & WORK) */}
            <rect x="460" y="220" width="240" height="680" fill={isNightPhase ? '#221611' : '#CBD4AB'} />
            <rect x="730" y="160" width="210" height="740" fill={isNightPhase ? '#1C120E' : '#BEB29A'} />
            
            {/* Office Window Grid */}
            <rect x="490" y="260" width="40" height="25" fill={isEveningPhase ? '#FFD700' : '#FFFDF8'} opacity={isEveningPhase ? 0.8 : 0.4} />
            <rect x="550" y="260" width="40" height="25" fill={isEveningPhase ? '#FFD700' : '#FFFDF8'} opacity={isEveningPhase ? 0.4 : 0.4} />
            <rect x="610" y="260" width="40" height="25" fill={isEveningPhase ? '#FFD700' : '#FFFDF8'} opacity={isEveningPhase ? 0.9 : 0.4} />

            {/* LIBRARY COLUMNS & KNOWLEDGE ARCHITECTURE */}
            <rect x="1080" y="280" width="40" height="620" fill={isNightPhase ? '#4A3429' : '#B5A087'} />
            <rect x="1180" y="240" width="40" height="660" fill={isNightPhase ? '#4A3429' : '#B5A087'} />
            <rect x="1280" y="280" width="40" height="620" fill={isNightPhase ? '#4A3429' : '#B5A087'} />
            <rect x="1050" y="220" width="300" height="35" fill="#8C3A27" />

            {/* COMMUTE ROAD & MOVING VEHICLES */}
            <path d="M 0 780 Q 700 740 1400 780" fill="none" stroke={isNightPhase ? '#3A261E' : '#8C3A27'} strokeWidth="4" strokeDasharray="16 16" opacity="0.6" />

            {/* Morning Commute Vehicle */}
            {!isNightPhase && (
              <g transform={`translate(${100 + vehicleOffsetMorning}, 0)`}>
                <rect x="100" y="748" width="55" height="20" rx="4" fill="#8C3A27" opacity="0.85" />
                <circle cx="115" cy="768" r="5" fill="#2B211C" />
                <circle cx="140" cy="768" r="5" fill="#2B211C" />
              </g>
            )}

            {/* Evening Return Vehicle */}
            {isEveningPhase && (
              <g transform={`translate(${1200 - vehicleOffsetEvening}, 0)`}>
                <rect x="100" y="752" width="45" height="18" rx="3" fill="#D9906E" opacity="0.9" />
                <circle cx="112" cy="770" r="4.5" fill="#160F0C" />
                <circle cx="132" cy="770" r="4.5" fill="#160F0C" />
                <circle cx="144" cy="758" r="2.5" fill="#FF4500" />
              </g>
            )}

            {/* STREETLIGHTS */}
            <line x1="380" y1="680" x2="380" y2="775" stroke="#3A261E" strokeWidth="4" />
            <circle cx="380" cy="675" r="7" fill={isEveningPhase ? '#FFD700' : '#D9C8B3'} opacity={isEveningPhase ? 0.95 : 0.5} />
            {isEveningPhase && <circle cx="380" cy="675" r="20" fill="#FFD700" opacity="0.2" />}

            <line x1="980" y1="680" x2="980" y2="775" stroke="#3A261E" strokeWidth="4" />
            <circle cx="980" cy="675" r="7" fill={isEveningPhase ? '#FFD700' : '#D9C8B3'} opacity={isEveningPhase ? 0.95 : 0.5} />
            {isEveningPhase && <circle cx="980" cy="675" r="20" fill="#FFD700" opacity="0.2" />}

            {/* NIGHT STUDY CORNER */}
            {isNightPhase && (
              <g opacity="0.85">
                <rect x="600" y="650" width="200" height="14" fill="#5C4028" />
                <path d="M 640 650 L 645 590 L 675 600" stroke="#C5A059" strokeWidth="4" fill="none" />
                <path d="M 665 595 L 685 615 L 660 615 Z" fill="#8C3A27" />
                <circle cx="672" cy="615" r="30" fill="#FFD700" opacity="0.25" />
                <rect x="700" y="640" width="38" height="10" fill="#F3EBDD" rx="1" />
                <rect x="742" y="640" width="38" height="10" fill="#F3EBDD" rx="1" />
                <line x1="720" y1="645" x2="760" y2="645" stroke="#8C3A27" strokeWidth="1.5" />
              </g>
            )}

          </svg>
        </div>

        {/* SUBTLE TONAL DARKENING OVERLAY TO SUBDUE BACKGROUND BRIGHTNESS */}
        <div className="absolute inset-0 bg-[#2B211C]/10 pointer-events-none transition-opacity duration-700 z-5" />


        {/* ------------------------------------------------------------------ */}
        {/* 3. NARRATIVE STORYTELLING STAGE (PURE EDITORIAL TYPOGRAPHY) */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-full h-[78vh] min-h-[560px] max-h-[780px] relative overflow-hidden flex items-center justify-center z-10">

          {/* NARRATIVE PHASE 1: MORNING ROUTINE */}
          {dayProgress < 0.22 && (
            <div className="universal-narrative-container space-y-5 animate-fade-in">
              <h2 className="story-text-dark font-serif-header text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[1.05]">
                YOUR DAY IS ALREADY FULL.
              </h2>

              <div className="space-y-1.5 story-text-dark font-serif italic text-xl sm:text-3xl font-bold leading-relaxed">
                <p className="whitespace-nowrap">Family responsibilities, career commitments, commute, deadlines, and daily domestic duties.</p>
                <p>A full and meaningful life.</p>
              </div>
            </div>
          )}


          {/* NARRATIVE PHASE 2: DAYTIME & THE QUESTION */}
          {dayProgress >= 0.22 && dayProgress < 0.48 && (
            <div className="universal-narrative-container space-y-5 animate-fade-in">
              <h1 className="story-text-dark font-serif-header text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight">
                <div>AND SOMEWHERE IN BETWEEN...</div>
                <div className="text-[#8C3A27]">THERE IS STILL AN IAS DREAM.</div>
              </h1>

              <p className="story-text-dark font-serif italic text-xl sm:text-3xl font-bold whitespace-nowrap">
                But when does a dream find time in a life already full of responsibilities?
              </p>
            </div>
          )}


          {/* NARRATIVE PHASE 3: EVENING DUSK */}
          {dayProgress >= 0.48 && dayProgress < 0.72 && (
            <div className="universal-narrative-container space-y-5 animate-fade-in">
              <h2 className="story-text-light font-serif-header text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight whitespace-nowrap">
                WHAT IF THE DREAM DIDN’T HAVE TO WAIT?
              </h2>

              <div className="space-y-1.5 story-text-light font-serif italic text-xl sm:text-3xl font-bold leading-relaxed opacity-95">
                <p>What if your preparation could become part of the life you already live,</p>
                <p>without asking you to put everything else on hold?</p>
              </div>
            </div>
          )}


          {/* NARRATIVE PHASE 4: THE REVEAL & PROGRAM SOLUTION */}
          {dayProgress >= 0.72 && (
            <div className="universal-narrative-container space-y-6 animate-fade-in">
              
              {/* Premium Editorial "COMING SOON" Campaign Seal / Sticker (Increased Size) */}
              <div className="inline-block relative z-20 pointer-events-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500 ease-out select-none">
                <div className="relative bg-[#8C3A27] text-[#F3EBDD] px-7 py-3 rounded-lg border-2 border-[#C5A059] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center gap-3 overflow-hidden">
                  {/* Inner Inset Hairline Frame */}
                  <div className="absolute inset-1.5 border border-[#C5A059]/60 rounded-xs pointer-events-none" />
                  
                  {/* Subtle Corner Notch Stamp Accents */}
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full shrink-0" />
                  <span className="font-mono text-sm sm:text-base lg:text-lg font-black uppercase tracking-[0.35em] text-[#F3EBDD] relative z-10 pt-0.5">
                    COMING SOON
                  </span>
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full shrink-0" />
                </div>
              </div>

              {/* Main Heading & Subheadings */}
              <div className="space-y-3">
                <h2 className="story-text-light font-serif-header text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-none whitespace-nowrap">
                  A NEW WAY TO PREPARE FOR IAS
                </h2>

                <h3 className="story-text-light font-serif italic text-xl sm:text-3xl font-bold whitespace-nowrap">
                  For Those Who Can't Put Life on Hold.
                </h3>

                <p className="font-mono text-sm sm:text-lg lg:text-xl font-black uppercase tracking-widest text-[#FFD700] whitespace-nowrap">
                  Designed for Homemakers &amp; Working Professionals
                </p>
              </div>

              {/* Narrative Lines & Paragraph */}
              <div className="space-y-2 max-w-2xl">
                <p className="story-text-light font-serif italic text-lg sm:text-2xl font-bold">
                  Family. Career. Responsibilities.
                </p>
                <p className="story-text-light font-serif italic text-lg sm:text-2xl font-bold text-[#FFD700] whitespace-nowrap">
                  And still... the dream of becoming an IAS officer.
                </p>
                <p className="story-text-light font-serif text-sm sm:text-base font-medium opacity-90 leading-relaxed max-w-xl mx-auto pt-1">
                  A flexible Civil Services preparation experience designed around your life, <br className="hidden sm:inline" />
                  not the other way around.
                </p>
              </div>

              {/* Call to Action Button */}
              <div className="pt-2 flex flex-col items-center justify-center gap-2.5 relative z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigate === 'function') {
                      navigate('/contact');
                    } else {
                      window.location.href = '/contact';
                    }
                  }}
                  className="btn-terracotta-pill text-xs sm:text-sm py-4 px-8 font-serif font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3 cursor-pointer"
                >
                  <span>JOIN THE INTEREST LIST</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <span className="story-text-light text-xs font-serif italic opacity-85">
                  Be the first to know when the program launches.
                </span>
              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  );
}
