import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import TestSeriesPage from './pages/TestSeriesPage';
import BlogPage from './pages/BlogPage';
import ResourcesPage from './pages/ResourcesPage';
import ConnectPage from './pages/ConnectPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Resolver for client-side navigation
  const renderPage = () => {
    const normalizedPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';

    switch (normalizedPath) {
      case '/':
      case '/home':
        return <HomePage navigate={navigate} />;
      case '/about':
      case '/philosophy':
        return <AboutPage navigate={navigate} />;
      case '/programs':
      case '/courses':
        return <ProgramsPage navigate={navigate} />;
      case '/test-series':
      case '/sadhana':
        return <TestSeriesPage navigate={navigate} />;
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
      {/* Top Sticky Header Bar */}
      <Header currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Global Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}