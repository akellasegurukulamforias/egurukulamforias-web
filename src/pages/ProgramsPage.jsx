import React, { useState, useMemo } from 'react';
import { SectionDivider, CityscapeArtwork } from '../components/Artworks';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  X, 
  Users,
  Clock,
  Tag,
  GraduationCap,
  ExternalLink,
  Award
} from 'lucide-react';
import coursesData from '../data/courses.json';

export default function ProgramsPage({ navigate }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Available Category Filter Pills
  const categories = [
    { id: 'ALL', label: 'All Courses' },
    { id: 'UPSC CIVIL SERVICES', label: 'UPSC Civil Services' },
    { id: 'GROUPS & STATE', label: 'APPSC & TGPSC Groups' },
    { id: 'FOUNDATION', label: 'Foundation & Orientation' },
    { id: 'WORKSHOPS', label: 'Workshops & Strategy' },
    { id: 'OPTIONAL', label: 'Optional & History' },
    { id: 'SPECIALIST & PERSPECTIVE', label: 'Perspective & Books' }
  ];

  // Filter courses based on active category & search query
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-0 relative">
      
      {/* 1. HEADER BANNER */}
      <section className="section-mottled-parchment py-12 md:py-16 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
        <div className="max-w-4xl mx-auto space-y-4">

          <h1 className="font-serif-header text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221814]">
            Programs Offered
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-3xl mx-auto">
            Structured Civil Services preparation, specialised guidance, and transformative programmes designed to take an aspirant from preparation to public service.
          </p>
        </div>
      </section>

      {/* 2. SANKALPA SIDDHI FIELDWORK SPECIAL ANNOUNCEMENT BANNER */}
      <section className="section-clean-parchment py-8 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40 bg-[#FAF6EE]">
        <div className="max-w-7xl mx-auto">
          <div className="card-parchment-3d p-6 sm:p-8 md:p-10 border-2 border-[#8C3A27]/30 bg-gradient-to-br from-[#FAF6EE] via-[#F4ECE1] to-[#FAF6EE] space-y-6 relative overflow-hidden text-left shadow-lg">
            
            {/* Background Accent Emblem */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
              <Award className="w-64 h-64 text-[#8C3A27]" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              
              <div className="space-y-3 max-w-3xl">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8C3A27] text-white text-[11px] font-serif font-extrabold uppercase tracking-widest shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>SPECIAL FIELDWORK OPPORTUNITY FOR E-GURUKULAM ASPIRANTS</span>
                </div>

                <h2 className="font-serif-header text-2xl sm:text-3xl font-extrabold text-[#221814] leading-snug">
                  Sankalpa Siddhi (సంకల్ప సిద్ధి) | Nurturing Talent in Government Schools
                </h2>

                <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                  Aspirants enrolled in e-Gurukulam programs get an exclusive opportunity to participate in practical, ground-level fieldwork through <strong>Sankalpa Siddhi</strong>—a transformative initiative nurturing talent in government schools. This hands-on experience provides invaluable real-world public policy and governance insights directly beneficial for UPSC IAS Mains &amp; Personality Test preparation!
                </p>

              </div>

              <div className="flex-shrink-0 w-full md:w-auto">
                <a
                  href="https://www.sankalpasiddi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-terracotta-pill text-xs py-3.5 px-6 w-full md:w-auto justify-center font-serif font-bold shadow-md hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <span>Learn More About Sankalpa Siddhi</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. SEARCH & CATEGORY FILTER BAR — SINGLE UNIFIED ROW WITH ZERO CLIPPING */}
      <section className="section-clean-parchment py-3 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30 sticky top-[73px] z-30 bg-[#FBF7F0]/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
          
          {/* Compact Width Search Input */}
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

          {/* Category Filter Pills — pr-10 guarantees Perspective & Books is NEVER cut off on right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1.5 pr-10 flex-1 min-w-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-serif font-bold tracking-wide transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#8C3A27] text-white shadow-sm'
                    : 'bg-[#FAF6EE] text-[#3D3028] border border-[#D5C3B0] hover:border-[#8C3A27] hover:bg-[#F4ECE1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 4. COURSES CATALOG GRID */}
      <section className="section-clean-parchment py-12 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/30">
        <div className="max-w-7xl mx-auto space-y-8">
          
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
                      className="w-full btn-terracotta-outline-pill text-xs py-2.5 justify-center font-bold"
                    >
                      <span>Read Full Course Details</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/contact')}
                      className="w-full btn-terracotta-pill text-xs py-2.5 justify-center font-bold"
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

      {/* 5. BOTTOM SECTION — PUBLIC GOVERNANCE & KNOWLEDGE */}
      <section className="section-mottled-parchment py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Title & Copy */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="text-xs uppercase tracking-widest font-serif font-bold text-[#8C3A27]">
                HOLISTIC CIVIL SERVICES PREPARATION
              </span>

              <h2 className="font-serif-header text-3xl sm:text-4xl font-extrabold text-[#221814]">
                Transformative Guidance &amp; Ground-Level Insights
              </h2>

              <p className="font-serif italic text-base text-[#8C3A27] font-bold">
                “Every program combines academic rigor with practical governance perspective.”
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-[#3D3028] leading-relaxed font-sans font-medium">
                <p>
                  Our academic offerings provide comprehensive syllabus coverage, structured mentorship, and practical fieldwork opportunities to build well-rounded public servants.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-terracotta-pill text-xs py-3 px-6"
                >
                  <span>Talk to Mentor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Image Card with Overlay Text inside */}
            <div className="lg:col-span-6 flex justify-center">
              <CityscapeArtwork />
            </div>

          </div>
        </div>
      </section>

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
            {/* Modal Header — High Contrast Parchment Header */}
            <div className="relative bg-[#F4ECE1] border-b border-[#D5C3B0]/70 p-6 sm:p-8 flex-shrink-0">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 text-[#8C3A27] transition-colors"
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
                  className="btn-terracotta-outline-pill text-xs py-3 px-5 font-bold w-1/2 sm:w-auto justify-center"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate('/contact');
                  }}
                  className="btn-terracotta-pill text-xs py-3 px-6 font-bold w-1/2 sm:w-auto justify-center"
                >
                  <span>Enroll Now (₹{selectedCourse.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}