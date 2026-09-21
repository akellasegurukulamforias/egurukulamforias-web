// api/html.js - Vercel Edge Function for Authoritative Route-Derived Canonical Injection
import { indexHtml } from './_html_template.js';

export const config = {
  runtime: 'edge',
};

const REDIRECTS = {
  '/home': '/',
  '/courses': '/programs',
  '/connect': '/contact',
  '/admission': '/contact',
  '/philosophy': '/about',
  '/sadhana': '/test-series',
  '/repository': '/resources',
  '/blog': '/current-affairs',
  '/insights': '/current-affairs',
  '/journal': '/current-affairs'
};

export default function handler(req) {
  try {
    const url = new URL(req.url);
    const rawPath = url.pathname || '/';
    const cleanPath = rawPath.split('?')[0].split('#')[0].toLowerCase().replace(/\/+$/, '') || '/';
    
    let target = REDIRECTS[cleanPath] || cleanPath;
    if (target.startsWith('/blog/')) {
      target = target.replace('/blog/', '/current-affairs/');
    }

    const canonicalUrl = target === '/' 
      ? 'https://egurukulamforias.com/' 
      : `https://egurukulamforias.com${target}`;

    let html = indexHtml;

    // 1. Authoritative single canonical tag injection
    if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<link[^>]*rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      html = html.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`
      );
    }

    // 2. Synchronize OpenGraph URL tag
    if (/<meta[^>]*property=["']og:url["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<meta\s+[^>]*property=["']og:url["'][^>]*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
    }

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-canonical-source': 'edge-injected'
      }
    });
  } catch (err) {
    // Fail-safe: return unmodified indexHtml if any edge processing error occurs
    return new Response(indexHtml, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  }
}
