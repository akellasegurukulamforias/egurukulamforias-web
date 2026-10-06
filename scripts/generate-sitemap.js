// scripts/generate-sitemap.js
// Automated Static XML Sitemap Generator for e-Gurukulam for IAS
// Generates public/sitemap.xml from the static CMS dataset without any runtime fetches.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://egurukulamforias.com';
const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

// Core static routes with priorities and change frequencies
export const STATIC_ROUTES = [
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
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmyMatch) {
      const day = String(dmyMatch[1]).padStart(2, '0');
      const month = String(dmyMatch[2]).padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = String(ymdMatch[2]).padStart(2, '0');
      const day = String(ymdMatch[3]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
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

/**
 * Generates the static public/sitemap.xml file reusing local synced CMS data.
 * @param {Object} options
 * @param {Array} [options.currentAffairs] Optional array of active current affairs articles.
 * @param {Array} [options.resources] Optional array of active resources.
 * @param {string} [options.outputPath] Optional target path (defaults to public/sitemap.xml).
 */
export function generateSitemap(options = {}) {
  const {
    outputPath = OUTPUT_PATH
  } = options;

  let currentAffairs = options.currentAffairs;
  let resources = options.resources;

  // If not provided in memory, read from local synced files
  if (!Array.isArray(currentAffairs)) {
    const caPath = path.resolve(__dirname, '../public/data/ca-meta.json');
    if (fs.existsSync(caPath)) {
      try {
        currentAffairs = JSON.parse(fs.readFileSync(caPath, 'utf8'));
      } catch (e) {
        console.warn('[generate-sitemap] Failed to read ca-meta.json:', e.message);
        currentAffairs = [];
      }
    } else {
      currentAffairs = [];
    }
  }

  if (!Array.isArray(resources)) {
    const resPath = path.resolve(__dirname, '../public/data/resources-meta.json');
    if (fs.existsSync(resPath)) {
      try {
        resources = JSON.parse(fs.readFileSync(resPath, 'utf8'));
      } catch (e) {
        console.warn('[generate-sitemap] Failed to read resources-meta.json:', e.message);
        resources = [];
      }
    } else {
      resources = [];
    }
  }

  const todayYMD = getTodayYMD();
  const seenUrls = new Set();
  const urlEntries = [];

  let staticCount = 0;
  let articleCount = 0;
  let resourceCount = 0;

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
      staticCount++;
    }
  }

  // 2. Process Dynamic Current Affairs
  const activeAffairs = currentAffairs.filter(isItemActive);
  for (const art of activeAffairs) {
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
      articleCount++;
    }
  }

  // 3. Process Dynamic Resources & Syllabus
  const activeResources = resources.filter(isItemActive);
  for (const resItem of activeResources) {
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
      resourceCount++;
    }
  }

  // 4. Construct Compliant XML
  const xmlContent = [
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

  // Ensure output directory exists and write static sitemap file
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xmlContent, 'utf8');
  console.log(`[generate-sitemap] Generated static ${path.relative(path.resolve(__dirname, '..'), outputPath)} with ${urlEntries.length} total URLs (${staticCount} static + ${articleCount} current affairs + ${resourceCount} resources + ${urlEntries.length - staticCount - articleCount - resourceCount} index archives).`);

  return {
    totalUrls: urlEntries.length,
    staticCount,
    articleCount,
    resourceCount,
    outputPath
  };
}

// Auto-run when executed directly via CLI (e.g. `node scripts/generate-sitemap.js`)
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('generate-sitemap.js') || 
  process.argv[1].endsWith('generate-sitemap')
);

if (isDirectExecution) {
  try {
    generateSitemap();
  } catch (err) {
    console.error('[generate-sitemap] Critical error generating sitemap:', err);
    process.exit(1);
  }
}
