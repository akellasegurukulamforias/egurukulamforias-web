import React from 'react';
import { 
  ExternalLink, 
  BookOpen, 
  Award, 
  Shield,
  Sparkles,
  FileText,
  Calendar,
  Tag,
  Loader2
} from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { createSlug, getDirectImageUrl } from './CurrentAffairsReader';
import { SectionDivider } from '../components/Artworks';

export default function BlogPage({ navigate }) {
  const CURRENT_AFFAIRS_URL = "https://www.iasmentoring.com/current_affairs.html";
  const { data, loading } = useCMSData();

  return (
    <div className="space-y-0 relative min-h-screen bg-[#FFFDF8]">
      
      {/* 1. HERO SECTION */}
      <section className="section-mottled-parchment py-16 md:py-20 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto space-y-3">
          
          <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221814] leading-tight">
            Daily Current Affairs &amp; Analysis
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-2xl mx-auto leading-relaxed">
            “Understand What Is Happening Around You.”
          </p>

        </div>
      </section>

      {/* 2. DYNAMIC GOOGLE SHEET CMS CURRENT AFFAIRS SECTION */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-b border-[#D5C3B0]/40">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* LOADING STATE */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
              <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                Fetching latest current affairs dispatches...
              </p>
            </div>
          )}

          {/* CONTENT GRID */}
          {!loading && data.currentAffairs && data.currentAffairs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.currentAffairs.map((item, idx) => {
                const title = item.Title || item.title || 'Untitled Dispatch';
                const date = item.Date || item.date || 'Today';
                const category = item.Category || item.category || 'General Studies';
                const shortSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '';
                const rawBanner = item.Banner_Image || item.banner_image || item.Banner || item.banner || item.Image || item.image;
                const bannerImage = getDirectImageUrl(rawBanner);

                return (
                  <div 
                    key={idx} 
                    className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left"
                  >
                    {/* Banner Image */}
                    {bannerImage && (
                      <div className="w-full h-48 overflow-hidden bg-black/5 relative">
                        <img 
                          src={bannerImage} 
                          alt={title} 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-3 flex-1">
                      {/* Date & Category Badge */}
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                          <Tag className="w-3 h-3" />
                          <span>{category}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-serif text-[#7A6B5D] italic font-semibold">
                          <Calendar className="w-3 h-3" />
                          <span>{date}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif-header text-lg font-bold text-[#221814] leading-snug">
                        {title}
                      </h3>

                      {/* Short Summary */}
                      {shortSummary && (
                        <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-3">
                          {shortSummary}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="p-6 pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          const slug = createSlug(title);
                          navigate(`/current-affairs/${slug}`);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Full Analysis →</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading && (
            /* EMPTY STATE FALLBACK */
            <div className="card-parchment-3d p-8 text-center max-w-xl mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
              <BookOpen className="w-10 h-10 text-[#8C3A27] mx-auto opacity-80" />
              <h4 className="font-serif-header text-lg font-bold text-[#221814]">
                Today's Dispatches Updating
              </h4>
              <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-bold leading-relaxed">
                Daily current affairs cards are updated every morning from our Content CMS. Click below to explore the complete current affairs portal.
              </p>
              <div className="pt-2">
                <a
                  href={CURRENT_AFFAIRS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-terracotta-pill text-xs py-2.5 px-6 inline-flex items-center gap-2 font-serif font-bold"
                >
                  <span>Open Full Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* COMPACT BOTTOM SECTION: CURRENT AFFAIRS DESK */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-t border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto">
          <div className="card-parchment-3d p-6 sm:p-8 border border-[#D5C3B0] bg-[#FFFDF8] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left shadow-sm hover:border-[#8C3A27] transition-all">
            
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-0.5 rounded-md border border-[#8C3A27]/20">
                  OFFICIAL PORTAL
                </span>
                <Sparkles className="w-4 h-4 text-[#8C3A27]" />
              </div>

              <h3 className="font-serif-header text-lg sm:text-xl font-extrabold text-[#221814]">
                Current Affairs Desk
              </h3>

              <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                Explore complete archived daily dispatches, subject digests, and editorial briefings on our main portal.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href={CURRENT_AFFAIRS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-terracotta-pill text-xs py-3 px-6 font-serif font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer shadow-xs"
              >
                <span>Open Archives Desk ↗</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}