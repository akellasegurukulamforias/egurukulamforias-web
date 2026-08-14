import React from 'react';
import { 
  ExternalLink, 
  BookOpen, 
  Award, 
  Shield,
  Sparkles
} from 'lucide-react';

export default function BlogPage({ navigate }) {
  const CURRENT_AFFAIRS_URL = "https://www.iasmentoring.com/current_affairs.html";

  return (
    <div className="space-y-0 relative min-h-screen bg-[#FFFDF8]">
      
      {/* 1. HERO SECTION */}
      <section className="section-mottled-parchment py-16 md:py-24 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221814] leading-tight">
            Daily Current Affairs &amp; Analysis
          </h1>

          <div className="space-y-2">
            <p className="font-serif italic text-lg sm:text-xl text-[#3D3028] font-bold max-w-2xl mx-auto">
              “Understand What Is Happening Around You.”
            </p>
            <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium max-w-xl mx-auto">
              Access daily analytical briefings, Supreme Court verdicts, and UPSC exam value-addition dispatches.
            </p>
          </div>

          {/* MAIN DIRECT EXTERNAL PORTAL LINK CARD */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="card-parchment-3d p-8 md:p-10 space-y-6 text-center border-2 border-[#8C3A27]/30 bg-[#FAF6EE] shadow-xl">
              
              <div className="w-16 h-16 rounded-2xl bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
                  Current Affairs Desk
                </h3>
                <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium max-w-lg mx-auto">
                  Click below to access all live daily current affairs articles, subject digests, and editorial briefings directly on the official IAS Mentoring portal.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={CURRENT_AFFAIRS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 btn-terracotta-pill text-sm py-4 px-8 font-serif font-bold shadow-lg hover:shadow-2xl transition-all"
                >
                  <span>Explore Daily Current Affairs Dispatches</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. WHY VEEKSHANAM CURRENT AFFAIRS SECTION */}
      <section className="section-clean-parchment py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27]">
              EDITORIAL RIGOR &amp; ANALYTICAL DEPTH
            </span>
            <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814]">
              High-Yield Editorial Analysis for UPSC CSE
            </h2>
            <p className="text-sm sm:text-base text-[#3D3028] font-serif italic font-semibold">
              “Factual knowledge builds Prelims score; analytical clarity crafts Mains answers.”
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="card-parchment-3d p-8 space-y-4 text-left border border-[#D5C3B0]/60">
              <div className="w-12 h-12 rounded-xl bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif-header text-xl font-bold text-[#221814]">
                Polity &amp; Governance
              </h3>
              <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                In-depth breakdown of Supreme Court verdicts, constitutional amendments, parliamentary bills, and administrative reforms.
              </p>
            </div>

            <div className="card-parchment-3d p-8 space-y-4 text-left border border-[#D5C3B0]/60">
              <div className="w-12 h-12 rounded-xl bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif-header text-xl font-bold text-[#221814]">
                Economy &amp; Trade Briefings
              </h3>
              <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                Macroeconomic indicators, RBI monetary policies, fiscal updates, GI tags, and global trade agreements simplified for GS II &amp; III.
              </p>
            </div>

            <div className="card-parchment-3d p-8 space-y-4 text-left border border-[#D5C3B0]/60">
              <div className="w-12 h-12 rounded-xl bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif-header text-xl font-bold text-[#221814]">
                Science, Tech &amp; Environment
              </h3>
              <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                Clean energy initiatives, Small Modular Reactors (SMRs), biodiversity conservation, and technology policies simplified for revision.
              </p>
            </div>

          </div>

          <div className="text-center pt-4">
            <a
              href={CURRENT_AFFAIRS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terracotta-pill text-xs py-3.5 px-8 inline-flex items-center gap-2 font-serif font-bold"
            >
              <span>Visit Official Current Affairs Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}