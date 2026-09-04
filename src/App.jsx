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

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupInitialIndex, setPopupInitialIndex] = useState(0);
  const [popupSelectedItem, setPopupSelectedItem] = useState(null);
  const { data: cmsData } = useCMSData();

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
      return <CurrentAffairsDetailPage slug={slug} navigate={navigate} />;
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
        {renderPage()}
      </main>

      {/* Global Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}