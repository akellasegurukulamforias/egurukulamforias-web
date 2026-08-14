import React from 'react';
import { 
  ExternalLink, 
  Sparkles,
  CheckCircle,
  Apple,
  Video,
  PlayCircle
} from 'lucide-react';

export default function ResourcesPage({ navigate }) {
  const ANDROID_PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=co.shield.smpqz";
  const IOS_APP_STORE_URL = "https://apps.apple.com/in/app/myinstitute/id1472483563";
  const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/UCvli1LsskbL3Y4a8S8r035Q";
  const ORG_CODE = "smpqz";

  return (
    <div className="space-y-0 relative min-h-screen bg-[#FFFDF8]">
      
      {/* 1. HERO HEADER SECTION */}
      <section className="section-mottled-parchment py-16 md:py-20 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="font-serif-header text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#221814] leading-tight whitespace-nowrap">
            Digital Learning &amp; Study Resources
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-3xl mx-auto leading-relaxed">
            Access recorded and live classes, free study materials, subject notes, micro-syllabus breakdowns, and live test series on Android &amp; iOS.
          </p>
        </div>
      </section>

      {/* 2. MAIN RESOURCES GRID */}
      <section className="section-clean-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* A. OFFICIAL MOBILE APP RESOURCE PORTAL CARD */}
          <div className="card-parchment-3d p-8 md:p-12 border-2 border-[#8C3A27]/40 bg-gradient-to-br from-[#FAF6EE] via-[#F4ECE1] to-[#FAF6EE] space-y-8 text-center relative overflow-hidden shadow-2xl">
            
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#8C3A27]/10 text-[#8C3A27] flex items-center justify-center mx-auto border border-[#8C3A27]/20 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            {/* Title & Copy */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full inline-block border border-[#8C3A27]/20">
                OFFICIAL E-GURUKULAM RESOURCE VAULT
              </span>

              <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814] leading-snug">
                Download Study Material &amp; Free PDF Notes
              </h2>

              <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium max-w-2xl mx-auto leading-relaxed">
                All official study materials, recorded and live classes, micro-syllabus notes, Prelims test series booklets, and daily current affairs summaries are available through our official mobile applications.
              </p>
            </div>

            {/* ORG CODE PROMINENT BOX */}
            <div className="bg-[#FAF6EE] p-5 rounded-2xl border-2 border-dashed border-[#8C3A27]/40 max-w-md mx-auto space-y-1.5 shadow-sm">
              <div className="text-[11px] font-serif uppercase tracking-widest text-[#7A6B5D] font-bold">
                Organization Code for App Login
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-black text-[#8C3A27] tracking-widest bg-[#8C3A27]/10 px-4 py-1 rounded-xl border border-[#8C3A27]/30">
                  {ORG_CODE}
                </span>
              </div>
              <p className="text-[11px] text-[#3D3028] font-medium pt-1">
                Enter code <strong className="text-[#8C3A27]">smpqz</strong> when signing into the iOS <strong>MyInstitute</strong> app or Android app.
              </p>
            </div>

            {/* DOWNLOAD BUTTONS GRID — ANDROID & IOS ONLY */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              
              {/* Google Play Store Button */}
              <a
                href={ANDROID_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 btn-terracotta-pill text-xs py-3.5 px-6 font-serif font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.09 3,21.09 3,20.5M16.81,15.12L18.81,13.12C19.43,12.5 19.43,11.5 18.81,10.88L16.81,8.88L14.75,10.94L16.81,13L14.75,15.06M15.81,16.12L14.75,17.18L4.85,22.86C5.16,23 5.5,23 5.85,22.86L15.81,16.12M15.81,7.88L5.85,1.14C5.5,1 5.16,1 4.85,1.14L14.75,6.82L15.81,7.88Z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider opacity-80 leading-none">GET IT ON</div>
                  <div className="text-xs font-bold leading-tight">Google Play</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>

              {/* Apple App Store Button */}
              <a
                href={IOS_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 btn-terracotta-pill text-xs py-3.5 px-6 font-serif font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5"
              >
                <Apple className="w-5 h-5 fill-current shrink-0" />
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider opacity-80 leading-none">DOWNLOAD ON THE</div>
                  <div className="text-xs font-bold leading-tight">Apple App Store</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>

            </div>

            {/* APP FEATURES HIGHLIGHT STRIP */}
            <div className="pt-4 border-t border-[#D5C3B0]/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-serif font-semibold text-[#3D3028]">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Recorded &amp; Live Classes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Subject Micro-Notes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Solved PYQ Booklets</span>
              </div>
            </div>

          </div>

          {/* B. FEATURED YOUTUBE CHANNEL SECTION — NOW PLACED BELOW APP VAULT */}
          <div className="card-parchment-3d p-8 md:p-10 border-2 border-[#8C3A27]/40 bg-gradient-to-br from-[#FFFDF8] via-[#FAF4EA] to-[#FFFDF8] space-y-6 text-center relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center shrink-0 border border-[#FF0000]/20 shadow-inner mt-1">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3 py-0.5 rounded-full inline-block border border-[#8C3A27]/20">
                    OFFICIAL YOUTUBE LECTURES &amp; MENTORSHIP
                  </span>
                  <h3 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814]">
                    e-Gurukulam Official YouTube Channel
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed max-w-xl">
                    Watch free video lectures, exam preparation strategy sessions, GS micro-syllabus breakdowns, and daily mentorship guidance by Akella Raghavendra Sir.
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <a 
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-terracotta-pill text-xs py-3.5 px-6 font-serif font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-[#8C3A27] hover:bg-[#FF0000] w-full md:w-auto"
                >
                  <PlayCircle className="w-4 h-4 shrink-0" />
                  <span className="btn-label" style={{ whiteSpace: 'nowrap' }}>SUBSCRIBE &amp; WATCH ON YOUTUBE</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}