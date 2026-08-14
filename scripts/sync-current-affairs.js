/**
 * Master Two-Stage Background Pre-Scraper & Cache Engine
 * File: scripts/sync-current-affairs.js
 * 
 * 1. Crawls listing pages across all historical offsets (0 to 171+).
 * 2. Target Selectors:
 *    - Card Container: .post-item
 *    - Article Link & Title: .post-item-content h2 a
 *    - Excerpt: .post-item-content p
 *    - Date: .post-item-content small
 *    - Featured Image: .post-featured-image figure img / img with /uploads/blog/
 * 3. Filters out site logos, arrows, promotional course ads, pricing banners.
 * 4. Saves master JSON cache to public/data/current-affairs-master.json.
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.iasmentoring.com';
const MASTER_CACHE_PATH = path.join(process.cwd(), 'public', 'data', 'current-affairs-master.json');

// Exact list of ignored terms to filter out logos, arrows, site background graphics & promotional course ads
const IGNORED_TERMS = [
  'logo', 'header', 'brand', 'footer', 'arrow', 'video-bg', 'about-video',
  'enroll', 'offer', 'price', '499', '999', 'rs.', 'rs', 'rupee', 
  'course', 'ad-', 'banner-ad', 'sidebar', 'widget', 
  'promo', 'call', 'admission', 'limited-seats', 'discount',
  'popup', 'pop-up', 'iasmentoring-ad', 'register', 'whatsapp'
];

function isCleanNonAdImage(srcUrl) {
  if (!srcUrl || typeof srcUrl !== 'string') return false;
  const lowerSrc = srcUrl.toLowerCase();
  return !IGNORED_TERMS.some(term => lowerSrc.includes(term));
}

function formatAbsoluteUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();

  // Fix domain duplication if present
  while (url.startsWith('https://www.iasmentoring.com/https://www.iasmentoring.com/')) {
    url = url.replace('https://www.iasmentoring.com/https://www.iasmentoring.com/', 'https://www.iasmentoring.com/');
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  } else if (url.startsWith('//')) {
    return `https:${url}`;
  } else {
    const cleanPath = url.replace(/^\.?\//, '');
    return `${BASE_URL}/${cleanPath}`;
  }
}

// Helper to fetch HTML from target URL via node fetch or proxy fallback
async function fetchPageHtml(targetUrl) {
  const proxyUrls = [
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  ];

  for (const url of proxyUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 100) {
          return text;
        }
      }
    } catch (e) {
      // Try next proxy URL
    }
  }
  return null;
}

/**
 * Stage 2: Deep-Page Banner Parser for detail page HTML fallback
 */
function extractCleanBannerFromArticleHtml(detailHtml) {
  if (!detailHtml) return null;

  let foundSrc = null;

  // 1. OpenGraph metadata image tags
  const ogMatches = [
    ...detailHtml.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi),
    ...detailHtml.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi),
    ...detailHtml.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi),
    ...detailHtml.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/gi)
  ];

  for (const match of ogMatches) {
    const ogImg = match[1];
    if (ogImg && isCleanNonAdImage(ogImg)) {
      foundSrc = ogImg;
      break;
    }
  }

  // 2. Post content body images
  if (!foundSrc) {
    const bodyImgMatches = [
      ...detailHtml.matchAll(/<div[^>]*class=["'][^"']*(?:post-image|post-featured-image|featured-image|post-banner|entry-content|post-content|article-detail)[^"']*["'][^>]*>[\s\S]*?<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi),
      ...detailHtml.matchAll(/<figure[^>]*>[\s\S]*?<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi),
      ...detailHtml.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']*(?:\/uploads\/|\/images\/|\/assets\/)[^"']+)["']/gi),
      ...detailHtml.matchAll(/<article[^>]*>[\s\S]*?<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi),
      ...detailHtml.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)
    ];

    for (const match of bodyImgMatches) {
      const src = match[1];
      if (src && isCleanNonAdImage(src)) {
        foundSrc = src;
        break;
      }
    }
  }

  if (!foundSrc) return null;
  return formatAbsoluteUrl(foundSrc);
}

/**
 * Stage 1: Parse Listing Page HTML using exact iasmentoring.com card selectors:
 * .post-item -> .post-featured-image figure img, .post-item-content h2 a, .post-item-content p, .post-item-content small
 */
function parseArticlesFromListingHtml(html) {
  const articles = [];
  const postBlocks = html.split('<div class="post-item');

  for (let i = 1; i < postBlocks.length; i++) {
    const block = postBlocks[i];

    // 1. Extract Real Banner Image from .post-featured-image figure img / .post-featured-image img
    let rawImg = '';
    const imgMatch = block.match(/<div[^>]*class=["'][^"']*post-featured-image[^"']*["'][^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["']/i) ||
                     block.match(/<figure[^>]*>[\s\S]*?<img[^>]+(?:src|data-src)=["']([^"']+)["']/i) ||
                     block.match(/<img[^>]+(?:src|data-src)=["']([^"']*(?:\/uploads\/blog\/|\/uploads\/|\/images\/)[^"']+)["']/i) ||
                     block.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);

    if (imgMatch) {
      const candidate = imgMatch[1];
      if (isCleanNonAdImage(candidate)) {
        rawImg = candidate;
      }
    }

    let imageUrl = null;
    if (rawImg) {
      imageUrl = formatAbsoluteUrl(rawImg);
    }

    // 2. Extract Title & Article Link from .post-item-content h2 a
    let title = '';
    let link = '';
    const linkTitleMatch = block.match(/<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/s) ||
                           block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/s);
    if (linkTitleMatch) {
      link = linkTitleMatch[1];
      title = linkTitleMatch[2].replace(/<[^>]+>/g, '').trim();
      if (!link.startsWith('http')) {
        link = formatAbsoluteUrl(link);
      }
    }

    // 3. Extract Date from .post-item-content small
    let date = 'Recent Dispatch';
    const dateMatch = block.match(/<small[^>]*>(.*?)<\/small>/s);
    if (dateMatch) {
      date = dateMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // 4. Extract Excerpt from .post-item-content p
    let snippet = '';
    const snippetMatch = block.match(/<p[^>]*>(.*?)<\/p>/s);
    if (snippetMatch) {
      snippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // Category Determination
    let category = "POLITY & GOVERNANCE";
    const titleUpper = title.toUpperCase();
    if (titleUpper.includes('SUPREME COURT') || titleUpper.includes('JUDICIARY') || titleUpper.includes('POLITY') || titleUpper.includes('CONSTITUTION') || titleUpper.includes('DATA')) {
      category = "POLITY & GOVERNANCE";
    } else if (titleUpper.includes('YEN') || titleUpper.includes('ECONOMY') || titleUpper.includes('GI') || titleUpper.includes('FINANCE') || titleUpper.includes('TRADE') || titleUpper.includes('CREDIT') || titleUpper.includes('BANK')) {
      category = "ECONOMY & TRADE";
    } else if (titleUpper.includes('REACTORS') || titleUpper.includes('TECH') || titleUpper.includes('SMR') || titleUpper.includes('OIL') || titleUpper.includes('AI') || titleUpper.includes('HYDROGEN') || titleUpper.includes('OPIUM') || titleUpper.includes('FLOW')) {
      category = "SCIENCE & ENVIRONMENT";
    } else if (titleUpper.includes('REFORMS') || titleUpper.includes('SCHEME') || titleUpper.includes('TOURISM') || titleUpper.includes('POLICY')) {
      category = "PUBLIC POLICY";
    }

    if (titleUpper.includes('REACTORS') || titleUpper.includes('HYDROGEN') || titleUpper.includes('NUCLEAR') || titleUpper.includes('ENERGY')) {
      category = "NUCLEAR & ENERGY";
    } else if (titleUpper.includes('CONSTITUTION') || titleUpper.includes('ARTICLE') || titleUpper.includes('AMENDMENT') || titleUpper.includes('LAW')) {
      category = "CONSTITUTIONAL LAW";
    }

    const slug = link ? link.split('/').pop() : `ca-${i}`;

    if (title) {
      articles.push({
        id: slug,
        slug,
        title,
        date,
        snippet,
        category,
        link: link || `${BASE_URL}/current_affairs.html`,
        image: imageUrl,
        source: "iasmentoring.com"
      });
    }
  }

  // Parse Pagination Max Offset
  const offsets = [];
  const offsetMatches = html.matchAll(/href=["'][^"']*\/current_affairs\/index\/(\d+)["']/gi);
  for (const m of offsetMatches) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val)) offsets.push(val);
  }
  const maxOffset = offsets.length > 0 ? Math.max(...offsets) : 0;

  return { articles, maxOffset };
}

async function scrapeAllCurrentAffairs() {
  console.log('🔄 Executing Master Scraper Aligned with Exact iasmentoring.com Card Selectors...');
  const articlesMap = new Map();

  // STAGE 1: Crawl all listing pages (Page 1 + offsets 9, 18, ..., 171)
  const page1Html = await fetchPageHtml(`${BASE_URL}/current_affairs.html`);
  let maxOffset = 171;

  if (page1Html) {
    const parsed1 = parseArticlesFromListingHtml(page1Html);
    parsed1.articles.forEach(art => articlesMap.set(art.slug, art));
    if (parsed1.maxOffset > 0) maxOffset = parsed1.maxOffset;
    console.log(`[Stage 1] Page 1 crawled (${parsed1.articles.length} articles). Max offset: ${maxOffset}`);
  }

  const offsets = [];
  for (let o = 9; o <= maxOffset; o += 9) {
    offsets.push(o);
  }

  for (const offset of offsets) {
    const targetUrl = `${BASE_URL}/current_affairs/index/${offset}`;
    const pageHtml = await fetchPageHtml(targetUrl);
    if (pageHtml) {
      const parsed = parseArticlesFromListingHtml(pageHtml);
      parsed.articles.forEach(art => {
        if (!articlesMap.has(art.slug)) {
          articlesMap.set(art.slug, art);
        }
      });
    }
  }

  const allArticles = Array.from(articlesMap.values());
  console.log(`📌 Found ${allArticles.length} total articles across listing pages.`);

  // STAGE 2: Perform deep detail fetch ONLY for articles missing a featured banner
  console.log('🖼️ Deep scraping detail pages for articles missing featured banners...');
  let deepBannersExtracted = 0;

  const batchSize = 8;
  for (let i = 0; i < allArticles.length; i += batchSize) {
    const batch = allArticles.slice(i, i + batchSize);
    const promises = batch.map(art => {
      if (art.image && !art.image.includes('about-video')) {
        return Promise.resolve({ art, bannerUrl: art.image });
      }
      const detailUrl = art.link || `${BASE_URL}/current_affairs/details/${art.slug}`;
      return fetchPageHtml(detailUrl).then(detailHtml => ({
        art,
        bannerUrl: extractCleanBannerFromArticleHtml(detailHtml)
      })).catch(() => ({ art, bannerUrl: null }));
    });

    const results = await Promise.allSettled(promises);
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value && res.value.bannerUrl) {
        res.value.art.image = res.value.bannerUrl;
        deepBannersExtracted++;
      } else if (res.status === 'fulfilled' && res.value && !res.value.bannerUrl) {
        res.value.art.image = null;
      }
    });
  }

  // Ensure output directory exists
  const dir = path.dirname(MASTER_CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    totalArticles: allArticles.length,
    articles: allArticles
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  fs.writeFileSync(MASTER_CACHE_PATH, jsonStr, 'utf-8');

  const totalWithImages = allArticles.filter(a => a.image).length;
  console.log(`✅ MASTER CACHE BUILD COMPLETE! (${allArticles.length} total articles, ${totalWithImages} real featured banners, ${allArticles.length - totalWithImages} styled editorial topic fallbacks)`);
}

scrapeAllCurrentAffairs().catch(err => {
  console.error("Pipeline failed:", err);
});
