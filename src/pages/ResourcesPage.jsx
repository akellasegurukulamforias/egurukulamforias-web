import React, { useState, useMemo, useEffect } from 'react';
import { SectionDivider, CityscapeArtwork } from '../components/Artworks';
import { 
  ArrowRight, 
  ArrowLeft,
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  X, 
  Users,
  Clock,
  ExternalLink,
  Apple,
  PlayCircle,
  Loader2,
  Tag,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import coursesData from '../data/courses.json';
import { useCMSData } from '../hooks/useCMSData';
import { getCMSImageLink, formatCMSImageUrl, getSecondaryCMSImageUrl, isItemActive, isSyllabusResource } from '../services/cmsService';
import { createSlug, getDirectImageUrl, getSecondaryImageUrl } from './CurrentAffairsReader';
import { sortCurrentAffairsByDate, formatDisplayDate } from '../utils/dateUtils';
import PdfViewerModal from '../components/PdfViewerModal';

export default function ResourcesPage({ navigate, folder }) {
  const { data: cmsData, loading: cmsLoading } = useCMSData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Set document title dynamically based on folder context
  useEffect(() => {
    if (folder === 'upsc-syllabus') {
      document.title = 'UPSC Civil Services Syllabus Directory & Micro-Notes | e-Gurukulam for IAS';
    } else {
      document.title = 'Digital Learning & Study Resources | e-Gurukulam for IAS';
    }
  }, [folder]);

  // Available Category Filter Pills
  const categories = [
    { id: 'ALL', label: 'All Courses' },
    { id: 'VIDEO_COURSES', label: 'Video Courses & Programs', isScrollTarget: true },
    { id: 'UPSC CIVIL SERVICES', label: 'UPSC Civil Services' },
    { id: 'GROUPS & STATE', label: 'APPSC & TGPSC Groups' },
    { id: 'FOUNDATION', label: 'Foundation & Orientation' },
    { id: 'WORKSHOPS', label: 'Workshops & Strategy' },
    { id: 'OPTIONAL', label: 'Optional & History' },
    { id: 'SPECIALIST & PERSPECTIVE', label: 'Perspective & Books' }
  ];

  const handleCategoryClick = (cat) => {
    if (cat.id === 'VIDEO_COURSES' || cat.isScrollTarget) {
      const elem = document.getElementById('courses-catalog-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setSelectedCategory('ALL');
      return;
    }

    setSelectedCategory(cat.id);

    if (cat.id !== 'ALL') {
      const elem = document.getElementById('courses-catalog-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Filter courses based on active category & search query
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      const matchesCategory = selectedCategory === 'ALL' || selectedCategory === 'VIDEO_COURSES' || course.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Active Resources from Google Sheet CMS sorted latest first
  const activeResources = useMemo(() => {
    const list = Array.isArray(cmsData?.resources) ? cmsData.resources.filter(isItemActive) : [];
    return sortCurrentAffairsByDate(list);
  }, [cmsData?.resources]);

  // Dynamically partition resources into Syllabus and Non-Syllabus
  const { syllabusResources, nonSyllabusResources } = useMemo(() => {
    const syllabus = [];
    const others = [];
    activeResources.forEach(item => {
      if (isSyllabusResource(item)) {
        syllabus.push(item);
      } else {
        others.push(item);
      }
    });
    return { syllabusResources: syllabus, nonSyllabusResources: others };
  }, [activeResources]);

  // Filtered Non-Syllabus Resources for main feed
  const filteredNonSyllabusResources = useMemo(() => {
    if (!searchQuery.trim()) return nonSyllabusResources;
    const q = searchQuery.toLowerCase();
    return nonSyllabusResources.filter(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const cat = (item.Category || item.category || '').toLowerCase();
      const subcat = (item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '').toLowerCase();
      const desc = (item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '').toLowerCase();
      return title.includes(q) || cat.includes(q) || subcat.includes(q) || desc.includes(q);
    });
  }, [nonSyllabusResources, searchQuery]);

  // Determine whether the UPSC Syllabus Folder Card should be visible on the main feed
  const showSyllabusFolderInMain = useMemo(() => {
    if (syllabusResources.length === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if ('upsc syllabus'.includes(q) || 'syllabus'.includes(q)) return true;
    return syllabusResources.some(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const cat = (item.Category || item.category || '').toLowerCase();
      const subcat = (item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '').toLowerCase();
      return title.includes(q) || cat.includes(q) || subcat.includes(q);
    });
  }, [syllabusResources, searchQuery]);

  // Filtered Syllabus Resources for dedicated /resources/upsc-syllabus view
  const filteredSyllabusResources = useMemo(() => {
    if (!syllabusSearchQuery.trim()) return syllabusResources;
    const q = syllabusSearchQuery.toLowerCase();
    return syllabusResources.filter(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const cat = (item.Category || item.category || '').toLowerCase();
      const subcat = (item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '').toLowerCase();
      const desc = (item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '').toLowerCase();
      return title.includes(q) || cat.includes(q) || subcat.includes(q) || desc.includes(q);
    });
  }, [syllabusResources, syllabusSearchQuery]);

  const handleOpenResource = (item) => {
    const title = item.Title || item.title || '';
    const slug = item.slug || item.Slug || item.id || item.ID || createSlug(title);
    if (isSyllabusResource(item)) {
      navigate(`/resources/upsc-syllabus/${slug}`);
    } else {
      navigate(`/resources/${slug}`);
    }
  };

  // ==========================================================================
  // DEDICATED UPSC SYLLABUS FOLDER DRILL-DOWN VIEW (/resources/upsc-syllabus)
  // ==========================================================================
  if (folder === 'upsc-syllabus') {
    return (
      <div className="space-y-0 relative min-h-screen bg-[#FFFDF8]">
        {/* 1. TOP STICKY BREADCRUMB & BACK NAVIGATION */}
        <section className="sticky top-16 z-20 bg-[#FAF6EE]/95 backdrop-blur-md p-4 sm:p-5 border-b border-[#D5C3B0] shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Resources</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>UPSC SYLLABUS DIRECTORY</span>
              </span>
              <span className="font-serif text-[#7A6B5D] italic font-semibold hidden sm:inline">
                {syllabusResources.length} Syllabus Available
              </span>
            </div>
          </div>
        </section>

        {/* 2. FOLDER HERO HEADER */}
        <section className="section-mottled-parchment py-12 md:py-16 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/25 text-[#8C3A27] text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#8C3A27]" />
              <span>Curated Folder Hub &bull; {syllabusResources.length} Syllabus Available</span>
            </div>
            <h1 className="font-serif-header text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#221814] leading-tight">
              UPSC Civil Services Syllabus Directory
            </h1>
            <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-2xl mx-auto leading-relaxed">
              Comprehensive micro-syllabus breakdowns for UPSC Civil Services Prelims, Mains General Studies (GS I to IV), and Optional subjects with analytical micro-notes and PDF reference documents.
            </p>
          </div>
        </section>

        {/* 3. IN-FOLDER SEARCH & FILTER BAR */}
        <section className="py-3 px-4 sm:px-6 lg:px-8 bg-[#FBF7F0]/95 backdrop-blur-md border-b border-[#D5C3B0]/30 sticky top-[138px] z-10 shadow-2xs">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6B5D]" />
              <input
                type="text"
                placeholder="Search syllabus by subject (e.g. Sociology, Anthropology, Mains, Prelims, Pub Ad)..."
                value={syllabusSearchQuery}
                onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-[#FFFDF8] border border-[#D5C3B0] rounded-xl text-xs sm:text-sm text-[#221814] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#8C3A27] focus:ring-1 focus:ring-[#8C3A27] transition-all font-medium"
              />
              {syllabusSearchQuery && (
                <button
                  onClick={() => setSyllabusSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6B5D] hover:text-[#8C3A27]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-[#8C3A27] shrink-0 bg-[#8C3A27]/10 px-3 py-2 rounded-xl border border-[#8C3A27]/20 hidden sm:inline-block">
              {filteredSyllabusResources.length} {filteredSyllabusResources.length === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
        </section>

        {/* 4. SYLLABUS CARDS SUB-GRID */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] min-h-[50vh]">
          <div className="max-w-7xl mx-auto">
            {cmsLoading && (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
                <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                  Loading syllabus subjects from CMS...
                </p>
              </div>
            )}

            {!cmsLoading && filteredSyllabusResources.length === 0 ? (
              <div className="card-parchment-3d p-8 text-center max-w-md mx-auto space-y-4 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl shadow-sm">
                <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-70" />
                <h4 className="font-serif-header text-lg font-bold text-[#221814]">No Syllabus Found</h4>
                <p className="text-xs sm:text-sm text-[#5C4028]">
                  No syllabus subjects matched &ldquo;{syllabusSearchQuery}&rdquo;. Try clearing your search term or exploring all subjects.
                </p>
                <button
                  type="button"
                  onClick={() => setSyllabusSearchQuery('')}
                  className="btn-terracotta-pill text-xs py-2 px-5 font-serif font-bold"
                >
                  Reset Search
                </button>
              </div>
            ) : !cmsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSyllabusResources.map((item, idx) => {
                  const title = item.Title || item.title || 'Untitled Syllabus';
                  const date = formatDisplayDate(item.Date || item.date) || 'Current';
                  const category = item.Category || item.category || 'UPSC Syllabus';
                  const shortSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '';
                  const rawBanner = 
                    item.Banner_Image || item.banner_image ||
                    item.Banner || item.banner ||
                    item.Poster_Image || item.poster_image ||
                    item.Poster_Image_Link || item.poster_image_link ||
                    item.Image || item.image ||
                    item.Thumbnail || item.thumbnail;
                  const bannerImage = getDirectImageUrl(rawBanner);
                  const itemSlug = item.slug || item.Slug || item.id || item.ID || createSlug(title);

                  return (
                    <div
                      key={idx}
                      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer"
                      onClick={() => navigate(`/resources/upsc-syllabus/${itemSlug}`)}
                    >
                      {bannerImage ? (
                        <div className="w-full h-48 overflow-hidden bg-black/5 relative">
                          <img
                            src={bannerImage}
                            alt={title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const secondary = getSecondaryImageUrl(rawBanner);
                              if (secondary && e.target.src !== secondary) {
                                e.target.src = secondary;
                              } else {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-36 bg-gradient-to-br from-[#F4ECE1] to-[#EAE0D5] border-b border-[#D5C3B0]/60 p-5 flex flex-col justify-between relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <GraduationCap className="w-6 h-6 text-[#8C3A27] opacity-80" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2 py-0.5 rounded-md border border-[#8C3A27]/20">
                              UPSC SYLLABUS
                            </span>
                          </div>
                          <div className="font-serif-header text-base font-bold text-[#6C1D18] truncate">
                            {title}
                          </div>
                        </div>
                      )}

                      <div className="p-6 space-y-3 flex-1">
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

                        <h3 className="font-serif-header text-lg font-bold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors">
                          {title}
                        </h3>

                        {shortSummary && (
                          <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-3">
                            {shortSummary}
                          </p>
                        )}
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/resources/upsc-syllabus/${itemSlug}`);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer group/btn hover:bg-[#8C3A27] hover:text-white"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>VIEW SYLLABUS &rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5. BOTTOM EXPLORATION BANNER */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-t border-[#D5C3B0]/30">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="font-serif italic text-sm sm:text-base text-[#5C4028] font-semibold">
              Looking for PYQ breakdowns, analytical study articles, or comprehensive video lecture series?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/resources')}
                className="btn-terracotta-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer"
              >
                &larr; Return to All Study Resources
              </button>
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer"
              >
                Explore Video Courses &rarr;
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

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

      {/* 3. SEARCH & CATEGORY FILTER BAR FOR COURSES & RECORDED MODULES */}
      <section className="section-clean-parchment py-3 px-4 sm:px-6 lg:px-8 border-t border-b border-[#D5C3B0]/30 sticky top-[73px] z-30 bg-[#FBF7F0]/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
          
          {/* Search Input */}
          <div className="relative w-36 sm:w-44 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6B5D]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-2 bg-[#FAF6EE] border border-[#D5C3B0] rounded-xl text-xs text-[#221814] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#8C3A27] focus:ring-1 focus:ring-[#8C3A27] transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7A6B5D] hover:text-[#8C3A27]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills — Interactive Horizontal Scroll */}
          <div className="relative flex items-center flex-1 min-w-0 mx-1 sm:mx-2">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById('resources-category-pills-scroll');
                if (elem) elem.scrollBy({ left: -220, behavior: 'smooth' });
              }}
              className="p-1 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27] text-[#8C3A27] hover:text-white transition-all shrink-0 mr-1 flex items-center justify-center cursor-pointer border border-[#8C3A27]/20 shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Horizontal Scroll Track */}
            <div 
              id="resources-category-pills-scroll"
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1.5 flex-1 min-w-0 scroll-smooth scrollbar-thin scrollbar-thumb-[#8C3A27]/30 scrollbar-track-transparent"
            >
              {categories.map((cat) => {
                const isVideoCourses = cat.id === 'VIDEO_COURSES' || cat.isScrollTarget;
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-serif font-bold tracking-wide transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isVideoCourses
                        ? isActive
                          ? 'bg-[#8C3A27] text-white shadow-sm ring-2 ring-[#D4AF37]'
                          : 'bg-[#8C3A27]/10 text-[#8C3A27] border border-[#8C3A27]/40 hover:bg-[#8C3A27] hover:text-white'
                        : isActive
                          ? 'bg-[#8C3A27] text-white shadow-sm'
                          : 'bg-[#FAF6EE] text-[#3D3028] border border-[#D5C3B0] hover:border-[#8C3A27] hover:bg-[#F4ECE1]'
                    }`}
                  >
                    {isVideoCourses && <Video className="w-3.5 h-3.5 shrink-0" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => {
                const elem = document.getElementById('resources-category-pills-scroll');
                if (elem) elem.scrollBy({ left: 220, behavior: 'smooth' });
              }}
              className="p-1 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27] text-[#8C3A27] hover:text-white transition-all shrink-0 ml-1 flex items-center justify-center cursor-pointer border border-[#8C3A27]/20 shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. DYNAMIC GOOGLE SHEET CMS STUDY RESOURCES & ARTICLES SECTION */}
      <section id="downloads-vault-section" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-b border-[#D5C3B0]/40 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          


          {/* LOADING STATE */}
          {cmsLoading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
              <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                Fetching study resources from Content CMS...
              </p>
            </div>
          )}

          {/* CONTENT GRID */}
          {!cmsLoading && (showSyllabusFolderInMain || filteredNonSyllabusResources.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. DYNAMIC UPSC SYLLABUS FOLDER HUB CARD */}
              {showSyllabusFolderInMain && (
                <div 
                  className="card-parchment-3d rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#8C3A27]/30 hover:border-[#8C3A27] overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl group text-left cursor-pointer relative ring-1 ring-[#8C3A27]/10"
                  onClick={() => navigate('/resources/upsc-syllabus')}
                >
                  {/* Folder Tab / Visual Layer Header */}
                  <div className="w-full bg-gradient-to-r from-[#6C1D18] via-[#8C3A27] to-[#732415] p-5 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative stacked cards background effect */}
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none">
                      <Layers className="w-36 h-36 text-white" />
                    </div>

                    <div className="flex items-center justify-between z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                        <FolderOpen className="w-5 h-5 text-[#F3EBD9]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAF6EE] bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>CURATED HUB</span>
                      </span>
                    </div>

                    <div className="mt-4 z-10">
                      <h3 
                        className="font-serif-header text-xl sm:text-2xl font-bold !text-white leading-snug drop-shadow-xs"
                        style={{ color: '#FFFFFF' }}
                      >
                        UPSC Syllabus
                      </h3>
                    </div>
                  </div>

                  {/* Folder Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Total Count Badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                          <Layers className="w-3 h-3" />
                          <span>{syllabusResources.length} Syllabus Available</span>
                        </span>
                        <span className="text-[11px] font-serif italic text-[#7A6B5D] font-semibold">
                          Prelims &bull; Mains &bull; Optionals
                        </span>
                      </div>

                      {/* Folder Description */}
                      <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                        Comprehensive micro-syllabus breakdowns for UPSC Civil Services Prelims, Mains GS Papers, and Optional subjects.
                      </p>

                      {/* Dynamic Subject Preview Pills */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {syllabusResources.slice(0, 4).map((item, i) => {
                          const rawTitle = item.Title || item.title || 'Syllabus';
                          const cleanTitle = rawTitle
                            .replace(/upsc|civil\s+services|examination|cse|syllabus/gi, '')
                            .replace(/[()]/g, '')
                            .trim();
                          return (
                            <span 
                              key={i} 
                              className="text-[10px] font-mono font-bold bg-[#FAF6EE] text-[#5C4028] px-2 py-0.5 rounded-md border border-[#D5C3B0] truncate max-w-[130px]"
                              title={rawTitle}
                            >
                              {cleanTitle || rawTitle}
                            </span>
                          );
                        })}
                        {syllabusResources.length > 4 && (
                          <span className="text-[10px] font-mono font-bold bg-[#8C3A27]/10 text-[#8C3A27] px-2 py-0.5 rounded-md">
                            +{syllabusResources.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Folder Action CTA */}
                    <div className="pt-4 border-t border-[#D5C3B0]/40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/resources/upsc-syllabus');
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>EXPLORE SYLLABUS FOLDER &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. NON-SYLLABUS STUDY RESOURCES (PYQs, Notes, Strategy Guides) */}
              {filteredNonSyllabusResources.map((item, idx) => {
                const title = item.Title || item.title || 'Untitled Resource';
                const date = formatDisplayDate(item.Date || item.date) || 'Recent';
                const category = item.Category || item.category || 'Study Material';
                const shortSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '';
                const rawBanner = 
                  item.Banner_Image || item.banner_image ||
                  item.Banner || item.banner ||
                  item.Poster_Image || item.poster_image ||
                  item.Poster_Image_Link || item.poster_image_link ||
                  item.Image || item.image ||
                  item.Thumbnail || item.thumbnail;
                const bannerImage = getDirectImageUrl(rawBanner);

                return (
                  <div 
                    key={idx} 
                    className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer"
                    onClick={() => handleOpenResource(item)}
                  >
                    {/* Banner Image or Thematic Header */}
                    {bannerImage ? (
                      <div className="w-full h-48 overflow-hidden bg-black/5 relative">
                        <img 
                          src={bannerImage} 
                          alt={title} 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const secondary = getSecondaryImageUrl(rawBanner);
                            if (secondary && e.target.src !== secondary) {
                              e.target.src = secondary;
                            } else {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-[#F4ECE1] to-[#EAE0D5] border-b border-[#D5C3B0]/60 p-5 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <BookOpen className="w-6 h-6 text-[#8C3A27] opacity-80" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2 py-0.5 rounded-md border border-[#8C3A27]/20">
                            STUDY RESOURCE
                          </span>
                        </div>
                        <div className="font-serif-header text-base font-bold text-[#6C1D18] truncate">
                          {title}
                        </div>
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
                      <h3 className="font-serif-header text-lg font-bold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenResource(item);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer group/btn hover:bg-[#8C3A27] hover:text-white"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>READ RESOURCE &rarr;</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !cmsLoading && (
            /* EMPTY STATE FALLBACK */
            <div className="card-parchment-3d p-8 text-center max-w-xl mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
              <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-80" />
              <h4 className="font-serif-header text-lg font-bold text-[#221814]">
                {searchQuery ? 'No Resources Found' : 'Study Resources Updating'}
              </h4>
              <p className="text-xs sm:text-sm font-serif italic text-[#5C4028] font-bold leading-relaxed">
                {searchQuery
                  ? `No resources matched "${searchQuery}". Try a different keyword or reset filters.`
                  : 'Comprehensive study notes and articles are synchronized directly from our Content CMS. Check back regularly or explore our courses below.'}
              </p>
            </div>
          )}

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 5. COURSES CATALOG GRID */}
      <section id="courses-catalog-section" className="section-clean-parchment py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section Header with Title & Tagline */}
          <div className="text-center space-y-2 max-w-3xl mx-auto pb-6 border-b border-[#D5C3B0]/60">
            <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814]">
              Video Courses &amp; Learning Programs
            </h2>
            <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium">
              Comprehensive recorded video lectures, subject masterclasses, and structured preparation modules
            </p>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 card-parchment-3d max-w-lg mx-auto space-y-4">
              <BookOpen className="w-12 h-12 text-[#8C3A27] mx-auto opacity-50" />
              <h3 className="font-serif-header text-xl font-bold text-[#221814]">No Courses Found</h3>
              <p className="text-xs text-[#3D3028]">Try clearing your search term or selecting a different category filter.</p>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="btn-terracotta-pill text-xs py-2 px-6"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="card-parchment-3d overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 border border-[#D5C3B0]/60"
                >
                  <div>
                    {/* Course Banner Artwork Image */}
                    <div className="relative aspect-16/9 overflow-hidden bg-[#E8DEC9] border-b border-[#D5C3B0]/40">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://ali-cdn-cp-assets-public.classplus.co/daman-bot/XmceKP96T9Hg.png';
                        }}
                      />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-[#221814]/90 backdrop-blur-md text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30 text-xs font-serif font-extrabold shadow-lg">
                        ₹{course.price.toLocaleString('en-IN')}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3 bg-[#8C3A27]/90 text-white px-2.5 py-0.5 rounded-md text-[10px] font-serif font-bold uppercase tracking-wider">
                        {course.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      
                      {/* Duration & Subscribers Pills */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#7A6B5D]">
                        <span className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]/40">
                          <Clock className="w-3 h-3 text-[#8C3A27]" />
                          <span>{course.duration}</span>
                        </span>
                        {course.subscribers > 0 && (
                          <span className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]/40">
                            <Users className="w-3 h-3 text-[#8C3A27]" />
                            <span>{course.subscribers} Aspirants</span>
                          </span>
                        )}
                      </div>

                      {/* Course Title */}
                      <h3 className="font-serif-header text-xl font-bold text-[#221814] line-clamp-2 leading-snug group-hover:text-[#8C3A27] transition-colors">
                        {course.title}
                      </h3>

                      {/* Brief Description */}
                      <p className="text-xs text-[#3D3028] leading-relaxed font-sans font-medium line-clamp-3">
                        {course.description}
                      </p>

                      {/* Learning Materials Breakdown */}
                      <div className="pt-2 flex items-center gap-4 text-[11px] font-semibold text-[#5A4D41]">
                        {course.materials.videos > 0 && (
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-[#8C3A27]" />
                            <span>{course.materials.videos} Videos</span>
                          </span>
                        )}
                        {course.materials.files > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-[#8C3A27]" />
                            <span>{course.materials.files} Notes</span>
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 pt-0 space-y-2.5">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="w-full btn-terracotta-outline-pill text-xs py-2.5 justify-center font-bold cursor-pointer"
                    >
                      <span>Read Full Course Details</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/contact')}
                      className="w-full btn-terracotta-pill text-xs py-2.5 justify-center font-bold cursor-pointer"
                    >
                      <span>Enroll Now (₹{course.price})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 6. FULL COURSE DETAILS IN-SITE MODAL DRAWER */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#FBF7F0] rounded-2xl shadow-2xl border border-[#D5C3B0] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-[#F4ECE1] border-b border-[#D5C3B0]/70 p-6 sm:p-8 flex-shrink-0">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-10">
                <span className="text-[11px] font-serif uppercase tracking-widest text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md inline-block">
                  {selectedCourse.category}
                </span>
                
                <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814] leading-tight" style={{ color: '#221814' }}>
                  {selectedCourse.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-sans text-[#3D3028] pt-1 font-semibold">
                  <span className="bg-[#8C3A27] text-white px-2.5 py-0.5 rounded-md font-bold">
                    Price: ₹{selectedCourse.price.toLocaleString('en-IN')}
                  </span>
                  <span>•</span>
                  <span>Validity: {selectedCourse.duration}</span>
                  {selectedCourse.subscribers > 0 && (
                    <>
                      <span>•</span>
                      <span>{selectedCourse.subscribers} Enrolled</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 font-sans text-[#221814]">
              
              {/* Course Banner Artwork Image */}
              <div className="rounded-xl overflow-hidden border border-[#D5C3B0]/60 bg-[#FAF6EE]">
                <img 
                  src={selectedCourse.imageUrl} 
                  alt={selectedCourse.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full max-h-72 object-contain bg-[#221814]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://ali-cdn-cp-assets-public.classplus.co/daman-bot/XmceKP96T9Hg.png';
                  }}
                />
              </div>

              {/* Course Learning Materials Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-[#F4ECE1] rounded-xl border border-[#D5C3B0]/60">
                <div>
                  <Video className="w-5 h-5 text-[#8C3A27] mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">{selectedCourse.materials.videos}</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Video Lectures</div>
                </div>
                <div>
                  <FileText className="w-5 h-5 text-[#8C3A27] mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">{selectedCourse.materials.files}</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Study Files / Notes</div>
                </div>
                <div>
                  <Clock className="w-5 h-5 text-[#8C3A27] mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">{selectedCourse.duration.replace('Valid for ', '')}</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Course Access</div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-3">
                <h4 className="font-serif-header text-lg font-bold text-[#8C3A27] border-b border-[#D5C3B0]/40 pb-2">
                  Complete Course Syllabus &amp; Overview
                </h4>
                <div className="text-xs sm:text-sm text-[#3D3028] leading-relaxed whitespace-pre-line font-medium bg-[#FAF6EE] p-5 rounded-xl border border-[#D5C3B0]/40">
                  {selectedCourse.description}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#F4ECE1] border-t border-[#D5C3B0]/60 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div>
                <div className="text-xs text-[#7A6B5D] font-medium">Official Enrollment Fee</div>
                <div className="text-2xl font-extrabold font-serif text-[#221814]">₹{selectedCourse.price.toLocaleString('en-IN')}</div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="btn-terracotta-outline-pill text-xs py-3 px-5 font-bold w-1/2 sm:w-auto justify-center cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate('/contact');
                  }}
                  className="btn-terracotta-pill text-xs py-3 px-6 font-bold w-1/2 sm:w-auto justify-center cursor-pointer"
                >
                  <span>Enroll Now (₹{selectedCourse.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECURE IN-PAGE PDF READER MODAL */}
      <PdfViewerModal 
        isOpen={!!selectedPdf} 
        onClose={() => setSelectedPdf(null)} 
        pdfUrl={selectedPdf?.url} 
        pdfTitle={selectedPdf?.title} 
      />

    </div>
  );
}