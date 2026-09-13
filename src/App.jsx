import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DesktopViewPrompt from './components/DesktopViewPrompt';
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
import ParticleConvergenceLoader from './components/ParticleConvergenceLoader';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#FFFDF8] border-2 border-[#8C3A27]/30 rounded-3xl p-8 shadow-md space-y-4">
            <h2 className="font-serif-header text-2xl font-bold text-[#6C1D18]">Something went wrong</h2>
            <p className="text-sm text-[#5C4028] font-serif">
              An unexpected error occurred while loading this view.
            </p>
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

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupInitialIndex, setPopupInitialIndex] = useState(0);
  const [popupSelectedItem, setPopupSelectedItem] = useState(null);
  const { data: cmsData, loading: cmsLoading } = useCMSData();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const normalizedPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';

    if (normalizedPath.startsWith('/current-affairs/')) {
      let slug = normalizedPath.replace('/current-affairs/', '');
      try {
        slug = decodeURIComponent(slug);
      } catch (e) {
        // keep raw slug
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
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col foxing-vignette bg-[#F3EBD9] text-[#2C221E] selection:bg-[#8C3A27] selection:text-[#FCFAF6]">
      {/* Desktop Mode Recommendation Popup for Mobile Users */}
      <DesktopViewPrompt />

      {/* Global Route Guard & Data Hydration Particle Convergence Loader */}
      <ParticleConvergenceLoader 
        isReady={!cmsLoading} 
        label="Hydrating Knowledge Base..."
        sublabel="e-Gurukulam for IAS • Tradition of Wisdom & Modern Rigor"
      />

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