/**
 * Master Current Affairs Service for e-Gurukulam
 * Runtime delivery of public/data/current-affairs-master.json & full in-house article detail HTML extraction
 */

const BASE_URL = 'https://www.iasmentoring.com';
const MASTER_CACHE_URL = '/data/current-affairs-master.json';
const memoryDetailCache = new Map();
let memoryArticleDataset = null;

/**
 * 0ms Instant Delivery for Master Catalog via runtime fetch
 */
export async function fetchCompleteArchive() {
  if (memoryArticleDataset && memoryArticleDataset.length > 0) {
    return { articles: memoryArticleDataset, fromCache: true };
  }

  try {
    const response = await fetch(MASTER_CACHE_URL);
    if (response.ok) {
      const json = await response.json();
      const articles = json.articles || json;
      if (Array.isArray(articles) && articles.length > 0) {
        memoryArticleDataset = articles;
        return { articles, fromCache: true };
      }
    }
  } catch (e) {
    console.warn("Runtime master JSON fetch failed:", e);
  }

  return { articles: [], fromCache: false };
}

/**
 * Mouse Hover Background Prefetcher for Articles
 */
export function prefetchArticleDetail(articleOrLinkOrSlug) {
  if (!articleOrLinkOrSlug) return;
  const targetUrl = typeof articleOrLinkOrSlug === 'string' ? articleOrLinkOrSlug : (articleOrLinkOrSlug.link || articleOrLinkOrSlug.slug);
  const slug = targetUrl ? targetUrl.split('/').pop() : 'article';
  if (memoryDetailCache.has(slug)) return;

  setTimeout(() => {
    fetchFullArticleDetail(articleOrLinkOrSlug, false).catch(err => {
      console.warn("Prefetch silent error:", err);
    });
  }, 50);
}

/**
 * Helper to fetch HTML content via public CORS proxies
 */
async function fetchHtmlWithProxies(targetUrl) {
  const proxyUrls = [
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  ];

  for (const proxyUrl of proxyUrls) {
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
      });
      if (response.ok) {
        const html = await response.text();
        if (html && html.trim().length > 100) {
          return html;
        }
      }
    } catch (err) {
      console.warn(`Proxy fetch failed for ${proxyUrl}:`, err);
    }
  }

  return null;
}

/**
 * Full Article Detail Reader with Guaranteed Fail-Safe Payload
 */
export async function fetchFullArticleDetail(articleOrLinkOrSlug, forceRefresh = false) {
  let targetUrl = '';
  let articleObj = null;

  if (typeof articleOrLinkOrSlug === 'object' && articleOrLinkOrSlug !== null) {
    articleObj = articleOrLinkOrSlug;
    targetUrl = articleObj.link || `${BASE_URL}/current_affairs/details/${articleObj.slug}`;
  } else if (typeof articleOrLinkOrSlug === 'string') {
    targetUrl = articleOrLinkOrSlug.startsWith('http') 
      ? articleOrLinkOrSlug 
      : `${BASE_URL}/current_affairs/details/${articleOrLinkOrSlug}`;
  }

  const slug = targetUrl.split('/').pop() || 'article';
  const cacheKey = `gurukulam_article_detail_${slug}`;

  if (memoryDetailCache.has(slug) && !forceRefresh) {
    return { ...memoryDetailCache.get(slug), fromCache: true };
  }

  try {
    const localData = localStorage.getItem(cacheKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed.data && parsed.data.contentHtml) {
        memoryDetailCache.set(slug, parsed.data);
        return { ...parsed.data, fromCache: true };
      }
    }
  } catch (e) {
    console.warn("Detail cache check failed:", e);
  }

  if (!articleObj && memoryArticleDataset) {
    articleObj = memoryArticleDataset.find(a => a.slug === slug || a.link === targetUrl);
  }

  const html = await fetchHtmlWithProxies(targetUrl);

  if (html) {
    const detailData = parseAndExtractDetailHtml(html, slug, targetUrl, articleObj);
    if (detailData) {
      memoryDetailCache.set(slug, detailData);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: detailData
        }));
      } catch (e) {}
      return { ...detailData, fromCache: false };
    }
  }

  const failSafePayload = {
    slug,
    title: articleObj ? articleObj.title : (slug.replace(/-/g, ' ').toUpperCase()),
    date: articleObj ? articleObj.date : 'Recent Dispatch',
    lead: articleObj ? articleObj.snippet : '',
    featuredImage: articleObj ? articleObj.image : '',
    contentHtml: articleObj ? `
      <div class="space-y-4">
        <p class="text-base text-[#2A1E18] font-sans leading-relaxed">${articleObj.snippet}</p>
      </div>
    ` : '',
    originalUrl: targetUrl,
    source: "iasmentoring.com",
    isFallback: true
  };

  memoryDetailCache.set(slug, failSafePayload);
  return failSafePayload;
}

function parseAndExtractDetailHtml(html, slug, targetUrl, baselineArticleObj) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const h1El = doc.querySelector('.page-header-content h1') || doc.querySelector('.post-content h1') || doc.querySelector('h1');
    const title = h1El ? h1El.textContent.trim() : (baselineArticleObj ? baselineArticleObj.title : 'Current Affairs Article');

    const dateEl = doc.querySelector('.post-meta span') || doc.querySelector('small.text-muted') || doc.querySelector('.date');
    const date = dateEl ? dateEl.textContent.trim() : (baselineArticleObj ? baselineArticleObj.date : 'Recent Dispatch');

    const leadEl = doc.querySelector('p.lead') || doc.querySelector('.excerpt');
    const lead = leadEl ? leadEl.textContent.trim() : (baselineArticleObj ? baselineArticleObj.snippet : '');

    const featuredImgEl = doc.querySelector('.post-image figure img') || doc.querySelector('.post-featured-image img') || doc.querySelector('.entry-content img');
    let featuredImage = featuredImgEl ? featuredImgEl.getAttribute('src') : (baselineArticleObj ? baselineArticleObj.image : '');
    if (featuredImage && !featuredImage.startsWith('http') && !featuredImage.toLowerCase().includes('logo')) {
      featuredImage = `${BASE_URL}${featuredImage.startsWith('/') ? '' : '/'}${featuredImage}`;
    } else if (featuredImage && featuredImage.toLowerCase().includes('logo')) {
      featuredImage = '';
    }

    const selectors = [
      '.current-affairs-content',
      '.post-content',
      '.entry-content',
      '#content',
      '.article-detail',
      '.post-entry',
      '.page-content',
      'main'
    ];

    let contentEl = null;
    for (const selector of selectors) {
      const el = doc.querySelector(selector);
      if (el && el.textContent.trim().length > 30) {
        contentEl = el;
        break;
      }
    }

    if (contentEl) {
      const images = contentEl.querySelectorAll('img');
      images.forEach(img => {
        let src = img.getAttribute('src');
        if (src && !src.startsWith('http')) {
          src = `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
          img.setAttribute('src', src);
        }
        img.removeAttribute('style');
        img.classList.add('rounded-xl', 'border', 'border-[#D5C3B0]', 'my-4', 'max-w-full', 'h-auto', 'shadow-md');
      });

      const scripts = contentEl.querySelectorAll('script, style, iframe, header, footer, .sidebar, .ad-banner');
      scripts.forEach(s => s.remove());

      const cleanedContentHtml = contentEl.innerHTML;

      return {
        slug,
        title,
        date,
        lead,
        featuredImage,
        contentHtml: cleanedContentHtml,
        originalUrl: targetUrl,
        source: "iasmentoring.com"
      };
    }
  } catch (err) {
    console.error("Error parsing detail HTML:", err);
  }
  return null;
}

export async function fetchAllCurrentAffairs(forceRefresh = false) {
  return fetchCompleteArchive();
}

export async function fetchCurrentAffairs(offset = 0, forceRefresh = false) {
  return fetchCompleteArchive();
}
