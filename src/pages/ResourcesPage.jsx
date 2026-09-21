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
import { 
  getCachedCMSData,
  getCMSImageLink, 
  formatCMSImageUrl, 
  getSecondaryCMSImageUrl, 
  isItemActive, 
  isSyllabusResource, 
  isPYQResource, 
  extractPYQYear, 
  extractPYQPaperName,
  extractPYQStage,
  extractPYQCategory,
  extractPYQPaperLabel,
  getPYQPaperUrl,
  sortPYQPapers,
  extractPaperNumber,
  extractOptionalSubject
} from '../services/cmsService';
import { createSlug, getDirectImageUrl, getSecondaryImageUrl } from '../utils/urlUtils';
import { sortCurrentAffairsByDate, formatDisplayDate } from '../utils/dateUtils';
import PdfViewerModal from '../components/PdfViewerModal';
import Link from '../components/Link';

function PYQPaperCard({ item, navigate }) {
  const title = item.Title || item.title || 'Untitled Paper';
  const itemYear = extractPYQYear(item);
  const itemStage = extractPYQStage(item);
  const itemCategory = extractPYQCategory(item);
  const paperLabel = extractPYQPaperLabel(item);
  const shortSummary = item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '';
  const rawBanner = 
    item.Banner_Image || item.banner_image ||
    item.Banner || item.banner ||
    item.Poster_Image || item.poster_image ||
    item.Poster_Image_Link || item.poster_image_link ||
    item.Image || item.image ||
    item.Thumbnail || item.thumbnail;
  const bannerImage = getDirectImageUrl(rawBanner) || getCMSImageLink(item);
  const paperTargetUrl = getPYQPaperUrl(item);

  return (
    <Link
      to={paperTargetUrl}
      navigate={navigate}
      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer h-full no-underline"
    >
      {bannerImage ? (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-black/5 relative">
          <img
            src={bannerImage}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const secondary = getSecondaryImageUrl(rawBanner) || getSecondaryCMSImageUrl(rawBanner);
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
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-[#6C1D18]/10 via-[#FAF6EE] to-[#EAE0D5] border-b border-[#D5C3B0]/60 p-4 sm:p-5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#8C3A27] bg-[#8C3A27]/15 px-2.5 py-1 rounded-md border border-[#8C3A27]/25">
              {itemYear} &bull; {itemStage.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2 py-0.5 rounded-md border border-[#8C3A27]/20">
              PYQ
            </span>
          </div>
          <div className="font-serif-header text-base font-bold text-[#6C1D18] truncate">
            {paperLabel}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20 shrink-0">
              <Tag className="w-3 h-3 shrink-0" />
              <span>PYQ</span>
            </span>
            <span className="inline-flex items-center gap-1 font-serif text-[#7A6B5D] italic font-semibold text-[11px] shrink-0">
              <Calendar className="w-3 h-3 text-[#8C3A27]" />
              <span>{itemYear} &bull; {itemStage}</span>
            </span>
          </div>

          <h3 className="font-serif-header text-base sm:text-lg font-bold text-[#221814] leading-snug group-hover:text-[#8C3A27] transition-colors line-clamp-2">
            {title}
          </h3>

          {shortSummary && (
            <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed line-clamp-2">
              {shortSummary}
            </p>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3 text-[11px] text-[#7A6B5D] font-mono border-t border-[#D5C3B0]/30">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{itemStage} Paper</span>
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0">
        <span
          className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all shadow-xs group-hover:shadow-md"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>VIEW QUESTION PAPER &rarr;</span>
        </span>
      </div>
    </Link>
  );
}

export default function ResourcesPage({ navigate, folder, pyqYear, pyqStage, pyqStream }) {
  const { data: cmsData, loading: cmsLoading } = useCMSData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState('');
  const [pyqSearchQuery, setPyqSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Dynamic Stage & Stream Filter states for PYQs
  const normalizedInitialStage = useMemo(() => {
    if (pyqStage) {
      if (/prelims|preliminary/i.test(pyqStage)) return 'Prelims';
      if (/mains|main\b/i.test(pyqStage)) return 'Mains';
    }
    return 'Mains';
  }, [pyqStage]);

  const [activeStage, setActiveStage] = useState(normalizedInitialStage);

  useEffect(() => {
    if (pyqStage) {
      if (/prelims|preliminary/i.test(pyqStage)) setActiveStage('Prelims');
      else if (/mains|main\b/i.test(pyqStage)) setActiveStage('Mains');
    }
  }, [pyqStage]);

  const normalizedInitialStream = useMemo(() => {
    if (pyqStream) {
      const s = pyqStream.toLowerCase();
      if (s === 'general-studies' || s === 'gs') return 'GENERAL_STUDIES';
      if (s === 'csat') return 'CSAT';
      if (s === 'essay') return 'ESSAY';
      if (s === 'optional') return 'OPTIONAL';
    }
    return 'OVERVIEW';
  }, [pyqStream]);

  const [selectedStream, setSelectedStream] = useState(normalizedInitialStream);

  useEffect(() => {
    if (pyqStream) {
      const s = pyqStream.toLowerCase();
      if (s === 'general-studies' || s === 'gs') setSelectedStream('GENERAL_STUDIES');
      else if (s === 'csat') setSelectedStream('CSAT');
      else if (s === 'essay') setSelectedStream('ESSAY');
      else if (s === 'optional') setSelectedStream('OPTIONAL');
      else setSelectedStream('OVERVIEW');
    } else {
      setSelectedStream('OVERVIEW');
    }
  }, [pyqStream]);

  // Automated SEO & Schema: Document Title, Meta Description, Canonical Link, Social Tags, and JSON-LD
  useEffect(() => {
    let pageTitle = "Resources | Akella Raghavendra's e-Gurukulam for IAS";
    let pageDesc = "Explore authentic UPSC study resources, comprehensive civil services syllabus breakdowns, categorized previous year questions (PYQs), and prep notes.";
    let canonicalUrl = 'https://egurukulamforias.com/resources';
    let schemaType = 'CollectionPage';
    let schemaName = 'Digital Learning & Study Resources';

    if (folder === 'upsc-syllabus') {
      pageTitle = "UPSC CSE Syllabus Breakdown | Akella Raghavendra's e-Gurukulam for IAS";
      pageDesc = "Detailed UPSC Civil Services Examination syllabus breakdown covering Prelims and Mains (General Studies I–IV, Essay, and Optionals) with topic analysis.";
      canonicalUrl = 'https://egurukulamforias.com/resources/upsc-syllabus';
      schemaType = 'Course';
      schemaName = 'UPSC Civil Services Examination Syllabus Directory';
    } else if (folder === 'pyqs') {
      if (pyqYear) {
        pageTitle = `UPSC Civil Services ${pyqYear} ${activeStage} Question Papers (PYQs) | Akella Raghavendra's e-Gurukulam for IAS`;
        pageDesc = `Download and analyze UPSC Civil Services ${pyqYear} ${activeStage} Previous Year Question Papers with detailed syllabus mapping.`;
        canonicalUrl = `https://egurukulamforias.com/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}`;
        schemaType = 'Quiz';
        schemaName = `UPSC Civil Services ${pyqYear} ${activeStage} Question Papers (PYQs)`;
      } else {
        pageTitle = "UPSC Previous Year Questions (PYQs) | Akella Raghavendra's e-Gurukulam for IAS";
        pageDesc = "Authentic archive of UPSC Civil Services Examination previous year question papers (PYQs) categorized by year, stage (Prelims/Mains), and subject.";
        canonicalUrl = 'https://egurukulamforias.com/resources/pyqs';
        schemaType = 'CollectionPage';
        schemaName = 'UPSC Civil Services Previous Year Questions (PYQs) Archive';
      }
    }

    document.title = pageTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = pageDesc;

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Open Graph & Twitter Social Metadata
    const updateMetaTag = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', pageDesc);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', pageDesc);

    // Automated JSON-LD Schema
    const scriptId = 'resources-page-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'name': schemaName,
      'description': pageDesc,
      'url': canonicalUrl,
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'e-Gurukulam for IAS',
        'url': 'https://egurukulamforias.com'
      },
      'educationalAlignment': {
        '@type': 'AlignmentObject',
        'alignmentType': 'educationalSubject',
        'educationalFramework': 'UPSC Civil Services Examination',
        'targetName': schemaName
      }
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [folder, pyqYear, activeStage]);

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

  // Active Resources from Google Sheet CMS sorted latest first (synchronous 0ms cache fallback)
  const activeResources = useMemo(() => {
    const memData = getCachedCMSData();
    const rawList = (Array.isArray(cmsData?.resources) && cmsData.resources.length > 0)
      ? cmsData.resources
      : (Array.isArray(memData?.resources) ? memData.resources : []);
    const list = rawList.filter(isItemActive);
    return sortCurrentAffairsByDate(list);
  }, [cmsData?.resources]);

  // Dynamically partition resources into Syllabus, PYQs, and Non-Syllabus
  const { syllabusResources, pyqResources, nonSyllabusResources } = useMemo(() => {
    const syllabus = [];
    const pyqs = [];
    const others = [];
    activeResources.forEach(item => {
      if (isPYQResource(item)) {
        pyqs.push(item);
      } else if (isSyllabusResource(item)) {
        syllabus.push(item);
      } else {
        others.push(item);
      }
    });
    return {
      syllabusResources: syllabus,
      pyqResources: sortPYQPapers(pyqs),
      nonSyllabusResources: others
    };
  }, [activeResources]);

  // Group PYQs by extracted Year
  const pyqGroupsByYear = useMemo(() => {
    const map = {};
    pyqResources.forEach(item => {
      const year = extractPYQYear(item) || 'General';
      if (!map[year]) {
        map[year] = [];
      }
      map[year].push(item);
    });
    const sortedYears = Object.keys(map).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
    return { map, sortedYears };
  }, [pyqResources]);

  // Filtered Non-Syllabus Non-PYQ Resources for main feed
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

  // Determine whether the Previous Year Questions Folder Card should be visible on the main feed
  const showPYQFolderInMain = useMemo(() => {
    if (pyqResources.length === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if ('previous year questions'.includes(q) || 'pyq'.includes(q) || 'pyqs'.includes(q) || 'question papers'.includes(q)) return true;
    return pyqResources.some(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const cat = (item.Category || item.category || '').toLowerCase();
      const subcat = (item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '').toLowerCase();
      return title.includes(q) || cat.includes(q) || subcat.includes(q);
    });
  }, [pyqResources, searchQuery]);

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

  // Papers for current year (or all if pyqYear not set) sorted naturally
  const currentYearPapers = useMemo(() => {
    if (!pyqYear) return pyqResources;
    const list = pyqResources.filter(item => String(extractPYQYear(item)) === String(pyqYear));
    return sortPYQPapers(list);
  }, [pyqResources, pyqYear]);

  // Split current year papers by Stage (Prelims vs Mains)
  const prelimsPapers = useMemo(() => {
    const list = currentYearPapers.filter(item => extractPYQStage(item) === 'Prelims');
    return sortPYQPapers(list);
  }, [currentYearPapers]);

  const mainsPapers = useMemo(() => {
    const list = currentYearPapers.filter(item => extractPYQStage(item) === 'Mains');
    return sortPYQPapers(list);
  }, [currentYearPapers]);

  // Mains sub-groups: GS Papers strictly 1 -> 4, Essay, Optionals
  const mainsGSPapers = useMemo(() => {
    const list = mainsPapers.filter(p => extractPYQCategory(p) === 'General Studies');
    return sortPYQPapers(list);
  }, [mainsPapers]);

  const mainsEssayPapers = useMemo(() => {
    const list = mainsPapers.filter(p => extractPYQCategory(p) === 'Essay');
    return sortPYQPapers(list);
  }, [mainsPapers]);

  const mainsOptionalPapers = useMemo(() => {
    const list = mainsPapers.filter(p => extractPYQCategory(p) === 'Optional');
    return sortPYQPapers(list);
  }, [mainsPapers]);

  // Optional subjects grouped by subject (e.g. Anthropology, Sociology), Paper 1 before Paper 2
  const mainsOptionalBySubject = useMemo(() => {
    const groups = {};
    mainsOptionalPapers.forEach(p => {
      const subj = extractOptionalSubject(p);
      if (!groups[subj]) groups[subj] = [];
      groups[subj].push(p);
    });
    Object.keys(groups).forEach(subj => {
      groups[subj] = sortPYQPapers(groups[subj]);
    });
    return groups;
  }, [mainsOptionalPapers]);

  // Auto-switch to stage that actually contains papers if default is empty
  useEffect(() => {
    if (pyqYear && !pyqStage) {
      if (mainsPapers.length > 0) {
        setActiveStage('Mains');
      } else if (prelimsPapers.length > 0) {
        setActiveStage('Prelims');
      }
    }
  }, [pyqYear, pyqStage, mainsPapers.length, prelimsPapers.length]);

  // Available stream filters for active stage (No "All Question Papers" on year page!)
  const availableStreams = useMemo(() => {
    if (activeStage === 'Prelims') {
      const gsCount = prelimsPapers.filter(p => extractPYQCategory(p) === 'General Studies').length;
      const csatCount = prelimsPapers.filter(p => extractPYQCategory(p) === 'CSAT').length;
      return [
        { id: 'OVERVIEW', label: 'Prelims Overview', count: prelimsPapers.length },
        { id: 'GENERAL_STUDIES', label: 'General Studies (Paper 1)', count: gsCount },
        { id: 'CSAT', label: 'CSAT (Paper 2)', count: csatCount },
      ];
    } else {
      const gsCount = mainsGSPapers.length;
      const essayCount = mainsEssayPapers.length;
      const optCount = mainsOptionalPapers.length;
      const streams = [
        { id: 'OVERVIEW', label: 'Mains Overview', count: mainsPapers.length },
        { id: 'GENERAL_STUDIES', label: 'General Studies (GS 1-4)', count: gsCount },
      ];
      if (essayCount > 0) {
        streams.push({ id: 'ESSAY', label: 'Essay', count: essayCount });
      }
      if (optCount > 0) {
        streams.push({ id: 'OPTIONAL', label: 'Optional Subjects', count: optCount });
      }
      return streams;
    }
  }, [activeStage, prelimsPapers, mainsPapers, mainsGSPapers.length, mainsEssayPapers.length, mainsOptionalPapers.length]);

  // Filtered PYQ Resources for search and direct lists
  const filteredPYQResources = useMemo(() => {
    let list = pyqResources;

    if (pyqYear) {
      const stageList = activeStage === 'Prelims' ? prelimsPapers : mainsPapers;
      if (selectedStream === 'OVERVIEW') {
        list = stageList;
      } else if (selectedStream === 'GENERAL_STUDIES') {
        list = stageList.filter(p => extractPYQCategory(p) === 'General Studies');
      } else if (selectedStream === 'CSAT') {
        list = stageList.filter(p => extractPYQCategory(p) === 'CSAT');
      } else if (selectedStream === 'ESSAY') {
        list = stageList.filter(p => extractPYQCategory(p) === 'Essay');
      } else if (selectedStream === 'OPTIONAL') {
        list = stageList.filter(p => extractPYQCategory(p) === 'Optional');
      }
    }

    if (!pyqSearchQuery.trim()) return sortPYQPapers(list);
    const q = pyqSearchQuery.toLowerCase();
    return sortPYQPapers(list.filter(item => {
      const title = (item.Title || item.title || '').toLowerCase();
      const cat = (item.Category || item.category || '').toLowerCase();
      const subcat = (item.Subcategory || item.subcategory || item.Sub_Category || item.sub_category || '').toLowerCase();
      const desc = (item.Short_Summary || item.short_summary || item.Summary || item.summary || item.Description || item.description || '').toLowerCase();
      return title.includes(q) || cat.includes(q) || subcat.includes(q) || desc.includes(q);
    }));
  }, [pyqResources, pyqYear, activeStage, selectedStream, prelimsPapers, mainsPapers, pyqSearchQuery]);

  const handleStageClick = (stage) => {
    setActiveStage(stage);
    setSelectedStream('OVERVIEW');
    if (pyqYear) {
      navigate(`/resources/pyqs/${pyqYear}/${stage.toLowerCase()}`);
    }
  };

  const handleStreamClick = (streamId) => {
    setSelectedStream(streamId);
    if (pyqYear && activeStage) {
      if (streamId === 'OVERVIEW') {
        navigate(`/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}`);
      } else {
        const streamSlug = streamId.toLowerCase().replace('_', '-');
        navigate(`/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}/${streamSlug}`);
      }
    }
  };

  const handleOpenResource = (item) => {
    const title = item.Title || item.title || '';
    const slug = item.slug || item.Slug || item.id || item.ID || createSlug(title);
    if (isPYQResource(item)) {
      navigate(getPYQPaperUrl(item));
    } else if (isSyllabusResource(item)) {
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
        <section className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 border-b border-[#D5C3B0] shadow-xs m-0 mt-0" style={{ top: 'var(--site-header-height)' }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/resources"
              navigate={navigate}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group no-underline"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Resources</span>
            </Link>

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
              Comprehensive micro-syllabus breakdowns for UPSC Civil Services Prelims, Mains General Studies (GS I to IV), and Optional subjects.
            </p>
          </div>
        </section>

        {/* 3. IN-FOLDER SEARCH & FILTER BAR */}
        <section className="py-3 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-b border-[#D5C3B0] shadow-2xs">
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
            {cmsLoading && syllabusResources.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
                <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                  Loading syllabus subjects from CMS...
                </p>
              </div>
            )}

            {filteredSyllabusResources.length > 0 ? (
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
                    <Link
                      key={idx}
                      to={`/resources/upsc-syllabus/${itemSlug}`}
                      navigate={navigate}
                      className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer no-underline"
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
                        <span
                          className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer group/btn group-hover:bg-[#8C3A27] group-hover:text-white"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>VIEW SYLLABUS &rarr;</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : !cmsLoading ? (
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
            ) : null}
          </div>
        </section>

        {/* 5. BOTTOM EXPLORATION BANNER */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-t border-[#D5C3B0]/30">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="font-serif italic text-sm sm:text-base text-[#5C4028] font-semibold">
              Looking for PYQ breakdowns, analytical study articles, or comprehensive video lecture series?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/resources"
                navigate={navigate}
                className="btn-terracotta-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer no-underline inline-block"
              >
                &larr; Return to All Study Resources
              </Link>
              <Link
                to="/programs"
                navigate={navigate}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer no-underline inline-block"
              >
                Explore Video Courses &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================================================
  // DEDICATED PREVIOUS YEAR QUESTIONS (PYQS) DRILL-DOWN VIEW (/resources/pyqs & /resources/pyqs/:year)
  // ==========================================================================
  if (folder === 'pyqs') {
    return (
      <div className="space-y-0 relative min-h-screen bg-[#FFFDF8]">
        {/* 1. TOP STICKY BREADCRUMB & BACK NAVIGATION */}
        <section className="sticky z-20 bg-[#FAF6EE] p-4 sm:p-5 border-b border-[#D5C3B0] shadow-xs m-0 mt-0" style={{ top: 'var(--site-header-height)' }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to={pyqYear ? '/resources/pyqs' : '/resources'}
                navigate={navigate}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] transition-colors cursor-pointer group no-underline"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{pyqYear ? 'Back to All PYQ Years' : 'Back to All Resources'}</span>
              </Link>

              {pyqYear ? (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-serif font-medium text-[#7A6B5D] pl-3 border-l border-[#D5C3B0]/60">
                  <Link to="/resources" navigate={navigate} className="hover:text-[#8C3A27] cursor-pointer no-underline text-inherit">Resources</Link>
                  <span>/</span>
                  <Link to="/resources/pyqs" navigate={navigate} className="hover:text-[#8C3A27] cursor-pointer no-underline text-inherit">PYQs</Link>
                  <span>/</span>
                  <Link to={`/resources/pyqs/${pyqYear}`} navigate={navigate} className="hover:text-[#8C3A27] cursor-pointer font-bold text-[#8C3A27] no-underline">{pyqYear}</Link>
                  <span>/</span>
                  <Link 
                    to={`/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}`}
                    navigate={navigate}
                    className={`hover:text-[#8C3A27] cursor-pointer font-bold no-underline ${selectedStream === 'OVERVIEW' ? 'text-[#8C3A27]' : 'text-[#7A6B5D]'}`}
                  >
                    {activeStage}
                  </Link>
                  {selectedStream !== 'OVERVIEW' && (
                    <>
                      <span>/</span>
                      <span className="font-bold text-[#8C3A27]">
                        {availableStreams.find(s => s.id === selectedStream)?.label || selectedStream}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-serif font-medium text-[#7A6B5D] pl-3 border-l border-[#D5C3B0]/60">
                  <Link to="/resources" navigate={navigate} className="hover:text-[#8C3A27] cursor-pointer no-underline text-inherit">Resources</Link>
                  <span>/</span>
                  <span className="text-[#8C3A27] font-bold">Previous Year Questions</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#8C3A27] font-bold bg-[#8C3A27]/10 px-3 py-1 rounded-md border border-[#8C3A27]/20 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{pyqYear ? `UPSC ${pyqYear} • ${activeStage.toUpperCase()}` : 'UPSC PYQ EXAM ARCHIVE'}</span>
              </span>
              <span className="font-serif text-[#7A6B5D] italic font-semibold hidden sm:inline">
                {filteredPYQResources.length} {filteredPYQResources.length === 1 ? 'Paper' : 'Papers'} Available
              </span>
            </div>
          </div>
        </section>

        {/* 2. FOLDER HERO HEADER */}
        <section className="section-mottled-parchment py-12 md:py-16 text-center px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0]/40">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C3A27]/10 border border-[#8C3A27]/25 text-[#8C3A27] text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#8C3A27]" />
              <span>
                {pyqYear
                  ? `Civil Services Examination ${pyqYear} • ${activeStage} Stage • ${filteredPYQResources.length} Papers`
                  : `Curated PYQ Archive • ${pyqGroupsByYear.sortedYears.length} Years Available`}
              </span>
            </div>
            <h1 className="font-serif-header text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#221814] leading-tight">
              {pyqYear
                ? `UPSC Civil Services ${pyqYear} • ${activeStage}`
                : 'Previous Year Question Papers (PYQs)'}
            </h1>
            {pyqYear && (
              <p className="font-serif italic text-base sm:text-lg text-[#3D3028] font-semibold max-w-2xl mx-auto leading-relaxed">
                Official {activeStage} question papers conducted during the {pyqYear} examination session.
              </p>
            )}
          </div>
        </section>

        {/* 3. IN-FOLDER SEARCH & FILTER BAR */}
        <section className="py-3 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-b border-[#D5C3B0] shadow-2xs">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6B5D]" />
              <input
                type="text"
                placeholder={pyqYear ? `Search ${pyqYear} papers (e.g. GS Paper 1, Essay, Optional)...` : "Search PYQs by year or subject (e.g. 2026, GS Paper 1, Mains, Prelims)..."}
                value={pyqSearchQuery}
                onChange={(e) => setPyqSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-[#FFFDF8] border border-[#D5C3B0] rounded-xl text-xs sm:text-sm text-[#221814] placeholder-[#7A6B5D] focus:outline-hidden focus:border-[#8C3A27] focus:ring-1 focus:ring-[#8C3A27] transition-all font-medium"
              />
              {pyqSearchQuery && (
                <button
                  onClick={() => setPyqSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6B5D] hover:text-[#8C3A27]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-[#8C3A27] shrink-0 bg-[#8C3A27]/10 px-3 py-2 rounded-xl border border-[#8C3A27]/20 hidden sm:inline-block">
              {filteredPYQResources.length} {filteredPYQResources.length === 1 ? 'Paper' : 'Papers'}
            </span>
          </div>
        </section>

        {/* 4. CONTENT SECTIONS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] min-h-[50vh]">
          <div className="max-w-7xl mx-auto space-y-12">
            {cmsLoading && pyqResources.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
                <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                  Loading previous year question papers from CMS...
                </p>
              </div>
            )}

            {/* LEVEL 2: IF ON ROOT /resources/pyqs AND NO SEARCH QUERY, DISPLAY YEAR CARDS */}
            {(!cmsLoading || pyqResources.length > 0) && !pyqYear && !pyqSearchQuery && pyqGroupsByYear.sortedYears.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#D5C3B0]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#8C3A27]" />
                    <h2 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                      Browse Papers by Examination Year
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#7A6B5D]">
                    {pyqGroupsByYear.sortedYears.length} Years Documented
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pyqGroupsByYear.sortedYears.map((year) => {
                    const papers = pyqGroupsByYear.map[year] || [];
                    const yrPrelims = papers.filter(p => extractPYQStage(p) === 'Prelims');
                    const yrMains = papers.filter(p => extractPYQStage(p) === 'Mains');

                    return (
                      <div
                        key={year}
                        className="card-parchment-3d rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#8C3A27]/30 hover:border-[#8C3A27] overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl group text-left relative ring-1 ring-[#8C3A27]/10"
                      >
                        <Link
                          to={`/resources/pyqs/${year}`}
                          navigate={navigate}
                          className="w-full bg-gradient-to-r from-[#6C1D18] via-[#8C3A27] to-[#732415] p-5 text-white flex flex-col justify-between relative overflow-hidden no-underline block"
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white">
                              {year}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAF6EE] bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                              {papers.length} {papers.length === 1 ? 'PAPER' : 'PAPERS'}
                            </span>
                          </div>
                          <div className="mt-3 z-10 flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/95 bg-white/15 px-2 py-0.5 rounded-md border border-white/20">
                              Mains: {yrMains.length}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/95 bg-white/15 px-2 py-0.5 rounded-md border border-white/20">
                              Prelims: {yrPrelims.length}
                            </span>
                          </div>
                        </Link>

                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <Link
                            to={`/resources/pyqs/${year}`}
                            navigate={navigate}
                            className="space-y-2 block no-underline text-inherit"
                          >
                            <p className="text-xs text-[#7A6B5D] font-mono font-bold uppercase tracking-wider">
                              Available Papers:
                            </p>
                            <div className="space-y-1.5">
                              {papers.slice(0, 3).map((p, idx) => {
                                const pName = extractPYQPaperLabel(p) || extractPYQPaperName(p) || p.Title || p.title;
                                const pStage = extractPYQStage(p);
                                return (
                                  <div key={idx} className="text-xs sm:text-sm font-serif font-bold text-[#221814] flex items-center justify-between gap-2 truncate">
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C3A27] shrink-0"></span>
                                      <span className="truncate group-hover:text-[#8C3A27] transition-colors">{pName}</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-[#7A6B5D] shrink-0">
                                      {pStage}
                                    </span>
                                  </div>
                                );
                              })}
                              {papers.length > 3 && (
                                <p className="text-[11px] font-serif italic text-[#7A6B5D]">
                                  +{papers.length - 3} more papers
                                </p>
                              )}
                            </div>
                          </Link>

                          <div className="pt-4 border-t border-[#D5C3B0]/40 grid grid-cols-2 gap-2">
                            <Link
                              to={`/resources/pyqs/${year}/prelims`}
                              navigate={navigate}
                              className="w-full inline-flex items-center justify-center gap-1 btn-terracotta-outline-pill text-[11px] py-2 px-2 font-serif font-bold transition-all cursor-pointer shadow-2xs hover:bg-[#8C3A27] hover:text-white no-underline"
                            >
                              <span>Prelims ({yrPrelims.length})</span>
                            </Link>
                            <Link
                              to={`/resources/pyqs/${year}/mains`}
                              navigate={navigate}
                              className="w-full inline-flex items-center justify-center gap-1 btn-terracotta-pill text-[11px] py-2 px-2 font-serif font-bold transition-all cursor-pointer shadow-xs hover:shadow-md no-underline"
                            >
                              <span>Mains ({yrMains.length}) &rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 3 & 4: STAGE SELECTION TABS & STREAM FILTER PILLS (SHOWN WHEN YEAR IS SELECTED) */}
            {pyqYear && (
              <div className="space-y-6">
                {/* Level 3: Stage Selection Folder Cards / Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prelims Stage Card */}
                  <Link
                    to={`/resources/pyqs/${pyqYear}/prelims`}
                    navigate={navigate}
                    onClick={() => {
                      setActiveStage('Prelims');
                      setSelectedStream('OVERVIEW');
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between gap-4 cursor-pointer no-underline ${
                      activeStage === 'Prelims'
                        ? 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-[#8C3A27] shadow-md ring-2 ring-[#8C3A27]/20'
                        : 'bg-[#FAF6EE]/70 border-[#D5C3B0] hover:border-[#8C3A27]/60 hover:bg-[#FAF6EE] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm tracking-wider ${
                        activeStage === 'Prelims' ? 'bg-[#8C3A27] text-white shadow-2xs' : 'bg-[#D5C3B0]/40 text-[#5C4028]'
                      }`}>
                        PRE
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-serif-header text-base sm:text-lg font-bold ${
                            activeStage === 'Prelims' ? 'text-[#6C1D18]' : 'text-[#221814]'
                          }`}>
                            Prelims Examination
                          </span>
                          {activeStage === 'Prelims' && (
                            <span className="w-2 h-2 rounded-full bg-[#8C3A27]"></span>
                          )}
                        </div>
                        <p className="text-xs font-serif text-[#7A6B5D] italic font-semibold">
                          Paper 1 (GS) &bull; Paper 2 (CSAT)
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        activeStage === 'Prelims'
                          ? 'bg-[#8C3A27]/15 text-[#8C3A27] border border-[#8C3A27]/30'
                          : 'bg-[#D5C3B0]/30 text-[#5C4028]'
                      }`}>
                        {prelimsPapers.length} {prelimsPapers.length === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </div>
                  </Link>

                  {/* Mains Stage Card */}
                  <Link
                    to={`/resources/pyqs/${pyqYear}/mains`}
                    navigate={navigate}
                    onClick={() => {
                      setActiveStage('Mains');
                      setSelectedStream('OVERVIEW');
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between gap-4 cursor-pointer no-underline ${
                      activeStage === 'Mains'
                        ? 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-[#8C3A27] shadow-md ring-2 ring-[#8C3A27]/20'
                        : 'bg-[#FAF6EE]/70 border-[#D5C3B0] hover:border-[#8C3A27]/60 hover:bg-[#FAF6EE] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm tracking-wider ${
                        activeStage === 'Mains' ? 'bg-[#8C3A27] text-white shadow-2xs' : 'bg-[#D5C3B0]/40 text-[#5C4028]'
                      }`}>
                        MAIN
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-serif-header text-base sm:text-lg font-bold ${
                            activeStage === 'Mains' ? 'text-[#6C1D18]' : 'text-[#221814]'
                          }`}>
                            Mains Examination
                          </span>
                          {activeStage === 'Mains' && (
                            <span className="w-2 h-2 rounded-full bg-[#8C3A27]"></span>
                          )}
                        </div>
                        <p className="text-xs font-serif text-[#7A6B5D] italic font-semibold">
                          GS Papers 1-4 &bull; Essay &bull; Optionals
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        activeStage === 'Mains'
                          ? 'bg-[#8C3A27]/15 text-[#8C3A27] border border-[#8C3A27]/30'
                          : 'bg-[#D5C3B0]/30 text-[#5C4028]'
                      }`}>
                        {mainsPapers.length} {mainsPapers.length === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Level 4: Stream Selection Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-[#D5C3B0]/40 pb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A6B5D] flex items-center gap-1.5 mr-2">
                    <Tag className="w-3.5 h-3.5 text-[#8C3A27]" />
                    <span>Streams:</span>
                  </span>
                  {availableStreams.map((st) => {
                    const isSelected = selectedStream === st.id;
                    const streamTarget = st.id === 'OVERVIEW'
                      ? `/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}`
                      : `/resources/pyqs/${pyqYear}/${activeStage.toLowerCase()}/${st.id.toLowerCase().replace('_', '-')}`;
                    return (
                      <Link
                        key={st.id}
                        to={streamTarget}
                        navigate={navigate}
                        onClick={() => setSelectedStream(st.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 no-underline ${
                          isSelected
                            ? 'bg-[#8C3A27] text-white shadow-xs'
                            : 'bg-[#FFFDF8] text-[#3D3028] hover:text-[#8C3A27] border border-[#D5C3B0] hover:border-[#8C3A27]'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#D5C3B0]/40 text-[#5C4028]'
                        }`}>
                          {st.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 4 & 5: PAPERS SUB-GRID & FOLDERS */}
            {(pyqResources.length > 0 || !cmsLoading) && (
              <div className="space-y-8">
                {/* A. If Search Query is Active: Show Search Results */}
                {pyqSearchQuery.trim() ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#D5C3B0]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-[#8C3A27]" />
                        <h3 className="font-serif-header text-xl font-bold text-[#221814]">
                          Search Results for &ldquo;{pyqSearchQuery}&rdquo;
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                        {filteredPYQResources.length} {filteredPYQResources.length === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </div>

                    {filteredPYQResources.length === 0 ? (
                      <div className="card-parchment-3d p-8 text-center max-w-md mx-auto space-y-4 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl shadow-sm">
                        <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-70" />
                        <h4 className="font-serif-header text-lg font-bold text-[#221814]">No Papers Found</h4>
                        <p className="text-xs sm:text-sm text-[#5C4028]">
                          No question papers matched &ldquo;{pyqSearchQuery}&rdquo;. Try clearing keywords.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPyqSearchQuery('')}
                          className="btn-terracotta-pill text-xs py-2 px-5 font-serif font-bold"
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPYQResources.map((item, idx) => (
                          <PYQPaperCard key={idx} item={item} navigate={navigate} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : pyqYear ? (
                  /* B. If on Year Slug Page: Follow Stream & Folder Hierarchy Rules (No "All Question Papers"!) */
                  activeStage === 'Mains' ? (
                    selectedStream === 'GENERAL_STUDIES' ? (
                      /* General Studies Folder View: GS 1 to GS 4 ordered 1 -> 4 */
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5C3B0]/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8C3A27]/15 flex items-center justify-center text-[#8C3A27] border border-[#8C3A27]/25 shadow-xs">
                              <FolderOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                                General Studies Papers (GS 1 to GS 4)
                              </h3>
                              <p className="text-xs text-[#7A6B5D] font-mono">
                                Compulsory Papers &bull; Paper 1 to Paper 4
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStreamClick('OVERVIEW')}
                            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 px-3.5 py-2 rounded-xl border border-[#8C3A27]/25 transition-all self-start sm:self-auto cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Mains Folders</span>
                          </button>
                        </div>

                        {mainsGSPapers.length === 0 ? (
                          <div className="card-parchment-3d p-8 text-center max-w-md mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
                            <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-70" />
                            <h4 className="font-serif-header text-lg font-bold text-[#221814]">No GS Papers Found</h4>
                            <p className="text-xs sm:text-sm text-[#5C4028]">
                              General Studies papers for {pyqYear} have not been uploaded yet.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {mainsGSPapers.map((paper, idx) => (
                              <PYQPaperCard key={idx} item={paper} navigate={navigate} />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : selectedStream === 'OPTIONAL' ? (
                      /* Optional Subjects Folder View: Subject folders with Paper 1 -> Paper 2 ordered inside */
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5C3B0]/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2E5A44]/15 flex items-center justify-center text-[#2E5A44] border border-[#2E5A44]/25 shadow-xs">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                                Optional Subjects Papers
                              </h3>
                              <p className="text-xs text-[#7A6B5D] font-mono">
                                Discipline-Specific Papers &bull; Paper 1 &bull; Paper 2
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStreamClick('OVERVIEW')}
                            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 px-3.5 py-2 rounded-xl border border-[#8C3A27]/25 transition-all self-start sm:self-auto cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Mains Folders</span>
                          </button>
                        </div>

                        {Object.keys(mainsOptionalBySubject).length === 0 ? (
                          <div className="card-parchment-3d p-8 text-center max-w-md mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
                            <BookOpen className="w-10 h-10 text-[#2E5A44] mx-auto opacity-70" />
                            <h4 className="font-serif-header text-lg font-bold text-[#221814]">No Optional Papers Found</h4>
                            <p className="text-xs sm:text-sm text-[#5C4028]">
                              Optional papers for {pyqYear} have not been uploaded to the archive yet.
                            </p>
                          </div>
                        ) : (
                          Object.entries(mainsOptionalBySubject).map(([subj, papers], sIdx) => (
                            <div key={sIdx} className="space-y-4 pt-2">
                              <div className="flex items-center gap-2 border-b border-[#D5C3B0]/40 pb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#2E5A44]"></span>
                                <h4 className="font-serif-header text-lg font-bold text-[#221814]">
                                  {subj} Optional
                                </h4>
                                <span className="text-[11px] font-mono font-bold text-[#2E5A44] bg-[#2E5A44]/10 px-2 py-0.5 rounded-md border border-[#2E5A44]/20">
                                  {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'} (P1 &bull; P2)
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {papers.map((paper, pIdx) => (
                                  <PYQPaperCard key={pIdx} item={paper} navigate={navigate} />
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : selectedStream === 'ESSAY' ? (
                      /* Essay View */
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5C3B0]/60 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8C3A27]/15 flex items-center justify-center text-[#8C3A27] border border-[#8C3A27]/25 shadow-xs">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                                Compulsory Essay Paper
                              </h3>
                              <p className="text-xs text-[#7A6B5D] font-mono">
                                Direct Examination Paper Booklet &bull; UPSC Civil Services Mains {pyqYear}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStreamClick('OVERVIEW')}
                            className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#8C3A27] hover:text-[#732D1B] bg-[#8C3A27]/10 hover:bg-[#8C3A27]/20 px-3.5 py-2 rounded-xl border border-[#8C3A27]/25 transition-all self-start sm:self-auto cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Mains Folders</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {mainsEssayPapers.map((paper, idx) => (
                            <PYQPaperCard key={idx} item={paper} navigate={navigate} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Mains Folders Overview (selectedStream === 'OVERVIEW'): Clean, Simple Side-by-Side Grid */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Card 1 (Folder): "General Studies" */}
                          {mainsGSPapers.length > 0 && (
                            <Link
                              to={`/resources/pyqs/${pyqYear}/mains/general-studies`}
                              navigate={navigate}
                              onClick={() => setSelectedStream('GENERAL_STUDIES')}
                              className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] hover:border-[#8C3A27] p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group text-left cursor-pointer h-full no-underline"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="w-12 h-12 rounded-xl bg-[#8C3A27]/10 border border-[#8C3A27]/25 flex items-center justify-center text-[#8C3A27] shadow-2xs group-hover:bg-[#8C3A27] group-hover:text-white transition-colors">
                                    <Folder className="w-6 h-6" />
                                  </div>
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                                    {mainsGSPapers.length} Papers (GS 1 to {mainsGSPapers.length})
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <h3 className="font-serif-header text-xl font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors">
                                    General Studies
                                  </h3>
                                  <p className="text-xs sm:text-sm text-[#5C4028] font-sans font-medium leading-relaxed">
                                    Compulsory Papers GS 1, GS 2, GS 3, GS 4
                                  </p>
                                </div>
                              </div>

                              <div className="pt-6 border-t border-[#D5C3B0]/40 mt-6">
                                <span
                                  className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all shadow-xs group-hover:shadow-md"
                                >
                                  <span>Open GS Papers &rarr;</span>
                                </span>
                              </div>
                            </Link>
                          )}

                          {/* Card 2 (Direct Paper): "Essay Paper" */}
                          {mainsEssayPapers.length > 0 && mainsEssayPapers.map((paper, idx) => {
                            const paperUrl = getPYQPaperUrl(paper);
                            return (
                              <Link
                                key={`essay-${idx}`}
                                to={paperUrl}
                                navigate={navigate}
                                className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] hover:border-[#8C3A27] p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group text-left cursor-pointer h-full no-underline"
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-[#8C3A27]/10 border border-[#8C3A27]/25 flex items-center justify-center text-[#8C3A27] shadow-2xs group-hover:bg-[#8C3A27] group-hover:text-white transition-colors">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C3A27] bg-[#8C3A27]/10 px-2.5 py-1 rounded-md border border-[#8C3A27]/20">
                                      Mains Paper &bull; 250 Marks
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <h3 className="font-serif-header text-xl font-bold text-[#221814] group-hover:text-[#8C3A27] transition-colors">
                                      Essay Paper
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#5C4028] font-sans font-medium leading-relaxed">
                                      Section A &amp; Section B Topics
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-6 border-t border-[#D5C3B0]/40 mt-6">
                                  <span
                                    className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all shadow-xs group-hover:shadow-md"
                                  >
                                    <span>View Question Paper &rarr;</span>
                                  </span>
                                </div>
                              </Link>
                            );
                          })}

                          {/* Card 3 (Folder / Cards): "Optional Subjects" */}
                          {Object.keys(mainsOptionalBySubject).length > 0 ? (
                            Object.entries(mainsOptionalBySubject).map(([subj, papers], idx) => (
                              <Link
                                key={`opt-${idx}`}
                                to={`/resources/pyqs/${pyqYear}/mains/optional`}
                                navigate={navigate}
                                onClick={() => setSelectedStream('OPTIONAL')}
                                className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] hover:border-[#8C3A27] p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group text-left cursor-pointer h-full no-underline"
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-xl bg-[#2E5A44]/10 border border-[#2E5A44]/25 flex items-center justify-center text-[#2E5A44] shadow-2xs group-hover:bg-[#2E5A44] group-hover:text-white transition-colors">
                                      <Folder className="w-6 h-6" />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2E5A44] bg-[#2E5A44]/10 px-2.5 py-1 rounded-md border border-[#2E5A44]/20">
                                      Paper 1 &amp; Paper 2
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <h3 className="font-serif-header text-xl font-bold text-[#221814] group-hover:text-[#2E5A44] transition-colors">
                                      {subj.toLowerCase().includes('optional') ? subj : `${subj} Optional`}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#5C4028] font-sans font-medium leading-relaxed">
                                      Discipline-Specific Papers (Paper 1 &amp; Paper 2)
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-6 border-t border-[#D5C3B0]/40 mt-6">
                                  <span
                                    className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all shadow-xs group-hover:shadow-md"
                                  >
                                    <span>Open Optional &rarr;</span>
                                  </span>
                                </div>
                              </Link>
                            ))
                          ) : mainsOptionalPapers.length > 0 ? (
                            <Link
                              to={`/resources/pyqs/${pyqYear}/mains/optional`}
                              navigate={navigate}
                              onClick={() => setSelectedStream('OPTIONAL')}
                              className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] hover:border-[#8C3A27] p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group text-left cursor-pointer h-full no-underline"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="w-12 h-12 rounded-xl bg-[#2E5A44]/10 border border-[#2E5A44]/25 flex items-center justify-center text-[#2E5A44] shadow-2xs group-hover:bg-[#2E5A44] group-hover:text-white transition-colors">
                                    <Folder className="w-6 h-6" />
                                  </div>
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2E5A44] bg-[#2E5A44]/10 px-2.5 py-1 rounded-md border border-[#2E5A44]/20">
                                    Paper 1 &amp; Paper 2
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <h3 className="font-serif-header text-xl font-bold text-[#221814] group-hover:text-[#2E5A44] transition-colors">
                                    Optional Subjects
                                  </h3>
                                  <p className="text-xs sm:text-sm text-[#5C4028] font-sans font-medium leading-relaxed">
                                    Discipline-Specific Papers (Paper 1 &amp; Paper 2)
                                  </p>
                                </div>
                              </div>

                              <div className="pt-6 border-t border-[#D5C3B0]/40 mt-6">
                                <span
                                  className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all shadow-xs group-hover:shadow-md"
                                >
                                  <span>Open Optional &rarr;</span>
                                </span>
                              </div>
                            </Link>
                          ) : null}

                          {/* Empty state if no papers exist */}
                          {mainsPapers.length === 0 && (
                            <div className="col-span-full card-parchment-3d p-8 text-center max-w-md mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
                              <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-70" />
                              <h4 className="font-serif-header text-lg font-bold text-[#221814]">No Mains Papers Found</h4>
                              <p className="text-xs sm:text-sm text-[#5C4028]">
                                Mains question papers for {pyqYear} have not been uploaded to the archive yet.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                    /* Prelims View: Paper 1 & Paper 2 in natural ascending order */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-[#D5C3B0]/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#8C3A27]/15 flex items-center justify-center text-[#8C3A27] border border-[#8C3A27]/25 shadow-xs">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-serif-header text-xl sm:text-2xl font-bold text-[#221814]">
                              Prelims Examination Papers
                            </h3>
                            <p className="text-xs text-[#7A6B5D] font-mono">
                              General Studies (Paper 1) &bull; CSAT (Paper 2)
                            </p>
                          </div>
                        </div>
                      </div>

                      {prelimsPapers.length === 0 ? (
                        <div className="card-parchment-3d p-8 text-center max-w-md mx-auto space-y-3 bg-[#FFFDF8] border border-[#D5C3B0] rounded-2xl">
                          <FileText className="w-10 h-10 text-[#8C3A27] mx-auto opacity-70" />
                          <h4 className="font-serif-header text-lg font-bold text-[#221814]">No Prelims Papers Uploaded</h4>
                          <p className="text-xs sm:text-sm text-[#5C4028]">
                            Prelims papers for {pyqYear} have not been uploaded to the archive yet.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {prelimsPapers.map((paper, idx) => (
                            <PYQPaperCard key={idx} item={paper} navigate={navigate} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* 5. BOTTOM EXPLORATION BANNER */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAF6EE] border-t border-[#D5C3B0]/30">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="font-serif italic text-sm sm:text-base text-[#5C4028] font-semibold">
              Looking for micro-syllabus breakdowns or comprehensive video lecture series?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/resources"
                navigate={navigate}
                className="btn-terracotta-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer no-underline inline-block"
              >
                &larr; Return to All Study Resources
              </Link>
              <Link
                to="/resources/upsc-syllabus"
                navigate={navigate}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-6 font-serif font-bold cursor-pointer no-underline inline-block"
              >
                UPSC Syllabus Hub &rarr;
              </Link>
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
      <section 
        className="section-clean-parchment py-3 px-4 sm:px-6 lg:px-8 border-b border-[#D5C3B0] sticky z-20 bg-[#FAF6EE] shadow-xs m-0 mt-0"
        style={{ top: 'var(--site-header-height)' }}
      >
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
          {cmsLoading && nonSyllabusResources.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#8C3A27] animate-spin mx-auto" />
              <p className="text-xs font-serif italic text-[#7A6B5D] font-bold">
                Fetching study resources from Content CMS...
              </p>
            </div>
          )}

          {/* CONTENT GRID */}
          {(showSyllabusFolderInMain || showPYQFolderInMain || filteredNonSyllabusResources.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. DYNAMIC UPSC SYLLABUS FOLDER HUB CARD */}
              {showSyllabusFolderInMain && (
                <Link 
                  to="/resources/upsc-syllabus"
                  navigate={navigate}
                  className="card-parchment-3d rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#8C3A27]/30 hover:border-[#8C3A27] overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl group text-left cursor-pointer relative ring-1 ring-[#8C3A27]/10 no-underline"
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
                      <span
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer shadow-xs group-hover:shadow-md"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>EXPLORE SYLLABUS FOLDER &rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* 2. DYNAMIC PREVIOUS YEAR QUESTIONS (PYQS) FOLDER HUB CARD */}
              {showPYQFolderInMain && (
                <Link 
                  to="/resources/pyqs"
                  navigate={navigate}
                  className="card-parchment-3d rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#8C3A27]/30 hover:border-[#8C3A27] overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl group text-left cursor-pointer relative ring-1 ring-[#8C3A27]/10 no-underline"
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
                        <span>EXAM ARCHIVE</span>
                      </span>
                    </div>

                    <div className="mt-4 z-10">
                      <h3 
                        className="font-serif-header text-xl sm:text-2xl font-bold !text-white leading-snug drop-shadow-xs"
                        style={{ color: '#FFFFFF' }}
                      >
                        Previous Year Questions
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
                          <span>{pyqResources.length} {pyqResources.length === 1 ? 'Paper' : 'Papers'} Available</span>
                        </span>
                        <span className="text-[11px] font-serif italic text-[#7A6B5D] font-semibold">
                          Prelims &bull; Mains &bull; GS Papers
                        </span>
                      </div>

                      {/* Folder Description */}
                      <p className="text-xs sm:text-sm text-[#3D3028] font-sans font-medium leading-relaxed">
                        Official UPSC Civil Services Prelims & Mains examination papers with structured question formatting, word limits, and marks.
                      </p>

                      {/* Dynamic Year Preview Pills */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {pyqGroupsByYear.sortedYears.map((year) => {
                          const count = (pyqGroupsByYear.map[year] || []).length;
                          return (
                            <span 
                              key={year} 
                              className="text-[10px] font-mono font-bold bg-[#FAF6EE] text-[#5C4028] px-2 py-0.5 rounded-md border border-[#D5C3B0]"
                            >
                              {year} ({count})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Folder Action CTA */}
                    <div className="pt-4 border-t border-[#D5C3B0]/40">
                      <span
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer shadow-xs group-hover:shadow-md"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>EXPLORE PYQS FOLDER &rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* 3. NON-SYLLABUS STUDY RESOURCES (PYQs, Notes, Strategy Guides) */}
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
                const itemSlug = item.slug || item.Slug || item.id || item.ID || createSlug(title);

                let targetUrl = `/resources/${encodeURIComponent(itemSlug)}`;
                if (isSyllabusResource(item)) {
                  targetUrl = `/resources/upsc-syllabus/${encodeURIComponent(itemSlug)}`;
                } else if (isPYQResource(item)) {
                  targetUrl = getPYQPaperUrl(item);
                }

                return (
                  <Link 
                    key={idx} 
                    to={targetUrl}
                    navigate={navigate}
                    className="card-parchment-3d rounded-2xl bg-[#FFFDF8] border border-[#D5C3B0] overflow-hidden flex flex-col justify-between hover:border-[#8C3A27] transition-all shadow-sm group text-left cursor-pointer no-underline"
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
                      <span
                        className="w-full inline-flex items-center justify-center gap-2 btn-terracotta-outline-pill text-xs py-2.5 px-4 font-serif font-bold transition-all cursor-pointer group/btn group-hover:bg-[#8C3A27] group-hover:text-white"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>READ RESOURCE &rarr;</span>
                      </span>
                    </div>
                  </Link>
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