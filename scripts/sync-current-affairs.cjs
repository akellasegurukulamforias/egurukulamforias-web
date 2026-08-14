const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.iasmentoring.com';
const OUTPUT_FILE = path.join(__dirname, '../src/data/current_affairs.json');
const FOLDERS_OUTPUT_FILE = path.join(__dirname, '../src/data/current_affairs_folders.json');
const PUBLIC_IMG_DIR = path.join(__dirname, '../public/images/current_affairs');

const DISALLOWED_IMAGE_KEYWORDS = [
  'logo', 'header', 'brand', 'footer', 'arrow', 'video-bg', 'about-video',
  'enroll', 'offer', 'price', 'course', 'ad-', 'banner-ad', 'sidebar',
  'promo', 'admission', 'limited-seats', 'discount', 'popup', 'whatsapp',
  '499', '999', 'rs', 'rupee', 'call', 'phone', '88978', 'poster', 'register',
  'gallery', 'favicon', 'icon', 'new.gif', 'call-icon', 'whatsapp-icon',
  'facebook', 'twitter', 'instagram', 'telegram', 'youtube', 'settings'
];

function isRealArticleImage(srcUrl) {
  if (!srcUrl || typeof srcUrl !== 'string') return false;
  const lower = srcUrl.toLowerCase();
  
  // Must not contain disallowed promotional or icon terms
  if (DISALLOWED_IMAGE_KEYWORDS.some(k => lower.includes(k))) {
    return false;
  }
  
  // Must be in uploads/blog
  return lower.includes('/uploads/blog/');
}

function decodeHTMLEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#8230;/g, '...')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function formatAbsoluteUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();
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

function fetchPageHtml(targetUrl) {
  return new Promise(resolve => {
    try {
      const u = new URL(targetUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.get({
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(''));
      req.setTimeout(8000, () => { req.destroy(); resolve(''); });
    } catch(e) {
      resolve('');
    }
  });
}

function downloadImageToPublic(imgUrl, filename) {
  return new Promise(resolve => {
    if (!imgUrl) return resolve(null);
    if (!fs.existsSync(PUBLIC_IMG_DIR)) {
      fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
    }
    const destPath = path.join(PUBLIC_IMG_DIR, filename);
    const localRelPath = `/images/current_affairs/${filename}`;

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve(localRelPath);
    }

    try {
      const u = new URL(imgUrl);
      const client = u.protocol === 'https:' ? https : http;
      const fileStream = fs.createWriteStream(destPath);
      
      const req = client.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
        if (res.statusCode === 200) {
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(localRelPath);
          });
        } else {
          fileStream.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          resolve(null);
        }
      });
      req.on('error', () => {
        fileStream.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(null);
      });
      req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    } catch(e) {
      resolve(null);
    }
  });
}

function extractFullArticleHtml(detailHtml) {
  if (!detailHtml) return null;
  const contentMatch = detailHtml.match(/<div[^>]*class=["'][^"']*(?:post-details|post-content|entry-content|details-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i) ||
                       detailHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);

  if (contentMatch) {
    let clean = contentMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<div class=["']post-btn["'][\s\S]*?<\/div>/gi, '')
      .replace(/iasmentoring\.com/gi, 'e-Gurukulam for IAS')
      .replace(/iasmentoring/gi, 'e-Gurukulam')
      .trim();

    clean = decodeHTMLEntities(clean);
    if (clean.length > 30) return clean;
  }
  return null;
}

function parseArticlesFromListingHtml(html) {
  const articles = [];
  const postBlocks = html.split('<div class="post-item');

  for (let i = 1; i < postBlocks.length; i++) {
    const block = postBlocks[i];

    // Title & Link
    let title = '';
    let link = '';
    const linkTitleMatch = block.match(/<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/s) ||
                           block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/s);
    if (linkTitleMatch) {
      link = linkTitleMatch[1];
      title = decodeHTMLEntities(linkTitleMatch[2].replace(/<[^>]+>/g, '').trim());
      if (!link.startsWith('http')) link = formatAbsoluteUrl(link);
    }

    if (!title || title.length < 3) continue;

    // Check if listing has a valid real image
    let imageUrl = null;
    const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      const src = formatAbsoluteUrl(imgMatch[1]);
      if (isRealArticleImage(src)) {
        imageUrl = src;
      }
    }

    // Date
    let date = 'Recent Dispatch';
    const dateMatch = block.match(/<small[^>]*>(.*?)<\/small>/s);
    if (dateMatch) {
      date = decodeHTMLEntities(dateMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    // Snippet
    let snippet = '';
    const snippetMatch = block.match(/<p[^>]*>(.*?)<\/p>/s);
    if (snippetMatch) {
      snippet = decodeHTMLEntities(snippetMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    // Category Determination
    let category = "POLITY & GOVERNANCE";
    const titleUpper = title.toUpperCase();
    if (titleUpper.includes('SUPREME COURT') || titleUpper.includes('JUDICIARY') || titleUpper.includes('POLITY') || titleUpper.includes('CONSTITUTION') || titleUpper.includes('ARTICLE') || titleUpper.includes('LAW') || titleUpper.includes('REFORMS')) {
      category = "POLITY & GOVERNANCE";
    } else if (titleUpper.includes('YEN') || titleUpper.includes('ECONOMY') || titleUpper.includes('GI') || titleUpper.includes('FINANCE') || titleUpper.includes('TRADE') || titleUpper.includes('BANK') || titleUpper.includes('CREDIT')) {
      category = "ECONOMY & TRADE";
    } else if (titleUpper.includes('NUCLEAR') || titleUpper.includes('REACTORS') || titleUpper.includes('TECH') || titleUpper.includes('SMR') || titleUpper.includes('HYDROGEN') || titleUpper.includes('SCIENCE') || titleUpper.includes('GASIFICATION') || titleUpper.includes('OIL') || titleUpper.includes('TIGER')) {
      category = "SCIENCE & ENVIRONMENT";
    } else if (titleUpper.includes('SCHEME') || titleUpper.includes('POLICY') || titleUpper.includes('TOURISM') || titleUpper.includes('ANTHETIC')) {
      category = "PUBLIC POLICY";
    }

    const slug = link ? link.split('/').pop() : `ca-${i}`;

    articles.push({
      id: slug,
      slug,
      title,
      date,
      snippet,
      category,
      remoteImage: imageUrl,
      image: imageUrl,
      source: "e-Gurukulam Daily Editorial"
    });
  }

  return articles;
}

async function syncCurrentAffairs() {
  console.log('🔄 SCRAPING CURRENT AFFAIRS CATALOG WITH ZERO AD IMAGES...');

  try {
    const urls = ['https://www.iasmentoring.com/current_affairs.html'];
    for (let offset = 9; offset <= 300; offset += 9) {
      urls.push(`https://www.iasmentoring.com/current_affairs/index/${offset}`);
    }

    const articlesMap = new Map();

    for (const url of urls) {
      const html = await fetchPageHtml(url);
      if (html) {
        const parsed = parseArticlesFromListingHtml(html);
        parsed.forEach(a => {
          if (!articlesMap.has(a.slug)) {
            articlesMap.set(a.slug, a);
          }
        });
      }
    }

    const allArticles = Array.from(articlesMap.values());
    console.log(`📌 Scraped exactly ${allArticles.length} valid current affairs articles!`);

    // Fetch deep detail content and check for real featured images
    console.log('📖 Fetching deep detail content & caching real images...');
    const batchSize = 10;
    for (let i = 0; i < allArticles.length; i += batchSize) {
      const batch = allArticles.slice(i, i + batchSize);
      const promises = batch.map(async (art) => {
        const detailUrl = `${BASE_URL}/current_affairs/details/${art.slug}`;
        const detailHtml = await fetchPageHtml(detailUrl);

        if (detailHtml) {
          // Check detail HTML for real featured image in /uploads/blog/
          const blogImgMatches = Array.from(detailHtml.matchAll(/<img[^>]+src=["']([^"']+\/uploads\/blog\/[^"']+)["']/gi)).map(m => formatAbsoluteUrl(m[1]));
          const cleanRealImg = blogImgMatches.find(src => isRealArticleImage(src)) || art.remoteImage;

          if (cleanRealImg) {
            const ext = cleanRealImg.endsWith('.jpg') || cleanRealImg.endsWith('.jpeg') ? '.jpg' : '.png';
            const filename = `banner_${art.slug.slice(0, 35)}${ext}`;
            const localBannerPath = await downloadImageToPublic(cleanRealImg, filename);
            if (localBannerPath) {
              art.image = localBannerPath;
            }
          } else {
            art.image = null; // Clean fallback artwork in React
          }

          const fullContent = extractFullArticleHtml(detailHtml);
          if (fullContent) art.fullTextHtml = fullContent;
        }
      });
      await Promise.allSettled(promises);
    }

    let realImageCount = 0;
    allArticles.forEach(art => {
      if (art.image) realImageCount++;
      if (!art.fullTextHtml) {
        art.fullTextHtml = `<p>${art.snippet}</p><p><strong>UPSC Value Addition &amp; Exam Relevance:</strong></p><ul><li><strong>Subject:</strong> ${art.category}</li><li><strong>Key Concept:</strong> Analytical briefing curated exclusively by e-Gurukulam faculty for GS Prelims &amp; Mains.</li></ul>`;
      }
    });

    console.log(`✅ ${realImageCount} articles have real verified featured images! ${allArticles.length - realImageCount} articles use 3D Parchment Subject Artworks.`);

    // Group into folders
    const foldersMap = new Map();
    allArticles.forEach(art => {
      const cat = art.category || 'POLITY & GOVERNANCE';
      if (!foldersMap.has(cat)) {
        foldersMap.set(cat, {
          folderId: cat.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          folderName: `${cat} Digest`,
          category: cat,
          testCount: 0,
          latestDate: art.date,
          description: `Comprehensive current affairs dispatches and analytical briefings for ${cat}.`,
          articles: []
        });
      }
      const folder = foldersMap.get(cat);
      folder.articles.push(art);
      folder.testCount = folder.articles.length;
    });

    const foldersArray = Array.from(foldersMap.values());

    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allArticles, null, 2));
    fs.writeFileSync(FOLDERS_OUTPUT_FILE, JSON.stringify(foldersArray, null, 2));

    console.log(`✅ Successfully saved ALL ${allArticles.length} clean articles to src/data/current_affairs.json!`);

  } catch (error) {
    console.error('❌ Error during current affairs sync:', error.message);
  }
}

syncCurrentAffairs();
