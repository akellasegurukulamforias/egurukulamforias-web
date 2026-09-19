import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementPopup from './components/AnnouncementPopup';
import FloatingSocialDock from './components/FloatingSocialDock';
import { useCMSData } from './hooks/useCMSData';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import TestSeriesPage from './pages/TestSeriesPage';
import BlogPage from './pages/BlogPage';
import ResourcesPage from './pages/ResourcesPage';
import ConnectPage from './pages/ConnectPage';
import CurrentAffairsDetailPage from './pages/CurrentAffairsDetailPage';
import ResourceDetailPage from './pages/ResourceDetailPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Current Affairs Render Error:", error, errorInfo);
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-xl bg-[#FFFDF8] border-2 border-[#8C3A27]/30 rounded-3xl p-8 shadow-md space-y-4 text-left">
            <h2 className="font-serif-header text-2xl font-bold text-[#6C1D18] text-center">Something went wrong</h2>
            <p className="text-sm text-[#5C4028] font-serif text-center">
              An unexpected error occurred while loading this view.
            </p>
            <pre className="text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto mt-4 font-mono whitespace-pre-wrap max-h-72">
              {error?.stack || error?.message || String(error)}
            </pre>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                className="btn-terracotta-pill text-xs py-2.5 px-5 font-serif font-bold cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/resources'; }}
                className="btn-terracotta-outline-pill text-xs py-2.5 px-5 font-serif font-bold cursor-pointer"
              >
                Go to Resources
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFoundPage({ navigate }) {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-[#FFFDF8] border-2 border-[#D5C3B0] rounded-3xl p-8 shadow-sm space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6C1D18]/10 text-[#6C1D18] mb-1">
          <span className="font-serif-header text-3xl font-bold">404</span>
        </div>
        <h1 className="font-serif-header text-2xl sm:text-3xl font-bold text-[#6C1D18]">
          Manuscript Not Found
        </h1>
        <p className="text-sm sm:text-base text-[#5C4028] font-serif leading-relaxed">
          The manuscript or resource you are looking for does not exist, has been moved, or archived.
        </p>
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#6C1D18] text-white text-xs font-serif font-bold uppercase tracking-wider hover:bg-[#8C3A27] transition-colors shadow-xs cursor-pointer"
          >
            Return Home
          </button>
          <button
            type="button"
            onClick={() => navigate('/current-affairs')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white border border-[#D5C3B0] text-[#6C1D18] text-xs font-serif font-bold uppercase tracking-wider hover:bg-[#FAF6EE] transition-colors cursor-pointer"
          >
            Current Affairs
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/'
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupInitialIndex, setPopupInitialIndex] = useState(0);
  const [popupSelectedItem, setPopupSelectedItem] = useState(null);
  const { data: cmsData } = useCMSData();
  const isPopStateRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      setCurrentPath((window.location.pathname + window.location.search) || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Centralized Scroll Restoration: Synchronously reset scroll to top on normal route navigation before paint
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPopStateRef.current) {
      // Browser back/forward navigation: allow browser to restore scroll position naturally
      isPopStateRef.current = false;
      return;
    }

    // Check if URL has a hash target
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView();
        return;
      }
    }

    // Normal forward client navigation: immediate reset to top (no smooth animation abort glitch)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPath]);

  // Default metadata reset for top-level pages
  useEffect(() => {
    const rawPath = (currentPath || '/').split('?')[0].split('#')[0];
    const normalizedPath = rawPath.toLowerCase().replace(/\/$/, '') || '/';
    const isDetailPage = normalizedPath.startsWith('/current-affairs/') || 
                         (normalizedPath.startsWith('/resources/') && normalizedPath !== '/resources' && normalizedPath !== '/resources/upsc-syllabus' && normalizedPath !== '/resources/pyqs');

    if (!isDetailPage) {
      const titles = {
        '/': "Akella Raghavendra's e-Gurukulam For IAS",
        '/about': 'About Us | e-Gurukulam for IAS',
        '/philosophy': 'About Us | e-Gurukulam for IAS',
        '/programs': 'UPSC Mentorship Programs | e-Gurukulam for IAS',
        '/courses': 'UPSC Mentorship Programs | e-Gurukulam for IAS',
        '/mentorship': 'UPSC Mentorship Programs | e-Gurukulam for IAS',
        '/ias-with-life': 'UPSC Mentorship Programs | e-Gurukulam for IAS',
        '/test-series': 'Test Series & Sadhana | e-Gurukulam for IAS',
        '/sadhana': 'Test Series & Sadhana | e-Gurukulam for IAS',
        '/current-affairs': 'Daily UPSC Current Affairs & Editorial Analysis | e-Gurukulam for IAS',
        '/blog': 'Daily UPSC Current Affairs & Editorial Analysis | e-Gurukulam for IAS',
        '/insights': 'Daily UPSC Current Affairs & Editorial Analysis | e-Gurukulam for IAS',
        '/journal': 'Daily UPSC Current Affairs & Editorial Analysis | e-Gurukulam for IAS',
        '/resources': 'UPSC Resources, Syllabus & PYQs | e-Gurukulam for IAS',
        '/repository': 'UPSC Resources, Syllabus & PYQs | e-Gurukulam for IAS',
        '/resources/upsc-syllabus': 'UPSC CSE Syllabus Breakdown | e-Gurukulam for IAS',
        '/resources/pyqs': 'UPSC Previous Year Questions (PYQs) | e-Gurukulam for IAS',
        '/contact': 'Connect & Admissions | e-Gurukulam for IAS',
        '/connect': 'Connect & Admissions | e-Gurukulam for IAS',
        '/apply': 'Connect & Admissions | e-Gurukulam for IAS',
        '/admission': 'Connect & Admissions | e-Gurukulam for IAS',
      };
      
      const newTitle = titles[normalizedPath] || 'Page Not Found | e-Gurukulam for IAS';
      document.title = newTitle;

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      const canonicalHref = normalizedPath === '/' 
        ? 'https://egurukulamforias.com/' 
        : `https://egurukulamforias.com${normalizedPath}`;
      canonical.setAttribute('href', canonicalHref);

      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        if (normalizedPath === '/') {
          metaDesc.setAttribute('content', 'Prepare for UPSC Civil Services with Akella Raghavendra Sir through focused mentorship, practical strategy, current affairs, study resources, and disciplined preparation.');
        } else {
          metaDesc.setAttribute('content', 'e-Gurukulam for IAS - Premium UPSC Civil Services Examination mentoring, daily editorial current affairs analysis, comprehensive syllabus breakdown, and categorized PYQs.');
        }
      }

      if (normalizedPath === '/') {
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', "Akella Raghavendra's e-Gurukulam For IAS");
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', 'Prepare for UPSC Civil Services with Akella Raghavendra Sir through focused mentorship, practical strategy, current affairs, study resources, and disciplined preparation.');
        let twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', "Akella Raghavendra's e-Gurukulam For IAS");
        let twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', 'Prepare for UPSC Civil Services with Akella Raghavendra Sir through focused mentorship, practical strategy, current affairs, study resources, and disciplined preparation.');
      }
    }
  }, [currentPath]);

  // SPA Route Tracking for Google Analytics 4 (GA4 Measurement ID: G-T5W96019N1)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-T5W96019N1', {
        page_path: currentPath,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [currentPath]);

  const navigate = (path, options = {}) => {
    isPopStateRef.current = false;
    const currentFull = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '';
    if (currentFull !== path || options?.state) {
      window.history.pushState(options?.state || {}, '', path);
    }
    setCurrentPath(path);
  };

  const handleOpenPopup = (indexOrItem = 0) => {
    if (typeof indexOrItem === 'number') {
      setPopupInitialIndex(indexOrItem);
      setPopupSelectedItem(null);
    } else if (indexOrItem && typeof indexOrItem === 'object') {
      setPopupSelectedItem(indexOrItem);
    } else {
      setPopupInitialIndex(0);
      setPopupSelectedItem(null);
    }
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Route Resolver for client-side navigation
  const renderPage = () => {
    const rawPath = (currentPath || '/').split('?')[0].split('#')[0];
    const normalizedPath = rawPath.toLowerCase().replace(/\/$/, '') || '/';

    if (normalizedPath.startsWith('/current-affairs/')) {
      let slug = normalizedPath.replace('/current-affairs/', '');
      try {
        slug = decodeURIComponent(slug);
      } catch (e) {
        // keep raw slug
      }
      if (!slug || !slug.trim()) {
        return <BlogPage navigate={navigate} />;
      }
      return <CurrentAffairsDetailPage key={normalizedPath} slug={slug} navigate={navigate} />;
    }

    if (normalizedPath === '/resources/upsc-syllabus') {
      return <ResourcesPage folder="upsc-syllabus" navigate={navigate} />;
    }

    if (normalizedPath.startsWith('/resources/upsc-syllabus/')) {
      let slug = normalizedPath.replace('/resources/upsc-syllabus/', '');
      try {
        slug = decodeURIComponent(slug);
      } catch (e) {
        // keep raw slug
      }
      return <ResourceDetailPage key={normalizedPath} slug={slug} folder="upsc-syllabus" navigate={navigate} />;
    }

    if (normalizedPath === '/resources/pyqs') {
      return <ResourcesPage folder="pyqs" navigate={navigate} />;
    }

    if (normalizedPath.startsWith('/resources/pyqs/')) {
      const rest = normalizedPath.replace('/resources/pyqs/', '');
      const parts = rest.split('/').filter(Boolean);

      if (parts.length === 1) {
        const seg = parts[0];
        if (/^(19\d{2}|20\d{2})$/.test(seg)) {
          return <ResourcesPage folder="pyqs" pyqYear={seg} navigate={navigate} />;
        } else if (seg === 'mains' || seg === 'prelims') {
          return <ResourcesPage folder="pyqs" pyqStage={seg} navigate={navigate} />;
        } else {
          let slug = seg;
          try { slug = decodeURIComponent(slug); } catch (e) {}
          return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" navigate={navigate} />;
        }
      } else if (parts.length === 2) {
        const [p1, p2] = parts;
        if (/^(19\d{2}|20\d{2})$/.test(p1) && (p2 === 'mains' || p2 === 'prelims')) {
          return <ResourcesPage folder="pyqs" pyqYear={p1} pyqStage={p2} navigate={navigate} />;
        } else if (/^(19\d{2}|20\d{2})$/.test(p1)) {
          let slug = p2;
          try { slug = decodeURIComponent(slug); } catch (e) {}
          return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" year={p1} navigate={navigate} />;
        } else {
          let slug = parts.join('/');
          try { slug = decodeURIComponent(slug); } catch (e) {}
          return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" navigate={navigate} />;
        }
      } else if (parts.length === 3) {
        const [year, stage, p3] = parts;
        if (/^(19\d{2}|20\d{2})$/.test(year) && (stage === 'mains' || stage === 'prelims')) {
          const streamTokens = ['general-studies', 'gs', 'csat', 'essay', 'optional', 'all'];
          const isArticle = Array.isArray(cmsData?.resources) && cmsData.resources.some(r => {
            const s = (r.slug || r.Slug || '').toLowerCase();
            return s === p3;
          });
          if (streamTokens.includes(p3) && !isArticle) {
            return <ResourcesPage folder="pyqs" pyqYear={year} pyqStage={stage} pyqStream={p3} navigate={navigate} />;
          }
          let slug = p3;
          try { slug = decodeURIComponent(slug); } catch (e) {}
          return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" year={year} stage={stage} navigate={navigate} />;
        }
        let slug = parts.slice(1).join('/');
        try { slug = decodeURIComponent(slug); } catch (e) {}
        return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" year={year} navigate={navigate} />;
      } else if (parts.length >= 4) {
        const [year, stage, stream] = parts;
        let slug = parts.slice(3).join('/');
        try { slug = decodeURIComponent(slug); } catch (e) {}
        return <ResourceDetailPage key={normalizedPath} slug={slug} folder="pyqs" year={year} stage={stage} stream={stream} navigate={navigate} />;
      }
    }

    if (normalizedPath.startsWith('/resources/')) {
      let slug = normalizedPath.replace('/resources/', '');
      try {
        slug = decodeURIComponent(slug);
      } catch (e) {
        // keep raw slug
      }
      return <ResourceDetailPage key={normalizedPath} slug={slug} navigate={navigate} />;
    }

    switch (normalizedPath) {
      case '/':
      case '/home':
        return <HomePage navigate={navigate} />;
      case '/about':
      case '/philosophy':
        return <AboutPage navigate={navigate} />;
      case '/programs':
      case '/courses':
      case '/mentorship':
      case '/ias-with-life':
        return <ProgramsPage navigate={navigate} />;
      case '/test-series':
      case '/sadhana':
        return <TestSeriesPage navigate={navigate} />;
      case '/current-affairs':
      case '/blog':
      case '/insights':
      case '/journal':
        return <BlogPage navigate={navigate} />;
      case '/resources':
      case '/repository':
        return <ResourcesPage navigate={navigate} />;
      case '/contact':
      case '/connect':
      case '/apply':
      case '/admission':
        return <ConnectPage navigate={navigate} />;
      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col foxing-vignette bg-[#F3EBD9] text-[#2C221E] selection:bg-[#8C3A27] selection:text-[#FCFAF6]">


      {/* Dynamic Fanned Deck Google Sheet CMS Live Ticker / Announcement Popup Modal */}
      <AnnouncementPopup 
        activePopup={cmsData?.activePopup} 
        tickerItems={cmsData?.liveTicker}
        initialIndex={popupInitialIndex}
        selectedItem={popupSelectedItem}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
      />

      {/* Floating Radial/Arc Social Ecosystem Dock */}
      <FloatingSocialDock />

      {/* Top Sticky Header Bar */}
      <Header 
        currentPath={currentPath} 
        navigate={navigate} 
        onOpenPopup={handleOpenPopup}
      />

      {/* Main Container */}
      <main className="flex-1">
        <ErrorBoundary key={currentPath}>
          {renderPage()}
        </ErrorBoundary>
      </main>

      {/* Global Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}