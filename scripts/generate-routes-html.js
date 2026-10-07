// scripts/generate-routes-html.js
// Automated Route-Specific Static HTML & Social Meta Generator for e-Gurukulam for IAS
// Generates pre-rendered HTML for all active Current Affairs, Resources, and static routes
// using the freshly synced build-time CMS data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://egurukulamforias.com';
const DEFAULT_IMAGE = 'https://egurukulamforias.com/images/Logo.png';
const DIST_DIR = path.resolve(__dirname, '../dist');
const DATA_DIR = path.resolve(__dirname, '../public/data');
const METADATA_OUT = path.resolve(__dirname, '../api/_route_metadata.json');

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

function cleanText(str) {
  return String(str || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSlug(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }
  }
  return trimmed;
}

function isItemActive(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.Active === false || obj.active === false || obj.Is_Active === false || obj.is_active === false) return false;
  if (obj.Status && String(obj.Status).toLowerCase() === 'inactive') return false;
  if (obj.status && String(obj.status).toLowerCase() === 'inactive') return false;
  return true;
}

/**
 * Replaces the metadata in index.html with the route-specific metadata.
 */
export function injectRouteMetadata(baseHtml, meta) {
  const {
    title,
    description,
    canonicalUrl,
    imageUrl,
    ogType = 'website'
  } = meta;

  let html = baseHtml;

  // 1. Replace <title>
  if (/<title>.*?<\/title>/is.test(html)) {
    html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`);
  }

  // 2. Replace meta description
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeAttr(description)}" />`
    );
  }

  // 3. Replace or inject canonical link
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link[^>]*rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
    );
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />\n  </head>`);
  }

  // 4. Replace og:type
  if (/<meta[^>]*property=["']og:type["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*property=["']og:type["'][^>]*>/i,
      `<meta property="og:type" content="${escapeAttr(ogType)}" />`
    );
  }

  // 5. Replace og:title
  if (/<meta[^>]*property=["']og:title["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*property=["']og:title["'][^>]*>/i,
      `<meta property="og:title" content="${escapeAttr(title)}" />`
    );
  }

  // 6. Replace og:description
  if (/<meta[^>]*property=["']og:description["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*property=["']og:description["'][^>]*>/i,
      `<meta property="og:description" content="${escapeAttr(description)}" />`
    );
  }

  // 7. Replace og:url
  if (/<meta[^>]*property=["']og:url["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*property=["']og:url["'][^>]*>/i,
      `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
    );
  }

  // 8. Replace og:image
  if (/<meta[^>]*property=["']og:image["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*property=["']og:image["'][^>]*>/i,
      `<meta property="og:image" content="${escapeAttr(imageUrl)}" />`
    );
  }

  // 9. Replace twitter:card
  if (/<meta[^>]*name=["']twitter:card["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*name=["']twitter:card["'][^>]*>/i,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  }

  // 10. Replace twitter:title
  if (/<meta[^>]*name=["']twitter:title["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*name=["']twitter:title["'][^>]*>/i,
      `<meta name="twitter:title" content="${escapeAttr(title)}" />`
    );
  }

  // 11. Replace twitter:description
  if (/<meta[^>]*name=["']twitter:description["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*name=["']twitter:description["'][^>]*>/i,
      `<meta name="twitter:description" content="${escapeAttr(description)}" />`
    );
  }

  // 12. Replace twitter:image
  if (/<meta[^>]*name=["']twitter:image["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta[^>]*name=["']twitter:image["'][^>]*>/i,
      `<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`
    );
  }

  return html;
}

const STATIC_PAGE_METAS = [
  {
    routePath: '/programs',
    title: "Programs | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Explore structured UPSC mentorship programs, tiered guidance models, and holistic civil services preparation roadmaps designed by Akella Raghavendra Sir.",
    canonicalUrl: `${BASE_URL}/programs`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/mentorship',
    title: "Mentorship | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Learn about Akella Raghavendra Sir's personalized UPSC mentorship philosophy, offering disciplined direction, strategic partnership, and individual guidance.",
    canonicalUrl: `${BASE_URL}/mentorship`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/current-affairs',
    title: "Current Affairs | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Access daily UPSC current affairs, in-depth editorial analysis, and syllabus-mapped dispatches curated for Civil Services Examination preparation.",
    canonicalUrl: `${BASE_URL}/current-affairs`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/resources',
    title: "Resources | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Explore authentic UPSC study resources, comprehensive civil services syllabus breakdowns, categorized previous year questions (PYQs), and prep notes.",
    canonicalUrl: `${BASE_URL}/resources`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/contact',
    title: "Contact | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Connect with Akella Raghavendra's e-Gurukulam for IAS. Book a personal mentorship appointment, enquire about admissions, or visit our Hyderabad center.",
    canonicalUrl: `${BASE_URL}/contact`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/about',
    title: "About Us | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Learn about Sri Akella Raghavendra, Founder and Chief Mentor of e-Gurukulam for IAS, and our dedicated pedagogical philosophy for UPSC Civil Services mentoring.",
    canonicalUrl: `${BASE_URL}/about`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/test-series',
    title: "Test Series & Sadhana | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Practice authentic UPSC Prelims and Mains test series, Ekadasa Sadhana mock examinations, and structured question papers with detailed answer reviews.",
    canonicalUrl: `${BASE_URL}/test-series`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/resources/upsc-syllabus',
    title: "UPSC CSE Syllabus Breakdown | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Detailed UPSC Civil Services Examination syllabus breakdown covering Prelims and Mains (General Studies I–IV, Essay, and Optionals) with topic analysis.",
    canonicalUrl: `${BASE_URL}/resources/upsc-syllabus`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/resources/pyqs',
    title: "UPSC Previous Year Questions (PYQs) | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Authentic archive of UPSC Civil Services Examination previous year question papers (PYQs) categorized by year, stage (Prelims/Mains), and subject.",
    canonicalUrl: `${BASE_URL}/resources/pyqs`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  },
  {
    routePath: '/apply',
    title: "Contact | Akella Raghavendra's e-Gurukulam for IAS",
    description: "Connect with Akella Raghavendra's e-Gurukulam for IAS. Book a personal mentorship appointment, enquire about admissions, or visit our Hyderabad center.",
    canonicalUrl: `${BASE_URL}/contact`,
    imageUrl: DEFAULT_IMAGE,
    ogType: 'website'
  }
];

export function generateRoutesHtml() {
  const masterHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(masterHtmlPath)) {
    throw new Error(`Master index.html not found at ${masterHtmlPath}. Run vite build first.`);
  }

  const masterHtml = fs.readFileSync(masterHtmlPath, 'utf8');

  // Load CMS metadata
  const caPath = path.join(DATA_DIR, 'ca-meta.json');
  const resPath = path.join(DATA_DIR, 'resources-meta.json');

  const currentAffairs = fs.existsSync(caPath) ? JSON.parse(fs.readFileSync(caPath, 'utf8')) : [];
  const resources = fs.existsSync(resPath) ? JSON.parse(fs.readFileSync(resPath, 'utf8')) : [];

  const routesToGenerate = [];
  const metadataMap = {};

  // 1. Process Static Pages
  for (const page of STATIC_PAGE_METAS) {
    routesToGenerate.push(page);
    metadataMap[page.routePath] = page;
  }

  // 2. Process Current Affairs
  const activeAffairs = currentAffairs.filter(isItemActive);
  for (const art of activeAffairs) {
    const title = cleanText(art.Title || art.title);
    const rawSlug = art.slug || art.Slug || createSlug(title);
    if (!rawSlug) continue;
    const slug = createSlug(rawSlug);
    const pageTitle = `${title} | Akella Raghavendra's e-Gurukulam for IAS`;

    let rawSummary = cleanText(art.Short_Summary || art.short_summary || art.Summary || art.summary || art.Description || art.description);
    if (!rawSummary) {
      const contentStr = String(art.Full_Content || art.full_content || art.Article_HTML || art.Content || '');
      const cleanBody = contentStr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      rawSummary = cleanBody ? `${cleanBody}...` : `${title} - Daily UPSC Current Affairs and editorial analysis by e-Gurukulam for IAS.`;
    }
    const description = rawSummary;

    const rawBanner = art.Banner_Image || art.banner_image || art.Banner || art.banner || art.Image || art.image;
    const directBanner = getDirectImageUrl(rawBanner);
    const imageUrl = directBanner 
      ? (directBanner.startsWith('http') ? directBanner : `${BASE_URL}${directBanner}`)
      : DEFAULT_IMAGE;

    const routePath = `/current-affairs/${slug}`;
    const canonicalUrl = `${BASE_URL}/current-affairs/${slug}`;

    const metaObj = {
      routePath,
      canonicalUrl,
      title: pageTitle,
      description,
      imageUrl,
      ogType: 'article'
    };

    routesToGenerate.push(metaObj);
    metadataMap[routePath] = metaObj;
  }

  // 3. Process Resources
  const activeResources = resources.filter(isItemActive);
  for (const resItem of activeResources) {
    const title = cleanText(resItem.Title || resItem.title);
    const rawSlug = resItem.slug || resItem.Slug || createSlug(title);
    if (!rawSlug) continue;
    const slug = createSlug(rawSlug);

    const isPYQ = 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(title) || 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(resItem.Category || resItem.category || '') || 
      /previous\s*year\s*questions?|pyqs?|past\s*years?\s*papers?|question\s*paper/i.test(resItem.Subcategory || resItem.subcategory || '');

    const isSyllabus = 
      /syllabus/i.test(title) || 
      /syllabus/i.test(resItem.Category || resItem.category || '') || 
      /syllabus/i.test(resItem.Subcategory || resItem.subcategory || '');

    let pageTitle = '';
    let canonicalPath = '';
    let defaultDesc = '';

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
        const dateMatch = String(resItem.Date || resItem.date || '').match(/\b(19\d{2}|20\d{2})\b/);
        if (dateMatch) year = dateMatch[1];
      }

      const combined = `${title} ${resItem.Category || ''} ${resItem.Subcategory || ''} ${resItem.Tags || ''}`;
      let stage = 'mains';
      if (/prelims|preliminary/i.test(combined) || /csat/i.test(combined)) {
        stage = 'prelims';
      }

      let paperName = title
        .replace(/previous\s*year\s*question\s*papers?/gi, '')
        .replace(/upsc\s*cse|upsc|civil\s*services/gi, '')
        .replace(/\b(19\d{2}|20\d{2})\b/g, '')
        .replace(/^[()\s–-]+|[()\s–-]+$/g, '')
        .trim();
      if (!paperName) paperName = 'Question Paper';

      const stageLabel = stage === 'prelims' ? 'Prelims' : 'Mains';
      const yearLabel = year || 'UPSC';
      pageTitle = `${paperName} (${yearLabel}) - UPSC ${stageLabel} PYQs | Akella Raghavendra's e-Gurukulam for IAS`;
      
      canonicalPath = year 
        ? `/resources/pyqs/${year}/${stage}/${slug}`
        : `/resources/pyqs/${stage}/${slug}`;

      defaultDesc = `Authentic UPSC Civil Services Examination ${paperName} (${yearLabel}) question paper with structured model answers, evaluation rubrics, and answer keys.`;
    } else if (isSyllabus) {
      pageTitle = `${title} - UPSC Civil Services Syllabus | Akella Raghavendra's e-Gurukulam for IAS`;
      canonicalPath = `/resources/upsc-syllabus/${slug}`;
      defaultDesc = `Detailed UPSC Civil Services Examination syllabus breakdown and comprehensive topic analysis for ${title}.`;
    } else {
      pageTitle = `${title} | Akella Raghavendra's e-Gurukulam for IAS`;
      canonicalPath = `/resources/${slug}`;
      defaultDesc = `${title} - In-depth study resource and analytical notes by e-Gurukulam for IAS.`;
    }

    let rawSummary = cleanText(resItem.Short_Summary || resItem.short_summary || resItem.Summary || resItem.summary || resItem.Description || resItem.description);
    if (!rawSummary) {
      rawSummary = defaultDesc;
    }
    const description = rawSummary;

    const rawBanner = resItem.Banner_Image || resItem.banner_image || resItem.Banner || resItem.banner || resItem.Image || resItem.image;
    const directBanner = getDirectImageUrl(rawBanner);
    const imageUrl = directBanner 
      ? (directBanner.startsWith('http') ? directBanner : `${BASE_URL}${directBanner}`)
      : DEFAULT_IMAGE;

    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    const metaObj = {
      routePath: canonicalPath,
      canonicalUrl,
      title: pageTitle,
      description,
      imageUrl,
      ogType: 'article',
      aliases: isPYQ ? [
        `/resources/pyqs/${slug}`,
        `/resources/${slug}`
      ] : []
    };

    routesToGenerate.push(metaObj);
    metadataMap[canonicalPath] = metaObj;
    if (metaObj.aliases) {
      for (const alias of metaObj.aliases) {
        metadataMap[alias] = metaObj;
      }
    }
  }

  // 4. Generate Physical HTML files in dist/
  let fileCount = 0;
  for (const r of routesToGenerate) {
    const routeHtml = injectRouteMetadata(masterHtml, r);

    // Primary route
    const pathsToWrite = [r.routePath, ...(r.aliases || [])];
    for (const p of pathsToWrite) {
      const cleanP = p.replace(/^\/+/, '');
      const dirPath = path.join(DIST_DIR, cleanP);
      const indexPath = path.join(dirPath, 'index.html');
      const flatHtmlPath = path.join(DIST_DIR, `${cleanP}.html`);

      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(indexPath, routeHtml, 'utf8');
      fs.writeFileSync(flatHtmlPath, routeHtml, 'utf8');
      fileCount += 2;
    }
  }

  // Write metadata lookup for edge template fallback
  fs.mkdirSync(path.dirname(METADATA_OUT), { recursive: true });
  fs.writeFileSync(METADATA_OUT, JSON.stringify(metadataMap, null, 2), 'utf8');

  console.log(`[generate-routes-html] Generated static route HTML for ${routesToGenerate.length} routes (${fileCount} files written).`);
  console.log(`[generate-routes-html] Current Affairs routes: ${activeAffairs.length}`);
  console.log(`[generate-routes-html] Resources routes: ${activeResources.length}`);
  console.log(`[generate-routes-html] Static routes: ${STATIC_PAGE_METAS.length}`);

  return {
    totalRoutes: routesToGenerate.length,
    caCount: activeAffairs.length,
    resCount: activeResources.length,
    staticCount: STATIC_PAGE_METAS.length,
    fileCount
  };
}

// Auto-run if executed directly via CLI
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('generate-routes-html.js') || 
  process.argv[1].endsWith('generate-routes-html')
);

if (isDirectExecution) {
  try {
    generateRoutesHtml();
  } catch (err) {
    console.error('[generate-routes-html] Critical error generating route HTML:', err);
    process.exit(1);
  }
}
