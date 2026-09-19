import React from 'react';

/**
 * Lightweight, zero-dependency crawlable Link component.
 * 
 * Renders a standard semantic <a href={to}> so search-engine bots (Googlebot, Bingbot, etc.)
 * can discover and crawl destination URLs directly from the HTML/DOM.
 * 
 * Intercepts normal left-clicks to perform instant SPA navigation without full page reloads.
 * Respects browser-native actions: Cmd/Ctrl+Click, Shift+Click, Middle-click, and Right-click.
 */
export default function Link({
  to,
  navigate,
  state,
  onClick,
  children,
  className = '',
  target,
  rel,
  ...rest
}) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    // Allow default browser behavior for modifier keys (open in new tab/window) or non-left clicks
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      target === '_blank'
    ) {
      return;
    }

    // If destination is external, mailto, tel, or hash-only, allow native browser navigation
    if (
      !to ||
      to.startsWith('http://') ||
      to.startsWith('https://') ||
      to.startsWith('mailto:') ||
      to.startsWith('tel:') ||
      to.startsWith('#')
    ) {
      return;
    }

    e.preventDefault();

    if (typeof navigate === 'function') {
      navigate(to, { state });
    } else if (typeof window !== 'undefined') {
      // Fallback if navigate prop is not provided directly
      window.history.pushState(state || {}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
      {...rest}
    >
      {children}
    </a>
  );
}
