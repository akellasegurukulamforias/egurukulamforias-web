// api/html.js - Vercel Edge Function for Authoritative Route-Derived Canonical & Social Meta Injection
import { indexHtml, routeMetadata } from './_html_template.js';

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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function handler(req) {
  try {
    const url = new URL(req.url);
    const rawPath = url.pathname || '/';
    const cleanPath = rawPath.split('?')[0].split('#')[0].toLowerCase().replace(/\/+$/, '') || '/';
    
    let target = REDIRECTS[cleanPath] || cleanPath;
    if (target.startsWith('/blog/')) {
      target = target.replace('/blog/', '/current-affairs/');
    }

    const meta = (routeMetadata && (routeMetadata[cleanPath] || routeMetadata[target])) || null;

    let html = indexHtml;

    if (meta) {
      if (/<title>.*?<\/title>/is.test(html)) {
        html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(meta.title)}</title>`);
      }
      if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta\s+name=["']description["'][^>]*>/i,
          `<meta name="description" content="${escapeAttr(meta.description)}" />`
        );
      }
      const canonicalUrl = meta.canonicalUrl;
      if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<link[^>]*rel=["']canonical["'][^>]*>/i,
          `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
        );
      } else {
        html = html.replace('</head>', `  <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />\n  </head>`);
      }
      if (/<meta[^>]*property=["']og:type["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property=["']og:type["'][^>]*>/i,
          `<meta property="og:type" content="${escapeAttr(meta.ogType || 'article')}" />`
        );
      }
      if (/<meta[^>]*property=["']og:title["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property=["']og:title["'][^>]*>/i,
          `<meta property="og:title" content="${escapeAttr(meta.title)}" />`
        );
      }
      if (/<meta[^>]*property=["']og:description["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property=["']og:description["'][^>]*>/i,
          `<meta property="og:description" content="${escapeAttr(meta.description)}" />`
        );
      }
      if (/<meta[^>]*property=["']og:url["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property=["']og:url["'][^>]*>/i,
          `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
        );
      }
      if (/<meta[^>]*property=["']og:image["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*property=["']og:image["'][^>]*>/i,
          `<meta property="og:image" content="${escapeAttr(meta.imageUrl)}" />`
        );
      }
      if (/<meta[^>]*name=["']twitter:card["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*name=["']twitter:card["'][^>]*>/i,
          `<meta name="twitter:card" content="summary_large_image" />`
        );
      }
      if (/<meta[^>]*name=["']twitter:title["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*name=["']twitter:title["'][^>]*>/i,
          `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`
        );
      }
      if (/<meta[^>]*name=["']twitter:description["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*name=["']twitter:description["'][^>]*>/i,
          `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`
        );
      }
      if (/<meta[^>]*name=["']twitter:image["'][^>]*>/i.test(html)) {
        html = html.replace(
          /<meta[^>]*name=["']twitter:image["'][^>]*>/i,
          `<meta name="twitter:image" content="${escapeAttr(meta.imageUrl)}" />`
        );
      }
    } else {
      const canonicalUrl = target === '/' 
        ? 'https://egurukulamforias.com/' 
        : `https://egurukulamforias.com${target}`;

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
