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
  ArrowLeft
} from 'lucide-react';
import freeTestsFolders from '../data/free_tests_folders.json';
import freeTestsFlat from '../data/free_tests.json';

const ITEMS_PER_PAGE = 18;

export default function TestSeriesPage({ navigate }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null); // null = Folder view, object = Inside folder
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: 'ALL', label: 'All Series & Folders' },
    { id: 'CURRENT AFFAIRS & VEEKSHANAM', label: 'Veekshanam & Current Affairs' },
    { id: 'GENERAL STUDIES & QUIZ', label: 'General Studies & Quizzes' },
    { id: 'CSAT MASTERY', label: 'CSAT & Aptitude' },
    { id: 'SPECIAL & MAGAZINE', label: 'Magazine & Special Editions' }
  ];

  // Filter folders based on category & search query
  const filteredFolders = useMemo(() => {
    return freeTestsFolders.filter(folder => {
      const matchesCategory = selectedCategory === 'ALL' || folder.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        folder.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.tests.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
      
      {/* 1. HEADER SECTION */}
      <section className="section-mottled-parchment py-12 md:py-16 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221814]">
            Free Mock Tests &amp; Quiz Series
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
                className="btn-terracotta-outline-pill text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
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

          {/* Category Filter Pills (Only visible when viewing all folders) — Single Row Flex-1 */}
          {!selectedFolder && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 flex-1 min-w-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-serif font-bold tracking-wide transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#8C3A27] text-white shadow-sm'
                      : 'bg-[#FAF6EE] text-[#3D3028] border border-[#D5C3B0] hover:border-[#8C3A27] hover:bg-[#F4ECE1]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
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
          
          {/* VIEW 1: MAIN TEST FOLDERS GRID */}
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
                    className="card-parchment-3d p-6 flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 border border-[#D5C3B0]/70 text-left relative overflow-hidden group"
                  >
                    {/* Top Folder Banner / Accent */}
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md">
                          {folder.category}
                        </span>
                        <span className="text-xs font-serif font-extrabold text-[#8C3A27] bg-[#FAF6EE] border border-[#D5C3B0] px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{folder.testCount} Tests</span>
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
                            <span>Latest Date: <strong>{folder.latestDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#3D3028] font-sans font-medium line-clamp-3 leading-relaxed">
                        {folder.description}
                      </p>

                    </div>

                    {/* Open Folder Action */}
                    <div className="pt-3 border-t border-[#D5C3B0]/40">
                      <button
                        onClick={() => { setSelectedFolder(folder); setSearchQuery(''); }}
                        className="w-full btn-terracotta-pill text-xs py-3 justify-center font-bold flex items-center gap-2 group-hover:shadow-md"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Open Series Folder ({folder.testCount} Tests)</span>
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
                    Total {selectedFolder.testCount} Mock Tests Available
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
                  <button onClick={() => setSearchQuery('')} className="btn-terracotta-pill text-xs py-2 px-4">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedFolderTests.map((test) => (
                    <div 
                      key={test.id} 
                      className="card-parchment-3d p-6 flex flex-col justify-between space-y-5 hover:shadow-xl transition-all duration-300 border border-[#D5C3B0]/60 text-left"
                    >
                      <div className="space-y-3">
                        
                        {/* Date / Number Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-serif font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8C3A27]" />
                            <span>{test.dateLabel}</span>
                          </span>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            FREE MOCK
                          </span>
                        </div>

                        {/* Test Title */}
                        <h3 className="font-serif-header text-xl font-bold text-[#221814] leading-snug line-clamp-2">
                          {test.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-[#3D3028] font-sans font-medium line-clamp-3 leading-relaxed">
                          {test.description}
                        </p>

                        {/* Metadata Pills */}
                        <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-medium text-[#7A6B5D]">
                          <span className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]/40">
                            <Clock className="w-3 h-3 text-[#8C3A27]" />
                            <span>Exam Standard</span>
                          </span>
                          <span className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#D5C3B0]/40">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Instant Key</span>
                          </span>
                        </div>

                      </div>

                      {/* Actions Footer */}
                      <div className="space-y-2 pt-2 border-t border-[#D5C3B0]/40">
                        <button
                          onClick={() => setSelectedTest(test)}
                          className="w-full btn-terracotta-outline-pill text-xs py-2.5 justify-center font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Test Details</span>
                        </button>
                        
                        <a
                          href={test.testUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-terracotta-pill text-xs py-2.5 justify-center font-bold"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Attempt Test Now</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAGINATION CONTROLS INSIDE FOLDER */}
              {totalPages > 1 && (
                <div className="pt-8 border-t border-[#D5C3B0]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  <div className="text-xs font-serif font-semibold text-[#3D3028]">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, folderTests.length)} of {folderTests.length} Tests in {selectedFolder.folderName}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-serif font-bold border border-[#D5C3B0] bg-[#FAF6EE] text-[#221814] hover:bg-[#F4ECE1] hover:border-[#8C3A27] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-serif font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-[#8C3A27] text-white shadow-md border border-[#8C3A27]'
                              : 'bg-[#FAF6EE] text-[#221814] border border-[#D5C3B0] hover:bg-[#F4ECE1] hover:border-[#8C3A27]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl text-xs font-serif font-bold border border-[#D5C3B0] bg-[#FAF6EE] text-[#221814] hover:bg-[#F4ECE1] hover:border-[#8C3A27] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </section>

      {/* GLOWING GHEE LAMP / FLAME DIVIDER */}
      <SectionDivider />

      {/* 4. BOTTOM SECTION — PUBLIC GOVERNANCE & MOCK EXAMS */}
      <section className="section-mottled-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Title & Copy */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27]">
                EXAM DISCIPLINE &amp; RIGOR
              </span>

              <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814]">
                Rigorous Evaluation &amp; Instant Answer Key
              </h2>

              <p className="font-serif italic text-base text-[#8C3A27] font-bold">
                “Testing your knowledge under exam pressure is the bridge between preparation and selection.”
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-[#3D3028] leading-relaxed font-sans font-medium">
                <p>
                  Every test in the Test Series is mapped directly against UPSC &amp; State PSC examination standards. Gain instant clarity on your accuracy, time per question, and conceptual weaknesses.
                </p>
                <p>
                  For personalized evaluation, essay correction, or one-on-one mentorship with Akella Raghavendra sir.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-terracotta-pill text-xs py-3 px-6"
                >
                  <span>Connect for Mentorship / Evaluation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Image Card */}
            <div className="lg:col-span-6 flex justify-center">
              <CityscapeArtwork />
            </div>

          </div>
        </div>
      </section>

      {/* 5. FULL TEST DETAILS IN-SITE MODAL DRAWER */}
      {selectedTest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setSelectedTest(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#FBF7F0] rounded-2xl shadow-2xl border border-[#D5C3B0] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header — High Contrast Parchment Header */}
            <div className="relative bg-[#F4ECE1] border-b border-[#D5C3B0]/70 p-6 sm:p-8 flex-shrink-0">
              <button 
                onClick={() => setSelectedTest(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-10">
                <span className="text-[11px] font-serif uppercase tracking-widest text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md inline-block">
                  {selectedTest.series}
                </span>
                
                <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814] leading-tight" style={{ color: '#221814' }}>
                  {selectedTest.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-sans text-[#3D3028] pt-1 font-semibold">
                  <span className="bg-emerald-700 text-white px-2.5 py-0.5 rounded-md font-bold">
                    FREE OFFICIAL MOCK TEST
                  </span>
                  <span>•</span>
                  <span>Date: {selectedTest.dateLabel}</span>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 font-sans text-[#221814]">
              
              {/* Stats Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center p-4 bg-[#F4ECE1] rounded-xl border border-[#D5C3B0]/60">
                <div>
                  <Award className="w-5 h-5 text-[#8C3A27] mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">100% Free</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Access Type</div>
                </div>
                <div>
                  <Clock className="w-5 h-5 text-[#8C3A27] mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">Timer Mode</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Real Exam Environment</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-base font-extrabold font-serif text-[#221814]">Instant</div>
                  <div className="text-[11px] text-[#7A6B5D] font-medium">Score &amp; Solutions</div>
                </div>
              </div>

              {/* Full Test Overview */}
              <div className="space-y-3">
                <h4 className="font-serif-header text-lg font-bold text-[#8C3A27] border-b border-[#D5C3B0]/40 pb-2">
                  Test Overview &amp; Instructions
                </h4>
                <div className="text-xs sm:text-sm text-[#3D3028] leading-relaxed whitespace-pre-line font-medium bg-[#FAF6EE] p-5 rounded-xl border border-[#D5C3B0]/40">
                  {selectedTest.description}
                  {"\n\n"}
                  <strong>Instructions for Aspirants:</strong>
                  {"\n"}
                  1. Attempt this test in a distraction-free 2-hour environment.
                  {"\n"}
                  2. Review detailed model solutions immediately after submission.
                  {"\n"}
                  3. Analyze your negative marks and time per question to optimize speed.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#F4ECE1] border-t border-[#D5C3B0]/60 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <div>
                <div className="text-xs text-[#7A6B5D] font-medium">Test Series Provider</div>
                <div className="text-sm font-extrabold font-serif text-[#221814]">Akella Raghavendra's e-Gurukulam</div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="btn-terracotta-outline-pill text-xs py-3 px-5 font-bold w-1/2 sm:w-auto justify-center"
                >
                  Close
                </button>
                <a
                  href={selectedTest.testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-terracotta-pill text-xs py-3 px-6 font-bold w-1/2 sm:w-auto justify-center"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Attempt Test Now</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}