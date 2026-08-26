// src/components/TestSeriesSection.jsx
// Test Series Section & Cards UI powered by Google Sheet Content CMS
import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Award,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useCMSData } from '../hooks/useCMSData';
import { getDirectImageUrl } from '../pages/CurrentAffairsReader';

export default function TestSeriesSection() {
  const { data, loading } = useCMSData();

  const testSeriesList = data?.testSeries || [];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-b border-[#D5C3B0]/40">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-3.5 py-1 rounded-full border border-[#8C3A27]/20 inline-block">
            OFFICIAL TEST SERIES &amp; EVALUATION
          </span>
          <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814]">
            Flagship UPSC Test Series &amp; Mentorship
          </h2>
          <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium">
            Rigorous multi-tier evaluation, model answers, and individual mentorship with Akella Sir.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
            <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
              Fetching active test series programs from Content CMS...
            </p>
          </div>
        )}

        {/* CMS TEST SERIES GRID */}
        {!loading && testSeriesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {testSeriesList.map((test, idx) => {
              const title = test.Title || test.title || test.Name || test.name || 'UPSC Test Series Program';
              const rawPoster = test.Poster_Image || test.poster_image || test.Poster || test.poster || test.Image || test.image;
              const posterImage = getDirectImageUrl(rawPoster);
              const badge = test.Badge || test.badge || test.Tag || test.tag || test.Category || test.category || '🔥 Live Batch';
              const totalTests = test.Total_Tests || test.total_tests || test.TotalTests || test.testCount;
              const keyFeaturesStr = test.Key_Features || test.key_features || test.Features || test.features || '';
              const portalLink = test.Portal_Link || test.portal_link || test.Link || test.link || test.URL || test.url || '#';

              // Split Key_Features string by '|'
              const keyFeatures = keyFeaturesStr
                ? keyFeaturesStr.split('|').map(f => f.trim()).filter(Boolean)
                : [];

              return (
                <div 
                  key={idx}
                  className="bg-white border border-[#EAE0D5] rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group relative"
                >
                  {/* Top Poster Image Container with Floating Badge */}
                  <div>
                    {posterImage ? (
                      <div className="relative w-full overflow-hidden bg-black/5">
                        <img 
                          src={posterImage} 
                          alt={title} 
                          className="w-full max-h-[220px] object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                        {/* Floating Badge in Top Corner */}
                        {badge && (
                          <div className="absolute top-3 right-3 bg-[#6C1D18] text-white font-bold text-[11px] font-mono px-3 py-1 rounded-full shadow-md border border-amber-300/30">
                            {badge}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Fallback Banner Header if no image */
                      <div className="p-4 bg-[#6C1D18] text-white flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                          {badge || 'UPSC TEST SERIES'}
                        </span>
                        <Award className="w-5 h-5 text-amber-300" />
                      </div>
                    )}

                    {/* Content Body */}
                    <div className="p-6 space-y-4">
                      
                      {/* Title */}
                      <h3 className="text-[#6C1D18] font-bold text-lg font-serif-header leading-snug">
                        {title}
                      </h3>

                      {/* Total Tests Highlight Badge */}
                      {totalTests && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 bg-[#FAF5EE] text-[#8B261E] font-semibold text-xs px-2.5 py-1 rounded-md border border-[#EAE0D5]">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{totalTests}</span>
                          </span>
                        </div>
                      )}

                      {/* Key Features Bullet List (Split by '|') */}
                      {keyFeatures.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-[#EAE0D5]/60">
                          {keyFeatures.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-700 font-sans font-medium leading-relaxed">
                              <span className="text-[#6C1D18] font-bold shrink-0 mt-0.5">✓</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="p-6 pt-0">
                    <a
                      href={portalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#6C1D18] hover:bg-[#521612] text-white font-semibold py-3 px-5 rounded-xl transition shadow-md group mt-4 text-sm"
                    >
                      <span>Take Test / Enroll Now</span>
                      <span className="group-hover:translate-x-1 transition">↗</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        ) : !loading && (
          /* FALLBACK IF CMS TEST SERIES LIST IS EMPTY */
          <div className="bg-white border border-[#EAE0D5] rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <BookOpen className="w-10 h-10 text-[#6C1D18] mx-auto opacity-80" />
            <h4 className="font-serif-header text-xl font-bold text-[#6C1D18]">
              Test Series &amp; Evaluation Desk
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 font-sans font-medium leading-relaxed">
              Our official UPSC Mains &amp; Prelims test series batches are synchronized live from our Content CMS.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
