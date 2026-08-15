import React from 'react';
import { SectionDivider } from '../components/Artworks';
import HeroPhilosophyScrollytelling from '../components/HeroPhilosophyScrollytelling';
import PedagogicalScrollytelling from '../components/PedagogicalScrollytelling';
import beginYourJourneyImg from '../assets/begin_your_journey.jpg';
import { 
  ArrowRight, Award, Eye, Target, Compass, Sprout, 
  BookOpen, Clock, TrendingUp, GraduationCap, User, Flame 
} from 'lucide-react';

export default function AboutPage({ navigate }) {
  const [portraitError, setPortraitError] = React.useState(false);

  return (
    <div className="space-y-0">
      
      {/* SECTION 1 (TOP HERO): 2-PHASE DYNAMIC SCROLL-DRIVEN PHILOSOPHY HERO SECTION */}
      <section className="section-mottled-parchment border-b border-[#D5C3B0]/40 overflow-visible p-0 m-0">
        <HeroPhilosophyScrollytelling />
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* SECTION 2 (2ND POSITION): FOUNDER & MENTOR SECTION */}
      <section id="founder-section" className="section-mottled-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Unblended Portrait inside Editorial Frame */}
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
                    Founder &amp; Esteemed Mentor
                  </span>
                </div>
              </div>
            </div>

            {/* Mentor & Guide Text Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {/* Heading */}
              <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08]">
                About Our Visionary Mentor
              </h2>

              {/* Sub-Heading / Quote */}
              <blockquote className="font-serif italic text-base sm:text-lg text-[#8C3A27] border-l-4 border-[#8C3A27] pl-4 py-1 leading-relaxed font-bold">
                “Every obstacle in preparation is simply an undiscovered strategy.”
              </blockquote>

              {/* Body Text */}
              <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed font-sans font-medium">
                Akella Raghavendra is a distinguished Civil Services mentor, author, and coach dedicated to shaping the next generation of India’s administrative leaders. His mission in civil services coaching is rooted in deep personal experience: after years of rigorous preparation for the UPSC Examination, he narrowly missed final selection by just 12 marks. Recognizing that every setback carries a vital lesson, he transformed his personal insights into a strategic roadmap to help future candidates avoid critical exam pitfalls.
              </p>

              <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed font-sans font-medium">
                Over the last two decades, Akella Raghavendra has mentored more than 10,000 UPSC aspirants across all stages of the examination: Prelims, Mains, and the Personality Test. His guided methodology has directly contributed to producing 1,000+ serving officers in prestigious cadres including the IAS, IPS, IRS, and State Group-1 services.
              </p>

              <p className="text-xs sm:text-sm text-[#2A1E18] leading-relaxed font-sans font-medium">
                As a published author and subject matter expert, he provides specialized guidance in key optional subjects, particularly Anthropology and Telugu Literature. Beyond delivering comprehensive syllabus coverage, his mentorship emphasizes strategic answer writing, exam-day temperament, and the mental resilience necessary to clear India's most competitive examination.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-terracotta-pill"
                >
                  <span className="btn-label">Meet the Mentor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* SECTION 3: THE PEDAGOGICAL CONTINUUM */}
      <section className="section-clean-parchment p-0 m-0 overflow-visible">
        <PedagogicalScrollytelling />
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <div className="pedagogical-divider-line">
        <SectionDivider />
      </div>

      {/* SECTION 4: OUR VISION & OUR MISSION (EXACT ARCHIVAL MANUSCRIPT MEDALLION STYLING) */}
      <section className="section-clean-parchment py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            
            {/* OUR VISION CARD */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FBF6EC] to-[#F5ECE0] border border-[#D5C3B0] border-b-4 border-b-[#C5A059] p-8 sm:p-10 shadow-[0_15px_35px_rgba(60,40,25,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between overflow-hidden group hover:shadow-[0_20px_45px_rgba(60,40,25,0.18)] transition-all duration-300">
              
              <div className="space-y-6 relative z-10">
                {/* Header Row: 3D Embossed Medallion Badge + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#F4ECE1] to-[#E6D6BF] border-2 border-[#C5A059] shadow-[0_4px_12px_rgba(140,58,39,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-[#8C3A27]" />
                  </div>

                  <div>
                    <h3 className="font-serif-header text-xl sm:text-2xl font-extrabold text-[#3D2214] tracking-wider uppercase">
                      OUR VISION
                    </h3>
                    <div className="w-10 h-0.5 bg-[#C5A059] mt-1.5 rounded-full" />
                  </div>
                </div>

                {/* Italic Serif Manuscript Body Text */}
                <p className="font-serif italic text-sm sm:text-base text-[#2C1C13] leading-relaxed font-semibold">
                  To enable every individual, regardless of where they begin, to rise beyond their circumstances and become capable of shaping their own destiny and, through knowledge, judgement and integrity, contributing to the governance of society and the nation.
                </p>
              </div>

              {/* Faint Architectural Pillar Watermark Motif */}
              <div className="absolute right-2 bottom-0 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <svg width="110" height="130" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20 H90 V28 H10 Z M15 28 H85 V34 H15 Z M20 34 V100 M35 34 V100 M50 34 V100 M65 34 V100 M80 34 V100 M10 100 H90 V110 H10 Z" stroke="#8C3A27" strokeWidth="2.5" fill="none" />
                  <circle cx="20" cy="16" r="6" stroke="#8C3A27" strokeWidth="2" fill="none" />
                  <circle cx="80" cy="16" r="6" stroke="#8C3A27" strokeWidth="2" fill="none" />
                </svg>
              </div>

            </div>

            {/* OUR MISSION CARD */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FBF6EC] to-[#F5ECE0] border border-[#D5C3B0] border-b-4 border-b-[#C5A059] p-8 sm:p-10 shadow-[0_15px_35px_rgba(60,40,25,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between overflow-hidden group hover:shadow-[0_20px_45px_rgba(60,40,25,0.18)] transition-all duration-300">
              
              <div className="space-y-6 relative z-10">
                {/* Header Row: 3D Embossed Medallion Badge + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#F4ECE1] to-[#E6D6BF] border-2 border-[#C5A059] shadow-[0_4px_12px_rgba(140,58,39,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Target className="w-7 h-7 sm:w-8 sm:h-8 text-[#8C3A27]" />
                  </div>

                  <div>
                    <h3 className="font-serif-header text-xl sm:text-2xl font-extrabold text-[#3D2214] tracking-wider uppercase">
                      OUR MISSION
                    </h3>
                    <div className="w-10 h-0.5 bg-[#C5A059] mt-1.5 rounded-full" />
                  </div>
                </div>

                {/* Italic Serif Manuscript Body Text */}
                <p className="font-serif italic text-sm sm:text-base text-[#2C1C13] leading-relaxed font-semibold">
                  To make that transformation possible through education and mentorship that develops an aspirant from the inside out: building knowledge before information, understanding before memorisation, judgement before answers, and discipline before achievement, so that a determined individual can grow into a capable and responsible Civil Servant.
                </p>
              </div>

              {/* Faint Architectural Pillar Watermark Motif */}
              <div className="absolute right-2 bottom-0 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <svg width="110" height="130" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20 H90 V28 H10 Z M15 28 H85 V34 H15 Z M20 34 V100 M35 34 V100 M50 34 V100 M65 34 V100 M80 34 V100 M10 100 H90 V110 H10 Z" stroke="#8C3A27" strokeWidth="2.5" fill="none" />
                  <circle cx="20" cy="16" r="6" stroke="#8C3A27" strokeWidth="2" fill="none" />
                  <circle cx="80" cy="16" r="6" stroke="#8C3A27" strokeWidth="2" fill="none" />
                </svg>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* SECTION 5: INSTITUTIONAL CODE (WARM PARCHMENT 3D DUALITY CARDS & OUTCOME BANNER) */}
      <section className="section-clean-parchment py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30 space-y-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Block */}
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div>
              <span className="eyebrow-badge">
                OUR PRINCIPLE OF PARTNERSHIP
              </span>
            </div>

            <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#140C08] tracking-tight">
              INSTITUTIONAL CODE
            </h2>

            <p className="text-xs sm:text-sm text-[#2A1E18] font-sans font-medium leading-relaxed max-w-2xl mx-auto pt-1">
              At e-Gurukulam, our strength lies in the bond between mentor and mentee. We believe great mentorship is a two-way commitment towards <span className="font-serif italic font-extrabold text-[#8C3A27]">transformation.</span>
            </p>
          </div>

          {/* Duality Cards Container with Central Torch Medallion Bridge */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            
            {/* CENTRAL 3D GOLDEN TORCH MEDALLION BRIDGE */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#F4ECE1] to-[#E6D6BF] border-2 border-[#C5A059] shadow-[0_6px_18px_rgba(140,58,39,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)] items-center justify-center">
              <Flame className="w-7 h-7 text-[#8C3A27]" />
            </div>

            {/* LEFT CARD: THE MENTOR (Warm Parchment 3D Card Style - GraduationCap Icon) */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FBF6EC] to-[#F5ECE0] border border-[#D5C3B0] border-b-4 border-b-[#8C3A27] p-6 sm:p-8 shadow-[0_10px_25px_rgba(60,40,25,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between space-y-6 overflow-hidden group hover:shadow-[0_16px_32px_rgba(60,40,25,0.16)] transition-all duration-300">
              
              {/* Top Section */}
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full border-2 border-[#C5A059] bg-[#FAF5EE] flex items-center justify-center mx-auto shadow-md">
                  <GraduationCap className="w-7 h-7 text-[#8C3A27]" />
                </div>

                <div>
                  <h3 className="font-serif-header text-xl sm:text-2xl font-extrabold text-[#140C08] tracking-wider uppercase">
                    THE MENTOR
                  </h3>
                  <div className="w-10 h-0.5 bg-[#C5A059] mx-auto mt-1.5 rounded-full" />
                </div>
              </div>

              {/* 3 Mentor Feature Items */}
              <div className="space-y-5 text-left relative z-10">
                
                {/* Item 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Compass className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Guides with Wisdom
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Provides clarity, direction and strategy rooted in experience.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Target className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Challenges with Purpose
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Pushes boundaries to build depth, rigour and perspective.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sprout className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Nurtures Growth
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Supports with empathy and belief, until the mentee is ready to lead.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT CARD: THE MENTEE (Warm Parchment 3D Card Style - User Icon) */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FBF6EC] to-[#F5ECE0] border border-[#D5C3B0] border-b-4 border-b-[#C5A059] p-6 sm:p-8 shadow-[0_10px_25px_rgba(60,40,25,0.1),inset_0_1px_0_rgba(255,255,25,0.9)] flex flex-col justify-between space-y-6 overflow-hidden group hover:shadow-[0_16px_32px_rgba(60,40,25,0.16)] transition-all duration-300">
              
              {/* Top Section */}
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full border-2 border-[#C5A059] bg-[#FAF5EE] flex items-center justify-center mx-auto shadow-md">
                  <User className="w-7 h-7 text-[#8C3A27]" />
                </div>

                <div>
                  <h3 className="font-serif-header text-xl sm:text-2xl font-extrabold text-[#140C08] tracking-wider uppercase">
                    THE MENTEE
                  </h3>
                  <div className="w-10 h-0.5 bg-[#C5A059] mx-auto mt-1.5 rounded-full" />
                </div>
              </div>

              {/* 3 Mentee Feature Items */}
              <div className="space-y-5 text-left relative z-10">
                
                {/* Item 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <BookOpen className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Learns with Humility
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Comes with an open mind, ready to listen, learn and unlearn.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Clock className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Acts with Discipline
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Shows up consistently and puts in the disciplined effort.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full border border-[#C5A059] bg-[#FFFDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <TrendingUp className="w-4.5 h-4.5 text-[#8C3A27]" />
                  </div>
                  <div>
                    <h4 className="font-serif-header text-base font-bold text-[#140C08]">
                      Grows through Guidance
                    </h4>
                    <p className="text-xs text-[#2A1E18] font-sans font-medium leading-relaxed mt-0.5">
                      Takes feedback to improve and takes responsibility for progress.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* BOTTOM BANNER: THE OUTCOME (Warm Parchment Card Style) */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FBF6EC] to-[#F5ECE0] border border-[#D5C3B0] border-b-4 border-b-[#8C3A27] p-6 sm:p-8 text-center shadow-lg text-[#140C08] overflow-hidden space-y-2">
            
            <span className="text-[11px] font-serif font-extrabold tracking-[0.2em] text-[#8C3A27] uppercase block">
              THE OUTCOME
            </span>

            <h3 className="font-serif italic text-base sm:text-lg md:text-xl font-bold text-[#140C08] max-w-4xl mx-auto leading-relaxed">
              “When the mentor gives direction and the mentee gives commitment, <br className="hidden sm:inline" />
              <span className="text-[#8C3A27] underline decoration-[#C5A059] underline-offset-4">preparation becomes transformation.”</span>
            </h3>

            <p className="text-xs sm:text-sm text-[#2A1E18] font-sans font-medium pt-1">
              Together, we shape not just aspirants, but future leaders of the nation.
            </p>

          </div>

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* SECTION 6: BEGIN YOUR JOURNEY WITH US GRAND HERO ARTWORK BANNER (100% FULL SECTION FILL) */}
      <section className="section-mottled-parchment py-8 md:py-12 px-0 m-0 w-full overflow-hidden border-b border-[#D5C3B0]/40">
        <div className="w-full relative flex flex-col items-center justify-center">
          
          {/* Grand Journey Artwork Image Filling 100% Full Width */}
          <div className="relative w-full flex items-center justify-center">
            <img 
              src={beginYourJourneyImg} 
              alt="Begin Your Journey With Us - e-Gurukulam IAS Academy"
              loading="lazy"
              decoding="async"
              className="journey-banner-blend-image"
            />

            {/* Positioned Clickable Interactive CTA Button overlaying the artwork button */}
            <div className="absolute bottom-6 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => navigate('/apply')}
                className="btn-terracotta-pill py-3.5 px-8 sm:px-10 shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-[#FFE8B3]/50 cursor-pointer"
              >
                <span className="btn-label font-bold tracking-wider text-xs sm:text-sm">
                  BEGIN YOUR JOURNEY WITH US
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}