import React from 'react';
import administrativeSkyline from '../assets/administrative_skyline.jpg';

// Hero SVG Line Art Graphic
export function HeroArtwork() {
  return (
    <div className="w-full py-4 flex items-center justify-center">
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-lg filter drop-shadow-sm opacity-95"
      >
        <circle cx="250" cy="200" r="160" fill="url(#heroGlow)" opacity="0.45" />

        <defs>
          <radialGradient id="heroGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 200) rotate(90) scale(160)">
            <stop stopColor="#C5A059" stopOpacity="0.4" />
            <stop offset="1" stopColor="#8C3A27" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="250" cy="200" r="140" stroke="#C5A059" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
        <circle cx="250" cy="200" r="110" stroke="#8C3A27" strokeWidth="1" opacity="0.4" />
        <circle cx="250" cy="200" r="80" stroke="#C5A059" strokeWidth="0.6" strokeDasharray="8 4" opacity="0.5" />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 250 + Math.cos(angle) * 115;
          const y1 = 200 + Math.sin(angle) * 115;
          const x2 = 250 + Math.cos(angle) * 135;
          const y2 = 200 + Math.sin(angle) * 135;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8C3A27" strokeWidth="1.2" opacity="0.5" />;
        })}

        {/* Step 1: Traditional Lamp */}
        <g transform="translate(130, 200)">
          <circle cx="0" cy="0" r="32" fill="#FFFDF8" stroke="#8C3A27" strokeWidth="1.5" />
          <path d="M0 -14 C6 -4 10 2 6 12 C3 16 -3 16 -6 12 C-10 2 -4 -4 0 -14 Z" fill="#8C3A27" opacity="0.9" />
          <path d="M0 -7 C3 -2 5 1 3 6 C1.5 8 -1.5 8 -3 6 C-5 1 -2 -2 0 -7 Z" fill="#C5A059" />
          <text x="0" y="46" textAnchor="middle" fill="#221814" fontSize="11" fontFamily="Cinzel, Georgia, serif" fontWeight="700" letterSpacing="0.05em">TRADITION</text>
        </g>

        <path d="M162 200 C180 170, 210 170, 228 200" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <polygon points="228,200 220,195 222,203" fill="#C5A059" />

        {/* Step 2: Preparation Book */}
        <g transform="translate(250, 200)">
          <circle cx="0" cy="0" r="38" fill="#FFFDF8" stroke="#C5A059" strokeWidth="2" />
          <path d="M-18 -8 C-10 -12 -2 -8 0 -4 C2 -8 10 -12 18 -8 V12 C10 8 2 12 0 16 C-2 12 -10 8 -18 12 Z" stroke="#221814" strokeWidth="1.5" fill="none" />
          <line x1="0" y1="-4" x2="0" y2="16" stroke="#221814" strokeWidth="1.2" />
          <text x="0" y="54" textAnchor="middle" fill="#221814" fontSize="11" fontFamily="Cinzel, Georgia, serif" fontWeight="700" letterSpacing="0.05em">PREPARATION</text>
        </g>

        <path d="M288 200 C306 230, 336 230, 354 200" stroke="#8C3A27" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <polygon points="354,200 346,197 348,205" fill="#8C3A27" />

        {/* Step 3: Public Service Emblem */}
        <g transform="translate(370, 200)">
          <circle cx="0" cy="0" r="32" fill="#FFFDF8" stroke="#8C3A27" strokeWidth="1.5" />
          <path d="M-10 14 H10 V12 H-10 Z M-7 12 V-6 H7 V12 Z M-10 -6 H10 V-10 H-10 Z M0 -10 V-15" stroke="#8C3A27" strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="-17" r="2.5" fill="#C5A059" />
          <text x="0" y="46" textAnchor="middle" fill="#221814" fontSize="11" fontFamily="Cinzel, Georgia, serif" fontWeight="700" letterSpacing="0.05em">PUBLIC SERVICE</text>
        </g>

        <path d="M40 330 C180 345, 320 345, 460 330" stroke="#C5A059" strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  );
}

// GLOWING GHEE LAMP / FLAME DIVIDER
export function SectionDivider() {
  return (
    <div className="w-full flex items-center justify-center py-6 relative overflow-hidden">
      <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#D5C3B0] to-transparent relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-[#FFBF00]/30 to-[#8C3A27]/20 blur-md pointer-events-none" />

        <div className="relative z-10 w-9 h-9 rounded-full bg-[#FAF6EE] border border-[#D5C3B0] shadow-sm flex items-center justify-center">
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1 C13 7 17 11 14 17 C12 21 6 21 4 17 C1 11 5 7 9 1 Z" fill="url(#flameGradient)" />
            <path d="M9 7 C11 11 13 13 11 17 C10 19 8 19 7 17 C5 13 7 11 9 7 Z" fill="#FFD700" />
            <defs>
              <linearGradient id="flameGradient" x1="9" y1="1" x2="9" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFBF00" />
                <stop offset="0.6" stopColor="#D9531E" />
                <stop offset="1" stopColor="#8C3A27" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function FlameDivider() {
  return <SectionDivider />;
}

// Enhanced Organic Wave Timeline - 5-Step Node Path with Alternating Above/Below Text & Zero Overlap
export function JourneyPathArtwork() {
  const steps = [
    { number: "01", title: "UNDERSTAND", subtitle: "Know the Battlefield", position: "above" },
    { number: "02", title: "STRATEGIZE", subtitle: "Build Your Roadmap", position: "below" },
    { number: "03", title: "PREPARE", subtitle: "Build Knowledge & Understanding", position: "above" },
    { number: "04", title: "PRACTICE", subtitle: "Transform Knowledge into Performance", position: "below" },
    { number: "05", title: "PERFORM", subtitle: "Enter the Examination with Confidence", position: "above" },
  ];

  return (
    <div className="w-full py-10 px-2 sm:px-4">
      <div className="hidden md:block">
        <svg viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto overflow-visible">
          <defs>
            <radialGradient id="beaconGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(12)">
              <stop stopColor="#FFBF00" stopOpacity="1" />
              <stop offset="1" stopColor="#8C3A27" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M 100 150 Q 200 70, 300 150 T 500 150 T 700 150 T 900 150"
            stroke="#8C3A27"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            fill="none"
            opacity="0.4"
          />

          <circle cx="100" cy="150" r="6" fill="#8C3A27" className="animate-pulse">
            <animate 
              attributeName="cx" 
              values="100; 300; 500; 700; 900; 100" 
              dur="8s" 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="cy" 
              values="150; 150; 150; 150; 150; 150" 
              dur="8s" 
              repeatCount="indefinite" 
            />
          </circle>

          {steps.map((step, idx) => {
            const x = 100 + idx * 200;
            const yNode = 150;
            const isAbove = step.position === "above";

            return (
              <g key={idx} transform={`translate(${x}, ${yNode})`} className="group cursor-pointer">
                <circle 
                  cx="0" 
                  cy="0" 
                  r="28" 
                  fill="none" 
                  stroke="#8C3A27" 
                  strokeWidth="1.5" 
                  opacity="0.25" 
                  className="animate-ping origin-center"
                />

                <circle 
                  cx="0" 
                  cy="0" 
                  r="22" 
                  fill="#FFFDF8" 
                  stroke="#8C3A27" 
                  strokeWidth="2.5" 
                  className="transition-all duration-300 group-hover:scale-125 group-hover:stroke-[#7C2D12] group-hover:fill-[#8C3A27] shadow-sm"
                />

                <text 
                  x="0" 
                  y="4" 
                  textAnchor="middle" 
                  fill="#8C3A27" 
                  fontSize="12" 
                  fontFamily="Cinzel, Georgia, serif" 
                  fontWeight="800"
                  className="transition-all duration-300 group-hover:fill-white pointer-events-none"
                >
                  {step.number}
                </text>

                {isAbove ? (
                  <g transform="translate(0, -45)" className="transition-all duration-300 group-hover:-translate-y-1">
                    <text 
                      x="0" 
                      y="-18" 
                      textAnchor="middle" 
                      fill="#8C3A27" 
                      fontSize="10.5" 
                      fontFamily="sans-serif" 
                      fontWeight="600"
                      className="opacity-90 transition-all group-hover:opacity-100 group-hover:fill-[#7C2D12]"
                    >
                      {step.subtitle}
                    </text>

                    <text 
                      x="0" 
                      y="-34" 
                      textAnchor="middle" 
                      fill="#140C08" 
                      fontSize="13" 
                      fontFamily="Cinzel, Georgia, serif" 
                      fontWeight="800"
                      letterSpacing="0.08em"
                      className="transition-colors group-hover:fill-[#8C3A27]"
                    >
                      {step.title}
                    </text>
                  </g>
                ) : (
                  <g transform="translate(0, 45)" className="transition-all duration-300 group-hover:translate-y-1">
                    <text 
                      x="0" 
                      y="14" 
                      textAnchor="middle" 
                      fill="#140C08" 
                      fontSize="13" 
                      fontFamily="Cinzel, Georgia, serif" 
                      fontWeight="800"
                      letterSpacing="0.08em"
                      className="transition-colors group-hover:fill-[#8C3A27]"
                    >
                      {step.title}
                    </text>

                    <text 
                      x="0" 
                      y="30" 
                      textAnchor="middle" 
                      fill="#8C3A27" 
                      fontSize="10.5" 
                      fontFamily="sans-serif" 
                      fontWeight="600"
                      className="opacity-90 transition-all group-hover:opacity-100 group-hover:fill-[#7C2D12]"
                    >
                      {step.subtitle}
                    </text>
                  </g>
                )}

              </g>
            );
          })}
        </svg>
      </div>

      <div className="md:hidden relative max-w-sm mx-auto pl-8 border-l-2 border-dashed border-[#8C3A27]/40 space-y-8 text-left py-4">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-[#FFFDF8] border-2 border-[#8C3A27] flex items-center justify-center text-[#8C3A27] font-serif font-extrabold text-xs shadow-xs group-hover:bg-[#8C3A27] group-hover:text-white transition-all">
              {step.number}
            </div>

            <div className="space-y-1 pt-0.5">
              <h4 className="font-serif-header text-sm font-extrabold text-[#140C08] uppercase tracking-wider group-hover:text-[#8C3A27] transition-colors">
                {step.title}
              </h4>
              <p className="text-xs font-serif font-bold text-[#8C3A27]">
                {step.subtitle}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

// COMPACT CLEAN CAPITOL COMPLEX IMAGE CARD WITHOUT ANY TEXT OVERLAYS
export function CityscapeArtwork() {
  return (
    <div className="w-full flex items-center justify-center py-2">
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-[#D5C3B0]/80 shadow-lg bg-[#FAF6EE] transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
        <img 
          src={administrativeSkyline} 
          alt="Administrative Corridor Skyline"
          className="w-full h-auto object-cover rounded-2xl block"
        />
      </div>
    </div>
  );
}

// Contact Map SVG
export function ContactMapArtwork() {
  return (
    <div className="w-full p-6 bg-[#FAF6EE]/80 rounded-xl border border-[#D5C3B0] relative overflow-hidden shadow-sm">
      <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto opacity-85">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 30} x2="600" y2={i * 30} stroke="#C5A059" strokeWidth="0.5" opacity="0.25" />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 30} y1="0" x2={i * 30} y2="300" stroke="#C5A059" strokeWidth="0.5" opacity="0.25" />
        ))}

        <path d="M 50 150 C 150 100, 300 220, 450 120 T 580 180" stroke="#3D3028" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M 200 0 C 220 120, 180 180, 240 300" stroke="#8C3A27" strokeWidth="1.5" fill="none" opacity="0.35" />

        <g transform="translate(240, 140)">
          <circle cx="0" cy="0" r="28" fill="#8C3A27" opacity="0.15" />
          <circle cx="0" cy="0" r="14" fill="#FFFDF8" stroke="#8C3A27" strokeWidth="2" />
          <circle cx="0" cy="0" r="5" fill="#8C3A27" />
          <rect x="-65" y="-42" width="130" height="24" rx="4" fill="#FFFDF8" stroke="#C5A059" strokeWidth="1" />
          <text x="0" y="-26" textAnchor="middle" fill="#221814" fontSize="10" fontFamily="Cinzel, Georgia, serif" fontWeight="700">
            HYDERABAD CAMPUS
          </text>
        </g>

        <g transform="translate(420, 90)">
          <circle cx="0" cy="0" r="22" fill="#C5A059" opacity="0.15" />
          <circle cx="0" cy="0" r="12" fill="#FFFDF8" stroke="#C5A059" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#C5A059" />
          <rect x="-60" y="-38" width="120" height="22" rx="4" fill="#8C3A27" stroke="#8C3A27" strokeWidth="1" />
          <text x="0" y="-23" textAnchor="middle" fill="#FFFDF8" fontSize="10" fontFamily="Cinzel, Georgia, serif" fontWeight="700">
            NEW DELHI DESK
          </text>
        </g>
      </svg>
    </div>
  );
}

// Horizon Path Motif
export function HorizonCTAArtwork() {
  return (
    <div className="w-full py-4 flex items-center justify-center">
      <svg viewBox="0 0 600 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg">
        <path d="M 50 120 L 300 30 L 550 120" stroke="#C5A059" strokeWidth="1.5" opacity="0.45" />
        <path d="M 120 120 L 300 30 L 480 120" stroke="#8C3A27" strokeWidth="1" opacity="0.35" />
        <circle cx="300" cy="30" r="18" fill="#FFFDF8" stroke="#C5A059" strokeWidth="2" />
        <circle cx="300" cy="30" r="6" fill="#8C3A27" />
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = -150 + i * 25;
          const rad = (angle * Math.PI) / 180;
          const x2 = 300 + Math.cos(rad) * 28;
          const y2 = 30 + Math.sin(rad) * 28;
          return <line key={i} x1="300" y1="30" x2={x2} y2={y2} stroke="#C5A059" strokeWidth="1.5" opacity="0.6" />;
        })}
      </svg>
    </div>
  );
}