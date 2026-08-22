import React, { useState, useEffect, useRef } from 'react';
import { SectionDivider } from '../components/Artworks';
import IASWithLifeSection from '../components/IASWithLifeSection';
import { 
  ArrowRight, 
  Sparkles, 
  Briefcase,
  Home,
  ArrowDown,
  X,
  Bell,
  Clock
} from 'lucide-react';

export default function ProgramsPage({ navigate }) {
  const [activeTier, setActiveTier] = useState(0); // 0 = 99%, 1 = 75%, 2 = 50%
  const [activeFieldStage, setActiveFieldStage] = useState(0); // 0 = Enter, 1 = Observe, 2 = Understand, 3 = Contribute
  
  // Session-Persistent "Coming Soon" Modal Popup State (Triggers only once per browser session)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenProgramsComingSoonModal');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setShowComingSoonModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseComingSoonModal = () => {
    sessionStorage.setItem('hasSeenProgramsComingSoonModal', 'true');
    setShowComingSoonModal(false);
  };

  const spectrumContainerRef = useRef(null);
  const sankalpaContainerRef = useRef(null);

  // 4 Mentorship Philosophy & Add-On Definitions
  const spectrumModels = [
    {
      id: 0,
      ratio: "99%",
      mentorShare: "99% Mentor",
      menteeShare: "1% Mentee",
      title: "The Guided Path",
      philosophy: "You don't have to figure out the path. Your mentor builds it with you.",
      idealFor: "Aspirants seeking complete end-to-end direction.",
      summary: "Everything is designed, structured, and provided by the mentor. The mentee’s responsibility is simple: follow the plan with discipline and consistency.",
      deliverables: [
        "Complete study roadmap & personalized timeline",
        "Structured class schedule and daily study plan",
        "Mentor-curated study materials and resources",
        "Daily/weekly direction and progress monitoring",
        "Comprehensive revision strategy and test evaluation"
      ]
    },
    {
      id: 1,
      ratio: "75%",
      mentorShare: "75% Mentor",
      menteeShare: "25% Mentee",
      title: "The Guided Learning",
      philosophy: "The mentor leads in teaching and strategy. You absorb, revise, and execute.",
      idealFor: "Aspirants seeking structured learning with personal ownership.",
      summary: "The mentor takes the lead in teaching, planning, and directing preparation, while the mentee absorbs, organizes, revises, and executes independently.",
      deliverables: [
        "Structured lectures with clear topic-wise direction",
        "Mentor-designed subject preparation strategy",
        "Clear guidance on what to study and how to approach it",
        "Mentee-driven revision and test execution",
        "Periodic performance evaluation and feedback"
      ]
    },
    {
      id: 2,
      ratio: "50%",
      mentorShare: "50% Mentor",
      menteeShare: "50% Mentee",
      title: "The Strategic Partnership",
      philosophy: "No classes. No study materials. Your mentor provides direction and corrections; you own the execution.",
      idealFor: "Aspirants seeking high-level strategy with preparation independence.",
      summary: "No classes. No study materials. The mentor provides strategy, direction, clarity, and corrections; the mentee takes complete ownership of preparation.",
      deliverables: [
        "Personalised preparation strategy & roadmaps",
        "Subject-wise strategic guidance & direction",
        "Regular strategy reviews and course corrections",
        "Answer writing auditing & error pattern diagnostics",
        "Mentee-driven execution with peer-level accountability"
      ]
    },
    {
      id: 3,
      ratio: "Add-On",
      isAddon: true,
      mentorShare: "NextGen Governance",
      menteeShare: "COMING SOON",
      title: "NextGen Governance",
      philosophy: "Master the diagnostic workflows and delivery frameworks to break down and scale complex public systems.",
      idealFor: "The structured method to break down, design, and scale public systems.",
      summary: "",
      deliverables: [
        "System Diagnostic Toolkits: Pinpoint root causes and structural bottlenecks behind complex policy failures.",
        "Structured Decision Matrices: Map multi-stakeholder trade-offs to resolve complex administrative dilemmas with clarity.",
        "Scalable Delivery Frameworks: Build modular, risk-tested rollout blueprints engineered for real-world public systems."
      ]
    }
  ];

  // 4 Sankalpa Siddhi Stages Definitions
  const sankalpaStages = [
    {
      id: 0,
      number: "01",
      title: "Enter the Field",
      subtitle: "Students. Classrooms. Ground Reality.",
      description: "Step out of theoretical coaching spaces and engage directly with government school students in active classroom environments."
    },
    {
      id: 1,
      number: "02",
      title: "Observe",
      subtitle: "What do they need?",
      description: "Identify learning gaps, grassroots infrastructural challenges, and systemic hurdles faced by students and educators alike."
    },
    {
      id: 2,
      number: "03",
      title: "Understand",
      subtitle: "Ground Governance Realities",
      description: "Connect textbook public policy concepts with real-world operational challenges of public education and welfare schemes."
    },
    {
      id: 3,
      number: "04",
      title: "Contribute",
      subtitle: "Meaningful Action & Impact",
      description: "Build authentic, high-impact perspectives vital for UPSC Mains answers, Essay papers, and Interview DAF scoring."
    }
  ];

  // Scroll observers for Section 1 and Section 2
  useEffect(() => {
    const handleScroll = () => {
      // Section 1 observer (4 Tiers)
      if (spectrumContainerRef.current) {
        const rect = spectrumContainerRef.current.getBoundingClientRect();
        const totalScrollable = spectrumContainerRef.current.offsetHeight - window.innerHeight;
        if (totalScrollable > 0) {
          const ratio = Math.max(0, Math.min(1, -rect.top / totalScrollable));
          if (ratio < 0.25) setActiveTier(0);
          else if (ratio < 0.50) setActiveTier(1);
          else if (ratio < 0.75) setActiveTier(2);
          else setActiveTier(3);
        }
      }

      // Section 2 observer
      if (sankalpaContainerRef.current) {
        const rect = sankalpaContainerRef.current.getBoundingClientRect();
        const totalScrollable = sankalpaContainerRef.current.offsetHeight - window.innerHeight;
        if (totalScrollable > 0) {
          const ratio = Math.max(0, Math.min(1, -rect.top / totalScrollable));
          if (ratio < 0.25) setActiveFieldStage(0);
          else if (ratio < 0.50) setActiveFieldStage(1);
          else if (ratio < 0.75) setActiveFieldStage(2);
          else setActiveFieldStage(3);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentSpectrum = spectrumModels[activeTier];
  const currentStage = sankalpaStages[activeFieldStage];

  return (
    <div className="space-y-0 relative bg-[#FFFDF8] text-[#221814]">
      
      {/* ==================================================================== */}
      {/* SECTION 1: NEW PREMIUM INITIATIVE (IAS | WITH LIFE) */}
      {/* ==================================================================== */}
      <IASWithLifeSection navigate={navigate} />

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* ==================================================================== */}
      {/* SECTION 2: FIXED IN-PLACE SCROLLYTELLING SPECTRUM */}
      {/* ==================================================================== */}
      <section ref={spectrumContainerRef} className="h-[400vh] relative bg-[#FAF6EE] border-b border-[#D5C3B0]/40">
        
        {/* STICKY FIXED VIEWPORT CONTAINER */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          
          {/* Header Title Block */}
          <div className="space-y-2 text-center mb-8">
            <span className="text-xs font-serif uppercase tracking-widest font-extrabold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
              FRAMEWORK FOR SUCCESS
            </span>

            <h1 className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-black text-[#221814] tracking-tight leading-none">
              The e-Gurukulam <span className="text-[#8C3A27]">Mentorship Spectrum</span>
            </h1>

            <p className="font-serif italic text-base sm:text-lg text-[#5C4028] font-bold">
              From complete guidance to complete ownership.
            </p>
          </div>

          {/* MAIN GRID: FIXED LEFT NAV + IN-PLACE SWAPPING CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            
            {/* PROMINENT VERTICAL LEFT NAV */}
            <div className="lg:col-span-5 space-y-5 py-2 border-r-0 lg:border-r border-[#D5C3B0]/50 lg:pr-8">
              
              <div className="space-y-0.5 border-b-2 border-[#8C3A27] pb-2.5">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C3A27] font-extrabold block">
                  MENTOR
                </span>
                <h3 className="font-serif-header text-lg sm:text-xl font-black text-[#221814] tracking-wider uppercase">
                  PHILOSOPHY SPECTRUM
                </h3>
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C3A27] font-extrabold block">
                  MENTEE
                </span>
              </div>

              {/* 3 Prominent Navigation Items */}
              <div className="space-y-3">
                {spectrumModels.map((model, idx) => {
                  const isSelected = activeTier === idx;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setActiveTier(idx)}
                      className={`w-full text-left transition-all duration-300 py-3 px-4 rounded-xl flex items-center gap-4 cursor-pointer focus:outline-none ${
                        isSelected
                          ? 'text-[#8C3A27] font-black translate-x-1.5'
                          : 'text-[#5C4028] opacity-75 hover:opacity-100 hover:text-[#221814]'
                      }`}
                    >
                      <span className={`font-serif font-black shrink-0 ${
                        model.isAddon ? 'text-lg sm:text-xl font-mono' : 'text-2xl sm:text-3xl'
                      } ${
                        isSelected ? 'text-[#8C3A27]' : 'text-[#7A6B5D]'
                      }`}>
                        {model.ratio}
                      </span>

                      <div className="space-y-0.5 min-w-0">
                        <span className={`font-serif text-sm sm:text-base font-extrabold tracking-wide block ${
                          isSelected ? 'text-[#8C3A27] font-black' : 'text-[#221814]'
                        }`}>
                          {model.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-serif italic text-[#7A6B5D]">
                <ArrowDown className="w-4 h-4 text-[#8C3A27] animate-bounce shrink-0" />
                <span>Scroll to experience each program</span>
              </div>

            </div>

            {/* IN-PLACE CONTENT DISPLAY AREA */}
            <div className="lg:col-span-7 relative min-h-[320px] flex flex-col justify-center lg:pl-2">
              
              {/* Translucent Background Watermark Number */}
              <span className="absolute -left-6 -top-10 text-[11rem] sm:text-[15rem] font-serif font-black text-[#8C3A27]/5 select-none pointer-events-none leading-none">
                {currentSpectrum.ratio}
              </span>

              <div key={currentSpectrum.id} className="relative z-10 space-y-5 animate-fade-in transition-all duration-500">
                
                {/* Ratio Tag & Title */}
                <div className="space-y-1.5 border-b border-[#D5C3B0]/60 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                      {currentSpectrum.mentorShare} · {currentSpectrum.menteeShare}
                    </span>
                    {currentSpectrum.idealFor && (
                      <span className="text-xs sm:text-sm font-serif text-[#7A6B5D] italic font-semibold">
                        {currentSpectrum.idealFor}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-black text-[#221814] tracking-tight">
                    {currentSpectrum.title}
                  </h2>
                </div>

                {/* Philosophy Statement */}
                <blockquote className="font-serif italic text-lg sm:text-2xl text-[#8C3A27] font-bold leading-relaxed border-l-4 border-[#8C3A27] pl-4 sm:pl-5 py-0.5">
                  “{currentSpectrum.philosophy}”
                </blockquote>

                {/* Summary */}
                {currentSpectrum.summary && (
                  <p className="text-sm sm:text-base text-[#3D3028] font-sans font-medium leading-relaxed">
                    {currentSpectrum.summary}
                  </p>
                )}

                {/* Deliverables List */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="font-serif-header text-xs sm:text-sm uppercase tracking-widest font-extrabold text-[#8C3A27]">
                    WHAT YOU RECEIVE IN THIS MODEL:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm font-semibold text-[#140C08]">
                    {currentSpectrum.deliverables.map((item, idx) => {
                      const parts = item.split(': ');
                      if (parts.length > 1) {
                        return (
                          <div key={idx} className="flex items-start gap-2.5 py-0.5">
                            <span className="w-2 h-2 rounded-full bg-[#8C3A27] mt-1.5 shrink-0"></span>
                            <span>
                              <strong className="font-sans font-extrabold text-[#140C08]">{parts[0]}: </strong>
                              <span className="font-serif italic font-semibold text-[#3D3028]">{parts.slice(1).join(': ')}</span>
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="flex items-start gap-2.5 py-0.5">
                          <span className="w-2 h-2 rounded-full bg-[#8C3A27] mt-1.5 shrink-0"></span>
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="pt-4">
                  {currentSpectrum.isAddon ? (
                    <div className="pt-1">
                      {/* Premium Editorial "COMING SOON" Campaign Seal / Sticker */}
                      <div 
                        onClick={() => navigate('/contact')}
                        className="inline-block relative z-20 pointer-events-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500 ease-out select-none cursor-pointer"
                      >
                        <div className="relative bg-[#8C3A27] text-[#F3EBDD] px-7 py-3 rounded-lg border-2 border-[#C5A059] shadow-[0_12px_30px_rgba(0,0,0,0.35)] flex items-center justify-center gap-3 overflow-hidden">
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
                      <span className="block text-xs font-serif italic text-[#7A6B5D] pt-2 font-bold">
                        *Available as an optional add-on module for IAS aspirants
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/contact')}
                      className="btn-terracotta-pill text-xs sm:text-sm py-3.5 px-8 font-serif font-bold shadow-md hover:shadow-xl transition-all inline-flex items-center gap-2.5 cursor-pointer"
                    >
                      <span>BOOK A DIRECT 1-ON-1 GUIDANCE SESSION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ==================================================================== */}
      {/* SECTION 3: SANKALPA SIDDHI (SCROLLYTELLING MATCHING SPECTRUM) */}
      {/* ==================================================================== */}
      <section ref={sankalpaContainerRef} className="h-[400vh] relative bg-[#FFFDF8] border-b border-[#D5C3B0]/40">
        
        {/* STICKY FIXED VIEWPORT CONTAINER */}
        <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          
          {/* Header Title Block */}
          <div className="space-y-2 text-center mb-8">
            <span className="text-xs font-serif uppercase tracking-widest font-extrabold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
              SPECIAL GOVERNANCE FIELDWORK OPPORTUNITY
            </span>

            <h2 className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-black text-[#221814] tracking-tight leading-none">
              Sankalpa Siddhi <span className="text-[#8C3A27] font-telugu font-bold text-2xl sm:text-4xl lg:text-5xl ml-1.5">(సంకల్ప సిద్ధి)</span>
            </h2>

            <p className="font-serif italic text-base sm:text-lg text-[#5C4028] font-bold">
              Nurturing Talent in Government Schools
            </p>
          </div>

          {/* MAIN GRID: FIXED LEFT NAV + IN-PLACE SWAPPING CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left">
            
            {/* PROMINENT VERTICAL LEFT NAV */}
            <div className="lg:col-span-5 space-y-5 py-2 border-r-0 lg:border-r border-[#D5C3B0]/50 lg:pr-8">
              
              <div className="space-y-0.5 border-b-2 border-[#8C3A27] pb-2.5">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C3A27] font-extrabold block">
                  FIELDWORK JOURNEY
                </span>
                <h3 className="font-serif-header text-lg sm:text-xl font-black text-[#221814] tracking-wider uppercase">
                  SANKALPA SIDDHI STAGES
                </h3>
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C3A27] font-extrabold block">
                  THEORY → REALITY
                </span>
              </div>

              {/* 4 Prominent Navigation Items */}
              <div className="space-y-2.5">
                {sankalpaStages.map((stage, idx) => {
                  const isSelected = activeFieldStage === idx;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveFieldStage(idx)}
                      className={`w-full text-left transition-all duration-300 py-2.5 px-4 rounded-xl flex items-center gap-4 cursor-pointer focus:outline-none ${
                        isSelected
                          ? 'text-[#8C3A27] font-black translate-x-1.5'
                          : 'text-[#5C4028] opacity-75 hover:opacity-100 hover:text-[#221814]'
                      }`}
                    >
                      <span className={`font-mono text-xl sm:text-2xl font-black shrink-0 ${
                        isSelected ? 'text-[#8C3A27]' : 'text-[#7A6B5D]'
                      }`}>
                        {stage.number}
                      </span>

                      <div className="space-y-0 min-w-0">
                        <span className={`font-serif text-sm sm:text-base font-extrabold tracking-wide block ${
                          isSelected ? 'text-[#8C3A27] font-black' : 'text-[#221814]'
                        }`}>
                          {stage.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-serif italic text-[#7A6B5D]">
                <ArrowDown className="w-4 h-4 text-[#8C3A27] animate-bounce shrink-0" />
                <span>Scroll to experience each stage</span>
              </div>

            </div>

            {/* IN-PLACE CONTENT DISPLAY AREA */}
            <div className="lg:col-span-7 relative min-h-[320px] flex flex-col justify-center lg:pl-2">
              
              {/* Translucent Background Watermark Stage Number */}
              <span className="absolute -left-6 -top-10 text-[11rem] sm:text-[15rem] font-serif font-black text-[#8C3A27]/5 select-none pointer-events-none leading-none">
                {currentStage.number}
              </span>

              <div key={currentStage.id} className="relative z-10 space-y-5 animate-fade-in transition-all duration-500">
                
                {/* Stage Tag & Title */}
                <div className="space-y-1.5 border-b border-[#D5C3B0]/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20">
                      STAGE {currentStage.number}
                    </span>
                    <span className="text-xs sm:text-sm font-serif text-[#7A6B5D] italic font-semibold">
                      Governance Fieldwork
                    </span>
                  </div>

                  <h2 className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-black text-[#221814] tracking-tight">
                    {currentStage.title}
                  </h2>
                </div>

                {/* Subtitle Statement */}
                <blockquote className="font-serif italic text-lg sm:text-2xl text-[#8C3A27] font-bold leading-relaxed border-l-4 border-[#8C3A27] pl-4 sm:pl-5 py-0.5">
                  “{currentStage.subtitle}”
                </blockquote>

                {/* Paragraph Description */}
                <p className="text-sm sm:text-base text-[#3D3028] font-sans font-medium leading-relaxed">
                  {currentStage.description}
                </p>

                {/* Punchline Statement */}
                <div className="pt-2">
                  <h3 className="font-serif-header text-base sm:text-lg font-black text-[#221814] tracking-widest uppercase">
                    THEORY ENDS WHERE <span className="text-[#8C3A27]">REALITY BEGINS.</span>
                  </h3>
                </div>

                {/* Action Trigger */}
                <div className="pt-4">
                  <a
                    href="https://www.sankalpasiddi.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-terracotta-pill text-xs sm:text-sm py-3.5 px-8 font-serif font-bold shadow-md hover:shadow-xl transition-all inline-flex items-center gap-2.5"
                  >
                    <span>EXPLORE SANKALPA SIDDHI ↗</span>
                  </a>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ==================================================================== */}
      {/* SESSION-ONLY "COMING SOON" PROGRAM PREVIEW MODAL POPUP */}
      {/* APPEARS ONLY ONCE PER BROWSER SESSION & ONLY ON PROGRAMS PAGE */}
      {/* ==================================================================== */}
      {showComingSoonModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs transition-opacity animate-fade-in text-[#221814]"
          onClick={handleCloseComingSoonModal}
        >
          <div 
            className="relative w-full max-w-xl bg-[#FAF6EE] text-[#221814] rounded-3xl shadow-2xl border-2 border-[#8C3A27]/40 p-6 sm:p-8 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={handleCloseComingSoonModal}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              
              {/* Header Badge & Title */}
              <div className="space-y-3 pr-8">
                {/* Premium Editorial "Upcoming Initiatives" Campaign Seal Badge */}
                <div className="inline-block relative z-20 select-none">
                  <div className="relative bg-[#8C3A27] text-[#F3EBDD] px-4 py-1.5 rounded-md border border-[#C5A059] shadow-md flex items-center justify-center gap-2 overflow-hidden">
                    {/* Inner Inset Hairline Frame */}
                    <div className="absolute inset-0.5 border border-[#C5A059]/60 rounded-xs pointer-events-none" />
                    
                    {/* Corner Notch Stamp Accents */}
                    <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                    <span className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#F3EBDD] relative z-10 pt-0.5">
                      Upcoming Initiatives
                    </span>
                    <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                  </div>
                </div>

                <h3 className="font-serif-header text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#221814] leading-none whitespace-nowrap">
                  A NEW WAY TO PREPARE FOR IAS
                </h3>

                <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-bold">
                  Be the first to explore our upcoming specialized initiatives on the Programs Page.
                </p>
              </div>

              {/* 2 Upcoming Initiatives Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* Initiative 1: IAS | WITH LIFE */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] space-y-2 relative overflow-hidden group hover:border-[#8C3A27] transition-all">
                  <div className="flex items-center justify-between">
                    {/* Premium Editorial "COMING SOON" Campaign Seal Badge */}
                    <div className="inline-block relative z-10 select-none transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="relative bg-[#8C3A27] text-[#F3EBDD] px-3 py-1 rounded-md border border-[#C5A059] shadow-xs flex items-center justify-center gap-1.5 overflow-hidden">
                        <div className="absolute inset-0.5 border border-[#C5A059]/60 rounded-xs pointer-events-none" />
                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#F3EBDD] relative z-10 pt-0.5">
                          COMING SOON
                        </span>
                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                      </div>
                    </div>
                    <Clock className="w-3.5 h-3.5 text-[#8C3A27]" />
                  </div>

                  <h4 className="font-serif-header text-base font-extrabold text-[#221814] pt-1">
                    IAS | WITH LIFE
                  </h4>

                  <p className="text-xs font-serif italic text-[#5C4028] font-semibold leading-relaxed">
                    Designed for Homemakers &amp; Working Professionals who can't put life on hold.
                  </p>
                </div>

                {/* Initiative 2: NextGen Governance */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] space-y-2 relative overflow-hidden group hover:border-[#8C3A27] transition-all">
                  <div className="flex items-center justify-between">
                    {/* Premium Editorial "COMING SOON" Campaign Seal Badge */}
                    <div className="inline-block relative z-10 select-none transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="relative bg-[#8C3A27] text-[#F3EBDD] px-3 py-1 rounded-md border border-[#C5A059] shadow-xs flex items-center justify-center gap-1.5 overflow-hidden">
                        <div className="absolute inset-0.5 border border-[#C5A059]/60 rounded-xs pointer-events-none" />
                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#F3EBDD] relative z-10 pt-0.5">
                          COMING SOON
                        </span>
                        <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full shrink-0" />
                      </div>
                    </div>
                    <Clock className="w-3.5 h-3.5 text-[#8C3A27]" />
                  </div>

                  <h4 className="font-serif-header text-base font-extrabold text-[#221814] pt-1">
                    NextGen Governance
                  </h4>

                  <p className="text-xs font-serif italic text-[#5C4028] font-semibold leading-relaxed">
                    Master diagnostic workflows to break down, design, and scale public systems.
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseComingSoonModal}
                  className="btn-terracotta-pill text-xs py-3 px-8 font-serif font-bold shadow-md hover:shadow-xl transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE UPCOMING PROGRAMS →</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}