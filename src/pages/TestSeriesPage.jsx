import React, { useState, useMemo, useEffect } from 'react';
import { SectionDivider, CityscapeArtwork } from '../components/Artworks';
import { 
  Play, 
  Eye, 
  X, 
  Clock, 
  FileText, 
  Search, 
  Award, 
  CheckCircle, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import freeTestsFolders from '../data/free_tests_folders.json';
import { useCMSData } from '../hooks/useCMSData';
import { getDirectImageUrl } from './CurrentAffairsReader';

const ITEMS_PER_PAGE = 18;

export default function TestSeriesPage({ navigate }) {
  const { data: cmsData } = useCMSData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Group CMS testSeries entries into unified folders by Folder Name / Batch Title
  const cmsFolders = useMemo(() => {
    if (!cmsData?.testSeries || !Array.isArray(cmsData.testSeries)) return [];

    const folderMap = new Map();

    cmsData.testSeries.forEach((item, idx) => {
      const rawTitle = item.Title || item.title || item.Name || item.name || `CMS Test Series ${idx + 1}`;
      const explicitFolder = item.Folder_Name || item.folder_name || item.Batch_Name || item.batch_name;
      
      // Intelligent base series title extractor (e.g. "Ekadasa Sadhana Deeksha: 10 Days..." & "Ekadasa Sadhana Deeksha: 110 Days..." -> "Ekadasa Sadhana Deeksha")
      let seriesTitle = explicitFolder || rawTitle;
      if (!explicitFolder && rawTitle.includes(':')) {
        const prefix = rawTitle.split(':')[0].trim();
        if (prefix.length >= 5) {
          seriesTitle = prefix;
        }
      }

      const groupKey = seriesTitle.trim().toLowerCase();

      const category = (item.Category || item.category || item.Badge || item.badge || 'FLAGSHIP EVALUATION').toUpperCase();
      const description = item.Description || item.description || item.Key_Features || item.key_features || 'Official evaluation test series synchronized live from Google Sheet CMS.';
      const testCountStr = item.Total_Tests || item.total_tests || item.TotalTests || '1';
      const testCountNum = parseInt(testCountStr) || 1;
      const rawPoster = item.Poster_Image || item.poster_image || item.Poster || item.poster || item.Image || item.image;
      const posterImage = getDirectImageUrl(rawPoster);
      const portalLink = item.Portal_Link || item.portal_link || item.Link || item.link || item.URL || item.url || '#';
      const keyFeaturesStr = item.Key_Features || item.key_features || item.Features || item.features || '';
      const keyFeatures = keyFeaturesStr ? keyFeaturesStr.split('|').map(f => f.trim()).filter(Boolean) : [];
      const badge = item.Badge || item.badge || '🔥 Live Batch';
      const latestDate = item.Date || item.date || '26-08-2026';

      const testObj = {
        id: `cms-test-${idx}`,
        title: rawTitle,
        dateLabel: latestDate,
        series: seriesTitle,
        category: category,
        status: 'Live',
        testUrl: portalLink,
        webUrl: portalLink,
        isFree: true,
        description: description,
        posterImage: posterImage,
        keyFeatures: keyFeatures
      };

      if (folderMap.has(groupKey)) {
        // Folder already exists: Group into existing folder!
        const existing = folderMap.get(groupKey);
        existing.tests.push(testObj);
        existing.testCount += testCountNum;
        existing.testCountLabel = `${existing.tests.length} Tests`;
        if (posterImage && !existing.posterImage) existing.posterImage = posterImage;
        if (keyFeatures.length > 0 && existing.keyFeatures.length === 0) existing.keyFeatures = keyFeatures;
        if (portalLink !== '#' && existing.portalLink === '#') existing.portalLink = portalLink;
      } else {
        // Create new folder entry
        folderMap.set(groupKey, {
          isCMS: true,
          folderId: `cms-folder-${groupKey.replace(/\s+/g, '-')}`,
          folderName: seriesTitle,
          category: category,
          testCount: testCountNum,
          testCountLabel: testCountStr.includes('Test') ? testCountStr : `${testCountStr} Tests`,
          latestDate: latestDate,
          description: description,
          posterImage: posterImage,
          portalLink: portalLink,
          keyFeatures: keyFeatures,
          badge: badge,
          tests: [testObj]
        });
      }
    });

    return Array.from(folderMap.values());
  }, [cmsData?.testSeries]);

  // Combine CMS folders with static free test folders (CMS items listed first)
  const allFolders = useMemo(() => {
    return [...cmsFolders, ...freeTestsFolders];
  }, [cmsFolders]);

  const categories = useMemo(() => {
    const baseCats = [
      { id: 'ALL', label: 'All Series & Folders' },
      { id: 'FLAGSHIP EVALUATION', label: 'Flagship Evaluation' },
      { id: 'CURRENT AFFAIRS & VEEKSHANAM', label: 'Veekshanam & Current Affairs' },
      { id: 'GENERAL STUDIES & QUIZ', label: 'General Studies & Quizzes' },
      { id: 'CSAT MASTERY', label: 'CSAT & Aptitude' },
      { id: 'SPECIAL & MAGAZINE', label: 'Magazine & Special Editions' }
    ];

    const existingIds = new Set(baseCats.map(c => c.id));
    cmsFolders.forEach(f => {
      if (f.category && !existingIds.has(f.category)) {
        existingIds.add(f.category);
        baseCats.push({ id: f.category, label: f.category });
      }
    });

    return baseCats;
  }, [cmsFolders]);

  // Filter folders based on category & search query
  const filteredFolders = useMemo(() => {
    return allFolders.filter(folder => {
      const matchesCategory = selectedCategory === 'ALL' || folder.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        folder.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (folder.tests && folder.tests.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [allFolders, selectedCategory, searchQuery]);

  // If inside a folder, filter tests within that folder
  const folderTests = useMemo(() => {
    if (!selectedFolder) return [];
    return selectedFolder.tests.filter(test => {
      return searchQuery === '' || 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.dateLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [selectedFolder, searchQuery]);

  // Reset pagination when folder, category, or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolder, selectedCategory, searchQuery]);

  // Calculate total pages for current view
  const currentItemsCount = selectedFolder ? folderTests.length : filteredFolders.length;
  const totalPages = Math.max(1, Math.ceil(currentItemsCount / ITEMS_PER_PAGE));

  // Current page items
  const paginatedFolderTests = useMemo(() => {
    if (!selectedFolder) return [];
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return folderTests.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [selectedFolder, folderTests, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const topElem = document.getElementById('test-catalog-top');
      if (topElem) {
        topElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-0 relative">
      
      {/* 1. SINGLE UNIFIED HEADER SECTION */}
      <section className="section-mottled-parchment py-12 md:py-16 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221814]">
            Test Series &amp; Evaluation Desk
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-2xl mx-auto">
            “Practice. Reflect. Improve.”
          </p>
        </div>
      </section>

      {/* 2. SEARCH & NAVIGATION HEADER BAR — SINGLE UNIFIED ROW */}
      <section className="section-clean-parchment py-3 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30 sticky top-[73px] z-30 bg-[#FBF7F0]/95 backdrop-blur-md shadow-xs" id="test-catalog-top">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
          
          {/* Left Action / Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            {selectedFolder ? (
              <button
                onClick={() => { setSelectedFolder(null); setSearchQuery(''); }}
                className="btn-terracotta-outline-pill text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Folders</span>
              </button>
            ) : (
              <div className="text-xs font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/5 px-3 py-1.5 rounded-lg border border-[#8C3A27]/20 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#8C3A27]" />
                <span>{filteredFolders.length} Folders</span>
              </div>
            )}
          </div>

          {/* Category Filter Pills (Only visible when viewing all folders) — Interactive Horizontal Scroll */}
          {!selectedFolder && (
            <div className="relative flex items-center flex-1 min-w-0 mx-1 sm:mx-2">
              {/* Scroll Left Button */}
              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById('category-pills-scroll');
                  if (elem) elem.scrollBy({ left: -220, behavior: 'smooth' });
                }}
                className="p-1 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27] text-[#8C3A27] hover:text-white transition-all shrink-0 mr-1 flex items-center justify-center cursor-pointer border border-[#8C3A27]/20 shadow-xs"
                title="Scroll Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Horizontal Scroll Track */}
              <div 
                id="category-pills-scroll"
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 flex-1 min-w-0 scroll-smooth scrollbar-thin scrollbar-thumb-[#8C3A27]/30 scrollbar-track-transparent"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-serif font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#8C3A27] text-white shadow-sm'
                        : 'bg-[#FAF6EE] text-[#3D3028] border border-[#D5C3B0] hover:border-[#8C3A27] hover:bg-[#F4ECE1]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Scroll Right Button */}
              <button
                type="button"
                onClick={() => {
                  const elem = document.getElementById('category-pills-scroll');
                  if (elem) elem.scrollBy({ left: 220, behavior: 'smooth' });
                }}
                className="p-1 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27] text-[#8C3A27] hover:text-white transition-all shrink-0 ml-1 flex items-center justify-center cursor-pointer border border-[#8C3A27]/20 shadow-xs"
                title="Scroll Right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search Input — Right Aligned Compact Width */}
          <div className="relative w-36 sm:w-48 shrink-0 ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6B5D]" />
            <input
              type="text"
              placeholder={selectedFolder ? `Search tests...` : "Search tests..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 sm:py-2 bg-[#FAF6EE] border border-[#D5C3B0] rounded-xl text-xs text-[#221814] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#8C3A27] focus:ring-1 focus:ring-[#8C3A27] transition-all font-medium"
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

        </div>
      </section>

      {/* 3. MAIN CATALOG CONTENT */}
      <section className="section-clean-parchment py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* VIEW 1: MAIN TEST FOLDERS GRID (UNIFORM FOLDER CARD DESIGN) */}
          {!selectedFolder ? (
            filteredFolders.length === 0 ? (
              <div className="text-center py-16 card-parchment-3d max-w-lg mx-auto space-y-4">
                <Folder className="w-12 h-12 text-[#8C3A27] mx-auto opacity-50" />
                <h3 className="font-serif-header text-xl font-bold text-[#221814]">No Series Folders Found</h3>
                <p className="text-xs text-[#3D3028]">Try resetting your search query or selecting a different category filter.</p>
                <button
                  onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                  className="btn-terracotta-pill text-xs py-2 px-6"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => (
                  <div 
                    key={folder.folderId}
                    className="card-parchment-3d p-6 flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 border border-[#D5C3B0]/70 text-left relative overflow-hidden group bg-[#FFFDF8] rounded-2xl"
                  >
                    <div className="space-y-4">
                      
                      {/* Top Header Accent Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                          {folder.category}
                        </span>
                        <span className="text-xs font-serif font-extrabold text-[#8C3A27] bg-[#FAF6EE] border border-[#D5C3B0] px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{folder.tests ? `${folder.tests.length} Tests` : folder.testCountLabel || `${folder.testCount} Tests`}</span>
                        </span>
                      </div>

                      {/* Folder Name & Icon */}
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-[#8C3A27]/10 text-[#8C3A27] group-hover:bg-[#8C3A27] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                          <Folder className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-serif-header text-2xl font-extrabold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors">
                            {folder.folderName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7A6B5D] font-medium pt-1">
                            <Calendar className="w-3 h-3 text-[#8C3A27]" />
                            <span>Date: <strong>{folder.latestDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#3D3028] font-sans font-medium line-clamp-3 leading-relaxed">
                        {folder.description}
                      </p>

                    </div>

                    {/* Open Folder Action Button (Uniform Single CTA) */}
                    <div className="pt-3 border-t border-[#D5C3B0]/40">
                      <button
                        onClick={() => { setSelectedFolder(folder); setSearchQuery(''); }}
                        className="w-full btn-terracotta-pill text-xs py-3 justify-center font-bold flex items-center gap-2 group-hover:shadow-md cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Open Series Folder ({folder.tests ? folder.tests.length : folder.testCount} Tests)</span>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )
          ) : (
            
            /* VIEW 2: INSIDE SPECIFIC FOLDER DRILL-DOWN */
            <div className="space-y-8">
              
              {/* Folder Info Header Card */}
              <div className="card-parchment-3d p-6 md:p-8 bg-[#FAF6EE] border-l-4 border-l-[#8C3A27] space-y-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-3 py-1 rounded-md">
                    {selectedFolder.category} SERIES
                  </span>
                  <span className="text-xs font-serif font-bold text-[#8C3A27]">
                    Total {selectedFolder.tests ? selectedFolder.tests.length : selectedFolder.testCount} Mock Tests Available
                  </span>
                </div>

                <h2 className="font-serif-header text-3xl font-extrabold text-[#221814]">
                  📁 {selectedFolder.folderName}
                </h2>

                <p className="text-xs sm:text-sm text-[#3D3028] font-medium max-w-3xl leading-relaxed">
                  {selectedFolder.description}
                </p>
              </div>

              {/* Sub-Folder Test Cards Grid */}
              {folderTests.length === 0 ? (
                <div className="text-center py-12 card-parchment-3d max-w-md mx-auto space-y-3">
                  <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-50" />
                  <h4 className="font-serif text-lg font-bold text-[#221814]">No tests match "{searchQuery}"</h4>
                  <button onClick={() => setSearchQuery('')} className="btn-terracotta-pill text-xs py-2 px-4 cursor-pointer">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFolderTests.map((test) => (
                    <div 
                      key={test.id} 
                      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-xs text-left"
                    >
                      {/* Optional Poster Image if test has one */}
                      {test.posterImage && (
                        <div className="relative w-full overflow-hidden bg-black/5">
                          <img 
                            src={test.posterImage} 
                            alt={test.title} 
                            className="w-full max-h-[180px] object-cover rounded-t-2xl"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div className="p-6 space-y-3 flex-1">
                        {/* Date Label */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-2 py-0.5 rounded-md border border-[#8C3A27]/20">
                            {test.dateLabel || 'Free Mock Test'}
                          </span>
                          <span className="text-[#7A6B5D] text-[11px] font-bold">
                            {test.isFree ? 'FREE ACCESS' : 'ENROLLED ONLY'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-serif-header text-lg font-bold text-[#221814] leading-snug">
                          {test.title}
                        </h4>

                        {/* Description */}
                        {test.description && (
                          <p className="text-xs text-[#3D3028] font-sans font-medium line-clamp-3 leading-relaxed">
                            {test.description}
                          </p>
                        )}

                        {/* Key Features Checkmark List if present */}
                        {test.keyFeatures && test.keyFeatures.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-[#D5C3B0]/40">
                            {test.keyFeatures.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-700 font-medium">
                                <span className="text-[#8C3A27] font-bold shrink-0">✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Take Test Actions */}
                      <div className="p-6 pt-0 border-t border-[#D5C3B0]/40 space-y-2 mt-auto">
                        <a
                          href={test.webUrl || test.testUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-terracotta-pill text-xs py-2.5 justify-center font-bold flex items-center gap-1.5 shadow-xs cursor-pointer mt-3"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Attempt Test / Enroll Online ↗</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGINATION BAR FOR FOLDER TESTS */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6 select-none">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-[#FAF6EE] border border-[#D5C3B0] text-[#3D3028] hover:border-[#8C3A27] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#8C3A27] text-white shadow-xs'
                          : 'bg-[#FAF6EE] border border-[#D5C3B0] text-[#3D3028] hover:border-[#8C3A27]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-[#FAF6EE] border border-[#D5C3B0] text-[#3D3028] hover:border-[#8C3A27] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </section>

    </div>
  );
}