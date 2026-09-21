// api/sitemap.xml.js
// Vercel Serverless Function: Live Dynamic XML Sitemap for e-Gurukulam for IAS

const BASE_URL = 'https://egurukulamforias.com';
const CMS_API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyOt8dZ7S9ot1Zy3GyyXgsDTPsrF016odbaXhf9DXXPMllvQzmQvKabubXZFzRra51x/exec';

// Core static routes with priorities and change frequencies
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/current-affairs', priority: '0.9', changefreq: 'daily' },
  { path: '/programs', priority: '0.8', changefreq: 'weekly' },
  { path: '/test-series', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.8', changefreq: 'weekly' },
  { path: '/resources', priority: '0.8', changefreq: 'weekly' },
  { path: '/resources/upsc-syllabus', priority: '0.8', changefreq: 'daily' },
  { path: '/resources/pyqs', priority: '0.8', changefreq: 'daily' }
];


function getTodayYMD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatToYMD(dateVal) {
  if (!dateVal) return getTodayYMD();

  if (typeof dateVal === 'number' && !isNaN(dateVal)) {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }
  }

  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();

    // 1. Match DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmyMatch) {
      const day = String(dmyMatch[1]).padStart(2, '0');
      const month = String(dmyMatch[2]).padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // 2. Match YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = String(ymdMatch[2]).padStart(2, '0');
      const day = String(ymdMatch[3]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 3. Match textual dates (e.g. "13 Aug 2026")
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return getTodayYMD();
}

function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && String(obj.Status).toLowerCase() === 'inactive') return false;
  if (obj.status && String(obj.status).toLowerCase() === 'inactive') return false;
  return true;
}

export default async function handler(req, res) {
  try {
    const todayYMD = getTodayYMD();
    const seenUrls = new Set();
    const urlEntries = [];

    // 1. Process Core Static Routes
    for (const route of STATIC_ROUTES) {
      const fullUrl = `${BASE_URL}${route.path}`;
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        urlEntries.push({
          loc: fullUrl,
          lastmod: todayYMD,
          changefreq: route.changefreq,
          priority: route.priority
        });
      }
    }

    // 2. Fetch Live CMS Data with an AbortController timeout (25 seconds)
    let currentAffairs = [];
    let resources = [];
    let isLiveCms = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const cmsResponse = await fetch(CMS_API_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (cmsResponse.ok) {
        const data = await cmsResponse.json();
        const rawAffairs = Array.isArray(data.currentAffairs) ? data.currentAffairs : [];
        const rawResources = Array.isArray(data.resources) ? data.resources : [];

        currentAffairs = rawAffairs.filter(isItemActive);
        resources = rawResources.filter(isItemActive);
        isLiveCms = true;
      }
    } catch (fetchErr) {
      console.warn('[Sitemap Serverless] CMS fetch warning, serving core static routes only:', fetchErr.message);
    }

    // 3. Process Dynamic Current Affairs (Priority 0.9)
    for (const art of currentAffairs) {
      const title = art.Title || art.title || '';
      const rawSlug = art.slug || art.Slug || createSlug(title);
      if (!rawSlug) continue;

      const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
      const fullUrl = `${BASE_URL}/current-affairs/${slug}`;

      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        const rawDate = art.Date || art.date || art.Published_Date || art.published_date;
        const lastmod = formatToYMD(rawDate);

        urlEntries.push({
          loc: fullUrl,
          lastmod,
          changefreq: 'daily',
          priority: '0.9'
        });
      }
    }

    // 4. Process Dynamic Resources & Syllabus (Priority 0.8)
    for (const resItem of resources) {
      const title = resItem.Title || resItem.title || '';
      const rawSlug = resItem.slug || resItem.Slug || createSlug(title);
      if (!rawSlug) continue;

      const slug = encodeURIComponent(String(rawSlug).trim().toLowerCase());
      const isPYQ = 
        /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(title) || 
        /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(resItem.Category || resItem.category || '') || 
        /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(resItem.Subcategory || resItem.subcategory || '');

      const isSyllabus = 
        /syllabus/i.test(title) || 
        /syllabus/i.test(resItem.Category || resItem.category || '') || 
        /syllabus/i.test(resItem.Subcategory || resItem.subcategory || '');

      let fullUrl = '';
      if (isPYQ) {
        let year = '';
        if (resItem.Year || resItem.year) {
          const yr = String(resItem.Year || resItem.year).trim();
          if (/^\d{4}$/.test(yr)) year = yr;
        }
        if (!year) {
          const titleMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
          if (titleMatch) year = titleMatch[1];
        }
        if (!year) {
          const catMatch = String(resItem.Category || resItem.category || '').match(/\b(19\d{2}|20\d{2})\b/);
          if (catMatch) year = catMatch[1];
        }
        if (!year) {
          const content = String(resItem.Full_Content || resItem.full_content || resItem.Content || resItem.content || '').slice(0, 400);
          const contentMatch = content.match(/\b(19\d{2}|20\d{2})\b/);
          if (contentMatch) year = contentMatch[1];
        }
        if (!year) {
          const dateMatch = String(resItem.Date || resItem.date || '').match(/\b(19\d{2}|20\d{2})\b/);
          if (dateMatch) year = dateMatch[1];
        }

        const combined = `${title} ${resItem.Category || ''} ${resItem.Subcategory || ''} ${resItem.Tags || ''}`;
        let stage = 'mains';
        if (/prelims|preliminary/i.test(combined) || /csat/i.test(combined)) {
          stage = 'prelims';
        }

        if (year) {
          const yearUrl = `${BASE_URL}/resources/pyqs/${year}`;
          if (!seenUrls.has(yearUrl)) {
            seenUrls.add(yearUrl);
            urlEntries.push({
              loc: yearUrl,
              lastmod: todayYMD,
              changefreq: 'daily',
              priority: '0.8'
            });
          }

          const stageUrl = `${BASE_URL}/resources/pyqs/${year}/${stage}`;
          if (!seenUrls.has(stageUrl)) {
            seenUrls.add(stageUrl);
            urlEntries.push({
              loc: stageUrl,
              lastmod: todayYMD,
              changefreq: 'daily',
              priority: '0.8'
            });
          }

          if (stage === 'mains') {
            const gsUrl = `${BASE_URL}/resources/pyqs/${year}/mains/general-studies`;
            if (!seenUrls.has(gsUrl)) {
              seenUrls.add(gsUrl);
              urlEntries.push({
                loc: gsUrl,
                lastmod: todayYMD,
                changefreq: 'daily',
                priority: '0.8'
              });
            }
          }

          fullUrl = `${BASE_URL}/resources/pyqs/${year}/${stage}/${slug}`;
        } else {
          fullUrl = `${BASE_URL}/resources/pyqs/${stage}/${slug}`;
        }
      } else if (isSyllabus) {
        fullUrl = `${BASE_URL}/resources/upsc-syllabus/${slug}`;
      } else {
        fullUrl = `${BASE_URL}/resources/${slug}`;
      }

      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        const rawDate = resItem.Date || resItem.date || resItem.Published_Date || resItem.published_date;
        const lastmod = formatToYMD(rawDate);

        urlEntries.push({
          loc: fullUrl,
          lastmod,
          changefreq: 'daily',
          priority: '0.8'
        });
      }
    }

    // 5. Construct Compliant XML
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urlEntries.map(entry => [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(entry.priority)}</priority>`,
        '  </url>'
      ].join('\n')),
      '</urlset>',
      ''
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    if (isLiveCms) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Sitemap-Source', 'live-cms');
    } else {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      res.setHeader('X-Sitemap-Source', 'static-only-cms-unavailable');
    }
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[Sitemap Serverless] Critical error generating dynamic sitemap:', err);

    // Emergency Minimal XML Fallback so Googlebot never receives a 500 error
    const fallbackToday = getTodayYMD();
    const fallbackXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...STATIC_ROUTES.map(route => [
        '  <url>',
        `    <loc>${BASE_URL}${route.path}</loc>`,
        `    <lastmod>${fallbackToday}</lastmod>`,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>'
      ].join('\n')),
      '</urlset>',
      ''
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Sitemap-Source', 'emergency-fallback');
    return res.status(200).send(fallbackXml);
  }
}
