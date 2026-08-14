import React, { useState, useEffect, useRef } from 'react';
import AboutImage from './AboutImage';

export default function HeroPhilosophyScrollytelling() {
  const [activeStep, setActiveStep] = useState(0);
  const [isFinalStep, setIsFinalStep] = useState(false);
  
  const stepRef = useRef(0);
  const finalRef = useRef(false);
  const sectionRef = useRef(null);

  const pillars = [
    { num: '01', title: 'PURPOSE', desc: 'Understanding why you learn, what you seek, and where your preparation is leading.' },
    { num: '02', title: 'DISCIPLINE', desc: 'Building consistency, commitment, and the habit of doing what preparation demands.' },
    { num: '03', title: 'WISDOM', desc: 'Developing the understanding, judgement, and perspective needed to serve society.' }
  ];

  // RAF BATCHED PASSIVE SCROLL HANDLER
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!sectionRef.current) return;

        const { top, height } = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const maxScroll = height - windowHeight;

        if (maxScroll <= 0) return;

        const progress = Math.min(Math.max(-top / maxScroll, 0), 1);
        const nextIsFinal = progress >= 0.6;
        const nextStep = nextIsFinal ? 2 : Math.min(Math.floor((progress / 0.6) * 2), 1);

        if (nextIsFinal !== finalRef.current) {
          finalRef.current = nextIsFinal;
          setIsFinalStep(nextIsFinal);
        }

        if (nextStep !== stepRef.current) {
          stepRef.current = nextStep;
          setActiveStep(nextStep);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={sectionRef} className="pedagogical-section-wrapper">
      
      {/* Sticky Viewport Stage (Concise height bound tightly to content) */}
      <div className="pedagogical-sticky-stage max-w-[1600px] mx-auto">
        
        {/* Top Header & Intro Block */}
        <div className="text-center mb-4 max-w-[1180px] mx-auto">
          {/* Main Heading (STRICT SINGLE LINE) */}
          <h1 className="about-top-heading-single-line">
            Learn with Purpose. Prepare with Discipline. Lead with Wisdom.
          </h1>

          {/* Intro Lead-In */}
          <p className="font-serif italic text-xs sm:text-sm text-[#2A1E18] font-semibold leading-relaxed max-w-[840px] mx-auto mt-1">
            At e-Gurukulam, we nurture Purpose in learning, Discipline in action, and Wisdom in thought, rooted in the Guru–Shishya tradition, prepared for the world of today.
          </p>

          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {pillars.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx === 2) {
                    finalRef.current = true;
                    stepRef.current = 2;
                    setIsFinalStep(true);
                    setActiveStep(2);
                  } else {
                    finalRef.current = false;
                    stepRef.current = idx;
                    setIsFinalStep(false);
                    setActiveStep(idx);
                  }
                }}
                aria-label={`Go to pillar ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  (isFinalStep && idx === 2) || (!isFinalStep && idx === activeStep) 
                    ? 'w-7 bg-[#8C3A27]' 
                    : idx < activeStep 
                      ? 'w-2.5 bg-[#C5A059]' 
                      : 'w-2 bg-[#D5C3B0]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Stage: Phase 1 vs Phase 2 */}
        <div className={`pedagogical-stage-wrapper transition-all duration-800 ease-in-out ${
          isFinalStep ? 'justify-between gap-4 sm:gap-6 max-w-[1400px]' : 'justify-center gap-6 sm:gap-8 max-w-[920px]'
        }`}>
          
          {/* Left Scales of Justice Image */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-800 ease-in-out">
            <AboutImage 
              baseName="about_page_left" 
              alt="Scales of Justice & Civil Service Integrity" 
              className={isFinalStep ? "pedagogical-image-spread" : "pedagogical-image-single"} 
            />
          </div>

          {/* Cards Stage Container */}
          <div className="flex-grow flex flex-row items-center justify-center gap-3 transition-all duration-800 ease-in-out">
            {isFinalStep ? (
              // PHASE 2: SPREAD ALL 3 PILLAR CARDS HORIZONTALLY
              pillars.map((pillar, idx) => (
                <div 
                  key={pillar.num} 
                  className="pillar-card flex-1 p-4.5 rounded-xl text-center flex flex-col items-center justify-start min-w-[200px] transition-all duration-800 ease-in-out animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#8C3A27] text-white shadow-xs mb-2">
                    {pillar.num}
                  </span>
                  <h3 className="pillar-title">
                    {pillar.title}
                  </h3>
                  <p className="pillar-desc">
                    {pillar.desc}
                  </p>
                </div>
              ))
            ) : (
              // PHASE 1: SINGLE CENTERED CARD FOCUS
              <div className="w-[360px] p-5 rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F0E3] border-2 border-[#C5A059] text-center shadow-xl transition-all duration-800 ease-in-out transform scale-105 flex flex-col items-center justify-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8C3A27] text-white shadow-xs">
                  {pillars[activeStep].num}
                </span>
                <h3 className="font-serif-header font-bold text-xl text-[#8C3A27] mt-2.5 uppercase tracking-wide">
                  {pillars[activeStep].title}
                </h3>
                <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed mt-2 font-sans font-medium">
                  {pillars[activeStep].desc}
                </p>
                <div className="text-[10px] font-bold text-[#8C3A27] uppercase tracking-widest mt-3 flex items-center gap-1 font-serif">
                  <span>Pillar {activeStep + 1} of 3</span>
                  <span className="animate-pulse">➔</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Guru Image */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-800 ease-in-out">
            <AboutImage 
              baseName="about_page_right" 
              alt="Seated Guru Mentorship Tradition" 
              className={isFinalStep ? "pedagogical-image-spread" : "pedagogical-image-single"} 
            />
          </div>

        </div>

      </div>
    </div>
  );
}
