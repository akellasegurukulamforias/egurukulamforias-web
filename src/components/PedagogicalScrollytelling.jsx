import React, { useState, useEffect, useRef } from 'react';
import AboutImage from './AboutImage';

export default function SmoothPedagogicalContinuum() {
  const [activeStep, setActiveStep] = useState(0);
  const [isFinalStep, setIsFinalStep] = useState(false);

  const stepRef = useRef(0);
  const finalRef = useRef(false);
  const sectionRef = useRef(null);

  const steps = [
    { 
      num: '01', 
      title: '01. GUIDANCE', 
      subtitle: 'Know What to Study',
      desc: 'Clear direction to understand the syllabus, priorities and right sources.' 
    },
    { 
      num: '02', 
      title: '02. STRATEGY', 
      subtitle: 'Know How to Prepare',
      desc: 'A structured approach to learning, revision, practice and examination.' 
    },
    { 
      num: '03', 
      title: '03. AWARENESS', 
      subtitle: 'Understand What Is Happening Around You',
      desc: 'Develop the ability to connect issues, understand contexts and think broadly.' 
    },
    { 
      num: '04', 
      title: '04. PRACTICE', 
      subtitle: 'Transform Knowledge into Answers',
      desc: 'Regular practice to express knowledge with clarity, structure and relevance.' 
    },
    { 
      num: '05', 
      title: '05. PERSONALITY', 
      subtitle: 'Prepare for the Responsibility Beyond the Exam',
      desc: 'Build the confidence, maturity and balanced thinking expected of a civil servant.' 
    }
  ];

  // RAF BATCHED PASSIVE SCROLL HANDLER (ZERO LAYOUT THRASHING - 120 FPS LOCK)
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
        const nextIsFinal = progress >= 0.65;
        const nextStep = nextIsFinal ? 4 : Math.min(Math.floor((progress / 0.65) * 4), 3);

        // ONLY TRIGGER REACT STATE RE-RENDER WHEN STEP TRULY CHANGES
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
    <div ref={sectionRef} className="pedagogical-section-wrapper pedagogical-continuum-section">
      
      {/* Sticky Viewport Stage (Locked 100vh, Dead-Centered) */}
      <div className="pedagogical-sticky-stage max-w-[1600px] mx-auto">
        
        {/* 1. Stationary Header Section */}
        <div className="text-center mb-4">
          <span className="text-xs sm:text-sm font-bold tracking-[0.15em] text-[#8C3A27] uppercase font-serif block">
            Philosophical Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-header font-extrabold text-[#140C08] mt-0.5 leading-tight">
            The Pedagogical Continuum
          </h2>
          <p className="text-xs sm:text-sm text-[#2A1E18] mt-1 max-w-md mx-auto font-sans font-medium">
            {isFinalStep 
              ? 'All 5 directional milestones unlocked in a full continuum roadmap.' 
              : 'Five progressive milestones transforming administrative ambition into public service duty. Scroll step-by-step.'}
          </p>

          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx === 4) {
                    finalRef.current = true;
                    stepRef.current = 4;
                    setIsFinalStep(true);
                    setActiveStep(4);
                  } else {
                    finalRef.current = false;
                    stepRef.current = idx;
                    setIsFinalStep(false);
                    setActiveStep(idx);
                  }
                }}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  (isFinalStep && idx === 4) || (!isFinalStep && idx === activeStep)
                    ? 'w-7 bg-[#8C3A27]' 
                    : idx < activeStep 
                      ? 'w-2.5 bg-[#C5A059]' 
                      : 'w-2 bg-[#D5C3B0]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. Dynamic Stage: Single Card (460px Images) vs Spread (300px Images + 5 Cards Horizontal) */}
        <div className={`pedagogical-stage-wrapper transition-all duration-800 ease-in-out ${
          isFinalStep ? 'justify-between gap-3 sm:gap-4 max-w-[1550px]' : 'justify-center gap-6 max-w-[920px]'
        }`}>
          
          {/* Left Guru Image (460px Single Card vs 300px Spread) */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-800 ease-in-out">
            <AboutImage 
              baseName="about_page_left_b" 
              alt="Guru" 
              className={isFinalStep ? "pedagogical-image-spread" : "pedagogical-image-single"} 
            />
          </div>

          {/* Cards Stage Container */}
          <div className="flex-grow flex flex-row items-center justify-center gap-3 transition-all duration-800 ease-in-out">
            {isFinalStep ? (
              // PHASE 2: SPREAD ALL 5 CARDS HORIZONTALLY + READING PAUSE BUFFER
              steps.map((step, idx) => (
                <div 
                  key={step.num} 
                  className="flex-1 p-3 sm:p-4 rounded-xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F0E3] border border-[#C5A059] text-center shadow-md animate-fade-in flex flex-col items-center justify-start min-w-[140px] transition-all duration-800 ease-in-out"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#8C3A27] text-white shadow-xs">
                    {step.num}
                  </span>
                  <h4 className="font-serif-header font-extrabold text-xs sm:text-sm text-[#140C08] mt-2 uppercase tracking-wide leading-snug">
                    {step.title}
                  </h4>
                  <span className="text-[11px] sm:text-xs font-bold text-[#8C3A27] mt-0.5 block font-serif">
                    {step.subtitle}
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-[#2A1E18] mt-1.5 font-sans font-medium leading-tight">
                    {step.desc}
                  </p>
                </div>
              ))
            ) : (
              // PHASE 1: SINGLE CENTERED CARD FOCUS (340px Card + Flanking Gap)
              <div className="w-[360px] p-6 rounded-2xl bg-gradient-to-b from-[#FFFDF8] to-[#F7F0E3] border-2 border-[#C5A059] text-center shadow-xl transition-all duration-800 ease-in-out transform scale-105 flex flex-col items-center justify-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8C3A27] text-white shadow-xs">
                  {steps[activeStep].num}
                </span>
                <h3 className="font-serif-header font-extrabold text-xl text-[#140C08] mt-3 uppercase tracking-wide">
                  {steps[activeStep].title}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-[#8C3A27] mt-1 block font-serif">
                  {steps[activeStep].subtitle}
                </span>
                <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed mt-2.5 font-sans font-medium">
                  {steps[activeStep].desc}
                </p>
                <div className="text-[10px] font-bold text-[#8C3A27] uppercase tracking-widest mt-4 flex items-center gap-1 font-serif">
                  <span>Step {activeStep + 1} of 5</span>
                  <span className="animate-pulse">➔</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Aspirant Image (460px Single Card vs 300px Spread) */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-800 ease-in-out">
            <AboutImage 
              baseName="about_page_right_b" 
              alt="Aspirant" 
              className={isFinalStep ? "pedagogical-image-spread" : "pedagogical-image-single"} 
            />
          </div>

        </div>

      </div>
    </div>
  );
}
