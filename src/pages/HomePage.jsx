import React, { useState } from 'react';
import HeroImage from '../components/HeroImage';
import AspirantJourney from '../components/AspirantJourney';
import { SectionDivider } from '../components/Artworks';
import { ArrowUpRight, ArrowRight, Feather, Award } from 'lucide-react';

export default function HomePage({ navigate }) {
  const [portraitError, setPortraitError] = useState(false);

  const stats = [
    { number: "10000+", label: "Students Trained" },
    { number: "1000+", label: "Officers Produced" },
    { number: "15+", label: "Books Authored" },
    { number: "25+", label: "Years of Service" }
  ];

  return (
    <div className="space-y-0">
      
      {/* 1. HERO SECTION (STRICT: MOTTLED GRADIENT PARCHMENT BACKGROUND) */}
      <section className="section-mottled-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column Text Content */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-5 text-left">
              <div>
                <span className="eyebrow-badge">
                  <Feather className="w-3.5 h-3.5 text-[#8C3A27]" />
                  <span>THE GURUKULAM WAY</span>
                </span>
              </div>

              <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#140C08] leading-[1.15]">
                “The Art of <br />
                <span className="text-[#8C3A27] italic font-serif">Becoming a Civil Servant”</span>
              </h1>

              <p className="font-serif italic text-lg sm:text-xl text-[#2A1E18] leading-relaxed max-w-2xl font-semibold">
                “Learn with Purpose. Prepare with Discipline. Lead with Wisdom.”
              </p>

              <p className="text-sm sm:text-base text-[#2A1E18] leading-relaxed max-w-xl font-sans font-medium">
                Transforming civil service preparation into a journey of purposeful growth. Blending timeless mentorship wisdom with contemporary exam strategy to shape thoughtful, capable, and exemplary civil servants.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => navigate('/apply')}
                  className="btn-terracotta-pill"
                >
                  <span className="btn-label">Begin Your Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/programs')}
                  className="manuscript-link text-xs font-serif uppercase tracking-widest text-[#140C08] flex items-center gap-1 font-bold py-2"
                >
                  <span>Explore Programs</span>
                  <ArrowUpRight className="w-4 h-4 text-[#8C3A27]" />
                </button>
              </div>
            </div>

            {/* Right Column: Hero Image Component */}
            <div className="lg:col-span-6 xl:col-span-7 flex justify-center items-center overflow-visible">
              <HeroImage />
            </div>

          </div>
        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 2. MENTOR SECTION */}
      <section id="founder-section" className="section-mottled-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-y border-[#D5C3B0]/40">
        <div className="max-w-7xl mx-auto">
          <div className="founder-section-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-center">
            
            {/* Unblended Portrait in Editorial Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="editorial-portrait-frame max-w-xs sm:max-w-sm">
                {!portraitError ? (
                  <img 
                    src="/images/akella_raghavendra.png" 
                    alt="Akella Raghavendra Sir"
                    loading="lazy"
                    decoding="async"
                    className="editorial-portrait-img aspect-[4/5]"
                    onError={() => setPortraitError(true)}
                  />
                ) : (
                  <div className="w-64 h-80 flex flex-col items-center justify-center text-center p-6 bg-[#F9F5EB]">
                    <Award className="w-12 h-12 text-[#8C3A27] mb-2" />
                    <span className="font-serif-header text-xl font-extrabold text-[#140C08]">
                      Akella Raghavendra Sir
                    </span>
                  </div>
                )}
                <div className="pt-3 pb-1 text-center border-t border-[#C5A059]/40 mt-2 space-y-0.5">
                  <span className="font-serif-header text-base sm:text-lg font-extrabold tracking-wider text-[#140C08] block">
                    Akella Raghavendra Sir
                  </span>
                  <span className="text-xs sm:text-sm text-[#8C3A27] font-serif font-bold uppercase tracking-wider block">
                    Esteemed Mentor &amp; Founder
                  </span>
                </div>
              </div>
            </div>

            {/* Vertically Centered Section Text Content */}
            <div className="lg:col-span-7 space-y-3 text-left my-auto flex flex-col justify-center">
              <h2 className="mentors-note-heading-line1 font-extrabold">
                ఓ యువతా!
              </h2>

              <p className="mentors-note-text">
                "తన తలరాతను తనే రాయగల అవకాశాన్నే వదులుకొని<br />
                తనలో భీతిని తన అజ్ఞ్యానాన్ని  తన ప్రతినిధులుగ ఎన్నుకొని<br />
                అదే విద్య అని తలచే జాతిని ప్రశ్నించడమే మానుకొని<br />
                కళ్ళు వున్న ఈ కబోది జాతిని నడిపిస్తుందట ఆత్మన్యూనత <br />
                ఆ హక్కేదో తనకే ఉందని శాసిస్తుందట సమాజం"
              </p>

              <p className="mentors-note-heading-line2 pt-2">
                "ర్యాంకుల చీకటినే <span className="text-[#990000] font-extrabold">'వెలుగు'</span> అని భ్రమిద్దామా?"
              </p>

              <p className="mentors-note-tagline">
                తన జీవితాన్ని తనే నిర్మించుకునే స్థాయి నుంచి… దేశాన్ని నిర్మించే చేసే స్థాయి వరకు
                <span className="mentors-note-tagline-highlight">
                  <a 
                    href="/contact" 
                    onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
                    className="inline-link font-semibold underline decoration-[#8C3A27] underline-offset-4 text-[#8C3A27] hover:text-[#732D1B] cursor-pointer transition-colors"
                  >
                    e-Gurukulam
                  </a> మీ కోసం!
                </span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 3. OUR IMPACT AT A GLANCE */}
      <section className="section-mottled-parchment py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40 space-y-6 text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Section Header & Tagline */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <div>
              <span className="eyebrow-badge">
                HERITAGE &amp; EXCELLENCE
              </span>
            </div>

            <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08] tracking-tight">
              Our Impact at a Glance
            </h2>

            <p className="text-xs sm:text-sm text-[#2A1E18] font-sans font-medium leading-relaxed max-w-2xl mx-auto">
              Over Two Decades of Dedicated Mentorship, Empowering Aspirants to Excel in Governance
            </p>
          </div>

          {/* 4-Card Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center pt-2">
            {stats.map((st, idx) => (
              <div key={idx} className="card-parchment-3d p-6 space-y-1 group hover:border-[#8C3A27] transition-all">
                <span className="font-serif-header text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#8C3A27] block group-hover:scale-105 transition-transform duration-300">
                  {st.number}
                </span>
                <span className="text-xs font-serif font-bold text-[#140C08] uppercase tracking-wider block pt-1">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 4. THE ASPIRANT'S JOURNEY */}
      <section className="border-b border-[#D5C3B0]/30 pb-8">
        <AspirantJourney navigate={navigate} />
      </section>

    </div>
  );
}